import { EApp } from '../../core/EAppParser';

export const calculatorApp: EApp = {
  id: "calculator_desktop",
  name: "Калькулятор",
  icon: "material:calculate",
  color: "from-orange-500 to-red-500",
  version: "2.0.0",
  author: "eOS System",
  description: "Scientific Calculator for eOS Desktop",
  supportedModels: ["eosdesktop", "iphone14"],
  isSystem: true,
  eappVersion: "1.1",
  background: "#1c1c1e",
  code: `<div class='calc-container'>
  <div class='calc-display'>
    <div class='calc-expression' id='expression'></div>
    <div class='calc-result' id='result'>0</div>
  </div>
  <div class='calc-buttons'>
    <button class='btn func' onclick="calcAction('clear')">AC</button>
    <button class='btn func' onclick="calcAction('negate')">±</button>
    <button class='btn func' onclick="calcAction('percent')">%</button>
    <button class='btn op' onclick="calcAction('op','÷')">÷</button>
    <button class='btn num' onclick="calcAction('num','7')">7</button>
    <button class='btn num' onclick="calcAction('num','8')">8</button>
    <button class='btn num' onclick="calcAction('num','9')">9</button>
    <button class='btn op' onclick="calcAction('op','×')">×</button>
    <button class='btn num' onclick="calcAction('num','4')">4</button>
    <button class='btn num' onclick="calcAction('num','5')">5</button>
    <button class='btn num' onclick="calcAction('num','6')">6</button>
    <button class='btn op' onclick="calcAction('op','−')">−</button>
    <button class='btn num' onclick="calcAction('num','1')">1</button>
    <button class='btn num' onclick="calcAction('num','2')">2</button>
    <button class='btn num' onclick="calcAction('num','3')">3</button>
    <button class='btn op' onclick="calcAction('op','+')">+</button>
    <button class='btn num wide' onclick="calcAction('num','0')">0</button>
    <button class='btn num' onclick="calcAction('dot')">.</button>
    <button class='btn op' onclick="calcAction('equals')">=</button>
  </div>
</div>
<style>
.calc-container { height:100%; display:flex; flex-direction:column; background:#1c1c1e; padding:0; overflow:hidden; }
.calc-display { padding:20px 24px 10px; text-align:right; flex-shrink:0; }
.calc-expression { font-size:16px; color:rgba(255,255,255,0.5); min-height:20px; margin-bottom:4px; }
.calc-result { font-size:48px; font-weight:300; color:white; overflow:hidden; text-overflow:ellipsis; }
.calc-buttons { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; padding:1px; flex:1; }
.btn { border:none; font-size:22px; font-weight:400; cursor:pointer; transition:0.1s; display:flex; align-items:center; justify-content:center; }
.btn:active { opacity:0.7; }
.btn.num { background:#333333; color:white; }
.btn.num:hover { background:#444444; }
.btn.func { background:#a5a5a5; color:black; }
.btn.func:hover { background:#b5b5b5; }
.btn.op { background:#ff9f0a; color:white; }
.btn.op:hover { background:#ffb340; }
.btn.op.active { background:white; color:#ff9f0a; }
.btn.wide { grid-column:span 2; }
</style>
<script>
var currentInput = '0';
var previousInput = '';
var operation = null;
var shouldReset = false;
var expression = '';

function updateDisplay() {
  document.getElementById('result').textContent = currentInput;
  document.getElementById('expression').textContent = expression;
}

function calcAction(type, value) {
  switch(type) {
    case 'num':
      if (shouldReset) { currentInput = ''; shouldReset = false; }
      if (currentInput === '0' && value !== '0') currentInput = value;
      else if (currentInput === '0' && value === '0') return;
      else currentInput += value;
      break;
    case 'dot':
      if (shouldReset) { currentInput = '0'; shouldReset = false; }
      if (!currentInput.includes('.')) currentInput += '.';
      break;
    case 'op':
      if (operation && !shouldReset) {
        calculate();
      }
      previousInput = currentInput;
      operation = value;
      expression = previousInput + ' ' + value;
      shouldReset = true;
      highlightOp(value);
      break;
    case 'equals':
      if (operation) {
        expression = previousInput + ' ' + operation + ' ' + currentInput + ' =';
        calculate();
        operation = null;
      }
      break;
    case 'clear':
      currentInput = '0';
      previousInput = '';
      operation = null;
      expression = '';
      shouldReset = false;
      break;
    case 'negate':
      if (currentInput !== '0') {
        currentInput = currentInput.startsWith('-') ? currentInput.slice(1) : '-' + currentInput;
      }
      break;
    case 'percent':
      currentInput = String(parseFloat(currentInput) / 100);
      break;
  }
  updateDisplay();
}

function calculate() {
  var a = parseFloat(previousInput);
  var b = parseFloat(currentInput);
  var result;
  switch(operation) {
    case '+': result = a + b; break;
    case '−': result = a - b; break;
    case '×': result = a * b; break;
    case '÷': result = b !== 0 ? a / b : 'Error'; break;
    default: return;
  }
  currentInput = typeof result === 'number' ? String(Math.round(result * 1e10) / 1e10) : result;
  previousInput = currentInput;
  shouldReset = true;
}

function highlightOp(op) {
  document.querySelectorAll('.btn.op').forEach(function(b) { b.classList.remove('active'); });
}

updateDisplay();
</script>`
};
