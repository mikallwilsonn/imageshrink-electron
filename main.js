// ----
// Dependencies
const path = require( 'path' );
const os = require( 'os' );
const { app, BrowserWindow, Menu, ipcMain, shell } = require( 'electron' );
const imagemin = require( 'imagemin' );
const imageminMozjpeg = require( 'imagemin-mozjpeg' );
const imageminPngquant = require( 'imagemin-pngquant' );
const slash = require( 'slash' );
const log = require( 'electron-log' );


// ----
// Set environment
process.env.NODE_ENV = 'production';
const isDev = process.env.NODE_ENV !== 'production' ? true : false;
const isMac = process.platform === 'darwin' ? true : false;


// ----
// Creating the window
let mainWindow;
let aboutWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'ImageShrink',
        width: 500,
        height: 600,
        icon: `${ __dirname }/assets/icons/Icon_256x256.png`,
        resizable: isDev ? true : false,
        backgroundColor: '#FFF',
        webPreferences: {
            nodeIntegration: true,
        },
    });

    if ( isDev ) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile( './app/index.html' );
}

function createAboutWindow() {
    aboutWindow = new BrowserWindow({
        title: 'About ImageShrink',
        width: 300,
        height: 300,
        icon: `${ __dirname }/assets/icons/Icon_256x256.png`,
        resizable: false,
        backgroundColor: '#FFF'
    });

    aboutWindow.loadFile( './app/about.html' );
}


// ----
// App settings
app.on( 'ready', () => { 
    createMainWindow();

    const mainMenu = Menu.buildFromTemplate( menu );
    Menu.setApplicationMenu( mainMenu );

    mainWindow.on( 'closed', () => mainWindow = null );
});


// Menu
const menu = [
     ...( isMac ? [ { 
         label: app.name,
         submenu: [
             {
                 label: 'About',
                 click: createAboutWindow,
             }
         ]
      }] : []),
    { role: 'fileMenu' },
    ...( !isMac ? [
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About',
                    click: createAboutWindow,
                },
            ],
        },
    ] : []),
    ...( isDev ? [
        {
            label: 'Developer',
            submenu: [
                { role: 'reload' },
                { role: 'forcereload' },
                { type: 'separator' },
                { role: 'toggledevtools' }
            ]
        }
    ] : [] )
];


// ----
// IPC
ipcMain.on( 'image:minimize', ( event, options ) => {
    options.dest = path.join( os.homedir(), 'imageshrink' );

    shrinkImage( options );
});


async function shrinkImage({ imgPath, quality, dest }) {
    try {
        const pngQuality = quality / 100;

        const files = await imagemin(
            [ slash(imgPath) ], 
            { 
                destination: dest,
                plugins: [
                    imageminMozjpeg({ quality }),
                    imageminPngquant({ quality: [ pngQuality, pngQuality ]})
                ]
            },
        );

        log.info( files )
        shell.openPath( dest );
        mainWindow.webContents.send( 'image:done' );
    } catch ( error ) {
        mainWindow.webContents.send( 'image:fail' );
        log.error( error );
    }
}


// ----
// Window
app.on( 'window-all-closed', () => {
    if ( isMac ) {
      app.quit();
    }
});
  
app.on( 'activate', () => {
    if ( BrowserWindow.getAllWindows().length === 0 ) {
        createMainWindow();
    }
});

app.allowRendererProcessReuse = true;
