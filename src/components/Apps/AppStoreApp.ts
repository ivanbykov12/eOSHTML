import { EApp } from '../../core/EAppParser';

export const appStoreApp: EApp = {
  id: "appstore_desktop",
  name: "App Store",
  icon: "material:store",
  color: "from-blue-500 to-indigo-600",
  version: "2.0.0",
  author: "eOS System",
  description: "eOS Application Store",
  supportedModels: ["eosdesktop"],
  isSystem: true,
  eappVersion: "1.1",
  background: "transparent",
  code: `<div class='store-container'>
  <div class='store-sidebar'>
    <div class='store-logo'>
      <span class='material-icons'>store</span>
      <span>App Store</span>
    </div>
    <nav class='store-nav'>
      <div class='nav-item active' onclick="showSection('discover')">
        <span class='material-icons'>explore</span> Обзор
      </div>
      <div class='nav-item' onclick="showSection('categories')">
        <span class='material-icons'>category</span> Категории
      </div>
      <div class='nav-item' onclick="showSection('installed')">
        <span class='material-icons'>download_done</span> Установленные
      </div>
      <div class='nav-item' onclick="showSection('updates')">
        <span class='material-icons'>update</span> Обновления
      </div>
    </nav>
  </div>
  <div class='store-main'>
    <div id='section-discover' class='store-section active'>
      <div class='featured-banner liquid-glass'>
        <div class='banner-content'>
          <h2>Приложение дня</h2>
          <p>eOS Calculator Pro — мощный калькулятор с поддержкой формул</p>
          <button class='get-btn' onclick="installApp('calculator')">Установить</button>
        </div>
        <div class='banner-icon'>
          <span class='material-icons'>calculate</span>
        </div>
      </div>
      <h3 class='section-title'>Рекомендуемые</h3>
      <div class='app-grid'>
        <div class='app-card liquid-glass'>
          <div class='app-icon bg-gradient-to-br from-purple-500 to-pink-500'>
            <span class='material-icons'>brush</span>
          </div>
          <div class='app-info'>
            <div class='app-name'>eOS Paint</div>
            <div class='app-desc'>Рисование и графика</div>
          </div>
          <button class='get-btn small' onclick="installApp('paint')">Установить</button>
        </div>
        <div class='app-card liquid-glass'>
          <div class='app-icon bg-gradient-to-br from-green-500 to-teal-500'>
            <span class='material-icons'>code</span>
          </div>
          <div class='app-info'>
            <div class='app-name'>Code Editor</div>
            <div class='app-desc'>Редактор кода</div>
          </div>
          <button class='get-btn small' onclick="installApp('codeeditor')">Установить</button>
        </div>
        <div class='app-card liquid-glass'>
          <div class='app-icon bg-gradient-to-br from-orange-500 to-red-500'>
            <span class='material-icons'>music_note</span>
          </div>
          <div class='app-info'>
            <div class='app-name'>Music Player</div>
            <div class='app-desc'>Музыкальный плеер</div>
          </div>
          <button class='get-btn small' onclick="installApp('music')">Установить</button>
        </div>
        <div class='app-card liquid-glass'>
          <div class='app-icon bg-gradient-to-br from-cyan-500 to-blue-500'>
            <span class='material-icons'>cloud</span>
          </div>
          <div class='app-info'>
            <div class='app-name'>Weather</div>
            <div class='app-desc'>Прогноз погоды</div>
          </div>
          <button class='get-btn small' onclick="installApp('weather')">Установить</button>
        </div>
        <div class='app-card liquid-glass'>
          <div class='app-icon bg-gradient-to-br from-yellow-500 to-orange-500'>
            <span class='material-icons'>photo_camera</span>
          </div>
          <div class='app-info'>
            <div class='app-name'>Photos</div>
            <div class='app-desc'>Просмотр фото</div>
          </div>
          <button class='get-btn small' onclick="installApp('photos')">Установить</button>
        </div>
        <div class='app-card liquid-glass'>
          <div class='app-icon bg-gradient-to-br from-indigo-500 to-purple-500'>
            <span class='material-icons'>games</span>
          </div>
          <div class='app-info'>
            <div class='app-name'>eOS Games</div>
            <div class='app-desc'>Коллекция игр</div>
          </div>
          <button class='get-btn small' onclick="installApp('games')">Установить</button>
        </div>
      </div>
    </div>
    <div id='section-categories' class='store-section'>
      <h3 class='section-title'>Категории</h3>
      <div class='categories-grid'>
        <div class='category-card liquid-glass'><span class='material-icons'>work</span>Продуктивность</div>
        <div class='category-card liquid-glass'><span class='material-icons'>palette</span>Дизайн</div>
        <div class='category-card liquid-glass'><span class='material-icons'>code</span>Разработка</div>
        <div class='category-card liquid-glass'><span class='material-icons'>music_note</span>Музыка</div>
        <div class='category-card liquid-glass'><span class='material-icons'>games</span>Игры</div>
        <div class='category-card liquid-glass'><span class='material-icons'>education</span>Образование</div>
      </div>
    </div>
    <div id='section-installed' class='store-section'>
      <h3 class='section-title'>Установленные приложения</h3>
      <div class='installed-list' id='installedList'>
        <div class='installed-item liquid-glass'>
          <div class='app-icon-sm bg-gradient-to-br from-gray-500 to-slate-700'><span class='material-icons'>settings</span></div>
          <div class='app-info'><div class='app-name'>Настройки</div><div class='app-desc'>v2.0.0-LIQUID</div></div>
          <span class='installed-badge'>Системное</span>
        </div>
        <div class='installed-item liquid-glass'>
          <div class='app-icon-sm bg-gradient-to-br from-gray-800 to-black'><span class='material-icons'>terminal</span></div>
          <div class='app-info'><div class='app-name'>Терминал</div><div class='app-desc'>v2.0.0</div></div>
          <span class='installed-badge'>Системное</span>
        </div>
        <div class='installed-item liquid-glass'>
          <div class='app-icon-sm bg-gradient-to-br from-blue-400 to-blue-600'><span class='material-icons'>folder</span></div>
          <div class='app-info'><div class='app-name'>Finder</div><div class='app-desc'>v2.0.0</div></div>
          <span class='installed-badge'>Системное</span>
        </div>
      </div>
    </div>
    <div id='section-updates' class='store-section'>
      <h3 class='section-title'>Обновления</h3>
      <div class='empty-updates'>
        <span class='material-icons'>check_circle</span>
        <p>Все приложения обновлены</p>
      </div>
    </div>
  </div>
</div>
<style>
.store-container { display:flex; height:100%; font-family:-apple-system,sans-serif; overflow:hidden; }
.store-sidebar { width:200px; padding:16px 10px; background:rgba(240,240,240,0.8); backdrop-filter:blur(20px); border-right:1px solid rgba(0,0,0,0.1); flex-shrink:0; }
body.dark .store-sidebar, .dark .store-sidebar { background:rgba(40,40,40,0.8); border-right-color:rgba(255,255,255,0.05); }
.store-logo { display:flex; align-items:center; gap:8px; padding:8px 12px; margin-bottom:16px; font-weight:700; font-size:16px; }
.store-logo .material-icons { color:#007aff; }
.store-nav { display:flex; flex-direction:column; gap:2px; }
.nav-item { display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:8px; cursor:pointer; font-size:13px; transition:0.15s; opacity:0.7; }
.nav-item:hover { opacity:1; background:rgba(0,0,0,0.05); }
.nav-item.active { opacity:1; background:rgba(0,122,255,0.15); color:#007aff; }
.nav-item .material-icons { font-size:18px; }
.store-main { flex:1; overflow-y:auto; padding:20px; }
.store-section { display:none; animation:fadeIn 0.3s ease; }
.store-section.active { display:block; }
@keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
.featured-banner { display:flex; align-items:center; padding:24px; border-radius:16px; margin-bottom:24px; gap:20px; }
.banner-content { flex:1; }
.banner-content h2 { font-size:22px; margin:0 0 8px; }
.banner-content p { font-size:14px; opacity:0.7; margin:0 0 16px; }
.banner-icon { width:80px; height:80px; background:linear-gradient(135deg,#007aff,#5856d6); border-radius:20px; display:flex; align-items:center; justify-content:center; }
.banner-icon .material-icons { font-size:40px; color:white; }
.get-btn { background:#007aff; color:white; border:none; padding:8px 20px; border-radius:20px; font-size:13px; font-weight:600; cursor:pointer; transition:0.2s; }
.get-btn:hover { background:#0056b3; }
.get-btn.small { padding:6px 14px; font-size:12px; }
.section-title { font-size:18px; font-weight:600; margin:0 0 16px; }
.app-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:12px; }
.app-card { display:flex; align-items:center; gap:12px; padding:12px; border-radius:12px; }
.app-icon { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.app-icon .material-icons { color:white; font-size:24px; }
.app-info { flex:1; min-width:0; }
.app-name { font-size:14px; font-weight:600; }
.app-desc { font-size:12px; opacity:0.6; }
.categories-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(150px, 1fr)); gap:12px; }
.category-card { display:flex; flex-direction:column; align-items:center; gap:8px; padding:24px; border-radius:12px; cursor:pointer; transition:0.2s; }
.category-card:hover { transform:translateY(-2px); }
.category-card .material-icons { font-size:32px; color:#007aff; }
.installed-list { display:flex; flex-direction:column; gap:8px; }
.installed-item { display:flex; align-items:center; gap:12px; padding:12px; border-radius:12px; }
.app-icon-sm { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.app-icon-sm .material-icons { color:white; font-size:20px; }
.installed-badge { font-size:11px; padding:3px 8px; background:rgba(0,122,255,0.15); color:#007aff; border-radius:10px; }
.empty-updates { text-align:center; padding:40px; opacity:0.5; }
.empty-updates .material-icons { font-size:48px; color:#34c759; margin-bottom:12px; }
</style>
<script>
function showSection(id) {
  document.querySelectorAll('.store-section').forEach(function(s) { s.classList.remove('active'); });
  document.getElementById('section-'+id).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
  event.target.closest('.nav-item').classList.add('active');
}
function installApp(appId) {
  var btn = event.target;
  btn.textContent = 'Установлено';
  btn.style.background = '#34c759';
  btn.disabled = true;
}
</script>`
};
