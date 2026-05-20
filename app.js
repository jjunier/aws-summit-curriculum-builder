"use strict";

const RECOMMENDED_DAY20_IDS = [
  "KEY001",
  "IND228",
  "IND206",
  "PRT304-S",
  "IND232",
  "IND215"
];

const RECOMMENDED1_DAY21_IDS = [
  "KEY002",
  "ANT305",
  "ANT201",
  "PRT207-S",
  "ANT303",
  "CNS401",
  "ANT202"
];

const RECOMMENDED2_DAY21_IDS = [
  "KEY002",
  "ANT305",
  "DEV307",
  "PRT201-S",
  "ANT303",
  "PRT103-S",
  "ANT202"
];

const RECOMMENDED1_IDS = [...RECOMMENDED_DAY20_IDS, ...RECOMMENDED1_DAY21_IDS];
const RECOMMENDED2_IDS = [...RECOMMENDED_DAY20_IDS, ...RECOMMENDED2_DAY21_IDS];const DAY_START = 9 * 60;
const DAY_END = 17 * 60;
const HOUR_HEIGHT = 144;
const DAY_HEADER_HEIGHT = 42;
const MIN_BLOCK_HEIGHT = 48;
const TOPIC_COLOR = { Data: "#2563eb", Platform: "#059669", Ops: "#7c3aed", Security: "#dc2626", Career: "#d97706" };
const DIFFICULTY_ORDER = { Foundational: 1, Intermediate: 2, Advanced: 3, Expert: 4 };

let sessions = [];
const selected = new Set();
const $ = (id) => document.getElementById(id);

const THEME_STORAGE_KEY = "aws-summit-theme";

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toMinutes(time) {
  const match = String(time || "").match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return 0;
  return Number(match[1]) * 60 + Number(match[2]);
}

function duration(session) {
  return Math.max(0, toMinutes(session.end) - toMinutes(session.start));
}

function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes}분`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${remainingMinutes}분`;
}

function dateLabel(date) {
  return date === "2026-05-20" ? "5월 20일" : "5월 21일";
}

function normalizeSessions(data) {
  return data
    .map((raw) => {
      const session = { ...raw };
      const start = String(session.start || "").trim();
      const end = String(session.end || "").trim();
      return {
        id: String(session.id || "").trim(),
        date: String(session.date || "2026-05-21").trim(),
        time: String(session.time || `${start} - ${end}`).trim(),
        start,
        end,
        title: String(session.title || "").trim(),
        speaker: String(session.speaker || "-").trim(),
        language: String(session.language || "Korean").trim(),
        difficulty: String(session.difficulty || "Intermediate").trim(),
        topic: String(session.topic || "Data").trim(),
        relevance: String(session.relevance || "").trim()
      };
    })
    .filter((session) => session.id && session.start && session.end && session.title);
}

function csvEscape(value) {
  const text = String(value ?? "");
  const needsQuotes = text.includes(",") || text.includes('"') || text.includes("\n") || text.includes("\r");
  if (!needsQuotes) return text;
  return '"' + text.replaceAll('"', '""') + '"';
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(anchor.href);
}

async function loadSessionData() {
  try {
    const response = await fetch("./sessions.json", { cache: "no-store" });
    if (!response.ok) throw new Error("sessions.json not found");
    const data = await response.json();
    sessions = normalizeSessions(data);
  } catch (error) {
    console.error("세션 데이터를 불러오지 못했습니다.", error);
    sessions = [];
    $("sessionList").innerHTML = '<div class="empty">sessions.json 파일을 불러오지 못했습니다. 로컬 서버로 실행하거나 파일 업로드를 사용하세요.</div>';
  } finally {
    updateAll();
  }
}

function filteredSessions() {
  const keyword = $("searchInput").value.trim().toLowerCase();
  const day = $("dayFilter").value;
  const difficulty = $("difficultyFilter").value;
  const topic = $("topicFilter").value;

  return sessions
    .filter((session) => {
      const haystack = [session.id, session.title, session.speaker, session.language, session.difficulty, session.topic, dateLabel(session.date)].join(" ").toLowerCase();
      return (!keyword || haystack.includes(keyword))
        && (day === "all" || session.date === day)
        && (difficulty === "all" || session.difficulty === difficulty)
        && (topic === "all" || session.topic === topic);
    })
    .sort((a, b) =>
      a.date.localeCompare(b.date)
      || toMinutes(a.start) - toMinutes(b.start)
      || toMinutes(a.end) - toMinutes(b.end)
      || a.id.localeCompare(b.id)
    );
}

