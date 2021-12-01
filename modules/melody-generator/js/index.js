//<!--JavaScript - Tabs-->

function openTool(evt, toolName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(toolName).style.display = "block";
  evt.currentTarget.className += " active";
}
// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();

// ========================
// RANDOM GENERATORS SETUP
// ========================


function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**Returns a random integer between min (inclusive) and max (inclusive)
 Using Math.round() will give you a non-uniform distribution!*/
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Random choice of element from array
function randomChoice(myArray) {
  return myArray[Math.floor(Math.random() * myArray.length)];
}

// =========================
// 1. RANDOM CHORD GENERATOR
// =========================

// Cache DOM access.
var noChords = document.getElementById("noChords");
var noProgressions = document.getElementById("noProgressions");
var generateButtonRandomCP = document.getElementById("generateRandomCP");

function chordGenerator(chNum) {
  var replaceObj = { 'Ebdim': 'D#dim', 'Abdim': 'G#dim', 'Bbdim': 'A#dim' };
  var chRoot = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  var chQuality = ['', 'm', 'dim', '+'];
  var chProg = '';
  for (var i = 0; i < chNum; i++) {
    var randRoot = randomChoice(chRoot);
    var randQuality = randomChoice(chQuality);
    var chord = randRoot + randQuality;
    if (chord in replaceObj) {
      chord = replaceObj[chord];
    }
    chProg += chord + (i < chNum - 1 ? " | " : "");
  }
  return chProg;
}

function randomChords() {
  var chNum = Number(noChords.value);
  var progNum = Number(noProgressions.value);
  if (chNum < 1) {
    chNum = 1;
  }
  if (chNum > 16) {
    chNum = 16;
  }
  if (progNum < 1) {
    progNum = 5;
  }
  if (progNum > 50) {
    progNum = 50;
  }
  var titleOutput = progNum + " Random Progressions of " + chNum + " Chords";
  var output = "";
  for (var i = 1; i <= progNum; i++) {
    output += i + "." + (i < 10 ? "\xa0\xa0\xa0" : "\xa0\xa0");
    output += chordGenerator(chNum) + "<br>";
  }
  document.getElementById("titleRandomCP").innerHTML = titleOutput;
  document.getElementById("functionRandomCP").innerHTML = output;
}

generateButtonRandomCP.addEventListener("click", randomChords);

// ===========================
// 2. RANDOM MELODY GENERATOR
// ===========================

//FORM VARIABLES - ID
var numNotesEl = document.getElementById("noNotesMelody");
var numMelodiesEl = document.getElementById("noMelodies");
var generateButtonRandomMelody = document.getElementById("generateRandomMelody");
//global
var direction = ["↑", "↓"];

function melody_d(notes) {
  /*Creates a random diatonic melody as such: ↑1 ↑3 ↑5 ↓7 ↑1 ↑2 ↓4 ↓6
    notes is an integer, how many melody notes you"d like.*/
  var melody = "";
  //generate string as such:
  // ↓6 ↑1 ↓3 ↓7 ↑4 ↑7 ↑1 ↑3 
  for (var x = 0; x < notes; x++) {
    //direction
    var randDirection = randomChoice(direction);
    // melody note = 
    var diatonic7 = getRandomInt(1, 7);
    melody += "" + randDirection + diatonic7 + " ";
  }
  return melody;
}

function melody_c(notes) {
  /*Creates a random chromatic melody as such: ↑C ↑D ↑Eb ↓F ↑G ↑C# ↓Bb ↓A
  notes is an integer, how many melody notes you"d like.
  */
  var ch_root = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  var melody = "";
  for (var x = 0; x < notes; x++) {
    // direction
    var randDirection = randomChoice(direction);
    // get melody note
    var chromatic12 = randomChoice(ch_root);
    melody += "" + randDirection + chromatic12 + " ";
  }
  return melody;
}

function createDiatonicMelody(numNotes, numMelodies) {
  var dMelody = "<ol>";
  for (var x = 0; x < numMelodies; x++) {
    dMelody += "<li>" + melody_d(numNotes) + "</li>";
  }
  dMelody += "</ol>";
  return dMelody;
}

