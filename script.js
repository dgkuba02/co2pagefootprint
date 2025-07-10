const transportFactors = {
  car: 0.404 / 1.609, // ~0.251
  bus: 0.089 / 1.609, // ~0.055
  plane: 0.255 / 1.609, // ~0.158
  train: 0.041 / 1.609, // ~0.025
};

const foodMealFactors = {
  "meat-heavy": 3.5,
  "low-meat": 2.0,
  vegetarian: 1.5,
  vegan: 1.0,
};

const powerUsageKw = {
  lights: 0.06,
  appliances: 0.5,
  heating: 2,
};

const electricityEmissionFactor = 0.417;

const avgDailyFootprint = 21;

const transportEntriesDiv = document.getElementById("transportEntries");
const foodEntriesDiv = document.getElementById("foodEntries");
const energyEntriesDiv = document.getElementById("energyEntries");
const form = document.getElementById("footprintForm");

function createElement(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, val]) => {
    if (key === "className") el.className = val;
    else if (key.startsWith("on") && typeof val === "function")
      el.addEventListener(key.substring(2).toLowerCase(), val);
    else el.setAttribute(key, val);
  });
  children.forEach((child) => {
    if (typeof child === "string")
      el.appendChild(document.createTextNode(child));
    else if (child) el.appendChild(child);
  });
  return el;
}

function addTransportEntry() {
  const row = createElement("div", { className: "entry-row" });

  const select = createElement("select", {
    name: "transportType",
    required: true,
  });
  ["car", "bus", "plane", "train"].forEach((t) => {
    const option = createElement(
      "option",
      { value: t },
      t.charAt(0).toUpperCase() + t.slice(1)
    );
    select.appendChild(option);
  });

  const input = createElement("input", {
    type: "number",
    name: "transportKm",
    min: "0",
    step: "any",
    placeholder: "kilometers",
    required: true,
  });

  const removeBtn = createElement(
    "button",
    { type: "button", className: "remove-btn" },
    "×"
  );
  removeBtn.addEventListener("click", () => row.remove());

  row.appendChild(select);
  row.appendChild(input);
  row.appendChild(removeBtn);
  transportEntriesDiv.appendChild(row);
}

function addFoodEntry() {
  const row = createElement("div", { className: "entry-row" });

  const select = createElement("select", {
    name: "foodMeal",
    required: true,
  });
  [
    { value: "meat-heavy", label: "Meat-heavy meal" },
    { value: "low-meat", label: "Low meat meal" },
    { value: "vegetarian", label: "Vegetarian meal" },
    { value: "vegan", label: "Vegan meal" },
  ].forEach((opt) => {
    const option = createElement("option", { value: opt.value }, opt.label);
    select.appendChild(option);
  });

  const input = createElement("input", {
    type: "number",
    name: "foodMealCount",
    min: "0",
    step: "1",
    placeholder: "number of meals",
    required: true,
  });

  const removeBtn = createElement(
    "button",
    { type: "button", className: "remove-btn" },
    "×"
  );
  removeBtn.addEventListener("click", () => row.remove());

  row.appendChild(select);
  row.appendChild(input);
  row.appendChild(removeBtn);
  foodEntriesDiv.appendChild(row);
}

function addEnergyEntry() {
  const row = createElement("div", { className: "entry-row" });

  const select = createElement("select", {
    name: "energyType",
    required: true,
  });
  [
    { value: "lights", label: "Lights on" },
    { value: "appliances", label: "Appliances on" },
    { value: "heating", label: "Heating on" },
  ].forEach((opt) => {
    const option = createElement("option", { value: opt.value }, opt.label);
    select.appendChild(option);
  });

  const input = createElement("input", {
    type: "number",
    name: "energyHours",
    min: "0",
    max: "24",
    step: "any",
    placeholder: "hours",
    required: true,
  });

  const removeBtn = createElement(
    "button",
    { type: "button", className: "remove-btn" },
    "×"
  );
  removeBtn.addEventListener("click", () => row.remove());

  row.appendChild(select);
  row.appendChild(input);
  row.appendChild(removeBtn);
  energyEntriesDiv.appendChild(row);
}

addTransportEntry();
addFoodEntry();
addEnergyEntry();

document
  .getElementById("addTransportBtn")
  .addEventListener("click", addTransportEntry);
document.getElementById("addFoodBtn").addEventListener("click", addFoodEntry);
document
  .getElementById("addEnergyBtn")
  .addEventListener("click", addEnergyEntry);

form.addEventListener("submit", (e) => {
  e.preventDefault();

  let transportCO2 = 0;
  for (const row of transportEntriesDiv.querySelectorAll(".entry-row")) {
    const type = row.querySelector('select[name="transportType"]').value;
    const km = parseFloat(row.querySelector('input[name="transportKm"]').value);
    if (isNaN(km) || km < 0) {
      alert(
        "Please enter a valid positive number of kilometers for transport."
      );
      return;
    }
    transportCO2 += (transportFactors[type] || 0) * km;
  }

  let foodCO2 = 0;
  for (const row of foodEntriesDiv.querySelectorAll(".entry-row")) {
    const mealType = row.querySelector('select[name="foodMeal"]').value;
    const count = parseInt(
      row.querySelector('input[name="foodMealCount"]').value
    );
    if (isNaN(count) || count < 0) {
      alert("Please enter a valid number of meals (0 or more).");
      return;
    }
    foodCO2 += (foodMealFactors[mealType] || 0) * count;
  }

  let energyCO2 = 0;
  for (const row of energyEntriesDiv.querySelectorAll(".entry-row")) {
    const energyType = row.querySelector('select[name="energyType"]').value;
    const hours = parseFloat(
      row.querySelector('input[name="energyHours"]').value
    );
    if (isNaN(hours) || hours < 0 || hours > 24) {
      alert("Please enter a valid number of hours (0-24) for energy usage.");
      return;
    }
    const kwh = (powerUsageKw[energyType] || 0) * hours;
    energyCO2 += kwh * electricityEmissionFactor;
  }

  const totalCO2 = transportCO2 + foodCO2 + energyCO2;

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = `
      <h2>Your Estimated Carbon Footprint Today</h2>
      <p><strong>Total:</strong> ${totalCO2.toFixed(2)} kg CO₂</p>
      <div class="breakdown">
        <p>Transport: ${transportCO2.toFixed(2)} kg CO₂</p>
        <p>Food: ${foodCO2.toFixed(2)} kg CO₂</p>
        <p>Energy: ${energyCO2.toFixed(2)} kg CO₂</p>
      </div>
      <p class="message">${
        totalCO2 > avgDailyFootprint
          ? "Your footprint is above average. Consider greener choices!"
          : "Good job! Your footprint is below average."
      }</p>
    `;
});
