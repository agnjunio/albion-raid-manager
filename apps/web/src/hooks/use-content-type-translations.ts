import { useMemo } from "react";

import { ContentType } from "@albion-raid-manager/types";
import { CONTENT_TYPE_INFO, getContentTypeInfo } from "@albion-raid-manager/types/entities";
import { useTranslation } from "react-i18next";

export interface TranslatedContentTypeInfo {
  type: ContentType;
  displayName: string;
  description: string;
  emoji: string;
  partySize?: {
    min: number;
    max: number;
  };
  raidType: "FIXED" | "FLEX";
  defaultLocation?: string;
  aliases: string[];
  isActive: boolean;
}

/**
 * Hook to get translated content type information
 * @param contentType - The content type to translate
 * @returns Translated content type info with localized displayName and description
 */
export function useContentTypeTranslations(contentType?: ContentType | null): TranslatedContentTypeInfo | null {
  const { t } = useTranslation();

  return useMemo(() => {
    if (!contentType) return null;

    const contentTypeInfo = getContentTypeInfo(contentType);
    if (!contentTypeInfo) return null;

    return {
      ...contentTypeInfo,
      displayName: t(`contentTypes.${contentType}.displayName`, contentTypeInfo.displayName),
      description: t(`contentTypes.${contentType}.description`, contentTypeInfo.description),
    };
  }, [contentType, t]);
}

/**
 * Hook to get all translated content types
 * @param activeOnly - If true, only return active content types
 * @returns Array of translated content type info
 */
export function useAllContentTypeTranslations(activeOnly = false): TranslatedContentTypeInfo[] {
  const { t } = useTranslation();

  return useMemo(() => {
    const contentTypes = activeOnly ? CONTENT_TYPE_INFO.filter((info) => info.isActive) : CONTENT_TYPE_INFO;

    return contentTypes.map((contentTypeInfo) => ({
      ...contentTypeInfo,
      displayName: t(`contentTypes.${contentTypeInfo.type}.displayName`, contentTypeInfo.displayName),
      description: t(`contentTypes.${contentTypeInfo.type}.description`, contentTypeInfo.description),
    }));
  }, [t, activeOnly]);
}
