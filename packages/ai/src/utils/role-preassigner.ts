export interface PreAssignedRole {
  name: string;
  role: string; // The role enum value (TANK, HEALER, SUPPORT, etc.)
  confidence: number; // 0-1, how confident we are in this assignment
}

/**
 * Pre-assigns roles based on weapon/build knowledge
 * This ensures consistent role mapping regardless of AI interpretation
 */
export function preAssignRoles(slotNames: string[]): PreAssignedRole[] {
  const preAssigned: PreAssignedRole[] = [];

  for (const slotName of slotNames) {
    const lowerSlot = slotName.toLowerCase();
    const assignment = getRoleAssignment(lowerSlot);

    if (assignment) {
      preAssigned.push({
        name: slotName,
        role: assignment.role,
        confidence: assignment.confidence,
      });
    }
  }

  return preAssigned;
}

interface RoleAssignment {
  role: string; // The role enum value (TANK, HEALER, SUPPORT, etc.)
  confidence: number;
}

function getRoleAssignment(slotName: string): RoleAssignment | null {
  // Tank builds (HIGH confidence) - Multi-language support
  if (
    matchesPattern(slotName, [
      // English
      "tank",
      "guardian",
      "stopper",
      "protector",
      "defender",
      // Portuguese
      "fúnebre",
      "funebre",
      "maça",
      "maca",
      "tanque",
      "guardiao",
      // Spanish
      "tanque",
      "guardian",
      "defensor",
      "maza",
      // Russian
      "танк",
      "защитник",
      "страж",
      "щит",
      // Chinese
      "坦克",
      "守护者",
      "防御者",
      "盾牌",
      // French
      "tank",
      "gardien",
      "défenseur",
      "protecteur",
      // German
      "panzer",
      "wächter",
      "verteidiger",
      "schutz",
      // Japanese
      "タンク",
      "ガーディアン",
      "守護者",
      "防御者",
      // Korean
      "탱크",
      "가디언",
      "방어자",
      "보호자",
      // Shapeshifter Forms - Tank
      "stone golem",
      "golem",
      "earthrune",
      "bear",
      "primal",
    ])
  ) {
    return { role: "TANK", confidence: 0.95 };
  }

  // Healer builds (HIGH confidence) - Multi-language support
  if (
    matchesPattern(slotName, [
      // English
      "healer",
      "holy",
      "nature",
      "cleric",
      "priest",
      "druid",
      // Portuguese
      "healer",
      "redenção",
      "redencao",
      "sagrado",
      "queda",
      "curandeiro",
      "sacerdote",
      // Spanish
      "sanador",
      "sagrado",
      "curación",
      "sacerdote",
      "druida",
      // Russian
      "лекарь",
      "святой",
      "природный",
      "жрец",
      "друид",
      // Chinese
      "治疗师",
      "神圣",
      "自然",
      "牧师",
      "德鲁伊",
      // French
      "guérisseur",
      "saint",
      "nature",
      "prêtre",
      "druide",
      // German
      "heiler",
      "heilig",
      "natur",
      "priester",
      "druide",
      // Japanese
      "ヒーラー",
      "聖なる",
      "自然",
      "司祭",
      "ドルイド",
      // Korean
      "치유사",
      "성스러운",
      "자연",
      "사제",
      "드루이드",
    ])
  ) {
    return { role: "HEALER", confidence: 0.95 };
  }

  // Fire Staff builds (HIGH confidence) - Multi-language support
  if (
    matchesPattern(slotName, [
      // English
      "fire",
      "fireball",
      "infernal",
      "blazing",
      "flame",
      // Portuguese
      "fogo",
      "fulgurante",
      "infernal",
      "ardente",
      "chama",
      // Spanish
      "fuego",
      "infernal",
      "ardiente",
      "llama",
      "fulgurante",
      // Russian
      "огонь",
      "огненный",
      "адский",
      "пылающий",
      "пламя",
      // Chinese
      "火焰",
      "火球",
      "地狱",
      "燃烧",
      "烈焰",
      // French
      "feu",
      "infernal",
      "ardent",
      "flamme",
      "brûlant",
      // German
      "feuer",
      "höllenfeuer",
      "brennend",
      "flamme",
      "glühend",
      // Japanese
      "炎",
      "火球",
      "地獄",
      "燃える",
      "炎",
      // Korean
      "불",
      "화구",
      "지옥",
      "타오르는",
      "화염",
      // Shapeshifter Forms - Ranged DPS
      "phoenix",
      "lightcaller",
      "imp",
      "hellspawn",
    ])
  ) {
    return { role: "RANGED_DPS", confidence: 0.95 };
  }

  // Frost Staff builds (HIGH confidence) - Multi-language support
  if (
    matchesPattern(slotName, [
      // English
      "frost",
      "ice",
      "glacial",
      "frozen",
      "cold",
      // Portuguese
      "gelo",
      "ártico",
      "artico",
      "glacial",
      "congelado",
      // Spanish
      "hielo",
      "ártico",
      "glacial",
      "congelado",
      "frío",
      // Russian
      "лед",
      "арктический",
      "ледяной",
      "замороженный",
      "холодный",
      // Chinese
      "冰霜",
      "冰",
      "冰川",
      "冰冻",
      "寒冷",
      // French
      "gel",
      "arctique",
      "glacial",
      "gelé",
      "froid",
      // German
      "frost",
      "arktisch",
      "eisig",
      "gefroren",
      "kalt",
      // Japanese
      "霜",
      "氷",
      "氷河",
      "凍った",
      "寒い",
      // Korean
      "서리",
      "얼음",
      "빙하",
      "얼린",
      "차가운",
    ])
  ) {
    return { role: "RANGED_DPS", confidence: 0.95 };
  }

  // Arcane Staff builds (HIGH confidence) - Multi-language support
  if (
    matchesPattern(slotName, [
      // English
      "arcane",
      "song",
      "astral",
      "mystic",
      "enigmatic",
      // Portuguese
      "arcano",
      "canção",
      "cancao",
      "astral",
      "místico",
      // Spanish
      "arcano",
      "canción",
      "astral",
      "místico",
      "enigmático",
      // Russian
      "тайный",
      "песня",
      "астральный",
      "мистический",
      "загадочный",
      // Chinese
      "奥术",
      "歌曲",
      "星界",
      "神秘",
      "谜团",
      // French
      "arcane",
      "chanson",
      "astral",
      "mystique",
      "énigmatique",
      // German
      "arkan",
      "lied",
      "astral",
      "mystisch",
      "rätselhaft",
      // Japanese
      "秘術",
      "歌",
      "星界",
      "神秘",
      "謎",
      // Korean
      "비전",
      "노래",
      "성계",
      "신비한",
      "수수께끼",
    ])
  ) {
    return { role: "RANGED_DPS", confidence: 0.95 };
  }

  // Cursed Staff builds (MEDIUM confidence) - Multi-language support
  if (
    matchesPattern(slotName, [
      // English
      "cursed",
      "cursed staff",
      "demonic",
      "shadow",
      // Portuguese
      "maldito",
      "pútrido",
      "putrido",
      "demoníaco",
      "sombra",
      // Spanish
      "maldito",
      "pútrido",
      "demoníaco",
      "sombra",
      "corrupto",
      // Russian
      "проклятый",
      "гнилой",
      "демонический",
      "тень",
      "испорченный",
      // Chinese
      "诅咒",
      "腐烂",
      "恶魔",
      "阴影",
      "腐败",
      // French
      "maudit",
      "pourri",
      "démoniaque",
      "ombre",
      "corrompu",
      // German
      "verflucht",
      "verfault",
      "dämonisch",
      "schatten",
      "korrupt",
      // Japanese
      "呪われた",
      "腐った",
      "悪魔の",
      "影",
      "腐敗した",
      // Korean
      "저주받은",
      "썩은",
      "악마의",
      "그림자",
      "부패한",
    ])
  ) {
    return { role: "SUPPORT", confidence: 0.8 };
  }

  // Spear builds (HIGH confidence) - Multi-language support
  if (
    matchesPattern(slotName, [
      // English
      "spear",
      "pike",
      "glaive",
      "lance",
      "halberd",
      // Portuguese
      "lança",
      "lanca",
      "pique",
      "glaive",
      "alabarda",
      "garceira",
      "garceiro",
      // Spanish
      "lanza",
      "pica",
      "glaive",
      "alabarda",
      "partesana",
      // Russian
      "копье",
      "пика",
      "глефа",
      "алебарда",
      "протазан",
      // Chinese
      "长矛",
      "长枪",
      "战戟",
      "戟",
      "方天画戟",
      // French
      "lance",
      "pique",
      "glaive",
      "hallebarde",
      "pertuisane",
      // German
      "speer",
      "pike",
      "gleve",
      "hellebarde",
      "partisane",
      // Japanese
      "槍",
      "槍",
      "グレイブ",
      "ハルバード",
      "パルチザン",
      // Korean
      "창",
      "창",
      "글레이브",
      "할버드",
      "파르티잔",
      // Shapeshifter Forms - Melee DPS
      "wolf",
      "bloodmoon",
      "panther",
      "prowling",
    ])
  ) {
    return { role: "MELEE_DPS", confidence: 0.9 };
  }

  // Sword builds (HIGH confidence) - Multi-language support
  if (
    matchesPattern(slotName, [
      // English
      "sword",
      "broadsword",
      "claymore",
      "rapier",
      "katana",
      // Portuguese
      "espada",
      "claymore",
      "rapier",
      "katana",
      "sabre",
      // Spanish
      "espada",
      "claymore",
      "espada ropera",
      "katana",
      "sable",
      // Russian
      "меч",
      "клеймор",
      "рапира",
      "катана",
      "сабля",
      // Chinese
      "剑",
      "大剑",
      "细剑",
      "武士刀",
      "军刀",
      // French
      "épée",
      "claymore",
      "rapière",
      "katana",
      "sabre",
      // German
      "schwert",
      "claymore",
      "rapier",
      "katana",
      "säbel",
      // Japanese
      "剣",
      "クレイモア",
      "レイピア",
      "刀",
      "サーベル",
      // Korean
      "검",
      "클레이모어",
      "레이피어",
      "카타나",
      "세이버",
    ])
  ) {
    return { role: "MELEE_DPS", confidence: 0.9 };
  }

  // Axe builds (HIGH confidence) - Multi-language support
  if (
    matchesPattern(slotName, [
      // English
      "axe",
      "greataxe",
      "battleaxe",
      "halberd",
      "tomahawk",
      // Portuguese
      "machado",
      "machadão",
      "batalha",
      "alabarda",
      "tomahawk",
      // Spanish
      "hacha",
      "gran hacha",
      "hacha de batalla",
      "alabarda",
      "tomahawk",
      // Russian
      "топор",
      "большой топор",
      "боевой топор",
      "алебарда",
      "томагавк",
      // Chinese
      "斧头",
      "巨斧",
      "战斧",
      "戟",
      "战斧",
      // French
      "hache",
      "grande hache",
      "hache de bataille",
      "hallebarde",
      "tomahawk",
      // German
      "axt",
      "große axt",
      "kampfaxt",
      "hellebarde",
      "tomahawk",
      // Japanese
      "斧",
      "大斧",
      "戦斧",
      "ハルバード",
      "トマホーク",
      // Korean
      "도끼",
      "대도끼",
      "전투도끼",
      "할버드",
      "토마호크",
    ])
  ) {
    return { role: "MELEE_DPS", confidence: 0.9 };
  }

  // Hammer builds (HIGH confidence) - Multi-language support
  if (
    matchesPattern(slotName, [
      // English
      "hammer",
      "greathammer",
      "polehammer",
      "maul",
      "warhammer",
      // Portuguese
      "martelo",
      "martelão",
      "malho",
      "martelo de guerra",
      // Spanish
      "martillo",
      "gran martillo",
      "maza",
      "martillo de guerra",
      // Russian
      "молот",
      "большой молот",
      "кувалда",
      "боевой молот",
      // Chinese
      "锤子",
      "大锤",
      "重锤",
      "战锤",
      // French
      "marteau",
      "grand marteau",
      "maillet",
      "marteau de guerre",
      // German
      "hammer",
      "großer hammer",
      "vorschlaghammer",
      "kriegshammer",
      // Japanese
      "ハンマー",
      "大ハンマー",
      "大槌",
      "戦鎚",
      // Korean
      "망치",
      "대망치",
      "큰망치",
      "전투망치",
    ])
  ) {
    return { role: "MELEE_DPS", confidence: 0.9 };
  }

  // Mace builds (HIGH confidence) - Multi-language support
  if (
    matchesPattern(slotName, [
      // English
      "mace",
      "morning star",
      "flail",
      "club",
      "morgenstern",
      // Portuguese
      "maça",
      "maca",
      "estrela da manhã",
      "mangual",
      "clava",
      // Spanish
      "maza",
      "estrella de la mañana",
      "mangual",
      "garrote",
      "morgenstern",
      // Russian
      "булава",
      "утренняя звезда",
      "цеп",
      "дубина",
      "моргенштерн",
      // Chinese
      "钉锤",
      "晨星",
      "连枷",
      "棍棒",
      "晨星锤",
      // French
      "masse",
      "étoile du matin",
      "fléau",
      "gourdin",
      "morgenstern",
      // German
      "streitkolben",
      "morgenstern",
      "flegel",
      "keule",
      "morgenstern",
      // Japanese
      "メイス",
      "モーニングスター",
      "フレイル",
      "クラブ",
      "モルゲンシュテルン",
      // Korean
      "메이스",
      "모닝스타",
      "플레일",
      "클럽",
      "모르겐슈테른",
    ])
  ) {
    return { role: "MELEE_DPS", confidence: 0.9 };
  }

  // Fist weapons (HIGH confidence) - Multi-language support
  if (
    matchesPattern(slotName, [
      // English
      "fist",
      "fists",
      "knuckle",
      "knuckles",
      "gauntlet",
      "claw",
      // Portuguese
      "punhos",
      "punho",
      "soco",
      "socos",
      "manopla",
      "garra",
      // Spanish
      "puños",
      "puño",
      "golpe",
      "golpes",
      "guantelete",
      "garra",
      // Russian
      "кулак",
      "кулаки",
      "кастет",
      "кастеты",
      "перчатка",
      "коготь",
      // Chinese
      "拳头",
      "拳",
      "指虎",
      "指虎",
      "护手",
      "爪子",
      // French
      "poing",
      "poings",
      "brassard",
      "brassards",
      "gantelet",
      "griffe",
      // German
      "faust",
      "fäuste",
      "schlagring",
      "schlagringe",
      "panzerhandschuh",
      "klaue",
      // Japanese
      "拳",
      "拳",
      "ナックル",
      "ナックル",
      "ガントレット",
      "爪",
      // Korean
      "주먹",
      "주먹",
      "너클",
      "너클",
      "건틀릿",
      "발톱",
    ])
  ) {
    return { role: "MELEE_DPS", confidence: 0.9 };
  }

  // Dagger builds (HIGH confidence) - Multi-language support
  if (
    matchesPattern(slotName, [
      // English
      "dagger",
      "bloodletter",
      "deathgivers",
      "stiletto",
      "kris",
      // Portuguese
      "adaga",
      "sangrador",
      "doadores da morte",
      "stiletto",
      "kris",
      // Spanish
      "daga",
      "sangrador",
      "dadores de muerte",
      "estilete",
      "kris",
      // Russian
      "кинжал",
      "кровопускатель",
      "дарители смерти",
      "стилет",
      "крис",
      // Chinese
      "匕首",
      "放血者",
      "死亡给予者",
      "短剑",
      "克里斯",
      // French
      "dague",
      "saigneur",
      "donneurs de mort",
      "stiletto",
      "kris",
      // German
      "dolch",
      "aderlass",
      "todbringer",
      "stilett",
      "kris",
      // Japanese
      "短剣",
      "ブラッドレター",
      "デスギバー",
      "スティレット",
      "クリス",
      // Korean
      "단검",
      "블러드레터",
      "데스기버",
      "스틸레토",
      "크리스",
    ])
  ) {
    return { role: "MELEE_DPS", confidence: 0.9 };
  }

  // Crossbow builds (HIGH confidence) - Multi-language support
  if (
    matchesPattern(slotName, [
      // English
      "crossbow",
      "light crossbow",
      "heavy crossbow",
      "arbalest",
      "ballista",
      // Portuguese
      "besta",
      "besta leve",
      "besta pesada",
      "arbalesta",
      "balista",
      // Spanish
      "ballesta",
      "ballesta ligera",
      "ballesta pesada",
      "arbalesta",
      "balista",
      // Russian
      "арбалет",
      "легкий арбалет",
      "тяжелый арбалет",
      "арбалет",
      "баллиста",
      // Chinese
      "弩",
      "轻弩",
      "重弩",
      "弩",
      "弩炮",
      // French
      "arbalète",
      "arbalète légère",
      "arbalète lourde",
      "arbalète",
      "baliste",
      // German
      "armbrust",
      "leichte armbrust",
      "schwere armbrust",
      "armbrust",
      "balliste",
      // Japanese
      "クロスボウ",
      "軽いクロスボウ",
      "重いクロスボウ",
      "アーバレスト",
      "バリスタ",
      // Korean
      "석궁",
      "가벼운 석궁",
      "무거운 석궁",
      "아발레스트",
      "발리스타",
    ])
  ) {
    return { role: "RANGED_DPS", confidence: 0.9 };
  }

  // Bow builds (HIGH confidence) - Multi-language support
  if (
    matchesPattern(slotName, [
      // English
      "bow",
      "longbow",
      "shortbow",
      "warbow",
      "composite bow",
      // Portuguese
      "arco",
      "arco longo",
      "arco curto",
      "arco de guerra",
      "arco composto",
      "fb",
      "fura bruma",
      // Spanish
      "arco",
      "arco largo",
      "arco corto",
      "arco de guerra",
      "arco compuesto",
      // Russian
      "лук",
      "длинный лук",
      "короткий лук",
      "боевой лук",
      "составной лук",
      // Chinese
      "弓",
      "长弓",
      "短弓",
      "战弓",
      "复合弓",
      // French
      "arc",
      "arc long",
      "arc court",
      "arc de guerre",
      "arc composite",
      // German
      "bogen",
      "langbogen",
      "kurzbogen",
      "kriegsbogen",
      "kompositbogen",
      // Japanese
      "弓",
      "長弓",
      "短弓",
      "戦弓",
      "複合弓",
      // Korean
      "활",
      "장궁",
      "단궁",
      "전투활",
      "복합활",
    ])
  ) {
    return { role: "RANGED_DPS", confidence: 0.9 };
  }

  // Quarter Staff builds (MEDIUM confidence) - Multi-language support
  if (
    matchesPattern(slotName, [
      // English
      "quarter",
      "quarterstaff",
      "staff",
      "pole",
      "rod",
      // Portuguese
      "quarter",
      "quarterstaff",
      "cajado",
      "vara",
      "bastão",
      // Spanish
      "quarter",
      "quarterstaff",
      "bastón",
      "vara",
      "palo",
      // Russian
      "quarter",
      "quarterstaff",
      "посох",
      "палка",
      "жезл",
      // Chinese
      "quarter",
      "quarterstaff",
      "法杖",
      "棍",
      "杖",
      // French
      "quarter",
      "quarterstaff",
      "bâton",
      "baguette",
      "bâtonnet",
      // German
      "quarter",
      "quarterstaff",
      "stab",
      "rute",
      "stange",
      // Japanese
      "quarter",
      "quarterstaff",
      "杖",
      "棒",
      "ロッド",
      // Korean
      "quarter",
      "quarterstaff",
      "지팡이",
      "막대",
      "로드",
    ])
  ) {
    return { role: "MELEE_DPS", confidence: 0.7 };
  }

  // Support builds (MEDIUM confidence) - Multi-language support
  if (
    matchesPattern(slotName, [
      // English
      "support",
      "utility",
      "buffer",
      "debuffer",
      "time",
      "monarch",
      // Portuguese
      "suporte",
      "utilidade",
      "buffer",
      "debuffer",
      "tempo",
      "monarca",
      "paratempo",
      "para tempo",
      // Spanish
      "soporte",
      "utilidad",
      "buffer",
      "debuffer",
      "tiempo",
      "monarca",
      // Russian
      "поддержка",
      "полезность",
      "баффер",
      "дебаффер",
      "время",
      "монарх",
      // Chinese
      "支援",
      "实用",
      "增益",
      "减益",
      "时间",
      "君主",
      // French
      "soutien",
      "utilité",
      "buffer",
      "debuffer",
      "temps",
      "monarque",
      // German
      "unterstützung",
      "nützlichkeit",
      "buffer",
      "debuffer",
      "zeit",
      "monarch",
      // Japanese
      "サポート",
      "ユーティリティ",
      "バッファー",
      "デバッファー",
      "時間",
      "君主",
      // Korean
      "지원",
      "유틸리티",
      "버퍼",
      "디버퍼",
      "시간",
      "군주",
      // Shapeshifter Forms - Support/Utility
      "ent",
      "rootbound",
      "crystal cobra",
      "stillgaze",
    ])
  ) {
    return { role: "SUPPORT", confidence: 0.8 };
  }

  // Generic DPS indicators (LOW confidence) - Multi-language support
  if (
    matchesPattern(slotName, [
      // English
      "dps",
      "damage",
      "attacker",
      "striker",
      "slayer",
      // Portuguese
      "dps",
      "dano",
      "atacante",
      "golpeador",
      "matador",
      // Spanish
      "dps",
      "daño",
      "atacante",
      "golpeador",
      "asesino",
      // Russian
      "дпс",
      "урон",
      "атакующий",
      "ударник",
      "убийца",
      // Chinese
      "dps",
      "伤害",
      "攻击者",
      "打击者",
      "杀手",
      // French
      "dps",
      "dégâts",
      "attaquant",
      "frappeur",
      "tueur",
      // German
      "dps",
      "schaden",
      "angreifer",
      "schläger",
      "mörder",
      // Japanese
      "dps",
      "ダメージ",
      "攻撃者",
      "ストライカー",
      "スレイヤー",
      // Korean
      "dps",
      "데미지",
      "공격자",
      "스트라이커",
      "슬레이어",
    ])
  ) {
    return { role: "RANGED_DPS", confidence: 0.5 };
  }

  return null;
}

function matchesPattern(slotName: string, patterns: string[]): boolean {
  return patterns.some((pattern) => slotName.includes(pattern));
}
