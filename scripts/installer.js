// Copied from Electron API Demos installer script

const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
  .then(createWindowsInstaller)
  .catch((error) => {
    console.error(error.message || error)
    process.exit(1)
  })

function getInstallerConfig () {
  const rootPath = path.join(__dirname, '..')
  const outPath = path.join(rootPath, 'out')

  return Promise.resolve({
    appDirectory: path.join(outPath, 'overcast-win32-ia32'),
    exe: 'Overcast.exe',
    noMsi: true,
    outputDirectory: path.join(outPath, 'windows-installer'),
    setupExe: 'SetupOvercast.exe',
    skipUpdateIcon: true
  })
}