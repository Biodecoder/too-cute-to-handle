// 9-Category Status Formula System & Roguelite Card Pool
// Matches the exact math & cards shown in Tatsuya Koyama's video

export const CARD_POOL = [
  // ================= OFFENSE (攻め) =================
  {
    id: "off_random_fish",
    category: "offense",
    type: "levelup", // Triangle side borders
    colorTheme: "blue",
    title: "Random Fish",
    jpTitle: "ランダムおさかな",
    desc: "Throw Chance\n+ 30 %",
    footer: "Level Up · Offense",
    apply: (system) => {
      system.stats.randomFishRate += 30;
    },
  },
  {
    id: "off_chance_enchant",
    category: "offense",
    type: "enchant", // Moon badge + striped header
    colorTheme: "blue",
    title: "Chance",
    jpTitle: "チャンス",
    desc: "For 7 seconds,\nCritical Chance\n+ 30 %",
    footer: "Enchant · Offense",
    duration: 7,
    apply: (system) => {
      system.enqueueEnchant({
        id: "off_chance_enchant",
        name: "Chance (+30% Crit)",
        duration: 7,
        critRateBonus: 30,
      });
    },
  },
  {
    id: "off_all_fish",
    category: "offense",
    type: "levelup",
    colorTheme: "blue",
    title: "All Fish",
    jpTitle: "おさかな全体",
    desc: "Happy Multiplier given by\nall fish types\n+ 20 %",
    footer: "Level Up · Offense",
    apply: (system) => {
      system.stats.happyMult += 20;
    },
  },
  {
    id: "off_big_volley_long",
    category: "offense",
    type: "skill", // Sun badge + striped header
    colorTheme: "blue",
    title: "Big Volley · Long-Range",
    jpTitle: "大放出・遠距離",
    desc: "Throw 3 + Offense Lv.\nLong-Range Fish at the\nCat Teaser Cursor",
    footer: "Skill · Offense",
    apply: (system) => {
      system.enqueueSkill({
        id: "off_big_volley_long",
        category: "offense",
        name: "Big Volley · Long-Range",
        action: "volley_long_fish",
      });
    },
  },
  {
    id: "off_revelation_skill",
    category: "offense",
    type: "skill",
    colorTheme: "blue",
    title: "Revelation · Offense Skill",
    jpTitle: "天啓・攻めスキル",
    desc: "Gain 1 copy of each\nOffense Skill used\nduring this stage",
    footer: "Skill · Offense",
    apply: (system) => {
      system.enqueueSkill({
        id: "off_revelation_skill",
        category: "offense",
        name: "Revelation · Offense Skill",
        action: "revelation_offense",
      });
    },
  },
  {
    id: "off_sharing_fish",
    category: "offense",
    type: "levelup",
    colorTheme: "blue",
    title: "Sharing Fish",
    jpTitle: "おすそわけおさかな",
    desc: "Trigger Chance\n+ 10 %",
    footer: "Level Up · Offense",
    apply: (system) => {
      system.stats.sharingTriggerRate += 10;
    },
  },
  {
    id: "off_offering_sharing_counter",
    category: "offense",
    type: "offering", // Purple ornate filigree frame
    colorTheme: "purple",
    title: "Untitled Relic",
    jpTitle: "名称未定",
    desc: "Every 20 Sharing Fish hits,\nHappy Counter Multiplier\n+ 5 %",
    footer: "Offering · Offense",
    apply: (system) => {
      system.relics.sharingCounterStack += 1;
      system.stats.happyCounterBase = Math.max(2, system.stats.happyCounterBase);
      system.stats.happyCounterMult += 5;
    },
  },
  {
    id: "off_offering_same_cat",
    category: "offense",
    type: "offering",
    colorTheme: "purple",
    title: "Untitled Relic",
    jpTitle: "名称未定",
    desc: "Each time a fish hits the\nsame cat, Happy received\nby that cat + 5 %",
    footer: "Offering · Offense",
    apply: (system) => {
      system.relics.consecutiveHitBonus += 0.05;
    },
  },

  // ================= DEFENSE (受け) =================
  {
    id: "def_embrace_enchant",
    category: "defense",
    type: "enchant",
    colorTheme: "green",
    title: "Embrace",
    jpTitle: "エンブレイス",
    desc: "For 10 seconds,\nGuard Power\n+ 100 %",
    footer: "Enchant · Defense",
    duration: 10,
    apply: (system) => {
      system.enqueueEnchant({
        id: "def_embrace_enchant",
        name: "Embrace (+100% Guard)",
        duration: 10,
        guardMultBonus: 100,
      });
    },
  },
  {
    id: "def_technical_enchant",
    category: "defense",
    type: "enchant",
    colorTheme: "green",
    title: "Technical",
    jpTitle: "テクニカル",
    desc: "For 10 seconds,\nParry Chance\n+ 30 %",
    footer: "Enchant · Defense",
    duration: 10,
    apply: (system) => {
      system.enqueueEnchant({
        id: "def_technical_enchant",
        name: "Technical (+30% Parry)",
        duration: 10,
        parryBonus: 30,
      });
    },
  },
  {
    id: "def_guard_power",
    category: "defense",
    type: "levelup",
    colorTheme: "green",
    title: "Guard Power",
    jpTitle: "受け止め力",
    desc: "Guard Power Multiplier\n+ 30 %",
    footer: "Level Up · Defense",
    apply: (system) => {
      system.stats.guardPowerBase = Math.max(1, system.stats.guardPowerBase + 1);
      system.stats.guardPowerMult += 30;
    },
  },
  {
    id: "def_big_volley_teaser",
    category: "defense",
    type: "skill",
    colorTheme: "green",
    title: "Big Volley · Cat Teaser",
    jpTitle: "大放出・ねこじゃらし",
    desc: "Throw 3 + Defense Lv.\nCat Teasers at the\nCat Teaser Cursor",
    footer: "Skill · Defense",
    apply: (system) => {
      system.enqueueSkill({
        id: "def_big_volley_teaser",
        category: "defense",
        name: "Big Volley · Cat Teaser",
        action: "volley_cat_teaser",
      });
    },
  },
  {
    id: "def_teaser_duration",
    category: "defense",
    type: "levelup",
    colorTheme: "green",
    title: "Teaser Mastery",
    jpTitle: "ねこじゃらし時間",
    desc: "Cat Teaser Stop Duration\nMultiplier + 25 %",
    footer: "Level Up · Defense",
    apply: (system) => {
      system.stats.teaserStopMult += 25;
    },
  },
  {
    id: "def_offering_cuddle_heal",
    category: "defense",
    type: "offering",
    colorTheme: "purple",
    title: "Untitled Relic",
    jpTitle: "名称未定",
    desc: "Whenever a cat is stopped\nby a Cat Teaser, Heart\nAuto-Recovery + 10 %",
    footer: "Offering · Defense",
    apply: (system) => {
      system.stats.autoRegenMult += 20;
    },
  },

  // ================= SUPPORT (補助) =================
  {
    id: "sup_fourth_slot",
    category: "support",
    type: "levelup",
    colorTheme: "yellow",
    title: "4th Slot Unlock",
    jpTitle: "4枠目出現",
    desc: "4th Card Slot Chance\n+ 3 %",
    footer: "Level Up · Support",
    apply: (system) => {
      system.stats.fourthSlotChance += 3;
    },
  },
  {
    id: "sup_offering_crit_enchant",
    category: "support",
    type: "offering",
    colorTheme: "purple",
    title: "Untitled Relic",
    jpTitle: "名称未定",
    desc: "Whenever you gain a\nSupport Enchant, Critical\nFish Happy Multiplier + 10 %",
    footer: "Offering · Support",
    apply: (system) => {
      system.relics.supportEnchantCritScale += 10;
      system.stats.critHappyMult += 10;
    },
  },
  {
    id: "sup_offering_crit_enchant_b",
    category: "support",
    type: "offering",
    colorTheme: "purple",
    title: "Untitled Relic",
    jpTitle: "名称未定",
    desc: "Whenever you gain a\nSupport Enchant, Critical\nFish Happy Multiplier + 10 %",
    footer: "Offering · Support",
    apply: (system) => {
      system.relics.supportEnchantCritScale += 10;
      system.stats.critHappyMult += 10;
    },
  },
  {
    id: "sup_lucky_enchant",
    category: "support",
    type: "enchant",
    colorTheme: "yellow",
    title: "Lucky Breeze",
    jpTitle: "ラッキータイム",
    desc: "For 8 seconds,\nDouble Draw & Crit Chance\n+ 25 %",
    footer: "Enchant · Support",
    duration: 8,
    apply: (system) => {
      if (system.relics.supportEnchantCritScale > 0) {
        system.stats.critHappyMult += system.relics.supportEnchantCritScale;
      }
      system.enqueueEnchant({
        id: "sup_lucky_enchant",
        name: "Lucky Breeze (+25% Crit)",
        duration: 8,
        critRateBonus: 25,
      });
    },
  },
  {
    id: "sup_coin_bonus",
    category: "support",
    type: "levelup",
    colorTheme: "yellow",
    title: "Coin Prosperity",
    jpTitle: "コインボーナス",
    desc: "Coin Gain Bonus + 5\n& Wave Interest\n+ 5 %",
    footer: "Level Up · Support",
    apply: (system) => {
      system.stats.coinBonusBase += 5;
      system.stats.coinInterestRate += 5;
    },
  },
  {
    id: "sup_treat_festival",
    category: "support",
    type: "skill",
    colorTheme: "yellow",
    title: "Big Volley · Sharing",
    jpTitle: "大放出・おすそわけ",
    desc: "Throw 3 + Support Lv.\nSharing Fish across\nthe entire plaza",
    footer: "Skill · Support",
    apply: (system) => {
      system.enqueueSkill({
        id: "sup_treat_festival",
        category: "support",
        name: "Big Volley · Sharing",
        action: "volley_sharing_fish",
      });
    },
  },
];

