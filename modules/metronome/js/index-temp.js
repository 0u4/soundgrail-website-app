//
// create HTML elements for demo
//

var output = $('#output');
var elements = [
  'tap',
  'beat',
  'beatms',
  'bpm',
  'blank',
  'newtapchain',
  'tapdurations',
  'tapdurationindex',
  'tapsinchain',
  'tapskipped',
  'lasttapskipped',
  'blank',
  'millis',
  'resetms',
  'lasttapms',
  'beatprogress'
].reduce(function(obj, ee){
  var elem = $('<span>');
  obj[ee] = elem;
  output.append(elem).append('<br>');
  return obj;
},{});

elements.beat.css('opacity',0).html('Beat');
elements.newtapchain.css('opacity',0).html('New tap chain');
elements.tap.css('opacity',0).html('Tap');
elements.tapskipped.css('opacity',0).html('Skipped tap detected');

//
// Define fake Arduino millis() function
//

var millis = function() {
  var d = new Date();
  return d.getTime();
};

//
// Constants
//

var TOTAL_TAP_VALUES = 5;
var MS_UNTIL_CHAIN_RESET = 2000;
var SKIPPED_TAP_THRESHOLD_LOW = 1.75;
var SKIPPED_TAP_THRESHOLD_HIGH = 2.75;

//
// Variables
//

var buttonDown = false;
var buttonDownOld = false;
var sinceResetMS = 0;
var sinceResetMSOld = 0;
var beatMS = 500;
var resetMS = millis();
var lastTapMS = 0;
var lastTapSkipped = false;
var beatProgress = 0;

// tapDurations will be used as though it's a fixed length C++ array, as that's where it'll end up
var tapDurations = [0, 0, 0, 0, 0];
var tapDurationIndex = 0;
var tapsInChain = 0;

//
// Functions
//

var getAverageTapDuration = function() {
  var amount = tapsInChain - 1;
  if(amount > TOTAL_TAP_VALUES) {
    amount = TOTAL_TAP_VALUES;
  }

  var runningTotal = 0;
  for(var i=0; i<amount; i++) {
    runningTotal += tapDurations[i];
  }

  return Math.floor(runningTotal / amount);
};

var tap = function(ms) {
  elements.tap.stop().css('opacity','1').animate({opacity:0},200);

  tapsInChain++;
  if(tapsInChain == 1) {
    lastTapMS = ms;
    return -1;
  }

  var duration = ms - lastTapMS;

  // detect if last duration was unreasonable
  if(tapsInChain > 1
     && !lastTapSkipped
     && duration > beatMS * SKIPPED_TAP_THRESHOLD_LOW
     && duration < beatMS * SKIPPED_TAP_THRESHOLD_HIGH) {

    elements.tapskipped.stop().css('opacity','1').animate({opacity:0},600);
    duration = Math.floor(duration * 0.5);
    lastTapSkipped = true;
  } else {
    lastTapSkipped = false;
  }

  tapDurations[tapDurationIndex] = duration;
  tapDurationIndex++;
  if(tapDurationIndex == TOTAL_TAP_VALUES) {
    tapDurationIndex = 0;
  }

  var newBeatMS = getAverageTapDuration();

  lastTapMS = ms;
  return newBeatMS;
};

var resetTapChain = function(ms) {
  tapsInChain = 0;
  tapDurationIndex = 0;
  resetMS = ms;
  for(var i=0; i<TOTAL_TAP_VALUES; i++) {
    tapDurations[i] = 0;
  }
};

var loop = function() {
  var ms = millis();

  // if a tap has occured...
  if(buttonDown && !buttonDownOld) {

    // start a new tap chain if last tap was over an amount of beats ago
    if(lastTapMS + MS_UNTIL_CHAIN_RESET < ms) {
      resetTapChain(ms);
      elements.newtapchain.stop().css('opacity','1').animate({opacity:0},600);
    }

    var newBeatMS = tap(ms);
    if(newBeatMS != -1) {
      beatMS = newBeatMS;
    }
  }

  beatprogress = (sinceResetMS / beatMS) % 1;

  var b = Math.floor(beatprogress*20);
  var beatprog = "";
  for(var i = 0; i < 20; i++) {
    beatprog += i==b ? "|" : "-";
  }

  // update output
  elements.beatms.html("beat length: "+beatMS);
  elements.bpm.html("bpm: "+60000/beatMS);
  elements.millis.html("millis: "+ms);
  elements.resetms.html("reset: "+resetMS);
  elements.lasttapms.html("lasttap: "+lastTapMS);
  elements.tapdurations.html("tap durations: ["+tapDurations+"]");
  elements.tapdurationindex.html("tap duration index: "+tapDurationIndex);
  elements.tapsinchain.html("taps in chain: "+tapsInChain);
  elements.lasttapskipped.html("last tap skipped: "+lastTapSkipped);
  elements.beatprogress.html("beat progress: "+parseFloat(beatprogress).toFixed(2)+" "+beatprog);

  // if a beat has occured since last loop()
  sinceResetMS = ms - resetMS;
  if(sinceResetMS % beatMS < sinceResetMSOld % beatMS) {
    elements.beat.stop().css('opacity','1').animate({opacity:0},200);
  }

  // set old vars
  buttonDownOld = buttonDown;
  sinceResetMSOld = sinceResetMS;
};

// begin loop
setInterval(loop,10);

//
// event handlers for demo
//

document.onmousedown = function() {
  buttonDown = true;
};

document.onmouseup = function() {
  buttonDown = false;
};
