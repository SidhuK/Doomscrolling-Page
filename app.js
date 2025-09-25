const $ = id => document.getElementById(id);
const fmt = (n, d = 0) => Number(n).toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d });

const state = {
  age: 31,
  end: 80,
  hpd: 6.5
};

const rangeIds = ["age", "end", "hpd"];

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function updateRangeFill(input) {
  if (!input) return;
  const min = parseFloat(input.min || 0);
  const max = parseFloat(input.max || 100);
  const value = parseFloat(input.value || 0);
  const ratio = max > min ? (value - min) / (max - min) : 0;
  input.style.setProperty("--range-fill", Math.max(0, Math.min(1, ratio)));
}

function syncRangeFill() {
  rangeIds.forEach(id => updateRangeFill($(id)));
}

function compute() {
  const yearsRemaining = Math.max(0, state.end - state.age);
  const hoursPerYear = state.hpd * 365;
  const hoursPerWeek = state.hpd * 7;
  const totalHours = hoursPerYear * yearsRemaining;
  const yearsContinuous = totalHours / 8760 || 0;
  const workYears = totalHours / 2000 || 0;
  const tenk = totalHours / 10000 || 0;
  const movies = totalHours / 1.5 || 0;
  const pomos = (totalHours * 60) / 25 || 0;
  const eightHourDays = totalHours / 8 || 0;
  const books = totalHours / 6;
  const weekends = totalHours / (16);
  const deepBlocks = totalHours / 4;

  syncRangeFill();

  $("totalHours").textContent = fmt(totalHours, totalHours >= 1000 ? 0 : 1);
  $("hoursPerYear").textContent = `≈ ${fmt(hoursPerYear, 1)} hours/year • ${fmt(hoursPerWeek, 1)} hours/week`;
  $("yearsContinuous").textContent = fmt(yearsContinuous, 1);
  $("workYears").textContent = fmt(workYears, 1);

  const doomShare = yearsRemaining ? (yearsContinuous / yearsRemaining) : 0;
  $("doomBar").style.width = fmt(clamp(doomShare * 100, 0, 100), 1) + "%";
  $("doomYearsLabel").textContent = fmt(yearsContinuous, 1) + " years";
  $("restYearsLabel").textContent = fmt(Math.max(0, yearsRemaining - yearsContinuous), 1) + " years for everything else";
  $("ageLabel").textContent = fmt(state.age);
  $("endAgeLabel").textContent = fmt(state.end);
  $("endAgeLabel2").textContent = fmt(state.end);
  $("doomYearsCallout").textContent = fmt(yearsContinuous, 1) + " years";
  $("hpdLabel").textContent = fmt(state.hpd, 2) + " h/day";

  $("tenk").textContent = fmt(tenk, 1);
  $("pomos").textContent = fmt(pomos, 0);
  $("movies").textContent = fmt(movies, 0);
  $("eightHourDays").textContent = fmt(eightHourDays, 0);
  $("booksLost").textContent = fmt(books, 0);
  $("weekendsLost").textContent = fmt(weekends, 0);
  $("deepBlocks").textContent = fmt(deepBlocks, 0);

  drawStressChart();
  drawSleepChart();
  drawLoopChart();
  drawSwapChart();

  function reclaimYears(deltaHpd) {
    const rh = deltaHpd * 365 * yearsRemaining;
    return rh / 8760;
  }
  $("reclaim1y").textContent = fmt(reclaimYears(1), 1);
  $("reclaim2y").textContent = fmt(reclaimYears(2), 1);
  $("reclaim3y").textContent = fmt(reclaimYears(3), 1);

  $("hpdHeader").textContent = fmt(state.hpd, 2);
  $("yearsRemainingHeader").textContent = fmt(yearsRemaining, 1);
  $("doomYearsHeader").textContent = fmt(yearsContinuous, 1);
  $("feedsJobHeader").textContent = fmt(workYears, 1);
  $("totalHoursHeader").textContent = fmt(totalHours, totalHours >= 1000 ? 0 : 1);
  $("pomosHeader").textContent = fmt(pomos, 0);
  $("tenkHeader").textContent = fmt(tenk, 1);
  $("moviesHeader").textContent = fmt(movies, 0);
}

