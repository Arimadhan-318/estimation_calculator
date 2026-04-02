const initialState = {
  assumptions: {
    teamSize: 1,
    automationPercentage: 95,
    reusabilityPercentage: 5,
    aiAdvantagePercentage: 30,
    contingencyPercentage: 5,
    projectManagementPercentage: 15,
    stepsPerDay: 25,
    hoursPerDay: 9,
    daysPerWeek: 5,
    weeksPerMonth: 4.21,
    manualTcHours: 112.31411635825313,
  },
  applications: [
    {
      id: "stand",
      name: "STAND",
      testCases: 193,
      baseUnits: 871,
    },
    {
      id: "universal",
      name: "UNIVERSAL",
      testCases: 175,
      baseUnits: 647,
    },
  ],
  activities: [
    { id: "setup", name: "System & Application Study, Test Environment Setup", hours: 40 },
    { id: "framework", name: "Base Framework Implementation", hours: 40 },
    { id: "library", name: "Functional Library Development", hours: 35.99379663242042 },
    { id: "test-data", name: "Test Data Management", hours: 17.99689831621021 },
    { id: "maintenance", name: "Framework Maintenance", hours: 17.99689831621021 },
  ],
};

const state = structuredClone(initialState);
const demoCredentials = {
  username: "admin",
  password: "1234",
};

const loginScreen = document.querySelector("#login-screen");
const appShell = document.querySelector("#app-shell");
const loginForm = document.querySelector("#login-form");
const loginMessage = document.querySelector("#login-message");
const logoutButton = document.querySelector("#logout-button");
const form = document.querySelector("#estimator-form");
const applicationsList = document.querySelector("#applications-list");
const activitiesList = document.querySelector("#activities-list");
const summaryCards = document.querySelector("#summary-cards");
const effortBreakdown = document.querySelector("#effort-breakdown");
const withoutAiMetrics = document.querySelector("#without-ai-metrics");
const withAiMetrics = document.querySelector("#with-ai-metrics");
const comparisonBars = document.querySelector("#comparison-bars");

const numberFormat = (value, digits = 2) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);

const integerFormat = (value) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const safeNumber = (value, fallback = 0) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

function setLoginState(isLoggedIn) {
  if (isLoggedIn) {
    loginScreen.classList.add("hidden");
    loginScreen.hidden = true;
    loginScreen.style.display = "none";

    appShell.classList.remove("hidden");
    appShell.hidden = false;
    appShell.style.display = "block";
    return;
  }

  loginScreen.classList.remove("hidden");
  loginScreen.hidden = false;
  loginScreen.style.display = "grid";

  appShell.classList.add("hidden");
  appShell.hidden = true;
  appShell.style.display = "none";
}

function handleLogin(event) {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (username === demoCredentials.username && password === demoCredentials.password) {
    loginMessage.textContent = "Login successful.";
    loginMessage.classList.add("success");
    setLoginState(true);
    loginForm.reset();
    return;
  }

  loginMessage.textContent = "Invalid username or password.";
  loginMessage.classList.remove("success");
}

function handleLogout() {
  setLoginState(false);
  loginMessage.textContent = "";
  loginMessage.classList.remove("success");
}

function renderInputs() {
  Object.entries(state.assumptions).forEach(([key, value]) => {
    const input = form.elements.namedItem(key);
    if (input) {
      input.value = value;
    }
  });

  applicationsList.innerHTML = state.applications
    .map(
      (app, index) => `
        <div class="app-scope-box">
          <strong>${app.name}</strong>
          <div class="field-stack">
            <label class="field">
              <span>Test Case Development</span>
              <div class="input-with-unit">
                <input type="number" min="0" step="1" data-group="applications" data-index="${index}" data-key="baseUnits" value="${app.baseUnits}">
                <em>units</em>
              </div>
            </label>
            <label class="field">
              <span>Test Cases</span>
              <div class="input-with-unit">
                <input type="number" min="0" step="1" data-group="applications" data-index="${index}" data-key="testCases" value="${app.testCases}">
                <em>count</em>
              </div>
            </label>
          </div>
        </div>
      `
    )
    .join("");

  activitiesList.innerHTML = state.activities
    .map(
      (activity, index) => `
        <label class="activity-input-row">
          <span>${activity.name}</span>
          <div class="input-with-unit">
            <input type="number" min="0" step="0.01" data-group="activities" data-index="${index}" data-key="hours" value="${activity.hours}">
            <em>hours</em>
          </div>
        </label>
      `
    )
    .join("");
}

