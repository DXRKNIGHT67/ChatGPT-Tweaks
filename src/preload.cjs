'use strict';
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('agent',{
 scan:()=>ipcRenderer.invoke('scan'),metrics:()=>ipcRenderer.invoke('metrics'),catalog:()=>ipcRenderer.invoke('catalog'),
 profile:mode=>ipcRenderer.invoke('profile',mode),apply:ids=>ipcRenderer.invoke('apply',ids),restore:()=>ipcRenderer.invoke('restore'),
 network:()=>ipcRenderer.invoke('network'),settings:section=>ipcRenderer.invoke('settings',section),report:()=>ipcRenderer.invoke('report'),backupFolder:()=>ipcRenderer.invoke('backup-folder')
});
