const {app,BrowserWindow,protocol,Menu}=require('electron');
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const selfTest=process.argv.includes('--self-test'),qa=process.argv.includes('--qa');
if(selfTest||qa)app.setPath('userData',path.join(app.getPath('temp'),'Emberbound-'+(selfTest?'selftest':'visual-qa')));
app.setName('Emberbound');
protocol.registerSchemesAsPrivileged([{scheme:'emberbound',privileges:{standard:true,secure:true,supportFetchAPI:true}}]);
const root=path.resolve(__dirname,'..');let win;
if(!app.requestSingleInstanceLock()){app.quit();}else{
 app.on('second-instance',()=>{if(win){if(win.isMinimized())win.restore();win.show();win.focus();}});
 app.whenReady().then(async()=>{
  const html=await fs.readFile(path.join(root,'build','Emberbound.html'),'utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const hash=crypto.createHash('sha256').update(script).digest('base64');
  protocol.handle('emberbound',req=>{
   const url=new URL(req.url);if(req.method!=='GET'||url.host!=='game'||!['/','/index.html'].includes(url.pathname))return new Response('Not found',{status:404});
   return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':`default-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'sha256-${hash}'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`}});
  });
  win=new BrowserWindow({width:1440,height:900,minWidth:1024,minHeight:700,show:false,backgroundColor:'#101e27',title:'灰烬远征',icon:path.join(root,'assets','Emberbound.ico'),webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true,devTools:selfTest}});
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  win.webContents.on('will-navigate',(event,url)=>{if(url!=='emberbound://game/index.html')event.preventDefault();});
  win.webContents.session.setPermissionRequestHandler((_wc,_permission,cb)=>cb(false));
  win.webContents.session.setPermissionCheckHandler(()=>false);
  win.webContents.session.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*','file://*/*','ws://*/*','wss://*/*']},(_details,cb)=>cb({cancel:true}));
  Menu.setApplicationMenu(Menu.buildFromTemplate([{label:'游戏',submenu:[{label:'全屏 / F11',accelerator:'F11',click:()=>win.setFullScreen(!win.isFullScreen())},{type:'separator'},{label:'退出',role:'quit'}]}]));win.setMenuBarVisibility(false);
  win.once('ready-to-show',()=>selfTest?win.showInactive():win.show());
  await win.loadURL('emberbound://game/index.html');
  if(selfTest){try{await require('./selftest.cjs')(win,root);app.exit(0);}catch(error){console.error(error.stack);app.exit(1);}}
 }).catch(error=>{console.error(error);app.exit(1);});
 app.on('window-all-closed',()=>app.quit());
}
