// Handcrafted UI Choreography & Modal Controller
// Replicates the Stage Emblem, Wave Gingham Banner, 3D Card Deal/Flip, Flying Mini-Card, and 9-Panel Status Screen

export class UiAnimator {
  constructor(statsSystem, catManager, sound) {
    this.statsSystem = statsSystem;
    this.catManager = catManager;
    this.sound = sound;

    this.activeModal = "stage_intro"; // "stage_intro" | "wave_banner" | "card_draft" | "status" | "menu" | null
    this.isDraftAnimating = false;
    this.currentDraftCards = [];
    this.currentDraftCategory = "offense";

    this.cacheDomElements();
    this.renderStageEmblemSvgRing();
    this.bindEvents();
    this.syncHud();
  }

  cacheDomElements() {
    this.elTopHud = document.getElementById("top-hud");
    this.elBottomHud = document.getElementById("bottom-hud");
    this.elDofPots = document.getElementById("dof-flowerpots-layer");
    this.elHalftone = document.getElementById("halftone-overlay");

    // Top HUD
    this.elPortraitImg = document.getElementById("hud-portrait-img");
    this.elHeartFill = document.getElementById("hud-heart-fill");
    this.elHeartText = document.getElementById("hud-heart-text");
    this.elWaveText = document.getElementById("hud-wave-text");

    // Bottom HUD
    this.elCoinVal = document.getElementById("hud-coin-val");
    this.elGemVal = document.getElementById("hud-gem-val");

    this.elLvOffense = document.getElementById("lv-val-offense");
    this.elLvDefense = document.getElementById("lv-val-defense");
    this.elLvSupport = document.getElementById("lv-val-support");

    this.btnOffense = document.getElementById("btn-lv-offense");
    this.btnDefense = document.getElementById("btn-lv-defense");
    this.btnSupport = document.getElementById("btn-lv-support");

    this.btnSkill = document.getElementById("btn-circle-skill");
    this.btnEnchant = document.getElementById("btn-circle-enchant");
    this.btnItem = document.getElementById("btn-circle-item");

    this.badgeSkill = document.getElementById("badge-skill");
    this.badgeEnchant = document.getElementById("badge-enchant");
    this.badgeItem = document.getElementById("badge-item");

    this.btnStatus = document.getElementById("btn-util-status");
    this.btnMenu = document.getElementById("btn-util-menu");
    this.elHudHoverHand = document.getElementById("hud-hover-hand");
    this.elFlyingCardLayer = document.getElementById("flying-card-layer");

    // Modals
    this.modalStageIntro = document.getElementById("stage-emblem-modal");
    this.btnStageContinue = document.getElementById("btn-stage-continue");
    this.elWaveBanner = document.getElementById("wave-banner");
    this.elWaveBannerTitle = document.getElementById("wave-banner-title");

    this.modalCardDraft = document.getElementById("card-draft-modal");
    this.elCardRow = document.getElementById("card-draft-row");

    this.modalStatus = document.getElementById("status-modal");
    this.elStatusGrid = document.getElementById("status-grid-container");
    this.btnStatusBack = document.getElementById("btn-status-back");

    this.modalMenu = document.getElementById("menu-modal");
    this.btnMenuClose = document.getElementById("btn-menu-close");
    this.btnMenuRestart = document.getElementById("btn-menu-restart");
    this.chkFreeDraft = document.getElementById("chk-free-draft");
  }

  // Generates the geometric folk-triangle ring border & 9 alternating cat/fish silhouettes on Stage 1 Emblem (frame_04.jpg)
  renderStageEmblemSvgRing() {
    const ringContainer = document.getElementById("emblem-folk-ring-svg");
    if (ringContainer) {
      const size = 620;
      const cx = size / 2;
      const cy = size / 2;
      const numTriangles = 40;
      let paths = "";

      for (let i = 0; i < numTriangles; i++) {
        const a0 = (i / numTriangles) * Math.PI * 2;
        const a1 = ((i + 1) / numTriangles) * Math.PI * 2;
        const aMid = (a0 + a1) / 2;
        const isOuter = i % 2 === 0;
        const col = isOuter ? "#9c6234" : "#64a6a4";

        const rBase = isOuter ? 284 : 262;
        const rTip = isOuter ? 262 : 284;

        const x1 = cx + Math.cos(a0 + 0.012) * rBase;
        const y1 = cy + Math.sin(a0 + 0.012) * rBase;
        const x2 = cx + Math.cos(a1 - 0.012) * rBase;
        const y2 = cy + Math.sin(a1 - 0.012) * rBase;
        const xTip = cx + Math.cos(aMid) * rTip;
        const yTip = cy + Math.sin(aMid) * rTip;

        paths += `<polygon points="${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)} ${xTip.toFixed(1)},${yTip.toFixed(1)}" fill="${col}" />`;
      }

      ringContainer.innerHTML = `
        <svg viewBox="0 0 ${size} ${size}" width="100%" height="100%">
          <circle cx="${cx}" cy="${cy}" r="290" fill="none" stroke="#9c6234" stroke-width="3" />
          ${paths}
          <circle cx="${cx}" cy="${cy}" r="252" fill="none" stroke="#9c6234" stroke-width="3" stroke-dasharray="4 6" />
        </svg>
      `;
    }

    const iconsRow = document.getElementById("emblem-cat-fish-icons");
    if (iconsRow) {
      const catSvg = `<svg viewBox="0 0 36 30" class="emblem-mini-icon"><path d="M5,12 L8,2 L15,8 Q18,7 21,8 L28,2 L31,12 Q34,17 31,23 Q26,28 18,28 Q10,28 5,23 Q2,17 5,12 Z" fill="#d7b38c"/><circle cx="13" cy="17" r="1.6" fill="#f3dfc6"/><circle cx="23" cy="17" r="1.6" fill="#f3dfc6"/><path d="M15,21 Q16.5,23 18,21 Q19.5,23 21,21" stroke="#f3dfc6" stroke-width="1.5" fill="none"/></svg>`;
      const fishSvg = `<svg viewBox="0 0 38 26" class="emblem-mini-icon"><path d="M3,13 Q12,3 25,9 L34,3 L32,13 L34,23 L25,17 Q12,23 3,13 Z" fill="#d7b38c"/><circle cx="10" cy="11" r="1.6" fill="#f3dfc6"/></svg>`;
      let html = "";
      for (let i = 0; i < 9; i++) {
        html += i % 2 === 0 ? catSvg : fishSvg;
      }
      iconsRow.innerHTML = html;
    }
  }

