# Read-only local troubleshooting. Does not change security, registry, or app settings.
# Run in Windows PowerShell: & '.\diagnose-windows.ps1'
param([string]$ExecutablePath)
$ErrorActionPreference = 'Stop'
function Read-Check([scriptblock]$Action) {
    try { & $Action } catch { @{ unavailable = $_.Exception.Message } }
}
$report = [ordered]@{
    generatedAt = [DateTime]::UtcNow.ToString('o')
    os = Read-Check { Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version, BuildNumber, OSArchitecture }
    powerShell = $PSVersionTable.PSVersion.ToString()
    smartAppControl = Read-Check {
        $value = (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\CI\Policy' -Name VerifiedAndReputablePolicyState).VerifiedAndReputablePolicyState
        @{ value = $value; meaning = (@{0='Off';1='Enforced';2='Evaluation'})[[int]$value] }
    }
    defender = Read-Check { Get-MpComputerStatus | Select-Object AntivirusEnabled, RealTimeProtectionEnabled, AMProductVersion }
    agentDetections = Read-Check {
        @(Get-MpThreatDetection | Where-Object { ($_.Resources -join ' ') -match 'Agent.?Tweaks' } |
            Select-Object ThreatID, InitialDetectionTime, ActionSuccess)
    }
    appLog = Read-Check {
        $log = Join-Path $env:APPDATA 'agent-tweaks\startup.log'
        if (Test-Path -LiteralPath $log) { @(Get-Content -LiteralPath $log -Tail 15) } else { 'No startup log. Windows may have blocked execution before the app started, or this is an older build.' }
    }
}
if ($ExecutablePath) {
    $report.executable = Read-Check {
        $file = Get-Item -LiteralPath $ExecutablePath
        $signature = Get-AuthenticodeSignature -LiteralPath $file.FullName
        @{ name=$file.Name; bytes=$file.Length; sha256=(Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash; signature=[string]$signature.Status }
    }
}
$report | ConvertTo-Json -Depth 8
