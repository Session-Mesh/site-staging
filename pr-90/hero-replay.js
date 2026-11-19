// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Atacama <contact@atacama.tech>

// The illustration of the welcome section: a small session list and one
// terminal, replaying one message between two agents up to the consent
// request, which the visitor answers. Without this file the illustration
// stays on the consent step, as written in index.html.
"use strict";

(() => {
  const byId = (id) => document.getElementById(id);
  const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  const STATUS = [
    "Two agents work, each in its own session.",
    "tests sends a message to api. api is working: nothing is typed into it.",
    "api's turn ends. It is idle at its prompt.",
    "api asks to read the message. You decide.",
  ];
  const ANSWERS = {
    once: {
      status: "Read this time: api reads this one message and goes back to work.",
      line: "› Reading the message from tests: “The login tests fail since the token change.”",
      state: "busy",
    },
    later: {
      status: "Later: the message stays in api's inbox, unread.",
      line: "› The message waits in the inbox.",
      state: "idle",
    },
  };
  const STATE_LABEL = { busy: "working", idle: "idle" };
  const STEP_DELAYS = [400, 1800, 3200, 4400];
  let timers = [];

  // The session "api" in the list and in the terminal head. A request to read
  // a message does not move the session to "Waiting for you": it stays working.
  function setApiState(state) {
    byId("hm-api-dot").className = `dot ${state}`;
    const label = byId("hm-api-st");
    label.textContent = STATE_LABEL[state];
    label.className = `st ${state === "idle" ? "done" : state}`;
    const head = byId("hm-state");
    head.textContent = `● ${STATE_LABEL[state]}`;
    head.className = `hm-state ${state}`;
  }

  function reveal(step) {
    document.querySelectorAll(`#hero-mock [data-hero-step="${step}"]`).forEach((el) => {
      el.classList.remove("hm-off");
      if (!reducedMotion()) el.classList.add("fresh");
    });
  }

  function showStep(step) {
    reveal(step);
    byId("hm-status").textContent = STATUS[step];
    if (step === 1) byId("hm-tests-last").textContent = "Message sent to api";
    if (step === 2) setApiState("idle");
    if (step === 3) setApiState("busy");
  }

  function stop() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function reset() {
    document.querySelectorAll("#hero-mock [data-hero-step]").forEach((el) => {
      el.classList.add("hm-off");
      el.classList.remove("fresh");
    });
    byId("hm-result").classList.add("hm-off");
    byId("hm-tests-last").textContent = "Run the login tests";
    byId("hm-replay").hidden = true;
    setApiState("busy");
  }

  function play() {
    stop();
    reset();
    STEP_DELAYS.forEach((delay, step) => {
      if (reducedMotion()) showStep(step);
      else timers.push(setTimeout(() => showStep(step), delay));
    });
  }

  function answer(kind) {
    const { status, line, state } = ANSWERS[kind];
    stop();
    byId("hm-consent").classList.add("hm-off");
    const result = byId("hm-result");
    result.textContent = line;
    result.classList.remove("hm-off");
    byId("hm-status").textContent = status;
    setApiState(state);
    byId("hm-replay").hidden = false;
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-hero-answer]");
    if (button) answer(button.dataset.heroAnswer);
    else if (event.target.closest("#hm-replay")) play();
  });
  // site.js announces the section it shows.
  document.addEventListener("mesh-site:session", (event) => {
    if (event.detail === "welcome") play(); else stop();
  });
})();