  bindEvents() {
    // Stage 1 Continue button
    const closeIntro = () => {
      if (this.activeModal !== "stage_intro") return;
      this.sound.playCardSelectWhoosh();
      this.modalStageIntro.classList.add("hidden");
      this.elDofPots.classList.remove("active");
      this.elTopHud.classList.remove("hidden");
      this.elBottomHud.classList.remove("hidden", "draft-lowered");
      document.getElementById("plaza-canvas").classList.remove("dof-blur");
      this.triggerWaveBanner(this.catManager.wave);
    };

    this.btnStageContinue.addEventListener("click", closeIntro);

    // Keyboard shortcuts ([Z] Continue, [X] Back, [1/2/3] Level Up)
    window.addEventListener("keydown", (e) => {
      if (e.key === "z" || e.key === "Z" || e.key === "Enter" || e.key === " ") {
        if (this.activeModal === "stage_intro") {
          e.preventDefault();
          closeIntro();
        }
      } else if (e.key === "x" || e.key === "X" || e.key === "Escape") {
        if (this.activeModal === "status") {
          e.preventDefault();
          this.closeStatusModal();
        } else if (this.activeModal === "menu") {
          e.preventDefault();
          this.closeMenuModal();
        }
      }
    });

    // 3 Level-Up Category Buttons (Offense, Defense, Support)
    const bindLvButton = (btn, category) => {
      btn.addEventListener("mouseenter", () => {
        this.sound.playHoverTick();
        this.positionHudHoverHand(btn);
      });
      btn.addEventListener("mouseleave", () => {
        this.hideHudHoverHand();
      });
      btn.addEventListener("click", () => {
        if (this.activeModal !== null || this.isDraftAnimating) return;
        if (!this.statsSystem.canAffordCategory(category)) return;
        this.openCardDraftModal(category);
      });
    };

    bindLvButton(this.btnOffense, "offense");
    bindLvButton(this.btnDefense, "defense");
    bindLvButton(this.btnSupport, "support");

    // 3 Circular Action Buttons (Skill, Enchant, Item)
    [this.btnSkill, this.btnEnchant, this.btnItem, this.btnStatus, this.btnMenu].forEach((btn) => {
      btn.addEventListener("mouseenter", () => {
        this.sound.playHoverTick();
        this.positionHudHoverHand(btn);
      });
      btn.addEventListener("mouseleave", () => {
        this.hideHudHoverHand();
      });
    });

    this.btnSkill.addEventListener("click", () => {
      if (this.activeModal !== null) return;
      if (this.statsSystem.skillQueue.length > 0) {
        const skill = this.statsSystem.skillQueue.shift();
        this.catManager.triggerSkillAction(skill);
        this.syncHud();
      } else if (this.statsSystem.debugFreeDraft) {
        // Allow testing a volley even when queue is empty in Prototype mode
        this.catManager.triggerSkillAction({
          id: "off_big_volley_long",
          category: "offense",
          action: "volley_long_fish",
        });
      }
    });

    this.btnEnchant.addEventListener("click", () => {
      if (this.activeModal !== null) return;
      if (this.statsSystem.enchantQueue.length > 0) {
        const enc = this.statsSystem.enchantQueue.shift();
        this.statsSystem.activeEnchants.push({
          ...enc,
          remaining: enc.duration || 8,
        });
        this.sound.playSkillActivate();
        this.catManager.spawnStarBurst(this.catManager.protagonist.x, this.catManager.protagonist.y - 40, 8);
        this.syncHud();
      }
    });

    this.btnItem.addEventListener("click", () => {
      if (this.activeModal !== null) return;
      // Bonus treat shower item
      if (this.statsSystem.gems >= 5) {
        this.statsSystem.gems -= 5;
        this.sound.playSkillActivate();
        this.catManager.triggerSkillAction({
          id: "sup_treat_festival",
          category: "support",
          action: "volley_sharing_fish",
        });
        this.syncHud();
      }
    });

    // Status Modal Button
    this.btnStatus.addEventListener("click", () => {
      if (this.activeModal === null) {
        this.openStatusModal();
      } else if (this.activeModal === "status") {
        this.closeStatusModal();
      }
    });

    this.btnStatusBack.addEventListener("click", () => {
      this.closeStatusModal();
    });

    // Menu Modal Button
    this.btnMenu.addEventListener("click", () => {
      if (this.activeModal === null) {
        this.openMenuModal();
      } else if (this.activeModal === "menu") {
        this.closeMenuModal();
      }
    });

    this.btnMenuClose.addEventListener("click", () => {
      this.closeMenuModal();
    });

    this.btnMenuRestart.addEventListener("click", () => {
      this.statsSystem.reset();
      this.catManager.wave = 1;
      this.catManager.seedInitialPlazaCats();
      this.closeMenuModal();
      this.openStageIntroModal();
      this.syncHud();
    });

    if (this.chkFreeDraft) {
      this.chkFreeDraft.addEventListener("change", (e) => {
        this.statsSystem.debugFreeDraft = e.target.checked;
        this.syncHud();
      });
    }
  }

