(function () {
  const STAR = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" stroke="none" d="M8 1.6 9.9 5.5l4.3.6-3.1 3 0.7 4.3L8 11.6 4.2 13.4l0.7-4.3-3.1-3 4.3-.6z"/></svg>';
  const STAR_EMPTY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.3" d="M8 1.6 9.9 5.5l4.3.6-3.1 3 0.7 4.3L8 11.6 4.2 13.4l0.7-4.3-3.1-3 4.3-.6z"/></svg>';

  document.querySelectorAll(".stars").forEach(function (el) {
    const label = el.getAttribute("aria-label") || "5 von 5";
    const n = parseInt(label, 10) || 5;
    el.innerHTML = STAR.repeat(n) + STAR_EMPTY.repeat(5 - n);
  });

  const DAYS = [
    { iso: "2026-11-15", dow: "So", dom: "15" },
    { iso: "2026-11-16", dow: "Mo", dom: "16" },
    { iso: "2026-11-17", dow: "Di", dom: "17" },
    { iso: "2026-11-18", dow: "Mi", dom: "18" },
    { iso: "2026-11-19", dow: "Do", dom: "19" },
    { iso: "2026-11-20", dow: "Fr", dom: "20" },
    { iso: "2026-11-21", dow: "Sa", dom: "21" }
  ];
  const TIMES = ["08:00", "09:30", "11:00", "12:30", "14:00", "15:30", "17:00", "18:30", "20:00"];
  const BOOKED = {
    "2026-11-15|11:00": [2, 4],
    "2026-11-15|14:00": [1],
    "2026-11-15|18:30": [2, 4],
    "2026-11-16|12:30": [3],
    "2026-11-16|17:00": [1, 3],
    "2026-11-16|18:30": [2, 4],
    "2026-11-17|12:30": [4],
    "2026-11-17|20:00": [1, 2, 3, 4],
    "2026-11-18|17:00": [2],
    "2026-11-19|20:00": [1, 2],
    "2026-11-20|18:30": [3, 4],
    "2026-11-21|11:00": [1, 4]
  };

  function bookedSet(date, time) {
    if (!date || !time) return new Set();
    const hit = BOOKED[date + "|" + time];
    if (hit) return new Set(hit);
    const n = Array.from(date + time).reduce(function (a, c) { return a + c.charCodeAt(0); }, 0);
    const set = new Set();
    if (n % 3 === 0) set.add(2);
    if (n % 5 === 0) set.add(4);
    if (n % 7 === 0) set.add(1);
    return set;
  }

  function dateLabel(iso) {
    const d = DAYS.find(function (x) { return x.iso === iso; });
    return d ? d.dow + " " + d.dom + ".11." : iso;
  }

  const state = {
    tab: "start",
    buchenStep: "plan",
    date: null,
    time: null,
    court: null,
    duration: null,
    waitCourt: null,
    waitlist: [],
    players: ["", "", ""],
    creatingMatch: null,
    matches: [
      { id: "m1", title: "Abendrunde", level: 3, spots: 2, max: 4, date: "Mo 16.11.", time: "18:30", court: "Platz 1" },
      { id: "m2", title: "Mittagsspiel", level: 5, spots: 1, max: 4, date: "Di 17.11.", time: "12:30", court: "Platz 3" },
      { id: "m3", title: "Einsteiger-Runde", level: 1, spots: 3, max: 4, date: "Mi 18.11.", time: "17:00", court: "Platz 2" },
      { id: "m4", title: "Ligaspiel-Vorbereitung", level: 6, spots: 1, max: 4, date: "Do 19.11.", time: "20:00", court: "Platz 1" },
      { id: "m5", title: "Nach der Arbeit", level: 4, spots: 1, max: 4, date: "Mo 16.11.", time: "17:00", court: "Platz 4" }
    ],
    joined: {},
    levelFilter: "all",
    tournaments: [
      { id: "t1", title: "Herbst-Cup 2026", date: "Sa 29.11.2026", format: "4 Teams, K.o.-Runde", open: true, teamsLeft: 2, registered: false, teamName: null, showBracket: true },
      { id: "t2", title: "Freitag Night Mixer", date: "Fr 21.11.2026", format: "Americano, Level 2–5", open: true, teamsLeft: null, registered: false, teamName: null, showBracket: false },
      { id: "t3", title: "Jahresabschluss", date: "So 13.12.2026", format: "8 Teams", open: false, teamsLeft: 0, registered: false, teamName: null, showBracket: false }
    ],
    activeTournament: "t1",
    pendingJoin: null,
    pendingTeam: null,
    history: [
      { when: "So 08.11.", title: "Abendrunde", result: "Sieg" },
      { when: "Fr 06.11.", title: "Offenes Match", result: "Niederlage" },
      { when: "Mi 04.11.", title: "Ligaspiel-Vorbereitung", result: "Sieg" },
      { when: "So 01.11.", title: "Mixer", result: "Sieg" }
    ],
    bookings: [],
    reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches
  };

  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", function (e) {
    state.reduceMotion = e.matches;
    var key = state.tab;
    if (key === "buchen" && state.buchenStep === "done") key = "done";
    if (typeof setStage === "function") setStage(key);
  });

  function courtMarkup() {
    return (
      '<svg viewBox="0 0 100 160" aria-hidden="true">' +
        '<rect x="8" y="8" width="84" height="144" fill="none" stroke="#8A8A84" stroke-width="1.2"/>' +
        '<line x1="8" y1="80" x2="92" y2="80" stroke="#1A1A19" stroke-width="2"/>' +
        '<line x1="8" y1="56" x2="92" y2="56" stroke="#8A8A84" stroke-width="1"/>' +
        '<line x1="8" y1="104" x2="92" y2="104" stroke="#8A8A84" stroke-width="1"/>' +
        '<line x1="50" y1="56" x2="50" y2="104" stroke="#8A8A84" stroke-width="1"/>' +
      '</svg>' +
      '<span class="court-tag"></span>'
    );
  }

  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("is-on");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove("is-on"); }, 2400);
  }

  function canContinue() {
    return state.date && state.time && state.court && state.duration && !bookedSet(state.date, state.time).has(state.court);
  }

  function recap() {
    if (!state.date || !state.time || !state.court || !state.duration) return "";
    return "Platz " + state.court + " · " + dateLabel(state.date) + " · " + state.time + " · " + state.duration + " Min.";
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  function renderBuchen() {
    const root = document.getElementById("screen-buchen");
    if (state.buchenStep === "invite") return renderInvite(root);
    if (state.buchenStep === "done") return renderDone(root);

    const booked = bookedSet(state.date, state.time);
    const readySlot = !!(state.date && state.time);

    const dateChips = DAYS.map(function (d) {
      return '<button class="chip' + (state.date === d.iso ? " is-on" : "") + '" type="button" data-date="' + d.iso + '">' +
        '<span class="dow">' + d.dow + '</span><span class="dom">' + d.dom + '</span></button>';
    }).join("");

    const timeChips = TIMES.map(function (t) {
      return '<button class="chip slot' + (state.time === t ? " is-on" : "") + '" type="button" data-time="' + t + '">' + t + "</button>";
    }).join("");

    const durs = [60, 90, 120].map(function (n) {
      return '<button class="chip slot' + (state.duration === n ? " is-on" : "") + '" type="button" data-duration="' + n + '">' + n + " Min.</button>";
    }).join("");

    const courts = [1, 2, 3, 4].map(function (n) {
      const isBooked = readySlot && booked.has(n);
      const isFree = readySlot && !booked.has(n);
      const isOn = state.court === n && isFree;
      const cls = "court-btn" +
        (readySlot ? "" : " is-dim") +
        (isBooked ? " is-wait" : "") +
        (isFree ? " is-free" : "") +
        (isOn ? " is-on" : "");
      const label = isBooked ? "Platz " + n + ", belegt, Warteliste öffnen" : (isFree ? "Platz " + n + ", frei" : "Platz " + n);
      return '<button class="' + cls + '" type="button" data-court="' + n + '" aria-label="' + label + '" aria-pressed="' + (isOn ? "true" : "false") + '">' +
        courtMarkup() + "</button>";
    }).join("");

    const banner = state.creatingMatch
      ? '<p class="banner">Du legst ein offenes Match auf Level ' + state.creatingMatch + " an. Wähle Datum, Uhrzeit und Platz.</p>"
      : "";

    root.innerHTML =
      '<div class="pad stack">' +
        '<div class="row-head"><h1 class="page-title">Buchen</h1><span class="sample">Beispieldaten</span></div>' +
        banner +
        '<div class="stack-tight"><h2 class="section-title">Datum</h2></div>' +
      "</div>" +
      '<div class="chips" role="list">' + dateChips + "</div>" +
      '<div class="pad stack plan-end" style="padding-top:16px">' +
        '<h2 class="section-title">Uhrzeit</h2>' +
        '<div class="chip-grid">' + timeChips + "</div>" +
        '<div class="stack-tight hall-block">' +
          '<h2 class="section-title">Hallenplan von oben</h2>' +
          '<div class="hall">' +
            '<p class="hall-caption">Vier Plätze · Ansicht von oben</p>' +
            '<div class="hall-floor" role="group" aria-label="Hallenplan von oben, vier Plätze">' +
              courts +
              '<p class="entrance">Eingang</p>' +
            "</div>" +
            '<p class="hall-hint">' + (readySlot ? "Freie Plätze sind umrandet. Belegte öffnen die Warteliste." : "Zuerst Datum und Uhrzeit wählen.") + "</p>" +
          "</div>" +
        "</div>" +
        '<h2 class="section-title">Dauer</h2>' +
        '<div class="chip-grid">' + durs + "</div>" +
      "</div>" +
      '<div class="sticky-cta"><button class="btn btn-primary" type="button" data-action="to-invite" ' + (canContinue() ? "" : "disabled") + ">Weiter zu Mitspielern</button></div>";

    root.querySelectorAll(".court-tag").forEach(function (tag, i) {
      const n = i + 1;
      const isBooked = readySlot && booked.has(n);
      const isOn = state.court === n && readySlot && !isBooked;
      tag.textContent = !readySlot ? "Platz " + n : (isBooked ? "Platz " + n + " · Belegt" : (isOn ? "Platz " + n + " · Ausgewählt" : "Platz " + n + " · Frei"));
    });
    root.innerHTML = '<div class="sheet-peek"></div><div class="sheet-card">' + root.innerHTML + "</div>";
    document.getElementById("main").classList.toggle("has-cta", true);
    setStage("buchen");
  }

  function renderInvite(root) {
    document.getElementById("main").classList.toggle("has-cta", false);
    const rows = [0, 1, 2].map(function (i) {
      return (
        '<div class="player">' +
          '<div class="avatar">' + (i + 2) + "</div>" +
          '<div class="player-main">' +
            '<input type="text" data-player="' + i + '" placeholder="Name des Mitspielers" value="' + escapeHtml(state.players[i]) + '" aria-label="Mitspieler ' + (i + 2) + '">' +
            '<button class="btn btn-ghost btn-small" type="button" data-share="' + i + '">Link teilen</button>' +
          "</div>" +
          '<span class="share-pill">Anteil</span>' +
        "</div>"
      );
    }).join("");

    root.innerHTML =
      '<div class="pad stack">' +
        '<div class="back-row">' +
          '<button class="btn btn-ghost" type="button" data-action="back-plan">Zurück</button>' +
        "</div>" +
        '<div class="row-head"><h1 class="page-title">Mitspieler einladen</h1><span class="sample">Beispieldaten</span></div>' +
        '<p class="lede">Jeder zahlt den eigenen Anteil. Im Prototyp nur angedeutet, ohne Beträge.</p>' +
        '<div class="list" style="padding:4px 16px">' +
          '<div class="player">' +
            '<div class="avatar is-you">AK</div>' +
            '<div class="player-main"><p class="you-name">Alex K. (du)</p><p class="item-meta">Buchende Person</p></div>' +
            '<span class="share-pill">Anteil</span>' +
          "</div>" +
          rows +
        "</div>" +
        '<p class="lede">Vier gleiche Anteile. Links sind Platzhalter.</p>' +
        '<p class="banner">' + recap() + "</p>" +
        '<button class="btn btn-primary" type="button" data-action="confirm">Buchung bestätigen</button>' +
      "</div>";
    root.innerHTML = '<div class="sheet-peek"></div><div class="sheet-card">' + root.innerHTML + "</div>";
    setStage("buchen");
  }

  function renderDone(root) {
    document.getElementById("main").classList.toggle("has-cta", false);
    const dirs = [
      [28, -36], [-24, -40], [40, -12], [-36, -8], [18, 32], [-22, 28], [8, -44], [-8, 36]
    ];
    const bits = dirs.map(function (xy, i) {
      return '<span class="confetti' + (i % 2 ? " c-gray" : "") + '" style="--dx:' + xy[0] + "px;--dy:" + xy[1] + 'px"></span>';
    }).join("");

    root.innerHTML =
      '<div class="confirm-wrap">' +
        '<div class="rally" id="rally" aria-hidden="true">' +
          '<svg class="rally-lines" viewBox="0 0 140 210">' +
            '<rect x="12" y="12" width="116" height="186" fill="none" stroke="#8A8A84" stroke-width="1.2"/>' +
            '<line x1="12" y1="70" x2="128" y2="70" stroke="#8A8A84" stroke-width="1"/>' +
            '<line x1="12" y1="140" x2="128" y2="140" stroke="#8A8A84" stroke-width="1"/>' +
            '<line x1="70" y1="70" x2="70" y2="140" stroke="#8A8A84" stroke-width="1"/>' +
          "</svg>" +
          '<span class="rally-net"></span>' +
          '<span class="rally-ball"></span>' +
          bits +
        "</div>" +
        "<h1>Buchung bestätigt</h1>" +
        '<p class="confirm-recap">' + recap() + "</p>" +
        (state.creatingMatch ? '<p class="banner">Dein offenes Match auf Level ' + state.creatingMatch + " ist angelegt. Andere können beitreten.</p>" : "") +
        '<span class="sample">Beispieldaten</span>' +
        '<div class="confirm-actions">' +
          '<button class="btn btn-primary" type="button" data-action="ics">In Kalender speichern</button>' +
          '<button class="btn btn-secondary" type="button" data-go="start">Zur Startseite</button>' +
        "</div>" +
      "</div>";

    root.innerHTML = '<div class="confirm-card">' + root.innerHTML + "</div>";
    const rally = document.getElementById("rally");
    const delay = state.reduceMotion ? 0 : 900;
    setTimeout(function () {
      if (rally) rally.classList.add("is-done");
    }, delay);
    setStage("done");
  }

  function renderMatches() {
    const root = document.getElementById("screen-matches");
    const filters = ["all", 1, 2, 3, 4, 5, 6, 7].map(function (v) {
      const on = String(state.levelFilter) === String(v);
      const label = v === "all" ? "Alle" : String(v);
      return '<button class="chip filter' + (on ? " is-on" : "") + '" type="button" data-filter="' + v + '">' + label + "</button>";
    }).join("");

    const list = state.matches.filter(function (m) {
      return state.levelFilter === "all" || m.level === Number(state.levelFilter);
    });

    const items = list.map(function (m) {
      const joined = !!state.joined[m.id];
      const spots = m.spots;
      const full = spots <= 0;
      const btnLabel = joined ? "Dabei" : (full ? "Voll" : "Beitreten");
      return (
        '<div class="item">' +
          "<div>" +
            '<p class="item-title">' + escapeHtml(m.title) + "</p>" +
            '<p class="item-meta">' + m.date + " · " + m.time + " · " + m.court + "</p>" +
          "</div>" +
          '<div class="item-side">' +
            '<span class="level-badge">Level ' + m.level + "</span>" +
            '<span class="spots">' + (full ? "4/4" : (m.max - spots) + "/" + m.max + " belegt") + "</span>" +
            '<button class="btn btn-small ' + (joined || full ? "btn-secondary" : "btn-primary") + '" type="button" data-join="' + m.id + '" ' + (joined || full ? "disabled" : "") + ">" + btnLabel + "</button>" +
          "</div>" +
        "</div>"
      );
    }).join("");

    root.innerHTML =
      '<div class="pad stack">' +
        '<div class="row-head"><h1 class="page-title">Matches</h1><span class="sample">Beispieldaten</span></div>' +
        '<p class="lede">Offene Matches nach Spielstärke. Level 1 bis 7.</p>' +
      "</div>" +
      '<div class="filters" role="list">' + filters + "</div>" +
      '<div class="pad stack">' +
        (items ? '<div class="list">' + items + "</div>" : '<p class="empty">Keine offenen Matches auf diesem Level. Lege ein eigenes an.</p>') +
        '<button class="btn btn-secondary" type="button" data-action="create-match">Eigenes Match anlegen</button>' +
      "</div>";
    root.innerHTML = '<div class="sheet-peek"></div><div class="sheet-card">' + root.innerHTML + "</div>";
  }

  function renderTurniere() {
    const root = document.getElementById("screen-turniere");
    const t = state.tournaments.find(function (x) { return x.id === state.activeTournament; });

    const items = state.tournaments.map(function (tn) {
      const status = tn.registered ? "Angemeldet · " + tn.teamName : (tn.open ? (tn.teamsLeft ? tn.teamsLeft + " Teams frei" : "Anmeldung offen") : "Warteliste");
      const action = tn.registered
        ? (tn.showBracket ? '<button class="btn btn-small btn-secondary" type="button" data-bracket="' + tn.id + '">Turnierbaum</button>' : '<span class="spots">Angemeldet</span>')
        : (tn.open
          ? '<button class="btn btn-small btn-primary" type="button" data-team="' + tn.id + '">Team anmelden</button>'
          : '<button class="btn btn-small btn-secondary" type="button" data-team-wait="' + tn.id + '">Auf Warteliste</button>');
      return (
        '<div class="item">' +
          "<div>" +
            '<p class="item-title">' + escapeHtml(tn.title) + "</p>" +
            '<p class="item-meta">' + tn.date + " · " + tn.format + "</p>" +
            '<p class="item-meta">' + status + "</p>" +
          "</div>" +
          '<div class="item-side">' + action + "</div>" +
        "</div>"
      );
    }).join("");

    const registeredName = t && t.registered ? t.teamName : null;
    const slot = registeredName || "frei";
    const slotClass = registeredName ? "is-win" : "is-open";

    const bracket =
      '<div class="bracket" id="bracket">' +
        '<p class="bracket-label">Halbfinale</p>' +
        '<div class="bracket-round">' +
          '<div class="matchup">' +
            '<div class="seed is-win"><span>Team Auer</span><span class="score">6:3, 6:4</span></div>' +
            '<div class="seed"><span>Team Berg</span><span class="score"></span></div>' +
          "</div>" +
          '<div class="matchup">' +
            '<div class="seed is-open"><span>Team Claus</span><span class="score">offen</span></div>' +
            '<div class="seed ' + slotClass + '"><span>' + escapeHtml(slot) + '</span><span class="score">' + (registeredName ? "angemeldet" : "") + "</span></div>" +
          "</div>" +
        "</div>" +
        '<div class="bracket-final">' +
          '<p class="bracket-label">Finale</p>' +
          '<div class="matchup">' +
            '<div class="seed is-win"><span>Team Auer</span><span class="score"></span></div>' +
            '<div class="seed is-open"><span>steht aus</span><span class="score"></span></div>' +
          "</div>" +
        "</div>" +
      "</div>";

    root.innerHTML =
      '<div class="pad stack">' +
        '<div class="row-head"><h1 class="page-title">Turniere</h1><span class="sample">Beispieldaten</span></div>' +
        '<p class="lede">Anmelden, Startplan lesen, Ergebnisse im Baum verfolgen.</p>' +
        '<div class="list">' + items + "</div>" +
        '<h2 class="section-title">Turnierbaum · Herbst-Cup</h2>' +
        bracket +
      "</div>";
    root.innerHTML = '<div class="sheet-peek"></div><div class="sheet-card">' + root.innerHTML + "</div>";
  }

  function renderProfil() {
    const root = document.getElementById("screen-profil");
    const steps = [1, 2, 3, 4, 5, 6, 7].map(function (n) {
      return '<span class="level-step' + (n <= 4 ? " is-on" : "") + '" title="Level ' + n + '"></span>';
    }).join("");

    const hist = state.history.map(function (h) {
      return '<div class="history-row"><div><p class="item-title">' + escapeHtml(h.title) + '</p><p class="when">' + h.when + "</p></div><p>" + h.result + "</p></div>";
    }).join("");

    const books = state.bookings.length
      ? state.bookings.map(function (b) {
          return '<div class="history-row"><div><p class="item-title">Platz ' + b.court + '</p><p class="when">' + dateLabel(b.date) + " · " + b.time + " · " + b.duration + " Min.</p></div><p>Bestätigt</p></div>";
        }).join("")
      : '<p class="item-meta">Noch keine Buchung in dieser Sitzung.</p>';

    root.innerHTML =
      '<div class="pad stack">' +
        '<div class="row-head"><h1 class="page-title">Profil</h1><span class="sample">Beispieldaten</span></div>' +
        '<div class="profile-head">' +
          '<div class="avatar lg is-you">AK</div>' +
          "<div>" +
            '<p class="item-title">Alex K.</p>' +
            '<p class="item-meta">Mitglied · Padel-Halle</p>' +
          "</div>" +
        "</div>" +
        "<div>" +
          '<div class="row-head"><h2 class="section-title">Spielstärke · Level 4</h2></div>' +
          '<div class="level-track" aria-label="Level 4 von 7">' + steps + "</div>" +
        "</div>" +
        "<div>" +
          '<h2 class="section-title">Kommende Buchungen</h2>' +
          '<div class="list" style="padding:4px 16px;margin-top:8px">' + books + "</div>" +
        "</div>" +
        "<div>" +
          '<h2 class="section-title">Historie</h2>' +
          '<div class="list" style="padding:4px 16px;margin-top:8px">' + hist + "</div>" +
        "</div>" +
      "</div>";
    root.innerHTML = '<div class="sheet-peek"></div><div class="sheet-card">' + root.innerHTML + "</div>";
  }


  const STAGE = {
    start: { type: "video", poster: "media/poster-start.webp" },
    buchen: { type: "image", src: "media/hero-buchen.webp" },
    done: { type: "image", src: "media/hero-bestaetigung.webp" },
    matches: { type: "image", src: "media/hero-matches.webp" },
    turniere: { type: "image", src: "media/hero-turniere.webp" },
    profil: { type: "image", src: "media/hero-buchen.webp" }
  };

  function setStage(key) {
    const video = document.getElementById("stage-video");
    const img = document.getElementById("stage-image");
    const spec = STAGE[key] || STAGE.start;
    const reduce = state.reduceMotion;
    const useVideo = spec.type === "video" && !reduce;
    if (useVideo) {
      img.classList.add("is-off");
      video.classList.remove("is-off");
      video.setAttribute("poster", spec.poster || "media/poster-start.webp");
      const play = function () { video.play().catch(function () {}); };
      if (video.readyState >= 2) play();
      else video.addEventListener("canplay", play, { once: true });
    } else {
      video.pause();
      video.classList.add("is-off");
      img.classList.remove("is-off");
      img.src = spec.src || spec.poster || "media/poster-start.webp";
      img.alt = "";
    }
    document.getElementById("app").classList.toggle("is-sheet", key !== "start");
  }

  function showTab(tab) {
    state.tab = tab;
    document.querySelectorAll(".screen").forEach(function (s) {
      s.classList.toggle("is-on", s.dataset.screen === tab);
    });
    document.querySelectorAll(".tab").forEach(function (b) {
      const on = b.dataset.tab === tab;
      b.classList.toggle("is-on", on);
      if (on) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
    if (tab === "buchen") renderBuchen();
    if (tab === "matches") renderMatches();
    if (tab === "turniere") renderTurniere();
    if (tab === "profil") renderProfil();
    document.getElementById("main").classList.toggle(
      "has-cta",
      tab === "buchen" && state.buchenStep === "plan"
    );
    var stageKey = tab;
    if (tab === "buchen" && state.buchenStep === "done") stageKey = "done";
    setStage(stageKey);
    document.getElementById("main").scrollTop = 0;
  }

  function openWaitlist(court) {
    state.waitCourt = court;
    document.getElementById("wait-copy").textContent =
      "Platz " + court + " ist am " + dateLabel(state.date) + " um " + state.time + " belegt. Wir benachrichtigen dich, sobald etwas frei wird.";
    document.getElementById("dlg-waitlist").showModal();
  }

  function confirmBooking() {
    state.bookings.unshift({
      court: state.court,
      date: state.date,
      time: state.time,
      duration: state.duration
    });
    const createdLevel = state.creatingMatch;
    if (createdLevel) {
      state.matches.unshift({
        id: "m-new-" + Date.now(),
        title: "Offenes Match",
        level: Number(createdLevel),
        spots: 3,
        max: 4,
        date: dateLabel(state.date),
        time: state.time,
        court: "Platz " + state.court
      });
    }
    state.buchenStep = "done";
    renderBuchen();
    state.creatingMatch = null;
    document.getElementById("main").scrollTop = 0;
    if (!state.reduceMotion && navigator.vibrate) {
      try { navigator.vibrate([16, 30, 16]); } catch (err) {}
    }
  }


  function saveIcs() {
    if (!state.date || !state.time || !state.duration) return;
    const parts = state.time.split(":");
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    const start = state.date.replace(/-/g, "") + "T" + String(h).padStart(2, "0") + String(m).padStart(2, "0") + "00";
    const endDate = new Date(state.date + "T" + state.time + ":00");
    endDate.setMinutes(endDate.getMinutes() + state.duration);
    const end = endDate.getFullYear() +
      String(endDate.getMonth() + 1).padStart(2, "0") +
      String(endDate.getDate()).padStart(2, "0") + "T" +
      String(endDate.getHours()).padStart(2, "0") +
      String(endDate.getMinutes()).padStart(2, "0") + "00";
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Padel-Halle//Wireframe V1//DE",
      "BEGIN:VEVENT",
      "UID:wireframe-v1-" + state.date + "-" + state.court + "@padel-halle",
      "DTSTART:" + start,
      "DTEND:" + end,
      "SUMMARY:Padel · Platz " + state.court,
      "LOCATION:Padel-Halle",
      "DESCRIPTION:Beispieldaten – Wireframe V1. Keine echte Buchung.",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "padel-platz-" + state.court + ".ics";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Kalendereintrag gespeichert (Beispieldaten).");
  }

  document.getElementById("app").addEventListener("click", function (e) {
    const tabBtn = e.target.closest("[data-tab]");
    if (tabBtn) {
      if (state.buchenStep === "done" && tabBtn.dataset.tab !== "buchen") {
        state.buchenStep = "plan";
        state.date = state.time = state.court = state.duration = null;
        state.players = ["", "", ""];
      } else if (tabBtn.dataset.tab === "buchen" && state.buchenStep === "done") {
        state.buchenStep = "plan";
        state.date = state.time = state.court = state.duration = null;
        state.players = ["", "", ""];
      }
      showTab(tabBtn.dataset.tab);
      return;
    }
    const go = e.target.closest("[data-go]");
    if (go) {
      if (go.dataset.go === "start") {
        state.buchenStep = "plan";
        state.date = state.time = state.court = state.duration = null;
        state.players = ["", "", ""];
      }
      showTab(go.dataset.go);
    }
  });

  document.getElementById("screen-buchen").addEventListener("click", function (e) {
    const dateBtn = e.target.closest("[data-date]");
    if (dateBtn) {
      state.date = dateBtn.dataset.date;
      state.court = null;
      renderBuchen();
      return;
    }
    const timeBtn = e.target.closest("[data-time]");
    if (timeBtn) {
      state.time = timeBtn.dataset.time;
      state.court = null;
      renderBuchen();
      return;
    }
    const durBtn = e.target.closest("[data-duration]");
    if (durBtn) {
      state.duration = Number(durBtn.dataset.duration);
      renderBuchen();
      return;
    }
    const courtBtn = e.target.closest("[data-court]");
    if (courtBtn) {
      if (!(state.date && state.time)) {
        toast("Zuerst Datum und Uhrzeit wählen.");
        return;
      }
      const n = Number(courtBtn.dataset.court);
      if (bookedSet(state.date, state.time).has(n)) {
        openWaitlist(n);
        return;
      }
      state.court = n;
      renderBuchen();
      return;
    }
    const share = e.target.closest("[data-share]");
    if (share) {
      const i = Number(share.dataset.share);
      const text = "Padel-Halle: Anteil an der Buchung " + recap() + " (Beispieldaten)";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          toast("Link für Mitspieler " + (i + 2) + " kopiert (Beispieldaten).");
        }).catch(function () {
          toast("Link (Beispieldaten) bereit zum Teilen.");
        });
      } else {
        toast("Link (Beispieldaten) bereit zum Teilen.");
      }
      return;
    }
    const action = e.target.closest("[data-action]");
    if (!action) return;
    if (action.dataset.action === "to-invite" && canContinue()) {
      state.buchenStep = "invite";
      renderBuchen();
      document.getElementById("main").scrollTop = 0;
    } else if (action.dataset.action === "back-plan") {
      state.buchenStep = "plan";
      renderBuchen();
      document.getElementById("main").scrollTop = 0;
    } else if (action.dataset.action === "confirm") {
      confirmBooking();
    } else if (action.dataset.action === "ics") {
      saveIcs();
    }
  });

  document.getElementById("screen-buchen").addEventListener("input", function (e) {
    const input = e.target.closest("[data-player]");
    if (input) state.players[Number(input.dataset.player)] = input.value;
  });

  document.getElementById("screen-matches").addEventListener("click", function (e) {
    const filter = e.target.closest("[data-filter]");
    if (filter) {
      state.levelFilter = filter.dataset.filter === "all" ? "all" : Number(filter.dataset.filter);
      renderMatches();
      return;
    }
    const join = e.target.closest("[data-join]");
    if (join) {
      const m = state.matches.find(function (x) { return x.id === join.dataset.join; });
      if (!m || state.joined[m.id] || m.spots <= 0) return;
      state.pendingJoin = m.id;
      document.getElementById("join-copy").textContent =
        m.title + " · Level " + m.level + " · " + m.date + " · " + m.time + " · " + m.court + ". Ein Platz wird für dich gehalten.";
      document.getElementById("dlg-join").showModal();
      return;
    }
    if (e.target.closest("[data-action='create-match']")) {
      document.getElementById("dlg-create").showModal();
    }
  });

  document.getElementById("screen-turniere").addEventListener("click", function (e) {
    const team = e.target.closest("[data-team]");
    if (team) {
      const tn = state.tournaments.find(function (x) { return x.id === team.dataset.team; });
      if (!tn) return;
      state.pendingTeam = tn.id;
      document.getElementById("team-copy").textContent = tn.title + " · " + tn.date + " · " + tn.format + ".";
      document.getElementById("dlg-team").showModal();
      return;
    }
    const wait = e.target.closest("[data-team-wait]");
    if (wait) {
      toast("Du stehst auf der Turnier-Warteliste (Beispieldaten).");
      return;
    }
    const br = e.target.closest("[data-bracket]");
    if (br) {
      state.activeTournament = br.dataset.bracket;
      renderTurniere();
      const el = document.getElementById("bracket");
      if (el) el.scrollIntoView({ behavior: state.reduceMotion ? "auto" : "smooth", block: "start" });
    }
  });

  document.getElementById("form-waitlist").addEventListener("submit", function (e) {
    const val = e.submitter ? e.submitter.value : "cancel";
    if (val === "join") {
      const name = (new FormData(e.currentTarget).get("name") || "Alex K.").trim();
      state.waitlist.push({ court: state.waitCourt, date: state.date, time: state.time, name: name });
      toast("Du stehst auf der Warteliste für Platz " + state.waitCourt + ".");
    }
  });

  document.getElementById("form-join").addEventListener("submit", function (e) {
    const val = e.submitter ? e.submitter.value : "cancel";
    if (val !== "join" || !state.pendingJoin) return;
    const m = state.matches.find(function (x) { return x.id === state.pendingJoin; });
    if (!m) return;
    m.spots = Math.max(0, m.spots - 1);
    state.joined[m.id] = true;
    renderMatches();
    if (m.spots === 0) {
      const box = document.getElementById("full-avatars");
      box.innerHTML = ["AK", "MS", "TR", "JL"].map(function (ini, i) {
        return '<div class="avatar' + (i === 0 ? " is-you" : "") + '">' + ini + "</div>";
      }).join("");
      document.getElementById("dlg-full").showModal();
    } else {
      toast("Du bist dem Match beigetreten (Beispieldaten).");
    }
    state.pendingJoin = null;
  });

  document.getElementById("form-create").addEventListener("submit", function (e) {
    const val = e.submitter ? e.submitter.value : "cancel";
    if (val !== "create") return;
    state.creatingMatch = Number(new FormData(e.currentTarget).get("level") || 4);
    state.buchenStep = "plan";
    showTab("buchen");
  });

  document.getElementById("form-team").addEventListener("submit", function (e) {
    const val = e.submitter ? e.submitter.value : "cancel";
    if (val !== "join" || !state.pendingTeam) return;
    const name = (new FormData(e.currentTarget).get("team") || "Team Muster").trim();
    const tn = state.tournaments.find(function (x) { return x.id === state.pendingTeam; });
    if (!tn) return;
    tn.registered = true;
    tn.teamName = name;
    if (tn.teamsLeft) tn.teamsLeft = Math.max(0, tn.teamsLeft - 1);
    state.activeTournament = tn.id;
    renderTurniere();
    toast(name + " ist angemeldet (Beispieldaten).");
    state.pendingTeam = null;
  });

  document.querySelectorAll("[data-close]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const dlg = document.getElementById(btn.dataset.close);
      if (dlg) dlg.close();
    });
  });

  showTab("start");
  document.documentElement.dataset.ready = "1";
  window.__wireframe = { state: state, showTab: showTab, setStage: setStage };
  document.getElementById("app").addEventListener("pointerdown", function () {
    const video = document.getElementById("stage-video");
    if (video && !video.classList.contains("is-off") && video.paused && !state.reduceMotion) {
      video.play().catch(function () {});
    }
  }, { passive: true });
})();
