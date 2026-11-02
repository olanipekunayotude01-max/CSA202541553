const displayEl = document.getElementById("display");
const historyEl = document.getElementById("history");
const calculatorToggle = document.getElementById("calculator-toggle");
const calculatorPanel = document.getElementById("calculator-panel");
const calculatorClose = document.getElementById("calculator-close");
const pictureToggle = document.querySelector(".picture-toggle");
const picturePanel = document.getElementById("picture-panel");
const pictureClose = document.getElementById("picture-close");

if (pictureToggle && picturePanel && pictureClose) {
  function setPictureOpen(isOpen) {
    if (isOpen && calculatorPanel && calculatorToggle) {
      calculatorPanel.hidden = true;
      calculatorToggle.setAttribute("aria-expanded", "false");
    }
    picturePanel.hidden = !isOpen;
    pictureToggle.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) pictureClose.focus();
    else pictureToggle.focus();
  }

  pictureToggle.addEventListener("click", () => {
    setPictureOpen(picturePanel.hidden);
  });

  pictureClose.addEventListener("click", () => {
    setPictureOpen(false);
  });
}

if (displayEl && historyEl && calculatorToggle && calculatorPanel && calculatorClose) {
  let current = "0";
  let previous = null;
  let operator = null;
  let justEvaluated = false;

  function setCalculatorOpen(isOpen) {
    if (isOpen && picturePanel && pictureToggle) {
      picturePanel.hidden = true;
      pictureToggle.setAttribute("aria-expanded", "false");
    }
    calculatorPanel.hidden = !isOpen;
    calculatorToggle.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
      const firstKey = document.querySelector(".keys button");
      if (firstKey) firstKey.focus();
    } else {
      calculatorToggle.focus();
    }
  }

  calculatorToggle.addEventListener("click", () => {
    setCalculatorOpen(calculatorPanel.hidden);
  });

  calculatorClose.addEventListener("click", () => {
    setCalculatorOpen(false);
  });

  function update() {
    displayEl.textContent = current;
  }

  function inputNumber(n) {
    if (justEvaluated) {
      current = "0";
      justEvaluated = false;
    }
    if (n === "." && current.includes(".")) return;
    current = (current === "0" && n !== ".") ? n : current + n;
    update();
  }

  function compute(a, b, op) {
    a = parseFloat(a);
    b = parseFloat(b);
    let r;
    if (op === "+") r = a + b;
    else if (op === "−") r = a - b;
    else if (op === "×") r = a * b;
    else if (op === "÷") r = b === 0 ? NaN : a / b;
    if (!isFinite(r)) return "Error";
    return String(parseFloat(r.toPrecision(12)));
  }

  function chooseOperator(op) {
    if (current === "Error") return;
    if (operator && !justEvaluated && previous !== null) {
      current = compute(previous, current, operator);
    }
    previous = current;
    operator = op;
    historyEl.textContent = previous + " " + op;
    justEvaluated = true;
    update();
  }

  function equals() {
    if (operator === null || previous === null) return;
    const expr = previous + " " + operator + " " + current + " =";
    current = compute(previous, current, operator);
    historyEl.textContent = expr;
    previous = null;
    operator = null;
    justEvaluated = true;
    update();
  }

  function clearAll() {
    current = "0";
    previous = null;
    operator = null;
    justEvaluated = false;
    historyEl.textContent = "";
    update();
  }

  function backspace() {
    if (justEvaluated || current === "Error") {
      clearAll();
      return;
    }
    current = current.length > 1 ? current.slice(0, -1) : "0";
    update();
  }

  function percent() {
    if (current === "Error") return;
    current = String(parseFloat(current) / 100);
    update();
  }

  const keys = document.querySelector(".keys");
  if (keys) {
    keys.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      if (btn.dataset.num !== undefined) inputNumber(btn.dataset.num);
      else if (btn.dataset.op) chooseOperator(btn.dataset.op);
      else if (btn.dataset.action === "equals") equals();
      else if (btn.dataset.action === "clear") clearAll();
      else if (btn.dataset.action === "back") backspace();
      else if (btn.dataset.action === "percent") percent();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!calculatorPanel.hidden) setCalculatorOpen(false);
      else if (picturePanel && !picturePanel.hidden && pictureToggle && pictureClose) {
        picturePanel.hidden = true;
        pictureToggle.setAttribute("aria-expanded", "false");
        pictureToggle.focus();
      }
      return;
    }
    if (calculatorPanel.hidden) return;
    if (/^[0-9.]$/.test(e.key)) inputNumber(e.key);
    else if (e.key === "+") chooseOperator("+");
    else if (e.key === "-") chooseOperator("−");
    else if (e.key === "*") chooseOperator("×");
    else if (e.key === "/") { e.preventDefault(); chooseOperator("÷"); }
    else if (e.key === "Enter" || e.key === "=") { e.preventDefault(); equals(); }
    else if (e.key === "Backspace") backspace();
  });
}

