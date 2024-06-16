const { app, BrowserWindow, nativeTheme, ipcMain } = require('electron');
const path = require("path");
const { execFile } = require('child_process');
const fs = require('fs-extra');
const settings = require("./Settings/settings.json")

const createWindow = () => {
  const win = new BrowserWindow({
    width: 625,
    height: 288,
    resizable: settings.debug,
    icon: path.join(__dirname, 'img/maintenance.png'),
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        enableRemoteModule: false
      }
  });
  win.setMenuBarVisibility(false);
  win.setTitle("Утилита СКУД");
  win.loadFile('index.html');
};

nativeTheme.themeSource = 'light';

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') 
    app.quit();
});

ipcMain.on('run-program', () => {
  if(settings.debug) {
    programPath = settings.D_programPath
  } else { programPath = settings.programPath }

  execFile(programPath, (error, stdout, stderr) => {
    if (error) {
      console.error(`Program start error: ${error}`);
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
      return;
    }
  });
});

ipcMain.on('copy-file', async (event, { source }) => {
    if(settings.debug) {
      destFileCopy = settings.D_destFilePath
    } else { destFileCopy = settings.destFilePath }

    await fs.copy(source, destFileCopy);
});

ipcMain.on('close-program', async () => {
  if(settings.debug) {
    destFileDelete = settings.D_destFilePath
  } else { destFileDelete = settings.destFilePath }
  
  await fs.remove(destFileDelete);
  app.quit();
});