function createChromaticMelody(numNotes, numMelodies) {
  var cMelody = "<ol>";
  for (var x = 0; x < numMelodies; x++) {
    cMelody += "<li>" + melody_c(numNotes) + "</li>";
  }
  cMelody += "</ol>";
  return cMelody;
}

function createMelodies() {
  var numNotes = numNotesEl.value;
  var numMelodies = numMelodiesEl.value;
  if (numNotes < 3) {
    numNotes = 3;
  } else if (numNotes > 30) {
    numNotes = 30;
  }
  if (numMelodies < 1) {
    numMelodies = 1;
  } else if (numMelodies > 30) {
    numMelodies = 30;
  }
  document.getElementById("titleDiatonicMelody").innerHTML = numMelodies + " Random Diatonic Melodies of " + numNotes + " Notes";
  document.getElementById("functionDiatonicMelody").innerHTML = createDiatonicMelody(numNotes, numMelodies);
  document.getElementById("titleChromaticMelody").innerHTML = numMelodies + " Random Chromatic Melodies of " + numNotes + " Notes";
  document.getElementById("functionChromaticMelody").innerHTML = createChromaticMelody(numNotes, numMelodies);
}

generateButtonRandomMelody.addEventListener("click", createMelodies);

// ===================
// 3. RANDOM RHYTHMS
// ===================

//FORM VARIABLES - ID
var timeSigSelection = document.getElementById("timeSig"); // later - .value
var typeSelection = document.getElementById("rhythmTypes"); // later - .value
var generateButtonRandomRhythm = document.getElementById("generateRandomRhythms");

function random_rhythm(note_values, sig_in) {
  /*Input: dictionary of rhythm values, time signature value (between 3/4 and 15/4)
   */
  //the key will be what's printed. key = string
  var note_str = '';
  //the value will be the calculation.  #value = float
  var note_calc = 0;
  while (sig_in - note_calc > 0) {
    var note_rdm = randomChoice(Object.keys(note_values)); //gets a string (key)
    if (sig_in == 3 / 4 && note_rdm == '3/4') {
      continue;
    }
    if (sig_in == 3 / 4 && note_rdm == '1/2') {
      continue;
    }
    note_str = note_str + note_rdm + ' ';
    note_calc = note_calc + note_values[note_rdm];
    if (sig_in - note_calc === 0) //Perfect rhythm, fits in measure.
      return note_str;
    if (sig_in - note_calc < 0) //Imperfect rhythm, over the barline.
      return '';
  }
}

// Setup
var sig_list = [['3/4', 3 / 4], ['4/4', 4 / 4], ['5/4', 5 / 4], ['6/4', 6 / 4], ['7/4', 7 / 4], ['9/4', 9 / 4], ['11/4', 11 / 4], ['12/4', 12 / 4], ['13/4', 13 / 4], ['15/4', 15 / 4]];

// [0] - duple8. [1] - duple16. [2] - triple8. [3] - triple16. [4] - mixed.
var rhythmOptions = [{ '1/2': 1 / 2, '1/4': 1 / 4, '1/8': 1 / 8, '3/4': 3 / 4 }, { '1/2': 1 / 2, '1/4': 1 / 4, '1/8': 1 / 8, '1/16': 1 / 16, '3/4': 3 / 4, '3/16': 3 / 16 }, { '1/2': 1 / 2, '1/4': 1 / 4, '1/12': 1 / 12, '3/4': 3 / 4, '1/6': 1 / 6 }, { '1/2': 1 / 2, '1/4': 1 / 4, '1/8': 1 / 8, '1/12': 1 / 12, '1/24': 1 / 24, '3/4': 3 / 4, '1/6': 1 / 6, '5/24': 5 / 24 }, { '1/2': 1 / 2, '1/4': 1 / 4, '1/8': 1 / 8, '1/12': 1 / 12, '1/16': 1 / 16, '1/24': 1 / 24, '3/4': 3 / 4, '1/6': 1 / 6, '3/16': 3 / 16, '5/24': 5 / 24 }];

