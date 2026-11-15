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
  const TIMES = ["08:00", "09:30", "11:00", "12:30", "14:00", "15:30", "17:00", "18:30", "20:00", "21:30"];
  const BOOKED = {
    "2026-11-15|11:00": [2, 4],
    "2026-11-15|14:00": [1],
    "2026-11-15|18:30": [2],
    "2026-11-15|20:00": [3],
    "2026-11-15|21:30": [2, 4],
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


  const PLAYERS = [
    { id: "p-mira", name: "Mira S.", level: 4, initials: "MS" },
    { id: "p-lea", name: "Lea H.", level: 4, initials: "LH" },
    { id: "p-jonas", name: "Jonas B.", level: 5, initials: "JB" },
    { id: "p-pia", name: "Pia W.", level: 3, initials: "PW" },
    { id: "p-cem", name: "Cem Y.", level: 6, initials: "CY" }
  ];

  function suggestPlayers(match) {
    const taken = state.invited[match.id] || [];
    return PLAYERS.filter(function (p) {
      return taken.indexOf(p.id) === -1 && Math.abs(p.level - match.level) <= 1;
    }).slice(0, 2);
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
    focusMatch: null,
    activeChat: null,
    invited: {},
    chats: {
      m1: [
        { who: "Mira S.", text: "Bin 18:20 da, komme direkt von der Arbeit.", me: false },
        { who: "Alex K.", text: "Passt, ich bringe Bälle mit.", me: true },
        { who: "Jonas B.", text: "Wer nimmt die Rückhandseite?", me: false }
      ],
      m2: [{ who: "Pia W.", text: "Kann jemand 10 Minuten früher?", me: false }],
      m5: [
        { who: "Lea H.", text: "Wir sind zu dritt, sucht ihr noch einen Vierten?", me: false },
        { who: "Alex K.", text: "Ja, genau. Ich schau in der App.", me: true }
      ]
    },
    reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    auth: null,
    authView: "welcome",
    pendingAuth: null,
    authLevel: null,
    authTimes: [],
    authTimer: null
  };

  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", function (e) {
    state.reduceMotion = e.matches;
    var key = state.tab;
    if (key === "buchen" && state.buchenStep === "done") key = "done";
    if (typeof setStage === "function") setStage(key);
  });


  const AUTH_KEY = "fl27-v14-auth";
  const PROVIDER_NAMES = { apple: "Apple", google: "Google", x: "X", facebook: "Facebook", email: "E-Mail" };
  const DEMO_USERS = {
    apple: { name: "Alex K.", email: "alex.k@icloud.com", provider: "apple" },
    google: { name: "Alex K.", email: "alex.k@gmail.com", provider: "google" },
    x: { name: "Alex K.", email: "alex@x.com", provider: "x" },
    facebook: { name: "Alex K.", email: "alex.k@facebook.com", provider: "facebook" }
  };
  const ICON_APPLE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.37 12.13c.03-2.41 1.97-3.57 2.06-3.62-1.13-1.65-2.88-1.88-3.5-1.9-1.49-.15-2.91.88-3.67.88-.76 0-1.94-.86-3.19-.83-1.64.02-3.15.95-3.99 2.42-1.7 2.95-.43 7.32 1.22 9.72.81 1.17 1.78 2.48 3.05 2.43 1.22-.05 1.68-.79 3.16-.79 1.47 0 1.89.79 3.18.76 1.32-.02 2.15-1.19 2.95-2.37.93-1.36 1.31-2.67 1.33-2.74-.03-.01-2.55-.98-2.58-3.88zm-2.1-5.79c.67-.81 1.12-1.94 1-3.06-.96.04-2.13.64-2.82 1.45-.62.72-1.16 1.87-1.01 2.97 1.07.08 2.16-.54 2.83-1.36z"/></svg>';
  const ICON_GOOGLE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.56-5.17 3.56-8.81z"/><path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.72-2.47 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.27 14.27A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.27V6.64H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.36z"/><path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.59 1.8l3.44-3.44C17.95 1.19 15.23 0 12 0 7.31 0 3.26 2.69 1.27 6.64l4 3.09C6.22 6.86 8.87 4.75 12 4.75z"/></svg>';
  const ICON_X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-4.71-6.23-5.4 6.23H2.74l7.73-8.83L1.25 2.25h6.83l4.25 5.62 5.91-5.62zm-1.16 17.52h1.83L7.08 4.13H5.12z"/></svg>';
  const ICON_FB = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14.5 8.25V6.6c0-1.04.28-1.76 1.79-1.76H17.5V2.3h-2.3C12.08 2.3 10.5 4.16 10.5 6.86v1.39H8v3.4h2.5V21.5h3V11.65h2.55l.45-3.4z"/></svg>';

  function loadAuth() {
    try {
      const raw = sessionStorage.getItem(AUTH_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || (data.status !== "signed" && data.status !== "guest")) return null;
      return data;
    } catch (err) {
      return null;
    }
  }

  function persistAuth() {
    try {
      if (state.auth) sessionStorage.setItem(AUTH_KEY, JSON.stringify(state.auth));
      else sessionStorage.removeItem(AUTH_KEY);
    } catch (err) {}
  }

  function isSigned() {
    return !!(state.auth && state.auth.status === "signed");
  }

  function displayName() {
    if (isSigned() && state.auth.name) return state.auth.name;
    if (state.auth && state.auth.status === "guest") return "Gast";
    return "Alex K.";
  }

  function displayInitials() {
    const n = displayName().trim().split(/\s+/);
    if (n.length >= 2) return (n[0].charAt(0) + n[n.length - 1].charAt(0)).toUpperCase();
    return (n[0] || "AK").slice(0, 2).toUpperCase();
  }

  function playerLevel() {
    if (isSigned() && state.auth.level) return Number(state.auth.level);
    return 4;
  }

  function clearAuthTimer() {
    if (state.authTimer) {
      clearTimeout(state.authTimer);
      state.authTimer = null;
    }
  }

  function openAuth(view, opts) {
    opts = opts || {};
    clearAuthTimer();
    state.authView = view || "welcome";
    const el = document.getElementById("auth-view");
    const sheet = document.getElementById("auth-sheet");
    el.hidden = false;
    document.getElementById("app").classList.add("is-auth");
    setStage("start");
    const delay = (opts.delayed && !state.reduceMotion) ? 900 : 0;
    if (delay) {
      sheet.hidden = true;
      state.authTimer = setTimeout(function () {
        state.authTimer = null;
        if (el.hidden) return;
        sheet.hidden = false;
        renderAuth();
      }, delay);
    } else {
      sheet.hidden = false;
      renderAuth();
    }
  }

  function closeAuth() {
    clearAuthTimer();
    const el = document.getElementById("auth-view");
    el.hidden = true;
    document.getElementById("app").classList.remove("is-auth");
    const sheet = document.getElementById("auth-sheet");
    if (sheet) sheet.hidden = false;
  }

  function requireAuth(intent) {
    if (isSigned()) return true;
    state.pendingAuth = intent || null;
    openAuth("welcome");
    return false;
  }

  function resumePending() {
    const p = state.pendingAuth;
    state.pendingAuth = null;
    if (!p) return;
    if (p.type === "tab") {
      showTab(p.tab);
      return;
    }
    if (p.type === "slot") {
      goSlot(p.time);
      return;
    }
    if (p.type === "join") {
      showTab("matches");
      const m = state.matches.find(function (x) { return x.id === p.id; });
      if (!m || state.joined[m.id] || m.spots <= 0) return;
      state.pendingJoin = m.id;
      document.getElementById("join-copy").textContent =
        m.title + " · Level " + m.level + " · " + m.date + " · " + m.time + " · " + m.court + ". Ein Platz wird für dich gehalten.";
      document.getElementById("dlg-join").showModal();
      return;
    }
    if (p.type === "team") {
      showTab("turniere");
      const tn = state.tournaments.find(function (x) { return x.id === p.id; });
      if (!tn) return;
      state.pendingTeam = tn.id;
      document.getElementById("team-copy").textContent = tn.title + " · " + tn.date + " · " + tn.format + ".";
      document.getElementById("dlg-team").showModal();
      return;
    }
    if (p.type === "create") {
      showTab("matches");
      document.getElementById("dlg-create").showModal();
      return;
    }
    if (p.type === "invite") {
      showTab("matches");
      inviteFourth(p.match, p.player);
    }
  }

  function signIn(data, opts) {
    opts = opts || {};
    state.auth = {
      status: "signed",
      name: data.name,
      email: data.email || "",
      provider: data.provider,
      level: data.level ? Number(data.level) : (state.authLevel || null),
      times: (data.times || state.authTimes || []).slice()
    };
    persistAuth();
    if (opts.onboard) {
      state.authView = "onboarding";
      openAuth("onboarding");
      return;
    }
    closeAuth();
    if (state.tab === "profil") renderProfil();
    resumePending();
  }

  function signInGuest() {
    state.auth = { status: "guest", name: "Gast", email: "", provider: null, level: null, times: [] };
    persistAuth();
    state.pendingAuth = null;
    closeAuth();
    if (state.tab === "profil") renderProfil();
  }

  function signOut() {
    state.auth = null;
    persistAuth();
    state.pendingAuth = null;
    state.buchenStep = "plan";
    state.date = state.time = state.court = state.duration = null;
    state.players = ["", "", ""];
    renderProfil();
    toast("Abgemeldet. Demo, keine echte Sitzung.");
  }

  function finishOnboarding() {
    if (!isSigned()) return;
    if (state.authLevel) state.auth.level = Number(state.authLevel);
    state.auth.times = (state.authTimes || []).slice();
    persistAuth();
    closeAuth();
    if (state.tab === "profil") renderProfil();
    resumePending();
  }

  function renderAuth() {
    const body = document.getElementById("auth-body");
    if (!body) return;
    const view = state.authView || "welcome";
    if (view === "register") {
      body.innerHTML =
        '<button class="auth-back" type="button" data-auth-view="welcome">Zurück</button>' +
        '<span class="auth-demo">Demo – keine echte Anmeldung</span>' +
        '<h2 id="auth-title">Mit E-Mail registrieren</h2>' +
        '<p class="lede">Nur auf diesem Gerät, in dieser Sitzung. Es wird kein Konto angelegt.</p>' +
        '<form class="auth-form" id="form-register">' +
          '<label>Name <input type="text" name="name" autocomplete="name" required placeholder="Alex K."></label>' +
          '<label>E-Mail <input type="email" name="email" autocomplete="email" required placeholder="alex@beispiel.de"></label>' +
          '<label>Passwort <input type="password" name="password" autocomplete="new-password" required minlength="6" placeholder="Mindestens 6 Zeichen"></label>' +
          '<label>Spielstärke, optional' +
            '<select name="level">' +
              '<option value="">Später festlegen</option>' +
              '<option value="1">Level 1</option><option value="2">Level 2</option>' +
              '<option value="3">Level 3</option><option value="4">Level 4</option>' +
              '<option value="5">Level 5</option><option value="6">Level 6</option>' +
              '<option value="7">Level 7</option>' +
            "</select></label>" +
          '<p class="auth-error" id="auth-error" role="alert"></p>' +
          '<button class="btn btn-primary" type="submit">Konto anlegen</button>' +
        "</form>" +
        '<div class="auth-links"><button type="button" data-auth-view="signin">Schon ein Konto? Anmelden</button></div>';
      return;
    }
    if (view === "signin") {
      body.innerHTML =
        '<button class="auth-back" type="button" data-auth-view="welcome">Zurück</button>' +
        '<span class="auth-demo">Demo – keine echte Anmeldung</span>' +
        '<h2 id="auth-title">Anmelden</h2>' +
        '<p class="lede">Beliebige Angaben reichen. Es wird nichts geprüft und nichts gespeichert, außer in dieser Sitzung.</p>' +
        '<form class="auth-form" id="form-signin">' +
          '<label>E-Mail <input type="email" name="email" autocomplete="username" required placeholder="alex@beispiel.de"></label>' +
          '<label>Passwort <input type="password" name="password" autocomplete="current-password" required placeholder="Dein Passwort"></label>' +
          '<p class="auth-error" id="auth-error" role="alert"></p>' +
          '<button class="btn btn-primary" type="submit">Anmelden</button>' +
        "</form>";
      return;
    }
    if (view === "onboarding") {
      const level = state.authLevel || (isSigned() && state.auth.level) || "";
      const times = state.authTimes || [];
      const levelBtns = [1, 2, 3, 4, 5, 6, 7].map(function (n) {
        return '<button type="button" class="' + (String(level) === String(n) ? "is-on" : "") + '" data-onboard-level="' + n + '">' + n + "</button>";
      }).join("");
      const timeBtns = ["17:00", "18:30", "20:00", "21:30"].map(function (t) {
        return '<button type="button" class="' + (times.indexOf(t) >= 0 ? "is-on" : "") + '" data-onboard-time="' + t + '">' + t + "</button>";
      }).join("");
      body.innerHTML =
        '<span class="auth-demo">Demo – keine echte Anmeldung</span>' +
        '<h2 id="auth-title">Dein Spiel</h2>' +
        '<p class="lede">Level und Lieblingszeiten helfen bei der Mitspielersuche. Beides ist optional.</p>' +
        '<p class="item-meta">Spielstärke</p>' +
        '<div class="level-pick" role="group" aria-label="Level">' + levelBtns + "</div>" +
        '<p class="item-meta" style="margin-top:12px">Lieblingszeiten</p>' +
        '<div class="time-pick" role="group" aria-label="Lieblingszeiten">' + timeBtns + "</div>" +
        '<button class="btn btn-primary" type="button" data-auth-action="finish-onboarding" style="margin-top:16px">Loslegen</button>';
      return;
    }
    body.innerHTML =
      '<span class="auth-demo">Demo – keine echte Anmeldung</span>' +
      '<h2 id="auth-title">Willkommen in der Halle</h2>' +
      '<p class="lede">Melde dich an, um Plätze zu buchen und Matches beizutreten. Alles nur zum Durchklicken.</p>' +
      '<div class="auth-providers">' +
        '<button class="btn-provider btn-apple" type="button" data-auth-provider="apple">' + ICON_APPLE + "Mit Apple fortfahren</button>" +
        '<button class="btn-provider btn-google" type="button" data-auth-provider="google">' + ICON_GOOGLE + "Mit Google fortfahren</button>" +
        '<button class="btn-provider btn-x" type="button" data-auth-provider="x">' + ICON_X + "Mit X fortfahren</button>" +
        '<button class="btn-provider btn-facebook" type="button" data-auth-provider="facebook">' + ICON_FB + "Mit Facebook fortfahren</button>" +
      "</div>" +
      '<p class="auth-or">oder</p>' +
      '<button class="btn-email" type="button" data-auth-view="register">Mit E-Mail registrieren</button>' +
      '<div class="auth-links">' +
        '<button type="button" data-auth-view="signin">Schon ein Konto? Anmelden</button>' +
        '<button class="as-muted" type="button" data-auth-action="guest">Erst mal umsehen</button>' +
      "</div>";
  }

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
        '<p class="lede">Heute, 15. November · freie Fenster unter Flutlicht.</p>' +
        '<div class="tonight-strip" aria-label="Heute Abend">' +
          '<div class="pill frei"><b>18:30</b>frei</div>' +
          '<div class="pill frei"><b>20:00</b>frei</div>' +
          '<div class="pill wenig"><b>21:30</b>wenige</div>' +
        '</div>' +
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
    const filledNames = state.players.filter(function (n) { return String(n).trim(); }).length;
    const fourthInvite = (filledNames === 2)
      ? ('<div class="fourth-box">' +
          '<p class="fourth-hint">Dir fehlt der vierte Spieler?</p>' +
          PLAYERS.filter(function (p) { return Math.abs(p.level - 4) <= 1; }).slice(0, 2).map(function (p) {
            return '<div class="suggest-row">' +
              '<div><p class="item-title">' + escapeHtml(p.name) + '</p><p class="item-meta">Level ' + p.level + '</p></div>' +
              '<button class="btn btn-primary btn-compact" type="button" data-fill-player="' + escapeHtml(p.name) + '">Einladen</button>' +
            '</div>';
          }).join('') +
        '</div>')
      : "";
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
        fourthInvite +
        '<p class="banner">' + recap() + "</p>" +
        '<button class="btn btn-primary" type="button" data-action="confirm">Buchung bestätigen</button>' +
      "</div>";
    root.innerHTML = '<div class="sheet-peek"></div><div class="sheet-card">' + root.innerHTML + "</div>";
    setStage("buchen");
  }

  function renderDone(root) {
    document.getElementById("main").classList.toggle("has-cta", false);
    root.innerHTML =
      '<div class="sheet-peek"></div>' +
      '<div class="confirm-card">' +
        '<div class="confirm-wrap">' +
          "<h1>Buchung bestätigt</h1>" +
          '<p class="confirm-recap">' + recap() + "</p>" +
          (state.creatingMatch ? '<p class="banner">Dein offenes Match auf Level ' + state.creatingMatch + " ist angelegt. Andere können beitreten.</p>" : "") +
          '<span class="sample">Beispieldaten</span>' +
          '<div class="confirm-actions">' +
            '<button class="btn btn-primary" type="button" data-action="ics">In Kalender speichern</button>' +
            '<button class="btn btn-secondary" type="button" data-go="start">Zur Startseite</button>' +
          "</div>" +
        "</div>" +
      "</div>";
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
      const filled = m.max - spots;
      const suggestions = (!full && spots === 1) ? suggestPlayers(m) : [];
      const fourth = suggestions.length
        ? ('<div class="fourth-box">' +
            '<p class="fourth-hint">Dir fehlt der vierte Spieler?</p>' +
            suggestions.map(function (p) {
              return '<div class="suggest-row">' +
                "<div><p class=\"item-title\">" + escapeHtml(p.name) + '</p><p class="item-meta">Level ' + p.level + " · ähnliche Stärke</p></div>" +
                '<button class="btn btn-primary btn-compact" type="button" data-invite-fourth="' + p.id + '" data-match="' + m.id + '">Einladen</button>' +
              "</div>";
            }).join("") +
          "</div>")
        : "";
      return (
        '<div class="item match-item' + (state.focusMatch === m.id ? " is-focus" : "") + '" id="match-' + m.id + '">' +
          '<div class="match-top">' +
            "<div>" +
              '<p class="item-title">' + escapeHtml(m.title) + "</p>" +
              '<p class="item-meta">' + m.date + " · " + m.time + " · " + m.court + "</p>" +
            "</div>" +
            '<div class="item-side">' +
              '<span class="level-badge">Level ' + m.level + "</span>" +
              '<span class="spots">' + (full ? "4/4" : filled + "/" + m.max + " belegt") + "</span>" +
              '<button class="btn btn-small ' + (joined || full ? "btn-secondary" : "btn-primary") + '" type="button" data-join="' + m.id + '" ' + (joined || full ? "disabled" : "") + ">" + btnLabel + "</button>" +
            "</div>" +
          "</div>" +
          '<div class="match-tools">' +
            '<button class="btn btn-secondary btn-compact" type="button" data-chat="' + m.id + '">Match-Chat</button>' +
          "</div>" +
          fourth +
        "</div>"
      );
    }).join("");

    root.innerHTML =
      '<div class="pad stack">' +
        '<div class="row-head"><h1 class="page-title">Finde dein Match</h1><span class="sample">Beispieldaten</span></div>' +
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
    const lvl = playerLevel();
    const steps = [1, 2, 3, 4, 5, 6, 7].map(function (n) {
      return '<span class="level-step' + (n <= lvl ? " is-on" : "") + '" title="Level ' + n + '"></span>';
    }).join("");

    const hist = state.history.map(function (h) {
      return '<div class="history-row"><div><p class="item-title">' + escapeHtml(h.title) + '</p><p class="when">' + h.when + "</p></div><p>" + h.result + "</p></div>";
    }).join("");

    const books = state.bookings.length
      ? state.bookings.map(function (b) {
          return '<div class="history-row"><div><p class="item-title">Platz ' + b.court + '</p><p class="when">' + dateLabel(b.date) + " · " + b.time + " · " + b.duration + " Min.</p></div><p>Bestätigt</p></div>";
        }).join("")
      : '<p class="item-meta">Noch keine Buchung in dieser Sitzung.</p>';

    const signed = isSigned();
    const name = signed ? state.auth.name : "Gast";
    const initials = signed ? displayInitials() : "–";
    const providerLabel = signed ? ("Angemeldet mit " + (PROVIDER_NAMES[state.auth.provider] || "Konto") + " · Demo") : "Du siehst dich nur um. Zum Buchen bitte anmelden.";
    const timesLine = (signed && state.auth.times && state.auth.times.length)
      ? '<p class="item-meta">Lieblingszeiten: ' + state.auth.times.join(", ") + "</p>"
      : "";
    const actions = signed
      ? '<div class="profile-actions">' +
          '<button class="btn btn-secondary btn-compact" type="button" data-action="open-ops">Ansicht Betreiber</button>' +
          '<button class="btn btn-secondary btn-compact" type="button" data-auth-action="signout">Abmelden</button>' +
        "</div>"
      : '<div class="profile-actions">' +
          '<button class="btn btn-primary btn-compact" type="button" data-auth-action="open">Anmelden</button>' +
          '<button class="btn btn-secondary btn-compact" type="button" data-action="open-ops">Ansicht Betreiber</button>' +
        "</div>";
    const youRow = signed
      ? '<div class="rank-row is-you"><span class="rank-pos">4</span><div><p class="item-title">' + escapeHtml(name) + ' · du</p><p class="item-meta">Level ' + lvl + " · 9 Siege</p></div></div>"
      : '<div class="rank-row"><span class="rank-pos">4</span><div><p class="item-title">Alex K.</p><p class="item-meta">Level 4 · 9 Siege</p></div></div>';

    root.innerHTML =
      '<div class="pad stack">' +
        '<div class="row-head"><h1 class="page-title">Profil</h1><span class="sample">Beispieldaten</span></div>' +
        '<div class="profile-head' + (signed ? "" : " profile-guest") + '">' +
          '<div class="avatar lg' + (signed ? " is-you" : "") + '">' + escapeHtml(initials) + "</div>" +
          "<div>" +
            '<p class="item-title">' + escapeHtml(name) + "</p>" +
            '<p class="item-meta">' + providerLabel + "</p>" +
            timesLine +
            actions +
          "</div>" +
        "</div>" +
        (signed
          ? ("<div>" +
              '<div class="row-head"><h2 class="section-title">Spielstärke · Level ' + lvl + "</h2></div>" +
              '<div class="level-track" aria-label="Level ' + lvl + ' von 7">' + steps + "</div>" +
              '<p class="level-progress">Noch 3 Matches bis Level ' + Math.min(7, lvl + 1) + "</p>" +
            "</div>")
          : '<p class="lede">Nach der Anmeldung siehst du hier dein Level und deine Buchungen.</p>') +
        "<div>" +
          '<div class="row-head"><h2 class="section-title">Rangliste der Halle</h2><span class="sample">Beispieldaten</span></div>' +
          '<div class="list" style="padding:0;margin-top:8px">' +
            '<div class="rank-row"><span class="rank-pos">1</span><div><p class="item-title">Mira S.</p><p class="item-meta">Level 6 · 18 Siege</p></div></div>' +
            '<div class="rank-row"><span class="rank-pos">2</span><div><p class="item-title">Jonas B.</p><p class="item-meta">Level 5 · 14 Siege</p></div></div>' +
            '<div class="rank-row"><span class="rank-pos">3</span><div><p class="item-title">Pia W.</p><p class="item-meta">Level 5 · 11 Siege</p></div></div>' +
            youRow +
          "</div>" +
        "</div>" +
        "<div>" +
          '<h2 class="section-title">Kommende Buchungen</h2>' +
          '<div class="list" style="padding:4px 16px;margin-top:8px">' + books + "</div>" +
        "</div>" +
        (signed
          ? ("<div>" +
              '<h2 class="section-title">Historie</h2>' +
              '<div class="list" style="padding:4px 16px;margin-top:8px">' + hist + "</div>" +
            "</div>")
          : "") +
      "</div>";
    root.innerHTML = '<div class="sheet-peek"></div><div class="sheet-card">' + root.innerHTML + "</div>";
  }


  const STAGE = {
    start: { type: "video", poster: "media/poster-start.webp" },
    buchen: { type: "image", src: "media/hero-buchen.webp" },
    done: { type: "image", src: "media/hero-bestaetigung.webp" },
    matches: { type: "image", src: "media/hero-matches.webp" },
    turniere: { type: "image", src: "media/hero-turniere.webp" },
    profil: { type: "none" },
    ops: { type: "none" }
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
    } else if (spec.type === "none") {
      video.pause();
      video.classList.add("is-off");
      img.classList.add("is-off");
      img.removeAttribute("src");
    } else {
      video.pause();
      video.classList.add("is-off");
      img.classList.remove("is-off");
      img.src = spec.src || spec.poster || "media/poster-start.webp";
      img.alt = "";
    }
    document.getElementById("app").classList.toggle("is-sheet", key !== "start");
  }


  function renderOps() {
    const root = document.getElementById("screen-ops");
    const hours = [
      { t: "17:00", n: 2 }, { t: "17:30", n: 3 }, { t: "18:00", n: 4 }, { t: "18:30", n: 3 },
      { t: "19:00", n: 2 }, { t: "19:30", n: 4 }, { t: "20:00", n: 1 }, { t: "21:30", n: 2 }
    ];
    const bars = hours.map(function (h) {
      const pct = (h.n / 4) * 100;
      return '<div class="occ-col">' +
        '<b>' + h.n + "/4</b>" +
        '<div class="occ-bar" style="height:' + pct + '%" aria-hidden="true"></div>' +
        "<span>" + h.t + "</span>" +
      "</div>";
    }).join("");
    root.innerHTML =
      '<div class="ops-page">' +
        '<div class="pad stack">' +
          '<div class="back-row"><button class="btn btn-ghost" type="button" data-go="profil">Zur Mitglieder-Ansicht</button></div>' +
          '<div class="row-head"><h1 class="page-title">Ansicht Betreiber</h1><span class="sample">Beispieldaten</span></div>' +
          '<p class="lede">FLUTLICHT 27 · heute, Sonntag 15. November 2026. Übersicht für den Hallenchef, ohne Umsätze.</p>' +
          '<div class="ops-kpis">' +
            '<div class="kpi"><b>5</b><span>freie Plätze heute Abend, von 12 Abendfenstern (18:30–21:30)</span></div>' +
            '<div class="kpi"><b>7</b><span>Personen auf der Warteliste, Stand 21:00</span></div>' +
            '<div class="kpi"><b>18:30</b><span>beliebteste Spielzeit heute, 3 von 4 Plätzen belegt</span></div>' +
            '<div class="kpi"><b>2</b><span>Last-Minute-Fenster aktiviert</span></div>' +
          "</div>" +
          '<h2 class="section-title">Tagesbelegung nach Uhrzeit</h2>' +
          '<figure class="occ-chart">' +
            "<figcaption>Belegte Plätze je Uhrzeit, 4 Plätze gesamt, heute 15.11.2026, 17:00–21:30. Beispieldaten, Muster-App FLUTLICHT 27, Stand 15.11.2026, 21:00, kein echter Betrieb.</figcaption>" +
            '<div class="occ-bars" role="img" aria-label="Säulen: 17:00 zwei von vier, 17:30 drei, 18:00 vier, 18:30 drei, 19:00 zwei, 19:30 vier, 20:00 einer, 21:30 zwei belegte Plätze.">' + bars + "</div>" +
            '<p class="chart-note">Skala von 0 bis 4 Plätze, die Achse beginnt bei null. Jede Säule ist eine Uhrzeit.</p>' +
          "</figure>" +
          '<h2 class="section-title">Wartelisten-Nachfrage</h2>' +
          '<div class="list" style="padding:0">' +
            '<div class="rank-row"><span class="rank-pos">3</span><div><p class="item-title">18:30</p><p class="item-meta">3 Personen warten</p></div></div>' +
            '<div class="rank-row"><span class="rank-pos">2</span><div><p class="item-title">19:30</p><p class="item-meta">2 Personen warten</p></div></div>' +
            '<div class="rank-row"><span class="rank-pos">2</span><div><p class="item-title">21:00</p><p class="item-meta">2 Personen warten</p></div></div>' +
          "</div>" +
          '<h2 class="section-title">Last-Minute-Fenster</h2>' +
          '<div class="lm-list">' +
            '<div class="lm-item"><span>21:30 · Platz 3</span><em>aktiviert</em></div>' +
            '<div class="lm-item"><span>20:00 · Platz 2</span><em>aktiviert</em></div>' +
          "</div>" +
        "</div>" +
        '<p class="source-line">Quelle: Beispieldaten der Muster-App, Stichtag 15.11.2026, 21:00 Uhr. Kein echter Hallenbetrieb, keine Umsätze.</p>' +
      "</div>";
  }

  function defaultChat(id) {
    return state.chats[id] || [{ who: "Halle", text: "Hier könnt ihr euch kurz absprechen. Beispieldaten, nur auf diesem Gerät.", me: false }];
  }

  function openChat(id) {
    const m = state.matches.find(function (x) { return x.id === id; });
    if (!m) return;
    state.activeChat = id;
    if (!state.chats[id]) state.chats[id] = defaultChat(id).slice();
    document.getElementById("chat-title").textContent = "Chat · " + m.title;
    document.getElementById("chat-meta").textContent = m.date + " · " + m.time + " · " + m.court + " · Beispieldaten";
    renderChatLog();
    document.getElementById("chat-view").hidden = false;
    const input = document.getElementById("chat-input");
    if (input) input.value = "";
  }

  function renderChatLog() {
    const log = document.getElementById("chat-log");
    const msgs = state.chats[state.activeChat] || [];
    log.innerHTML = msgs.map(function (msg) {
      return '<div class="bubble' + (msg.me ? " me" : "") + '"><span class="who">' + escapeHtml(msg.who) + "</span>" + escapeHtml(msg.text) + "</div>";
    }).join("");
    log.scrollTop = log.scrollHeight;
  }

  function closeChat() {
    document.getElementById("chat-view").hidden = true;
    state.activeChat = null;
  }

  function goSlot(time) {
    if (!requireAuth({ type: "slot", time: time })) return;
    const dlg = document.getElementById("dlg-flutlicht");
    if (dlg && dlg.open) dlg.close();
    closeChat();
    state.buchenStep = "plan";
    state.date = "2026-11-15";
    state.time = time;
    state.duration = 90;
    const booked = bookedSet(state.date, state.time);
    const free = [1, 2, 3, 4].filter(function (n) { return !booked.has(n); });
    state.court = free[0] || null;
    showTab("buchen");
  }

  function inviteFourth(matchId, playerId) {
    if (!requireAuth({ type: "invite", match: matchId, player: playerId })) return;
    const m = state.matches.find(function (x) { return x.id === matchId; });
    const player = PLAYERS.find(function (x) { return x.id === playerId; });
    if (!m || !player || m.spots <= 0) return;
    m.spots = Math.max(0, m.spots - 1);
    state.invited[m.id] = (state.invited[m.id] || []).concat(player.id);
    state.joined[m.id] = true;
    renderMatches();
    const initials = [displayInitials()].concat((state.invited[m.id] || []).map(function (id) {
      const p = PLAYERS.find(function (x) { return x.id === id; });
      return p ? p.initials : "?";
    }));
    while (initials.length < 4) initials.push("·");
    const box = document.getElementById("full-avatars");
    box.innerHTML = initials.slice(0, 4).map(function (ini, i) {
      return '<div class="avatar' + (i === 0 ? " is-you" : "") + '">' + ini + "</div>";
    }).join("");
    const title = document.getElementById("full-title");
    if (title) title.textContent = "4/4 – " + player.name + " ist dabei";
    document.getElementById("dlg-full").showModal();
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
    if (tab === "ops") renderOps();
    document.getElementById("main").classList.toggle(
      "has-cta",
      tab === "buchen" && state.buchenStep === "plan"
    );
    var stageKey = tab;
    if (tab === "buchen" && state.buchenStep === "done") stageKey = "done";
    if (tab === "ops") stageKey = "ops";
    setStage(stageKey);
    document.getElementById("main").scrollTop = 0;
    if (tab === "matches" && state.focusMatch) {
      var el = document.getElementById("match-" + state.focusMatch);
      if (el) el.scrollIntoView({ block: "center", behavior: state.reduceMotion ? "auto" : "smooth" });
    }
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
      if (tabBtn.dataset.tab === "buchen" && !requireAuth({ type: "tab", tab: "buchen" })) return;
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
      if (go.dataset.focusMatch) state.focusMatch = go.dataset.focusMatch;
      showTab(go.dataset.go);
      return;
    }
  });

  const STORIES = {
    sunset: { src: "media/story-sunset.webp", title: "Sonnenuntergang", alt: "Orangefarbener Platz im Sonnenuntergang, lange Schatten, noch leere Bahn." },
    glass: { src: "media/story-glass.webp", title: "Glaswand", alt: "Gelber Ball trifft die Glaswand im Abendlicht, Spritzer auf dem Glas." },
    highfive: { src: "media/story-highfive.webp", title: "Abklatschen", alt: "Zwei Hände klatschen nach dem Punkt ab, Schläger und Ball in den anderen Händen." },
    lounge: { src: "media/story-lounge.webp", title: "Lounge", alt: "Holztheke im Clubhaus, zwei Wassergläser, Blick auf den Platz in der Dämmerung." }
  };

  function openStory(key) {
    const s = STORIES[key];
    if (!s) return;
    const view = document.getElementById("story-view");
    const img = document.getElementById("story-view-img");
    img.src = s.src;
    img.alt = s.alt;
    document.getElementById("story-view-title").textContent = s.title;
    view.hidden = false;
  }

  function closeStory() {
    const view = document.getElementById("story-view");
    view.hidden = true;
    document.getElementById("story-view-img").removeAttribute("src");
  }

  function goTonight() {
    closeStory();
    goSlot("18:30");
  }

  document.addEventListener("click", function (e) {
    const story = e.target.closest("[data-story]");
    if (story) {
      openStory(story.dataset.story);
      return;
    }
    if (e.target.closest("[data-close-story]")) {
      closeStory();
      return;
    }
    const open = e.target.closest("[data-open]");
    if (open && open.dataset.open === "flutlicht") {
      document.getElementById("dlg-flutlicht").showModal();
      return;
    }
    const act = e.target.closest("[data-action]");
    if (act && act.dataset.action === "tonight") {
      goTonight();
      return;
    }
    if (act && act.dataset.action === "open-ops") {
      showTab("ops");
      return;
    }
    const slot = e.target.closest("[data-slot]");
    if (slot) {
      goSlot(slot.dataset.slot);
      return;
    }
    const chatBtn = e.target.closest("[data-chat]");
    if (chatBtn) {
      openChat(chatBtn.dataset.chat);
      return;
    }
    if (e.target.closest("[data-close-chat]")) {
      closeChat();
      return;
    }
    const inv = e.target.closest("[data-invite-fourth]");
    if (inv) {
      inviteFourth(inv.dataset.match, inv.dataset.inviteFourth);
      return;
    }
    const fill = e.target.closest("[data-fill-player]");
    if (fill) {
      const idx = state.players.findIndex(function (n) { return !String(n).trim(); });
      if (idx >= 0) {
        state.players[idx] = fill.dataset.fillPlayer;
        const root = document.getElementById("screen-buchen");
        if (root) renderInvite(root);
      }
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
      const text = "FLUTLICHT 27: Anteil an der Buchung " + recap() + " (Beispieldaten)";
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
      if (!requireAuth({ type: "join", id: join.dataset.join })) return;
      const m = state.matches.find(function (x) { return x.id === join.dataset.join; });
      if (!m || state.joined[m.id] || m.spots <= 0) return;
      state.pendingJoin = m.id;
      document.getElementById("join-copy").textContent =
        m.title + " · Level " + m.level + " · " + m.date + " · " + m.time + " · " + m.court + ". Ein Platz wird für dich gehalten.";
      document.getElementById("dlg-join").showModal();
      return;
    }
    if (e.target.closest("[data-action='create-match']")) {
      if (!requireAuth({ type: "create" })) return;
      document.getElementById("dlg-create").showModal();
    }
  });

  document.getElementById("screen-turniere").addEventListener("click", function (e) {
    const team = e.target.closest("[data-team]");
    if (team) {
      if (!requireAuth({ type: "team", id: team.dataset.team })) return;
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
      box.innerHTML = [displayInitials(), "MS", "TR", "JL"].map(function (ini, i) {
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

  document.getElementById("form-chat").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!state.activeChat) return;
    const input = document.getElementById("chat-input");
    const text = (input.value || "").trim();
    if (!text) return;
    if (!state.chats[state.activeChat]) state.chats[state.activeChat] = defaultChat(state.activeChat).slice();
    state.chats[state.activeChat].push({ who: displayName(), text: text, me: true });
    input.value = "";
    renderChatLog();
  });

  document.getElementById("auth-view").addEventListener("click", function (e) {
    const viewBtn = e.target.closest("[data-auth-view]");
    if (viewBtn) {
      state.authView = viewBtn.dataset.authView;
      openAuth(state.authView);
      return;
    }
    const prov = e.target.closest("[data-auth-provider]");
    if (prov) {
      const demo = DEMO_USERS[prov.dataset.authProvider];
      if (demo) signIn(demo);
      return;
    }
    const act = e.target.closest("[data-auth-action]");
    if (act && act.dataset.authAction === "guest") {
      signInGuest();
      return;
    }
    if (act && act.dataset.authAction === "finish-onboarding") {
      finishOnboarding();
      return;
    }
    const lv = e.target.closest("[data-onboard-level]");
    if (lv) {
      state.authLevel = Number(lv.dataset.onboardLevel);
      renderAuth();
      return;
    }
    const tm = e.target.closest("[data-onboard-time]");
    if (tm) {
      const t = tm.dataset.onboardTime;
      const cur = state.authTimes.slice();
      const i = cur.indexOf(t);
      if (i >= 0) cur.splice(i, 1);
      else cur.push(t);
      state.authTimes = cur;
      renderAuth();
    }
  });

  document.getElementById("auth-view").addEventListener("submit", function (e) {
    const form = e.target.closest("#form-register, #form-signin");
    if (!form) return;
    e.preventDefault();
    const err = document.getElementById("auth-error");
    const data = new FormData(form);
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    if (form.id === "form-register") {
      const name = String(data.get("name") || "").trim();
      const level = String(data.get("level") || "");
      if (!name || !email || password.length < 6) {
        if (err) err.textContent = "Bitte Name, E-Mail und ein Passwort mit mindestens 6 Zeichen eintragen.";
        return;
      }
      if (err) err.textContent = "";
      state.authLevel = level ? Number(level) : null;
      signIn({ name: name, email: email, provider: "email", level: level || null }, { onboard: true });
      return;
    }
    if (!email || !password) {
      if (err) err.textContent = "Bitte E-Mail und Passwort eintragen.";
      return;
    }
    if (err) err.textContent = "";
    const local = email.split("@")[0].replace(/[._]+/g, " ");
    const pretty = local.split(" ").map(function (w) {
      return w ? w.charAt(0).toUpperCase() + w.slice(1) : "";
    }).join(" ").trim() || "Alex K.";
    signIn({ name: pretty, email: email, provider: "email" });
  });

  document.addEventListener("click", function (e) {
    const act = e.target.closest("[data-auth-action]");
    if (!act) return;
    if (act.dataset.authAction === "signout") {
      signOut();
      return;
    }
    if (act.dataset.authAction === "open") {
      openAuth("welcome");
    }
  });

  state.auth = loadAuth();
  showTab("start");
  document.documentElement.dataset.ready = "1";
  if (!state.auth) {
    openAuth("welcome", { delayed: true });
  }
  window.__wireframe = { state: state, showTab: showTab, setStage: setStage, openChat: openChat, goSlot: goSlot, openAuth: openAuth, isSigned: isSigned };
  document.getElementById("app").addEventListener("pointerdown", function () {
    const video = document.getElementById("stage-video");
    if (video && !video.classList.contains("is-off") && video.paused && !state.reduceMotion) {
      video.play().catch(function () {});
    }
  }, { passive: true });
})();
