[CmdletBinding()]
param(
    [ValidateSet('Resolve', 'Hash', 'Validate', 'Status', 'Update')]
    [string]$Action = 'Status',
    [string]$TaskId,
    [string]$PlanId,
    [string]$TaskName,
    [string]$WorkspacePath = (Get-Location).Path,
    [string]$HandoverRoot = 'P:\MEMORY\handovers',
    [string]$HandoverPath,
    [ValidateSet('ready', 'waiting', 'in_progress', 'blocked', 'completed', 'superseded')]
    [string]$NewStatus,
    [string]$ClaimId,
    [string]$Summary,
    [string]$Evidence,
    [switch]$Takeover,
    [ValidateSet('Skip', 'Auto')]
    [string]$GitMode = 'Skip',
    [int]$MutexTimeoutSeconds = 30
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$script:Utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$script:NL = [Environment]::NewLine

function ConvertTo-NormalizedSlug {
    param([Parameter(Mandatory)][string]$Value)
    $slug = ([regex]::Replace($Value.ToLowerInvariant(), '[^a-z0-9]+', '-')).Trim('-')
    if ([string]::IsNullOrWhiteSpace($slug)) { throw "INVALID_SLUG: $Value" }
    return $slug
}

function Get-Sha256Text {
    param([Parameter(Mandatory)][string]$Text)
    $normalized = $Text.Replace(([string][char]13 + [char]10), [string][char]10).Replace([string][char]13, [string][char]10).Trim()
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        $bytes = $script:Utf8NoBom.GetBytes($normalized)
        return ([System.BitConverter]::ToString($sha.ComputeHash($bytes))).Replace('-', '').ToLowerInvariant()
    }
    finally {
        $sha.Dispose()
    }
}

