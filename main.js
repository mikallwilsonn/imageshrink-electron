// ----
// Dependencies
const { app, BrowserWindow, Menu } = require( 'electron' );


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
        resizable: isDev ? true : false
    });

    mainWindow.loadFile( './app/index.html' );
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
     ...( isMac ? [ { role: 'appMenu' }] : []),
    {
        label: 'File',
        submenu: [
            {
                label: 'Quit',
                click: () => app.quit()
            },
        ],
    },
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
