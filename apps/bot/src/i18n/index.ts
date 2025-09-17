import i18n from "i18next";

import en from "./locales/en.json";
import ptBR from "./locales/pt-BR.json";

const resources = {
  en: {
    translation: en,
  },
  "pt-BR": {
    translation: ptBR,
  },
};

// Initialize i18next
i18n.init({
  resources,
  fallbackLng: "en",
  supportedLngs: ["en", "pt-BR"],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

export function isLanguageSupported(language: string) {
  return (i18n.options.supportedLngs || [])?.includes(language) ?? false;
}

export function getFixedT(language: string) {
  return i18n.getFixedT(language);
}
