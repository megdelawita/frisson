(() => {
  "use strict";

  const noteText = `Knowing how good your music taste already is, there's a good chance you'll know most of these.

I'll keep adding songs I think you'd enjoy, and songs that make me think of you.

Hopefully it adds a centimeter or two to your hand demonstration of how much you miss me. 🤏🏾`;

  const screens = Array.from(document.querySelectorAll(".screen"));
  const noteEl = document.getElementById("note");
  const noteFullEl = document.getElementById("note-full");
  const continueBtn = document.getElementById("continueBtn");
  const tapHint = document.getElementById("tapHint");
  const enterBtn = document.getElementById("enterBtn");
  const noteScreen = document.getElementById("screen-note");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let typed = false;
  let typing = false;
  let typeIndex = 0;
  let typeTimer = null;

  function showScreen(id) {
    screens.forEach((screen) => screen.classList.remove("active"));
    const target = document.getElementById(id);
    if (!target) return;
    target.classList.add("active");
    target.focus?.({ preventScroll: true });

    if (id === "screen-note" && !typed) {
      typed = true;
      window.setTimeout(startTypewriter, reduceMotion ? 0 : 500);
    }
  }

  function startTypewriter() {
    typing = true;
    if (reduceMotion) {
      finishTypewriter();
      return;
    }
    typeIndex = 0;
    step();
  }

  function step() {
    if (typeIndex < noteText.length) {
      noteEl.textContent += noteText[typeIndex];
      typeIndex++;
      typeTimer = window.setTimeout(step, 22);
    } else {
      finishTypewriter();
    }
  }

  function finishTypewriter() {
    if (typeTimer) window.clearTimeout(typeTimer);
    typing = false;
    noteEl.textContent = noteText;
    noteEl.classList.add("done");
    continueBtn.classList.add("show");
    tapHint.classList.add("hide");
  }

  // tap anywhere on the note screen to skip straight to the full text
  noteScreen.addEventListener("click", (event) => {
    if (event.target === continueBtn) return;
    if (typed && typing) finishTypewriter();
  });

  enterBtn.addEventListener("click", () => showScreen("screen-note"));
  continueBtn.addEventListener("click", () => showScreen("screen-playlist"));

  // hidden easter egg — hold the wordmark for a moment
  const wordmarkHit = document.getElementById("wordmarkHit");
  const firefly = document.getElementById("firefly");
  const layers = document.getElementById("layers");
  let holdTimer = null;
  let eggResetTimer = null;

  function armHold() {
    holdTimer = window.setTimeout(triggerEgg, 850);
  }

  function disarmHold() {
    if (holdTimer) window.clearTimeout(holdTimer);
  }

  function triggerEgg() {
    if (!firefly || !layers) return;

    firefly.classList.remove("active");
    layers.classList.remove("active");
    void firefly.offsetWidth; // restart the animations if they've already run once

    firefly.classList.add("active");
    layers.classList.add("active");

    if (eggResetTimer) window.clearTimeout(eggResetTimer);
    eggResetTimer = window.setTimeout(() => {
      firefly.classList.remove("active");
      layers.classList.remove("active");
    }, 4200);
  }

  if (wordmarkHit) {
    wordmarkHit.addEventListener("pointerdown", armHold);
    ["pointerup", "pointerleave", "pointercancel"].forEach((evt) =>
      wordmarkHit.addEventListener(evt, disarmHold)
    );
    wordmarkHit.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        triggerEgg();
      }
    });
  }

  // apple music embed — swap the shimmer skeleton for the real player once it loads
  const frame = document.getElementById("playlistFrame");
  const skeleton = document.getElementById("playerSkeleton");

  if (frame) {
    frame.addEventListener("load", () => {
      frame.classList.add("loaded");
      skeleton.classList.add("done");
    });

    // fallback in case the load event never fires for some reason
    window.setTimeout(() => {
      frame.classList.add("loaded");
      skeleton.classList.add("done");
    }, 4000);
  }

  showScreen("screen-intro");
})();
