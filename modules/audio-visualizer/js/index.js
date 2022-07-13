console.clear();

var https = checkHTTPS();

// dom
var $ = {};
// audio
var A = {};
// size
var S = {};
// visualizer
var V = {};

var PI = Math.PI;

// 
var heap_limit = window.performance.memory.jsHeapSizeLimit > 1200000000;
var cpu_limit = window.navigator.hardwareConcurrency >= 8;
var hi_res = heap_limit || cpu_limit || window.innerWidth > 1400;
A.fft = hi_res ? 2048 : 256;
// A.fft = 128
A.max = 200;
A.min = 100;
A.rms = 0;

S.divisible = divisible(A.fft / 4);
S.w = window.innerWidth;
S.h = window.innerHeight;
if (hi_res) {
  S.w *= 2;
  S.h *= 2;
}
S.w_rad = S.w / 2;
S.h_rad = S.h / 2;

$.cvs = document.createElement('canvas');
$.cvs_fg = document.createElement('canvas');
$.ctx = $.cvs.getContext('2d');
$.ctx_fg = $.cvs_fg.getContext('2d');
document.body.appendChild($.cvs);
document.body.appendChild($.cvs_fg);
$.cvs.width = S.w;
$.cvs_fg.width = S.w;
$.cvs.height = S.h;
$.cvs_fg.height = S.h;

V.runners = [];

// hsl color options
var COLOR = [[0, 0, 80], [0, 100, 60], [60, 100, 60], [120, 100, 60], [180, 100, 60], [240, 100, 60], [300, 100, 60], ['RANDOM', 100, 60]];

var VIS = [{ fn: dashes },
// { fn: bars },
{ fn: future }, { fn: radial, sort: sortNoZero }, { fn: solid, sort: sortDoubleInvert }, { fn: outline, sort: sortDoubleInvert },
// { fn: dots },
{ fn: lines, sort: sortDoubleInvertNoZero }, { fn: wave, data: 'getByteTimeDomainData' }, { fn: circles }, { fn: hills, keep: true }, { fn: runner, keep: true }, { fn: noise, sort: sortNoise }, { fn: squares, sort: sortTopMid }];

var curr_color = 0;
var playing = true;
var curr_vis = 0;
var color = COLOR[curr_color];
var vis = VIS[curr_vis];

randomHues();
if (https) setup();

document.body.addEventListener('keyup', function (e) {
  // 38: up, 40: down, 37: left, 39: right
  switch (e.keyCode) {
    case 27:
      toggleVis();
      break;
    case 37:
      updateVis(-1);
      break;
    case 39:
      updateVis(1);
      break;
    case 38:
      updateColor(-1);
      break;
    case 40:
      updateColor(1);
      break;
  }
});

function updateVis(dir) {
  $.ctx.clearRect(0, 0, S.w, S.h);
  if (dir === 1) curr_vis = curr_vis < VIS.length - 1 ? curr_vis + 1 : 0;else if (dir === -1) curr_vis = curr_vis > 0 ? curr_vis - 1 : VIS.length - 1;
  vis = VIS[curr_vis];
}

function updateColor(dir) {
  if (dir === 1) curr_color = curr_color < COLOR.length - 1 ? curr_color + 1 : 0;else if (dir === -1) curr_color = curr_color > 0 ? curr_color - 1 : COLOR.length - 1;
  color = COLOR[curr_color];
}

function toggleVis() {
  playing = !playing;
}

function handleAudio(stream) {
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  A.audio_ctx = new AudioContext();
  A.audio_src = A.audio_ctx.createMediaStreamSource(stream);

  A.audio_analyser = A.audio_analyser || A.audio_ctx.createAnalyser();
  A.audio_analyser.minDecibels = -80;
  A.audio_analyser.maxDecibels = 0;
  A.audio_analyser.smoothingTimeConstant = 0.9;
  A.audio_analyser.fftSize = A.fft;

  A.audio_src.connect(A.audio_analyser);

  // start the loop
  loop();
}

