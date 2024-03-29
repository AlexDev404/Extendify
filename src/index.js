const { app, BrowserWindow, ipcMain } = require("electron");
const ipc = ipcMain;
const remoteMain = require("@electron/remote/main");
const path = require("path");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: "hiddenInset",
    hasShadow: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      // devTools: true,
      // preload: path.join(__dirname, "appFunctions.js"),
    },
  });
  // Initialize Remote
  remoteMain.initialize();
  remoteMain.enable(mainWindow.webContents);
  
  // and load the index.html of the app.
  win = mainWindow;
  win.loadFile(path.join(__dirname, "index.html"));

  // Open the DevTools.
  win.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipc.on("reqPageSwitch", (event, data) => {
  console.log("Page Switch Requested.");
  win.loadFile(path.join(__dirname, data));
});

let currentState;

ipc.on("sendState", (event, data) => {
  currentState = data;
  console.log(`currentState = {artist: ${currentState.artist}, album: ${currentState.album}}\n`);
});

// Send current state (package#)
// If nothing is saved it will send back nothing at all

ipc.on("reqState", (event, data) => {
  event.reply("sendState", currentState);
});
