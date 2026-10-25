import { EApp } from '../../core/EAppParser';

export const finderApp: EApp = {
  id: "finder_desktop",
  name: "Finder",
  icon: "material:folder",
  color: "from-blue-400 to-blue-600",
  version: "2.0.0",
  author: "eOS System",
  description: "File Manager for eOS Desktop",
  supportedModels: ["eosdesktop"],
  isSystem: true,
  eappVersion: "1.1",
  background: "transparent",
  code: `<div class='finder-container'>
  <div class='finder-sidebar'>
    <div class='sidebar-section'>
      <div class='sidebar-title'>Избранное</div>
      <div class='sidebar-item active' onclick="navigate('/users/ivan/Desktop')">
        <span class='material-icons'>desktop_windows</span> Рабочий стол
      </div>
      <div class='sidebar-item' onclick="navigate('/users/ivan/Documents')">
        <span class='material-icons'>description</span> Документы
      </div>
      <div class='sidebar-item' onclick="navigate('/users/ivan/Downloads')">
        <span class='material-icons'>download</span> Загрузки
      </div>
    </div>
    <div class='sidebar-section'>
      <div class='sidebar-title'>Места</div>
      <div class='sidebar-item' onclick="navigate('/')">
        <span class='material-icons'>storage</span> Macintosh HD
      </div>
      <div class='sidebar-item' onclick="navigate('/public/apps/system')">
        <span class='material-icons'>apps</span> Программы
      </div>
    </div>
  </div>
  <div class='finder-main'>
    <div class='finder-toolbar'>
      <button class='nav-btn' onclick="goBack()">
        <span class='material-icons'>arrow_back</span>
      </button>
      <button class='nav-btn' onclick="goForward()">
        <span class='material-icons'>arrow_forward</span>
      </button>
      <div class='path-bar' id='pathBar'>/users/ivan/Desktop</div>
      <div class='view-btns'>
        <button class='view-btn active' onclick="setView('grid')"><span class='material-icons'>grid_view</span></button>
        <button class='view-btn' onclick="setView('list')"><span class='material-icons'>view_list</span></button>
      </div>
    </div>
    <div class='finder-content' id='finderContent'>
      <div class='empty-state'>
        <span class='material-icons'>folder_open</span>
        <p>Папка пуста</p>
      </div>
    </div>
    <div class='finder-statusbar' id='statusBar'>0 элементов</div>
  </div>
</div>
<style>
.finder-container { display:flex; height:100%; font-family:-apple-system,sans-serif; overflow:hidden; }
.finder-sidebar { width:180px; padding:10px 8px; background:rgba(240,240,240,0.8); backdrop-filter:blur(20px); border-right:1px solid rgba(0,0,0,0.1); overflow-y:auto; flex-shrink:0; }
body.dark .finder-sidebar, .dark .finder-sidebar { background:rgba(40,40,40,0.8); border-right:1px solid rgba(255,255,255,0.05); }
.sidebar-section { margin-bottom:16px; }
.sidebar-title { font-size:11px; font-weight:600; opacity:0.5; padding:4px 10px; text-transform:uppercase; letter-spacing:0.5px; }
.sidebar-item { display:flex; align-items:center; gap:8px; padding:5px 10px; border-radius:6px; cursor:pointer; font-size:12px; transition:0.15s; }
.sidebar-item:hover { background:rgba(0,0,0,0.05); }
.sidebar-item.active { background:rgba(0,122,255,0.15); color:#007aff; }
.sidebar-item .material-icons { font-size:16px; opacity:0.7; }
.finder-main { flex:1; display:flex; flex-direction:column; background:rgba(255,255,255,0.5); }
body.dark .finder-main, .dark .finder-main { background:rgba(30,30,30,0.5); }
.finder-toolbar { display:flex; align-items:center; gap:8px; padding:8px 12px; border-bottom:1px solid rgba(0,0,0,0.08); }
.dark .finder-toolbar { border-bottom:1px solid rgba(255,255,255,0.05); }
.nav-btn { background:none; border:none; cursor:pointer; padding:4px; border-radius:4px; opacity:0.5; }
.nav-btn:hover { opacity:1; background:rgba(0,0,0,0.05); }
.path-bar { flex:1; font-size:12px; font-family:monospace; opacity:0.7; padding:4px 8px; background:rgba(0,0,0,0.05); border-radius:4px; }
.dark .path-bar { background:rgba(255,255,255,0.05); }
.view-btns { display:flex; gap:2px; }
.view-btn { background:none; border:none; cursor:pointer; padding:4px; border-radius:4px; opacity:0.4; }
.view-btn:hover, .view-btn.active { opacity:1; background:rgba(0,122,255,0.15); }
.view-btn .material-icons { font-size:18px; }
.finder-content { flex:1; overflow-y:auto; padding:16px; }
.finder-statusbar { padding:6px 12px; font-size:11px; opacity:0.5; border-top:1px solid rgba(0,0,0,0.08); }
.dark .finder-statusbar { border-top:1px solid rgba(255,255,255,0.05); }
.file-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(80px, 1fr)); gap:16px; }
.file-item { display:flex; flex-direction:column; align-items:center; gap:4px; padding:8px; border-radius:8px; cursor:pointer; transition:0.15s; }
.file-item:hover { background:rgba(0,122,255,0.1); }
.file-item .file-icon { width:48px; height:48px; display:flex; align-items:center; justify-content:center; }
.file-item .file-icon .material-icons { font-size:40px; }
.file-item .file-name { font-size:11px; text-align:center; word-break:break-word; line-height:1.3; max-width:80px; }
.file-list { display:flex; flex-direction:column; }
.file-list-item { display:flex; align-items:center; gap:12px; padding:8px 12px; border-bottom:1px solid rgba(0,0,0,0.05); cursor:pointer; transition:0.15s; font-size:13px; }
.file-list-item:hover { background:rgba(0,122,255,0.1); }
.file-list-item .material-icons { font-size:20px; opacity:0.6; }
.file-list-item .file-size { margin-left:auto; opacity:0.5; font-size:12px; }
.empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; opacity:0.3; }
.empty-state .material-icons { font-size:64px; margin-bottom:12px; }
.empty-state p { font-size:14px; }
</style>
<script>
var currentPath = '/users/ivan/Desktop';
var viewMode = 'grid';
var pathHistory = ['/users/ivan/Desktop'];
var historyIndex = 0;

function navigate(path) {
  currentPath = path;
  if (historyIndex < pathHistory.length - 1) {
    pathHistory = pathHistory.slice(0, historyIndex + 1);
  }
  pathHistory.push(path);
  historyIndex = pathHistory.length - 1;
  render();
}

function goBack() {
  if (historyIndex > 0) {
    historyIndex--;
    currentPath = pathHistory[historyIndex];
    render();
  }
}

function goForward() {
  if (historyIndex < pathHistory.length - 1) {
    historyIndex++;
    currentPath = pathHistory[historyIndex];
    render();
  }
}

function setView(mode) {
  viewMode = mode;
  document.querySelectorAll('.view-btn').forEach(function(b) { b.classList.remove('active'); });
  event.target.closest('.view-btn').classList.add('active');
  render();
}

function render() {
  document.getElementById('pathBar').textContent = currentPath;
  var content = document.getElementById('finderContent');
  
  // Simulated file listing
  var files = getFilesForPath(currentPath);
  
  if (files.length === 0) {
    content.innerHTML = '<div class="empty-state"><span class="material-icons">folder_open</span><p>Папка пуста</p></div>';
  } else if (viewMode === 'grid') {
    content.innerHTML = '<div class="file-grid">' + files.map(function(f) {
      return '<div class="file-item" ondblclick="openItem(\\'' + f.name + '\\',\\'' + f.type + '\\')">' +
        '<div class="file-icon"><span class="material-icons" style="color:' + (f.type === 'directory' ? '#007aff' : '#888') + '">' +
        (f.type === 'directory' ? 'folder' : 'description') + '</span></div>' +
        '<div class="file-name">' + f.name + '</div></div>';
    }).join('') + '</div>';
  } else {
    content.innerHTML = '<div class="file-list">' + files.map(function(f) {
      return '<div class="file-list-item" ondblclick="openItem(\\'' + f.name + '\\',\\'' + f.type + '\\')">' +
        '<span class="material-icons" style="color:' + (f.type === 'directory' ? '#007aff' : '#888') + '">' +
        (f.type === 'directory' ? 'folder' : 'description') + '</span>' +
        '<span>' + f.name + '</span>' +
        '<span class="file-size">' + (f.size || '--') + '</span></div>';
    }).join('') + '</div>';
  }
  
  document.getElementById('statusBar').textContent = files.length + ' элемент' + (files.length === 1 ? '' : 'ов');
  
  // Update sidebar active
  document.querySelectorAll('.sidebar-item').forEach(function(item) { item.classList.remove('active'); });
}

function getFilesForPath(path) {
  // Simulated filesystem
  var fs = {
    '/': [{name:'public',type:'directory'},{name:'users',type:'directory'}],
    '/public': [{name:'apps',type:'directory'}],
    '/public/apps': [{name:'system',type:'directory'}],
    '/public/apps/system': [{name:'Settings.eapp',type:'file',size:'4.2 KB'},{name:'Terminal.eapp',type:'file',size:'2.1 KB'},{name:'Finder.eapp',type:'file',size:'3.8 KB'}],
    '/users': [{name:'ivan',type:'directory'}],
    '/users/ivan': [{name:'Desktop',type:'directory'},{name:'Documents',type:'directory'},{name:'Downloads',type:'directory'}],
    '/users/ivan/Desktop': [{name:'README.txt',type:'file',size:'1.2 KB'},{name:'project.eapp',type:'file',size:'5.4 KB'}],
    '/users/ivan/Documents': [{name:'report.pdf',type:'file',size:'2.3 MB'},{name:'notes.txt',type:'file',size:'0.8 KB'}],
    '/users/ivan/Downloads': [{name:'eOS-manual.pdf',type:'file',size:'15.2 MB'}]
  };
  return fs[path] || [];
}

function openItem(name, type) {
  if (type === 'directory') {
    navigate(currentPath + '/' + name);
  } else {
    // Open file preview
    alert('Preview: ' + name);
  }
}

render();
</script>`
};
