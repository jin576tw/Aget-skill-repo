import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
let skill = 'all', explicit = process.env.AGET_PYTHON, syntax = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--skill') skill = args[++i];
  else if (args[i] === '--python') { explicit = args[++i]; if (!explicit || explicit.startsWith('--')) { console.error('--python requires an executable'); process.exit(2); } }
  else if (args[i] === '--syntax') syntax = true;
  else { console.error('Usage: node scripts/check-python.mjs [--skill docx|pdf|xlsx|all] [--python executable] [--syntax]'); process.exit(2); }
}
if (!['docx','pdf','xlsx','all'].includes(skill) || explicit === '') { console.error('Invalid skill or Python executable'); process.exit(2); }
const local = path.join(root, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
const candidates = explicit ? [[explicit, []]] : fs.existsSync(local) ? [[local, []]] : [['python3', []], ['python', []], ...(process.platform === 'win32' ? [['py', ['-3']]] : [])];
let chosen;
const failures = [];
for (const [exe, prefix] of candidates) {
  const r = spawnSync(exe, [...prefix, '-B', '-c', 'import sys; print(sys.version.split()[0]); sys.exit(0 if sys.version_info >= (3,10) else 3)'], { encoding:'utf8', timeout:30000 });
  if (r.status === 0) { chosen = {exe, prefix, version:r.stdout.trim()}; break; }
  failures.push(`${exe}: ${r.error?.code || r.stderr?.trim() || 'unsupported version / exit ' + r.status}`);
}
if (!chosen) { console.error(failures.join('\n')); console.error('Python >=3.10 unavailable. Install Python separately or specify --python <executable>.'); process.exit(1); }
console.log(`Python ${chosen.version}: ${chosen.exe}`);
const run = code => spawnSync(chosen.exe, [...chosen.prefix, '-B', '-c', code], { cwd:root, encoding:'utf8', timeout:30000 });
if (syntax) {
  const r = run(`import ast, pathlib, os\nfiles=[]\nfor directory, dirs, names in os.walk('.'):\n dirs[:]=[d for d in dirs if d not in ('.venv','.git','node_modules','__pycache__')]\n files.extend(pathlib.Path(directory)/n for n in names if n.endswith('.py'))\nfor p in files: ast.parse(p.read_text(encoding='utf-8-sig'), filename=str(p))\nprint(f'AST parsed {len(files)} Python files')`);
  process.stdout.write(r.stdout || ''); process.stderr.write(r.stderr || ''); if(r.error) console.error(r.error.message); process.exit(r.status === 0 ? 0 : 1);
}
const selected = skill === 'all' ? ['docx','pdf','xlsx'] : [skill];
const packages = {docx:['defusedxml','lxml'],pdf:['pypdf','pdfplumber','pdf2image','PIL'],xlsx:['openpyxl','defusedxml','lxml']};
const modules = [...new Set(selected.flatMap(s => packages[s]))];
const r = run(`import importlib, importlib.metadata, json\nresult={}\nfor name in ${JSON.stringify(modules)}:\n try:\n  m=importlib.import_module(name); result[name]=importlib.metadata.version('Pillow' if name == 'PIL' else name)\n except Exception as e: result[name]='MISSING: '+str(e)\nprint(json.dumps(result))`);
if(r.status !== 0) { console.error(r.stderr || r.error?.message); process.exit(1); }
const results = JSON.parse(r.stdout); let missing = false;
for(const [name, value] of Object.entries(results)) { console.log(`${name}: ${value}`); if(value.startsWith('MISSING')) missing = true; }
// Tools are feature-specific: report gaps without treating optional conversion/OCR as mandatory.
const t = run(`import shutil, pathlib, os, json\ntools={n:shutil.which(n) for n in ['soffice','pdftoppm','pdfinfo','pdftotext','tesseract','pandoc','gcc']}\nif not tools['soffice']:\n candidates=[pathlib.Path(os.environ.get(k,'C:/Program Files'))/'LibreOffice/program/soffice.exe' for k in ['PROGRAMFILES','PROGRAMFILES(X86)']]+[pathlib.Path('/Applications/LibreOffice.app/Contents/MacOS/soffice')]\n tools['soffice']=next((str(p) for p in candidates if p.is_file()),None)\nprint(json.dumps(tools))`);
if(t.status !== 0) { console.error(t.stderr || t.error?.message); process.exit(1); }
for(const [name, value] of Object.entries(JSON.parse(t.stdout))) console.log(`${name}: ${value ? 'available' : 'MISSING (feature-specific external tool)'}`);
console.log('No installation performed. See docs/python.md for requirements and feature-specific tools.');
process.exitCode = missing ? 1 : 0;
