import { AIProvider, AIService, AIServiceConfig, ParsedRaidData, RaidRole } from "../types";
import { preprocessMessage } from "../utils/message-preprocessor";

export abstract class BaseAIService implements AIService {
  protected config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  get provider(): AIProvider {
    return this.config.provider;
  }

  abstract parseDiscordPing(message: string): Promise<ParsedRaidData>;
  abstract validateMessage(message: string): Promise<boolean>;

  protected createRaidParsingPrompt(message: string): string {
    // Pre-process message to reduce tokens
    const preprocessed = preprocessMessage(message);

    return `Parse Albion Online raid msg → JSON: {title, desc, date(ISO), time, location, requirements[], roles[{name, role, count, preAssignedUsers[], requirements[]}], maxParticipants, notes, confidence(0-1)}

Msg: "${preprocessed.content}"

Role mapping: Map all roles to these standard enum values:
- TANK: tank/protection roles (tank, stopper, guardian, etc.)
- HEALER: healing/support roles (healer, redemption, queda, sagrado, etc.)
- SUPPORT: utility/support roles (putrido, monarca, para-tempo, fb, etc.)
- RANGED_DPS: ranged damage roles (artico, canção, fura bruma, astral, aguia, dps, etc.)
- MELEE_DPS: melee damage roles (martelo, patas de urso, etc.)
- CALLER: raid caller/leader
- BATTLEMOUNT: mount roles

IMPORTANT: Map weapon/build names to their primary function:
- Staff weapons (artico, canção, fura bruma) → RANGED_DPS
- Cursed weapons (putrido) → SUPPORT
- Tank builds (stopper) → TANK
- Healing builds (healer, sagrado) → HEALER

CRITICAL: SLOT/ROLE EXTRACTION (MUST EXTRACT EVERY SLOT/ROLE/BUILD LINE)
- For EVERY line that looks like a slot, build, or role (e.g., ends with '-' or ':', or contains a build/role name), create a role entry in the roles array, even if it is empty, strange, or incomplete.
- DO NOT skip, summarize, or merge any slot/build/role line. If you do, your answer is incorrect.
- If a line contains multiple builds/roles (separated by 'OU', 'y', 'or', '/', ',', etc.), split and create a separate slot for each.
- If a user is mentioned (e.g., '<@123456>'), include them in preAssignedUsers. If not, set preAssignedUsers: [].
- Use the original name from the message for the 'name' field, and map to the closest enum for the 'role' field (TANK, HEALER, SUPPORT, RANGED_DPS, MELEE_DPS, CALLER, BATTLEMOUNT). Use UPPERCASE for enums.
- For each slot, set count=1.
- Examples:
  * 'GARRA-  <@525483737438486539>' → { name: 'GARRA', role: 'BATTLEMOUNT', count: 1, preAssignedUsers: ['525483737438486539'] }
  * 'PATAS OU GARRA-' → { name: 'PATAS', role: 'MELEE_DPS', count: 1, preAssignedUsers: [] }, { name: 'GARRA', role: 'BATTLEMOUNT', count: 1, preAssignedUsers: [] }
  * 'STOPER y FROST-  <@1235259264856232057>' → { name: 'STOPER', role: 'TANK', count: 1, preAssignedUsers: ['1235259264856232057'] }, { name: 'FROST', role: 'SUPPORT', count: 1, preAssignedUsers: ['1235259264856232057'] }
  * 'cursed,bestona ou susurrante-' → { name: 'cursed', role: 'SUPPORT', count: 1, preAssignedUsers: [] }, { name: 'bestona', role: 'RANGED_DPS', count: 1, preAssignedUsers: [] }, { name: 'susurrante', role: 'SUPPORT', count: 1, preAssignedUsers: [] }
- If you skip, merge, or summarize any slot/build/role line, your answer is incorrect.

DATE AND TIME (MAJOR):
- For the date field, ALWAYS use today's date: ${new Date().toISOString().split("T")[0]} (NOT yesterday or any other date)
- For the time field, ONLY extract if there's a clear time format like:
  * "16:30", "18:20", "8:30 PM"
  * "16h", "18h", "8h"
  * "8 PM", "6 PM"
- If no clear time is found, set time to "Not specified"
- DO NOT use location names (like "brecilien") as time values
- DO NOT use phrases like "saida quando fechar" as time values
- DO NOT use "tomorrow" or "when ready" as time values

LOCATION PARSING: PRIORITIZE departure/destination information over other location mentions, and handle MULTILINGUAL and FREE-FORM messages:
- Messages can be in ANY LANGUAGE and use free-form expressions. Look for departure/destination patterns in any language (e.g., "SAÍDA DE [LOCATION]", "DEPARTURE FROM [LOCATION]", "SALIDA DE [LOCATION]", "ВЫХОД ИЗ [LOCATION]", "出发地 [LOCATION]", etc.).
- If you find a phrase meaning "departure from" or "leaving from" or similar in any language, use the following word(s) as the location (HIGHEST PRIORITY).
- Normalize common city/location names to their standard Albion Online names (e.g., "BRECILIA", "BRECILIEN", "Brecilien", "Брецильен", "布雷西利安" → "Brecilien").
- Only if NO departure/destination info is found, then look for dungeon/activity/location names in the title or content.
- Common locations: BRECILIEN, CAERLEON, BRIDGEWATCH, FORT STERLING, LYMHURST, MARTLOCK, THETFORD

Gear: 8.1,7.3,t8,T8.1
Food: .0/.2,energia,mount 120+
Time: SAIDA,SAIDÁ,DEPARTURE,START,SALIDA,ВЫХОД,出发

IMPORTANT: For date field, ALWAYS use today's date (${new Date().toISOString().split("T")[0]}) combined with the time from the message. If only time is given (like "16:20"), use today's date with that time. Never use past dates.

Return JSON only.`;
  }

  protected validateParsedData(data: unknown): ParsedRaidData {
    // Basic validation and transformation
    const parsedData = data as Record<string, unknown>;
    const parsed: ParsedRaidData = {
      title: (parsedData.title as string) || "Raid",
      description: parsedData.description as string | undefined,
      date: new Date((parsedData.date as string | number) || Date.now()),
      time: parsedData.time as string | undefined,
      location: parsedData.location as string | undefined,
      requirements: (parsedData.requirements as string[] | undefined) || [],
      roles: (parsedData.roles as RaidRole[] | undefined) || [],
      maxParticipants: parsedData.maxParticipants as number | undefined,
      notes: parsedData.notes as string | undefined,
      confidence: Math.max(0, Math.min(1, (parsedData.confidence as number) || 0.5)),
    };

    return parsed;
  }
}
