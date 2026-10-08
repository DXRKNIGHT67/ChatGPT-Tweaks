# Read-only local troubleshooting. Does not change security, registry, or app settings.
# Run in Windows PowerShell: & '.\diagnose-windows.ps1'
param([string]$ExecutablePath)
$ErrorActionPreference = 'Stop'
function Read-Check([scriptblock]$Action) {
    $job = $null
    try {
        $boundedAction = [scriptblock]::Create("param(`$ExecutablePath)`n" + $Action.ToString())
        $job = Start-Job -ScriptBlock $boundedAction -ArgumentList $ExecutablePath
        if (-not (Wait-Job -Job $job -Timeout 15)) {
            return @{ unavailable = 'Diagnostic query timed out after 15 seconds.' }
        }
        Receive-Job -Job $job -ErrorAction Stop
    } catch { @{ unavailable = $_.Exception.Message } }
    finally { if ($null -ne $job) { Remove-Job -Job $job -Force -ErrorAction SilentlyContinue } }
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