// MAIN
function createRhythms() {
  var selectedRhythm = typeSelection.value;
  var note_values = void 0,
      r = void 0;

  note_values = rhythmOptions[selectedRhythm - 1];
  r = typeSelection.options[selectedRhythm - 1].text;

  var sig = timeSigSelection.value;

  var sig_in = sig - 1;
  sig = sig_list[sig_in][1];
  var s = sig_list[sig_in][0];

  // this creates an array (list) of 200 rhythms, length > 5
  var r_list = [];
  do {
    var curRhythm = random_rhythm(note_values, sig);
    if (curRhythm.length > 5) {
      r_list.push(curRhythm);
    }
  } while (r_list.length < 200);

  // converts array to string output
  var rhythmOutput = "<ol>";
  for (var num = 0; num < r_list.length; num++) {
    rhythmOutput += "<li>" + r_list[num] + "</li>";
  }
  rhythmOutput += "</ol>";

  document.getElementById("titleRhythm").innerHTML = r_list.length + " Measures of Random Rhythms - " + r + " in " + s;
  //document.getElementById("rhythmInfo1").innerHTML = "Why were " + r_list.length + " rhythms created? We had no way of predicting how which random measures would fit into one bar (and not exceed it) so we ran our algorithm 999 times. There should be enough interesting measures to choose from below.<br>";
  document.getElementById("rhythmInfo2").innerHTML = "Guide to rhythmic values: 1/2 = half note. 1/4 = quarter note. 3/4 = dotted half note. 1/16 = sixteenth note. 3/16 = dotted 8th note. 1/6 = quarter note triplet (2 tied 8th note triplets). 1/12 = 8th note triplet. 1/24 = 16th note triplet. 5/24 = 8th note tied to an 8th note triplet.<br>";
  document.getElementById("functionRhythm").innerHTML = rhythmOutput;
}

generateButtonRandomRhythm.addEventListener("click", createRhythms);

// =================================
// 4. RANDOM METER & MODE GENERATOR
// =================================

// Cache DOM access.
var generateButtonRandomMM = document.getElementById("generateRandomMM");

function gen_mode() {
  //Generates a random mode from a list. Returns a string.
  var mode_tonic = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'];
  var mode_quality = ['Major', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Locrian', 'Augmented', 'Major Bebop', 'Dorian Bebop', 'Major Pentatonic', '*Modal Pentatonic', 'Minor Pentatonic / Blues', 'Chromatic', 'Harmonic Minor', 'Melodic Minor', 'Harmonic Major', 'Diminished', 'Whole Tone'];
  //generate mode string
  var rand_tonic = randomChoice(mode_tonic);
  var rand_quality = randomChoice(mode_quality);
  var mode_string = rand_tonic + ' ' + rand_quality;
  return mode_string;
}

function gen_timesig() {
  //Generates a random time signature from a list. Returns a string.
  var time_sig = ['3/4', '4/4', '5/4', '6/8', '7/8', '9/8', '11/8', '12/8', '13/8', '15/8', '5/8', '7/4'];
  return randomChoice(time_sig);
}

function gen_tempo() {
  //Generates a random tempo in range 70 to 180 in increments of 5. Returns a 
  //string.
  return getRandomIntInclusive(0, 22) * 5 + 70;
}

function gen_feel() {
  var feel = ['Straight', 'Shuffle'];
  return randomChoice(feel);
}

function generateModeMeter() {
  var outModeMeter = "";
  for (var i = 0; i < 25; i++) {
    outModeMeter += i + 1 + "." + (i < 9 ? "\xa0\xa0\xa0" : "\xa0\xa0");
    outModeMeter += gen_mode() + " " + gen_timesig() + " " + gen_tempo() + "bpm " + gen_feel() + "<br>";
  }
  var outTip = "* A modal pentatonic is scale degrees [1, 2, 3, 5, 6] of a mode of your choosing. For example:<br>Dorian: C D Eb G A<br>Phrygian: C Db Eb G Ab<br>Major #5: C D E G# A<br>Mixolydian b6: C D E G Ab<br>Kumoijoshi (Minor): C D Eb G Ab.<br>Jan Hammer (Locrian): C Db Eb Gb Ab";

  document.getElementById("functionRandomMM").innerHTML = outModeMeter;
  document.getElementById("outTipRandomMM").innerHTML = outTip;
}

generateButtonRandomMM.addEventListener("click", generateModeMeter);