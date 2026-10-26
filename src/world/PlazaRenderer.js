// 2.5D Seaside Shop Plaza Diorama Renderer
// Matches the exact composition, colors, lighting, shadows, and cutout palm trees of Tatsuya Koyama's video

export class PlazaRenderer {
  constructor(spriteLib) {
    this.spriteLib = spriteLib;
    this.bgCacheCanvas = null;
    this.speckles = [];
    for (let i = 0; i < 260; i++) {
      this.speckles.push({
        x: Math.random() * 1920,
        y: 618 + Math.random() * 440,
        w: 6 + Math.random() * 22,
        h: 2 + Math.random() * 4,
        alpha: 0.12 + Math.random() * 0.22,
        tone: Math.random() > 0.5 ? "#b4d7d4" : "#ffffff",
      });
    }
    this.buildStaticBackground();
  }

  buildStaticBackground() {
    const canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");

    // 1. Sky Gradient (Cerulean to pastel horizon)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 620);
    skyGrad.addColorStop(0, "#7ab3f5");
    skyGrad.addColorStop(0.55, "#a9d2fc");
    skyGrad.addColorStop(1, "#d5ecff");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1920, 630);

    // 2. Background Stone Balustrade Railing (y = 458..618)
    this.drawBalustrade(ctx);

    // 3. Center Two-Story Pastel Shop Building
    this.drawShopBuilding(ctx);

