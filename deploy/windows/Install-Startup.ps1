# Run from an Administrator PowerShell after configuring .env.
$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($identity)
if (!$principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) { throw 'Open PowerShell as Administrator.' }
$nodeExecutable = (Get-Command node -ErrorAction Stop).Source
if (![IO.Path]::IsPathRooted($nodeExecutable) -or $nodeExecutable.StartsWith($env:USERPROFILE, [StringComparison]::OrdinalIgnoreCase)) { throw 'Install Node.js for all users in Program Files.' }
if (!(Test-Path (Join-Path $projectRoot '.env'))) { throw 'Configure the private .env file first.' }
$startupScript = Join-Path $PSScriptRoot 'Start-Server.ps1'
$action = New-ScheduledTaskAction -Execute "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -Argument "-NoProfile -File `"$startupScript`"" -WorkingDirectory $projectRoot
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit ([TimeSpan]::Zero) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName 'ClinicaVisaMedical' -Action $action -Trigger $trigger -Settings $settings -User 'SYSTEM' -RunLevel Highest -Force | Out-Null
Start-ScheduledTask -TaskName 'ClinicaVisaMedical'
Write-Host 'Startup task installed. Verify http://localhost:3000/healthz before connecting HTTPS.'
