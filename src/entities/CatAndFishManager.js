// Manages the Protagonist, Tabby Cat Waves, Parabolic Fish & Cat-Teaser Projectiles,
// Rolling Gold Paw Coins, Floating Happy/Heart Numbers, and Musical Note / Star VFX

export class CatAndFishManager {
  constructor(spriteLib, statsSystem, sound) {
    this.spriteLib = spriteLib;
    this.statsSystem = statsSystem;
    this.sound = sound;

    this.protagonist = {
      x: 955,
      y: 625,
      pose: "idle",
      poseTimer: 0,
      animTime: 0,
      autoThrowTimer: 0.45,
      autoTeaserTimer: 1.6,
      regenTimer: 0,
    };

    this.wave = 1;
    this.maxWaves = 10;
    this.catsSatisfiedInWave = 0;
    this.catsTargetForWave = 25;
    this.spawnTimer = 0.8;

    this.cats = [];
    this.projectiles = [];
    this.pickups = [];
    this.floatingTexts = [];
    this.particles = [];
    this.cursorTrail = [];

    this.pointer = {
      x: 1580,
      y: 380,
      vx: 0,
      vy: 0,
      inHud: false,
    };

    this.seedInitialPlazaCats();
  }

  seedInitialPlazaCats() {
    this.cats = [];
    this.projectiles = [];
    this.pickups = [];
    this.floatingTexts = [];
    this.particles = [];

    // Seed initial left & right cat clusters + 1 sleeping loaf near the protagonist (matches frame_01.jpg!)
    const leftPositions = [45, 175, 285, 395, 515, 585];
    leftPositions.forEach((lx, idx) => {
      this.cats.push(this.createCat(lx, 682 + (idx % 3) * 18, 1));
    });

    // Sleeping loaf cat to the left of protagonist (frame_01.jpg at x ≈ 835)
    const loafCat = this.createCat(832, 675, 1);
    loafCat.state = "sleep";
    loafCat.stateTimer = 8.0;
    this.cats.push(loafCat);

    const rightPositions = [1395, 1525, 1620, 1745, 1875];
    rightPositions.forEach((rx, idx) => {
      this.cats.push(this.createCat(rx, 684 + (idx % 3) * 18, -1));
    });
  }

  createCat(x, y, dir) {
    return {
      id: Math.random().toString(36).slice(2),
      x,
      y,
      dir, // 1 = walking right toward center, -1 = walking left toward center
      speed: 36 + Math.random() * 18,
      state: "walk", // "walk" | "sit" | "sleep" | "cuddle"
      stateTimer: 0,
      emoteType: "!", // "!" | "?" | "///"
      animPhase: Math.random() * 10,
      happy: 0,
      maxHappy: 20 + (this.wave - 1) * 5,
      consecutiveHits: 0,
      cuddleTickTimer: 0.6,
      alpha: 1.0,
      wandWaveCooldown: 0,
    };
  }

  updatePointer(virtualX, virtualY, inHud = false) {
    const dx = virtualX - this.pointer.x;
    const dy = virtualY - this.pointer.y;
    this.pointer.vx = dx;
    this.pointer.vy = dy;
    this.pointer.x = virtualX;
    this.pointer.y = virtualY;
    this.pointer.inHud = inHud;

    // Spawn green foxtail leaf sparkles when waving the wand cursor on the playfield
    const speed = Math.hypot(dx, dy);
    if (!inHud && speed > 10 && this.cursorTrail.length < 28) {
      this.cursorTrail.push({
        x: virtualX - 24 + (Math.random() - 0.5) * 18,
        y: virtualY - 24 + (Math.random() - 0.5) * 18,
        vx: -dx * 0.15 + (Math.random() - 0.5) * 30,
        vy: 25 + Math.random() * 35,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 5,
        life: 0.45,
        maxLife: 0.45,
      });
    }

    // Waving the Foxtail Cat Teaser cursor directly near walking cats can distract them!
    if (!inHud && speed > 14) {
      const stopSecs = this.statsSystem.getEffectiveTeaserStopSeconds();
      for (const cat of this.cats) {
        if (cat.state === "walk" && cat.wandWaveCooldown <= 0) {
          const dist = Math.hypot(cat.x - (virtualX - 25), cat.y - (virtualY - 10));
          if (dist < 88) {
            cat.state = "sit";
            cat.stateTimer = stopSecs;
            cat.wandWaveCooldown = 4.0;
            cat.emoteType = Math.random() < 0.45 ? "!" : Math.random() < 0.75 ? "///" : "?";
            this.sound.playCatMeow(0.95 + Math.random() * 0.15);
            this.spawnStarBurst(cat.x, cat.y - 30, 3);
          }
        }
      }
    }
  }

