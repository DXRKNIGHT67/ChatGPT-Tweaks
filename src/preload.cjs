const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('agent',{scan:()=>ipcRenderer.invoke('scan'),catalog:()=>ipcRenderer.invoke('catalog'),apply:ids=>ipcRenderer.invoke('apply',ids),restore:()=>ipcRenderer.invoke('restore'),network:()=>ipcRenderer.invoke('network'),settings:s=>ipcRenderer.invoke('settings',s)});
