$ErrorActionPreference='Stop'
$cpu=Get-CimInstance Win32_Processor | Select-Object -First 1
$system=Get-CimInstance Win32_ComputerSystem
$gpu=@(Get-CimInstance Win32_VideoController | ForEach-Object { @{name=$_.Name;driver=$_.DriverVersion} })
$disks=@(Get-CimInstance Win32_LogicalDisk -Filter 'DriveType=3' | ForEach-Object { @{name=$_.DeviceID;total=[double]$_.Size;free=[double]$_.FreeSpace} })
$os=Get-CimInstance Win32_OperatingSystem
@{platform='win32';cpu=$cpu.Name;cores=$cpu.NumberOfCores;ram=[double]$system.TotalPhysicalMemory;gpu=$gpu;disks=$disks;os=$os.Caption;build=$os.BuildNumber;desktop=($system.PCSystemType -eq 1);cpuLoad=$cpu.LoadPercentage;ramUsed=[double]($os.TotalVisibleMemorySize-$os.FreePhysicalMemory)*1024;network=@(Get-NetAdapter -Physical | Where-Object Status -eq 'Up' | Select-Object Name,LinkSpeed)} | ConvertTo-Json -Depth 5 -Compress
