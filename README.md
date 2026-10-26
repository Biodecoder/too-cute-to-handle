# Too Cute to Handle! (`#ねこがかわいくておしまいになるゲーム`) — v0.1

An English web recreation of Tatsuya Koyama's indie game prototype **`#ねこがかわいくておしまいになるゲーム`** (*"Too Cute to Handle! — A game where cats are so cute you're done for"*), featuring a 2.5D seaside plaza diorama, 2D paper-cutout sticker sprites, handcrafted UI animations, roguelite card drafting, 9-category status formulas, and procedural WebAudio sound effects.

## Quick Start

```bash
npm start
# Open http://127.0.0.1:4280/
```

## Features in v0.1

- **2.5D Seaside Plaza & Paper-Cutout Art Direction**:
  - Two-story pastel shop with a mint-green `DEBUGGING` (`デバッグ中`) awning, 7 colorful bunting flags, flower window boxes, warm wall sconces, ocean balustrade, and palm trees with comic halftone dot foliage.
  - Procedural 2D hand-illustrated sprites wrapped in thick white paper-cutout sticker borders (`createPaperSticker`), including the blonde shopkeeper protagonist (`idle`, `throw`, `cuddle`, `portrait`), overflowing blue fish bucket, and chubby orange-and-white tabby cats (`walk`, `sit`, `sleep`).
- **Active Cat Wave Defense & Foxtail Cat Teaser**:
  - Bilateral waves of tabby cats march from left and right toward the protagonist.
  - Auto-aimed parabolic fish throws (`Normal`, `Random`, `Long-Range`, `Critical`, `Sharing`) and `Cat Teaser` wands that distract cats (`!` / `?`) before satisfying them into sleeping cat loaves that drop rolling **Gold Paw Coins** and **Cyan Gems**.
  - Wave the interactive **Foxtail Cat Teaser** cursor over the plaza or click to toss bonus fish and teasers; if cats reach the center and cuddle you (`5 ♥`), your **Heart Capacity (`0 / 100`)** fills up!
- **3-Deck Roguelite Card Draft (`Offense` / `Defense` / `Support`)**:
  - Spend Paw Coins (`50`, `100`, `150`...) on the bottom HUD to trigger the **Pick One!** draft screen with comic halftone screentone bands and tilt-shift blurred foreground terracotta flowerpots.
  - 3D card dealing from the bottom-left deck, `rotateY` flip reveals, unchosen card flip-back dismissal, and miniature card flight animations into the circular **Skill**, **Enchant**, and **Item** buttons.
  - Full card pool across **Offense (Red)**, **Defense (Green)**, and **Support (Blue)** including `Level Up`, `Enchant`, `Skill`, and `Offering` cards, plus the **4th Card Slot** unlock (`4th Slot Chance`).
- **Complete 9-Category Status Modal**:
  - Live `Base × Multiplier% = Result` breakdown across **Basic Fish**, **Sharing Fish**, **Critical Fish**, **Cat Teaser**, **Affection Capacity**, **Technique**, **Coins**, **Gems**, and **Fortune**.
- **Procedural WebAudio Sound Synthesizer**:
  - Zero-dependency synthesized audio for fish pops, happy chimes, coin clinks, paper card riffles, whooshes, and cat meows.
