"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tokenize = exports.relative = exports.secDomChords = exports.chords = exports.alteredNotes = exports.degrees = exports.scale = exports.props = exports.names = exports.fromAlter = exports.modeNames = undefined;
var _arguments = arguments;
/** @@@ KEY **/

/**
 * [![npm version](https://img.shields.io/npm/v/tonal-Key.svg?style=flat-square)](https://www.npmjs.com/package/tonal-key)
 * [![tonal](https://img.shields.io/badge/tonal-key-yellow.svg?style=flat-square)](https://www.npmjs.com/browse/keyword/tonal)
 *
 * `tonal-key` is a collection of functions to query about tonal keys.
 *
 * This is part of [tonal](https://www.npmjs.com/package/tonal) music theory library.
 *
 * @example
 * // es6
 * import * as Key from "tonal-key"
 * // es5
 * const Key = require("tonal-key")
 *
 * @example
 * Key.scale("E mixolydian") // => [ "E", "F#", "G#", "A", "B", "C#", "D" ]
 * Key.relative("minor", "C major") // => "A minor"
 *
 * @module Key
 */

var _tonalArray = require("tonal-array");

var _tonalNote = require("tonal-note");

var _tonalDistance = require("tonal-distance");

var MODES = "major dorian phrygian lydian mixolydian minor locrian ionian aeolian".split(" ");
var NUMS = [0, 1, 2, 3, 4, 5, 6, 0, 5];
var NOTES = "C D E F G A B".split(" ");
var CHORDS = "Maj7 m7 m7 Maj7 7 m7 m7b5".split(" ");
var DEGREES = "I II III IV V VI VII".split(" ");
var FIFTHS = [0, 2, 4, -1, 1, 3, 5, 0, 3];

var modenum = function modenum(mode) {
  return NUMS[MODES.indexOf(mode)];
};

/**
 * Get a list of valid mode names. The list of modes will be always in
 * increasing order (ionian to locrian)
 *
 * @function
 * @param {Boolean} alias - true to get aliases names
 * @return {Array} an array of strings
 * @example
 * Key.modes() // => [ "ionian", "dorian", "phrygian", "lydian",
 * // "mixolydian", "aeolian", "locrian" ]
 * Key.modes(true) // => [ "ionian", "dorian", "phrygian", "lydian",
 * // "mixolydian", "aeolian", "locrian", "major", "minor" ]
 */
var modeNames = exports.modeNames = function modeNames(aliases) {
  return aliases === true ? MODES.slice() : MODES.slice(0, 7);
};

/**
 * Create a major key from alterations
 *
 * @function
 * @param {Integer} alt - the alteration number (positive sharps, negative flats)
 * @return {Key} the key object
 * @example
 * Key.fromAlter(2) // => "D major"
 */
var fromAlter = exports.fromAlter = function fromAlter(i) {
  return (0, _tonalDistance.trFifths)("C", i) + " major";
};

var names = exports.names = function names() {
  var alt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 4;

  alt = Math.abs(alt);
  var result = [];
  for (var i = -alt; i <= alt; i++) {
    result.push(fromAlter(i));
  }return result;
};

var NO_KEY = Object.freeze({
  name: null,
  tonic: null,
  mode: null,
  modenum: null,
  intervals: [],
  scale: [],
  alt: null,
  acc: null
});

var properties = function properties(name) {
  var p = tokenize(name);
  if (p[0] === null) return NO_KEY;
  var k = { tonic: p[0], mode: p[1] };
  k.name = k.tonic + " " + k.mode;
  k.modenum = modenum(k.mode);
  var cs = (0, _tonalArray.rotate)(k.modenum, NOTES);
  k.alt = (0, _tonalDistance.fifths)("C", k.tonic) - FIFTHS[MODES.indexOf(k.mode)];
  k.acc = (0, _tonalNote.altToAcc)(k.alt);
  k.intervals = cs.map((0, _tonalDistance.interval)(cs[0]));
  k.scale = k.intervals.map((0, _tonalDistance.transpose)(k.tonic));
  return Object.freeze(k);
};

var memo = function memo(fn) {
  var cache = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return function (str) {
    return cache[str] || (cache[str] = fn(str));
  };
};

/**
 * Return the a key properties object with the following information:
 *
 * - name {String}: name
 * - tonic {String}: key tonic
 * - mode {String}: key mode
 * - modenum {Number}: mode number (0 major, 1 dorian, ...)
 * - intervals {Array}: the scale intervals
 * - scale {Array}: the scale notes
 * - acc {String}: accidentals of the key signature
 * - alt {Number}: alteration number (a numeric representation of accidentals)
 *
 * @function
 * @param {String} name - the key name
 * @return {Object} the key properties object or null if not a valid key
 *
 * @example
 * Key.props("C3 dorian") // => { tonic: "C", mode: "dorian", ... }
 */
