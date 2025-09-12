import { useState } from "react";

import { validateItemPattern } from "@/lib/albion/item-validation";

interface AlbionItemIconProps {
  item?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  quality?: 1 | 2 | 3 | 4 | 5;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
};

export function AlbionItemIcon({ item, quality = 4, size = "md", className = "" }: AlbionItemIconProps) {
  const [imageError, setImageError] = useState(false);

  // If no item or invalid item, don't render anything
  if (!item || !validateItemPattern(item).isValid) {
    return null;
  }

  // If image failed to load, don't render anything
  if (imageError) {
    return null;
  }

  // Construct the Albion Render API URL
  const renderUrl = `https://render.albiononline.com/v1/item/${item}?quality=${quality}`;

  return (
    <img
      src={renderUrl}
      alt={`${item} icon`}
      className={`${sizeClasses[size]} ${className} object-contain`}
      onError={() => setImageError(true)}
      loading="lazy"
      style={{ imageRendering: "auto" }}
    />
  );
}