// Scripted sequence of exact card trios from the reference video for the first 6 drafts
const VIDEO_SCRIPTED_DRAFTS = {
  offense: [
    ["off_random_fish", "off_chance_enchant", "off_all_fish"], // 00:12
    ["off_offering_sharing_counter", "off_big_volley_long", "off_random_fish"], // 00:27
    ["off_revelation_skill", "off_offering_same_cat", "off_sharing_fish"], // 00:35
  ],
  defense: [
    ["def_embrace_enchant", "def_technical_enchant", "def_guard_power"], // 00:17
    ["def_big_volley_teaser", "def_embrace_enchant", "def_guard_power"], // 00:43
  ],
  support: [
    ["sup_fourth_slot", "sup_offering_crit_enchant", "sup_offering_crit_enchant_b"], // 00:23
  ],
};

export class StatsAndCardSystem {
  constructor() {
    this.reset();
  }

  reset() {
    this.levels = {
      offense: 1,
      defense: 1,
      support: 1,
    };

    this.costs = {
      offense: 100,
      defense: 100,
      support: 100,
    };

    this.draftIndices = {
      offense: 0,
      defense: 0,
      support: 0,
    };

    // Resources (matches video start: 0 coins, 44 -> 39 gems, Prototype Debug mode allows free level ups at 0 coins)
    this.coins = 0;
    this.gems = 44;
    this.debugFreeDraft = true; // Matches "デバッグ中" awning in the video where clicking Lv buttons works even at 0 coins

    // Heart capacity (0 / 100)
    this.currentHearts = 0;

    // Exact 9-Category Status Values from frame_32.jpg
    this.stats = {
      // 1. Basic Fish (基本おさかな)
      happyBase: 10,
      happyMult: 100,
      normalFishRate: 100,
      randomFishRate: 70, // Becomes 100% after picking Random Fish (+30%) as seen in frame_32.jpg!
      longRangeFishRate: 0,

      // 2. Sharing Fish (おすそわけおさかな)
      sharingTriggerRate: 0,
      sharingHappyMult: 20,

      // 3. Critical Fish (クリティカルおさかな)
      critTriggerRate: 3,
      critHappyMult: 150,

      // 4. Cat Teaser (ねこじゃらし)
      teaserThrowRate: 200,
      teaserStopBase: 2.0,
      teaserStopMult: 100,

      // 5. Affection Capacity (包容力)
      heartCapBase: 100,
      heartCapMult: 100,
      autoRegenBase: 1,
      autoRegenMult: 100,

      // 6. Technique (テクニック)
      guardPowerBase: 0,
      guardPowerMult: 100,
      parryRate: 0,
      happyCounterBase: 0,
      happyCounterMult: 100,

      // 7. Coins (コイン)
      coinBonusBase: 0,
      coinBonusMult: 100,
      coinInterestRate: 0,

      // 8. Gems (ジェム)
      gemBonusBase: 0,
      gemBonusMult: 100,
      gemInterestRate: 0,

      // 9. Fortune (運勢)
      doubleChance: 1,
      tripleChance: 0,
      fourthSlotChance: 0, // Becomes 3% after picking 4th Slot Unlock (+3%) as seen in frame_32.jpg!
    };

    this.relics = {
      sharingCounterStack: 0,
      sharingHitCounter: 0,
      consecutiveHitBonus: 0,
      supportEnchantCritScale: 0,
    };

    // Queued Skills (☀) & Enchants (🌙)
    this.skillQueue = [];
    this.enchantQueue = [];
    this.usedOffenseSkills = [];

    // Currently active timed enchantments
    this.activeEnchants = [];
  }