function bind() {
  const pairs = [
    ["age", "ageNum", "age"],
    ["end", "endNum", "end"],
    ["hpd", "hpdNum", "hpd"]
  ];
  pairs.forEach(([rangeId, numId, key]) => {
    const r = $(rangeId);
    const n = $(numId);
    const push = val => {
      if (key === "age") {
        state.age = clamp(parseFloat(val) || 0, 0, 120);
        r.value = state.age;
        n.value = state.age;
      } else if (key === "end") {
        state.end = clamp(parseFloat(val) || 0, 1, 120);
        r.value = state.end;
        n.value = state.end;
      } else {
        state.hpd = clamp(parseFloat(val) || 0, 0, 24);
        r.value = state.hpd;
        n.value = state.hpd;
      }
      if (state.end < state.age) {
        state.end = state.age;
        $("end").value = state.end;
        $("endNum").value = state.end;
      }
      compute();
    };
    r.addEventListener("input", e => push(e.target.value));
    n.addEventListener("input", e => push(e.target.value));
  });
}

bind();
compute();

const ctx = (id) => {
  const c = document.getElementById(id);
  if (!c) return null;
  const dpr = window.devicePixelRatio || 1;
  c.width = c.clientWidth * dpr;
  c.height = c.clientHeight * dpr;
  const context = c.getContext("2d");
  if (context) context.scale(dpr, dpr);
  return context;
};

function drawStressChart(stress) {
  const c = ctx("stressChart");
  if (!c) return;
  const w = c.canvas.clientWidth;
  const h = c.canvas.clientHeight;
  c.clearRect(0, 0, w, h);
  const points = [25, 32, 38, 45, 55, 68, 84, 95];
  const max = Math.max(...points);
  const step = w / (points.length - 1);
  c.beginPath();
  c.strokeStyle = "rgba(255,51,99,0.8)";
  c.lineWidth = 2.6;
  points.forEach((value, i) => {
    const x = i * step;
    const y = h - (value / max) * (h * 0.8) - 10;
    if (i === 0) c.moveTo(x, y);
    else c.lineTo(x, y);
  });
  c.stroke();
  c.closePath();
}

function drawSleepChart() {
  const c = ctx("sleepChart");
  if (!c) return;
  const w = c.canvas.clientWidth;
  const h = c.canvas.clientHeight;
  c.clearRect(0, 0, w, h);
  const bars = [8, 7.2, 6.9, 6.1, 5.5, 4.8, 4.2];
  const barWidth = w / (bars.length * 1.8);
  const max = Math.max(...bars);
  bars.forEach((value, index) => {
    const x = 24 + index * (barWidth * 1.8);
    const height = (value / max) * (h * 0.75);
    c.fillStyle = `rgba(140,123,255,${0.22 + index * 0.07})`;
    c.fillRect(x, h - height - 12, barWidth, height);
  });
}

function drawLoopChart() {
  const c = ctx("loopChart");
  if (!c) return;
  const w = c.canvas.clientWidth;
  const h = c.canvas.clientHeight;
  c.clearRect(0, 0, w, h);
  const radius = Math.min(w, h) / 2 - 20;
  const centerX = w / 2;
  const centerY = h / 2;
  const slices = [
    { label: "Trigger", value: 30 },
    { label: "Scroll", value: 40 },
    { label: "Spike", value: 20 },
    { label: "Crash", value: 10 }
  ];
  let startAngle = -Math.PI / 2;
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  slices.forEach((slice, index) => {
    const angle = (slice.value / total) * Math.PI * 2;
    c.beginPath();
    c.moveTo(centerX, centerY);
    c.arc(centerX, centerY, radius, startAngle, startAngle + angle);
    c.closePath();
    const colors = ["#ff3363", "#f97316", "#facc15", "#22d3ee"];
    c.fillStyle = colors[index % colors.length] + "B3";
    c.fill();
    startAngle += angle;
  });
}

function drawSwapChart() {
  const c = ctx("swapChart");
  if (!c) return;
  const w = c.canvas.clientWidth;
  const h = c.canvas.clientHeight;
  c.clearRect(0, 0, w, h);
  const stacks = [
    { label: "Feeds", doom: 6.5, reclaimed: 3.4 },
    { label: "Focus", doom: 1.2, reclaimed: 4.0 },
    { label: "Recovery", doom: 0.8, reclaimed: 2.6 }
  ];
  const barWidth = w / (stacks.length * 2.2);
  stacks.forEach((stack, i) => {
    const x = 34 + i * (barWidth * 2.2);
    const doomHeight = (stack.doom / 8) * (h * 0.8);
    const reclaimHeight = (stack.reclaimed / 8) * (h * 0.8);
    c.fillStyle = "rgba(255,51,99,0.75)";
    c.fillRect(x, h - doomHeight - 16, barWidth, doomHeight);
    c.fillStyle = "rgba(110,245,255,0.55)";
    c.fillRect(x + barWidth + 6, h - reclaimHeight - 16, barWidth, reclaimHeight);
  });
}
