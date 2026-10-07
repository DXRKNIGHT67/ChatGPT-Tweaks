const tweaks=[];
function reg(id,name,category,path,key,value,description,recommended=false){tweaks.push({id,name,category,path,key,value,description,recommended,type:'DWord',restart:true});}
const cv='HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion';
reg('game-mode','Enable Windows Game Mode','Gaming',cv+'\\GameBar','AutoGameModeEnabled',1,'Lets Windows prioritize game workloads.',true);
reg('capture','Disable background game recording','Gaming',cv+'\\GameDVR','AppCaptureEnabled',0,'Stops Windows gameplay capture. Recording features will be unavailable.',true);
reg('dvr','Disable Game DVR','Gaming','HKCU:\\System\\GameConfigStore','GameDVR_Enabled',0,'Disables Game DVR recording.',true);
reg('mouse','Disable mouse acceleration','Gaming','HKCU:\\Control Panel\\Mouse','MouseSpeed','0','Uses consistent pointer movement. Games with raw input may be unaffected.',true);
reg('mouse1','Remove pointer acceleration threshold 1','Gaming','HKCU:\\Control Panel\\Mouse','MouseThreshold1','0','Complements disabling pointer acceleration.',true);
reg('mouse2','Remove pointer acceleration threshold 2','Gaming','HKCU:\\Control Panel\\Mouse','MouseThreshold2','0','Complements disabling pointer acceleration.',true);
reg('transparency','Disable interface transparency','Windows',cv+'\\Themes\\Personalize','EnableTransparency',0,'Reduces desktop visual effects.',true);
reg('animations','Disable taskbar animations','Windows',cv+'\\Explorer\\Advanced','TaskbarAnimations',0,'Reduces taskbar animation work.',true);
reg('widgets','Hide taskbar widgets','Debloat',cv+'\\Explorer\\Advanced','TaskbarDa',0,'Hides the widgets entry; does not uninstall the component.');
reg('chat','Hide taskbar chat','Debloat',cv+'\\Explorer\\Advanced','TaskbarMn',0,'Hides the Windows 11 chat entry where supported.');
reg('taskview','Hide Task View button','Windows',cv+'\\Explorer\\Advanced','ShowTaskViewButton',0,'Simplifies the taskbar.');
reg('search','Hide taskbar search box','Windows',cv+'\\Search','SearchboxTaskbarMode',0,'Hides the search box; Windows search remains available.');
reg('startup','Disable startup app notifications','Windows',cv+'\\Explorer\\Advanced','StartupNotify',0,'Reduces startup app notifications where supported.');
reg('shake','Disable Aero Shake','Windows',cv+'\\Explorer\\Advanced','DisallowShaking',1,'Prevents shaking a window from minimizing others.');
reg('snap','Disable snap assist suggestions','Windows',cv+'\\Explorer\\Advanced','SnapAssist',0,'Stops snap suggestions where supported.');
reg('tracking','Disable app launch tracking','Privacy',cv+'\\Explorer\\Advanced','Start_TrackProgs',0,'Stops Start menu app launch tracking.');
reg('recent','Disable recent document tracking','Privacy',cv+'\\Explorer\\Advanced','Start_TrackDocs',0,'Removes recent document lists.');
reg('sync-notice','Hide Explorer provider notifications','Debloat',cv+'\\Explorer\\Advanced','ShowSyncProviderNotifications',0,'Hides promotional provider notifications in Explorer.',true);
reg('ads','Disable advertising ID','Privacy',cv+'\\AdvertisingInfo','Enabled',0,'Disables the current user advertising identifier.',true);
reg('tailored','Disable tailored diagnostic experiences','Privacy',cv+'\\Privacy','TailoredExperiencesWithDiagnosticDataEnabled',0,'Stops personalized suggestions from diagnostic data.',true);
reg('input','Disable input personalization','Privacy','HKCU:\\Software\\Microsoft\\Personalization\\Settings','AcceptedPrivacyPolicy',0,'Disables optional input personalization; may affect suggestions.');
reg('ink','Restrict ink collection','Privacy','HKCU:\\Software\\Microsoft\\InputPersonalization','RestrictImplicitInkCollection',1,'Limits handwriting personalization.');
reg('text','Restrict text collection','Privacy','HKCU:\\Software\\Microsoft\\InputPersonalization','RestrictImplicitTextCollection',1,'Limits text personalization.');
reg('contacts','Disable harvested contact personalization','Privacy','HKCU:\\Software\\Microsoft\\InputPersonalization\\TrainedDataStore','HarvestContacts',0,'Stops contacts being used for input personalization.');
reg('feedback','Reduce feedback prompts','Privacy',cv+'\\Siuf\\Rules','NumberOfSIUFInPeriod',0,'Reduces Windows feedback prompts.');
reg('clipboard','Disable clipboard history','Privacy','HKCU:\\Software\\Microsoft\\Clipboard','EnableClipboardHistory',0,'Turns off clipboard history; previously stored entries are not erased.');
reg('clipboard-sync','Disable cross-device clipboard','Privacy','HKCU:\\Software\\Microsoft\\Clipboard','EnableCloudClipboard',0,'Turns off clipboard cloud sync.');
const content=[['ContentDeliveryAllowed','Disable content delivery'],['OemPreInstalledAppsEnabled','Disable OEM app suggestions'],['PreInstalledAppsEnabled','Disable preinstalled app suggestions'],['PreInstalledAppsEverEnabled','Disable future preinstalled app suggestions'],['SilentInstalledAppsEnabled','Disable silent suggested app installs'],['SoftLandingEnabled','Disable Windows tips'],['SystemPaneSuggestionsEnabled','Disable Settings suggestions'],['SubscribedContent-338388Enabled','Disable Start suggestions'],['SubscribedContent-338389Enabled','Disable tips and tricks'],['SubscribedContent-353694Enabled','Disable Settings promotional content'],['SubscribedContent-353696Enabled','Disable additional Settings suggestions'],['SubscribedContent-338393Enabled','Disable suggested notifications'],['SubscribedContent-310093Enabled','Disable welcome content'],['SubscribedContent-338387Enabled','Disable lock screen tips'],['RotatingLockScreenEnabled','Disable rotating lock screen images'],['RotatingLockScreenOverlayEnabled','Disable lock screen promotional overlays']];
content.forEach(([key,name],i)=>reg('content-'+i,name,'Debloat',cv+'\\ContentDeliveryManager',key,0,'Reduces Windows suggested content where supported. This is not an FPS guarantee.',i<7));
reg('welcome','Disable Windows welcome experience','Debloat',cv+'\\UserProfileEngagement','ScoobeSystemSettingEnabled',0,'Stops additional setup suggestions after sign-in.',true);
reg('toast','Disable toast notifications','Windows',cv+'\\PushNotifications','ToastEnabled',0,'Disables app toast notifications; you may miss useful alerts.');
reg('notification-sound','Disable notification sounds','Windows',cv+'\\Notifications\\Settings','NOC_GLOBAL_SETTING_ALLOW_NOTIFICATION_SOUND',0,'Keeps notifications quiet.');
reg('lock-notifications','Disable lock screen notifications','Privacy',cv+'\\Notifications\\Settings','NOC_GLOBAL_SETTING_ALLOW_TOASTS_ABOVE_LOCK',0,'Hides toast notifications above the lock screen.');
reg('lock-reminders','Disable lock screen reminders','Privacy',cv+'\\Notifications\\Settings','NOC_GLOBAL_SETTING_ALLOW_CRITICAL_TOASTS_ABOVE_LOCK',0,'Hides reminder notifications on the lock screen.');
reg('edge-startup','Disable Edge startup boost','Debloat','HKCU:\\Software\\Policies\\Microsoft\\Edge','StartupBoostEnabled',0,'Prevents Edge startup preloading where the policy is supported.',true);
reg('edge-background','Disable Edge background mode','Debloat','HKCU:\\Software\\Policies\\Microsoft\\Edge','BackgroundModeEnabled',0,'Stops Edge background apps after the browser closes.',true);
reg('edge-first','Disable Edge first run experience','Debloat','HKCU:\\Software\\Policies\\Microsoft\\Edge','HideFirstRunExperience',1,'Hides Edge first run prompts.');
reg('edge-personalization','Disable Edge personalized ads','Privacy','HKCU:\\Software\\Policies\\Microsoft\\Edge','PersonalizationReportingEnabled',0,'Disables Edge personalization reporting.');
reg('edge-metrics','Disable optional Edge metrics','Privacy','HKCU:\\Software\\Policies\\Microsoft\\Edge','MetricsReportingEnabled',0,'Disables optional browser metrics where supported.');
reg('edge-shopping','Disable Edge shopping assistant','Debloat','HKCU:\\Software\\Policies\\Microsoft\\Edge','EdgeShoppingAssistantEnabled',0,'Disables shopping suggestions.');
reg('edge-recommendations','Disable Edge feature recommendations','Debloat','HKCU:\\Software\\Policies\\Microsoft\\Edge','ShowRecommendationsEnabled',0,'Hides browser feature recommendations.');
reg('office-telemetry','Disable Office client telemetry','Privacy','HKCU:\\Software\\Policies\\Microsoft\\Office\\16.0\\Common','sendcustomerdata',0,'Opts out of Office customer experience data where supported.');
reg('office-feedback','Disable Office feedback prompts','Privacy','HKCU:\\Software\\Policies\\Microsoft\\Office\\16.0\\Common\\Feedback','enabled',0,'Disables Office feedback prompts where supported.');
reg('accessibility','Disable Sticky Keys hotkey','Gaming','HKCU:\\Control Panel\\Accessibility\\StickyKeys','Flags','506','Prevents Shift presses from triggering Sticky Keys. Changes accessibility behavior.');
reg('filter-keys','Disable Filter Keys hotkey','Gaming','HKCU:\\Control Panel\\Accessibility\\Keyboard Response','Flags','122','Prevents holding Shift from enabling Filter Keys. Changes accessibility behavior.');
reg('toggle-keys','Disable Toggle Keys hotkey','Gaming','HKCU:\\Control Panel\\Accessibility\\ToggleKeys','Flags','58','Disables the Toggle Keys hotkey. Changes accessibility behavior.');
for(const t of tweaks) if(typeof t.value==='string') t.type='String';

