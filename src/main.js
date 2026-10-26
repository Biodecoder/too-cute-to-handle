// Main Entry Point — Coordinates 1920x1080 Responsive Stage, Plaza Diorama, Cat/Fish Manager,
// Persistent Playfield Foxtail-Wand Cursor, Animated Bottom Mascot Cat, and Handcrafted UI

import { SoundSynthesizer } from "./audio/SoundSynthesizer.js";
import { SpriteArtLibrary } from "./art/SpriteArtLibrary.js";
import { PlazaRenderer } from "./world/PlazaRenderer.js";
import { StatsAndCardSystem } from "./systems/StatsAndCardSystem.js";
import { CatAndFishManager } from "./entities/CatAndFishManager.js";
import { UiAnimator } from "./ui/UiAnimator.js";

class TooCuteToHandleGame {
  constructor() {
    this.stageEl = document.getElementById("game-stage");
    this.canvas = document.getElementById("plaza-canvas");
    this.ctx = this.canvas.getContext("2d");

    this.mascotCanvas = document.getElementById("bottom-mascot-canvas");
    this.mascotCtx = this.mascotCanvas ? this.mascotCanvas.getContext("2d") : null;

    this.elTeaserCursor = document.getElementById("playfield-teaser-cursor");
    this.elUiArrowCursor = document.getElementById("ui-arrow-cursor");

    this.sound = new SoundSynthesizer();
    this.spriteLib = new SpriteArtLibrary();
    this.plazaRenderer = new PlazaRenderer(this.spriteLib);
    this.statsSystem = new StatsAndCardSystem();
    this.catManager = new CatAndFishManager(this.spriteLib, this.statsSystem, this.sound);
    this.ui = new UiAnimator(this.statsSystem, this.catManager, this.sound);

    // Apply generated protagonist portrait to Top-Left HUD
    const portraitImg = document.getElementById("hud-portrait-img");
    if (portraitImg && this.spriteLib.portraitDataUrl) {
      portraitImg.src = this.spriteLib.portraitDataUrl;
    }

    // Playfield Teaser Cursor position (defaults to right palm tree area like frame_01.jpg)
    this.teaserPos = { x: 1620, y: 385, waveAngle: 0 };
    this.mousePos = { x: 960, y: 540 };
    this.mascotTime = 0;

    this.setupResponsiveScaling();
    this.setupPointerTracking();

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  setupResponsiveScaling() {
    const updateScale = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scale = Math.min(vw / 1920, vh / 1080);
      this.stageEl.style.transform = `translate(-50%, -50%) scale(${scale})`;
    };
    window.addEventListener("resize", updateScale);
    updateScale();
  }

  setupPointerTracking() {
    window.addEventListener("pointermove", (e) => {
      const rect = this.stageEl.getBoundingClientRect();
      const vx = ((e.clientX - rect.left) / rect.width) * 1920;
      const vy = ((e.clientY - rect.top) / rect.height) * 1080;

      this.mousePos.x = Math.max(0, Math.min(1920, vx));
      this.mousePos.y = Math.max(0, Math.min(1080, vy));

      const inHudOrModal = vy >= 810 || this.ui.activeModal !== null;

      // Update orange UI arrow cursor position
      if (this.elUiArrowCursor) {
        this.elUiArrowCursor.style.transform = `translate(${this.mousePos.x}px, ${this.mousePos.y}px)`;
        this.elUiArrowCursor.classList.toggle("hidden", !inHudOrModal);
      }

      // When pointer is on the playfield during active gameplay, move the Foxtail Cat Teaser Hand!
      // When pointer moves to the bottom HUD, the Foxtail Cat Teaser Hand stays parked on the playfield as the skill target!
      if (!inHudOrModal) {
        const dx = this.mousePos.x - this.teaserPos.x;
        this.teaserPos.waveAngle = Math.max(-0.45, Math.min(0.45, dx * 0.018));
        this.teaserPos.x = this.mousePos.x;
        this.teaserPos.y = this.mousePos.y;
        this.catManager.updatePointer(this.teaserPos.x, this.teaserPos.y, false);
      } else {
        this.catManager.updatePointer(this.teaserPos.x, this.teaserPos.y, true);
      }
    });

    // Clicking on the playfield waves the Foxtail Cat Teaser wand and throws a bonus fish toward it
    this.canvas.addEventListener("pointerdown", (e) => {
      if (this.ui.activeModal !== null) return;
      const rect = this.stageEl.getBoundingClientRect();
      const vx = ((e.clientX - rect.left) / rect.width) * 1920;
      const vy = ((e.clientY - rect.top) / rect.height) * 1080;
      if (vy < 810) {
        this.teaserPos.x = vx;
        this.teaserPos.y = vy;
        this.teaserPos.waveAngle = -0.45;
        this.sound.playThrowPop(1.15);
        this.catManager.protagonist.pose = "throw";
        this.catManager.protagonist.poseTimer = 0.25;
        this.catManager.spawnFishProjectile("normal", vx, 690);
      }
    });
  }

