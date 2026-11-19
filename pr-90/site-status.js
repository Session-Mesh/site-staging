// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Atacama <contact@atacama.tech>

// session-mesh showcase site: the feature status table, applied to the page.
// Loaded after status-core.js and before site.js, which calls applyStatuses().
//
// The status table (#status-table, in "roadmap") is the only place a status is
// set. Every chip elsewhere ([data-status-of]), the structure excerpt in the
// sidebar ([data-status-summary]), the "not in it yet" sentence
// ([data-status-pending]), the gated elements ([data-requires], [data-unless]),
// the session counts ([data-session-count]) and the status document of the
// roadmap pane follow it. tools/sync-status.mjs writes the same texts and
// hidden attributes into the HTML for readers without JavaScript.
"use strict";

function readStatuses() {
  return [...document.querySelectorAll("#status-table [data-feature]")]
    .map((li) => ({ id: li.dataset.feature, status: li.dataset.status, label: li.dataset.label }));
}

// True when the gate on the element, or on an ancestor, is closed by the table.
function gatedOff(element, features = readStatuses()) {
  const gate = element.closest("[data-requires], [data-unless]");
  if (!gate) return false;
  const kind = gate.hasAttribute("data-requires") ? "requires" : "unless";
  return statusCore.gateHidden(features, kind, gate.getAttribute(`data-${kind}`));
}

function paintChip(chip, status) {
  chip.textContent = status;
  chip.className = `chip-s ${statusCore.CHIP_CLASS[status] || ""}`.trim();
}

function copyLegend(slot) {
  const copy = document.getElementById("status-legend").cloneNode(true);
  copy.removeAttribute("id");
  const link = slot.querySelector("a");
  slot.replaceChildren(copy);
  if (!link) return;
  const more = document.createElement("p");
  more.className = "small-print";
  link.textContent = "the status table";
  more.append("The status of every feature on this page: ", link, ".");
  slot.append(more);
}

function applyStatuses() {
  const features = readStatuses();
  const byId = Object.fromEntries(features.map((f) => [f.id, f]));
  document.querySelectorAll("#status-table [data-feature]").forEach((li) => paintChip(li.querySelector(".chip-s"), li.dataset.status));
  document.querySelectorAll("[data-status-of]").forEach((chip) => {
    const feature = byId[chip.dataset.statusOf];
    if (feature) paintChip(chip, feature.status);
  });
  document.querySelectorAll("[data-status-summary]").forEach((el) => { el.textContent = statusCore.summary(features, el.dataset.statusSummary.split(/\s+/)); });
  document.querySelectorAll("[data-status-pending]").forEach((el) => { el.textContent = statusCore.pendingSentence(features); });
  document.querySelectorAll("[data-requires], [data-unless]").forEach((el) => { el.hidden = gatedOff(el, features); });
  const sessions = [...document.querySelectorAll("#list .items [data-session]")].filter((item) => !gatedOff(item, features));
  document.querySelectorAll("[data-session-count]").forEach((el) => { el.textContent = String(sessions.length); });
  // The legend is shown wherever chips are used: a copy goes into each slot.
  document.querySelectorAll("[data-legend-copy]").forEach(copyLegend);
}
