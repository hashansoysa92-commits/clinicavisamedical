$ErrorActionPreference = 'Stop'
Stop-ScheduledTask -TaskName 'ClinicaVisaMedical'
Write-Host 'Server task stopped. Use Start-ScheduledTask ClinicaVisaMedical to start again.'
