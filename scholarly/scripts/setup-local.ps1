$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$dockerDesktopPath = Join-Path $env:LOCALAPPDATA "Programs\DockerDesktop\Docker Desktop.exe"
$envFilePath = Join-Path $repoRoot ".env.local"

function Get-StatusValue {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$StatusLines,
    [Parameter(Mandatory = $true)]
    [string]$Name
  )

  $line = $StatusLines | Where-Object { $_ -like "$Name=*" } | Select-Object -First 1
  if (-not $line) {
    throw "Could not read $Name from Supabase status output."
  }

  $value = ($line -split "=", 2)[1].Trim()
  if ($value.StartsWith('"') -and $value.EndsWith('"')) {
    $value = $value.Substring(1, $value.Length - 2)
  }

  return $value
}

function Write-LocalEnv {
  $statusLines = & npx.cmd supabase status -o env
  if ($LASTEXITCODE -ne 0) {
    throw "Could not read local Supabase status."
  }

  $apiUrl = Get-StatusValue -StatusLines $statusLines -Name "API_URL"
  $anonKey = Get-StatusValue -StatusLines $statusLines -Name "ANON_KEY"
  $serviceRoleKey = Get-StatusValue -StatusLines $statusLines -Name "SERVICE_ROLE_KEY"

  $envContents = @"
NEXT_PUBLIC_SUPABASE_URL=$apiUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey
SUPABASE_SERVICE_ROLE_KEY=$serviceRoleKey
NEXT_PUBLIC_APP_URL=http://localhost:3000
"@

  Set-Content -LiteralPath $envFilePath -Value $envContents
}

function Invoke-Native {
  param(
    [Parameter(Mandatory = $true)]
    [string]$FilePath,
    [string[]]$ArgumentList = @()
  )

  & $FilePath @ArgumentList
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed: $FilePath $($ArgumentList -join ' ')"
  }
}

function Start-DockerDesktopIfPresent {
  if (Test-Path -LiteralPath $dockerDesktopPath) {
    $running = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
    if (-not $running) {
      Start-Process -FilePath $dockerDesktopPath
      Start-Sleep -Seconds 5
    }
  }
}

function Test-DockerReady {
  $previousPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    $null = & docker ps *> $null
    return ($LASTEXITCODE -eq 0)
  } finally {
    $ErrorActionPreference = $previousPreference
  }
}

Start-DockerDesktopIfPresent

if (-not (Test-DockerReady)) {
  $wslMissing = $false

  $previousPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $null = & wsl --status *> $null
  $ErrorActionPreference = $previousPreference
  if ($LASTEXITCODE -ne 0) {
    $wslMissing = $true
  }

  $detail = if ($wslMissing) {
    "WSL is not installed on this machine yet."
  } else {
    "Docker Desktop is installed, but its Linux container engine is not ready."
  }

  throw ($detail + @"

Finish the Windows prerequisites in an elevated PowerShell, then restart Windows:

dism.exe /online /Enable-Feature /FeatureName:Microsoft-Windows-Subsystem-Linux /All /NoRestart
dism.exe /online /Enable-Feature /FeatureName:VirtualMachinePlatform /All /NoRestart

After the restart:
1. Open Docker Desktop and wait for the engine to finish starting.
2. Re-run npm.cmd run setup:local
3. Start the app with npm.cmd run dev:local
"@)
}

Invoke-Native -FilePath "npx.cmd" -ArgumentList @("supabase", "start")
Write-LocalEnv
Invoke-Native -FilePath "npx.cmd" -ArgumentList @("supabase", "db", "reset", "--local", "--yes")

Write-Host ""
Write-Host "Local Supabase is ready."
Write-Host "DBeaver connection:"
Write-Host "  Host: 127.0.0.1"
Write-Host "  Port: 54322"
Write-Host "  Database: postgres"
Write-Host "  Username: postgres"
Write-Host "  Password: postgres"
Write-Host "  SSL: Disable"
Write-Host ""
Write-Host "Start the website with:"
Write-Host "  npm.cmd run dev:local"