  update(dt, isPaused = false) {
    // Always animate protagonist idle & cursor trails even when a modal is open
    this.protagonist.animTime += dt;

    for (let i = this.cursorTrail.length - 1; i >= 0; i--) {
      const ct = this.cursorTrail[i];
      ct.life -= dt;
      ct.x += ct.vx * dt;
      ct.y += ct.vy * dt;
      ct.rot += ct.vRot * dt;
      if (ct.life <= 0) this.cursorTrail.splice(i, 1);
    }

    if (isPaused) return;

    this.statsSystem.updateActiveBuffs(dt);

    // Protagonist pose recovery
    if (this.protagonist.poseTimer > 0) {
      this.protagonist.poseTimer -= dt;
      if (this.protagonist.poseTimer <= 0) {
        this.protagonist.pose = "idle";
      }
    }

    // Heart capacity passive auto-recovery
    this.protagonist.regenTimer += dt;
    if (this.protagonist.regenTimer >= 3.5) {
      this.protagonist.regenTimer = 0;
      const regen = this.statsSystem.getEffectiveAutoRegen();
      if (this.statsSystem.currentHearts > 0 && regen > 0) {
        this.statsSystem.currentHearts = Math.max(0, this.statsSystem.currentHearts - regen);
      }
    }

    // Periodic automatic Fish Throw from protagonist
    this.protagonist.autoThrowTimer -= dt;
    if (this.protagonist.autoThrowTimer <= 0) {
      const rateScale = 1 + (this.statsSystem.levels.offense - 1) * 0.14;
      this.protagonist.autoThrowTimer = Math.max(0.32, 0.92 / rateScale);
      this.performAutoFishThrow();
    }

    // Periodic automatic Cat Teaser Throw from protagonist
    this.protagonist.autoTeaserTimer -= dt;
    if (this.protagonist.autoTeaserTimer <= 0) {
      const defScale = 1 + (this.statsSystem.levels.defense - 1) * 0.15;
      this.protagonist.autoTeaserTimer = Math.max(0.85, 2.3 / defScale);
      this.performAutoTeaserThrow();
    }

    // Continuous cat spawning from left & right edges
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = Math.max(0.55, 1.45 - this.wave * 0.06);
      if (this.cats.length < 26) {
        const fromLeft = Math.random() < 0.5;
        const sx = fromLeft ? -45 - Math.random() * 40 : 1965 + Math.random() * 40;
        const sy = 674 + Math.floor(Math.random() * 4) * 14;
        this.cats.push(this.createCat(sx, sy, fromLeft ? 1 : -1));
      }
    }

    // Update Cats
    for (let i = this.cats.length - 1; i >= 0; i--) {
      const cat = this.cats[i];
      cat.animPhase += dt * 7.5;
      if (cat.wandWaveCooldown > 0) cat.wandWaveCooldown -= dt;

      if (cat.state === "walk") {
        const distToGirl = this.protagonist.x - cat.x;
        if (Math.abs(distToGirl) <= 58) {
          cat.state = "cuddle";
          cat.cuddleTickTimer = 0.25;
        } else {
          cat.dir = distToGirl > 0 ? 1 : -1;
          cat.x += cat.dir * cat.speed * dt;
        }
      } else if (cat.state === "sit") {
        cat.stateTimer -= dt;
        if (cat.stateTimer <= 0) {
          cat.state = "walk";
        }
      } else if (cat.state === "cuddle") {
        cat.cuddleTickTimer -= dt;
        if (cat.cuddleTickTimer <= 0) {
          cat.cuddleTickTimer = 1.25;
          this.applyCatCuddleAffection(cat);
        }
      } else if (cat.state === "sleep") {
        cat.stateTimer -= dt;
        if (cat.stateTimer < 0.6) {
          cat.alpha = Math.max(0, cat.stateTimer / 0.6);
        }
        if (cat.stateTimer <= 0) {
          this.cats.splice(i, 1);
        }
      }
    }

