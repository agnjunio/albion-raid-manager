import { beforeEach, describe, expect, it, vi } from "vitest";

import { parseDiscordMessage, parseMultipleDiscordMessages, validateDiscordMessage } from "../src/parser";
import { OpenAIService } from "../src/service/providers/openai";

import { mockOpenAIResponses } from "./mocks/ai-responses";

// Mock the factory module
vi.mock("../src/service/factory");

describe("AI Service - Example Messages", () => {
  let openAIService: OpenAIService;
  let mockCreate: any;
  let mockGetAIService: any;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();

    // Create service
    openAIService = new OpenAIService({
      apiKey: "test-key",
      model: "gpt-4",
    });

    // Mock getAIService to return our test service
    const factory = await import("../src/service/factory");
    mockGetAIService = vi.mocked(factory.getAIService);
    mockGetAIService.mockReturnValue(openAIService);

    // Get the mocked create function
    mockCreate = vi.mocked(openAIService["client"].chat.completions.create);
  });

  describe("BAU Message", () => {
    const bauMessage = `✅ BAU PVE/PVP ✅ 

‼️ FULL 8.1‼️ 

‼️ FOOD .0 E .2 PARA PVP‼️ 

‼️ LEVAR 10 ENERGIAS‼️ 

‼️ TER SPEC‼️ 

‼️ SABER JOGAR PVP‼️

‼️ ESCUTAR CALL PELO AMOR DE DEUS‼️ 

‼️ LEVAR SWAP (VOU FALAR NA CALL)‼️ 

‼️ MONTARIA 120+ (QUE NÃO SEJA GARRA LIGEIRA)‼️ 

SAIDA 16:20

🛡️ TANK: @BardosaKing 
🧙‍♀️ PUTRIDO: @Dominickss 
💚 HEALER:  @Renatinha 
🧊 ARTICO: @NightHuntersx 
🔥 CANÇÃO: @Lilith 
🏹 FURA BRUMA: @Graiken 
🛑 STOPPER: @yRegulus 

@everyone`;

    it("should validate BAU message as raid-related", async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: "true" } }],
        usage: { prompt_tokens: 10, completion_tokens: 2, total_tokens: 12 },
      });

      const isValid = await validateDiscordMessage(bauMessage);

      expect(isValid).toBe(true);
    });

    it("should parse BAU message correctly", async () => {
      // Mock validation response
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: "true" } }],
        usage: { prompt_tokens: 10, completion_tokens: 2, total_tokens: 12 },
      });
      // Mock parsing response
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: mockOpenAIResponses.bau.choices[0].message.content } }],
        usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 },
      });

      const result = await parseDiscordMessage(bauMessage);

      expect(result).toEqual(
        expect.objectContaining({
          title: "BAU PVE/PVP",
          time: "16:20",
          location: "BAU",
          confidence: 0.95,
          maxParticipants: 7,
        }),
      );

      expect(result.roles).toHaveLength(7);
      expect(result.roles).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "TANK",
            count: 1,
            preAssignedUsers: ["@BardosaKing"],
          }),
          expect.objectContaining({
            name: "PUTRIDO",
            count: 1,
            preAssignedUsers: ["@Dominickss"],
          }),
        ]),
      );

      expect(result.requirements).toContain("FULL 8.1");
      expect(result.requirements).toContain("FOOD .0 E .2 PARA PVP");
    });
  });

  describe("Roads Avalon Message", () => {
    const roadsMessage = `🚦ROADS AVALON PVP/PVE 🚦

   💯@everyone💯

💥💥- SAIDÁ ASSIM QUE FECHAR A PT -💥💥

 🚉 t8! 🚉

👑(MARTELO) @Phantonvick 
ESTRONDOSO -ELMO GUARDIAO - ARMADURA JUDICANTE - SAPATOS CAVALEIROS - NEWCAP!

😎(MONARCA) @GhostAloneVII 
BRUMARIO - ARMADURA REAL - ELMO BRAVURA - BOTAS TECELÃO - NEWCAP!

😇(REDENÇÃO/QUEDA) @Dominickss 
CLERIGO - CAPOTE REAL - SAPATOS MERCENARIO - CAPA LYM!

😎(PATAS DE URSO) @D4V3OBRABO 
CASACO INFERIAL - CAPUZ ESPREITADOR - SAPATOS ESREITADOR - NEWCAP!

😎(ASTRAL) @jokerwel 
ARMADURA SOLDADO - CAPUZ ASSASSINO - BOTAS BRAVURAS - NEWCAP!

😎(AGUIA) @NightHuntersx 
ARMADURA SOLDADO - CAPUZ ASSASSINO - SAPATOS - NEWCAP!

😎(PUTRIDO) @BIgodaoPutasso 
CASACO REAL - BRUMARIO - CAPUZ ASSASSINO - SAPATOS REAIS - NEWCAPP!`;

    it("should validate Roads Avalon message as raid-related", async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: "true" } }],
        usage: { prompt_tokens: 10, completion_tokens: 2, total_tokens: 12 },
      });

      const isValid = await validateDiscordMessage(roadsMessage);

      expect(isValid).toBe(true);
    });

    it("should parse Roads Avalon message with role-specific gear requirements", async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: "true" } }],
        usage: { prompt_tokens: 10, completion_tokens: 2, total_tokens: 12 },
      });
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: mockOpenAIResponses.roadsAvalon.choices[0].message.content } }],
        usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 },
      });

      const result = await parseDiscordMessage(roadsMessage);

      expect(result).toEqual(
        expect.objectContaining({
          title: "ROADS AVALON PVP/PVE",
          time: "SAIDÁ ASSIM QUE FECHAR A PT",
          location: "ROADS AVALON",
          confidence: 0.92,
        }),
      );

      // Check role-specific gear requirements
      const marteloRole = result.roles?.find((r) => r.name === "MARTELO");
      expect(marteloRole?.requirements).toEqual([
        "ESTRONDOSO",
        "ELMO GUARDIAO",
        "ARMADURA JUDICANTE",
        "SAPATOS CAVALEIROS",
        "NEWCAP",
      ]);

      const putridoRole = result.roles?.find((r) => r.name === "PUTRIDO");
      expect(putridoRole?.requirements).toEqual([
        "CASACO REAL",
        "BRUMARIO",
        "CAPUZ ASSASSINO",
        "SAPATOS REAIS",
        "NEWCAPP",
      ]);
    });
  });

  describe("Baú Dourado Message", () => {
    const bauDouradoMessage = `:b1: Baú Dourado – Saída de Brecilien :b2:
🔹 Conteúdo: PvE / PvP
:gun: Arma: T8.1
👕 Roupas: T8.1
🍖 Food: .0/.2+
🕛 Saída: Quando fechar
✦ Composição ✦
:g_bonk: Tank: @hana 
:acs: Sagrado: @Metagrosszzen 
:skll1: Pútrido: Batman
:lace: Para-Tempo: @SiriiusBeck 
:bun2: FB: @LeGuiH 
:angelbun: FB (mana): @NatusVincere10 
:mlky: Canção:  @Renatinha 
✧ Observações ✧
:n1: Energia obrigatório.
:n2: Builds no tópico.
:n3: Montaria 125+.
:n4: Respeito acima de tudo.
:n5: 📵  NO MOBILETES!

@everyone - /join YameteYoY`;

    it("should validate Baú Dourado message as raid-related", async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: "true" } }],
        usage: { prompt_tokens: 10, completion_tokens: 2, total_tokens: 12 },
      });

      const isValid = await validateDiscordMessage(bauDouradoMessage);

      expect(isValid).toBe(true);
    });

    it("should parse Baú Dourado message with structured sections", async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: "true" } }],
        usage: { prompt_tokens: 10, completion_tokens: 2, total_tokens: 12 },
      });
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: mockOpenAIResponses.bauDourado.choices[0].message.content } }],
        usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 },
      });

      const result = await parseDiscordMessage(bauDouradoMessage);

      expect(result).toEqual(
        expect.objectContaining({
          title: "Baú Dourado – Saída de Brecilien",
          time: "Quando fechar",
          location: "Brecilien",
          confidence: 0.94,
        }),
      );

      // Check mixed user formats (with and without @)
      const tankRole = result.roles?.find((r) => r.name === "Tank");
      expect(tankRole?.preAssignedUsers).toEqual(["@hana"]);

      const putridoRole = result.roles?.find((r) => r.name === "Pútrido");
      expect(putridoRole?.preAssignedUsers).toEqual(["Batman"]); // No @ symbol

      // Check requirements
      expect(result.requirements).toContain("T8.1 Arma");
      expect(result.requirements).toContain("NO MOBILETES");

      // Check notes
      expect(result.notes).toContain("/join YameteYoY");
    });
  });

  describe("Invalid Message", () => {
    const invalidMessage = "Just a regular chat message about the weather today.";

    it("should validate invalid message as not raid-related", async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: "false" } }],
        usage: { prompt_tokens: 10, completion_tokens: 2, total_tokens: 12 },
      });

      const isValid = await validateDiscordMessage(invalidMessage);

      expect(isValid).toBe(false);
    });

    it("should throw error when parsing invalid message", async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: "false" } }],
        usage: { prompt_tokens: 10, completion_tokens: 2, total_tokens: 12 },
      });

      await expect(parseDiscordMessage(invalidMessage)).rejects.toThrow("Message does not appear to be raid-related");
    });
  });

  describe("Multiple Messages", () => {
    const messages = [
      {
        content: "Raid tonight at 8 PM!",
        context: {
          guildId: "123",
          channelId: "456",
          authorId: "789",
          messageId: "msg1",
          timestamp: new Date(),
          mentions: [],
          attachments: [],
        },
      },
      {
        content: "Just a regular chat message",
        context: {
          guildId: "123",
          channelId: "456",
          authorId: "789",
          messageId: "msg2",
          timestamp: new Date(),
          mentions: [],
          attachments: [],
        },
      },
    ];

    it("should parse multiple messages and skip invalid ones", async () => {
      // Mock responses for multiple messages
      mockCreate
        .mockResolvedValueOnce({
          choices: [{ message: { content: "true" } }],
          usage: { prompt_tokens: 10, completion_tokens: 2, total_tokens: 12 },
        })
        .mockResolvedValueOnce({
          choices: [{ message: { content: JSON.stringify({ title: "Raid", confidence: 0.9 }) } }],
          usage: { prompt_tokens: 20, completion_tokens: 30, total_tokens: 50 },
        })
        .mockResolvedValueOnce({
          choices: [{ message: { content: "false" } }],
          usage: { prompt_tokens: 10, completion_tokens: 2, total_tokens: 12 },
        });

      const results = await parseMultipleDiscordMessages(messages);

      expect(results).toHaveLength(1);
      expect(results[0].data.title).toBe("Raid");
      expect(results[0].originalMessage).toBe("Raid tonight at 8 PM!");
    });
  });
});