    // 4. Sunlit Aqua-White Stone Plaza Floor (y = 612..1080)
    const floorGrad = ctx.createLinearGradient(0, 612, 0, 1080);
    floorGrad.addColorStop(0, "#cde5e2");
    floorGrad.addColorStop(0.18, "#dff1ee");
    floorGrad.addColorStop(0.75, "#e9f6f3");
    floorGrad.addColorStop(1, "#f2faf8");
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, 612, 1920, 468);

    // Subtle stone speckles on plaza floor
    for (const sp of this.speckles) {
      ctx.fillStyle = sp.tone;
      ctx.globalAlpha = sp.alpha;
      ctx.beginPath();
      ctx.roundRect(sp.x, sp.y, sp.w, sp.h, 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 5. Long Ground Cast Shadows under Palm Trees & Shop Base
    ctx.fillStyle = "rgba(104, 134, 188, 0.34)";
    ctx.beginPath();
    ctx.ellipse(230, 614, 165, 11, 0, 0, Math.PI * 2);
    ctx.ellipse(1675, 614, 165, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Terracotta planter curbs at base of palm trees
    ctx.fillStyle = "#b87449";
    ctx.fillRect(48, 602, 340, 14);
    ctx.fillRect(1490, 602, 360, 14);

    // 6. Left & Right 2D Paper-Cutout Palm Trees
    if (this.spriteLib.sprites.palmLeft) {
      ctx.drawImage(this.spriteLib.sprites.palmLeft, 48, 108, 440, 514);
    }
    if (this.spriteLib.sprites.palmRight) {
      ctx.drawImage(this.spriteLib.sprites.palmRight, 1455, 42, 465, 578);
    }

    this.bgCacheCanvas = canvas;
  }

  drawBalustrade(ctx) {
    ctx.save();
    // Distant sea/terrace shadow strip
    ctx.fillStyle = "#6c8fd0";
    ctx.fillRect(0, 462, 1920, 154);

    // Baluster pillars across the horizon
    for (let x = 16; x < 1920; x += 48) {
      const inShadow = x < 310 || x > 1830 || (x > 610 && x < 700);
      ctx.fillStyle = inShadow ? "#5c7ab8" : "#bce0fa";
      ctx.beginPath();
      ctx.roundRect(x, 482, 24, 116, 10);
      ctx.fill();

      if (!inShadow) {
        ctx.fillStyle = "#e0f2fe";
        ctx.beginPath();
        ctx.roundRect(x + 4, 488, 10, 102, 5);
        ctx.fill();
      }
    }

    // Top handrail & bottom plinth
    ctx.fillStyle = "#9ab8ea";
    ctx.fillRect(0, 456, 1920, 22);
    ctx.fillStyle = "#d8ecff";
    ctx.fillRect(0, 456, 1920, 9);

    ctx.fillStyle = "#8eaee2";
    ctx.fillRect(0, 592, 1920, 24);
    ctx.restore();
  }

  drawShopBuilding(ctx) {
    ctx.save();
    const bx = 665;
    const bw = 575;

    // Soft side shadow cast by building onto left balustrade
    ctx.fillStyle = "rgba(82, 104, 158, 0.35)";
    ctx.fillRect(bx - 35, 290, 45, 325);

    // 1. Coral-Pink Roof Cap (y = 0..56)
    ctx.fillStyle = "#d97c88";
    ctx.fillRect(bx - 18, 0, bw + 36, 36);
    ctx.fillStyle = "#eef6fd";
    ctx.fillRect(bx - 14, 36, bw + 28, 22);
    ctx.fillStyle = "#95a7d4";
    ctx.fillRect(bx - 8, 58, bw + 16, 18);

    // 2. Upper Story Sandstone Brick Facade (y = 76..284)
    ctx.fillStyle = "#e3c5b2";
    ctx.fillRect(bx, 76, bw, 208);

    // Subtle decorative brick blocks
    const bricks = [
      [bx + 12, 92, 66, 26, "#d4b29c"],
      [bx + 25, 132, 54, 24, "#ecd3c2"],
      [bx + 8, 174, 70, 28, "#d4b29c"],
      [bx + 18, 226, 62, 26, "#d9b9a4"],
      [bx + bw - 82, 96, 70, 26, "#d4b29c"],
      [bx + bw - 68, 144, 58, 26, "#ecd3c2"],
      [bx + bw - 86, 192, 74, 26, "#d4b29c"],
      [bx + bw - 74, 236, 64, 24, "#d9b9a4"],
      [bx + 260, 102, 55, 24, "#d4b29c"],
      [bx + 266, 186, 48, 26, "#ecd3c2"],
    ];
    for (const [rx, ry, rw, rh, col] of bricks) {
      ctx.fillStyle = col;
      ctx.fillRect(rx, ry, rw, rh);
    }

    // Two Upper Windows + Terracotta Flower Boxes
    const drawUpperWindow = (wx, wy) => {
      // Diagonal drop shadow under window & flower box
      ctx.fillStyle = "rgba(116, 114, 162, 0.42)";
      ctx.beginPath();
      ctx.moveTo(wx - 6, wy + 132);
      ctx.lineTo(wx + 150, wy + 132);
      ctx.lineTo(wx + 132, wy + 195);
      ctx.lineTo(wx - 28, wy + 195);
      ctx.closePath();
      ctx.fill();

      // White outer frame
      ctx.fillStyle = "#f2f7fd";
      ctx.fillRect(wx, wy, 146, 128);

      // 4 Aqua glass panes
      ctx.fillStyle = "#48b6be";
      ctx.fillRect(wx + 14, wy + 14, 52, 46);
      ctx.fillRect(wx + 80, wy + 14, 52, 46);
      ctx.fillRect(wx + 14, wy + 68, 52, 46);
      ctx.fillRect(wx + 80, wy + 68, 52, 46);

      // Glass diagonal sheen
      ctx.fillStyle = "rgba(165, 243, 252, 0.35)";
      ctx.fillRect(wx + 18, wy + 18, 18, 36);
      ctx.fillRect(wx + 84, wy + 18, 18, 36);

      // White window sill
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(wx - 6, wy + 122, 158, 14);

      // Green foliage bush in flower box
      ctx.fillStyle = "#3dd64b";
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        ctx.arc(wx + 24 + i * 20, wy + 112, 17, 0, Math.PI * 2);
      }
      ctx.fill();

      // Tiny pink & yellow flowers on window bush
      const dotCols = ["#f43f5e", "#facc15", "#ec4899", "#fde047", "#f43f5e"];
      dotCols.forEach((dc, idx) => {
        ctx.fillStyle = dc;
        ctx.beginPath();
        ctx.arc(wx + 26 + idx * 23, wy + 108 + (idx % 2) * 5, 4.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Terracotta flower box
      ctx.fillStyle = "#df7b4d";
      ctx.beginPath();
      ctx.moveTo(wx + 6, wy + 120);
      ctx.lineTo(wx + 140, wy + 120);
      ctx.lineTo(wx + 132, wy + 154);
      ctx.lineTo(wx + 14, wy + 154);
      ctx.closePath();
      ctx.fill();

      // Planter vents
      ctx.fillStyle = "#7c3a20";
      ctx.fillRect(wx + 26, wy + 130, 24, 6);
      ctx.fillRect(wx + 62, wy + 130, 24, 6);
      ctx.fillRect(wx + 98, wy + 130, 24, 6);
    };

    drawUpperWindow(bx + 115, 84);
    drawUpperWindow(bx + 332, 84);

    // Glowing Wall Sconces (Upper story corners)
    const drawSconce = (lx, ly) => {
      ctx.fillStyle = "#6c585c";
      ctx.fillRect(lx - 4, ly - 18, 8, 14);
      const glow = ctx.createRadialGradient(lx, ly, 2, lx, ly, 28);
      glow.addColorStop(0, "#ffffff");
      glow.addColorStop(0.45, "rgba(254, 249, 195, 0.85)");
      glow.addColorStop(1, "rgba(254, 249, 195, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(lx, ly, 28, 0, Math.PI * 2);
      ctx.fill();
    };
    drawSconce(bx + 54, 108);
    drawSconce(bx + bw - 54, 108);

    // 3. Lower Story Facade (y = 284..615)
    ctx.fillStyle = "#DEC2B0";
    ctx.fillRect(bx + 10, 284, bw - 20, 330);

    // Lemon-lime lower wainscoting trim (y = 556..614)
    ctx.fillStyle = "#d9f366";
    ctx.fillRect(bx + 10, 556, bw - 20, 52);
    ctx.fillStyle = "#c985a8";
    ctx.fillRect(bx + 6, 606, bw - 12, 12);

    // Left Storefront Window (x = bx + 66, y = 368)
    const swx = bx + 68;
    const swy = 366;
    ctx.fillStyle = "#95add4";
    ctx.fillRect(swx, swy, 212, 166);
    ctx.fillStyle = "#4fb0cf";
    ctx.fillRect(swx + 16, swy + 16, 180, 134);

    // Interior pennant shadow silhouettes inside shop window
    ctx.fillStyle = "rgba(41, 104, 156, 0.45)";
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(swx + 24 + i * 56, swy + 56);
      ctx.lineTo(swx + 72 + i * 56, swy + 56);
      ctx.lineTo(swx + 48 + i * 56, swy + 105);
      ctx.closePath();
      ctx.fill();
    }

    // Storefront lower flower bed with 3 cute daisies (matches frame_01.jpg)
    const drawDaisy = (dx, dy, petalCol, centerCol) => {
      ctx.strokeStyle = "#4d9c11";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(dx, dy + 8);
      ctx.lineTo(dx, dy + 32);
      ctx.stroke();

      ctx.fillStyle = petalCol;
      ctx.beginPath();
      ctx.ellipse(dx, dy, 18, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = centerCol;
      ctx.beginPath();
      ctx.ellipse(dx, dy, 7, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    drawDaisy(swx + 48, 542, "#ffffff", "#ef4444");
    drawDaisy(swx + 106, 535, "#ffffff", "#db2777");
    drawDaisy(swx + 164, 542, "#ffffff", "#f97316");

    // Green strip & terracotta planter under storefront window
    ctx.fillStyle = "#4ade4b";
    ctx.beginPath();
    ctx.roundRect(swx + 16, 558, 180, 16, 8);
    ctx.fill();
    ctx.fillStyle = "#d97746";
    ctx.fillRect(swx + 10, 570, 192, 46);

    // Right Recessed Wooden Shop Doorway (x = bx + 325, y = 345..612)
    const dx = bx + 328;
    ctx.fillStyle = "#a36c49";
    ctx.fillRect(dx, 340, 178, 272);
    // Diagonal awning shadow across doorway
    ctx.fillStyle = "rgba(86, 52, 58, 0.42)";
    ctx.beginPath();
    ctx.moveTo(dx, 340);
    ctx.lineTo(dx + 178, 340);
    ctx.lineTo(dx + 178, 495);
    ctx.lineTo(dx, 415);
    ctx.closePath();
    ctx.fill();
    // Magenta entrance threshold step
    ctx.fillStyle = "#d4587a";
    ctx.fillRect(dx - 8, 604, 194, 14);

    // Outdoor cylindrical bin to the right of the shop (x = bx + bw + 8)
    ctx.fillStyle = "#8da2be";
    ctx.beginPath();
    ctx.roundRect(bx + bw + 8, 542, 66, 74, 6);
    ctx.fill();
    ctx.fillStyle = "#cf6a7c";
    ctx.beginPath();
    ctx.roundRect(bx + bw + 4, 525, 74, 22, 8);
    ctx.fill();

    // 4. Mid Mint-Turquoise Awning & 7-Flag Bunting Garland (y = 278..380)
    // Diagonal cast shadows of the bunting flags on the wall
    ctx.fillStyle = "rgba(92, 74, 114, 0.36)";
    for (let i = 0; i < 7; i++) {
      const fx = bx + 26 + i * 74;
      ctx.beginPath();
      ctx.moveTo(fx - 12, 325);
      ctx.lineTo(fx + 56, 325);
      ctx.lineTo(fx + 14, 402);
      ctx.closePath();
      ctx.fill();
    }

    // Mint awning canopy
    ctx.fillStyle = "#5ef2d6";
    ctx.beginPath();
    ctx.moveTo(bx - 16, 278);
    ctx.lineTo(bx + bw + 16, 278);
    ctx.lineTo(bx + bw + 6, 322);
    ctx.lineTo(bx - 6, 322);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#47d4ba";
    ctx.fillRect(bx - 6, 320, bw + 12, 16);

    // Awning English Sign ("DEBUGGING", localized from "デバッグ中")
    ctx.font = '900 22px "Fredoka", "M PLUS Rounded 1c", "Nunito", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 4.5;
    ctx.strokeStyle = "#115e59";
    ctx.fillStyle = "#99f6e4";
    ctx.strokeText("DEBUGGING", bx + bw / 2, 310);
    ctx.fillText("DEBUGGING", bx + bw / 2, 310);

    // 7 Colorful Triangular Bunting Flags hanging from the awning
    const flagColors = [
      "#eab308", // Yellow
      "#b91c1c", // Crimson-Brown
      "#9333ea", // Purple
      "#dc2626", // Red
      "#06b6d4", // Cyan
      "#eab308", // Yellow
      "#22c55e", // Green
    ];
    flagColors.forEach((col, i) => {
      const fx = bx + 22 + i * 76;
      const fy = 316 + Math.sin((i / 6) * Math.PI) * 14;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(fx, fy - 8);
      ctx.lineTo(fx + 62, fy - 4);
      ctx.lineTo(fx + 31, fy + 58);
      ctx.closePath();
      ctx.fill();
    });

    ctx.restore();
  }

  render(ctx) {
    if (this.bgCacheCanvas) {
      ctx.drawImage(this.bgCacheCanvas, 0, 0);
    }
  }
}
