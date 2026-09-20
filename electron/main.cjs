// Freely as a desktop app (Windows · macOS · Linux). It loads the very same build the website uses,
// from inside the app, so it works offline-ish and updates when you rebuild.
//
// Electron is NOT a dependency of the website — installing it would slow every Cloudflare deploy and
// download a browser on their build machine. Install it only when you want to build the desktop app:
//     npm install --save-dev electron electron-builder
//     npm run desktop         (runs it)
//     npm run desktop:build   (makes the installer)

const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

const startUrl = path.join(__dirname, "..", "dist", "index.html");

function createWindow() {
  const win = new BrowserWindow({
    width: 1180,
    height: 800,
    minWidth: 380,                 // the phone layout still has to fit — that's the whole point of it
    minHeight: 480,
    backgroundColor: "#0c0e16",
    title: "Freely",
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });
  win.loadFile(startUrl);
  // A link to somewhere else opens in the real browser, not inside the app.
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
  win.webContents.on("will-navigate", (e, url) => {
    if (!url.startsWith("file://")) { e.preventDefault(); shell.openExternal(url); }
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