function calculate() {
  const a = state.assumptions;
  const automationFactor = a.automationPercentage / 100;
  const reusabilityFactor = a.reusabilityPercentage / 100;
  const contingencyFactor = a.contingencyPercentage / 100;
  const projectManagementFactor = a.projectManagementPercentage / 100;
  const aiFactor = a.aiAdvantagePercentage / 100;
  const hoursPerUnit = a.hoursPerDay / a.stepsPerDay;

  const appRows = state.applications.map((app) => {
    const hours = app.baseUnits * hoursPerUnit * automationFactor;
    return {
      ...app,
      hours,
    };
  });

  const testCaseDevelopment = appRows.reduce((sum, app) => sum + app.hours, 0);
  const reusabilityDeduction = testCaseDevelopment * reusabilityFactor;
  const migrationHours = a.manualTcHours * automationFactor;
  const totalAutomationScriptDevelopment =
    testCaseDevelopment - reusabilityDeduction + migrationHours;

  const implementationActivities = state.activities;
  const implementationSubtotal = implementationActivities.reduce((sum, activity) => sum + activity.hours, 0);
  const contingencyHours = totalAutomationScriptDevelopment * contingencyFactor;
  const projectManagementHours =
    (totalAutomationScriptDevelopment + implementationSubtotal) * projectManagementFactor;
  const totalWithoutAi =
    totalAutomationScriptDevelopment + implementationSubtotal + contingencyHours + projectManagementHours;
  const totalWithAi = totalWithoutAi * (1 - aiFactor);
  const hoursSaved = totalWithoutAi - totalWithAi;
  const perResourceAi = totalWithAi / Math.max(a.teamSize, 1);

  const toDays = (hours) => hours / a.hoursPerDay;
  const toWeeks = (hours) => toDays(hours) / a.daysPerWeek;
  const toMonths = (hours) => toWeeks(hours) / a.weeksPerMonth;

  return {
    appRows,
    implementationActivities,
    totals: {
      testCaseDevelopment,
      reusabilityDeduction,
      migrationHours,
      totalAutomationScriptDevelopment,
      implementationSubtotal,
      contingencyHours,
      projectManagementHours,
      totalWithoutAi,
      totalWithAi,
      hoursSaved,
      perResourceAi,
      withoutAiDays: toDays(totalWithoutAi),
      withoutAiWeeks: toWeeks(totalWithoutAi),
      withoutAiMonths: toMonths(totalWithoutAi),
      withAiDays: toDays(totalWithAi),
      withAiWeeks: toWeeks(totalWithAi),
      withAiMonths: toMonths(totalWithAi),
      perResourceDays: toDays(perResourceAi),
      perResourceWeeks: toWeeks(perResourceAi),
      perResourceMonths: toMonths(perResourceAi),
    },
  };
}

function renderSummary(model) {
  const { totals } = model;
  const items = [
    {
      className: "",
      label: "Total Effort (No AI)",
      value: integerFormat(Math.round(totals.totalWithoutAi)),
      note: "hours",
    },
    {
      className: "green",
      label: "Effort With AI",
      value: integerFormat(Math.round(totals.totalWithAi)),
      note: "hours",
    },
    {
      className: "orange",
      label: "Hours Saved",
      value: integerFormat(Math.round(totals.hoursSaved)),
      note: `${numberFormat(state.assumptions.aiAdvantagePercentage, 0)}% reduction`,
    },
    {
      className: "purple",
      label: "Per Resource (AI)",
      value: integerFormat(Math.round(totals.perResourceAi)),
      note: `${integerFormat(state.assumptions.teamSize)} resource`,
    },
  ];

  summaryCards.innerHTML = items
    .map(
      (item) => `
        <section class="summary-card ${item.className}">
          <h3>${item.label}</h3>
          <strong>${item.value}</strong>
          <p>${item.note}</p>
        </section>
      `
    )
    .join("");
}

function rowMarkup(label, hours, note = "", rowClass = "") {
  const days = hours / state.assumptions.hoursPerDay;
  const weeks = days / state.assumptions.daysPerWeek;
  const months = weeks / state.assumptions.weeksPerMonth;
  return `
    <tr class="${rowClass}">
      <td>${label}${note}</td>
      <td>${numberFormat(hours, 0)}</td>
      <td>${numberFormat(days)}</td>
      <td>${numberFormat(weeks)}</td>
      <td>${numberFormat(months)}</td>
    </tr>
  `;
}