function renderList() {
  const list = $("sessionList");
  const data = filteredSessions();
  list.innerHTML = "";

  if (data.length === 0) {
    list.innerHTML = '<div class="empty">조건에 맞는 세션이 없습니다.</div>';
    return;
  }

  data.forEach((session) => {
    const article = document.createElement("article");
    article.className = "session" + (selected.has(session.id) ? " selected" : "");
    article.innerHTML = `
      <div class="session-top">
        <span class="code">${escapeHTML(session.id)}</span>
        <span class="time">${escapeHTML(dateLabel(session.date))} · ${escapeHTML(session.time)}</span>
      </div>
      <h3 class="title">${escapeHTML(session.title)}</h3>
      <p class="speaker">${escapeHTML(session.speaker)} · ${escapeHTML(session.language)}</p>
      <div class="tags">
        <span class="tag ${session.date === "2026-05-20" ? "day20" : "day21"}">${escapeHTML(dateLabel(session.date))}</span>
        <span class="tag ${escapeHTML(session.topic.toLowerCase())}">${escapeHTML(session.topic)}</span>
        <span class="tag ${session.difficulty === "Expert" ? "expert" : ""}">${escapeHTML(session.difficulty)}</span>
      </div>
      <div class="actions">
        <button class="btn-ghost" data-action="detail" data-id="${escapeHTML(session.id)}">연관성 보기</button>
        <button class="${selected.has(session.id) ? "btn-danger" : "btn-primary"}" data-action="toggle" data-id="${escapeHTML(session.id)}">
          ${selected.has(session.id) ? "제거" : "추가"}
        </button>
      </div>
      <p class="relevance">${escapeHTML(session.relevance)}</p>
    `;
    list.appendChild(article);
  });
}

function renderAxis() {
  const axis = $("timeAxis");
  axis.innerHTML = '<div class="axis-head"></div>';

  for (let hour = 9; hour <= 16; hour += 1) {
    const label = document.createElement("div");
    label.className = "time-label";
    label.textContent = String(hour).padStart(2, "0") + ":00";
    axis.appendChild(label);
  }

  const height = ((DAY_END - DAY_START) / 60) * HOUR_HEIGHT + DAY_HEADER_HEIGHT;

  [axis, $("day20"), $("day21")].forEach((element) => {
    element.style.height = height + "px";
  });
}

function detectConflicts(selectedSessions) {
  const ids = new Set();
  for (let i = 0; i < selectedSessions.length; i += 1) {
    for (let j = i + 1; j < selectedSessions.length; j += 1) {
      const a = selectedSessions[i];
      const b = selectedSessions[j];
      const overlaps = a.date === b.date && toMinutes(a.start) < toMinutes(b.end) && toMinutes(b.start) < toMinutes(a.end);
      if (overlaps) {
        ids.add(a.id);
        ids.add(b.id);
      }
    }
  }
  return ids;
}

function renderSchedule() {
  $("day20").innerHTML = '<div class="day-head">5월 20일</div>';
  $("day21").innerHTML = '<div class="day-head">5월 21일</div>';

  const selectedSessions = sessions.filter((session) => selected.has(session.id)).sort((a, b) => a.date.localeCompare(b.date) || toMinutes(a.start) - toMinutes(b.start));
  const conflictIds = detectConflicts(selectedSessions);
  const selectedList = $("selectedList");
  selectedList.innerHTML = "";

  selectedSessions.forEach((session) => {
    const column = session.date === "2026-05-20" ? $("day20") : $("day21");
    const block = document.createElement("div");

    const sessionDuration = duration(session);
    const rawHeight = (sessionDuration / 60) * HOUR_HEIGHT;
    const blockHeight = Math.max(rawHeight, MIN_BLOCK_HEIGHT);

    const durationClass =
      sessionDuration <= 20 ? " compact" :
      sessionDuration <= 40 ? " short" :
      sessionDuration <= 60 ? " regular" :
      " tall";

    block.className =
      "block"
      + (conflictIds.has(session.id) ? " conflict" : "")
      + durationClass;

    block.style.top = (DAY_HEADER_HEIGHT + ((toMinutes(session.start) - DAY_START) / 60) * HOUR_HEIGHT) + "px";
    block.style.height = blockHeight + "px";
    block.style.background = TOPIC_COLOR[session.topic] || "#2563eb";
    block.title = `${session.title}\n${session.id} · ${session.time} · ${session.difficulty}`;

    block.innerHTML = `
      <button data-action="remove" data-id="${escapeHTML(session.id)}">×</button>
      <p class="block-title">${escapeHTML(session.title)}</p>
      <div class="block-meta">${escapeHTML(session.id)} · ${escapeHTML(session.time)} · ${escapeHTML(session.difficulty)}</div>
    `;
    column.appendChild(block);

    const item = document.createElement("div");
    item.className = "selected-item";
    item.innerHTML = `<div><strong>${escapeHTML(dateLabel(session.date))} · ${escapeHTML(session.title)}</strong><span>${escapeHTML(session.id)} · ${escapeHTML(session.time)} · ${escapeHTML(session.speaker)}</span></div><button class="btn-danger" data-action="remove" data-id="${escapeHTML(session.id)}">제거</button>`;
    selectedList.appendChild(item);
  });

  if (selectedSessions.length === 0) {
    selectedList.innerHTML = '<div class="empty">아직 추가된 세션이 없습니다. 왼쪽 목록에서 세션을 추가하세요.</div>';
  }

  const total = selectedSessions.reduce((sum, session) => sum + duration(session), 0);
  $("selectedCount").textContent = selectedSessions.length + "개";
  $("totalMinutes").textContent = formatDuration(total);
  $("conflictCount").textContent = conflictIds.size + "개 세션";

  if (conflictIds.size > 0) {
    $("conflictNotice").className = "notice show";
    $("conflictNotice").textContent = "시간이 겹치는 세션이 있습니다: " + selectedSessions.filter((session) => conflictIds.has(session.id)).map((session) => `${dateLabel(session.date)} ${session.id} ${session.time}`).join(", ");
  } else {
    $("conflictNotice").className = "notice";
    $("conflictNotice").textContent = "";
  }
}