var props = exports.props = memo(properties);

/**
 * Get scale of a key
 *
 * @function
 * @param {String|Object} key
 * @return {Array} the key scale
 *
 * @example
 * Key.scale("A major") // => [ "A", "B", "C#", "D", "E", "F#", "G#" ]
 * Key.scale("Bb minor") // => [ "Bb", "C", "Db", "Eb", "F", "Gb", "Ab" ]
 * Key.scale("C dorian") // => [ "C", "D", "Eb", "F", "G", "A", "Bb" ]
 * Key.scale("E mixolydian") // => [ "E", "F#", "G#", "A", "B", "C#", "D" ]
 */
var scale = exports.scale = function scale(str) {
  return props(str).scale;
};

/**
 * Get a list of key scale degrees
 * @param {String} keyName
 * @return {Array}
 * @example
 * Key.degrees("C major") => ["I", "ii", "iii", "IV", "V", "vi", "vii"]
 */
var degrees = exports.degrees = function degrees(str) {
  var p = props(str);
  if (p.name === null) return [];
  var chords = (0, _tonalArray.rotate)(p.modenum, CHORDS);
  return chords.map(function (chord, i) {
    var deg = DEGREES[i];
    return chord[0] === "m" ? deg.toLowerCase() : deg;
  });
};

/**
 * Get a list of the altered notes of a given Key. The notes will be in
 * the same order than in the key signature.
 *
 * @function
 * @param {String} key - the key name
 * @return {Array}
 *
 * @example
 * Key.alteredNotes("Eb major") // => [ "Bb", "Eb", "Ab" ]
 */
var alteredNotes = exports.alteredNotes = function alteredNotes(name) {
  var alt = props(name).alt;
  if (alt === null) return null;
  return alt === 0 ? [] : alt > 0 ? (0, _tonalArray.range)(1, alt).map((0, _tonalDistance.trFifths)("B")) : (0, _tonalArray.range)(-1, alt).map((0, _tonalDistance.trFifths)("F"));
};

/**
 * Get key chords
 *
 * @function
 * @param {String} name - the key name
 * @return {Array}
 *
 * @example
 * Key.chords("A major") // => ["AMaj7", "Bm7", "C#m7", "DMaj7", ..,]
 */
var chords = exports.chords = function chords(str) {
  var p = props(str);
  if (!p.name) return [];
  var chords = (0, _tonalArray.rotate)(p.modenum, CHORDS);
  return p.scale.map(function (tonic, i) {
    return tonic + chords[i];
  });
};

/**
 * Get secondary dominant key chords
 *
 * @function
 * @param {String} name - the key name
 * @return {Array}
 *
 * @example
 * Key.secDomChords("A major") // => ["E7", "F#7", ...]
 */

var secDomChords = exports.secDomChords = function secDomChords(name) {
  var p = props(name);
  if (!p.name) return [];
  return p.scale.map(function (t) {
    return (0, _tonalDistance.transpose)(t, "P5") + "7";
  });
};

/**
 * Get relative of a key. Two keys are relative when the have the same
 * key signature (for example C major and A minor)
 *
 * It can be partially applied.
 *
 * @function
 * @param {String} mode - the relative destination
 * @param {String} key - the key source
 *
 * @example
 * Key.relative("dorian", "B major") // => "C# dorian"
 * // partial application
 * var minor = Key.relative("minor")
 * minor("C major") // => "A minor"
 * minor("E major") // => "C# minor"
 */
var relative = exports.relative = function relative(mode, key) {
  if (_arguments.length === 1) return function (key) {
    return relative(mode, key);
  };
  var num = modenum(mode.toLowerCase());
  if (num === undefined) return null;
  var k = props(key);
  if (k.name === null) return null;
  return (0, _tonalDistance.trFifths)(k.tonic, FIFTHS[num] - FIFTHS[k.modenum]) + " " + mode;
};

/**
 * Split the key name into its components (pitch class tonic and mode name)
 *
 * @function
 * @param {String} name
 * @return {Array} an array in the form [tonic, key]
 *
 * @example
 * Key.tokenize("C major") // => ["C", "major"]
 */
var tokenize = exports.tokenize = function tokenize(name) {
  var p = (0, _tonalNote.tokenize)(name);
  p[3] = p[3].toLowerCase();
  if (p[0] === "" || MODES.indexOf(p[3]) === -1) return [null, null];
  return [p[0] + p[1], p[3]];
};
