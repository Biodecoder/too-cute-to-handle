// High-DPI Procedural 2D Hand-Illustrated Sprite Generator with White Paper-Cutout Sticker Outlines
// Faithfully reproduces the character designs, chubby tabby cats, fish treats, palm trees, and icons from Tatsuya Koyama's video

export class SpriteArtLibrary {
  constructor() {
    this.sprites = {};
    this.portraitDataUrl = "";
    this.buildAllSprites();
  }

  // Creates an offscreen canvas, draws via drawFn, and wraps the alpha silhouette in a crisp white paper-cutout border
  createCutoutSprite(width, height, drawFn, outlineWidth = 5, addDropShadow = true) {
    const rawCanvas = document.createElement("canvas");
    rawCanvas.width = width;
    rawCanvas.height = height;
    const rawCtx = rawCanvas.getContext("2d");
    drawFn(rawCtx, width, height);

    if (outlineWidth <= 0) return rawCanvas;

    const outCanvas = document.createElement("canvas");
    outCanvas.width = width;
    outCanvas.height = height;
    const outCtx = outCanvas.getContext("2d");

    // Create pure white silhouette copy for stamping the paper-cutout border
    const silCanvas = document.createElement("canvas");
    silCanvas.width = width;
    silCanvas.height = height;
    const silCtx = silCanvas.getContext("2d");
    silCtx.drawImage(rawCanvas, 0, 0);
    silCtx.globalCompositeOperation = "source-in";
    silCtx.fillStyle = "#ffffff";
    silCtx.fillRect(0, 0, width, height);

    if (addDropShadow) {
      outCtx.save();
      outCtx.shadowColor = "rgba(42, 62, 102, 0.28)";
      outCtx.shadowBlur = 4;
      outCtx.shadowOffsetY = 2;
    }

    const steps = 20;
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const dx = Math.cos(angle) * outlineWidth;
      const dy = Math.sin(angle) * outlineWidth;
      outCtx.drawImage(silCanvas, dx, dy);
    }
    // Inner ring fill for thicker outlines
    if (outlineWidth > 3) {
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const dx = Math.cos(angle) * (outlineWidth * 0.55);
        const dy = Math.sin(angle) * (outlineWidth * 0.55);
        outCtx.drawImage(silCanvas, dx, dy);
      }
    }

    if (addDropShadow) {
      outCtx.restore();
    }

    outCtx.drawImage(rawCanvas, 0, 0);
    return outCanvas;
  }

  buildAllSprites() {
    // 1. Protagonist Poses (Idle 0, Idle 1, Throw Pose, Cuddle Pose)
    this.sprites.girlIdle0 = this.createCutoutSprite(180, 260, (ctx) => {
      this.drawProtagonist(ctx, "idle", 0);
    }, 5);
    this.sprites.girlIdle1 = this.createCutoutSprite(180, 260, (ctx) => {
      this.drawProtagonist(ctx, "idle", 1);
    }, 5);
    this.sprites.girlThrow = this.createCutoutSprite(180, 260, (ctx) => {
      this.drawProtagonist(ctx, "throw", 0);
    }, 5);
    this.sprites.girlCuddle = this.createCutoutSprite(180, 260, (ctx) => {
      this.drawProtagonist(ctx, "cuddle", 0);
    }, 5);

    // 2. Blue Fish Bucket
    this.sprites.fishBucket = this.createCutoutSprite(110, 140, (ctx) => {
      this.drawFishBucket(ctx);
    }, 4.5);

    // 3. Orange-and-White Tabby Cat Poses (Walk 0..3, Sit Distracted 0..1, Sleeping Loaf)
    for (let f = 0; f < 4; f++) {
      this.sprites[`catWalk_${f}`] = this.createCutoutSprite(150, 125, (ctx) => {
        this.drawTabbyCatWalk(ctx, f);
      }, 4.5);
    }
    this.sprites.catSit_0 = this.createCutoutSprite(130, 145, (ctx) => {
      this.drawTabbyCatSit(ctx, 0);
    }, 4.5);
    this.sprites.catSit_1 = this.createCutoutSprite(130, 145, (ctx) => {
      this.drawTabbyCatSit(ctx, 1);
    }, 4.5);
    this.sprites.catSleep = this.createCutoutSprite(140, 110, (ctx) => {
      this.drawTabbyCatSleep(ctx);
    }, 4.5);

    // 4. Palm Trees (Left & Right 2D Cutout Billboards)
    this.sprites.palmLeft = this.createCutoutSprite(440, 520, (ctx) => {
      this.drawPalmTree(ctx, false);
    }, 6.5);
    this.sprites.palmRight = this.createCutoutSprite(440, 520, (ctx) => {
      this.drawPalmTree(ctx, true);
    }, 6.5);

    // 5. Fish Projectiles & Cat Teaser
    this.sprites.fishNormal = this.createCutoutSprite(76, 56, (ctx) => {
      this.drawFishProjectile(ctx, "normal");
    }, 3.5);
    this.sprites.fishRandom = this.createCutoutSprite(76, 56, (ctx) => {
      this.drawFishProjectile(ctx, "random");
    }, 3.5);
    this.sprites.fishLong = this.createCutoutSprite(82, 56, (ctx) => {
      this.drawFishProjectile(ctx, "long");
    }, 3.5);
    this.sprites.fishSharing = this.createCutoutSprite(84, 64, (ctx) => {
      this.drawFishProjectile(ctx, "sharing");
    }, 3.5);
    this.sprites.fishCrit = this.createCutoutSprite(86, 62, (ctx) => {
      this.drawFishProjectile(ctx, "crit");
    }, 4);
    this.sprites.foxtailTeaser = this.createCutoutSprite(88, 88, (ctx) => {
      this.drawFoxtailStem(ctx);
    }, 3.5);

    // 6. Pickups (Gold Paw Coin & Cyan Gem)
    this.sprites.goldCoin = this.createCutoutSprite(68, 68, (ctx) => {
      this.drawGoldPawCoin(ctx);
    }, 3.5);
    this.sprites.cyanGem = this.createCutoutSprite(68, 68, (ctx) => {
      this.drawCyanGem(ctx);
    }, 3.5);

    // 7. Protagonist Top-Left HUD Portrait DataURL
    const pCanvas = document.createElement("canvas");
    pCanvas.width = 160;
    pCanvas.height = 160;
    this.drawPortrait(pCanvas.getContext("2d"));
    this.portraitDataUrl = pCanvas.toDataURL("image/png");
  }

  drawPortrait(ctx) {
    ctx.save();
    // Sky-blue circular background
    ctx.fillStyle = "#62c3f7";
    ctx.beginPath();
    ctx.arc(80, 80, 76, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const lineCol = "#5a3428";

    // Back of blonde bob hair
    ctx.fillStyle = "#f2c335";
    ctx.strokeStyle = lineCol;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(80, 82, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Neck & shoulders
    ctx.fillStyle = "#ffe8d9";
    ctx.beginPath();
    ctx.moveTo(66, 114);
    ctx.lineTo(66, 134);
    ctx.lineTo(42, 146);
    ctx.lineTo(42, 160);
    ctx.lineTo(118, 160);
    ctx.lineTo(118, 146);
    ctx.lineTo(94, 134);
    ctx.lineTo(94, 114);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Collarbone subtle line
    ctx.strokeStyle = "#d9a58c";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(68, 138);
    ctx.quadraticCurveTo(80, 143, 92, 138);
    ctx.stroke();

    // White shirt & teal apron straps
    ctx.strokeStyle = lineCol;
    ctx.lineWidth = 2.5;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(38, 160);
    ctx.lineTo(52, 136);
    ctx.lineTo(68, 146);
    ctx.lineTo(80, 148);
    ctx.lineTo(92, 146);
    ctx.lineTo(108, 136);
    ctx.lineTo(122, 160);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#14b8a6";
    ctx.fillRect(50, 138, 11, 24);
    ctx.strokeRect(50, 138, 11, 24);
    ctx.fillRect(99, 138, 11, 24);
    ctx.strokeRect(99, 138, 11, 24);

    // Teal Newsboy Cap (crown + visor)
    ctx.fillStyle = "#0ea596";
    ctx.beginPath();
    ctx.ellipse(80, 48, 52, 28, -0.04, Math.PI * 0.95, Math.PI * 2.05);
    ctx.fill();
    ctx.stroke();

    // Anime chin/face contour
    ctx.fillStyle = "#ffe8d9";
    ctx.beginPath();
    ctx.moveTo(46, 68);
    ctx.quadraticCurveTo(46, 108, 63, 120);
    ctx.quadraticCurveTo(80, 130, 97, 120);
    ctx.quadraticCurveTo(114, 108, 114, 68);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Soft cheek blush
    ctx.fillStyle = "rgba(255, 130, 150, 0.36)";
    ctx.beginPath();
    ctx.ellipse(57, 98, 8.5, 4.5, 0, 0, Math.PI * 2);
    ctx.ellipse(103, 98, 8.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Anime eyes (warm ruby-magenta irises)
    const drawEye = (ex, ey) => {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(ex, ey, 8.5, 9.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#be2952";
      ctx.beginPath();
      ctx.ellipse(ex, ey + 1, 6.2, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#521024";
      ctx.beginPath();
      ctx.arc(ex, ey + 1.5, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(ex - 2.3, ey - 2.5, 2.3, 0, Math.PI * 2);
      ctx.arc(ex + 2, ey + 2.8, 1.2, 0, Math.PI * 2);
      ctx.fill();
      // Upper lash arch
      ctx.strokeStyle = "#4a2219";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ex, ey + 1.5, 8.8, Math.PI * 1.12, Math.PI * 1.88);
      ctx.stroke();
    };
    drawEye(63, 86);
    drawEye(97, 86);

    // Subtle nose & gentle open smile
    ctx.fillStyle = "#d99b82";
    ctx.beginPath();
    ctx.arc(80, 95, 1.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = lineCol;
    ctx.lineWidth = 2.2;
    ctx.fillStyle = "#f4798e";
    ctx.beginPath();
    ctx.moveTo(73, 105);
    ctx.quadraticCurveTo(80, 107, 87, 105);
    ctx.quadraticCurveTo(80, 114, 73, 105);
    ctx.fill();
    ctx.stroke();

    // Blonde side hair framing cheeks + bangs
    ctx.fillStyle = "#f7d348";
    ctx.strokeStyle = lineCol;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(35, 98);
    ctx.quadraticCurveTo(32, 54, 58, 44);
    ctx.quadraticCurveTo(80, 40, 102, 44);
    ctx.quadraticCurveTo(128, 54, 125, 98);
    ctx.quadraticCurveTo(118, 112, 110, 116);
    ctx.quadraticCurveTo(114, 88, 110, 70);
    ctx.lineTo(100, 74);
    ctx.lineTo(94, 58);
    ctx.lineTo(85, 74);
    ctx.lineTo(80, 56);
    ctx.lineTo(74, 74);
    ctx.lineTo(66, 58);
    ctx.lineTo(59, 74);
    ctx.lineTo(50, 70);
    ctx.quadraticCurveTo(46, 88, 50, 116);
    ctx.quadraticCurveTo(42, 112, 35, 98);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cap brim
    ctx.fillStyle = "#0b877b";
    ctx.beginPath();
    ctx.moveTo(38, 53);
    ctx.quadraticCurveTo(80, 35, 122, 55);
    ctx.quadraticCurveTo(80, 46, 38, 53);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawProtagonist(ctx, pose = "idle", frame = 0) {
    ctx.save();
    const cx = 90;
    const bobY = pose === "idle" && frame === 1 ? 1.5 : 0;
    ctx.translate(0, bobY);

    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const lineCol = "#4a2c24";

    // Legs (dark charcoal leggings)
    ctx.strokeStyle = lineCol;
    ctx.lineWidth = 2.6;

    if (pose === "throw") {
      // Left leg planted, right leg kicked up playfully (matches frame_28.jpg!)
      ctx.fillStyle = "#463b3f";
      ctx.beginPath();
      ctx.roundRect(cx - 16, 172, 10, 56, 5);
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.translate(cx + 8, 175);
      ctx.rotate(-0.34);
      ctx.beginPath();
      ctx.roundRect(-5, 0, 10, 50, 5);
      ctx.fill();
      ctx.stroke();
      // Right magenta shoe kicked up
      ctx.fillStyle = "#e63e6d";
      ctx.beginPath();
      ctx.ellipse(2, 52, 10.5, 7, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Left magenta shoe planted
      ctx.fillStyle = "#e63e6d";
      ctx.beginPath();
      ctx.ellipse(cx - 12, 232, 11.5, 7.5, -0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // Both legs standing
      ctx.fillStyle = "#463b3f";
      ctx.beginPath();
      ctx.roundRect(cx - 17, 172, 10, 56, 5);
      ctx.roundRect(cx + 7, 172, 10, 56, 5);
      ctx.fill();
      ctx.stroke();

      // Magenta shoes
      ctx.fillStyle = "#e63e6d";
      ctx.beginPath();
      ctx.ellipse(cx - 13, 232, 12, 7.5, -0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx + 13, 232, 12, 7.5, 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Arms & White Sleeves + Teal Gloves
    if (pose === "throw") {
      // Viewer-left arm stretched down-left for balance
      ctx.save();
      ctx.translate(cx - 20, 108);
      ctx.rotate(0.55);
      ctx.fillStyle = "#ffe3d3";
      ctx.beginPath();
      ctx.roundRect(-32, -4.5, 28, 9, 4.5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(-14, -7, 16, 14, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#17b8a6";
      ctx.beginPath();
      ctx.arc(-34, 0, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Viewer-right arm raised high cheering/tossing fish!
      ctx.save();
      ctx.translate(cx + 18, 104);
      ctx.rotate(-1.08);
      ctx.fillStyle = "#ffe3d3";
      ctx.beginPath();
      ctx.roundRect(4, -4.5, 36, 9, 4.5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(-2, -7, 16, 14, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#17b8a6";
      ctx.beginPath();
      ctx.arc(42, 0, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else {
      // Idle arms angled gently down/out at sides (matches frame_01.jpg!)
      [-1, 1].forEach((dir) => {
        ctx.save();
        ctx.translate(cx + dir * 19, 106);
        ctx.rotate(dir * 0.34);
        ctx.fillStyle = "#ffe3d3";
        ctx.beginPath();
        ctx.roundRect(-4.5, 8, 9, 34, 4.5);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(-7.5, -2, 15, 19, 5);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#17b8a6";
        ctx.beginPath();
        ctx.arc(0, 44, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });
    }

    // White shirt torso
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(cx - 20, 98, 40, 38, 8);
    ctx.fill();
    ctx.stroke();

    // Teal Apron (bib + A-line skirt)
    ctx.fillStyle = "#15b8a6";
    ctx.beginPath();
    ctx.moveTo(cx - 15, 102);
    ctx.lineTo(cx + 15, 102);
    ctx.lineTo(cx + 17, 134);
    ctx.lineTo(cx + 28, 182);
    ctx.quadraticCurveTo(cx, 189, cx - 28, 182);
    ctx.lineTo(cx - 17, 134);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Apron waist band
    ctx.beginPath();
    ctx.moveTo(cx - 17, 133);
    ctx.lineTo(cx + 17, 133);
    ctx.stroke();

    // Blonde bob hair back
    ctx.fillStyle = "#f2c636";
    ctx.beginPath();
    ctx.arc(cx, 66, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Soft anime face
    ctx.fillStyle = "#ffe5d6";
    ctx.beginPath();
    ctx.arc(cx, 69, 23, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cheek blush
    ctx.fillStyle = "rgba(255, 125, 145, 0.35)";
    ctx.beginPath();
    ctx.ellipse(cx - 12, 75, 4.2, 2.4, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 12, 75, 4.2, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    [-9, 9].forEach((ox) => {
      ctx.fillStyle = "#b83256";
      ctx.beginPath();
      ctx.ellipse(cx + ox, 70, 3.8, 5.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx + ox - 1.2, 68, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Mouth
    if (pose === "throw") {
      ctx.fillStyle = "#f06882";
      ctx.beginPath();
      ctx.arc(cx, 79, 4.6, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(cx, 78, 3.5, 0.15, Math.PI - 0.15);
      ctx.stroke();
    }

    // Blonde bangs + side locks
    ctx.fillStyle = "#f6d24a";
    ctx.beginPath();
    ctx.moveTo(cx - 25, 76);
    ctx.quadraticCurveTo(cx - 25, 44, cx, 42);
    ctx.quadraticCurveTo(cx + 25, 44, cx + 25, 76);
    ctx.quadraticCurveTo(cx + 18, 56, cx + 11, 65);
    ctx.quadraticCurveTo(cx, 52, cx - 11, 65);
    ctx.quadraticCurveTo(cx - 18, 56, cx - 25, 76);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Teal Newsboy Cap with brim
    ctx.fillStyle = "#14b8a6";
    ctx.beginPath();
    ctx.ellipse(cx, 44, 29, 14, -0.06, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#0d9488";
    ctx.beginPath();
    ctx.ellipse(cx + 3, 45, 31, 6.5, 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawFishBucket(ctx) {
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1b5e8a";
    ctx.lineWidth = 3;

    // Fish sticking out the top of the bucket
    const drawMiniFish = (x, y, rot, col) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Tail
      ctx.beginPath();
      ctx.moveTo(13, 0);
      ctx.lineTo(23, -8);
      ctx.lineTo(23, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Eye
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(-8, -2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1b5e8a";
      ctx.beginPath();
      ctx.arc(-8, -2, 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    drawMiniFish(38, 42, -1.1, "#67e8f9");
    drawMiniFish(56, 36, -1.5, "#38bdf8");
    drawMiniFish(72, 44, -1.9, "#7dd3fc");

    // Bucket body
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.moveTo(22, 50);
    ctx.lineTo(88, 50);
    ctx.lineTo(78, 122);
    ctx.quadraticCurveTo(55, 129, 32, 122);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bucket vertical shading ribs
    ctx.strokeStyle = "rgba(14, 116, 174, 0.45)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(40, 56);
    ctx.lineTo(43, 120);
    ctx.moveTo(55, 56);
    ctx.lineTo(55, 122);
    ctx.moveTo(70, 56);
    ctx.lineTo(67, 120);
    ctx.stroke();

    // Bucket top rim
    ctx.strokeStyle = "#1b5e8a";
    ctx.lineWidth = 3;
    ctx.fillStyle = "#7dd3fc";
    ctx.beginPath();
    ctx.ellipse(55, 50, 35, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // Draws the chubby orange-and-white tabby cat walking RIGHT (flipped horizontally when walking LEFT)
  drawTabbyCatWalk(ctx, frame = 0) {
    ctx.save();
    const bob = frame % 2 === 1 ? -2.5 : 0;
    ctx.translate(0, bob);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const brown = "#593118";
    ctx.strokeStyle = brown;
    ctx.lineWidth = 3.2;

    // Upright curved striped tail on left (rear)
    const tailWag = Math.sin((frame / 4) * Math.PI * 2) * 0.14;
    ctx.save();
    ctx.translate(32, 64);
    ctx.rotate(tailWag);
    ctx.fillStyle = "#f2b238";
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.quadraticCurveTo(-22, -16, -12, -44);
    ctx.quadraticCurveTo(-5, -50, 2, -42);
    ctx.quadraticCurveTo(-6, -16, 10, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Tail orange-brown stripes
    ctx.fillStyle = "#cf6f16";
    ctx.fillRect(-14, -34, 10, 5);
    ctx.fillRect(-15, -22, 11, 5);
    ctx.fillRect(-12, -10, 11, 5);
    ctx.restore();

    // Back legs
    const legSwing = [
      [-6, 6, 5, -5],
      [0, 0, 0, 0],
      [6, -6, -5, 5],
      [0, 0, 0, 0],
    ][frame];

    const drawStubbyLeg = (lx, ly, dx) => {
      ctx.fillStyle = "#fffdf7";
      ctx.beginPath();
      ctx.ellipse(lx + dx, ly, 9, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    };

    // Far-side legs
    drawStubbyLeg(42, 95, legSwing[0]);
    drawStubbyLeg(94, 95, legSwing[2]);

    // Chubby loaf body
    ctx.fillStyle = "#fffdf7";
    ctx.beginPath();
    ctx.ellipse(72, 72, 44, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Golden-orange dorsal coat & saddle stripes
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(72, 72, 44, 28, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "#f4b63a";
    ctx.beginPath();
    ctx.ellipse(66, 54, 44, 22, 0.08, 0, Math.PI * 2);
    ctx.fill();
    // Darker tabby saddle stripes
    ctx.fillStyle = "#d47619";
    ctx.beginPath();
    ctx.ellipse(46, 50, 5, 16, 0.2, 0, Math.PI * 2);
    ctx.ellipse(62, 48, 5.5, 17, 0.15, 0, Math.PI * 2);
    ctx.ellipse(78, 50, 5, 15, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Body outline
    ctx.beginPath();
    ctx.ellipse(72, 72, 44, 28, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Near-side legs
    drawStubbyLeg(54, 98, legSwing[1]);
    drawStubbyLeg(104, 98, legSwing[3]);

    // Cat Head (on right/front)
    this.drawTabbyHead(ctx, 102, 54);

    ctx.restore();
  }

  drawTabbyHead(ctx, hx, hy, sleeping = false) {
    const brown = "#593118";
    ctx.save();
    ctx.translate(hx, hy);
    ctx.strokeStyle = brown;
    ctx.lineWidth = 3.2;

    // Ears
    const drawEar = (ex, ey, rot) => {
      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(rot);
      ctx.fillStyle = "#f4b63a";
      ctx.beginPath();
      ctx.moveTo(-11, 6);
      ctx.lineTo(0, -15);
      ctx.lineTo(11, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#f49ac0";
      ctx.beginPath();
      ctx.moveTo(-5, 4);
      ctx.lineTo(0, -8);
      ctx.lineTo(5, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    drawEar(-15, -16, -0.28);
    drawEar(15, -16, 0.28);

    // Chubby round cheeks/head (soft warm buttery cream from frame_01.jpg)
    ctx.fillStyle = "#fff9dc";
    ctx.beginPath();
    ctx.ellipse(0, 0, 27, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Golden-orange forehead cap
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, 27, 22, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "#f5bd42";
    ctx.beginPath();
    ctx.arc(-15, -13, 21, 0, Math.PI * 2);
    ctx.arc(15, -13, 21, 0, Math.PI * 2);
    ctx.fill();
    // Forehead tabby stripes
    ctx.strokeStyle = "#d97b1c";
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(-5, -20);
    ctx.lineTo(-3, -11);
    ctx.moveTo(0, -21);
    ctx.lineTo(0, -10);
    ctx.moveTo(5, -20);
    ctx.lineTo(3, -11);
    ctx.stroke();
    ctx.restore();

    // Head outline
    ctx.strokeStyle = brown;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.ellipse(0, 0, 27, 22, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Eyes (relaxed, sleepy-cute horizontal upper lid + dot eyes matching frame_01.jpg!)
    if (sleeping) {
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(-10, 1, 4.8, 0.15, Math.PI - 0.15);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(10, 1, 4.8, 0.15, Math.PI - 0.15);
      ctx.stroke();
    } else {
      ctx.fillStyle = brown;
      ctx.beginPath();
      ctx.arc(-10, 0.5, 2.5, 0, Math.PI * 2);
      ctx.arc(10, 0.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
      // Gentle relaxed horizontal upper eyelid line
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-14, -2.5);
      ctx.lineTo(-6, -2.5);
      ctx.moveTo(6, -2.5);
      ctx.lineTo(14, -2.5);
      ctx.stroke();
    }

    // Cute ':3' (ω) cat mouth
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.arc(-3.5, 5.5, 3.5, 0, Math.PI);
    ctx.arc(3.5, 5.5, 3.5, 0, Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  // Sitting upright distracted by the Foxtail Cat Teaser (frame_10.jpg, frame_28.jpg)
  drawTabbyCatSit(ctx, frame = 0) {
    ctx.save();
    const brown = "#593118";
    ctx.strokeStyle = brown;
    ctx.lineWidth = 3.2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // Tail swaying behind
    const wag = frame === 0 ? -0.1 : 0.12;
    ctx.save();
    ctx.translate(86, 108);
    ctx.rotate(wag);
    ctx.fillStyle = "#f4b63a";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(26, -12, 18, -44);
    ctx.quadraticCurveTo(10, -48, 6, -38);
    ctx.quadraticCurveTo(12, -16, -6, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Upright pear-shaped sitting body
    ctx.fillStyle = "#fffdf7";
    ctx.beginPath();
    ctx.ellipse(62, 92, 30, 36, 0, 0, Math.PI * 2);
    ctx.fill();

    // Orange back stripes clipped to body
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(62, 92, 30, 36, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "#f4b63a";
    ctx.beginPath();
    ctx.ellipse(82, 90, 20, 36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.beginPath();
    ctx.ellipse(62, 92, 30, 36, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Front paws neatly together
    ctx.fillStyle = "#fffdf7";
    ctx.beginPath();
    ctx.roundRect(45, 92, 11, 34, 5);
    ctx.roundRect(59, 92, 11, 34, 5);
    ctx.fill();
    ctx.stroke();

    // Head looking slightly up
    this.drawTabbyHead(ctx, 58, 48, false);
    ctx.restore();
  }

  // Curled sleeping loaf when satisfied (frame_01.jpg, frame_28.jpg)
  drawTabbyCatSleep(ctx) {
    ctx.save();
    const brown = "#593118";
    ctx.strokeStyle = brown;
    ctx.lineWidth = 3.2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // Round curled body
    ctx.fillStyle = "#f4b63a";
    ctx.beginPath();
    ctx.ellipse(68, 64, 42, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cream belly patch
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(68, 64, 42, 28, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "#fffdf7";
    ctx.beginPath();
    ctx.ellipse(66, 82, 36, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tabby stripes on curled back
    ctx.fillStyle = "#cf6f16";
    ctx.beginPath();
    ctx.ellipse(46, 46, 5, 16, -0.2, 0, Math.PI * 2);
    ctx.ellipse(62, 44, 5, 16, -0.1, 0, Math.PI * 2);
    ctx.ellipse(78, 46, 5, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.beginPath();
    ctx.ellipse(68, 64, 42, 28, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Sleeping head tucked in front
    this.drawTabbyHead(ctx, 88, 64, true);
    ctx.restore();
  }

  // Hand-drawn 2D Palm Tree + Base Bushes with paper-cutout border (matches frame_01.jpg)
  drawPalmTree(ctx, isRight = false) {
    ctx.save();
    if (isRight) {
      ctx.translate(440, 0);
      ctx.scale(-1, 1);
    }
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // Curved segmented brown trunk
    ctx.fillStyle = "#c87d45";
    ctx.strokeStyle = "#8c4f23";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(95, 485);
    ctx.quadraticCurveTo(118, 330, 195, 165);
    ctx.lineTo(225, 175);
    ctx.quadraticCurveTo(165, 335, 148, 485);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Trunk horizontal ring segments
    ctx.strokeStyle = "rgba(124, 65, 24, 0.55)";
    ctx.lineWidth = 3;
    for (let i = 1; i <= 6; i++) {
      const t = i / 7;
      const y = 470 - t * 280;
      const x = 115 + t * 82;
      ctx.beginPath();
      ctx.arc(x, y, 22 - t * 5, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }

    // Basal green bushes
    ctx.fillStyle = "#76d327";
    ctx.strokeStyle = "#4d9c11";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(105, 465, 38, 0, Math.PI * 2);
    ctx.arc(155, 452, 46, 0, Math.PI * 2);
    ctx.arc(210, 468, 36, 0, Math.PI * 2);
    ctx.arc(68, 476, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bright lime highlight on bushes
    ctx.fillStyle = "#9be844";
    ctx.beginPath();
    ctx.arc(152, 444, 32, Math.PI, Math.PI * 2);
    ctx.arc(206, 460, 24, Math.PI, Math.PI * 2);
    ctx.fill();

    // Large tropical palm fronds at crown (210, 160)
    const cx = 212;
    const cy = 152;
    const fronds = [
      { angle: -2.55, len: 165, width: 44, col: "#7ad629" },
      { angle: -1.85, len: 145, width: 42, col: "#92e63a" },
      { angle: -0.95, len: 150, width: 42, col: "#98eb40" },
      { angle: -0.25, len: 175, width: 46, col: "#85de31" },
      { angle: 0.45, len: 170, width: 44, col: "#74cc24" },
      { angle: 1.25, len: 155, width: 40, col: "#8ce236" },
      { angle: 2.05, len: 150, width: 40, col: "#7ad629" },
    ];

    fronds.forEach((f) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(f.angle);
      ctx.fillStyle = f.col;
      ctx.strokeStyle = "#529e14";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(f.len * 0.45, -f.width, f.len, 12);
      ctx.quadraticCurveTo(f.len * 0.55, f.width * 0.65, 0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Center rib line
      ctx.strokeStyle = "rgba(72, 140, 18, 0.55)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.quadraticCurveTo(f.len * 0.5, -6, f.len * 0.9, 10);
      ctx.stroke();
      ctx.restore();
    });

    ctx.restore();
  }

  drawFishProjectile(ctx, kind = "normal") {
    ctx.save();
    ctx.translate(38, 28);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    if (kind === "sharing") {
      // Twin small fish (orange + cyan, matches frame_32.jpg)
      ctx.save();
      ctx.translate(-6, -10);
      ctx.scale(0.68, 0.68);
      this._drawSingleFish(ctx, "#f97316", "#7c2d12", true);
      ctx.restore();
      ctx.save();
      ctx.translate(6, 10);
      ctx.scale(0.68, 0.68);
      this._drawSingleFish(ctx, "#38bdf8", "#0c4a6e", false);
      ctx.restore();
      ctx.restore();
      return;
    }

    if (kind === "random") {
      this._drawSingleFish(ctx, "#f97316", "#6b2e14", true);
    } else if (kind === "long") {
      this._drawSingleFish(ctx, "#3b82f6", "#1e3a8a", false, true);
    } else if (kind === "crit") {
      this._drawSingleFish(ctx, "#e11d48", "#881337", false, false);
    } else {
      this._drawSingleFish(ctx, "#5ac8fa", "#1e567c", false, false);
    }

    ctx.restore();
  }

  _drawSingleFish(ctx, bodyColor, strokeColor, hasClownStripes = false, hasWings = false) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.8;
    ctx.fillStyle = bodyColor;

    // Tail fin
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(28, -12);
    ctx.lineTo(25, 0);
    ctx.lineTo(28, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Body
    ctx.beginPath();
    ctx.ellipse(-2, 0, 20, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    if (hasClownStripes) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(-2, 0, 20, 12, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-8, -14, 5, 28);
      ctx.strokeRect(-8, -14, 5, 28);
      ctx.fillRect(4, -14, 4.5, 28);
      ctx.strokeRect(4, -14, 4.5, 28);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.ellipse(-2, 0, 20, 12, 0, 0, Math.PI * 2);
    ctx.stroke();

    if (hasWings) {
      // Swept white pectoral wing fin for Long-Range Fish
      ctx.fillStyle = "#e0f2fe";
      ctx.beginPath();
      ctx.moveTo(-4, 2);
      ctx.lineTo(12, -16);
      ctx.lineTo(16, -6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Eye
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-12, -3, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.arc(-12.5, -3, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Green Foxtail Cat Teaser (ねこじゃらし)
  drawFoxtailStem(ctx) {
    ctx.save();
    ctx.translate(44, 44);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = "#2d5a18";
    ctx.lineWidth = 3;

    // Slender green stem
    ctx.beginPath();
    ctx.moveTo(22, 26);
    ctx.quadraticCurveTo(6, 6, -6, -6);
    ctx.stroke();

    // Two side leaves
    ctx.fillStyle = "#84cc16";
    ctx.beginPath();
    ctx.ellipse(12, 8, 10, 4, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(2, 16, 10, 4, 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Fluffy foxtail head
    ctx.save();
    ctx.translate(-14, -14);
    ctx.rotate(-0.65);
    ctx.fillStyle = "#bef264";
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  drawGoldPawCoin(ctx) {
    ctx.save();
    ctx.translate(34, 34);
    ctx.strokeStyle = "#5c3412";
    ctx.lineWidth = 3;

    // 3D rim
    ctx.fillStyle = "#d99116";
    ctx.beginPath();
    ctx.arc(2, 3, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Gold coin face
    ctx.fillStyle = "#fcd34d";
    ctx.beginPath();
    ctx.arc(-1, 0, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner ring
    ctx.strokeStyle = "#d99116";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-1, 0, 16, 0, Math.PI * 2);
    ctx.stroke();

    // Paw print icon
    ctx.fillStyle = "#925214";
    ctx.beginPath();
    ctx.ellipse(-1, 4, 6, 4.8, 0, 0, Math.PI * 2);
    ctx.arc(-7, -3, 2.6, 0, Math.PI * 2);
    ctx.arc(-2.5, -6, 2.6, 0, Math.PI * 2);
    ctx.arc(2.5, -6, 2.6, 0, Math.PI * 2);
    ctx.arc(6.5, -2.5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawCyanGem(ctx) {
    ctx.save();
    ctx.translate(34, 34);
    ctx.strokeStyle = "#1e3a5f";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";

    ctx.fillStyle = "#7dd3fc";
    ctx.beginPath();
    ctx.moveTo(-12, -14);
    ctx.lineTo(12, -14);
    ctx.lineTo(22, -2);
    ctx.lineTo(0, 18);
    ctx.lineTo(-22, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Facets
    ctx.fillStyle = "#bae6fd";
    ctx.beginPath();
    ctx.moveTo(-12, -14);
    ctx.lineTo(12, -14);
    ctx.lineTo(7, -2);
    ctx.lineTo(-7, -2);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-22, -2);
    ctx.lineTo(22, -2);
    ctx.moveTo(-12, -14);
    ctx.lineTo(-7, -2);
    ctx.lineTo(0, 18);
    ctx.lineTo(7, -2);
    ctx.lineTo(12, -14);
    ctx.stroke();

    ctx.restore();
  }
}
