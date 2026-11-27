# Generate the responsive HTML shell with the skill's accessible CSS tokens.
$ErrorActionPreference = 'Stop'
$script:BaUtf8 = New-Object System.Text.UTF8Encoding($false, $true)
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
$OutputEncoding = [Console]::OutputEncoding

function Read-BaArguments {
    param([object[]]$Arguments, [string[]]$Values = @(), [string[]]$Switches = @(),
          [hashtable]$Aliases = @{}, [switch]$AllowPositionals)
    $result = @{ positional = @() }
    for ($i = 0; $i -lt $Arguments.Count; $i++) {
        $token = [string]$Arguments[$i]
        if ($token -eq '--') {
            if (-not $AllowPositionals) { throw 'Positional arguments are not supported.' }
            $result.positional += @($Arguments | Select-Object -Skip ($i + 1))
            break
        }
        if ($token.StartsWith('-')) {
            $parts = $token.TrimStart('-').Split([char[]]'=', 2)
            $key = $parts[0].ToLowerInvariant()
            if ($Aliases.ContainsKey($key)) { $key = $Aliases[$key] }
            if ($key -in @('h', 'help')) { $result.help = $true; continue }
            if ($key -in $Switches) {
                if ($parts.Count -gt 1) { throw "Option --$key does not accept a value." }
                $result[$key] = $true
            } elseif ($key -in $Values) {
                if ($parts.Count -gt 1) { $value = $parts[1] }
                else {
                    $i++
                    if ($i -ge $Arguments.Count -or ([string]$Arguments[$i]).StartsWith('--')) {
                        throw "Option --$key requires a value."
                    }
                    $value = [string]$Arguments[$i]
                }
                if ($result.ContainsKey($key)) { throw "Option --$key was supplied more than once." }
                $result[$key] = $value
            } else { throw "Unknown option: $token" }
        } elseif ($AllowPositionals) { $result.positional += $token }
        else { throw "Unexpected argument: $token" }
    }
    return $result
}

function Resolve-BaPath {
    param([string]$Path, [string]$Base = (Get-Location).Path)
    if ([IO.Path]::IsPathRooted($Path)) { return [IO.Path]::GetFullPath($Path) }
    return [IO.Path]::GetFullPath((Join-Path $Base $Path))
}

function Read-BaText {
    param([string]$Path)
    return [IO.File]::ReadAllText($Path, $script:BaUtf8).Replace("`r`n", "`n")
}

function Write-BaText {
    param([string]$Path, [string]$Content)
    $Path = Resolve-BaPath $Path
    if ([IO.File]::Exists($Path) -and (Read-BaText $Path) -ceq $Content) { return $false }
    [void][IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($Path))
    $temporary = $Path + '.' + [Guid]::NewGuid().ToString('N') + '.tmp'
    try {
        [IO.File]::WriteAllText($temporary, $Content, $script:BaUtf8)
        if ([IO.File]::Exists($Path)) { [IO.File]::Replace($temporary, $Path, [NullString]::Value, $true) }
        else { [IO.File]::Move($temporary, $Path) }
    } finally {
        if ([IO.File]::Exists($temporary)) { [IO.File]::Delete($temporary) }
    }
    return $true
}

