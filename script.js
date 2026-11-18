const displayEl = document.getElementById("display");
const historyEl = document.getElementById("history");
const admissionsToggle = document.getElementById("admissions-toggle");
const admissionsPanel = document.getElementById("admissions-panel");
const admissionsClose = document.getElementById("admissions-close");
const calculatorToggle = document.getElementById("calculator-toggle");
const calculatorPanel = document.getElementById("calculator-panel");
const calculatorClose = document.getElementById("calculator-close");
const pictureToggle = document.querySelector(".picture-toggle");
const picturePanel = document.getElementById("picture-panel");
const pictureClose = document.getElementById("picture-close");
const resultsToggle = document.getElementById("results-toggle");
const resultsPanel = document.getElementById("results-panel");
const resultsClose = document.getElementById("results-close");
const studentResultsForm = document.getElementById("student-results-form");
const studentResultsMessage = document.getElementById("student-results-message");
const studentResultsWrap = document.getElementById("student-results-wrap");
const studentResultsList = document.getElementById("student-results-list");
const logoutButton = document.getElementById("logout-button");
const timetableToggle = document.getElementById("timetable-toggle");
const timetablePanel = document.getElementById("timetable-panel");
const timetableClose = document.getElementById("timetable-close");
const menuToggle = document.getElementById("menu-toggle");
const navigationDrawer = document.getElementById("navigation-drawer");
const drawerBackdrop = document.getElementById("drawer-backdrop");

if (menuToggle && navigationDrawer && drawerBackdrop) {
  function setDrawerOpen(isOpen) {
    navigationDrawer.classList.toggle("is-open", isOpen);
    drawerBackdrop.hidden = !isOpen;
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    if (isOpen) {
      const firstAction = navigationDrawer.querySelector("button");
      if (firstAction) firstAction.focus();
    } else {
      menuToggle.focus();
    }
  }

  menuToggle.addEventListener("click", () => {
    setDrawerOpen(!navigationDrawer.classList.contains("is-open"));
  });

  drawerBackdrop.addEventListener("click", () => {
    setDrawerOpen(false);
  });

  navigationDrawer.addEventListener("click", (event) => {
    if (event.target.closest("button")) setDrawerOpen(false);
  }, true);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigationDrawer.classList.contains("is-open")) {
      setDrawerOpen(false);
    }
  });
}

function hideResultsPanel() {
  if (!resultsPanel || !resultsToggle) return;
  resultsPanel.hidden = true;
  resultsToggle.setAttribute("aria-expanded", "false");
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    sessionStorage.removeItem("portalRole");
    window.location.replace("index.html");
  });
}

if (admissionsToggle && admissionsPanel && admissionsClose) {
  function setAdmissionsOpen(isOpen) {
    if (isOpen) {
      if (calculatorPanel && calculatorToggle) {
        calculatorPanel.hidden = true;
        calculatorToggle.setAttribute("aria-expanded", "false");
      }
      if (picturePanel && pictureToggle) {
        picturePanel.hidden = true;
        pictureToggle.setAttribute("aria-expanded", "false");
      }
      if (timetablePanel && timetableToggle) {
        timetablePanel.hidden = true;
        timetableToggle.setAttribute("aria-expanded", "false");
      }
      hideResultsPanel();
    }
    admissionsPanel.hidden = !isOpen;
    admissionsToggle.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) admissionsClose.focus();
    else admissionsToggle.focus();
  }

  admissionsToggle.addEventListener("click", () => {
    setAdmissionsOpen(admissionsPanel.hidden);
  });

  admissionsClose.addEventListener("click", () => {
    setAdmissionsOpen(false);
  });
}

if (resultsToggle && resultsPanel && resultsClose) {
  function setResultsOpen(isOpen) {
    if (isOpen) {
      if (admissionsPanel && admissionsToggle) {
        admissionsPanel.hidden = true;
        admissionsToggle.setAttribute("aria-expanded", "false");
      }
      if (timetablePanel && timetableToggle) {
        timetablePanel.hidden = true;
        timetableToggle.setAttribute("aria-expanded", "false");
      }
      if (calculatorPanel && calculatorToggle) {
        calculatorPanel.hidden = true;
        calculatorToggle.setAttribute("aria-expanded", "false");
      }
      if (picturePanel && pictureToggle) {
        picturePanel.hidden = true;
        pictureToggle.setAttribute("aria-expanded", "false");
      }
    }
    resultsPanel.hidden = !isOpen;
    resultsToggle.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) resultsClose.focus();
    else resultsToggle.focus();
  }

  resultsToggle.addEventListener("click", () => {
    setResultsOpen(resultsPanel.hidden);
  });

  resultsClose.addEventListener("click", () => {
    setResultsOpen(false);
  });
}