function renderTable(model) {
  const { totals } = model;
  effortBreakdown.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Activity</th>
          <th>Hours</th>
          <th>Days</th>
          <th>Weeks</th>
          <th>Months</th>
        </tr>
      </thead>
      <tbody>
        <tr class="section-row">
          <td colspan="5">Automation Script Development</td>
        </tr>
        ${rowMarkup("Test Case Development", totals.testCaseDevelopment)}
        ${rowMarkup(
          `Reusability (${numberFormat(state.assumptions.reusabilityPercentage, 0)}%) - Deduction`,
          -totals.reusabilityDeduction,
          "",
          ""
        ).replace(`<td>${numberFormat(-totals.reusabilityDeduction, 0)}</td>`, `<td class="negative">${numberFormat(-totals.reusabilityDeduction, 0)}</td>`)}
        ${rowMarkup("TCs Development - Migration Tool", totals.migrationHours)}
        ${rowMarkup("Total Automation Script Development", totals.totalAutomationScriptDevelopment, "", "subtotal-row")}
        <tr class="section-row">
          <td colspan="5">Test Automation Implementation</td>
        </tr>
        ${model.implementationActivities
          .map((activity) => {
            const note =
              activity.id === "library"
                ? ` <span class="pill-note purple">${numberFormat((activity.hours / totals.totalAutomationScriptDevelopment) * 100, 0)}%</span>`
                : activity.id === "test-data" || activity.id === "maintenance"
                  ? ` <span class="pill-note purple">${numberFormat((activity.hours / totals.totalAutomationScriptDevelopment) * 100, 0)}%</span>`
                  : "";
            return rowMarkup(activity.name, activity.hours, note);
          })
          .join("")}
        ${rowMarkup("Sub Total - Implementation", totals.implementationSubtotal, "", "subtotal-row")}
        <tr class="section-row">
          <td colspan="5">Total Engagement Effort</td>
        </tr>
        ${rowMarkup("Total Automation Script Development", totals.totalAutomationScriptDevelopment)}
        ${rowMarkup("Test Automation Implementation", totals.implementationSubtotal)}
        ${rowMarkup(
          `Contingency / Risk <span class="pill-note orange">${numberFormat(state.assumptions.contingencyPercentage, 0)}%</span>`,
          totals.contingencyHours
        )}
        ${rowMarkup(
          `Project Management <span class="pill-note orange">${numberFormat(state.assumptions.projectManagementPercentage, 0)}%</span>`,
          totals.projectManagementHours
        )}
        ${rowMarkup("Grand Total", totals.totalWithoutAi, "", "grand-row")}
        ${rowMarkup(
          `AI Productivity Advantage <span class="pill-note green">${numberFormat(state.assumptions.aiAdvantagePercentage, 0)}% savings</span>`,
          totals.totalWithAi,
          "",
          "ai-row"
        )}
        ${rowMarkup(
          `For ${integerFormat(state.assumptions.teamSize)} Resource <span class="pill-note purple">${integerFormat(state.assumptions.teamSize)} resource</span>`,
          totals.perResourceAi,
          "",
          "resource-row"
        )}
      </tbody>
    </table>
  `;
}

function renderMetricLists(model) {
  const { totals } = model;
  const withoutAi = [
    ["Total Hours", totals.totalWithoutAi],
    ["Total Days", totals.withoutAiDays],
    ["Total Weeks", totals.withoutAiWeeks],
    ["Total Months", totals.withoutAiMonths],
  ];
  const withAi = [
    ["Total Hours", totals.totalWithAi],
    ["Total Days", totals.withAiDays],
    ["Total Weeks", totals.withAiWeeks],
    ["Total Months", totals.withAiMonths],
  ];

  withoutAiMetrics.innerHTML = withoutAi
    .map(
      ([label, value]) => `
        <div class="metric-item">
          <span>${label}</span>
          <strong>${numberFormat(value)}</strong>
        </div>
      `
    )
    .join("");

  withAiMetrics.innerHTML = withAi
    .map(
      ([label, value]) => `
        <div class="metric-item">
          <span>${label}</span>
          <strong>${numberFormat(value)}</strong>
        </div>
      `
    )
    .join("");
}

function renderBars(model) {
  const { totals } = model;
  const max = Math.max(totals.totalWithoutAi, totals.totalWithAi, 1);
  const rows = [
    {
      label: "Without AI",
      value: totals.totalWithoutAi,
      className: "blue",
    },
    {
      label: "With AI (Saved)",
      value: totals.totalWithAi,
      className: "green",
    },
  ];

  comparisonBars.innerHTML = rows
    .map(
      (row) => `
        <div class="bar-row">
          <span>${row.label}</span>
          <div class="track">
            <div class="fill ${row.className}" style="width: ${(row.value / max) * 100}%"></div>
          </div>
          <div class="bar-value">${numberFormat(row.value, 0)} h</div>
        </div>
      `
    )
    .join("");
}

function renderAll() {
  const model = calculate();
  renderSummary(model);
  renderTable(model);
  renderMetricLists(model);
  renderBars(model);
}

function updateStateFromInput(input) {
  if (input.name) {
    state.assumptions[input.name] = safeNumber(input.value, state.assumptions[input.name]);
    return;
  }

  const group = input.dataset.group;
  const index = Number.parseInt(input.dataset.index, 10);
  const key = input.dataset.key;
  if (!group || Number.isNaN(index) || !key) {
    return;
  }

  if (input.type === "checkbox") {
    state[group][index][key] = input.checked;
    return;
  }

  state[group][index][key] = safeNumber(input.value, state[group][index][key]);
}

form.addEventListener("input", (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) {
    return;
  }
  updateStateFromInput(input);
  renderAll();
});

loginForm.addEventListener("submit", handleLogin);
logoutButton.addEventListener("click", handleLogout);

renderInputs();
renderAll();
setLoginState(false);