  positionHudHoverHand(targetEl) {
    if (!this.elHudHoverHand || !targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const stageRect = document.getElementById("game-stage").getBoundingClientRect();
    const scaleX = 1920 / stageRect.width;
    const scaleY = 1080 / stageRect.height;

    const vx = (rect.left - stageRect.left) * scaleX - 66;
    const vy = (rect.top - stageRect.top + rect.height * 0.45) * scaleY - 28;

    this.elHudHoverHand.style.left = `${vx}px`;
    this.elHudHoverHand.style.top = `${vy}px`;
    this.elHudHoverHand.classList.remove("hidden");
  }

  hideHudHoverHand() {
    if (this.elHudHoverHand) {
      this.elHudHoverHand.classList.add("hidden");
    }
  }

  openStageIntroModal() {
    this.activeModal = "stage_intro";
    this.modalStageIntro.classList.remove("hidden");
    this.elDofPots.classList.add("active");
    if (this.elTopHud) this.elTopHud.classList.add("hidden");
    if (this.elBottomHud) this.elBottomHud.classList.add("hidden");
    document.getElementById("plaza-canvas").classList.add("dof-blur");
  }

  // Shows the Yellow-Green Gingham Plaid WAVE Banner (frame_06.jpg, 00:05 - 00:07)
  triggerWaveBanner(waveNum) {
    this.activeModal = "wave_banner";
    this.elWaveBannerTitle.innerHTML = "";
    const text = `WAVE  ${waveNum}`;
    [...text].forEach((ch, idx) => {
      const span = document.createElement("span");
      span.className = "wave-char";
      span.style.animationDelay = `${idx * 0.045}s`;
      span.textContent = ch === " " ? "\u00A0" : ch;
      this.elWaveBannerTitle.appendChild(span);
    });

    this.elWaveBanner.classList.remove("hidden");
    this.sound.playWaveBannerChime();

    setTimeout(() => {
      this.elWaveBanner.classList.add("hidden");
      if (this.activeModal === "wave_banner") {
        this.activeModal = null;
      }
    }, 1850);
  }

  // Opens the 3-Card (or 4-Card) Roguelite Draft Modal with Halftone Overlay & 3D Deck Flip (frame_13..45)
  openCardDraftModal(category) {
    this.activeModal = "card_draft";
    this.isDraftAnimating = true;
    this.currentDraftCategory = category;
    this.hideHudHoverHand();

    const cards = this.statsSystem.drawCardsForCategory(category);
    this.currentDraftCards = cards;

    // Activate halftone screentone overlay, lower bottom HUD, & raise foreground blurred flowerpots
    this.elHalftone.classList.remove("hidden");
    this.elDofPots.classList.add("active");
    if (this.elBottomHud) this.elBottomHud.classList.add("draft-lowered");
    this.modalCardDraft.classList.remove("hidden");

    this.sound.playDraftOpenChime();
    this.sound.playCardRiffle(cards.length * 2, 0.055);

    this.elCardRow.innerHTML = "";
    cards.forEach((card, idx) => {
      const cardWrapper = this.createDraftCardElement(card, idx);
      this.elCardRow.appendChild(cardWrapper);

      // Deal from bottom-left deck into slot
      setTimeout(() => {
        cardWrapper.classList.add("dealt");
      }, 60 + idx * 95);

      // Flip 180 deg face-up in 3D perspective
      setTimeout(() => {
        cardWrapper.classList.add("flipped");
        if (idx === cards.length - 1) {
          this.isDraftAnimating = false;
        }
      }, 390 + idx * 115);
    });
  }

  createDraftCardElement(card, idx) {
    const wrapper = document.createElement("div");
    wrapper.className = `draft-card-slot theme-${card.colorTheme} type-${card.type}`;
    wrapper.dataset.index = idx;

    // Top-left circular badge for Enchant (🌙) or Skill (☀)
    let cornerBadgeHtml = "";
    if (card.type === "enchant") {
      cornerBadgeHtml = `
        <div class="card-type-badge badge-moon" title="Enchant">
          <svg viewBox="0 0 36 36" width="28" height="28">
            <path d="M22,7 A11,11 0 1,0 29,23 A9,9 0 1,1 22,7 Z" fill="#d8b4fe" stroke="#4c1d95" stroke-width="2.5"/>
            <path d="M13,11 L15,15 L19,17 L15,19 L13,23 L11,19 L7,17 L11,15 Z" fill="#f0abfc" stroke="#4c1d95" stroke-width="1.8"/>
          </svg>
        </div>`;
    } else if (card.type === "skill") {
      cornerBadgeHtml = `
        <div class="card-type-badge badge-sun" title="Skill">
          <svg viewBox="0 0 36 36" width="28" height="28">
            <circle cx="18" cy="18" r="8" fill="#facc15" stroke="#713f12" stroke-width="2.5"/>
            <g stroke="#713f12" stroke-width="2.2" fill="#fde047">
              <polygon points="18,3 21,8 15,8"/>
              <polygon points="18,33 21,28 15,28"/>
              <polygon points="3,18 8,21 8,15"/>
              <polygon points="33,18 28,21 28,15"/>
              <polygon points="7,7 12,9 9,12"/>
              <polygon points="29,29 24,27 27,24"/>
              <polygon points="29,7 24,9 27,12"/>
              <polygon points="7,29 12,27 9,24"/>
            </g>
          </svg>
        </div>`;
    }

    // Side border decoration inside top illustration box (Triangles for Level Up, Ornate Filigree for Offering)
    let patternDecorHtml = "";
    if (card.type === "levelup") {
      let trisLeft = "";
      let trisRight = "";
      for (let t = 0; t < 9; t++) {
        trisLeft += `<span class="tri-left"></span>`;
        trisRight += `<span class="tri-right"></span>`;
      }
      patternDecorHtml = `
        <div class="card-tri-strip left">${trisLeft}</div>
        <div class="card-tri-strip right">${trisRight}</div>
      `;
    } else if (card.type === "offering") {
      patternDecorHtml = `
        <div class="card-offering-filigree">
          <span class="filigree-corner tl">🐟</span>
          <span class="filigree-corner tr">🐟</span>
          <span class="filigree-corner bl">🐟</span>
          <span class="filigree-corner br">🐟</span>
        </div>
      `;
    }

    // Authentic hand-drawn white-outline fish with '仮' mark inside card art header (matches frame_13.jpg!)
    const fishKariSvg = `
      <svg class="card-kari-fish-svg" viewBox="0 0 220 130">
        <!-- Upper & Lower Dorsal Fins -->
        <path d="M95,25 Q112,8 126,24" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M88,105 Q106,120 120,104" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round"/>
        <!-- Hand-drawn Fish Body & Tail -->
        <path d="M22,65 C22,28 85,20 138,44 C156,52 168,58 178,50 L198,34 L196,96 L176,80 C166,72 154,78 138,86 C85,110 22,102 22,65 Z"
              fill="rgba(255,255,255,0.14)" stroke="#ffffff" stroke-width="5" stroke-linejoin="round"/>
        <!-- Tail Fin Stripes -->
        <line x1="182" y1="54" x2="195" y2="48" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="180" y1="65" x2="195" y2="65" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="182" y1="76" x2="195" y2="82" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
        <!-- Eye -->
        <circle cx="52" cy="54" r="8" fill="none" stroke="#ffffff" stroke-width="4.5"/>
        <!-- Hand-drawn '仮' (Provisional/Temp) Brush Strokes -->
        <g stroke="#ffffff" stroke-width="4.8" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <path d="M90,38 L74,66"/>
          <path d="M83,53 L83,92"/>
          <path d="M100,44 L142,44"/>
          <path d="M104,44 L98,86"/>
          <path d="M106,58 L138,58 L120,88"/>
          <path d="M108,66 L142,90"/>
        </g>
      </svg>
    `;

    wrapper.innerHTML = `
      <div class="card-hover-hand"></div>
      <div class="draft-card-3d">
        <!-- Navy & Gold Ornate Card Back (frame_17.jpg, frame_28.jpg) -->
        <div class="draft-card-face draft-card-back">
          <div class="card-back-gold-frame">
            <span class="corner-paw tl">🐾</span>
            <span class="corner-paw tr">🐾</span>
            <span class="corner-paw bl">🐾</span>
            <span class="corner-paw br">🐾</span>
            <div class="card-back-center-medallion">
              <svg viewBox="0 0 80 80" width="68" height="68">
                <circle cx="40" cy="40" r="35" fill="none" stroke="#cba344" stroke-width="3"/>
                <path d="M18,32 L22,15 L33,24 Q40,22 47,24 L58,15 L62,32 Q66,42 60,52 Q52,60 40,60 Q28,60 20,52 Q14,42 18,32 Z" fill="#cba344"/>
                <circle cx="31" cy="39" r="2.6" fill="#3a4c7a"/>
                <circle cx="49" cy="39" r="2.6" fill="#3a4c7a"/>
                <path d="M35,46 Q37.5,49 40,46 Q42.5,49 45,46" stroke="#3a4c7a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Color-Coded Card Front -->
        <div class="draft-card-face draft-card-front">
          <div class="card-art-header ${card.type === "enchant" || card.type === "skill" ? "striped-header" : ""}">
            ${cornerBadgeHtml}
            ${patternDecorHtml}
            ${fishKariSvg}
          </div>
          <div class="card-title-banner">${card.title}</div>
          <div class="card-desc-box">${card.desc.replace(/\n/g, "<br/>")}</div>
          <div class="card-footer-pill">${card.footer}</div>
        </div>
      </div>
    `;

    wrapper.addEventListener("mouseenter", () => {
      if (this.isDraftAnimating) return;
      this.sound.playHoverTick();
      wrapper.classList.add("hovered");
    });

    wrapper.addEventListener("mouseleave", () => {
      wrapper.classList.remove("hovered");
    });

    wrapper.addEventListener("click", () => {
      if (this.isDraftAnimating) return;
      this.handleCardSelection(card, idx, wrapper);
    });

    return wrapper;
  }

  // Choreographs the exact card selection & dismissal sequence from 00:13, 00:18, 00:24, 00:28, 00:36, 00:44
  handleCardSelection(chosenCard, chosenIdx, chosenWrapper) {
    this.isDraftAnimating = true;
    this.sound.playCardSelectWhoosh();

    const allSlots = [...this.elCardRow.querySelectorAll(".draft-card-slot")];

    // 1. Unchosen cards flip 180° back to navy-and-gold card back and slide down
    allSlots.forEach((slot, idx) => {
      slot.classList.remove("hovered");
      if (idx !== chosenIdx) {
        slot.classList.remove("flipped");
        setTimeout(() => {
          slot.classList.add("dismissed-down");
        }, 160);
      } else {
        slot.classList.add("chosen-burst");
      }
    });

    // 2. Apply card effect & level up
    this.statsSystem.selectCard(chosenCard, this.currentDraftCategory);

    // 3. If it's a Skill (☀) or Enchant (🌙), fly a miniature navy card into the bottom HUD button! (frame_10.jpg, frame_14.jpg)
    const rect = chosenWrapper.getBoundingClientRect();
    const stageRect = document.getElementById("game-stage").getBoundingClientRect();
    const scaleX = 1920 / stageRect.width;
    const scaleY = 1080 / stageRect.height;
    const startX = (rect.left - stageRect.left + rect.width / 2) * scaleX;
    const startY = (rect.top - stageRect.top + rect.height / 2) * scaleY;

    setTimeout(() => {
      this.modalCardDraft.classList.add("hidden");
      this.elHalftone.classList.add("hidden");
      this.elDofPots.classList.remove("active");
      if (this.elBottomHud) this.elBottomHud.classList.remove("draft-lowered");
      this.activeModal = null;
      this.isDraftAnimating = false;

      if (chosenCard.type === "skill" || chosenCard.type === "enchant") {
        const targetBtn = chosenCard.type === "skill" ? this.btnSkill : this.btnEnchant;
        this.spawnFlyingMiniCard(startX, startY, targetBtn, () => {
          this.syncHud();
        });
      } else {
        this.syncHud();
      }
    }, 480);
  }

  spawnFlyingMiniCard(startX, startY, targetBtn, onComplete) {
    const stageRect = document.getElementById("game-stage").getBoundingClientRect();
    const btnRect = targetBtn.getBoundingClientRect();
    const scaleX = 1920 / stageRect.width;
    const scaleY = 1080 / stageRect.height;

    const endX = (btnRect.left - stageRect.left + btnRect.width / 2) * scaleX;
    const endY = (btnRect.top - stageRect.top + btnRect.height / 2) * scaleY;

    const mini = document.createElement("div");
    mini.className = "flying-mini-card";
    mini.style.left = `${startX - 38}px`;
    mini.style.top = `${startY - 54}px`;
    this.elFlyingCardLayer.appendChild(mini);

    requestAnimationFrame(() => {
      mini.style.transform = `translate(${endX - startX}px, ${endY - startY}px) scale(0.45) rotate(12deg)`;
      mini.style.opacity = "0.85";
    });

    setTimeout(() => {
      mini.remove();
      targetBtn.classList.remove("badge-pop");
      void targetBtn.offsetWidth;
      targetBtn.classList.add("badge-pop");
      if (onComplete) onComplete();
    }, 340);
  }

  // Renders and opens the 9-Category Status Modal (frame_32.jpg)
  openStatusModal() {
    this.activeModal = "status";
    this.sound.playCardSelectWhoosh();
    this.hideHudHoverHand();
    this.renderStatusModalContent();
    this.modalStatus.classList.remove("hidden");
  }

  closeStatusModal() {
    this.sound.playCardSelectWhoosh();
    this.modalStatus.classList.add("hidden");
    this.activeModal = null;
  }

  openMenuModal() {
    this.activeModal = "menu";
    this.sound.playCardSelectWhoosh();
    this.hideHudHoverHand();
    if (this.chkFreeDraft) {
      this.chkFreeDraft.checked = this.statsSystem.debugFreeDraft;
    }
    this.modalMenu.classList.remove("hidden");
  }

  closeMenuModal() {
    this.sound.playCardSelectWhoosh();
    this.modalMenu.classList.add("hidden");
    this.activeModal = null;
  }

  renderStatusModalContent() {
    const s = this.statsSystem.stats;
    const sys = this.statsSystem;

    const formulaRow = (label, baseVal, multVal, finalVal, iconHtml = "") => `
      <div class="stat-line formula-line">
        <span class="stat-label">${iconHtml}${label}</span>
        <div class="stat-formula-pills">
          <span class="stat-pill base-pill">${baseVal}</span>
          <span class="stat-op">×</span>
          <span class="stat-pill mult-pill">${multVal}%</span>
          <span class="stat-op">=</span>
          <span class="stat-result">${finalVal}</span>
        </div>
      </div>
    `;

    const singlePillRow = (label, subLabel, valStr, iconHtml = "") => `
      <div class="stat-line single-line">
        <span class="stat-label">${iconHtml}${label}</span>
        ${subLabel ? `<span class="stat-sublabel">${subLabel}</span>` : `<span class="stat-dots"></span>`}
        <span class="stat-pill single-val-pill">${valStr}</span>
      </div>
    `;

    // Custom hand-illustrated SVGs for the 9 Status Modal category icons (matches frame_32.jpg!)
    const statusIcons = {
      basicFish: `<svg viewBox="0 0 64 48" width="68" height="52"><path d="M8,24 C14,8 38,8 48,19 L58,10 L55,24 L58,38 L48,29 C38,40 14,40 8,24 Z" fill="#5ac8fa" stroke="#1e567c" stroke-width="3" stroke-linejoin="round"/><circle cx="18" cy="20" r="3" fill="#ffffff" stroke="#1e567c" stroke-width="2"/></svg>`,
      sharingFish: `<svg viewBox="0 0 64 54" width="66" height="56"><g transform="translate(-2,-6) scale(0.75)"><path d="M12,24 C18,10 38,10 48,19 L58,10 L55,24 L58,38 L48,29 C38,38 18,38 12,24 Z" fill="#f97316" stroke="#7c2d12" stroke-width="3"/><rect x="24" y="14" width="5" height="20" fill="#ffffff"/><rect x="35" y="15" width="4" height="18" fill="#ffffff"/></g><g transform="translate(12,14) scale(0.75)"><path d="M12,24 C18,10 38,10 48,19 L58,10 L55,24 L58,38 L48,29 C38,38 18,38 12,24 Z" fill="#38bdf8" stroke="#0c4a6e" stroke-width="3"/></g></svg>`,
      critFish: `<svg viewBox="0 0 64 48" width="68" height="52"><path d="M8,24 C14,6 40,6 48,19 L59,9 L55,24 L59,39 L48,29 C40,42 14,42 8,24 Z" fill="#e11d48" stroke="#881337" stroke-width="3" stroke-linejoin="round"/><circle cx="18" cy="20" r="3" fill="#fde047" stroke="#881337" stroke-width="2"/></svg>`,
      catTeaser: `<svg viewBox="0 0 64 64" width="64" height="64"><path d="M52,52 Q36,34 24,22" stroke="#166534" stroke-width="3.5" fill="none" stroke-linecap="round"/><ellipse cx="18" cy="18" rx="14" ry="6.5" transform="rotate(-35 18 18)" fill="#bef264" stroke="#3f6212" stroke-width="3"/><ellipse cx="38" cy="34" rx="9" ry="3.5" transform="rotate(-15 38 34)" fill="#84cc16" stroke="#166534" stroke-width="2.5"/><ellipse cx="30" cy="42" rx="9" ry="3.5" transform="rotate(35 30 42)" fill="#84cc16" stroke="#166534" stroke-width="2.5"/></svg>`,
      heart: `<svg viewBox="0 0 64 60" width="60" height="56"><path d="M32,52 C12,38 6,22 14,12 C20,5 29,8 32,16 C35,8 44,5 50,12 C58,22 52,38 32,52 Z" fill="#f43f5e" stroke="#881337" stroke-width="3.5" stroke-linejoin="round"/><path d="M18,16 A8,8 0 0,1 26,14" stroke="#fda4af" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
      technique: `<svg viewBox="0 0 64 64" width="62" height="62"><polygon points="38,8 43,20 56,22 46,31 49,44 38,37 27,44 30,31 20,22 33,20" fill="#fde047" stroke="#713f12" stroke-width="3" stroke-linejoin="round"/><polygon points="20,34 23,41 30,42 25,47 26,54 20,50 14,54 15,47 10,42 17,41" fill="#fdba74" stroke="#7c2d12" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
      coin: `<svg viewBox="0 0 64 64" width="62" height="62"><circle cx="33" cy="33" r="24" fill="#d99116" stroke="#451a03" stroke-width="3.2"/><circle cx="31" cy="31" r="23" fill="#fcd34d" stroke="#451a03" stroke-width="3"/><circle cx="31" cy="31" r="16" fill="none" stroke="#d99116" stroke-width="2"/><g fill="#925214"><ellipse cx="31" cy="35" rx="5.5" ry="4.5"/><circle cx="24" cy="27" r="2.5"/><circle cx="29" cy="24.5" r="2.5"/><circle cx="34" cy="24.5" r="2.5"/><circle cx="38" cy="27.5" r="2.5"/></g></svg>`,
      gem: `<svg viewBox="0 0 64 60" width="62" height="58"><polygon points="18,10 46,10 58,26 32,52 6,26" fill="#7dd3fc" stroke="#1e3a5f" stroke-width="3.5" stroke-linejoin="round"/><polygon points="18,10 46,10 40,26 24,26" fill="#e0f2fe"/><polyline points="6,26 58,26" stroke="#0284c7" stroke-width="2.2" fill="none"/></svg>`,
      fortune: `<svg viewBox="0 0 64 64" width="60" height="60"><g fill="#84cc16" stroke="#166534" stroke-width="3" stroke-linejoin="round"><path d="M32,30 C20,10 6,18 18,30 C6,42 20,50 32,30 Z"/><path d="M32,30 C44,10 58,18 46,30 C58,42 44,50 32,30 Z"/><path d="M32,30 C16,16 20,4 32,14 C44,4 48,16 32,30 Z"/><path d="M32,30 C18,44 22,56 32,46 C42,56 46,44 32,30 Z"/><path d="M32,34 Q36,50 44,58" fill="none" stroke-width="4" stroke-linecap="round"/></g></svg>`,
      miniNormal: `<svg viewBox="0 0 36 24" width="28" height="19" style="vertical-align:middle;margin-right:4px"><path d="M3,12 C7,3 21,3 27,9 L34,4 L32,12 L34,20 L27,15 C21,21 7,21 3,12 Z" fill="#5ac8fa" stroke="#ffffff" stroke-width="2"/></svg>`,
      miniRandom: `<svg viewBox="0 0 36 24" width="28" height="19" style="vertical-align:middle;margin-right:4px"><path d="M3,12 C7,3 21,3 27,9 L34,4 L32,12 L34,20 L27,15 C21,21 7,21 3,12 Z" fill="#f97316" stroke="#ffffff" stroke-width="2"/></svg>`,
      miniLong: `<svg viewBox="0 0 36 24" width="28" height="19" style="vertical-align:middle;margin-right:4px"><path d="M3,12 C7,3 21,3 27,9 L34,4 L32,12 L34,20 L27,15 C21,21 7,21 3,12 Z" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/></svg>`,
    };

    this.elStatusGrid.innerHTML = `
      <!-- LEFT COLUMN (4 Panels: Basic Fish, Sharing Fish, Critical Fish, Cat Teaser) -->
      <div class="status-column">
        <!-- 1. Basic Fish (基本おさかな) -->
        <div class="status-group">
          <div class="status-group-header">
            <div class="status-icon-box">${statusIcons.basicFish}</div>
            <div class="status-green-title">Basic Fish</div>
          </div>
          <div class="status-rows">
            ${formulaRow("Happy Given", s.happyBase, s.happyMult, sys.getEffectiveHappyGiven())}
            ${singlePillRow("Normal Fish", "Throw Rate", `${s.normalFishRate}%`, statusIcons.miniNormal)}
            ${singlePillRow("Random Fish", "Throw Rate", `${s.randomFishRate}%`, statusIcons.miniRandom)}
            ${singlePillRow("Long-Range Fish", "Throw Rate", `${s.longRangeFishRate}%`, statusIcons.miniLong)}
          </div>
        </div>

        <!-- 2. Sharing Fish (おすそわけおさかな) -->
        <div class="status-group">
          <div class="status-group-header">
            <div class="status-icon-box">${statusIcons.sharingFish}</div>
            <div class="status-green-title">Sharing Fish</div>
          </div>
          <div class="status-rows">
            ${singlePillRow("Trigger Chance", "", `${s.sharingTriggerRate}%`)}
            ${singlePillRow("Happy Multiplier", "", `${s.sharingHappyMult}%`)}
          </div>
        </div>

        <!-- 3. Critical Fish (クリティカルおさかな) -->
        <div class="status-group">
          <div class="status-group-header">
            <div class="status-icon-box">${statusIcons.critFish}</div>
            <div class="status-green-title">Critical Fish</div>
          </div>
          <div class="status-rows">
            ${singlePillRow("Trigger Chance", "", `${sys.getEffectiveCritRate()}%`)}
            ${singlePillRow("Happy Multiplier", "", `${s.critHappyMult}%`)}
          </div>
        </div>

        <!-- 4. Cat Teaser (ねこじゃらし) -->
        <div class="status-group">
          <div class="status-group-header">
            <div class="status-icon-box">${statusIcons.catTeaser}</div>
            <div class="status-green-title">Cat Teaser</div>
          </div>
          <div class="status-rows">
            ${singlePillRow("Throw Rate", "", `${s.teaserThrowRate}%`)}
            ${formulaRow("Cat Stop Seconds", s.teaserStopBase.toFixed(1), s.teaserStopMult, sys.getEffectiveTeaserStopSeconds())}
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN (5 Panels: Affection Capacity, Technique, Coins, Gems, Fortune) -->
      <div class="status-column">
        <!-- 5. Affection Capacity (包容力) -->
        <div class="status-group">
          <div class="status-group-header">
            <div class="status-icon-box">${statusIcons.heart}</div>
            <div class="status-green-title">Affection Capacity</div>
          </div>
          <div class="status-rows">
            ${formulaRow("Heart Capacity", s.heartCapBase, s.heartCapMult, sys.getMaxHeartCapacity())}
            ${formulaRow("Auto Recovery", s.autoRegenBase, s.autoRegenMult, sys.getEffectiveAutoRegen())}
          </div>
        </div>

        <!-- 6. Technique (テクニック) -->
        <div class="status-group">
          <div class="status-group-header">
            <div class="status-icon-box">${statusIcons.technique}</div>
            <div class="status-green-title">Technique</div>
          </div>
          <div class="status-rows">
            ${formulaRow("Guard Power", s.guardPowerBase, sys.getEffectiveGuardMult(), sys.getEffectiveGuardPower())}
            ${singlePillRow("Parry Chance", "", `${sys.getEffectiveParryRate()}%`)}
            ${formulaRow("Happy Counter", s.happyCounterBase, s.happyCounterMult, sys.getEffectiveHappyCounter())}
          </div>
        </div>

        <!-- 7. Coins (コイン) -->
        <div class="status-group">
          <div class="status-group-header">
            <div class="status-icon-box">${statusIcons.coin}</div>
            <div class="status-green-title">Coins</div>
          </div>
          <div class="status-rows">
            ${formulaRow("Gain Bonus", s.coinBonusBase, s.coinBonusMult, sys.getEffectiveCoinBonus())}
            ${singlePillRow("Wave Interest", "", `${s.coinInterestRate}%`)}
          </div>
        </div>

        <!-- 8. Gems (ジェム) -->
        <div class="status-group">
          <div class="status-group-header">
            <div class="status-icon-box">${statusIcons.gem}</div>
            <div class="status-green-title">Gems</div>
          </div>
          <div class="status-rows">
            ${formulaRow("Gain Bonus", s.gemBonusBase, s.gemBonusMult, sys.getEffectiveGemBonus())}
            ${singlePillRow("Wave Interest", "", `${s.gemInterestRate}%`)}
          </div>
        </div>

        <!-- 9. Fortune (運勢) -->
        <div class="status-group">
          <div class="status-group-header">
            <div class="status-icon-box">${statusIcons.fortune}</div>
            <div class="status-green-title">Fortune</div>
          </div>
          <div class="status-rows">
            ${singlePillRow("Double Chance", "", `${s.doubleChance}%`)}
            ${singlePillRow("Triple Chance", "", `${s.tripleChance}%`)}
            ${singlePillRow("4th Slot Chance", "", `${s.fourthSlotChance}%`)}
          </div>
        </div>
      </div>
    `;
  }

  syncHud() {
    const sys = this.statsSystem;
    const maxHearts = sys.getMaxHeartCapacity();
    const curHearts = sys.currentHearts;
    const pct = Math.min(100, Math.max(0, (curHearts / maxHearts) * 100));

    if (this.elHeartFill) {
      this.elHeartFill.style.width = `${pct}%`;
    }
    if (this.elHeartText) {
      this.elHeartText.textContent = `${curHearts} / ${maxHearts}`;
    }
    if (this.elWaveText) {
      this.elWaveText.textContent = `WAVE ${this.catManager.wave} / ${this.catManager.maxWaves}`;
    }

    if (this.elCoinVal) this.elCoinVal.textContent = `${sys.coins}`;
    if (this.elGemVal) this.elGemVal.textContent = `${sys.gems}`;

    if (this.elLvOffense) this.elLvOffense.textContent = `Lv.${sys.levels.offense}`;
    if (this.elLvDefense) this.elLvDefense.textContent = `Lv.${sys.levels.defense}`;
    if (this.elLvSupport) this.elLvSupport.textContent = `Lv.${sys.levels.support}`;

    // Update red notification badges on Skill (☀) and Enchant (🌙)
    const skCount = sys.skillQueue.length;
    if (this.badgeSkill) {
      this.badgeSkill.textContent = `${skCount}`;
      this.badgeSkill.classList.toggle("hidden", skCount <= 0);
    }

    const encCount = sys.enchantQueue.length;
    if (this.badgeEnchant) {
      this.badgeEnchant.textContent = `${encCount}`;
      this.badgeEnchant.classList.toggle("hidden", encCount <= 0);
    }
  }
}
