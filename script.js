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

  const screenOrder = ["screen-intro", "screen-note", "screen-playlist"];
  const progressDots = Array.from(document.querySelectorAll(".progress-dot"));
  let furthest = 0;

  const introScreen = document.getElementById("screen-intro");

  function revealIntro() {
    if (!introScreen) return;
    introScreen.classList.remove("revealed");
    void introScreen.offsetWidth; // restart the entrance animation on every visit
    introScreen.classList.add("revealed");
  }

  function showScreen(id) {
    screens.forEach((screen) => screen.classList.remove("active"));
    const target = document.getElementById(id);
    if (!target) return;
    target.classList.add("active");
    target.focus?.({ preventScroll: true });

    const idx = screenOrder.indexOf(id);
    if (idx > furthest) furthest = idx;

    progressDots.forEach((dot) => {
      const dotIdx = screenOrder.indexOf(dot.dataset.target);
      dot.classList.toggle("current", dot.dataset.target === id);
      dot.classList.toggle("reached", dotIdx <= furthest);
    });

    if (id === "screen-intro") {
      window.setTimeout(revealIntro, reduceMotion ? 0 : 80);
    }

    if (id === "screen-note" && !typed) {
      typed = true;
      window.setTimeout(startTypewriter, reduceMotion ? 0 : 500);
    }

    if (id === "screen-playlist") {
      startVinyl();
    }
  }

  // password gate — the very first screen
  const passwordForm = document.getElementById("passwordForm");
  const passwordInput = document.getElementById("passwordInput");
  const passwordError = document.getElementById("passwordError");
  const passwordFrame = document.querySelector(".frame--password");
  const PASSWORD = "ciaraisalwaysright";

  passwordForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const attempt = passwordInput.value.trim().toLowerCase().replace(/\s+/g, "");

    if (attempt === PASSWORD) {
      showScreen("screen-intro");
      return;
    }

    if (passwordError) {
      passwordError.textContent = "try again";
      passwordError.classList.add("show");
    }
    if (passwordFrame) {
      passwordFrame.classList.remove("shake");
      void passwordFrame.offsetWidth;
      passwordFrame.classList.add("shake");
    }
    passwordInput.value = "";
    passwordInput.focus();
  });

  progressDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      if (dot.classList.contains("reached")) showScreen(dot.dataset.target);
    });
  });

  // subtle pointer-parallax on the ambient glow — desktop/fine-pointer only
  if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    window.addEventListener("pointermove", (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 18;
      const y = (event.clientY / window.innerHeight - 0.5) * 18;
      document.documentElement.style.setProperty("--tilt-x", `${x}px`);
      document.documentElement.style.setProperty("--tilt-y", `${y}px`);
    });
  }

  const vinylRig = document.getElementById("vinylRig");
  const vinyl = document.getElementById("vinyl");
  let vinylTimer = null;

  function startVinyl() {
    if (!vinylRig || !vinyl) return;
    if (vinylTimer) window.clearTimeout(vinylTimer);

    vinylRig.classList.remove("playing");
    vinyl.classList.remove("playing");

    const dropDelay = reduceMotion ? 0 : 500;
    const spinDelay = reduceMotion ? 0 : 900;

    window.setTimeout(() => vinylRig.classList.add("playing"), dropDelay);
    vinylTimer = window.setTimeout(() => vinyl.classList.add("playing"), dropDelay + spinDelay);
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
})();
