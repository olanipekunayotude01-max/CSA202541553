const displayEl = document.getElementById("display");
const historyEl = document.getElementById("history");

let current = "0";
let previous = null;
let operator = null;
let justEvaluated = false;

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

// Button clicks
document.querySelector(".keys").addEventListener("click", (e) => {
const btn = e.target.closest("button");
if (!btn) return;
if (btn.dataset.num !== undefined) inputNumber(btn.dataset.num);
else if (btn.dataset.op) chooseOperator(btn.dataset.op);
else if (btn.dataset.action === "equals") equals();
else if (btn.dataset.action === "clear") clearAll();
else if (btn.dataset.action === "back") backspace();
else if (btn.dataset.action === "percent") percent();
});

// Keyboard support
document.addEventListener("keydown", (e) => {
if (/^[0-9.]$/.test(e.key)) inputNumber(e.key);
else if (e.key === "+") chooseOperator("+");
else if (e.key === "-") chooseOperator("−");
else if (e.key === "*") chooseOperator("×");
else if (e.key === "/") { e.preventDefault(); chooseOperator("÷"); }
else if (e.key === "Enter" || e.key === "=") { e.preventDefault(); equals(); }
else if (e.key === "Backspace") backspace();
else if (e.key === "Escape") clearAll();
});