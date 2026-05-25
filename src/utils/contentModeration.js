const MODERATION_RULES = [
  {
    category: "harassment",
    terms: ["hate", "abuse", "harass", "bully", "stalk", "threaten", "insult", "jerk", "idiot", "stupid"],
    description: "Harassment or bullying"
  },
  {
    category: "violence",
    terms: ["violence", "terror", "kill", "murder", "bomb", "shoot", "attack", "blood", "stab", "weapon", "gun"],
    description: "Violence or terrorism"
  },
  {
    category: "self_harm",
    terms: ["suicide", "kill myself", "harm myself", "cut myself", "end my life", "jump off", "overdose"],
    description: "Suicide or self-harm"
  },
  {
    category: "substances",
    terms: ["alcohol", "drunk", "beer", "wine", "vodka", "whiskey", "drugs", "cocaine", "heroin", "meth", "weed", "marijuana"],
    description: "Alcohol or drugs"
  },
  {
    category: "gambling",
    terms: ["gambling", "betting", "casino", "poker", "slots", "bet", "wager", "lottery"],
    description: "Gambling or betting"
  },
  {
    category: "adult",
    terms: ["porn", "sex", "naked", "nude", "xxx", "erotic", "nsfw"],
    description: "Adult or explicit content"
  }
];

export function moderateContent(text) {
  const normalized = String(text || "").toLowerCase();
  const flaggedReasons = [];

  MODERATION_RULES.forEach(rule => {
    const matches = rule.terms.filter(term => {
      // Use regex with word boundaries for more accurate matching
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      return regex.test(normalized);
    });

    if (matches.length > 0) {
      flaggedReasons.push({
        category: rule.category,
        description: rule.description,
        matches: matches
      });
    }
  });

  return {
    flagged: flaggedReasons.length > 0,
    reasons: flaggedReasons.map(r => r.description),
    details: flaggedReasons
  };
}