reg('game-mode-auto','Allow automatic Game Mode','Gaming',cv+'\\GameBar','AllowAutoGameMode',1,'Allows Windows to recognize supported games. Restart the game afterward.',true);
reg('record-history','Disable historical gameplay capture','Gaming',cv+'\\GameDVR','HistoricalCaptureEnabled',0,'Stops keeping recent gameplay ready for replay. You lose retrospective clips.',true);
reg('capture-audio','Disable game-capture audio recording','Gaming',cv+'\\GameDVR','AudioCaptureEnabled',0,'Stops Windows capture from recording audio. Does not affect game audio playback.');
reg('capture-microphone','Disable capture microphone recording','Gaming',cv+'\\GameDVR','MicrophoneCaptureEnabled',0,'Stops Windows capture from recording your microphone. Does not affect voice chat.');
reg('capture-cursor','Disable capture cursor recording','Gaming',cv+'\\GameDVR','CursorCaptureEnabled',0,'Hides the cursor in Windows gameplay captures. Does not change game input.');
reg('capture-broadcast','Disable Windows capture broadcasting','Gaming',cv+'\\GameDVR','BroadcastEnabled',0,'Turns off the Windows game-capture broadcast setting on supported builds.');
for(const [id,name,guid,description] of [
 ['power-balanced','Use Balanced power plan','381b4222-f694-41f0-9685-ff5bb260df2e','Good starting point for modern Ryzen desktops. Lets the CPU boost while reducing idle power. Your original plan is backed up.'],
 ['power-high','Use High performance power plan','8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c','Optional benchmark candidate for desktops with sufficient cooling. Raises idle power and heat; may not improve FPS. Only shown if Windows provides this plan.']
]) tweaks.push({id,name,category:'Power',action:'power',value:guid,description,exclusive:'Power plan',recommended:id==='power-balanced',restart:false});
for(const t of tweaks){
 t.action??='registry';t.minBuild??=10240;t.impact=t.category==='Gaming'?'Gaming feature':t.category==='Power'?'Power / heat':t.category==='Privacy'?'Privacy':'Background / interface';
 t.caution=t.category==='Privacy'?'Privacy setting; no direct FPS claim.':t.category==='Power'?'Benchmark after changing.':t.category==='Debloat'?'May hide or disable a feature you use.':'Review the feature tradeoff.';
 if(['mouse','mouse1','mouse2'].includes(t.id))t.recommended=false;
 if(['widgets','chat'].includes(t.id))t.minBuild=22000;
 if(t.id==='chat')t.maxBuild=22631;
 if(t.id.startsWith('edge-'))t.requires='edge';
 if(t.id.startsWith('office-'))t.requires='office';
}
function available(t,scan){
 if(!scan||scan.platform!=='win32'||!scan.scanComplete)return {available:false,reason:'Complete a successful Windows hardware scan first.'};
 if(Number(scan.build)<t.minBuild || (t.maxBuild&&Number(scan.build)>t.maxBuild))return {available:false,reason:'Not applicable to this Windows build.'};
 if(t.requires&&!scan.software?.[t.requires])return {available:false,reason:'Required application was not detected.'};
 if(t.action==='power'&&!scan.powerPlans?.some(p=>p.guid===t.value))return {available:false,reason:'Windows does not provide this power plan.'};
 if(t.id==='power-high'&&!scan.desktop)return {available:false,reason:'High performance is opt-in for desktop PCs only.'};
 return {available:true,reason:''};
}
function recommendedIds(scan,mode='recommended'){
 return tweaks.filter(t=>t.recommended&&available(t,scan).available&&(mode!=='performance'||['Gaming','Power'].includes(t.category)||['edge-background','edge-startup'].includes(t.id))).map(t=>t.id);
}
function profile(scan,mode='recommended'){
 const ids=recommendedIds(scan,mode);const tips=[];
 if(!scan?.scanComplete||scan.platform!=='win32')return {ids:[],tips:['A complete Windows scan is required before making recommendations.']};
 if(/Ryzen/i.test(scan.cpu))tips.push('Ryzen: start with Balanced power and current AMD chipset drivers.');
 if(scan.gpu.some(g=>/NVIDIA/i.test(g.name)))tips.push('NVIDIA: enable Reflex in supported games; test DLSS and a stable frame cap.');
 if(scan.gpu.some(g=>/5060 Ti/i.test(g.name)))tips.push('RTX 5060 Ti: monitor VRAM usage in your games; reduce textures if the 8 GB model is saturated.');
 if(scan.ram>=24*2**30)tips.push('32 GB class memory: retain the system-managed page file; do not use RAM cleaners.');
 if(scan.disks.some(d=>d.total>0&&d.free/d.total<0.15))tips.push('A drive has less than 15% free space. Review storage before adding more games.');
 if(scan.network.some(n=>/Wi-Fi|Wireless|802\.11/i.test(n.description||'')))tips.push('Wireless connection detected: Ethernet can reduce local jitter and interference.');
 if(scan.hags!==undefined)tips.push('Hardware GPU scheduling is a per-game benchmark choice; the app leaves it unchanged.');
 return {ids,tips};
}
module.exports={tweaks,recommendedIds,available,profile};
