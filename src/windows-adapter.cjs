'use strict';
const {runPowerShell,psQuote}=require('./powershell.cjs');
const registryScript=`
$p = ConvertFrom-Json -InputObject $payload
$sub = $p.path.Substring(6)
$key = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey($sub, $false)
function Read-RegistryValue {
 if ($null -eq $key -or $key.GetValueNames() -notcontains $p.key) { return @{exists=$false;kind=$null;value=$null} }
 $kind = $key.GetValueKind($p.key).ToString()
 $value = $key.GetValue($p.key,$null,[Microsoft.Win32.RegistryValueOptions]::DoNotExpandEnvironmentNames)
 if ($kind -eq 'QWord') { $value = [string]$value }
 if ($kind -eq 'Binary' -or $kind -eq 'MultiString') { $value = @($value) }
 return @{exists=$true;kind=$kind;value=$value}
}
try {
 if ($p.operation -eq 'read') { $result = Read-RegistryValue }
 else {
  if ($null -ne $key) { $key.Dispose(); $key = $null }
  if ($p.operation -eq 'remove') {
   $key = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey($sub,$true)
   if ($null -ne $key) { $key.DeleteValue($p.key,$false) }
  } elseif ($p.operation -eq 'write') {
   $key = [Microsoft.Win32.Registry]::CurrentUser.CreateSubKey($sub)
   $value = $p.state.value
   switch ($p.state.kind) {
    'DWord' { $value = [int]$value }
    'QWord' { $value = [long]$value }
    'Binary' { $value = [byte[]]$value }
    'MultiString' { $value = [string[]]$value }
    'String' { $value = [string]$value }
    'ExpandString' { $value = [string]$value }
    default { throw 'Unsupported registry value type; original value was not changed.' }
   }
   $valueKind = [Microsoft.Win32.RegistryValueKind]$p.state.kind
   $key.SetValue($p.key,$value,$valueKind)
  } else { throw 'Unsupported registry operation' }
  $result = Read-RegistryValue
 }
 ConvertTo-Json -InputObject $result -Depth 8 -Compress
} finally { if ($null -ne $key) { $key.Dispose() } }
`;
class WindowsAdapter {
 constructor(run=runPowerShell){this.run=run;}
 async registry(t,operation,state){
  if(!t.path?.startsWith('HKCU:\\')||!t.key||t.path.includes('\0')||t.key.includes('\0'))throw new Error('Only allowlisted current-user registry settings are supported.');
  return JSON.parse(await this.run(`$payload=${psQuote(JSON.stringify({path:t.path,key:t.key,operation,state}))}\n${registryScript}`));
 }
 async readMany(settings){
  const registry=settings.filter(t=>t.action==='registry');
  for(const t of registry)if(!t.path?.startsWith('HKCU:\\')||!t.key)throw new Error('Invalid registry setting');
  const payload=registry.map(t=>({id:t.id,path:t.path,key:t.key,operation:'read'}));
  const script=`$items=ConvertFrom-Json -InputObject ${psQuote(JSON.stringify(payload))}
$results=@(foreach($item in $items){try{$payload=ConvertTo-Json -InputObject $item -Compress; $state=(& { ${registryScript} } | ConvertFrom-Json); @{id=$item.id;state=$state}}catch{@{id=$item.id;error=$_.Exception.Message}}}); ConvertTo-Json -InputObject $results -Depth 10 -Compress`;
  const results=registry.length?JSON.parse(await this.run(script)):[];
  const power=settings.filter(t=>t.action==='power');
  if(power.length){try{const state=await this.read(power[0]);for(const t of power)results.push({id:t.id,state});}catch(e){for(const t of power)results.push({id:t.id,error:e.message});}}
  return results;
 }
 async read(t){if(t.action==='power') {const output=await this.run('$p = & powercfg.exe /getactivescheme; if ($LASTEXITCODE -ne 0) { throw "Cannot read power plan" }; $p');const guid=output.match(/[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}/i)?.[0];if(!guid)throw new Error('Windows did not return a power plan GUID');return {exists:true,kind:'PowerPlan',value:guid.toLowerCase()};}return this.registry(t,'read');}
 async write(t,state){if(t.action==='power'){if(!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(state.value))throw new Error('Invalid power plan');await this.run(`& powercfg.exe /setactive ${psQuote(state.value)}; if ($LASTEXITCODE -ne 0) { throw 'Power plan unavailable on this PC' }`);return this.read(t);}return this.registry(t,'write',state);}
 async remove(t){if(t.action==='power')throw new Error('A power plan cannot be removed by this app');return this.registry(t,'remove');}
}
module.exports={WindowsAdapter,registryScript};
