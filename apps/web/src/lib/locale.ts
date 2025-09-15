import { Item, ItemLocalizations } from "@albion-raid-manager/types/services";
import { type Locale, enUS, ptBR } from "date-fns/locale";

import i18n from "@/lib/i18n";

export function getDateFnsLocale(): Locale {
  switch (i18n.language) {
    case "pt-BR":
      return ptBR;
    default:
      return enUS;
  }
}

export function getCurrentLanguage(): string {
  return i18n.language;
}

export function getShortWeekdayName(date: Date): string {
  const weekdays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const dayOfWeek = date.getDay();
  return i18n.t(`calendar.days.${weekdays[dayOfWeek]}`);
}

export function getLocalizedName(item: Item | Pick<Item, "item_id">): string {
  // Handle case where item only has item_id (partial Item object)
  if (!("localizedNames" in item) || !item.localizedNames || Object.keys(item.localizedNames).length === 0) {
    return item.item_id; // Fallback to unique name if no localization
  }

  let language: keyof ItemLocalizations = "EN-US";
  switch (getCurrentLanguage()) {
    case "pt-BR":
      language = "PT-BR";
      break;
  }

  return item.localizedNames[language] || item.localizedNames["EN-US"] || item.item_id;
}