try {
    $options = Read-BaArguments $args -Values @('title', 'desc', 'output', 'app', 'appid') -Aliases @{ 'appid' = 'app' }
    if ($options.help) { [Console]::WriteLine('scaffold_wireframe.ps1 --title TITLE --output PATH [--desc DESCRIPTION] [--app APP_ID]'); exit 0 }
    if (-not $options.title -or -not $options.output) { throw '--title and --output are required.' }
    $output = Resolve-BaPath $options.output
    $tokens = Join-Path $PSScriptRoot '../assets/wireframe-tokens.css'
    if (-not [IO.File]::Exists($tokens)) { throw "CSS tokens are missing: $tokens" }
    $css = Read-BaText $tokens
    $title = [Net.WebUtility]::HtmlEncode($options.title)
    $description = if ($options.desc) { [Net.WebUtility]::HtmlEncode($options.desc) } else { 'Mid-Fidelity Wireframe Specification' }

    $appName = 'AppLogo'
    $appDesignTokens = ''
    $isMobileApp = $false

    if ($options.app) {
        $appId = $options.app.ToLowerInvariant().Trim()
        $baseContext = Join-Path $PSScriptRoot '../../../../.agent-artifacts/project-knowledge-base/solution-context/apps'
        
        $candidatePaths = @(
            (Join-Path $baseContext "$appId/app-design.md"),
            (Join-Path $baseContext "phone-os/$appId/app-design.md")
        )
        if ($appId -in @('phone-os', 'phone_os', 'os', 'shell')) {
            $candidatePaths = @((Join-Path $baseContext 'phone-os/app-design.md')) + $candidatePaths
        } elseif ($appId -in @('comms', 'phone', 'messages', 'sms')) {
            $candidatePaths = @((Join-Path $baseContext 'phone-os/comms/app-design.md')) + $candidatePaths
        } elseif ($appId -in @('photos', 'gallery')) {
            $candidatePaths = @((Join-Path $baseContext 'phone-os/photos/app-design.md')) + $candidatePaths
        } elseif ($appId -in @('evidence-board', 'wife-notebook', 'wife_notebook', 'notebook')) {
            $candidatePaths = @((Join-Path $baseContext 'phone-os/evidence-board/app-design.md')) + $candidatePaths
        } elseif ($appId -in @('husband-notes', 'husband_notes', 'notes', 'personal-notes')) {
            $candidatePaths = @((Join-Path $baseContext 'personal-notes/app-design.md')) + $candidatePaths
        } elseif ($appId -in @('zola', 'internet-messaging', 'messaging', 'chat')) {
            $candidatePaths = @((Join-Path $baseContext 'internet-messaging/app-design.md')) + $candidatePaths
        } elseif ($appId -in @('vietpay', 'banking', 'bank', 'wallet')) {
            $candidatePaths = @((Join-Path $baseContext 'banking/app-design.md')) + $candidatePaths
        } elseif ($appId -in @('poshee', 'ecommerce', 'shop')) {
            $candidatePaths = @((Join-Path $baseContext 'ecommerce/app-design.md')) + $candidatePaths
        } elseif ($appId -in @('grap', 'ride-hailing', 'ride')) {
            $candidatePaths = @((Join-Path $baseContext 'ride-hailing/app-design.md')) + $candidatePaths
        } elseif ($appId -in @('netsurf', 'web-browser', 'browser')) {
            $candidatePaths = @((Join-Path $baseContext 'web-browser/app-design.md')) + $candidatePaths
        } elseif ($appId -in @('geemail', 'email', 'mail')) {
            $candidatePaths = @((Join-Path $baseContext 'email/app-design.md')) + $candidatePaths
        } elseif ($appId -in @('inkedlin', 'professional-network', 'linkedin')) {
            $candidatePaths = @((Join-Path $baseContext 'professional-network/app-design.md')) + $candidatePaths
        } elseif ($appId -in @('tim', 'team-collaboration', 'teams')) {
            $candidatePaths = @((Join-Path $baseContext 'team-collaboration/app-design.md')) + $candidatePaths
        }

        $designPath = $null
        foreach ($p in $candidatePaths) {
            $resolved = Resolve-BaPath $p
            if ([IO.File]::Exists($resolved)) {
                $designPath = $resolved
                break
            }
        }

        if ($designPath) {
            $isMobileApp = $true
            $designContent = Read-BaText $designPath
            if ($designContent -match '(?m)^app_name:\s*(.+)$') {
                $appName = $Matches[1].Trim().Trim('"').Trim("'")
            } elseif ($designContent -match '(?m)^#\s+([^\r\n—\-]+)') {
                $appName = $Matches[1].Trim()
            }

            $primaryColor = $null
            $bgColor = $null
            $cardColor = $null
            $textColor = $null
            $accentColor = $null

            if ($designContent -match '(?i)(?:Primary Brand|Cover / Primary|Shell Bezel Frame|Calendar Primary)[\s:]+([^\r\n#]*)(#[0-9a-fA-F]{6})') {
                $primaryColor = $Matches[2]
            }
            if ($designContent -match '(?i)(?:Background Surface|Canvas Background|Background Canvas|Note Surface|Paper Canvas)[\s:]+([^\r\n#]*)(#[0-9a-fA-F]{6})') {
                $bgColor = $Matches[2]
            }
            if ($designContent -match '(?i)(?:Card Surface|Tile Card)[\s:]+([^\r\n#]*)(#[0-9a-fA-F]{6})') {
                $cardColor = $Matches[2]
            }
            if ($designContent -match '(?i)(?:Text Primary|Text Ink Primary)[\s:]+([^\r\n#]*)(#[0-9a-fA-F]{6})') {
                $textColor = $Matches[2]
            }
            if ($designContent -match '(?i)(?:Price Accent|Accent Gold|Accent Stamp|SMS Bubble Accent|Highlight Accent|Accent Link|Unread Badge / Alert|Route Origin Pin)[\s:]+([^\r\n#]*)(#[0-9a-fA-F]{6})') {
                $accentColor = $Matches[2]
            }

            $overrides = @()
            if ($primaryColor) { $overrides += "    --wf-primary: $primaryColor;" }
            if ($bgColor) { $overrides += "    --wf-gray-50: $bgColor;" }
            if ($textColor) { $overrides += "    --wf-gray-800: $textColor; --wf-gray-900: $textColor;" }
            if ($cardColor) { $overrides += "    --wf-card-bg: $cardColor;" }
            if ($accentColor) { $overrides += "    --wf-accent: $accentColor;" }

            if ($overrides.Count -gt 0) {
                $relPath = $designPath.Replace((Get-Location).Path, '').TrimStart('\', '/')
                $appDesignTokens = @"

    /* Micro-App Design Tokens from app-design.md ($appName) */
    /* SSOT: $relPath */
    :root {
$($overrides -join "`n")
    }
"@
            }
        }
    }

    if ($isMobileApp) {
        $html = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>$title - $appName Wireframe</title>
  <style>
$css$appDesignTokens
  </style>
</head>
<body>
  <div class="wf-phone-container">
    <div class="wf-status-bar">
      <span class="wf-status-group">
        <span>VinaPhone 5G</span>
        <svg class="wf-icon" viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><rect x="2" y="14" width="3" height="6" rx="1"/><rect x="7" y="10" width="3" height="10" rx="1"/><rect x="12" y="6" width="3" height="14" rx="1"/><rect x="17" y="2" width="3" height="18" rx="1"/></svg>
      </span>
      <span>23:45</span>
      <span class="wf-battery-capsule">
        <span>42%</span>
        <svg class="wf-icon" viewBox="0 0 24 24" width="20" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="18" height="16" rx="4"/><rect x="3" y="6" width="8" height="12" rx="2" fill="currentColor"/><line x1="21" y1="10" x2="21" y2="14" stroke-linecap="round"/></svg>
      </span>
    </div>
    <header class="wf-app-header">
      <a href="#" class="wf-back-btn">&larr; Trang ch&#7911;</a>
      <span class="wf-app-title">$appName</span>
      <span style="min-width: 44px; text-align: right; font-size: 1.125rem;">&hellip;</span>
    </header>
    <main class="wf-phone-body">
      <header class="wf-page-header">
        <h1 class="wf-page-title">$title</h1>
        <p class="wf-page-desc">$description</p>
      </header>
      <section class="wf-card">
        <h2 class="wf-card-header">Main Section</h2>
        <p>Placeholder content. Add form controls, lists, or cards here.</p>
      </section>
    </main>
    <div class="wf-home-indicator"></div>
  </div>
</body>
</html>
"@ + "`n"
    } else {
        $html = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>$title - Wireframe</title>
  <style>
$css
  </style>
</head>
<body>
  <header class="wf-navbar">
    <div class="wf-logo">AppLogo</div>
    <nav>
      <ul class="wf-nav-links">
        <li><a href="#" class="active">Overview</a></li>
        <li><a href="#">Details</a></li>
        <li><a href="#">Settings</a></li>
      </ul>
    </nav>
  </header>
  <main class="wf-container">
    <header class="wf-page-header">
      <h1 class="wf-page-title">$title</h1>
      <p class="wf-page-desc">$description</p>
    </header>
    <section class="wf-card">
      <h2 class="wf-card-header">Main Section</h2>
      <p>Placeholder content. Add form controls, tables, or cards here.</p>
    </section>
  </main>
</body>
</html>
"@ + "`n"
    }

    [void](Write-BaText $output $html)
    [Console]::WriteLine("Scaffolded HTML wireframe at: $output")
    exit 0
} catch { [Console]::Error.WriteLine($_.Exception.Message); exit 2 }