function setup() {
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(handleAudio).catch(streamError);
  } else {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

    if (navigator.getUserMedia) navigator.getUserMedia({ audio: true }, handleAudio, streamError);
  }

  function streamError(e) {
    console.log(e);
  }
}

function loop(e) {
  var f_arr = new Uint8Array(A.audio_analyser.frequencyBinCount);
  if (vis.data) A.audio_analyser[vis.data](f_arr);else A.audio_analyser.getByteFrequencyData(f_arr);
  if (!vis.keep) $.ctx.clearRect(0, 0, S.w, S.h);
  $.ctx_fg.clearRect(0, 0, S.w, S.h);
  $.ctx.lineWidth = 1;
  V.points1 = [];
  V.points2 = [];
  V.points3 = [];
  V.points4 = [];
  var time_domain = vis.data === 'getByteTimeDomainData';
  f_arr = Array.from(f_arr);
  if (!time_domain) f_arr = f_arr.slice(0, Math.round(f_arr.length / 2));
  f_arr = vis.sort ? vis.sort(f_arr) : sortNone(f_arr);
  // set all length related vars here because array may be bigger than before
  var arr_len = f_arr.length;
  S.squares = arr_len;
  if (arr_len <= 0 || !playing) {
    window.requestAnimationFrame(loop);
    return;
  }
  S.sq_per_row = S.divisible.y;
  S.sq_rows = S.divisible.x;
  S.sq_w = S.w / S.sq_per_row;
  S.sq_h = S.h / S.sq_rows;
  S.meter_w = S.w / S.squares;
  S.meter_max_h = S.h * 0.5;
  A.average = 0;
  var divisor = time_domain ? 1 : 2;
  // for each frequency/time data, add average
  for (var i = 0; i < arr_len / 2; i++) {
    A.average += f_arr[i];
  }A.rms = A.average / (arr_len / 2);
  A.rms /= A.max - A.min;
  for (var _i = 0; _i < arr_len; _i++) {
    var f = f_arr[_i];
    f = time_domain ? f / 256 : (f - A.min) / (A.max - A.min);
    if (f < 0) f = 0;
    vis.fn(f, _i, arr_len);
    var compare = time_domain ? f_arr[_i] : f_arr[_i];
    if (compare > A.max) A.max = compare;
    if (compare < A.min) A.min = compare;
  }
  window.requestAnimationFrame(loop);
}

/*

  vis methods
 
*/

function noise(rat, f_seq, f_count) {
  var d = S.h;
  var di = d * 0.02;

  var rel_val = (1 - rat) * S.h_rad,
      seq_pi = (f_seq - f_count * 0.75) * PI * 2,
      pi_count = seq_pi / f_count,
      f_rat = f_seq / f_count;
  var x = S.w_rad + Math.cos(pi_count) * rel_val * 0.8;
  var y = S.h_rad + Math.sin(pi_count) * rel_val * 0.8;

  var a = rat * 0.6 + 0.4;
  $.ctx.fillStyle = hsla(a, f_seq);
  $.ctx.beginPath();
  var rad = di / 2 * (rat * 0.7 + 0.3);
  $.ctx.arc(x, y, rad, 0, 2 * PI, false);
  $.ctx.fill();
}

function dots(rat, f_seq, f_count) {
  var di = S.w / f_count;

  var x = f_seq * S.meter_w + S.meter_w / 2;
  var height = S.meter_max_h * rat;
  var y1 = S.h * 0.5 - di / 2;
  var a = rat * 0.8 + 0.2;
  $.ctx.fillStyle = hsla(a, f_seq);
  $.ctx.beginPath();
  var rad = di / 2;
  $.ctx.arc(x, y1, rad, 0, 2 * PI, false);
  $.ctx.fill();
}

