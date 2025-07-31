import type { AlbionGuildResponse, AlbionPlayerResponse, AlbionSearchResponse } from "../src/types";

import axios from "axios";
import { beforeEach, describe, expect, it, MockedFunction, vi } from "vitest";

import {
  AlbionAPIError,
  getAlbionGuild,
  getAlbionGuildKillboard,
  getAlbionPlayer,
  getAlbionPlayerKillboard,
  searchAlbionPlayers,
  verifyAlbionPlayer,
} from "../src/client";

describe("Albion API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("searchAlbionPlayers", () => {
    it("should search for players successfully", async () => {
      const mockResponse: AlbionSearchResponse = {
        players: [
          {
            Id: "test-id",
            Name: "TestPlayer",
            GuildId: "guild-id",
            GuildName: "TestGuild",
            AllianceId: "",
            AllianceName: "",
            Avatar: "",
            AvatarRing: "",
            KillFame: 1000,
            DeathFame: 500,
            FameRatio: 0.67,
            totalKills: null,
            gvgKills: null,
            gvgWon: null,
          },
        ],
        guilds: [],
      };

      (axios.get as MockedFunction<typeof axios.get>).mockResolvedValue({ data: mockResponse });

      const result = await searchAlbionPlayers("TestPlayer");

      expect(result).toEqual(mockResponse);
    });

    it("should handle API errors", async () => {
      (axios.get as MockedFunction<typeof axios.get>).mockRejectedValue(
        new AlbionAPIError("Not Found", 404, "https://api.example.com/search"),
      );

      await expect(searchAlbionPlayers("InvalidPlayer")).rejects.toThrow(AlbionAPIError);
    });
  });

  describe("getAlbionPlayer", () => {
    it("should get player details successfully", async () => {
      const mockResponse: AlbionPlayerResponse = {
        Id: "test-id",
        Name: "TestPlayer",
        GuildId: "guild-id",
        GuildName: "TestGuild",
        AllianceId: "",
        AllianceName: "",
        Avatar: "",
        AvatarRing: "",
        KillFame: 1000,
        DeathFame: 500,
        FameRatio: 0.67,
        totalKills: null,
        gvgKills: null,
        gvgWon: null,
        Equipment: {
          MainHand: null,
          OffHand: null,
          Head: null,
          Armor: null,
          Shoes: null,
          Bag: null,
          Cape: null,
          Mount: null,
          Potion: null,
          Food: null,
        },
        Inventory: [],
      };

      (axios.get as MockedFunction<typeof axios.get>).mockResolvedValue({ data: mockResponse });

      const result = await getAlbionPlayer("test-id");

      expect(result).toEqual(mockResponse);
    });
  });

  describe("getAlbionGuild", () => {
    it("should get guild details successfully", async () => {
      const mockResponse: AlbionGuildResponse = {
        Id: "guild-id",
        Name: "TestGuild",
        AllianceId: "",
        AllianceName: "",
        KillFame: 5000,
        DeathFame: 2000,
        MemberCount: 50,
        Members: [],
      };

      (axios.get as MockedFunction<typeof axios.get>).mockResolvedValue({ data: mockResponse });

      const result = await getAlbionGuild("guild-id");

      expect(result).toEqual(mockResponse);
    });
  });

  describe("verifyAlbionPlayer", () => {
    it("should verify player with exact match", async () => {
      const mockSearchResponse: AlbionSearchResponse = {
        players: [
          {
            Id: "test-id",
            Name: "TestPlayer",
            GuildId: "guild-id",
            GuildName: "TestGuild",
            AllianceId: "",
            AllianceName: "",
            Avatar: "",
            AvatarRing: "",
            KillFame: 1000,
            DeathFame: 500,
            FameRatio: 0.67,
            totalKills: null,
            gvgKills: null,
            gvgWon: null,
          },
        ],
        guilds: [],
      };

      const mockPlayerResponse: AlbionPlayerResponse = {
        Id: "test-id",
        Name: "TestPlayer",
        GuildId: "guild-id",
        GuildName: "TestGuild",
        AllianceId: "",
        AllianceName: "",
        Avatar: "",
        AvatarRing: "",
        KillFame: 1000,
        DeathFame: 500,
        FameRatio: 0.67,
        totalKills: null,
        gvgKills: null,
        gvgWon: null,
        Equipment: {
          MainHand: null,
          OffHand: null,
          Head: null,
          Armor: null,
          Shoes: null,
          Bag: null,
          Cape: null,
          Mount: null,
          Potion: null,
          Food: null,
        },
        Inventory: [],
      };

      (axios.get as MockedFunction<typeof axios.get>)
        .mockResolvedValueOnce({ data: mockSearchResponse })
        .mockResolvedValueOnce({ data: mockPlayerResponse });

      const result = await verifyAlbionPlayer("TestPlayer");

      expect(result).toEqual(mockPlayerResponse);
      expect(axios.get).toHaveBeenCalledTimes(2);
    });

    it("should return null for non-existent player", async () => {
      const mockSearchResponse: AlbionSearchResponse = {
        players: [],
        guilds: [],
      };

      (axios.get as MockedFunction<typeof axios.get>).mockResolvedValue({ data: mockSearchResponse });

      const result = await verifyAlbionPlayer("NonExistentPlayer");

      expect(result).toBeNull();
    });
  });

  describe("getAlbionPlayerKillboard", () => {
    it("should get player killboard successfully", async () => {
      const mockResponse = [
        {
          EventId: 1,
          TimeStamp: "2024-01-01T00:00:00Z",
          Killer: {} as unknown,
          Victim: {} as unknown,
          TotalVictimKillFame: 1000,
          Location: { Id: 1, Name: "Test", Type: "city" },
          Participants: [],
          GroupMembers: [],
        },
      ];

      (axios.get as MockedFunction<typeof axios.get>).mockResolvedValue({ data: mockResponse });

      const result = await getAlbionPlayerKillboard("test-id", "AMERICAS", 10);

      expect(result).toEqual(mockResponse);
    });
  });

  describe("getAlbionGuildKillboard", () => {
    it("should get guild killboard successfully", async () => {
      const mockResponse = [
        {
          EventId: 1,
          TimeStamp: "2024-01-01T00:00:00Z",
          Killer: {} as unknown,
          Victim: {} as unknown,
          TotalVictimKillFame: 1000,
          Location: { Id: 1, Name: "Test", Type: "city" },
          Participants: [],
          GroupMembers: [],
        },
      ];

      (axios.get as MockedFunction<typeof axios.get>).mockResolvedValue({ data: mockResponse });

      const result = await getAlbionGuildKillboard("guild-id", "AMERICAS", 10);

      expect(result).toEqual(mockResponse);
    });
  });
});
