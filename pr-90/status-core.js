// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Atacama <contact@atacama.tech>

// session-mesh showcase site: the feature status table, read and summarised.
// Loaded by the page before site.js, and by tools/sync-status.mjs, which
// writes the same texts into the static HTML for readers without JavaScript.
// The table is the <ul id="status-table"> in index.html: one <li> per feature
// with data-feature, data-status and data-label.
"use strict";
globalThis.statusCore = (() => {
  const STATUSES = ["available", "in progress", "planned"];
  const CHIP_CLASS = { available: "available", "in progress": "progress", planned: "planned" };

  function joinWords(words) {
    if (words.length < 2) return words.join("");
    return `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
  }

  const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);

  // features: [{ id, status, label }] in table order.
  function summary(features, ids) {
    const chosen = features.filter((f) => ids.includes(f.id));
    return STATUSES
      .map((status) => [status, chosen.filter((f) => f.status === status).map((f) => f.label)])
      .filter(([, labels]) => labels.length)
      .map(([status, labels]) => `${capitalise(joinWords(labels))}: ${status}.`)
      .join(" ");
  }

  function pendingSentence(features) {
    const pending = features.filter((f) => f.status !== "available").map((f) => f.label);
    if (!pending.length) return "Every feature in the status table below is in it.";
    return `Not in it yet: ${joinWords(pending)}, as the status table below shows.`;
  }

  // An element with data-requires="ID" shows only once feature ID is available;
  // one with data-unless="ID" shows only until then. Returns true to hide it.
  function gateHidden(features, kind, id) {
    const feature = features.find((f) => f.id === id);
    if (!feature) throw new Error(`data-${kind}="${id}" names no feature of the status table`);
    const on = feature.status === "available";
    return kind === "requires" ? !on : on;
  }

  return { STATUSES, CHIP_CLASS, summary, pendingSentence, gateHidden };
})();
