"""Optional integration smoke: run with repo .venv Python; no system installs."""
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
import zipfile

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]

def run(*args):
    result = subprocess.run([sys.executable, *map(str, args)], cwd=ROOT,
                            capture_output=True, text=True, encoding='utf-8', timeout=40,
                            env={**os.environ, 'PYTHONIOENCODING': 'utf-8', 'PYTHONDONTWRITEBYTECODE': '1'})
    assert result.returncode == 0, result.stdout + result.stderr
    return result.stdout

def load(name, file):
    spec = importlib.util.spec_from_file_location(name, ROOT / file)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

class Smoke(unittest.TestCase):
    def test_word_pdf_image(self):
        from docx import Document
        from pypdf import PdfReader
        from reportlab.pdfgen.canvas import Canvas
        from PIL import Image
        with tempfile.TemporaryDirectory(prefix='aget smoke ') as temp:
            folder = Path(temp) / '\u4e2d\u6587 path'
            folder.mkdir()
            original = folder / 'source.docx'
            document = Document(); document.add_paragraph('Hello \u4e2d\u6587'); document.save(original)
            parts = folder / 'parts'
            run('skills/docx/scripts/office/unpack.py', original, parts)
            output = folder / 'roundtrip.docx'
            run('skills/docx/scripts/office/pack.py', parts, output)
            self.assertEqual(Document(output).paragraphs[0].text, 'Hello \u4e2d\u6587')
            pdf = folder / 'form.pdf'
            canvas = Canvas(str(pdf)); canvas.acroForm.textfield(name='name', x=50, y=700, width=120, height=20)
            canvas.showPage(); canvas.save()
            info = folder / 'info.json'
            run('skills/pdf/scripts/extract_form_field_info.py', pdf, info)
            fields = json.loads(info.read_text()); self.assertEqual(fields[0]['field_id'], 'name')
            fields[0]['value'] = 'Ada \u4e2d\u6587'; info.write_text(json.dumps(fields,ensure_ascii=False), encoding='utf-8-sig')
            filled = folder / 'filled.pdf'
            run('skills/pdf/scripts/fill_fillable_fields.py', pdf, info, filled)
            self.assertEqual(PdfReader(filled).get_fields()['name']['/V'], 'Ada \u4e2d\u6587')
            image = folder / 'source.png'; Image.new('RGB', (100,100), 'white').save(image)
            boxes = folder / 'boxes.json'; boxes.write_text(json.dumps({'form_fields':[{'page_number':1,'entry_bounding_box':[10,10,30,30],'label_bounding_box':[50,50,70,70]}]}))
            marked = folder / 'marked.png'
            run('skills/pdf/scripts/create_validation_image.py', 1, boxes, image, marked)
            with Image.open(marked) as img:
                self.assertEqual(img.getpixel((10,10)), (255,0,0))
                self.assertEqual(img.getpixel((50,50)), (0,0,255))

    def test_diagnostics_with_unicode_interpreter_path(self):
        import venv
        with tempfile.TemporaryDirectory(prefix='aget diagnostic ') as temp:
            isolated = Path(temp) / '\u4e2d\u6587 python'
            venv.EnvBuilder(with_pip=False).create(isolated)
            executable = isolated / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
            result = subprocess.run(['node', 'scripts/check-python.mjs', '--skill', 'all', '--python', str(executable)],
                                    cwd=ROOT, capture_output=True, text=True, encoding='utf-8', timeout=90)
            self.assertEqual(result.returncode, 1, result.stderr)
            self.assertIn('MISSING', result.stdout, result.stderr)
            self.assertIn('openpyxl: MISSING', result.stdout)
            self.assertNotIn('Traceback', result.stderr)
            self.assertTrue(executable.exists())

    def test_platform_and_recalc_failures(self):
        for skill in ['docx','xlsx']:
            office = load('office_test', f'skills/{skill}/scripts/office/soffice.py')
            with patch.object(office.sys, 'platform', 'win32'), patch.object(office.shutil, 'which', return_value=None), patch.object(office.Path, 'is_file', return_value=True):
                self.assertTrue(office.find_soffice().endswith('soffice.exe'))
            for system in ['win32','darwin']:
                with patch.object(office.sys, 'platform', system), patch.object(office.socket, 'socket', side_effect=AssertionError('must not probe')):
                    self.assertFalse(office._needs_shim())
                    with patch.dict(os.environ, {}, clear=True):
                        self.assertNotIn('LD_PRELOAD',office.get_soffice_env())
            with patch.object(office.sys, 'platform', 'linux'), patch.object(office.socket, 'AF_UNIX', 1, create=True), patch.object(office.socket, 'socket', side_effect=OSError()):
                self.assertTrue(office._needs_shim())
        sys.path.insert(0,str(ROOT/'skills/xlsx/scripts'))
        recalc = load('recalc_test','skills/xlsx/scripts/recalc.py')
        from openpyxl import Workbook
        real_get_soffice_env = recalc.get_soffice_env
        with tempfile.TemporaryDirectory(prefix='aget recalc ') as temp, patch.object(recalc, 'get_soffice_env', return_value={}):
            file = Path(temp)/'sample.xlsx'; wb = Workbook(); wb.active['A1']='=1+2'; wb.save(file)
            with patch.object(recalc,'find_soffice',return_value='fake'), patch.object(recalc.subprocess,'run', side_effect=subprocess.TimeoutExpired('fake',1)) as mocked:
                self.assertIn('timed out',recalc.recalc(file,1)['error'])
                self.assertEqual(mocked.call_args.kwargs['timeout'],1)
                profile_arg=mocked.call_args.args[0][1]; self.assertTrue(profile_arg.startswith('-env:UserInstallation=file:'))
            with patch.object(recalc,'find_soffice',side_effect=FileNotFoundError('LibreOffice missing')):
                self.assertIn('LibreOffice missing',recalc.recalc(file)['error'])
            with patch.object(recalc,'find_soffice',return_value='fake'), patch.object(recalc.subprocess,'run',return_value=subprocess.CompletedProcess([],9,'','failed')):
                self.assertEqual(recalc.recalc(file)['error'],'failed')
            self.assertEqual(recalc.recalc(file,0), {'error':'timeout must be positive'})
            # Real execution only when LibreOffice is present; assert actual cached value.
            try: recalc.find_soffice()
            except FileNotFoundError:
                print('UNVERIFIED: real Excel recalculation (LibreOffice missing)')
            else:
                with patch.object(recalc, 'get_soffice_env', side_effect=real_get_soffice_env):
                    result=recalc.recalc(file)
                self.assertEqual(result.get('status'),'success',result)
                from openpyxl import load_workbook
                wb=load_workbook(file,data_only=True); self.assertEqual(wb.active['A1'].value,3); wb.close()

if __name__ == '__main__':
    unittest.main()
