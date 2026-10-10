$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
Set-Location $projectRoot
$nodeExecutable = (Get-Command node -ErrorAction Stop).Source
$nodeMajor = [int]((& $nodeExecutable --version).TrimStart('v').Split('.')[0])
if ($nodeMajor -lt 22) { throw 'Install Node.js 22 or newer from nodejs.org first.' }
if (!(Test-Path '.env')) { throw 'Copy .env.example to .env and configure it privately first.' }
# One supervisor. The scheduled task uses IgnoreNew to prevent concurrent instances.
while ($true) {
    & $nodeExecutable --env-file=.env server/app.cjs
    Start-Sleep -Seconds 5
}
