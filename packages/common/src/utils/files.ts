export function fileSizeFormatter(size: number) {
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(2) + " " + ["B", "KB", "MB", "GB", "TB"][i];
}

export function parseFileSize(sizeStr: string) {
  const m = sizeStr.match(/(\d+)(B|KB?|MB?|GB?|TB?)/i);
  if (!m) return sizeStr;

  const unit = `${m[2]}${!m[2].endsWith("B") ? "B" : ""}`;
  return Number.parseInt(m[1]) * Math.pow(1024, ["B", "KB", "MB", "GB", "TB"].indexOf(unit));
}