function updateAll() {
  renderList();
  renderSchedule();
}

function getPreferredTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);

  const button = $("themeToggle");
  if (button) {
    button.textContent = theme === "dark" ? "라이트 모드" : "다크 모드";
    button.setAttribute("aria-label", theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환");
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  applyTheme(currentTheme === "dark" ? "light" : "dark");
}

function applyRecommendedCurriculum(ids) {
  selected.clear();

  ids.forEach((id) => {
    if (sessions.some((session) => session.id === id)) {
      selected.add(id);
    }
  });

  updateAll();
}

function runSmokeTests() {
  console.group("AWS Summit curriculum builder smoke tests");

  console.assert(toMinutes("11:10") === 670, "toMinutes parses HH:mm");
  console.assert(duration({ start: "11:10", end: "11:50" }) === 40, "duration returns minutes");
  console.assert(csvEscape("A,B") === '"A,B"', "csvEscape quotes commas");
  console.assert(csvEscape('A"B') === '"A""B"', "csvEscape escapes quotes");
  
  const conflictSample = detectConflicts([
    { id: "A", date: "2026-05-21", start: "11:00", end: "11:30" },
    { id: "B", date: "2026-05-21", start: "11:20", end: "11:50" },
    { id: "C", date: "2026-05-20", start: "11:20", end: "11:50" }
  ]);
  
  console.assert(
    conflictSample.has("A") && conflictSample.has("B") && !conflictSample.has("C"), 
    "detectConflicts only checks same-day overlaps"
  );
  
  console.groupEnd();
}

$("themeToggle").addEventListener("click", toggleTheme);

$("sessionList").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const id = button.dataset.id;
  if (button.dataset.action === "toggle") {
    selected.has(id) ? selected.delete(id) : selected.add(id);
    updateAll();
  }
  if (button.dataset.action === "detail") {
    button.closest(".session").classList.toggle("open");
  }
});

$("selectedList").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  selected.delete(button.dataset.id);
  updateAll();
});

$("day20").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  selected.delete(button.dataset.id);
  updateAll();
});

$("day21").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  selected.delete(button.dataset.id);
  updateAll();
});

["searchInput", "dayFilter", "difficultyFilter", "topicFilter"].forEach((id) => {
  $(id).addEventListener(id === "searchInput" ? "input" : "change", renderList);
});

$("resetFilters").addEventListener("click", () => {
  $("searchInput").value = "";
  $("dayFilter").value = "all";
  $("difficultyFilter").value = "all";
  $("topicFilter").value = "all";
  renderList();
});

$("clearSchedule").addEventListener("click", () => {
  selected.clear();
  updateAll();
});

$("loadRecommended1").addEventListener("click", () => {
  applyRecommendedCurriculum(RECOMMENDED1_IDS);
});

$("loadRecommended2").addEventListener("click", () => {
  applyRecommendedCurriculum(RECOMMENDED2_IDS);
});

$("exportJson").addEventListener("click", () => {
  download("aws-summit-sessions.json", JSON.stringify(sessions, null, 2), "application/json;charset=utf-8");
});

$("exportCsv").addEventListener("click", () => {
  const keys = ["id", "date", "time", "start", "end", "title", "speaker", "language", "difficulty", "topic", "relevance"];
  const rows = [keys.join(",")].concat(sessions.map((session) => keys.map((key) => csvEscape(session[key])).join(",")));
  download("aws-summit-sessions.csv", rows.join("\n"), "text/csv;charset=utf-8");
});

applyTheme(getPreferredTheme());
runSmokeTests();
renderAxis();
loadSessionData();