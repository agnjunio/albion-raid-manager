export function average(...numbers: number[]) {
  return Math.round(numbers.reduce((sum, n) => sum + n, 0) / numbers.length);
}

export function digitsFormatter(num?: number) {
  if (!num) return 0;
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") || 0;
}

export function humanFormatter(num: number, digits: number) {
  const si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "m" },
    { value: 1e9, symbol: "b" },
    { value: 1e12, symbol: "t" },
    { value: 1e15, symbol: "q" },
    { value: 1e18, symbol: "Q" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}