    // Update Parabolic Projectiles (Fish & Cat Teasers)
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.elapsed += dt;
      const t = Math.min(1, p.elapsed / p.duration);

      p.x = p.startX + (p.targetX - p.startX) * t;
      const linearY = p.startY + (p.targetY - p.startY) * t;
      const arcLift = 4 * p.arcHeight * t * (1 - t);
      p.y = linearY - arcLift;
      p.rotation += p.spinSpeed * dt;

      if (t >= 1) {
        this.resolveProjectileLanding(p);
        this.projectiles.splice(i, 1);
      }
    }

    // Update Pickups (Rolling Gold Paw Coins & Cyan Gems)
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pk = this.pickups[i];
      pk.age += dt;
      if (pk.state === "bounce") {
        pk.vy += 680 * dt;
        pk.x += pk.vx * dt;
        pk.y += pk.vy * dt;
        pk.rot += pk.vx * 0.015 * dt;
        if (pk.y >= pk.groundY) {
          pk.y = pk.groundY;
          pk.vy = -pk.vy * 0.42;
          pk.vx *= 0.72;
          if (Math.abs(pk.vy) < 45) {
            pk.vy = 0;
          }
        }
        if (pk.age >= 0.85) {
          pk.state = "collect";
        }
      } else if (pk.state === "collect") {
        const destX = pk.kind === "coin" ? 135 : 1825;
        const destY = 955;
        pk.x += (destX - pk.x) * Math.min(1, dt * 9.5);
        pk.y += (destY - pk.y) * Math.min(1, dt * 9.5);
        if (Math.hypot(destX - pk.x, destY - pk.y) < 28) {
          if (pk.kind === "coin") {
            this.statsSystem.coins += pk.amount;
          } else {
            this.statsSystem.gems += pk.amount;
          }
          this.sound.playCoinPickup();
          this.pickups.splice(i, 1);
        }
      }
    }

    // Update Floating Numbers (Green Happy & Pink Heart Numbers)
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.age += dt;
      ft.y += ft.vy * dt;
      ft.vy *= 0.92;
      if (ft.age >= ft.duration) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Update Musical Notes & Pastel Star Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.age += dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += pt.gravity * dt;
      pt.rot += pt.vRot * dt;
      if (pt.age >= pt.duration) {
        this.particles.splice(i, 1);
      }
    }
  }

  performAutoFishThrow() {
    const activeCats = this.cats.filter((c) => c.state !== "sleep");
    if (activeCats.length === 0) return;

    this.protagonist.pose = "throw";
    this.protagonist.poseTimer = 0.28;
    this.sound.playThrowPop(1.0);

    // Subtle music note above the fish bucket when tossing
    if (Math.random() < 0.55) {
      this.spawnMusicNote(this.protagonist.x + 48, this.protagonist.y - 88);
    }

    // Determine how many fish to throw (Double / Triple Fortune roll)
    let count = 1;
    if (Math.random() * 100 < this.statsSystem.stats.tripleChance) count = 3;
    else if (Math.random() * 100 < this.statsSystem.stats.doubleChance) count = 2;

    for (let c = 0; c < count; c++) {
      // Normal Fish toward nearest cat
      const nearest = [...activeCats].sort(
        (a, b) => Math.abs(a.x - this.protagonist.x) - Math.abs(b.x - this.protagonist.x)
      )[0];
      if (nearest) {
        this.spawnFishProjectile("normal", nearest.x + (Math.random() - 0.5) * 40, nearest.y);
      }

      // Random Fish roll
      if (Math.random() * 100 < this.statsSystem.stats.randomFishRate) {
        const randCat = activeCats[Math.floor(Math.random() * activeCats.length)];
        if (randCat) {
          this.spawnFishProjectile("random", randCat.x + (Math.random() - 0.5) * 70, randCat.y);
        }
      }

      // Long-Range Fish roll
      if (Math.random() * 100 < this.statsSystem.stats.longRangeFishRate) {
        const farthest = [...activeCats].sort(
          (a, b) => Math.abs(b.x - this.protagonist.x) - Math.abs(a.x - this.protagonist.x)
        )[0];
        if (farthest) {
          this.spawnFishProjectile("long", farthest.x, farthest.y);
        }
      }

      // Sharing Fish roll
      if (Math.random() * 100 < this.statsSystem.stats.sharingTriggerRate) {
        const randCat = activeCats[Math.floor(Math.random() * activeCats.length)];
        if (randCat) {
          this.spawnFishProjectile("sharing", randCat.x, randCat.y);
        }
      }
    }
  }

  performAutoTeaserThrow() {
    const walkingCats = this.cats.filter((c) => c.state === "walk");
    if (walkingCats.length === 0) return;

    const target = walkingCats[Math.floor(Math.random() * walkingCats.length)];
    this.protagonist.pose = "throw";
    this.protagonist.poseTimer = 0.26;
    this.sound.playThrowPop(1.22);

    this.projectiles.push({
      kind: "teaser",
      startX: this.protagonist.x + 12,
      startY: this.protagonist.y - 85,
      targetX: target.x + (Math.random() - 0.5) * 50,
      targetY: target.y - 10,
      x: this.protagonist.x + 12,
      y: this.protagonist.y - 85,
      arcHeight: 155 + Math.random() * 65,
      duration: 0.58,
      elapsed: 0,
      rotation: -0.4,
      spinSpeed: (target.x > this.protagonist.x ? 1 : -1) * 5.2,
    });
  }

  spawnFishProjectile(fishKind, targetX, targetY) {
    // Check Critical Fish upgrade roll
    const isCrit = Math.random() * 100 < this.statsSystem.getEffectiveCritRate();
    const finalKind = isCrit ? "crit" : fishKind;

    this.projectiles.push({
      kind: finalKind,
      isCrit,
      startX: this.protagonist.x + 28,
      startY: this.protagonist.y - 82,
      targetX: Math.max(60, Math.min(1860, targetX)),
      targetY,
      x: this.protagonist.x + 28,
      y: this.protagonist.y - 82,
      arcHeight: 140 + Math.random() * 90,
      duration: 0.52 + Math.random() * 0.14,
      elapsed: 0,
      rotation: 0,
      spinSpeed: (targetX >= this.protagonist.x ? 1 : -1) * (4.5 + Math.random() * 3),
    });
  }

  // Triggered when clicking the circular Skill (☀) button on the HUD
  triggerSkillAction(skillObj) {
    this.protagonist.pose = "throw";
    this.protagonist.poseTimer = 0.45;
    this.sound.playSkillActivate();

    const aimX = this.pointer.inHud ? (Math.random() < 0.5 ? 420 : 1500) : this.pointer.x;
    const aimY = 690;

    if (skillObj.action === "revelation_offense") {
      // Re-grant copies of previously used offense skills (or Big Volley · Long-Range)
      const toRestore =
        this.statsSystem.usedOffenseSkills.length > 0
          ? [...this.statsSystem.usedOffenseSkills]
          : [
              {
                id: "off_big_volley_long",
                category: "offense",
                name: "Big Volley · Long-Range",
                action: "volley_long_fish",
              },
            ];
      toRestore.forEach((sk) => this.statsSystem.enqueueSkill({ ...sk }));
      return;
    }

    if (skillObj.category === "offense") {
      if (!this.statsSystem.usedOffenseSkills.some((s) => s.id === skillObj.id)) {
        this.statsSystem.usedOffenseSkills.push({ ...skillObj });
      }
    }

    if (skillObj.action === "volley_long_fish") {
      const count = 3 + this.statsSystem.levels.offense;
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          this.sound.playThrowPop(1.08 + i * 0.04);
          this.spawnFishProjectile("long", aimX + (Math.random() - 0.5) * 220, aimY + (Math.random() - 0.5) * 30);
        }, i * 55);
      }
    } else if (skillObj.action === "volley_cat_teaser") {
      const count = 3 + this.statsSystem.levels.defense;
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          this.sound.playThrowPop(1.2 + i * 0.04);
          this.projectiles.push({
            kind: "teaser",
            startX: this.protagonist.x + 12,
            startY: this.protagonist.y - 85,
            targetX: Math.max(70, Math.min(1850, aimX + (Math.random() - 0.5) * 260)),
            targetY: aimY + (Math.random() - 0.5) * 28,
            x: this.protagonist.x + 12,
            y: this.protagonist.y - 85,
            arcHeight: 165 + Math.random() * 70,
            duration: 0.52,
            elapsed: 0,
            rotation: 0,
            spinSpeed: 6.2,
          });
        }, i * 60);
      }
    } else {
      const count = 3 + this.statsSystem.levels.support;
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          this.sound.playThrowPop(1.1);
          this.spawnFishProjectile("sharing", 220 + Math.random() * 1480, aimY);
        }, i * 55);
      }
    }
  }

  resolveProjectileLanding(p) {
    if (p.kind === "teaser") {
      // Stop nearby cats for teaserStopSeconds
      const stopSecs = this.statsSystem.getEffectiveTeaserStopSeconds();
      let hitAny = false;
      for (const cat of this.cats) {
        if (cat.state !== "sleep" && Math.abs(cat.x - p.targetX) < 115) {
          cat.state = "sit";
          cat.stateTimer = stopSecs;
          cat.emoteType = Math.random() < 0.5 ? "!" : "?";
          hitAny = true;
        }
      }
      if (hitAny) {
        this.sound.playCatMeow(1.06);
      }
      this.spawnStarBurst(p.targetX, p.targetY - 15, 4);
      return;
    }

    // Find closest active cat near landing spot
    let bestCat = null;
    let bestDist = 135;
    for (const cat of this.cats) {
      if (cat.state === "sleep") continue;
      const d = Math.abs(cat.x - p.targetX);
      if (d < bestDist) {
        bestDist = d;
        bestCat = cat;
      }
    }

    if (!bestCat) return;

    // Calculate Happy given
    let amount = this.statsSystem.getEffectiveHappyGiven();
    if (p.isCrit || p.kind === "crit") {
      amount = Math.round((amount * this.statsSystem.stats.critHappyMult) / 100);
    }
    if (this.statsSystem.relics.consecutiveHitBonus > 0) {
      amount = Math.round(amount * (1 + bestCat.consecutiveHits * this.statsSystem.relics.consecutiveHitBonus));
    }
    bestCat.consecutiveHits += 1;

    this.applyHappyToCat(bestCat, amount, p.isCrit);

    // Sharing fish splash to neighbor cat
    if (p.kind === "sharing" || Math.random() * 100 < this.statsSystem.stats.sharingTriggerRate) {
      this.statsSystem.relics.sharingHitCounter += 1;
      if (
        this.statsSystem.relics.sharingCounterStack > 0 &&
        this.statsSystem.relics.sharingHitCounter % 20 === 0
      ) {
        this.statsSystem.stats.happyCounterMult += 5 * this.statsSystem.relics.sharingCounterStack;
      }
      const neighbor = this.cats.find(
        (c) => c !== bestCat && c.state !== "sleep" && Math.abs(c.x - bestCat.x) < 160
      );
      if (neighbor) {
        const splashAmt = Math.max(2, Math.round((amount * this.statsSystem.stats.sharingHappyMult) / 100));
        this.applyHappyToCat(neighbor, splashAmt, false);
      }
    }
  }

  applyHappyToCat(cat, amount, isCrit = false) {
    cat.happy += amount;
    this.sound.playFishHit(isCrit);

    // Green outlined floating Happy number ("10", "110" as seen in frame_01.jpg & frame_10.jpg)
    this.floatingTexts.push({
      text: `${amount}`,
      kind: "happy",
      x: cat.x + (Math.random() - 0.5) * 24,
      y: cat.y - 52,
      vy: -48,
      age: 0,
      duration: 0.85,
    });

    // Pastel Beamed Musical Notes & Star Burst (frame_10.jpg)
    this.spawnMusicNote(cat.x + (Math.random() - 0.5) * 30, cat.y - 68);
    this.spawnStarBurst(cat.x, cat.y - 36, isCrit ? 7 : 4);

    if (cat.happy >= cat.maxHappy && cat.state !== "sleep") {
      cat.state = "sleep";
      cat.stateTimer = 2.6;
      this.catsSatisfiedInWave += 1;
      this.sound.playCatMeow(0.92 + Math.random() * 0.2);

      // Spawn rolling Gold Paw Coin (and occasional Gem)
      const coinAmt = 40 + Math.floor(Math.random() * 20) + this.statsSystem.getEffectiveCoinBonus();
      this.pickups.push({
        kind: "coin",
        amount: coinAmt,
        x: cat.x,
        y: cat.y - 25,
        groundY: cat.y + 8,
        vx: (cat.x < this.protagonist.x ? 1 : -1) * (45 + Math.random() * 45),
        vy: -185,
        rot: 0,
        age: 0,
        state: "bounce",
      });
    }
  }

  applyCatCuddleAffection(cat) {
    // Check Parry Chance
    if (Math.random() * 100 < this.statsSystem.getEffectiveParryRate()) {
      this.floatingTexts.push({
        text: "PARRY!",
        kind: "happy",
        x: this.protagonist.x + (cat.x < this.protagonist.x ? -38 : 38),
        y: this.protagonist.y - 75,
        vy: -42,
        age: 0,
        duration: 0.75,
      });
      return;
    }

    const baseAffection = [5, 4, 3][Math.floor(Math.random() * 3)];
    const guard = this.statsSystem.getEffectiveGuardPower();
    const finalHearts = Math.max(1, baseAffection - guard);

    this.statsSystem.currentHearts = Math.min(
      this.statsSystem.getMaxHeartCapacity(),
      this.statsSystem.currentHearts + finalHearts
    );

    // Floating pink heart number ("5 ♥", "4 ♥", "3 ♥" next to protagonist, matching frame_58.jpg!)
    this.floatingTexts.push({
      text: `${finalHearts}`,
      kind: "heart",
      x: this.protagonist.x + (cat.x < this.protagonist.x ? -42 : 42),
      y: this.protagonist.y - 68,
      vy: -38,
      age: 0,
      duration: 0.9,
    });

    // Happy Counter damage back to cuddling cat
    const counter = this.statsSystem.getEffectiveHappyCounter();
    if (counter > 0) {
      this.applyHappyToCat(cat, counter, false);
    }
  }

  spawnMusicNote(x, y) {
    const colors = ["#d8b4fe", "#f9a8d4", "#93c5fd", "#c4b5fd"];
    this.particles.push({
      kind: Math.random() < 0.65 ? "beamed_note" : "single_note",
      color: colors[Math.floor(Math.random() * colors.length)],
      x,
      y,
      vx: (Math.random() - 0.5) * 28,
      vy: -42 - Math.random() * 25,
      gravity: -8,
      rot: (Math.random() - 0.5) * 0.3,
      vRot: (Math.random() - 0.5) * 0.8,
      scale: 0.85 + Math.random() * 0.35,
      age: 0,
      duration: 0.95,
    });
  }

  spawnStarBurst(x, y, count = 4) {
    const starColors = ["#86efac", "#f9a8d4", "#fde047", "#7dd3fc"];
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const spd = 45 + Math.random() * 55;
      this.particles.push({
        kind: "star",
        color: starColors[i % starColors.length],
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 25,
        gravity: 95,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 6,
        scale: 0.7 + Math.random() * 0.45,
        age: 0,
        duration: 0.65,
      });
    }
  }

  render(ctx) {
    // 1. Ground Contact Shadows for Protagonist, Bucket, and Cats
    ctx.save();
    ctx.fillStyle = "rgba(88, 114, 168, 0.38)";

    // Protagonist & Bucket shadow
    ctx.beginPath();
    ctx.ellipse(this.protagonist.x - 18, this.protagonist.y + 82, 48, 9, 0, 0, Math.PI * 2);
    ctx.ellipse(this.protagonist.x + 68, this.protagonist.y + 84, 36, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cat ground shadows
    for (const cat of this.cats) {
      ctx.globalAlpha = cat.alpha;
      ctx.beginPath();
      ctx.ellipse(cat.x, cat.y + 38, 42, 8.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 2. Protagonist & Blue Fish Bucket
    this.renderProtagonistAndBucket(ctx);

    // 3. Sort Cats by Y so foreground cats overlap cleanly
    const sortedCats = [...this.cats].sort((a, b) => a.y - b.y);
    for (const cat of sortedCats) {
      this.renderCat(ctx, cat);
    }

    // 4. Rolling Gold Paw Coins & Cyan Gems
    for (const pk of this.pickups) {
      const sp = pk.kind === "coin" ? this.spriteLib.sprites.goldCoin : this.spriteLib.sprites.cyanGem;
      if (sp) {
        ctx.save();
        ctx.translate(pk.x, pk.y);
        ctx.rotate(pk.rot);
        ctx.drawImage(sp, -34, -34, 68, 68);
        ctx.restore();
      }
    }

    // 5. Parabolic Projectiles (Fish & Cat Teasers)
    for (const p of this.projectiles) {
      let sp = this.spriteLib.sprites.fishNormal;
      if (p.kind === "random") sp = this.spriteLib.sprites.fishRandom;
      else if (p.kind === "long") sp = this.spriteLib.sprites.fishLong;
      else if (p.kind === "sharing") sp = this.spriteLib.sprites.fishSharing;
      else if (p.kind === "crit") sp = this.spriteLib.sprites.fishCrit;
      else if (p.kind === "teaser") sp = this.spriteLib.sprites.foxtailTeaser;

      if (sp) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.drawImage(sp, -sp.width / 2, -sp.height / 2);
        ctx.restore();
      }
    }

    // 6. Pastel Star & Beamed Musical Note Particles
    this.renderParticles(ctx);

    // 7. Floating Happy ("10", "110") & Heart ("5 ♥", "4 ♥") Numbers
    this.renderFloatingTexts(ctx);

    // 8. Foxtail Cursor Leaf Trail
    this.renderCursorTrail(ctx);
  }

  renderProtagonistAndBucket(ctx) {
    const p = this.protagonist;

    // Active Enchantment Shimmer Aura around Protagonist
    if (this.statsSystem.activeEnchants.length > 0) {
      ctx.save();
      const pulse = 0.65 + 0.35 * Math.sin(p.animTime * 8);
      const grad = ctx.createRadialGradient(p.x, p.y - 10, 10, p.x, p.y - 10, 95);
      grad.addColorStop(0, `rgba(216, 180, 254, ${0.42 * pulse})`);
      grad.addColorStop(1, "rgba(216, 180, 254, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y - 10, 95, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    let girlSprite = this.spriteLib.sprites.girlIdle0;
    if (p.pose === "throw") {
      girlSprite = this.spriteLib.sprites.girlThrow;
    } else if (Math.floor(p.animTime * 2.4) % 2 === 1) {
      girlSprite = this.spriteLib.sprites.girlIdle1;
    }

    if (girlSprite) {
      ctx.drawImage(girlSprite, p.x - 90, p.y - 165, 180, 260);
    }
    if (this.spriteLib.sprites.fishBucket) {
      ctx.drawImage(this.spriteLib.sprites.fishBucket, p.x + 20, p.y - 42, 110, 140);
    }
  }

  renderCat(ctx, cat) {
    ctx.save();
    ctx.globalAlpha = cat.alpha;
    ctx.translate(cat.x, cat.y);

    if (cat.state === "sleep") {
      const sp = this.spriteLib.sprites.catSleep;
      if (sp) ctx.drawImage(sp, -70, -58, 140, 110);
      ctx.restore();
      return;
    }

    if (cat.state === "sit") {
      const f = Math.floor(cat.animPhase * 0.5) % 2;
      const sp = this.spriteLib.sprites[`catSit_${f}`];
      if (cat.dir < 0) ctx.scale(-1, 1);
      if (sp) ctx.drawImage(sp, -65, -96, 130, 145);
      if (cat.dir < 0) ctx.scale(-1, 1);

      // Cute reaction mark above distracted sitting cat ("!", "?", or "///", matching frame_10.jpg & frame_20.jpg!)
      ctx.font = '900 26px "Fredoka", "Nunito", sans-serif';
      ctx.textAlign = "center";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#ffffff";
      ctx.fillStyle = cat.emoteType === "?" ? "#a855f7" : "#ec4899";
      ctx.strokeText(cat.emoteType, 0, -98);
      ctx.fillText(cat.emoteType, 0, -98);

      ctx.restore();
      return;
    }

    // Walking or cuddling cat
    const frame = Math.floor(cat.animPhase) % 4;
    const sp = this.spriteLib.sprites[`catWalk_${frame}`];
    if (cat.dir < 0) ctx.scale(-1, 1);
    if (sp) ctx.drawImage(sp, -75, -75, 150, 125);

    ctx.restore();
  }

  renderParticles(ctx) {
    for (const pt of this.particles) {
      const alpha = Math.max(0, 1 - pt.age / pt.duration);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(pt.x, pt.y);
      ctx.rotate(pt.rot);
      ctx.scale(pt.scale, pt.scale);

      if (pt.kind === "star") {
        this.drawFivePointStar(ctx, 0, 0, 14, 6.5, pt.color);
      } else {
        // Beamed Musical Note (♫ / ♪) with white paper-cutout outline (matches frame_10.jpg!)
        ctx.font = '900 38px "Fredoka", sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 6;
        ctx.strokeStyle = "#ffffff";
        const sym = pt.kind === "beamed_note" ? "♫" : "♪";
        ctx.strokeText(sym, 0, 0);
        ctx.fillStyle = pt.color;
        ctx.fillText(sym, 0, 0);
      }
      ctx.restore();
    }
  }

  drawFivePointStar(ctx, cx, cy, outerR, innerR, fillCol) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    ctx.fillStyle = fillCol;
    ctx.fill();
  }

  renderFloatingTexts(ctx) {
    for (const ft of this.floatingTexts) {
      const alpha = Math.min(1, (1 - ft.age / ft.duration) * 1.6);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(ft.x, ft.y);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (ft.kind === "happy") {
        // Green outlined number ("10", "110" in frame_01.jpg & frame_10.jpg)
        ctx.font = '900 34px "Fredoka", "Nunito", sans-serif';
        ctx.lineJoin = "round";
        ctx.lineWidth = 9;
        ctx.strokeStyle = "#ffffff";
        ctx.strokeText(ft.text, 0, 0);
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#14532d";
        ctx.strokeText(ft.text, 0, 0);
        ctx.fillStyle = "#86efac";
        ctx.fillText(ft.text, 0, 0);
      } else if (ft.kind === "heart") {
        // Cuddle Heart number ("5 ♥", "4 ♥", "3 ♥" in frame_58.jpg)
        ctx.font = '900 30px "Fredoka", "Nunito", sans-serif';
        ctx.lineJoin = "round";
        ctx.lineWidth = 8;
        ctx.strokeStyle = "#ffffff";
        ctx.strokeText(ft.text, -12, 0);
        ctx.lineWidth = 4.5;
        ctx.strokeStyle = "#881337";
        ctx.strokeText(ft.text, -12, 0);
        ctx.fillStyle = "#fda4af";
        ctx.fillText(ft.text, -12, 0);

        // Pink heart icon next to number
        ctx.fillStyle = "#f472b6";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.strokeText("♥", 14, -1);
        ctx.fillText("♥", 14, -1);
      }
      ctx.restore();
    }
  }

  renderCursorTrail(ctx) {
    for (const ct of this.cursorTrail) {
      const alpha = ct.life / ct.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(ct.x, ct.y);
      ctx.rotate(ct.rot);
      ctx.fillStyle = "#bef264";
      ctx.strokeStyle = "#3f6212";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 9, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }
}
