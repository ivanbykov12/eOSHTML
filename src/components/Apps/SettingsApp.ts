import { EApp } from '../../core/EAppParser';

export const settingsApp: EApp = {
  id: "settings_desktop",
  name: "Настройки",
  icon: "material:settings",
  color: "from-gray-500 to-slate-700",
  version: "2.0.0-LIQUID",
  author: "eOS System",
  description: "System Settings for eOS Desktop with Liquid Glass UI",
  supportedModels: ["eosdesktop", "iphone14", "epad101"],
  isSystem: true,
  eappVersion: "1.1",
  background: "transparent",
  code: `<div class='settings-container' id='settingsApp'>
  <aside class='sidebar liquid-glass'>
    <div class='profile-card'>
      <div class='avatar'><span class='material-icons'>person</span></div>
      <div class='info'>
        <div class='name' id='userName'>User</div>
        <div class='sub'>Epple ID & iCloud</div>
      </div>
    </div>
    <nav class='menu'>
      <div class='item active' data-page='general' onclick="nav('general')">
        <span class='material-icons'>tune</span> Основные
      </div>
      <div class='item' data-page='appearance' onclick="nav('appearance')">
        <span class='material-icons'>palette</span> Внешний вид
      </div>
      <div class='item' data-page='display' onclick="nav('display')">
        <span class='material-icons'>monitor</span> Дисплей
      </div>
      <div class='item' data-page='sound' onclick="nav('sound')">
        <span class='material-icons'>volume_up</span> Звук
      </div>
      <div class='item' data-page='network' onclick="nav('network')">
        <span class='material-icons'>wifi</span> Сеть
      </div>
      <div class='item' data-page='about' onclick="nav('about')">
        <span class='material-icons'>info</span> О системе
      </div>
    </nav>
  </aside>
  <main class='content'>
    <section id='page-general' class='page active'>
      <h2>Основные</h2>
      <div class='card liquid-glass'>
        <div class='row'>
          <span class='material-icons icon' style='color:#007aff'>wifi</span>
          <span class='label'>Wi-Fi</span>
          <span class='value'>Подключено</span>
          <span class='material-icons chevron'>chevron_right</span>
        </div>
        <div class='row'>
          <span class='material-icons icon' style='color:#007aff'>bluetooth</span>
          <span class='label'>Bluetooth</span>
          <span class='value'>Вкл.</span>
          <span class='material-icons chevron'>chevron_right</span>
        </div>
        <div class='row'>
          <span class='label'>Имя устройства</span>
          <input type='text' class='glass-input' id='devNameInput' onchange="updateSetting('name', this.value)">
        </div>
        <div class='row'>
          <span class='label'>Язык системы</span>
          <span class='value'>Русский</span>
          <span class='material-icons chevron'>chevron_right</span>
        </div>
      </div>
      <div class='card liquid-glass'>
        <div class='row'>
          <span class='material-icons icon' style='color:#ff9500'>storage</span>
          <span class='label'>Хранилище</span>
          <span class='value'>42 ГБ из 256 ГБ</span>
          <span class='material-icons chevron'>chevron_right</span>
        </div>
        <div class='row'>
          <span class='material-icons icon' style='color:#34c759'>security</span>
          <span class='label'>Конфиденциальность</span>
          <span class='material-icons chevron'>chevron_right</span>
        </div>
      </div>
    </section>
    <section id='page-appearance' class='page'>
      <h2>Внешний вид</h2>
      <div class='card liquid-glass'>
        <div class='row'>
          <span class='label'>Тёмная тема</span>
          <label class='switch'>
            <input type='checkbox' id='darkToggle' onchange="toggleDarkMode(this.checked)">
            <span class='slider'></span>
          </label>
        </div>
        <div class='row-col'>
          <span class='label'>Яркость</span>
          <input type='range' min='30' max='100' value='100' id='brightRange' oninput="setBrightness(this.value)">
          <div class='val-center' id='brightVal'>100%</div>
        </div>
        <div class='row-col'>
          <span class='label'>Акцентный цвет</span>
          <div class='color-picker'>
            <div class='color-dot' style='background:#007aff' onclick="setAccent('#007aff')"></div>
            <div class='color-dot' style='background:#af52de' onclick="setAccent('#af52de')"></div>
            <div class='color-dot' style='background:#ff2d55' onclick="setAccent('#ff2d55')"></div>
            <div class='color-dot' style='background:#ff9500' onclick="setAccent('#ff9500')"></div>
            <div class='color-dot' style='background:#34c759' onclick="setAccent('#34c759')"></div>
            <div class='color-dot' style='background:#5ac8fa' onclick="setAccent('#5ac8fa')"></div>
          </div>
        </div>
      </div>
      <div class='hint'>Стиль Liquid Glass применяется ко всем системным окнам автоматически.</div>
    </section>
    <section id='page-display' class='page'>
      <h2>Дисплей</h2>
      <div class='card liquid-glass'>
        <div class='row-col'>
          <span class='label'>Разрешение</span>
          <span class='value'>2560 × 1600 (Retina)</span>
        </div>
        <div class='row'>
          <span class='label'>Night Shift</span>
          <label class='switch'>
            <input type='checkbox'>
            <span class='slider'></span>
          </label>
        </div>
        <div class='row'>
          <span class='label'>True Tone</span>
          <label class='switch'>
            <input type='checkbox' checked>
            <span class='slider'></span>
          </label>
        </div>
      </div>
    </section>
    <section id='page-sound' class='page'>
      <h2>Звук</h2>
      <div class='card liquid-glass'>
        <div class='row-col'>
          <span class='label'>Громкость</span>
          <input type='range' min='0' max='100' value='75'>
        </div>
        <div class='row'>
          <span class='label'>Звуковые эффекты</span>
          <label class='switch'>
            <input type='checkbox' checked>
            <span class='slider'></span>
          </label>
        </div>
        <div class='row'>
          <span class='label'>Устройство вывода</span>
          <span class='value'>Встроенные динамики</span>
          <span class='material-icons chevron'>chevron_right</span>
        </div>
      </div>
    </section>
    <section id='page-network' class='page'>
      <h2>Сеть</h2>
      <div class='card liquid-glass'>
        <div class='row'>
          <span class='material-icons icon' style='color:#007aff'>wifi</span>
          <span class='label'>Wi-Fi</span>
          <span class='value' style='color:#34c759'>Подключено</span>
        </div>
        <div class='row'>
          <span class='label'>Сеть</span>
          <span class='value'>eOS-Network-5G</span>
        </div>
        <div class='row'>
          <span class='label'>IP-адрес</span>
          <span class='value mono'>192.168.1.42</span>
        </div>
      </div>
      <div class='card liquid-glass'>
        <div class='row'>
          <span class='material-icons icon' style='color:#007aff'>bluetooth</span>
          <span class='label'>Bluetooth</span>
          <span class='value' style='color:#34c759'>Вкл.</span>
        </div>
        <div class='row'>
          <span class='label'>Устройства</span>
          <span class='value'>AirPods Pro</span>
        </div>
      </div>
    </section>
    <section id='page-about' class='page'>
      <h2>О системе</h2>
      <div class='about-box liquid-glass'>
        <span class='material-icons about-icon'>computer</span>
        <div class='model-name' id='sysModel'>Macbook 13 Pro</div>
        <div class='os-ver' id='sysVer'>eOS Desktop 10.1 beta</div>
        <div class='kernel'>Kernel: eOS-Darwin 23.0</div>
      </div>
      <div class='card liquid-glass'>
        <div class='row'><span class='label'>Процессор</span><span class='value'>Apple M3 Pro</span></div>
        <div class='row'><span class='label'>Память</span><span class='value'>18 ГБ</span></div>
        <div class='row'><span class='label'>Серийный номер</span><span class='value mono'>FVFXXXXXXXXX</span></div>
        <div class='row'><span class='label'>API Context</span><span class='value mono' id='apiCtx'>-</span></div>
        <div class='row'><span class='label'>RBAC Level</span><span class='value mono' id='rbacLvl'>-</span></div>
        <div class='row'><span class='label'>eApp Version</span><span class='value mono'>1.1</span></div>
      </div>
    </section>
  </main>
</div>
<style>
.settings-container { display:flex; height:100%; font-family:-apple-system,sans-serif; overflow:hidden; background:transparent; }
.liquid-glass {
  background: rgba(255,255,255,0.65);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.3);
  box-shadow: 0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.4);
}
body.dark .liquid-glass, .dark .liquid-glass {
  background: rgba(30,30,30,0.65);
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05);
}
.sidebar { width:220px; padding:16px 10px; display:flex; flex-direction:column; gap:8px; margin:10px; border-radius:16px; overflow-y:auto; }
.content { flex:1; padding:20px; overflow-y:auto; }
.page { display:none; animation:fadeIn 0.3s ease; }
.page.active { display:block; }
@keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
.profile-card { display:flex; align-items:center; gap:10px; padding:10px; background:rgba(255,255,255,0.1); border-radius:12px; cursor:pointer; margin-bottom:8px; }
.avatar { width:36px; height:36px; background:linear-gradient(135deg,#667eea,#764ba2); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; flex-shrink:0; }
.info .name { font-weight:600; font-size:13px; }
.info .sub { font-size:11px; opacity:0.6; }
.menu .item { display:flex; align-items:center; gap:10px; padding:7px 12px; border-radius:8px; cursor:pointer; font-size:13px; transition:0.2s; opacity:0.7; }
.menu .item:hover, .menu .item.active { background:rgba(0,122,255,0.15); opacity:1; }
.menu .item .material-icons { font-size:18px; }
h2 { margin:0 0 16px; font-size:20px; font-weight:600; }
.card { border-radius:12px; overflow:hidden; margin-bottom:16px; }
.row { display:flex; align-items:center; padding:11px 16px; border-bottom:1px solid rgba(128,128,128,0.1); font-size:13px; }
.row:last-child { border-bottom:none; }
.row .icon { margin-right:12px; font-size:20px; width:24px; text-align:center; }
.row .label { flex:1; }
.row .value { opacity:0.6; font-size:12px; margin-right:8px; }
.row .chevron { opacity:0.4; font-size:18px; }
.switch { position:relative; width:40px; height:22px; flex-shrink:0; }
.switch input { opacity:0; width:0; height:0; }
.slider { position:absolute; inset:0; background:#888; border-radius:22px; transition:0.3s; cursor:pointer; }
.slider:before { content:''; position:absolute; height:18px; width:18px; left:2px; bottom:2px; background:white; border-radius:50%; transition:0.3s; }
input:checked + .slider { background:#34c759; }
input:checked + .slider:before { transform:translateX(18px); }
.glass-input { background:rgba(0,0,0,0.1); border:none; border-radius:6px; padding:4px 8px; font-size:13px; outline:none; width:140px; text-align:right; }
.row-col { padding:14px 16px; display:flex; flex-direction:column; gap:8px; border-bottom:1px solid rgba(128,128,128,0.1); }
.row-col:last-child { border-bottom:none; }
.row-col input[type=range] { width:100%; accent-color:#007aff; }
.val-center { text-align:center; font-size:12px; opacity:0.6; }
.hint { font-size:12px; opacity:0.5; margin-top:10px; font-style:italic; }
.about-box { text-align:center; padding:24px; border-radius:16px; margin-bottom:16px; }
.about-icon { font-size:48px !important; opacity:0.7; margin-bottom:8px; display:block; }
.model-name { font-size:20px; font-weight:700; }
.os-ver { font-size:13px; opacity:0.6; margin-top:4px; }
.kernel { font-size:11px; opacity:0.4; margin-top:6px; font-family:monospace; }
.mono { font-family:'SF Mono',monospace; font-size:12px; }
.color-picker { display:flex; gap:8px; flex-wrap:wrap; }
.color-dot { width:24px; height:24px; border-radius:50%; cursor:pointer; transition:transform 0.2s; border:2px solid transparent; }
.color-dot:hover { transform:scale(1.2); border-color:rgba(255,255,255,0.5); }
</style>
<script>
var s = window.ePhone ? window.ePhone.getSettings() : {};
var ctx = window.ePhoneContext || {};
document.getElementById('userName').textContent = s.name || 'User';
document.getElementById('devNameInput').value = s.name || 'ePhone';
document.getElementById('darkToggle').checked = !!s.darkMode;
document.getElementById('brightRange').value = s.brightness || 100;
document.getElementById('brightVal').textContent = (s.brightness || 100) + '%';
if(window.ePhoneConsole) {
  window.ePhoneConsole.execute('model').then(function(res) {
    document.getElementById('sysModel').textContent = res.split('\\n')[0] || ctx.modelName || 'Unknown';
  });
} else {
  document.getElementById('sysModel').textContent = ctx.modelName || 'Simulator';
}
document.getElementById('sysVer').textContent = 'eOS Desktop ' + (ctx.osVersion || '');
document.getElementById('apiCtx').textContent = ctx.model || 'N/A';
document.getElementById('rbacLvl').textContent = (window.ePhone && window.ePhone.getRBACLevel) ? window.ePhone.getRBACLevel() : 'USER';
function nav(pageId) {
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  document.getElementById('page-'+pageId).classList.add('active');
  document.querySelectorAll('.menu .item').forEach(function(i) { i.classList.remove('active'); });
  var item = document.querySelector('.menu .item[data-page="'+pageId+'"]');
  if(item) item.classList.add('active');
}
function updateSetting(key, val) {
  if(window.ePhone) window.ePhone.setSettings({name: val});
}
function toggleDarkMode(isChecked) {
  if(window.ePhone) window.ePhone.setSettings({darkMode: isChecked});
  document.body.style.background = isChecked ? '#1a1a1a' : 'transparent';
}
function setBrightness(val) {
  document.getElementById('brightVal').textContent = val + '%';
  if(window.ePhone) window.ePhone.setSettings({brightness: parseInt(val)});
}
function setAccent(color) {
  document.documentElement.style.setProperty('--accent-color', color);
  if(window.ePhone) window.ePhone.setSettings({accentColor: color});
}
</script>`
};
