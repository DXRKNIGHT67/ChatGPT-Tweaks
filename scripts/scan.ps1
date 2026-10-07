$cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
$system = Get-CimInstance Win32_ComputerSystem
$os = Get-CimInstance Win32_OperatingSystem
$warnings = @()
$gpu = @(Get-CimInstance Win32_VideoController | ForEach-Object { @{name=$_.Name; driver=$_.DriverVersion; status=$_.Status} })
$disks = @(Get-CimInstance Win32_LogicalDisk -Filter 'DriveType=3' | ForEach-Object { @{name=$_.DeviceID; total=[double]$_.Size; free=[double]$_.FreeSpace; filesystem=$_.FileSystem} })
$network = @()
try { $network = @(Get-NetAdapter -Physical -ErrorAction Stop | Where-Object Status -eq 'Up' | ForEach-Object { @{name=$_.Name; description=$_.InterfaceDescription; linkSpeed=$_.LinkSpeed} }) }
catch { $warnings += 'Network adapter details unavailable; the CPU/GPU/RAM scan still completed.' }
$powerPlans = @()
$powerOutput = & powercfg.exe /list
if ($LASTEXITCODE -eq 0) { foreach ($line in $powerOutput) { if ($line -match '([a-fA-F0-9]{8}-(?:[a-fA-F0-9]{4}-){3}[a-fA-F0-9]{12})\s+\((.+)\)') { $powerPlans += @{guid=$Matches[1].ToLower(); name=$Matches[2]; active=$line.Contains('*')} } } }
else { $warnings += 'Power plan information unavailable.' }
$office = (Test-Path 'HKLM:\Software\Microsoft\Office') -or (Test-Path 'HKLM:\Software\WOW6432Node\Microsoft\Office')
$edge = (Test-Path "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe") -or (Test-Path "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe")
$hags = $null
try { $hags = Get-ItemPropertyValue -LiteralPath 'HKLM:\SYSTEM\CurrentControlSet\Control\GraphicsDrivers' -Name HwSchMode -ErrorAction Stop } catch { }
$result = @{platform='win32'; scanComplete=$true; scannedAt=[DateTime]::UtcNow.ToString('o'); cpu=$cpu.Name; cores=[int]$cpu.NumberOfCores; logicalCores=[int]$cpu.NumberOfLogicalProcessors; ram=[double]$system.TotalPhysicalMemory; gpu=$gpu; disks=$disks; os=$os.Caption; build=[string]$os.BuildNumber; desktop=($system.PCSystemType -eq 1); cpuLoad=[int]$cpu.LoadPercentage; ramUsed=[double]($os.TotalVisibleMemorySize-$os.FreePhysicalMemory)*1024; network=$network; powerPlans=$powerPlans; software=@{office=$office;edge=$edge}; warnings=$warnings; hags=$hags}
ConvertTo-Json -InputObject $result -Depth 6 -Compress
