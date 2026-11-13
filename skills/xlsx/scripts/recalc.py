"""
Excel Formula Recalculation Script
Recalculates all formulas in an Excel file using LibreOffice
"""

import json
import subprocess
import sys
import tempfile
from pathlib import Path

from office.soffice import get_soffice_env, find_soffice

from openpyxl import load_workbook

MACRO_FILENAME = "Module1.xba"

RECALCULATE_MACRO = """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE script:module PUBLIC "-//OpenOffice.org//DTD OfficeDocument 1.0//EN" "module.dtd">
<script:module xmlns:script="http://openoffice.org/2000/script" script:name="Module1" script:language="StarBasic">
    Sub RecalculateAndSave()
      ThisComponent.calculateAll()
      ThisComponent.store()
      ThisComponent.close(True)
      StarDesktop.terminate()
    End Sub
</script:module>"""


def setup_libreoffice_macro(profile):
    macro_dir = Path(profile) / "user/basic/Standard"
    macro_dir.mkdir(parents=True, exist_ok=True)
    (macro_dir / MACRO_FILENAME).write_text(RECALCULATE_MACRO, encoding="utf-8")
    (macro_dir / "script.xlb").write_text(
        '<?xml version="1.0"?><library:library xmlns:library="http://openoffice.org/2000/library" library:name="Standard" library:readonly="false" library:passwordprotected="false"><library:element library:name="Module1"/></library:library>', encoding="utf-8")
    (macro_dir.parent / "script.xlc").write_text(
        '<?xml version="1.0"?><library:libraries xmlns:library="http://openoffice.org/2000/library" xmlns:xlink="http://www.w3.org/1999/xlink"><library:library library:name="Standard" xlink:href="Standard/script.xlb" xlink:type="simple" library:link="false"/></library:libraries>', encoding="utf-8")
    return True


def recalc(filename, timeout=30):
    if not Path(filename).exists():
        return {"error": f"File {filename} does not exist"}

    abs_path = str(Path(filename).absolute())

    if timeout <= 0:
        return {"error": "timeout must be positive"}
    try:
        with tempfile.TemporaryDirectory(prefix="aget-lo-") as profile:
            setup_libreoffice_macro(profile)
            cmd = [find_soffice(), "-env:UserInstallation=" + Path(profile).as_uri(),
                   "--headless", "--norestore",
                   "vnd.sun.star.script:Standard.Module1.RecalculateAndSave?language=Basic&location=application",
                   abs_path]
            result = subprocess.run(cmd, capture_output=True, text=True,
                                    timeout=timeout, env=get_soffice_env())
            if result.returncode != 0:
                return {"error": result.stderr or "LibreOffice recalculation failed"}
    except subprocess.TimeoutExpired:
        return {"error": f"LibreOffice recalculation timed out after {timeout} seconds"}
    except (OSError, subprocess.SubprocessError) as exc:
        return {"error": str(exc)}

    try:
        wb = load_workbook(filename, data_only=True)

        excel_errors = [
            "#VALUE!",
            "#DIV/0!",
            "#REF!",
            "#NAME?",
            "#NULL!",
            "#NUM!",
            "#N/A",
        ]
        error_details = {err: [] for err in excel_errors}
        total_errors = 0

        for sheet_name in wb.sheetnames:
            ws = wb[sheet_name]
            for row in ws.iter_rows():
                for cell in row:
                    if cell.value is not None and isinstance(cell.value, str):
                        for err in excel_errors:
                            if err in cell.value:
                                location = f"{sheet_name}!{cell.coordinate}"
                                error_details[err].append(location)
                                total_errors += 1
                                break

        wb.close()

        result = {
            "status": "success" if total_errors == 0 else "errors_found",
            "total_errors": total_errors,
            "error_summary": {},
        }

        for err_type, locations in error_details.items():
            if locations:
                result["error_summary"][err_type] = {
                    "count": len(locations),
                    "locations": locations[:20],  
                }

        wb_formulas = load_workbook(filename, data_only=False)
        formula_count = 0
        for sheet_name in wb_formulas.sheetnames:
            ws = wb_formulas[sheet_name]
            for row in ws.iter_rows():
                for cell in row:
                    if (
                        cell.value
                        and isinstance(cell.value, str)
                        and cell.value.startswith("=")
                    ):
                        formula_count += 1
        wb_formulas.close()

        result["total_formulas"] = formula_count

        return result

    except Exception as e:
        return {"error": str(e)}


def main():
    if len(sys.argv) < 2:
        print("Usage: python recalc.py <excel_file> [timeout_seconds]")
        print("\nRecalculates all formulas in an Excel file using LibreOffice")
        print("\nReturns JSON with error details:")
        print("  - status: 'success' or 'errors_found'")
        print("  - total_errors: Total number of Excel errors found")
        print("  - total_formulas: Number of formulas in the file")
        print("  - error_summary: Breakdown by error type with locations")
        print("    - #VALUE!, #DIV/0!, #REF!, #NAME?, #NULL!, #NUM!, #N/A")
        sys.exit(1)

    filename = sys.argv[1]
    timeout = int(sys.argv[2]) if len(sys.argv) > 2 else 30

    result = recalc(filename, timeout)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
