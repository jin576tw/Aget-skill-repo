# pitfall-guard.ps1 — PreToolUse warn-only hook (ADR-003 Phase 2)
# Pure PowerShell, no external deps, fail-open: always exits 0
[Console]::InputEncoding  = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding           = [System.Text.Encoding]::UTF8
try {
    $json = [Console]::In.ReadToEnd()
    if ([string]::IsNullOrWhiteSpace($json)) { exit 0 }

    $data    = $json | ConvertFrom-Json
    $toolName = $data.tool_name
    $command  = if ($null -ne $data.tool_input -and $data.tool_input.PSObject.Properties['command']) {
                    $data.tool_input.command
                } else { '' }

    if ([string]::IsNullOrWhiteSpace($command)) { exit 0 }

    $pitfallsPath = 'P:\MEMORY\knowledge\pitfalls.json'
    if (-not (Test-Path $pitfallsPath)) { exit 0 }

    $pitfalls = Get-Content $pitfallsPath -Raw -Encoding UTF8 | ConvertFrom-Json

    foreach ($p in $pitfalls) {
        if ($p.scope -and $toolName -notmatch $p.scope) { continue }
        if ($command -match $p.pattern) {
            $out = [ordered]@{ additionalContext = "⚠️ 踩雷防護 [$($p.id)] $($p.message)" }
            Write-Output ($out | ConvertTo-Json -Compress)
            exit 0
        }
    }

    exit 0
} catch {
    exit 0
}
