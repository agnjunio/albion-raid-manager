import type { ContentType, Raid, RaidSlot } from "@albion-raid-manager/types";

import { type RaidConfiguration } from "@albion-raid-manager/types/entities";
import { raidConfigurationSchema } from "@albion-raid-manager/types/schemas";

export function exportRaidConfiguration(raid: Raid): RaidConfiguration {
  const configuration: RaidConfiguration = {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    contentType: raid.contentType || "OTHER",
    raidData: {
      description: raid.description || undefined,
      note: raid.note || undefined,
      location: raid.location || undefined,
    },
    composition: {
      slots: (raid.slots || []).map((slot: RaidSlot) => ({
        name: slot.name,
        role: slot.role || undefined,
        weapon: slot.weapon || undefined,
        comment: slot.comment || undefined,
        order: slot.order,
      })),
    },
  };

  return configuration;
}

export function downloadRaidConfiguration(configuration: RaidConfiguration, raidTitle: string): void {
  const dataStr = JSON.stringify(configuration, null, 2);
  const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  const exportFileDefaultName = `${raidTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_raid_config.json`;

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
}

export function validateRaidConfiguration(data: unknown): {
  isValid: boolean;
  configuration?: RaidConfiguration;
  error?: string;
} {
  try {
    const result = raidConfigurationSchema.safeParse(data);

    if (result.success) {
      return { isValid: true, configuration: result.data };
    } else {
      const errorMessage = result.error.issues.map((err) => `${err.path.join(".")}: ${err.message}`).join("; ");
      return { isValid: false, error: errorMessage };
    }
  } catch (error) {
    return { isValid: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export function canImportToRaid(raidContentType: ContentType | undefined, configContentType: ContentType): boolean {
  return raidContentType === configContentType;
}

export function applyRaidConfiguration(
  _currentRaid: Raid,
  configuration: RaidConfiguration,
): {
  raidUpdates: {
    description?: string;
    note?: string;
    location?: string;
  };
  slotUpdates: Array<{
    name: string;
    role?: string;
    weapon?: string;
    comment?: string;
    order?: number;
  }>;
} {
  return {
    raidUpdates: {
      description: configuration.raidData.description,
      note: configuration.raidData.note,
      location: configuration.raidData.location,
    },
    slotUpdates: configuration.composition.slots,
  };
}