  enqueueSkill(skillObj) {
    this.skillQueue.push(skillObj);
  }

  enqueueEnchant(enchantObj) {
    this.enchantQueue.push(enchantObj);
  }

  updateActiveBuffs(dt) {
    for (let i = this.activeEnchants.length - 1; i >= 0; i--) {
      this.activeEnchants[i].remaining -= dt;
      if (this.activeEnchants[i].remaining <= 0) {
        this.activeEnchants.splice(i, 1);
      }
    }
  }

  getEffectiveCritRate() {
    let bonus = 0;
    for (const enc of this.activeEnchants) {
      if (enc.critRateBonus) bonus += enc.critRateBonus;
    }
    return this.stats.critTriggerRate + bonus;
  }

  getEffectiveGuardMult() {
    let bonus = 0;
    for (const enc of this.activeEnchants) {
      if (enc.guardMultBonus) bonus += enc.guardMultBonus;
    }
    return this.stats.guardPowerMult + bonus;
  }

  getEffectiveParryRate() {
    let bonus = 0;
    for (const enc of this.activeEnchants) {
      if (enc.parryBonus) bonus += enc.parryBonus;
    }
    return Math.min(90, this.stats.parryRate + bonus);
  }

  getEffectiveHappyGiven() {
    return Math.round((this.stats.happyBase * this.stats.happyMult) / 100);
  }

