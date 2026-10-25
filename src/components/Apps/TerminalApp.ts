import { EApp } from '../../core/EAppParser';

export const terminalApp: EApp = {
  id: "terminal_desktop",
  name: "Терминал",
  icon: "material:terminal",
  color: "from-gray-800 to-black",
  version: "2.0.0",
  author: "eOS System",
  description: "System Terminal with eOS Console API",
  supportedModels: ["eosdesktop"],
  isSystem: true,
  eappVersion: "1.1",
  background: "#0d0d0d",
  code: `<div class='terminal' id='terminal'>
  <div class='terminal-header'>
    <span class='terminal-title'>ivan@eos-desktop ~ %</span>
  </div>
  <div class='terminal-body' id='termBody'>
    <div class='line'>eOS Desktop Terminal v2.0</div>
    <div class='line dim'>Kernel: eOS-Darwin 23.0 | Type 'help' for commands</div>
    <div class='line'>&nbsp;</div>
  </div>
  <div class='input-line'>
    <span class='prompt'>ivan@eos-desktop ~ %</span>
    <input type='text' id='cmdInput' class='cmd-input' autofocus autocomplete='off' spellcheck='false'>
  </div>
</div>
<style>
.terminal { height:100%; display:flex; flex-direction:column; background:#0d0d0d; font-family:'SF Mono','Fira Code',monospace; font-size:13px; color:#e0e0e0; padding:12px; }
.terminal-header { display:none; }
.terminal-body { flex:1; overflow-y:auto; padding-bottom:8px; }
.line { line-height:1.6; white-space:pre-wrap; word-break:break-all; }
.dim { opacity:0.5; }
.success { color:#34c759; }
.error { color:#ff3b30; }
.info { color:#007aff; }
.input-line { display:flex; align-items:center; gap:8px; }
.prompt { color:#34c759; white-space:nowrap; }
.cmd-input { flex:1; background:transparent; border:none; outline:none; color:#e0e0e0; font-family:inherit; font-size:inherit; caret-color:#34c759; }
</style>
<script>
var body = document.getElementById('termBody');
var input = document.getElementById('cmdInput');
var history = [];
var historyIdx = -1;

input.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    var cmd = input.value.trim();
    if (cmd) {
      history.unshift(cmd);
      historyIdx = -1;
      addLine('<span class="prompt">ivan@eos-desktop ~ %</span> ' + escapeHtml(cmd));
      executeCommand(cmd);
    }
    input.value = '';
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (historyIdx < history.length - 1) {
      historyIdx++;
      input.value = history[historyIdx];
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (historyIdx > 0) {
      historyIdx--;
      input.value = history[historyIdx];
    } else {
      historyIdx = -1;
      input.value = '';
    }
  }
});

input.focus();
document.getElementById('terminal').addEventListener('click', function() { input.focus(); });

function addLine(html, cls) {
  var div = document.createElement('div');
  div.className = 'line' + (cls ? ' ' + cls : '');
  div.innerHTML = html;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function executeCommand(cmd) {
  var parts = cmd.split(' ');
  var command = parts[0].toLowerCase();
  
  if (command === 'help') {
    addLine('Available commands:', 'info');
    addLine('  help      - Show this help');
    addLine('  sysinfo   - System information');
    addLine('  model     - Device model');
    addLine('  ls        - List desktop files');
    addLine('  uptime    - System uptime');
    addLine('  whoami    - Current user');
    addLine('  date      - Current date/time');
    addLine('  clear     - Clear terminal');
    addLine('  echo      - Print text');
    addLine('  neofetch  - System info (fancy)');
  } else if (command === 'clear') {
    body.innerHTML = '';
  } else if (command === 'echo') {
    addLine(escapeHtml(parts.slice(1).join(' ')));
  } else if (command === 'date') {
    addLine(new Date().toString());
  } else if (window.ePhoneConsole) {
    window.ePhoneConsole.execute(cmd).then(function(res) {
      addLine(escapeHtml(res));
    });
  } else {
    addLine('Command not found: ' + escapeHtml(command), 'error');
  }
}
</script>`
};