if (studentResultsForm && studentResultsMessage && studentResultsWrap && studentResultsList) {
  const admissionNumberInput = studentResultsForm.querySelector("#results-admission-number");
  admissionNumberInput.addEventListener("input", () => {
    studentResultsWrap.hidden = true;
    studentResultsList.replaceChildren();
    studentResultsMessage.textContent = "Search again to view results for this admission number.";
  });

  studentResultsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!studentResultsForm.reportValidity()) return;

    studentResultsWrap.hidden = true;
    studentResultsList.replaceChildren();
    const admissionNumber = admissionNumberInput.value.trim().toLowerCase();
    if (!admissionNumber) {
      studentResultsMessage.textContent = "Enter your admission number to search.";
      admissionNumberInput.focus();
      return;
    }
    let savedResults;

    try {
      const storedResults = localStorage.getItem("olanipekunStudentResults");
      savedResults = storedResults === null ? [] : JSON.parse(storedResults);
      if (!Array.isArray(savedResults) || !savedResults.every((result) =>
        result &&
        typeof result.studentName === "string" &&
        typeof result.studentId === "string" &&
        typeof result.studentClass === "string" &&
        typeof result.session === "string" &&
        typeof result.term === "string" &&
        typeof result.subject === "string" &&
        Number.isInteger(result.score) &&
        result.score >= 0 &&
        result.score <= 100
      )) {
        throw new Error("Saved results have an invalid format.");
      }
    } catch (error) {
      studentResultsMessage.textContent = "Results could not be loaded from this browser. Please contact the school office.";
      return;
    }

    const matchingResults = savedResults.filter((result) =>
      result.studentId.trim().toLowerCase() === admissionNumber
    );
    if (matchingResults.length === 0) {
      studentResultsMessage.textContent = savedResults.length === 0
        ? "No results have been saved yet."
        : "No results were found for that admission number.";
      return;
    }

    matchingResults.forEach((result) => {
      const row = document.createElement("tr");
      [
        result.studentName,
        result.studentClass,
        result.session,
        result.term,
        result.subject,
        result.score + " / 100"
      ].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      });
      studentResultsList.appendChild(row);
    });

    studentResultsWrap.hidden = false;
    studentResultsMessage.textContent = "Found " + matchingResults.length +
      (matchingResults.length === 1 ? " subject result." : " subject results.");
  });
}

if (timetableToggle && timetablePanel && timetableClose) {
  function setTimetableOpen(isOpen) {
    if (isOpen) {
      if (admissionsPanel && admissionsToggle) {
        admissionsPanel.hidden = true;
        admissionsToggle.setAttribute("aria-expanded", "false");
      }
      if (calculatorPanel && calculatorToggle) {
        calculatorPanel.hidden = true;
        calculatorToggle.setAttribute("aria-expanded", "false");
      }
      if (picturePanel && pictureToggle) {
        picturePanel.hidden = true;
        pictureToggle.setAttribute("aria-expanded", "false");
      }
      hideResultsPanel();
    }
    timetablePanel.hidden = !isOpen;
    timetableToggle.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) timetableClose.focus();
    else timetableToggle.focus();
  }

  timetableToggle.addEventListener("click", () => {
    setTimetableOpen(timetablePanel.hidden);
  });

  timetableClose.addEventListener("click", () => {
    setTimetableOpen(false);
  });
}

if (pictureToggle && picturePanel && pictureClose) {
  function setPictureOpen(isOpen) {
    if (isOpen && admissionsPanel && admissionsToggle) {
      admissionsPanel.hidden = true;
      admissionsToggle.setAttribute("aria-expanded", "false");
    }
    if (isOpen && calculatorPanel && calculatorToggle) {
      calculatorPanel.hidden = true;
      calculatorToggle.setAttribute("aria-expanded", "false");
    }
    if (isOpen && timetablePanel && timetableToggle) {
      timetablePanel.hidden = true;
      timetableToggle.setAttribute("aria-expanded", "false");
    }
    if (isOpen) hideResultsPanel();
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
    if (isOpen && admissionsPanel && admissionsToggle) {
      admissionsPanel.hidden = true;
      admissionsToggle.setAttribute("aria-expanded", "false");
    }
    if (isOpen && picturePanel && pictureToggle) {
      picturePanel.hidden = true;
      pictureToggle.setAttribute("aria-expanded", "false");
    }
    if (isOpen && timetablePanel && timetableToggle) {
      timetablePanel.hidden = true;
      timetableToggle.setAttribute("aria-expanded", "false");
    }
    if (isOpen) hideResultsPanel();
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
      if (admissionsPanel && !admissionsPanel.hidden && admissionsToggle) {
        admissionsPanel.hidden = true;
        admissionsToggle.setAttribute("aria-expanded", "false");
        admissionsToggle.focus();
      }
      else if (timetablePanel && !timetablePanel.hidden && timetableToggle) {
        timetablePanel.hidden = true;
        timetableToggle.setAttribute("aria-expanded", "false");
        timetableToggle.focus();
      }
      else if (resultsPanel && !resultsPanel.hidden && resultsToggle) {
        resultsPanel.hidden = true;
        resultsToggle.setAttribute("aria-expanded", "false");
        resultsToggle.focus();
      }
      else if (!calculatorPanel.hidden) setCalculatorOpen(false);
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