function lines(rat, f_seq, f_count) {
  var x = f_seq * S.meter_w + S.meter_w / 2 - 1;
  var height = S.meter_max_h * rat;
  var y = S.h * 0.5 - height / 2;
  var a = rat * 0.8 + 0.2;
  $.ctx.fillStyle = hsla(a, f_seq);
  $.ctx.fillRect(x, y, 2, height);
}

function future(rat, f_seq, f_count) {
  var x = f_seq * S.meter_w + S.meter_w / 2;
  var height = S.h;
  var y = 0;
  var a = rat;
  $.ctx.fillStyle = hsla(a, f_seq);
  $.ctx.fillRect(x, y, S.meter_w, height);
}

function circles(rat, f_seq, f_count) {
  var off = 0; //f_seq % 4 * 2 - 1
  var x = S.w_rad + off;
  var y = S.h_rad + off;
  var rad = rat * (Math.min(S.w_rad * 0.8, S.h_rad * 0.8) * 0.8);
  var a = rat;
  $.ctx.beginPath();
  $.ctx.arc(x, y, rad, 0, 2 * PI, false);
  $.ctx.strokeStyle = hsla(a, f_seq);
  $.ctx.stroke();
}

function runner(rat, f_seq, f_count) {
  var runner = V.runners[f_seq];
  if (!runner) {
    runner = {};
    runner.x = S.w_rad;
    runner.y = S.h_rad;
    runner.dir_x = 1;
    runner.dir_y = 1;
  } else if (rat < 0.2) {
    return;
  }
  var rate = rat * rat * S.w_rad * 0.1;
  var can_neg_x = runner.x > 0;
  var can_pos_x = runner.x < S.w;
  var can_neg_y = runner.y > 0;
  var can_pos_y = runner.y < S.h;
  if (can_neg_x && can_pos_x) runner.dir_x = Math.random() > 0.5 ? 1 : -1;else if (can_neg_x) runner.dir_x = -1;else runner.dir_x = 1;
  if (Math.random() > 0.6) runner.dir_x = 0;
  if (can_neg_y && can_pos_y) runner.dir_y = Math.random() > 0.5 ? 1 : -1;else if (can_neg_y) runner.dir_y = -1;else runner.dir_y = 1;
  if (Math.random() > 0.6) runner.dir_y = 0;
  var a = A.rms * 0.1;
  var new_x = runner.x + runner.dir_x * rate;
  var new_y = runner.y + runner.dir_y * rate;
  $.ctx.strokeStyle = hsla(a, Math.floor(Math.random() * V.random_hues.length));
  $.ctx.beginPath();
  $.ctx.moveTo(runner.x, runner.y);
  $.ctx.lineTo(new_x, new_y);
  $.ctx.stroke();
  runner.x = new_x;
  runner.y = new_y;
  V.runners[f_seq] = runner;
  $.ctx_fg.beginPath();
  $.ctx_fg.fillStyle = hsla(0.9, Math.floor(Math.random() * V.random_hues.length));
  $.ctx_fg.arc(runner.x, runner.y, 2, 0, 2 * PI, false);
  $.ctx_fg.closePath();
  $.ctx_fg.fill();
}

function wave(rat, f_seq, f_count) {
  var x = f_seq * S.meter_w + S.meter_w / 2;
  rat = rat - 0.5;
  rat = Math.min(0.5, Math.max(rat, -0.5));
  var h = S.h_rad;
  var y = rat * h;
  y = S.h_rad + y;

  V.points1.push(x);
  V.points1.push(y);
  if (f_seq === f_count - 1) {
    drawCurve($.ctx, V.points1, 0.5, false, 32);
    var a = A.rms * 0.8 + 0.2;
    $.ctx.strokeStyle = hsla(a, Math.floor(Math.random() * V.random_hues.length));
    $.ctx.lineWidth = 10 * A.rms;
    $.ctx.stroke();
  }
}

