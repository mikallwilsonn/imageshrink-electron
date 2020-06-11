// ----
// Dependencies
const { app, BrowserWindow, Menu, globalShortcut } = require( 'electron' );


// ----
// Set environment
process.env.NODE_ENV = 'development';
const isDev = process.env.NODE_ENV !== 'production' ? true : false;
const isMac = process.platform === 'darwin' ? true : false;


// ----
// Creating the window
let mainWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'ImageShrink',
        width: 500,
        height: 600,
        icon: `${ __dirname }/assets/icons/Icon_256x256.png`,
        resizable: isDev ? true : false,
        backgroundColor: '#FFF'
    });

    mainWindow.loadFile( './app/index.html' );
}


// ----
// App settings
app.on( 'ready', () => { 
    createMainWindow();

    const mainMenu = Menu.buildFromTemplate( menu );
    Menu.setApplicationMenu( mainMenu );

    globalShortcut.register( 'CmdOrCtrl+r', () => mainWindow.reload() );
    globalShortcut.register( 
        isMac ? 'Command+Alt+i' : 'Ctrl+Shift+i', 
        () => mainWindow.toggleDevTools() 
    );

    mainWindow.on( 'closed', () => mainWindow = null );
});


// Menu
const menu = [
     ...( isMac ? [ { role: 'appMenu' }] : []),
    { role: 'fileMenu' },
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
