// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Atacama <contact@atacama.tech>

// The whiteboard panel of the collaborate section: you sketch on a session's
// whiteboard, ask its agent a question, and the agent edits the same board.
// Without this file the panel shows the final board, as written in index.html.
"use strict";

(() => {
  const byId = (id) => document.getElementById(id);
  const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  const STATUS = [
    "You sketch the request path on the session's whiteboard.",
    "You ask the session's agent about it, in its terminal.",
    "The agent reads the board with its mesh-board tools.",
    "The agent draws back on the same board. The save keeps a revision.",
  ];
  const STEP_DELAYS = [400, 2400, 3800, 5200];
  let timers = [];

  function setAgent(state, label) {
    byId("board-dot").className = `dot ${state}`;
    const text = byId("board-agent-state");
    text.textContent = label;
    text.className = `mock-state ${state === "busy" ? "" : "idle"}`.trim();
  }

  function setBoardState(label, changed) {
    const head = byId("board-state");
    head.textContent = label;
    head.className = `mock-state ${changed ? "wait" : "idle"}`;
  }

  function showStep(step) {
    document.querySelectorAll(`.board [data-board-step="${step}"]`).forEach((el) => {
      el.classList.remove("board-off");
      if (!reducedMotion()) el.classList.add("fresh");
    });
    byId("board-status").textContent = STATUS[step];
    if (step === 1) setAgent("busy", "working");
    if (step === 3) {
      setAgent("idle", "idle");
      setBoardState("Whiteboard changed", true);
      byId("board-replay").hidden = false;
    }
  }

  function stop() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function play() {
    stop();
    document.querySelectorAll(".board [data-board-step]").forEach((el) => {
      el.classList.add("board-off");
      el.classList.remove("fresh");
    });
    setAgent("idle", "idle");
    setBoardState("shared with api", false);
    byId("board-replay").hidden = true;
    STEP_DELAYS.forEach((delay, step) => {
      if (reducedMotion()) showStep(step);
      else timers.push(setTimeout(() => showStep(step), delay));
    });
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest("#board-replay")) play();
  });
  // site.js announces the panel it shows in the second column.
  document.addEventListener("mesh-site:panel", (event) => {
    if (event.detail.id === "collaborate" && event.detail.variant === "whiteboard") play(); else stop();
  });
})();