function hills(rat, f_seq, f_count) {
  var x = f_seq * S.meter_w + S.meter_w / 2;
  var height = S.meter_max_h * rat;
  var y1 = S.h_rad * 1.2 - height;
  var y2 = S.h_rad * 1.2 + height * 0.3;
  V.points1.push(x);
  V.points1.push(y1);
  V.points2.push(x);
  V.points2.push(y2);
  if (f_seq === f_count - 1) {
    drawCurve($.ctx, V.points1, 0.5, false, 32);
    var a = A.rms * 0.2;
    $.ctx.strokeStyle = hsla(a, Math.floor(Math.random() * V.random_hues.length));
    $.ctx.lineWidth = Math.floor(6 * A.rms);
    $.ctx.stroke();
    $.ctx.strokeStyle = hsla(a * 0.25, Math.floor(Math.random() * V.random_hues.length));
    drawCurve($.ctx, V.points2, 0.5, false, 32);
    $.ctx.stroke();
  }
}

function squares(rat, f_seq, f_count) {
  var x = f_seq % S.sq_per_row;
  var y = Math.floor(f_seq / S.sq_per_row);
  x *= S.sq_w;
  y *= S.sq_h;
  var a = rat;
  $.ctx.fillStyle = hsla(a, f_seq);
  $.ctx.fillRect(x, y, S.sq_w, S.sq_h);
}

function bars(rat, f_seq, f_count) {
  var x = f_seq * S.meter_w;
  var height = S.h * rat;
  var y = S.h - height;
  var a = rat;
  $.ctx.fillStyle = hsla(a, f_seq);
  $.ctx.fillRect(x, y, S.meter_w, height);
}

function dashes(rat, f_seq, f_count) {
  var w_rat = 0.5;
  var w = S.meter_w * w_rat;
  var x_off = (S.meter_w - w) / 2;
  var x = f_seq * S.meter_w + x_off;
  var height = S.h * rat;
  var y = S.h - height;
  var a = rat * 0.8 + 0.2;
  $.ctx.fillStyle = hsla(a, f_seq);
  $.ctx.fillRect(x, y, w, S.h);
  // $.ctx.fillStyle = hsla(1, f_seq)
  // $.ctx.fillRect(x, y, w, S.h * 0.05)
}

function solid(rat, f_seq, f_count) {
  outlinePoints(rat, f_seq, f_count, function () {
    $.ctx.fill();
  });
}

function outline(rat, f_seq, f_count) {
  outlinePoints(rat, f_seq, f_count, function () {
    $.ctx.stroke();
  }, true);
}

function outlinePoints(rat, f_seq, f_count, ctxCallback, callTwice) {
  var x1 = f_seq * S.meter_w + S.meter_w / 2;
  var height = S.meter_max_h * rat;
  var y1 = S.h * 0.5 - height / 2;
  var y2 = S.h * 0.5 + height / 2;

  V.points1.push([x1, y1]);
  V.points2.push([x1, y2]);

  if (f_seq === f_count - 1) {
    V.points2.reverse();
    var a = A.rms * 0.8 + 0.2;
    $.ctx.strokeStyle = hsla(1, Math.floor(Math.random() * A.fft));
    $.ctx.fillStyle = hsla(a, Math.floor(Math.random() * A.fft));
    $.ctx.beginPath();
    $.ctx.moveTo(V.points1[0][0], V.points1[0][1]);
    for (var p = 1; p < V.points1.length; p++) {
      $.ctx.lineTo(V.points1[p][0], V.points1[p][1]);
    }if (callTwice) {
      ctxCallback();$.ctx.beginPath();
    }
    for (var _p = 0; _p < V.points2.length; _p++) {
      $.ctx.lineTo(V.points2[_p][0], V.points2[_p][1]);
    }ctxCallback();
  }
}

