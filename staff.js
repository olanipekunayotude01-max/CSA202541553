const resultsForm = document.getElementById("results-form");
const subjectRows = document.getElementById("subject-rows");
const subjectTemplate = document.getElementById("subject-template");
const addSubjectButton = document.getElementById("add-subject");
const resultsMessage = document.getElementById("results-message");
const resultsList = document.getElementById("results-list");
const resultsSearch = document.getElementById("results-search");
const saveResultsButton = resultsForm.querySelector(".save-results");
const storageKey = "olanipekunStudentResults";

function showMessage(message, isError) {
  resultsMessage.textContent = message;
  resultsMessage.classList.toggle("error", isError);
}

function isResultRecord(value) {
  return value &&
    typeof value.id === "string" &&
    typeof value.studentName === "string" &&
    typeof value.studentId === "string" &&
    typeof value.studentClass === "string" &&
    typeof value.session === "string" &&
    typeof value.term === "string" &&
    typeof value.subject === "string" &&
    typeof value.score === "number" &&
    Number.isInteger(value.score) &&
    value.score >= 0 &&
    value.score <= 100;
}

let results = [];
let storageAvailable = true;

try {
  const savedResults = localStorage.getItem(storageKey);
  if (savedResults !== null) {
    const parsedResults = JSON.parse(savedResults);
    if (!Array.isArray(parsedResults) || !parsedResults.every(isResultRecord)) {
      throw new Error("Stored results have an invalid format.");
    }
    results = parsedResults;
  }
} catch (error) {
  storageAvailable = false;
  saveResultsButton.disabled = true;
  addSubjectButton.disabled = true;
  showMessage("Saved results could not be loaded from this browser. Check browser storage before entering results.", true);
}

function persistResults(updatedResults) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(updatedResults));
    return true;
  } catch (error) {
    showMessage("Results could not be saved in this browser. Check browser storage and try again.", true);
    return false;
  }
}

function updateSubjectRows() {
  const rows = Array.from(subjectRows.querySelectorAll(".subject-row"));
  rows.forEach(function (row, index) {
    const subjectInput = row.querySelector('input[name="subject"]');
    const scoreInput = row.querySelector('input[name="score"]');
    const subjectLabel = row.querySelector('label[for], .field:first-child label');
    const scoreLabel = row.querySelector('.field:nth-child(2) label');
    const rowNumber = index + 1;
    subjectInput.id = "subject-" + rowNumber;
    scoreInput.id = "score-" + rowNumber;
    subjectLabel.htmlFor = subjectInput.id;
    scoreLabel.htmlFor = scoreInput.id;
    row.querySelector(".remove-subject").disabled = rows.length === 1;
  });
}

function renderResults() {
  const query = resultsSearch.value.trim().toLowerCase();
  const visibleResults = results.filter(function (result) {
    return result.studentName.toLowerCase().includes(query) ||
      result.studentId.toLowerCase().includes(query);
  });

  resultsList.replaceChildren();
  if (visibleResults.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 7;
    cell.className = "empty-results";
    cell.textContent = results.length === 0 ? "No results have been saved yet." : "No matching results.";
    row.appendChild(cell);
    resultsList.appendChild(row);
    return;
  }

  visibleResults.slice().reverse().forEach(function (result) {
    const row = document.createElement("tr");
    [
      result.studentName,
      result.studentId,
      result.studentClass,
      result.session + " · " + result.term,
      result.subject,
      result.score + " / 100"
    ].forEach(function (text) {
      const cell = document.createElement("td");
      cell.textContent = text;
      row.appendChild(cell);
    });

    const actionCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-result";
    deleteButton.dataset.resultId = result.id;
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", "Delete " + result.studentName + "'s " + result.subject + " result");
    actionCell.appendChild(deleteButton);
    row.appendChild(actionCell);
    resultsList.appendChild(row);
  });
}

addSubjectButton.addEventListener("click", function () {
  const row = subjectTemplate.content.cloneNode(true);
  subjectRows.appendChild(row);
  updateSubjectRows();
  subjectRows.lastElementChild.querySelector('input[name="subject"]').focus();
});

subjectRows.addEventListener("click", function (event) {
  const removeButton = event.target.closest(".remove-subject");
  if (!removeButton || subjectRows.querySelectorAll(".subject-row").length === 1) return;
  removeButton.closest(".subject-row").remove();
  updateSubjectRows();
});

subjectRows.addEventListener("input", function () {
  showMessage("", false);
});

resultsForm.addEventListener("input", function (event) {
  if (event.target.name !== "subject" && event.target.name !== "score") {
    showMessage("", false);
  }
});

resultsForm.addEventListener("submit", function (event) {
  event.preventDefault();
  if (!storageAvailable || !resultsForm.reportValidity()) return;

  const formData = new FormData(resultsForm);
  const subjects = Array.from(subjectRows.querySelectorAll(".subject-row")).map(function (row) {
    return {
      subject: row.querySelector('input[name="subject"]').value.trim(),
      score: Number(row.querySelector('input[name="score"]').value)
    };
  });
  const subjectNames = subjects.map(function (entry) {
    return entry.subject.toLowerCase();
  });
  if (subjectNames.some(function (name) { return !name; })) {
    showMessage("Enter a subject name for every score.", true);
    return;
  }
  if (new Set(subjectNames).size !== subjectNames.length) {
    showMessage("Each subject can only be entered once per student submission.", true);
    return;
  }

  const student = {
    studentName: formData.get("studentName").trim(),
    studentId: formData.get("studentId").trim(),
    studentClass: formData.get("studentClass"),
    session: formData.get("session").trim(),
    term: formData.get("term")
  };
  if (Object.values(student).some(function (value) { return !value.trim(); })) {
    showMessage("Enter all student details before saving.", true);
    return;
  }
  const timestamp = Date.now();
  const newResults = subjects.map(function (entry, index) {
    return {
      id: timestamp.toString(36) + "-" + index + "-" + Math.random().toString(36).slice(2),
      ...student,
      subject: entry.subject,
      score: entry.score
    };
  });
  const updatedResults = results.concat(newResults);
  if (!persistResults(updatedResults)) return;

  results = updatedResults;
  renderResults();
  resultsForm.reset();
  subjectRows.querySelectorAll(".subject-row:not(:first-child)").forEach(function (row) {
    row.remove();
  });
  updateSubjectRows();
  showMessage("Saved " + newResults.length + (newResults.length === 1 ? " subject result." : " subject results."), false);
  document.getElementById("student-name").focus();
});

resultsList.addEventListener("click", function (event) {
  const deleteButton = event.target.closest(".delete-result");
  if (!deleteButton) return;
  const updatedResults = results.filter(function (result) {
    return result.id !== deleteButton.dataset.resultId;
  });
  if (updatedResults.length === results.length) return;
  if (!persistResults(updatedResults)) return;

  results = updatedResults;
  renderResults();
  showMessage("Result deleted.", false);
});

resultsSearch.addEventListener("input", renderResults);

updateSubjectRows();
renderResults();
