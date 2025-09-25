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