  updateTeaserCursorVisual(dt) {
    this.teaserPos.waveAngle *= Math.pow(0.08, dt);
    if (this.elTeaserCursor) {
      const showTeaser = this.ui.activeModal !== "stage_intro" && this.ui.activeModal !== "status";
      this.elTeaserCursor.classList.toggle("hidden", !showTeaser);
      const deg = (this.teaserPos.waveAngle * 180) / Math.PI;
      this.elTeaserCursor.style.transform = `translate(${this.teaserPos.x - 58}px, ${this.teaserPos.y - 78}px) rotate(${deg.toFixed(1)}deg)`;
    }
  }

  // Draws the adorable bottom-center peeking tabby cat that pats its own head (frame_01.jpg & frame_10.jpg)
  renderBottomMascot(dt) {
    if (!this.mascotCtx) return;
    this.mascotTime += dt;
    const ctx = this.mascotCtx;
    ctx.clearRect(0, 0, 240, 175);

    const isPattingHead = Math.floor(this.mascotTime * 0.45) % 3 === 1;
    const bobY = Math.sin(this.mascotTime * 3.2) * 3;
    const tailAngle = Math.sin(this.mascotTime * 4.5) * 0.16;

    ctx.save();
    ctx.translate(115, 118 + bobY);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    const drawMascotShape = (c, isSilhouette = false) => {
      const strokeCol = isSilhouette ? "#ffffff" : "#593118";
      c.strokeStyle = strokeCol;
      c.lineWidth = isSilhouette ? 12 : 3.6;

      // Swaying striped tail on right
      c.save();
      c.translate(46, 26);
      c.rotate(tailAngle);
      c.fillStyle = isSilhouette ? "#ffffff" : "#f4b63a";
      c.beginPath();
      c.moveTo(0, 12);
      c.quadraticCurveTo(28, -8, 18, -48);
      c.quadraticCurveTo(10, -54, 4, -44);
      c.quadraticCurveTo(10, -14, -8, 6);
      c.closePath();
      c.fill();
      c.stroke();
      if (!isSilhouette) {
        c.fillStyle = "#d47619";
        c.fillRect(10, -36, 10, 5);
        c.fillRect(11, -24, 10, 5);
        c.fillRect(9, -12, 10, 5);
      }
      c.restore();

      // Torso peeking up
      c.fillStyle = isSilhouette ? "#ffffff" : "#fffdf7";
      c.beginPath();
      c.ellipse(0, 28, 42, 34, 0, 0, Math.PI * 2);
      c.fill();
      if (!isSilhouette) {
        c.save();
        c.beginPath();
        c.ellipse(0, 28, 42, 34, 0, 0, Math.PI * 2);
        c.clip();
        c.fillStyle = "#f4b63a";
        c.beginPath();
        c.ellipse(22, 24, 30, 34, 0, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "#d47619";
        c.fillRect(18, 12, 22, 6);
        c.fillRect(20, 24, 22, 6);
        c.restore();
      }
      c.beginPath();
      c.ellipse(0, 28, 42, 34, 0, 0, Math.PI * 2);
      c.stroke();

      // Ears
      [-18, 18].forEach((ex, idx) => {
        c.save();
        c.translate(ex, -34);
        c.rotate(idx === 0 ? -0.25 : 0.25);
        c.fillStyle = isSilhouette ? "#ffffff" : "#f4b63a";
        c.beginPath();
        c.moveTo(-13, 8);
        c.lineTo(0, -18);
        c.lineTo(13, 8);
        c.closePath();
        c.fill();
        c.stroke();
        if (!isSilhouette) {
          c.fillStyle = "#f49ac0";
          c.beginPath();
          c.moveTo(-6, 5);
          c.lineTo(0, -9);
          c.lineTo(6, 5);
          c.closePath();
          c.fill();
        }
        c.restore();
      });

      // Head
      c.fillStyle = isSilhouette ? "#ffffff" : "#fffdf7";
      c.beginPath();
      c.ellipse(0, -14, 34, 27, 0, 0, Math.PI * 2);
      c.fill();

      if (!isSilhouette) {
        c.save();
        c.beginPath();
        c.ellipse(0, -14, 34, 27, 0, 0, Math.PI * 2);
        c.clip();
        c.fillStyle = "#f4b63a";
        c.beginPath();
        c.arc(-16, -28, 25, 0, Math.PI * 2);
        c.arc(16, -28, 25, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = "#d47619";
        c.lineWidth = 3.2;
        c.beginPath();
        c.moveTo(-6, -38);
        c.lineTo(-4, -25);
        c.moveTo(0, -39);
        c.lineTo(0, -24);
        c.moveTo(6, -38);
        c.lineTo(4, -25);
        c.stroke();
        c.restore();
      }

      c.strokeStyle = strokeCol;
      c.lineWidth = isSilhouette ? 12 : 3.6;
      c.beginPath();
      c.ellipse(0, -14, 34, 27, 0, 0, Math.PI * 2);
      c.stroke();

      if (!isSilhouette) {
        // Eyes & ':3' mouth
        c.fillStyle = "#593118";
        c.beginPath();
        c.arc(-12, -14, 3.2, 0, Math.PI * 2);
        c.arc(12, -14, 3.2, 0, Math.PI * 2);
        c.fill();

        c.lineWidth = 2.8;
        c.beginPath();
        c.arc(-4.5, -7, 4.2, 0, Math.PI);
        c.arc(4.5, -7, 4.2, 0, Math.PI);
        c.stroke();
      }

      // Patting paw on top of head (matches frame_10.jpg!)
      if (isPattingHead) {
        const patOffset = Math.sin(this.mascotTime * 12) * 3;
        c.save();
        c.translate(0, -44 + patOffset);
        c.fillStyle = isSilhouette ? "#ffffff" : "#fffdf7";
        c.beginPath();
        c.ellipse(2, 0, 22, 9, 0.12, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        c.restore();
      }
    };

    // White sticker outline pass, then colored pass
    drawMascotShape(ctx, true);
    drawMascotShape(ctx, false);

    ctx.restore();
  }

  loop(now) {
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;

    const isPaused = this.ui.activeModal !== null;

    // Update simulation
    this.catManager.update(dt, isPaused);
    this.updateTeaserCursorVisual(dt);
    this.renderBottomMascot(dt);

    // Sync HUD counters
    this.ui.syncHud();

    // Render 2.5D Plaza + Entities
    this.ctx.clearRect(0, 0, 1920, 1080);
    this.plazaRenderer.render(this.ctx);
    this.catManager.render(this.ctx);

    requestAnimationFrame((t) => this.loop(t));
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.__GAME__ = new TooCuteToHandleGame();
});
