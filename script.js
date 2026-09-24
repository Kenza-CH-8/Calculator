const screen = document.getElementById('screen');
const btns = document.querySelectorAll('.grille-boutons button');

let justEvaluated = false; // true right after pressing "="

// Trigonometric functions in degrees (used by eval)
const sin = (x) => Math.sin((x * Math.PI) / 180);
const cos = (x) => Math.cos((x * Math.PI) / 180);
const tan = (x) => Math.tan((x * Math.PI) / 180);

const functions = ['sin', 'cos', 'tan', '√'];
const operators = ['+', '−', '×', '÷', '%', ')', '.'];

function calculate() {
  let expression = screen.value;

  // Convert display symbols to JavaScript operators
  expression = expression
    .replaceAll('×', '*')
    .replaceAll('÷', '/')
    .replaceAll('−', '-')
    .replaceAll('√', 'Math.sqrt');

  // 50% -> (50/100)
  expression = expression.replace(/(\d+\.?\d*)%/g, '($1/100)');

  // Close any missing parentheses
  const open = (expression.match(/\(/g) || []).length;
  const close = (expression.match(/\)/g) || []).length;
  expression += ')'.repeat(Math.max(0, open - close));

  const result = eval(expression);

  if (typeof result !== 'number' || !isFinite(result)) {
    throw new Error('Invalid result');
  }

  // Avoid floating point noise (0.1 + 0.2, sin(180)...)
  return parseFloat(result.toFixed(10));
}

btns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const text = btn.textContent.trim();

    if (text === 'CE') {
      screen.value = '0';
      justEvaluated = false;
    } else if (text === '⌫') {
      if (screen.value === 'Error') {
        screen.value = '0';
      } else {
        screen.value = screen.value.slice(0, -1) || '0';
      }
      justEvaluated = false;
    } else if (text === '=') {
      try {
        screen.value = calculate();
        justEvaluated = true;
      } catch (error) {
        screen.value = 'Error';
        justEvaluated = false;
      }
    } else {
      // Function buttons add an opening parenthesis: sin(, cos(, tan(, √(
      const toAdd = functions.includes(text) ? text + '(' : text;
      const isOperator = operators.includes(text);

      if (screen.value === 'Error') {
        screen.value = isOperator ? '0' + toAdd : toAdd;
      } else if (justEvaluated && !isOperator) {
        // Typing a number after a result starts a new calculation
        screen.value = toAdd;
      } else if (screen.value === '0' && !isOperator) {
        screen.value = toAdd;
      } else {
        screen.value += toAdd;
      }
      justEvaluated = false;
    }
  });
});