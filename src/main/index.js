import { app, BrowserWindow, session, ipcMain } from 'electron'
const path = require('path')

let index = 0

// const { session } = require('electron')

// Modify the user agent for all requests to the following urls.

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9083`
  : `file://${__dirname}/index.html`

function createWindow () {
  ipcMain.on('download', (event, arg) => {
    mainWindow.webContents.downloadURL(arg)
  })

  const filter = {
    urls: ['http://v26-web.douyinvod.com/*']
  }
  
  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    details.requestHeaders['Referer'] = 'v26-web.douyinvod.com'
    callback({ requestHeaders: details.requestHeaders })
  })
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
    webSecurity: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  mainWindow.loadURL(winURL
    // userAgent: 'Chrome',
    // httpReferrer: 'http://v26-web.douyinvod.com/aeb4b7a1b7608b9530a701416d7ef3b0/61371634/video/tos/cn/tos-cn-ve-15/9c0b41b6c6774084a6d9301aa0074dd3/?a=6383&br=1391&bt=1391&cd=0|0|0&ch=11&cr=0&cs=0&cv=1&dr=0&ds=4&er=&ft=~MeSY~88-oU-DYlnh7TQPqeUfTusNt9NWy&l=202109071429410101351541595806E203&lr=all&mime_type=video_mp4&net=0&pl=0&qs=0&rc=amxmdXlwc244eTMzZGkzM0ApNDRlOWY4NztmNzpkNzxkN2dwcF5vaF5vamZfLS0wLTBzc2IwNS4tYV82LV4zNV42Mi06Yw==&vl=&vr='
  )

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    // Set the save path, making Electron not to prompt a save dialog.
    // item.setSavePath(path.resolve(__dirname, '../../download/test.mp4'))
    item.setSavePath(path.resolve(app.getPath('downloads'), `./test${index++}.mp4`))
  
    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        console.log('Download is interrupted but can be resumed')
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Download is paused')
        } else {
          console.log(`Received bytes: ${item.getReceivedBytes()}`)
        }
      }
      console.log(app.getPath('downloads'))
    })
    item.once('done', (event, state) => {
      if (state === 'completed') {
        console.log('Download successfully')
      } else {
        console.log(`Download failed: ${state}`)
      }
    })
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