function radial(rat, f_seq, f_count) {
  var rel_val = rat * S.h_rad,
      seq_pi = f_seq * PI * 2,
      pi_count = seq_pi / f_count,
      f_rat = f_seq / f_count;
  var x1 = S.w_rad + Math.cos(pi_count) * rel_val;
  var y1 = S.h_rad + Math.sin(pi_count) * rel_val;
  var x2 = S.w_rad + Math.cos(-pi_count) * rel_val;
  var y2 = S.h_rad + Math.sin(-pi_count) * rel_val;

  var x1_r = S.w - x1;
  var x2_r = S.w - x2;

  var points = [[x1, y1], [x1_r, y1], [x2, y2], [x2_r, y2]];

  var h = 0;
  var s = 0;
  var l = 80;
  var a = rat;
  $.ctx.strokeStyle = hsla(a, f_seq);
  $.ctx.beginPath();
  for (var p = 0; p < points.length; p++) {
    $.ctx.moveTo(S.w_rad, S.h_rad);
    $.ctx.lineTo(points[p][0], points[p][1]);
    $.ctx.stroke();
  }
}

function hsla(a, idx) {
  var hue = color[0] === 'RANDOM' ? V.random_hues[idx] : color[0];
  return 'hsla(' + hue + ', ' + color[1] + '%, ' + color[2] + '%, ' + a + ')';
}

function randomHues() {
  V.random_hues = [];
  for (var i = 0; i < A.fft; i++) {
    V.random_hues.push(Math.round(Math.random() * 360));
  }
}

/*

  sort methods
 
*/

function sortNone(arr) {
  return arr;
}

function sortNoZero(arr) {
  var newArr = [];
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] > 0) newArr.push(arr[i]);
  }
  return newArr;
}

function sortNoise(arr) {
  return sortDoubleInvert(sortShuffle(sortDoubleInvert(sortNoZero(arr))));
}

function sortDoubleInvertNoZero(arr) {
  return sortDoubleInvert(sortNoZero(arr));
}

function sortTopMidNoZero(arr) {
  return sortTopMid(sortNoZero(arr));
}

function sortReverse(arr) {
  arr.reverse();
  return arr;
}

function sortTopUp(arr) {
  arr = sortTopDown(arr);
  arr.reverse();
  return arr;
}

function sortTopDown(arr) {
  arr.sort();
  return arr;
}

function sortDoubleInvert(arr) {
  arr.reverse();
  arr = Array.from(arr);
  var newArr = Array.from(arr);
  newArr.reverse();
  return arr.concat(newArr);
}

function sortTopMid(arr) {
  arr = Array.from(arr);
  var newArr = [];
  // sort numerically
  arr.sort(function (a, b) {
    return a - b;
  });
  // put the biggest in new array
  newArr.push(arr.pop());
  // keep grabbing the biggest remaining item and alternate
  // between pushing and unshifting onto the new array
  while (arr.length) {
    newArr[arr.length % 2 === 0 ? 'push' : 'unshift'](arr.pop());
  }return newArr;
}

function sortShuffle(arr) {
  var currIdx = arr.length,
      tempVal = void 0,
      randIdx = void 0;
  // While there remain elements to shuffle...
  while (0 !== currIdx) {
    // Pick a remaining element...
    randIdx = Math.floor(Math.random() * currIdx);
    currIdx -= 1;
    // And swap it with the current element.
    tempVal = arr[currIdx];
    arr[currIdx] = arr[randIdx];
    arr[randIdx] = tempVal;
  }
  return arr;
}

function checkHTTPS() {
  if (location.protocol !== 'https:') {
    var el = document.createElement('div');
    el.classList.add('alert');
    var p = document.createElement('p');
    p.innerHTML = 'This pen uses your microphone which requires https. <br>';
    var a = document.createElement('a');
    a.setAttribute('href', 'https://codepen.io/jakealbaugh/pen/XNWPmv/');
    a.setAttribute('target', '_blank');
    a.innerHTML = 'Open in https';
    p.appendChild(a);
    el.appendChild(p);
    document.body.appendChild(el);
    return false;
  } else {
    return true;
  }
}