  getEffectiveTeaserStopSeconds() {
    return Number(((this.stats.teaserStopBase * this.stats.teaserStopMult) / 100).toFixed(1));
  }

  getMaxHeartCapacity() {
    return Math.round((this.stats.heartCapBase * this.stats.heartCapMult) / 100);
  }

  getEffectiveAutoRegen() {
    return Math.round((this.stats.autoRegenBase * this.stats.autoRegenMult) / 100);
  }

  getEffectiveGuardPower() {
    return Math.round((this.stats.guardPowerBase * this.getEffectiveGuardMult()) / 100);
  }

  getEffectiveHappyCounter() {
    return Math.round((this.stats.happyCounterBase * this.stats.happyCounterMult) / 100);
  }

  getEffectiveCoinBonus() {
    return Math.round((this.stats.coinBonusBase * this.stats.coinBonusMult) / 100);
  }

  getEffectiveGemBonus() {
    return Math.round((this.stats.gemBonusBase * this.stats.gemBonusMult) / 100);
  }

  canAffordCategory(cat) {
    if (this.debugFreeDraft) return true;
    return this.coins >= this.costs[cat];
  }

  drawCardsForCategory(category) {
    const scriptedList = VIDEO_SCRIPTED_DRAFTS[category] || [];
    const idx = this.draftIndices[category] || 0;
    this.draftIndices[category] = idx + 1;

    if (idx < scriptedList.length) {
      const ids = scriptedList[idx];
      return ids.map((id) => CARD_POOL.find((c) => c.id === id)).filter(Boolean);
    }

    // Random draw from category pool
    const pool = CARD_POOL.filter((c) => c.category === category);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const count = Math.random() * 100 < this.stats.fourthSlotChance ? 4 : 3;
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  selectCard(card, category) {
    if (!this.debugFreeDraft && this.coins >= this.costs[category]) {
      this.coins -= this.costs[category];
    }
    this.levels[category] += 1;
    if (card && typeof card.apply === "function") {
      card.apply(this);
    }
  }
}
