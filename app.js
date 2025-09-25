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

  updateTimeline({ yearsRemaining, hoursPerYear, totalHours, yearsContinuous });

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

function clampPositive(v) {
  return Math.max(0, parseFloat(v) || 0);
}

function getTimelineCopy(regainedHours) {
  if (regainedHours >= 60000) {
    return "Dock your phone outside the bedroom tonight and watch the reclaimed time cascade.";
  }
  if (regainedHours >= 35000) {
    return "Batch your news checks to two windows — the rest feeds deep focus blocks.";
  }
  return "Start with a single 25-minute slot off the feed and rebuild from there.";
}

function updateTimeline({ yearsRemaining, hoursPerYear, totalHours, yearsContinuous }) {
  const timeline = document.querySelector("[data-timeline]");
  if (!timeline) return;

  const cutHours = 3;
  const baselineHours = clampPositive(state.hpd);
  const actualCut = Math.min(cutHours, baselineHours);
  const afterHpd = clampPositive(baselineHours - actualCut);
  const regainedHours = actualCut * 365 * yearsRemaining;
  const regainedYears = regainedHours / 8760;
  const beforeYears = yearsContinuous;
  const afterYears = Math.max(0, beforeYears - regainedYears);

  $("timelineBeforeHpd").textContent = fmt(baselineHours, 2);
  $("timelineBeforeYears").textContent = fmt(beforeYears, 1);
  $("timelineBeforeEndAge").textContent = fmt(state.end);
  $("timelineCutHours").textContent = fmt(actualCut, 1);
  $("timelineAfterHpd").textContent = fmt(afterHpd, 2);
  $("timelineRegainedYears").textContent = fmt(regainedYears, 1);
  $("timelineRegainedHours").textContent = fmt(regainedHours, 0);

  const milestones = [
    {
      ageOffset: 1,
      before: "Another year of late-night scrolls steals your freshest focus blocks.",
      after: "You funnel that time into creative sprints that actually ship."
    },
    {
      ageOffset: 3,
      before: "Weekend plans keep getting postponed while the feed wins your attention.",
      after: "Those hours reappear as actual adventures on your calendar."
    },
    {
      ageOffset: 7,
      before: "Mastery projects stay on the someday list while the scroll loop repeats.",
      after: "You’ve logged enough deliberate practice to launch the next big chapter."
    },
    {
      ageOffset: 15,
      before: "The doomscroll dividend compounds — years blur with little to show.",
      after: "You’ve banked whole years of presence for people and projects that matter."
    }
  ];

  milestones.forEach((milestone, index) => {
    const ageId = `timelineAge${index + 1}`;
    const beforeId = `timelineBeforeText${index + 1}`;
    const afterId = `timelineAfterText${index + 1}`;
    const milestoneAge = clampPositive(state.age + milestone.ageOffset);
    $(ageId).textContent = `Age ${fmt(Math.min(milestoneAge, state.end), 0)}`;
    $(beforeId).textContent = milestone.before;
    $(afterId).textContent = milestone.after;
  });

  const progress = document.querySelector("[data-timeline] .timeline-progress");
  if (progress) {
    const percent = yearsRemaining ? Math.min(100, (regainedYears / yearsRemaining) * 100) : 0;
    progress.style.height = percent + "%";
  }

  const cta = $("timelineCtaCopy");
  if (cta) cta.textContent = getTimelineCopy(regainedHours);

  const ctaButton = $("timelineCtaButton");
  if (ctaButton) {
    const label = actualCut >= 1 ? `Lock in the ${fmt(actualCut, 1)}h cut` : "Lock in the cut";
    ctaButton.textContent = label;
  }
}


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

function drawStressChart() {
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

function revealOnScroll() {
  const animated = document.querySelectorAll("[data-animate]");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        if (entry.target.dataset.animateChart && entry.target.dataset.animateChart !== "done") {
          entry.target.querySelectorAll("canvas").forEach(canvas => {
            const id = canvas.id;
            if (id === "stressChart") drawStressChart();
            if (id === "sleepChart") drawSleepChart();
            if (id === "loopChart") drawLoopChart();
            if (id === "swapChart") drawSwapChart();
          });
          entry.target.dataset.animateChart = "done";
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });
  animated.forEach(el => observer.observe(el));
}

function observeTimelineItems() {
  const timelineSection = document.querySelector("[data-timeline]");
  if (!timelineSection) return;

  const items = timelineSection.querySelectorAll(".timeline-item");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5, rootMargin: "0px 0px -80px 0px" });

  items.forEach(item => observer.observe(item));
}

function bindTimelineCta() {
  const button = $("timelineCtaButton");
  if (!button) return;
  button.addEventListener("click", () => {
    button.classList.add("is-pressed");
    button.disabled = true;
    button.textContent = "Cut locked";
    setTimeout(() => {
      button.classList.remove("is-pressed");
      button.disabled = false;
      compute();
    }, 2200);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  revealOnScroll();
  observeTimelineItems();
  bind();
  bindTimelineCta();
  compute();
});
