function getKeyFromEvent(event) {
  if (event.preventDefault) event.preventDefault();
  return keycodes[(event.fake||window.event? event.keyCode: event.which)];
}

// Commonly used sets of keys
keydirs_adws = {
  "A": "left",
  "D": "right",
  "W": "up",
  "S": "down"
}
keydirs_lrud = { 
  "LEFT": "left",
  "RIGHT": "right",
  "UP": "up",
  "DOWN": "down"
}

// Commonly used keycodes
keycodes = {};
keycodes[37] = "LEFT";
keycodes[39] = "RIGHT";
keycodes[38] = "UP";
keycodes[40] = "DOWN";
keycodes[32] = "SPACE";
keycodes[13] = "ENTER";
keycodes[65] = "A";
keycodes[66] = "B";
keycodes[67] = "C";
keycodes[68] = "D";
keycodes[69] = "E";
keycodes[70] = "F";
keycodes[71] = "G";
keycodes[72] = "H";
keycodes[73] = "I";
keycodes[74] = "J";
keycodes[75] = "K";
keycodes[76] = "L";
keycodes[77] = "M";
keycodes[78] = "N";
keycodes[79] = "O";
keycodes[80] = "P";
keycodes[81] = "Q";
keycodes[82] = "R";
keycodes[83] = "S";
keycodes[84] = "T";
keycodes[85] = "U";
keycodes[86] = "V";
keycodes[87] = "W";
keycodes[88] = "X";
keycodes[89] = "Y";
keycodes[90] = "Z";

    