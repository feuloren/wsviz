export function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

export function formatPrice(price) {
  return (price / 100).toFixed(2).replace(".", ",");
}

export function formatVariation(variation) {
  var sym;
  if (variation == 0) {
    sym = "=";
  } else if (variation > 0) {
    sym = "↗";
  } else {
    sym = "↙";
  }
  return sym + " (" + (variation >= 0 ? "+" : "") + variation.toFixed(2).replace(".", ",") + "%)";
}
