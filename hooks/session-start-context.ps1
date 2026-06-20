<#
.SYNOPSIS
  Claude Code SessionStart hook — 注入專案框架資訊
.DESCRIPTION
  讀取 package.json 偵測前端框架版本，輸出為 systemMessage
  讓 agent 一開始就知道專案技術棧
#>
$ErrorActionPreference = 'SilentlyContinue'

# 讀取 stdin（hook input）
$null = [Console]::In.ReadToEnd()

$info = @()

# 偵測 package.json
$pkgPath = Join-Path $PWD 'package.json'
if (Test-Path $pkgPath) {
  $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
  $deps = $pkg.dependencies

  if ($deps.'@angular/core')    { $info += "Angular $($deps.'@angular/core')" }
  if ($deps.'react')            { $info += "React $($deps.'react')" }
  if ($deps.'vue')              { $info += "Vue $($deps.'vue')" }
  if ($deps.'next')             { $info += "Next.js $($deps.'next')" }
  if ($deps.'@nestjs/core')     { $info += "NestJS $($deps.'@nestjs/core')" }

  # Node engine
  if ($pkg.engines -and $pkg.engines.node) { $info += "Node $($pkg.engines.node)" }
}

# 偵測 pom.xml（Java/Spring）
$pomPath = Join-Path $PWD 'pom.xml'
if (Test-Path $pomPath) {
  $pomContent = Get-Content $pomPath -Raw
  if ($pomContent -match 'spring-boot') { $info += 'Spring Boot' }
  elseif ($pomContent -match '<groupId>') { $info += 'Java/Maven' }
}

# 輸出
if ($info.Count -gt 0) {
  $msg = "Detected project stack: $($info -join ', ')"
  $output = @{ systemMessage = $msg } | ConvertTo-Json -Compress
  Write-Output $output
}