// detecting the highest two numbers that produce a number
function divisible(int, x, best) {
  best = best || { x: 0, y: 0, diff: Infinity };
  if (!x) x = int;
  var y = int / x;
  var diff = Math.abs(x - y);
  if (Math.round(y) === y && diff < best.diff) best = { x: x, y: y, diff: diff };
  if (x === 1) return best;
  return divisible(int, x - 1, best);
}

// http://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
function drawCurve(ctx, ptsa, tension, isClosed, numOfSegments, showPoints) {
  showPoints = showPoints ? showPoints : false;
  ctx.beginPath();
  drawLines(ctx, getCurvePoints(ptsa, tension, isClosed, numOfSegments));
  if (showPoints) {
    for (var i = 0; i < ptsa.length - 1; i += 2) {
      ctx.rect(ptsa[i] - 2, ptsa[i + 1] - 2, 4, 4);
    }
  }
}

function getCurvePoints(pts, tension, isClosed, numOfSegments) {
  // use input value if provided, or use a default value   
  tension = typeof tension != 'undefined' ? tension : 0.5;
  isClosed = isClosed ? isClosed : false;
  numOfSegments = numOfSegments ? numOfSegments : 16;

  var _pts = [],
      res = [],
      // clone array
  x,
      y,
      // our x,y coords
  t1x,
      t2x,
      t1y,
      t2y,
      // tension vectors
  c1,
      c2,
      c3,
      c4,
      // cardinal points
  st,
      t,
      i; // steps based on num. of segments
  // clone array so we don't change the original
  //
  _pts = pts.slice(0);
  // The algorithm require a previous and next point to the actual point array.
  // Check if we will draw closed or open curve.
  // If closed, copy end points to beginning and first points to end
  // If open, duplicate first points to befinning, end points to end
  if (isClosed) {
    _pts.unshift(pts[pts.length - 1]);
    _pts.unshift(pts[pts.length - 2]);
    _pts.unshift(pts[pts.length - 1]);
    _pts.unshift(pts[pts.length - 2]);
    _pts.push(pts[0]);
    _pts.push(pts[1]);
  } else {
    _pts.unshift(pts[1]); // copy 1. point and insert at beginning
    _pts.unshift(pts[0]);
    _pts.push(pts[pts.length - 2]); // copy last point and append
    _pts.push(pts[pts.length - 1]);
  }

  // ok, lets start..

  // 1. loop goes through point array
  // 2. loop goes through each segment between the 2 pts + 1e point before and after
  for (var _i2 = 2; _i2 < _pts.length - 4; _i2 += 2) {
    for (var _t = 0; _t <= numOfSegments; _t++) {
      // calc tension vectors
      t1x = (_pts[_i2 + 2] - _pts[_i2 - 2]) * tension;
      t2x = (_pts[_i2 + 4] - _pts[_i2]) * tension;
      t1y = (_pts[_i2 + 3] - _pts[_i2 - 1]) * tension;
      t2y = (_pts[_i2 + 5] - _pts[_i2 + 1]) * tension;
      // calc step
      st = _t / numOfSegments;
      // calc cardinals
      c1 = 2 * Math.pow(st, 3) - 3 * Math.pow(st, 2) + 1;
      c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2);
      c3 = Math.pow(st, 3) - 2 * Math.pow(st, 2) + st;
      c4 = Math.pow(st, 3) - Math.pow(st, 2);
      // calc x and y cords with common control vectors
      x = c1 * _pts[_i2] + c2 * _pts[_i2 + 2] + c3 * t1x + c4 * t2x;
      y = c1 * _pts[_i2 + 1] + c2 * _pts[_i2 + 3] + c3 * t1y + c4 * t2y;
      // store points in array
      res.push(x);
      res.push(y);
    }
  }
  return res;
}

function drawLines(ctx, pts) {
  ctx.moveTo(pts[0], pts[1]);
  for (var i = 2; i < pts.length - 1; i += 2) {
    ctx.lineTo(pts[i], pts[i + 1]);
  }
}