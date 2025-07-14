export const mockAIResponses = {
  // BAU Message Response
  bau: {
    title: "BAU PVE/PVP",
    description: "Full 8.1 raid with specific requirements",
    date: new Date().toISOString(),
    time: "16:20",
    location: "BAU",
    requirements: [
      "FULL 8.1",
      "FOOD .0 E .2 PARA PVP",
      "LEVAR 10 ENERGIAS",
      "TER SPEC",
      "SABER JOGAR PVP",
      "ESCUTAR CALL",
      "LEVAR SWAP",
      "MONTARIA 120+ (QUE NÃO SEJA GARRA LIGEIRA)",
    ],
    roles: [
      { name: "TANK", count: 1, preAssignedUsers: ["@BardosaKing"] },
      { name: "PUTRIDO", count: 1, preAssignedUsers: ["@Dominickss"] },
      { name: "HEALER", count: 1, preAssignedUsers: ["@Renatinha"] },
      { name: "ARTICO", count: 1, preAssignedUsers: ["@NightHuntersx"] },
      { name: "CANÇÃO", count: 1, preAssignedUsers: ["@Lilith"] },
      { name: "FURA BRUMA", count: 1, preAssignedUsers: ["@Graiken"] },
      { name: "STOPPER", count: 1, preAssignedUsers: ["@yRegulus"] },
    ],
    maxParticipants: 7,
    notes: "SAIDA 16:20 - Full 8.1 requirements with specific gear and mount requirements",
    confidence: 0.95,
  },

  // Roads Avalon Message Response
  roadsAvalon: {
    title: "ROADS AVALON PVP/PVE",
    description: "T8 roads raid with specific gear requirements",
    date: new Date().toISOString(),
    time: "SAIDÁ ASSIM QUE FECHAR A PT",
    location: "ROADS AVALON",
    requirements: ["t8", "SAIDÁ ASSIM QUE FECHAR A PT"],
    roles: [
      {
        name: "MARTELO",
        count: 1,
        preAssignedUsers: ["@Phantonvick"],
        requirements: ["ESTRONDOSO", "ELMO GUARDIAO", "ARMADURA JUDICANTE", "SAPATOS CAVALEIROS", "NEWCAP"],
      },
      {
        name: "MONARCA",
        count: 1,
        preAssignedUsers: ["@GhostAloneVII"],
        requirements: ["BRUMARIO", "ARMADURA REAL", "ELMO BRAVURA", "BOTAS TECELÃO", "NEWCAP"],
      },
      {
        name: "REDENÇÃO/QUEDA",
        count: 1,
        preAssignedUsers: ["@Dominickss"],
        requirements: ["CLERIGO", "CAPOTE REAL", "SAPATOS MERCENARIO", "CAPA LYM"],
      },
      {
        name: "PATAS DE URSO",
        count: 1,
        preAssignedUsers: ["@D4V3OBRABO"],
        requirements: ["CASACO INFERIAL", "CAPUZ ESPREITADOR", "SAPATOS ESREITADOR", "NEWCAP"],
      },
      {
        name: "ASTRAL",
        count: 1,
        preAssignedUsers: ["@jokerwel"],
        requirements: ["ARMADURA SOLDADO", "CAPUZ ASSASSINO", "BOTAS BRAVURAS", "NEWCAP"],
      },
      {
        name: "AGUIA",
        count: 1,
        preAssignedUsers: ["@NightHuntersx"],
        requirements: ["ARMADURA SOLDADO", "CAPUZ ASSASSINO", "SAPATOS", "NEWCAP"],
      },
      {
        name: "PUTRIDO",
        count: 1,
        preAssignedUsers: ["@BIgodaoPutasso"],
        requirements: ["CASACO REAL", "BRUMARIO", "CAPUZ ASSASSINO", "SAPATOS REAIS", "NEWCAPP"],
      },
    ],
    maxParticipants: 7,
    notes: "Departure when party is full - T8 gear required",
    confidence: 0.92,
  },

  // Baú Dourado Message Response
  bauDourado: {
    title: "Baú Dourado – Saída de Brecilien",
    description: "PvE / PvP content",
    date: new Date().toISOString(),
    time: "Quando fechar",
    location: "Brecilien",
    requirements: ["T8.1 Arma", "T8.1 Roupas", "Food .0/.2+", "Energia obrigatório", "Montaria 125+", "NO MOBILETES"],
    roles: [
      { name: "Tank", count: 1, preAssignedUsers: ["@hana"] },
      { name: "Sagrado", count: 1, preAssignedUsers: ["@Metagrosszzen"] },
      { name: "Pútrido", count: 1, preAssignedUsers: ["Batman"] },
      { name: "Para-Tempo", count: 1, preAssignedUsers: ["@SiriiusBeck"] },
      { name: "FB", count: 1, preAssignedUsers: ["@LeGuiH"] },
      { name: "FB (mana)", count: 1, preAssignedUsers: ["@NatusVincere10"] },
      { name: "Canção", count: 1, preAssignedUsers: ["@Renatinha"] },
    ],
    maxParticipants: 7,
    notes: "Builds no tópico. Respeito acima de tudo. /join YameteYoY",
    confidence: 0.94,
  },

  // Invalid message response (not raid-related)
  invalid: {
    title: "Regular Chat",
    description: "This is not a raid message",
    date: new Date().toISOString(),
    confidence: 0.1,
  },
};

// Mock OpenAI API responses
export const mockOpenAIResponses = {
  bau: {
    choices: [
      {
        message: {
          content: JSON.stringify(mockAIResponses.bau),
        },
      },
    ],
    usage: {
      prompt_tokens: 150,
      completion_tokens: 200,
      total_tokens: 350,
    },
    model: "gpt-4",
  },
  roadsAvalon: {
    choices: [
      {
        message: {
          content: JSON.stringify(mockAIResponses.roadsAvalon),
        },
      },
    ],
    usage: {
      prompt_tokens: 180,
      completion_tokens: 250,
      total_tokens: 430,
    },
    model: "gpt-4",
  },
  bauDourado: {
    choices: [
      {
        message: {
          content: JSON.stringify(mockAIResponses.bauDourado),
        },
      },
    ],
    usage: {
      prompt_tokens: 200,
      completion_tokens: 300,
      total_tokens: 500,
    },
    model: "gpt-4",
  },
  invalid: {
    choices: [
      {
        message: {
          content: JSON.stringify(mockAIResponses.invalid),
        },
      },
    ],
    usage: {
      prompt_tokens: 100,
      completion_tokens: 50,
      total_tokens: 150,
    },
    model: "gpt-4",
  },
};

// Mock validation responses
export const mockValidationResponses = {
  bau: {
    choices: [
      {
        message: {
          content: "true",
        },
      },
    ],
  },
  roadsAvalon: {
    choices: [
      {
        message: {
          content: "true",
        },
      },
    ],
  },
  bauDourado: {
    choices: [
      {
        message: {
          content: "true",
        },
      },
    ],
  },
  invalid: {
    choices: [
      {
        message: {
          content: "false",
        },
      },
    ],
  },
};