function Get-WorkspaceInfo {
    param([Parameter(Mandatory)][string]$Path)
    $resolved = (Resolve-Path -LiteralPath $Path).ProviderPath
    $root = [System.IO.Path]::GetPathRoot($resolved)
    if ($resolved.Length -gt $root.Length) { $resolved = $resolved.TrimEnd('\', '/') }
    $normalized = $resolved.Replace('/', '\').ToLowerInvariant()
    $leaf = Split-Path -Leaf $resolved
    $leafSlug = ([regex]::Replace($leaf.ToLowerInvariant(), '[^a-z0-9]+', '-')).Trim('-')
    if ([string]::IsNullOrWhiteSpace($leafSlug)) { $leafSlug = 'workspace' }
    $pathHash = (Get-Sha256Text -Text $normalized).Substring(0, 8)
    [pscustomobject]@{
        Resolved = $resolved
        Normalized = $normalized
        Prefix = "$leafSlug--$pathHash"
    }
}

function Parse-TaskId {
    param([Parameter(Mandatory)][string]$Value)
    $match = [regex]::Match($Value.Trim(), '^(?<plan>[A-Za-z0-9][A-Za-z0-9-]*):(?<task>[A-Za-z0-9][A-Za-z0-9-]*)$')
    if (-not $match.Success) { throw 'INVALID_TASK_ID: expected PLAN-ID:TASK-NAME' }
    [pscustomobject]@{
        Plan = $match.Groups['plan'].Value.ToUpperInvariant()
        Task = $match.Groups['task'].Value.ToUpperInvariant()
    }
}

function Get-MetadataValue {
    param([Parameter(Mandatory)][string]$Text, [Parameter(Mandatory)][string]$Name)
    $pattern = '(?m)^-\s+' + [regex]::Escape($Name) + ':\s+(?<value>[^\r\n]+)\s*$'
    $match = [regex]::Match($Text, $pattern)
    if (-not $match.Success) { throw "PLAN_BOARD_INVALID: missing $Name" }
    return $match.Groups['value'].Value.Trim().Trim([char]96)
}

function Get-BoardRows {
    param([Parameter(Mandatory)][string]$Text)
    $pattern = '(?m)^\|\s*(?<done>\[[ xX]\])\s*\|\s*(?<task>[A-Z0-9-]+)\s*\|\s*(?<status>[a-z_]+)\s*\|\s*(?<claim>[^|]*)\|\s*(?<revision>\d+)\s*\|\s*(?<updated>[^|]*)\|\s*$'
    $rows = @()
    foreach ($match in [regex]::Matches($Text, $pattern)) {
        $rows += [pscustomobject]@{
            Done = $match.Groups['done'].Value
            Task = $match.Groups['task'].Value.Trim().ToUpperInvariant()
            Status = $match.Groups['status'].Value.Trim()
            Claim = $match.Groups['claim'].Value.Trim()
            Revision = [int]$match.Groups['revision'].Value
            Updated = $match.Groups['updated'].Value.Trim()
            Raw = $match.Value
        }
    }
    if ($rows.Count -eq 0) { throw 'PLAN_BOARD_INVALID: no task rows' }
    return $rows
}

function Get-TaskBlock {
    param([Parameter(Mandatory)][string]$Text, [Parameter(Mandatory)][string]$Task)
    $escaped = [regex]::Escape($Task)
    $pattern = '(?s)<!-- START-PLAN:TASK:' + $escaped + ':BEGIN -->.*?<!-- START-PLAN:TASK:' + $escaped + ':END -->'
    $matches = [regex]::Matches($Text, $pattern)
    if ($matches.Count -ne 1) { throw "TASK_CONTRACT_BLOCKED: expected one task block for $Task, found $($matches.Count)" }
    return $matches[0].Value
}

function Get-ContractInfo {
    param([Parameter(Mandatory)][string]$Block, [Parameter(Mandatory)][string]$Task)
    $escaped = [regex]::Escape($Task)
    $pattern = '(?s)<!-- START-PLAN:CONTRACT:' + $escaped + ':BEGIN -->\s*(?<content>.*?)\s*<!-- START-PLAN:CONTRACT:' + $escaped + ':END -->'
    $match = [regex]::Match($Block, $pattern)
    if (-not $match.Success) { throw "TASK_CONTRACT_BLOCKED: missing locked contract for $Task" }
    $storedMatch = [regex]::Match($Block, '(?m)^-\s+Contract-SHA256:\s*(?<hash>[a-fA-F0-9]{64})\s*$')
    if (-not $storedMatch.Success) { throw "TASK_CONTRACT_BLOCKED: missing Contract-SHA256 for $Task" }
    [pscustomobject]@{
        Stored = $storedMatch.Groups['hash'].Value.ToLowerInvariant()
        Computed = Get-Sha256Text -Text $match.Groups['content'].Value
        Content = $match.Groups['content'].Value
    }
}

function Get-ContractField {
    param(
        [Parameter(Mandatory)][string]$Content,
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][string]$Task
    )
    $pattern = '(?m)^-\s+' + [regex]::Escape($Name) + ':\s*(?<value>[^\r\n]+)\s*$'
    $matches = [regex]::Matches($Content, $pattern)
    if ($matches.Count -ne 1) { throw "TASK_CONTRACT_BLOCKED: expected one $Name for $Task" }
    return $matches[0].Groups['value'].Value.Trim()
}

function Resolve-BoardPath {
    if (-not [string]::IsNullOrWhiteSpace($TaskId)) {
        $parts = Parse-TaskId -Value $TaskId
        if ([string]::IsNullOrWhiteSpace($script:ResolvedPlanId)) { $script:ResolvedPlanId = $parts.Plan }
        if ([string]::IsNullOrWhiteSpace($script:ResolvedTaskName)) { $script:ResolvedTaskName = $parts.Task }
    }
    if (-not [string]::IsNullOrWhiteSpace($PlanId)) { $script:ResolvedPlanId = $PlanId.ToUpperInvariant() }
    if (-not [string]::IsNullOrWhiteSpace($TaskName)) { $script:ResolvedTaskName = $TaskName.ToUpperInvariant() }

    if (-not [string]::IsNullOrWhiteSpace($HandoverPath)) {
        return (Resolve-Path -LiteralPath $HandoverPath).ProviderPath
    }
    if ([string]::IsNullOrWhiteSpace($script:ResolvedPlanId)) { throw 'PLAN_ID_REQUIRED' }
    $workspace = Get-WorkspaceInfo -Path $WorkspacePath
    $filename = "$($workspace.Prefix)--$(ConvertTo-NormalizedSlug -Value $script:ResolvedPlanId).md"
    $candidate = Join-Path $HandoverRoot $filename
    if (-not (Test-Path -LiteralPath $candidate)) { throw "PLAN_NOT_FOUND: $candidate" }
    return (Resolve-Path -LiteralPath $candidate).ProviderPath
}

function Read-And-ValidateBoard {
    param([Parameter(Mandatory)][string]$Path, [switch]$AllowWorkspaceMismatch)
    $text = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
    if ((Get-MetadataValue -Text $text -Name 'Handover-Type') -ne 'plan-board') {
        throw 'PLAN_BOARD_INVALID: Handover-Type must be plan-board'
    }
    $filePlan = (Get-MetadataValue -Text $text -Name 'Plan-ID').ToUpperInvariant()
    if (-not [string]::IsNullOrWhiteSpace($script:ResolvedPlanId) -and $filePlan -ne $script:ResolvedPlanId) {
        throw "PLAN_ID_MISMATCH: expected $($script:ResolvedPlanId), found $filePlan"
    }
    $script:ResolvedPlanId = $filePlan

    if (-not $AllowWorkspaceMismatch) {
        $expected = (Get-WorkspaceInfo -Path $WorkspacePath).Normalized
        $actualPath = Get-MetadataValue -Text $text -Name 'Workspace'
        $actual = (Get-WorkspaceInfo -Path $actualPath).Normalized
        if ($expected -ne $actual) { throw "TASK_WORKSPACE_MISMATCH: expected $actualPath, current $WorkspacePath" }
    }

    $rows = @(Get-BoardRows -Text $text)
    $seen = @{}
    foreach ($row in $rows) {
        if ($seen.ContainsKey($row.Task)) { throw "PLAN_BOARD_INVALID: duplicate row $($row.Task)" }
        $seen[$row.Task] = $true
        $block = Get-TaskBlock -Text $text -Task $row.Task
        $contract = Get-ContractInfo -Block $block -Task $row.Task
        if ($contract.Stored -ne $contract.Computed) { throw "TASK_CONTRACT_BLOCKED: hash mismatch for $($row.Task)" }
        $priority = (Get-ContractField -Content $contract.Content -Name 'Priority' -Task $row.Task).ToUpperInvariant()
        $dependsOn = (Get-ContractField -Content $contract.Content -Name 'Depends-On' -Task $row.Task).ToUpperInvariant()
        $executionMode = (Get-ContractField -Content $contract.Content -Name 'Execution-Mode' -Task $row.Task).ToLowerInvariant()
        $sessionBudget = Get-ContractField -Content $contract.Content -Name 'Session-Budget' -Task $row.Task
        if ($priority -notin @('P0', 'P1', 'P2')) { throw "TASK_CONTRACT_BLOCKED: invalid Priority for $($row.Task)" }
        if ($executionMode -notin @('single-session', 'checkpointed')) { throw "TASK_CONTRACT_BLOCKED: invalid Execution-Mode for $($row.Task)" }
        $row | Add-Member -NotePropertyName Priority -NotePropertyValue $priority
        $row | Add-Member -NotePropertyName DependsOn -NotePropertyValue $dependsOn
        $row | Add-Member -NotePropertyName ExecutionMode -NotePropertyValue $executionMode
        $row | Add-Member -NotePropertyName SessionBudget -NotePropertyValue $sessionBudget
        $blockStatusMatch = [regex]::Match($block, '(?m)^-\s+Status:\s*(?<value>[a-z_]+)\s*$')
        $blockRevisionMatch = [regex]::Match($block, '(?m)^-\s+Task-Revision:\s*(?<value>\d+)\s*$')
        if (-not $blockStatusMatch.Success -or -not $blockRevisionMatch.Success) {
            throw "PLAN_BOARD_INVALID: missing state fields for $($row.Task)"
        }
        if ($blockStatusMatch.Groups['value'].Value -ne $row.Status -or [int]$blockRevisionMatch.Groups['value'].Value -ne $row.Revision) {
            throw "PLAN_BOARD_INVALID: row/block mismatch for $($row.Task)"
        }
        if (($row.Status -eq 'completed') -ne ($row.Done -match '[xX]')) {
            throw "PLAN_BOARD_INVALID: checkbox/status mismatch for $($row.Task)"
        }
    }

    foreach ($row in $rows) {
        $dependencies = @($row.DependsOn.Split(',') | ForEach-Object { $_.Trim().ToUpperInvariant() } | Where-Object { $_ -and $_ -ne 'NONE' })
        foreach ($dependency in $dependencies) {
            if (@($rows | Where-Object Task -eq $dependency).Count -ne 1) {
                throw "TASK_CONTRACT_BLOCKED: $($row.Task) depends on missing task $dependency"
            }
        }
    }
    if ($rows[-1].Task -ne 'INTEGRATION') { throw 'PLAN_BOARD_INVALID: final task must be INTEGRATION' }

    [pscustomobject]@{
        Text = $text
        PlanId = $filePlan
        PlanStatus = Get-MetadataValue -Text $text -Name 'Plan-Status'
        PlanRevision = [int](Get-MetadataValue -Text $text -Name 'Plan-Revision')
        Rows = $rows
        Path = $Path
    }
}

function ConvertTo-SafeLine {
    param([string]$Value, [string]$Default)
    if ([string]::IsNullOrWhiteSpace($Value)) { return $Default }
    return (($Value -replace '\r?\n', ' ') -replace '\|', '/').Trim()
}

function Invoke-GitChecked {
    param([Parameter(Mandatory)][string]$Repo, [Parameter(Mandatory)][string[]]$Arguments)
    $previousPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        $output = & git -C $Repo @Arguments 2>&1
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousPreference
    }
    if ($exitCode -ne 0) { throw "GIT_FAILED: git $($Arguments -join ' ') $($output -join $script:NL)" }
    return @($output)
}

function Save-BoardWithGit {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string]$Content,
        [Parameter(Mandatory)][string]$Task,
        [Parameter(Mandatory)][string]$Status
    )
    $directory = Split-Path -Parent $Path
    $temp = Join-Path $directory ('.' + [System.IO.Path]::GetFileName($Path) + '.' + [guid]::NewGuid().ToString('N') + '.tmp')
    try {
        [System.IO.File]::WriteAllText($temp, $Content, $script:Utf8NoBom)
        Move-Item -LiteralPath $temp -Destination $Path -Force
    }
    finally {
        if (Test-Path -LiteralPath $temp) { Remove-Item -LiteralPath $temp -Force }
    }

    if ($GitMode -eq 'Skip') { return $null }

    $repo = Split-Path -Parent $HandoverRoot
    $resolvedRepo = (Resolve-Path -LiteralPath $repo).ProviderPath
    $resolvedPath = (Resolve-Path -LiteralPath $Path).ProviderPath
    $relative = $resolvedPath.Substring($resolvedRepo.Length).TrimStart('\', '/').Replace('\', '/')
    $stagedBefore = @(& git -C $resolvedRepo diff --cached --name-only)

    & git -C $resolvedRepo diff --quiet -- $relative
    if ($LASTEXITCODE -eq 0) { return 'NO_DIFF' }
    if ($LASTEXITCODE -ne 1) { throw 'GIT_FAILED: unable to inspect plan-board diff' }

    $message = "docs: update $($script:ResolvedPlanId) $Task to $Status"
    [void](Invoke-GitChecked -Repo $resolvedRepo -Arguments @('commit', '--only', '-m', $message, '--', $relative))
    $commitPaths = @(& git -C $resolvedRepo show --name-only --format= HEAD | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    if ($commitPaths.Count -ne 1 -or $commitPaths[0].Replace('\', '/') -ne $relative) {
        throw "GIT_SCOPE_VIOLATION: commit contains $($commitPaths -join ', ')"
    }
    $stagedAfter = @(& git -C $resolvedRepo diff --cached --name-only)
    if (($stagedBefore -join $script:NL) -ne ($stagedAfter -join $script:NL)) {
        throw 'GIT_SCOPE_VIOLATION: pre-existing staged paths changed'
    }
    [void](Invoke-GitChecked -Repo $resolvedRepo -Arguments @('push'))
    return (& git -C $resolvedRepo rev-parse --short HEAD).Trim()
}

$script:ResolvedPlanId = ''
$script:ResolvedTaskName = ''
$path = Resolve-BoardPath

if ($Action -eq 'Resolve') {
    $result = Read-And-ValidateBoard -Path $path
    [pscustomobject]@{
        signal = 'PLAN_RESOLVED'
        plan_id = $result.PlanId
        task = $script:ResolvedTaskName
        path = $path
    } | ConvertTo-Json -Depth 5
    exit 0
}

if ($Action -eq 'Hash') {
    if ([string]::IsNullOrWhiteSpace($script:ResolvedTaskName)) { throw 'TASK_NAME_REQUIRED' }
    $text = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    $block = Get-TaskBlock -Text $text -Task $script:ResolvedTaskName
    $contract = Get-ContractInfo -Block $block -Task $script:ResolvedTaskName
    [pscustomobject]@{
        signal = 'CONTRACT_HASH'
        task = $script:ResolvedTaskName
        stored = $contract.Stored
        computed = $contract.Computed
        matches = ($contract.Stored -eq $contract.Computed)
    } | ConvertTo-Json -Depth 5
    exit 0
}

if ($Action -eq 'Validate' -or $Action -eq 'Status') {
    $board = Read-And-ValidateBoard -Path $path
    $priorityRank = @{ P0 = 0; P1 = 1; P2 = 2 }
    $eligible = @()
    foreach ($row in $board.Rows) {
        if ($row.Status -notin @('ready', 'waiting')) { continue }
        $dependencies = @($row.DependsOn.Split(',') | ForEach-Object { $_.Trim().ToUpperInvariant() } | Where-Object { $_ -and $_ -ne 'NONE' })
        $blocked = $false
        foreach ($dependency in $dependencies) {
            if (@($board.Rows | Where-Object { $_.Task -eq $dependency -and $_.Status -eq 'completed' }).Count -ne 1) { $blocked = $true; break }
        }
        if (-not $blocked) { $eligible += $row }
    }
    $eligible = @($eligible | Sort-Object @{ Expression = { $priorityRank[$_.Priority] } }, Task)
    $nextTasks = @()
    if ($eligible.Count -gt 0) {
        $bestPriority = $eligible[0].Priority
        $nextTasks = @($eligible | Where-Object Priority -eq $bestPriority | ForEach-Object {
            [pscustomobject]@{
                task_id = "$($board.PlanId):$($_.Task)"
                priority = $_.Priority
                execution_mode = $_.ExecutionMode
                session_budget = $_.SessionBudget
            }
        })
    }
    [pscustomobject]@{
        signal = if ($Action -eq 'Validate') { 'PLAN_BOARD_VALID' } else { 'PLAN_STATUS' }
        plan_id = $board.PlanId
        plan_status = $board.PlanStatus
        revision = $board.PlanRevision
        path = $path
        tasks = @($board.Rows | Select-Object Task, Status, Priority, DependsOn, ExecutionMode, SessionBudget, Claim, Revision, Updated)
        next_tasks = $nextTasks
    } | ConvertTo-Json -Depth 6
    exit 0
}

if ($Action -ne 'Update') { throw "UNSUPPORTED_ACTION: $Action" }
if ([string]::IsNullOrWhiteSpace($script:ResolvedTaskName)) { throw 'TASK_NAME_REQUIRED' }
if ([string]::IsNullOrWhiteSpace($NewStatus)) { throw 'NEW_STATUS_REQUIRED' }

$mutexKey = (Get-Sha256Text -Text $script:ResolvedPlanId).Substring(0, 16)
$mutex = [System.Threading.Mutex]::new($false, "Local\StartPlan-$mutexKey")
$acquired = $false
try {
    try { $acquired = $mutex.WaitOne([TimeSpan]::FromSeconds($MutexTimeoutSeconds)) }
    catch [System.Threading.AbandonedMutexException] { $acquired = $true }
    if (-not $acquired) { throw "PLAN_BOARD_LOCK_TIMEOUT: $($script:ResolvedPlanId)" }

    $board = Read-And-ValidateBoard -Path $path
    $task = $script:ResolvedTaskName
    $rowMatches = @($board.Rows | Where-Object Task -eq $task)
    if ($rowMatches.Count -ne 1) { throw "TASK_NOT_FOUND: $($script:ResolvedPlanId):$task" }
    $row = $rowMatches[0]
    $block = Get-TaskBlock -Text $board.Text -Task $task

    if ($row.Status -eq 'completed' -and $NewStatus -ne 'completed') {
        throw "TASK_ALREADY_COMPLETED: $($script:ResolvedPlanId):$task"
    }

    $blockClaimMatch = [regex]::Match($block, '(?m)^-\s+Claim-ID:\s*(?<value>[^\r\n]+)\s*$')
    $blockDependsMatch = [regex]::Match($block, '(?m)^-\s+Depends-On:\s*(?<value>[^\r\n]+)\s*$')
    if (-not $blockClaimMatch.Success -or -not $blockDependsMatch.Success) {
        throw "TASK_CONTRACT_BLOCKED: missing claim or dependencies for $task"
    }
    $currentClaim = $blockClaimMatch.Groups['value'].Value.Trim()
    $dependencies = @($blockDependsMatch.Groups['value'].Value.Split(',') | ForEach-Object { $_.Trim().ToUpperInvariant() } | Where-Object { $_ -and $_ -ne 'NONE' })

    if ($NewStatus -eq 'in_progress') {
        foreach ($dependency in $dependencies) {
            $dependencyRows = @($board.Rows | Where-Object Task -eq $dependency)
            if ($dependencyRows.Count -ne 1 -or $dependencyRows[0].Status -ne 'completed') {
                throw "TASK_DEPENDENCY_BLOCKED: $task waits for $dependency"
            }
        }
        if ($row.Status -eq 'in_progress' -and -not $Takeover) {
            if ([string]::IsNullOrWhiteSpace($ClaimId) -or $currentClaim -ne $ClaimId) {
                throw "TASK_ALREADY_CLAIMED: $($script:ResolvedPlanId):$task claim=$currentClaim"
            }
        }
        if ($row.Status -eq 'in_progress' -and $Takeover) {
            $ClaimId = [guid]::NewGuid().ToString()
        }
        elseif ([string]::IsNullOrWhiteSpace($ClaimId)) {
            $ClaimId = [guid]::NewGuid().ToString()
        }
    }
    elseif ($row.Status -eq 'in_progress' -and -not $Takeover) {
        if ([string]::IsNullOrWhiteSpace($ClaimId) -or $currentClaim -ne $ClaimId) {
            throw "TASK_ALREADY_CLAIMED: $($script:ResolvedPlanId):$task claim=$currentClaim"
        }
    }

    if ($NewStatus -eq 'ready' -or $NewStatus -eq 'waiting') {
        $newClaim = '-'
    }
    elseif (-not [string]::IsNullOrWhiteSpace($ClaimId)) {
        $newClaim = $ClaimId
    }
    else {
        $newClaim = $currentClaim
    }

    $newRevision = $row.Revision + 1
    $updated = [DateTimeOffset]::Now.ToString('yyyy-MM-ddTHH:mm:ss.fffzzz')
    $safeSummary = ConvertTo-SafeLine -Value $Summary -Default $NewStatus
    $safeEvidence = ConvertTo-SafeLine -Value $Evidence -Default 'none'
    $done = if ($NewStatus -eq 'completed') { '[x]' } else { '[ ]' }

    $newBlock = $block
    $newBlock = [regex]::Replace($newBlock, '(?m)^-\s+Status:\s*[a-z_]+\s*$', "- Status: $NewStatus", 1)
    $newBlock = [regex]::Replace($newBlock, '(?m)^-\s+Claim-ID:\s*[^\r\n]+\s*$', "- Claim-ID: $newClaim", 1)
    $newBlock = [regex]::Replace($newBlock, '(?m)^-\s+Task-Revision:\s*\d+\s*$', "- Task-Revision: $newRevision", 1)
    $progressPattern = '(?s)<!-- START-PLAN:PROGRESS:' + [regex]::Escape($task) + ':BEGIN -->.*?<!-- START-PLAN:PROGRESS:' + [regex]::Escape($task) + ':END -->'
    $progress = [string]::Join($script:NL, @(
        "<!-- START-PLAN:PROGRESS:$($task):BEGIN -->",
        "- Updated: $updated",
        "- Summary: $safeSummary",
        "- Evidence: $safeEvidence",
        "<!-- START-PLAN:PROGRESS:$($task):END -->"
    ))
    $newBlock = [regex]::Replace($newBlock, $progressPattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($match) $progress }, 1)

    $newText = $board.Text.Replace($block, $newBlock)
    $rowPattern = '(?m)^\|\s*\[[ xX]\]\s*\|\s*' + [regex]::Escape($task) + '\s*\|\s*[a-z_]+\s*\|\s*[^|]*\|\s*\d+\s*\|\s*[^|]*\|\s*$'
    $newRow = "| $done | $task | $NewStatus | $newClaim | $newRevision | $updated |"
    $newText = [regex]::Replace($newText, $rowPattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($match) $newRow }, 1)

    $nextRows = @(Get-BoardRows -Text $newText)
    $planStatus = if (@($nextRows | Where-Object Status -ne 'completed').Count -eq 0) { 'completed' } else { 'active' }
    $newText = [regex]::Replace($newText, '(?m)^-\s+Plan-Status:\s*[a-z_]+\s*$', "- Plan-Status: $planStatus", 1)
    $newText = [regex]::Replace($newText, '(?m)^-\s+Plan-Revision:\s*\d+\s*$', "- Plan-Revision: $($board.PlanRevision + 1)", 1)
    $newText = [regex]::Replace($newText, '(?m)^-\s+Updated:\s+[^\r\n]+\s*$', "- Updated: $updated", 1)

    $commit = Save-BoardWithGit -Path $path -Content $newText -Task $task -Status $NewStatus
    $validated = Read-And-ValidateBoard -Path $path
    [pscustomobject]@{
        signal = 'TASK_STATUS_UPDATED'
        task_id = "$($validated.PlanId):$task"
        status = $NewStatus
        claim_id = $newClaim
        revision = $newRevision
        plan_status = $validated.PlanStatus
        path = $path
        commit = $commit
    } | ConvertTo-Json -Depth 6
}
finally {
    if ($acquired) { $mutex.ReleaseMutex() }
    $mutex.Dispose()
}
