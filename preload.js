const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    runProgram: () => ipcRenderer.send('run-program'),
    copyFile: (source) => ipcRenderer.send('copy-file', { source }),
    closeProgram: () => ipcRenderer.send('close-program'),
});