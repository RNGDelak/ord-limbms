function getColor(input) {
  if (input === 0) {return "cyan";}
  if (input === "Lim(BMS)") {return "cyan";}
  if (input === "0") {
    return "cyan";
  }
  if (input.endsWith("0)")) {
    return "red";
  }
  return "white";
}