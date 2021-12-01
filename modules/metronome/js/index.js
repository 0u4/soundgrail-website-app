window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
var timer, noteCount, accentPitch = 380, offBeatPitch = 200;
var delta = 0;
var curTime = 0.0;

// Load up dots on pageload
$("document").ready(function() {
  $(".ts-top").trigger("change");
  $("header").fitText(1, { maxFontSize: "46px" });
});


/*
  Scheduling Help by: https://www.html5rocks.com/en/tutorials/audio/scheduling/
*/
function schedule() {
  while(curTime < context.currentTime + 0.1) {
    playNote(curTime);
    updateTime();
  }
  timer = window.setTimeout(schedule, 0.1);
}

function updateTime() {
  curTime += 60.0 / parseInt($(".bpm-input").val(), 10);
  noteCount++;
}

/* Play note on a delayed interval of t */
function playNote(t) {
      var note = context.createOscillator();

      if(noteCount == parseInt($(".ts-top").val(), 10) )
        noteCount = 0;

      if( $(".counter .dot").eq(noteCount).hasClass("active") )
        note.frequency.value = accentPitch;
      else
        note.frequency.value = offBeatPitch;

      note.connect(context.destination);

      note.start(t);
      note.stop(t + 0.05);

      $(".counter .dot").attr("style", "");

      $(".counter .dot").eq(noteCount).css({
        transform: "translateY(-10px)",
        background: "#F75454"
      });
}



/* Add or subtract bpm */
$(".bpm-minus, .bpm-plus").click(function() {
  if($(this).hasClass("bpm-minus"))
    $(".bpm-input").val(parseInt($(".bpm-input").val(), 10) - 1 );
  else
    $(".bpm-input").val(parseInt($(".bpm-input").val(), 10) + 1 );
});

/* Change pitches for tones in options */
$(".beat-range, .accent-range").change(function() {
    if($(this).hasClass("beat-range"))
      offBeatPitch = $(this).val();
    else
       accentPitch = $(this).val();
});

/* Activate dots for accents */
$(document).on("click", ".counter .dot", function() {
    $(this).toggleClass("active");
});

$(".options-btn").click(function() {
  $(".options").toggleClass("options-active");
});

/* Add dots when time signature is changed */
$(".ts-top, .ts-bottom").on("change", function() {
    var _counter = $(".counter");
    _counter.html("");

    for(var i = 0; i < parseInt($(".ts-top").val(), 10); i++)
    {
      var temp = document.createElement("div");
      temp.className = "dot";

      if(i === 0)
        temp.className += " active";

      _counter.append( temp );
    }
});


/* Play and stop button */
$(".play-btn").click(function() {
  if($(this).data("what") === "pause")
  {
    // ====== Pause ====== //
    window.clearInterval(timer);
    $(".counter .dot").attr("style", "");
    $(this).data("what", "play").attr("style","").text("Play");
  }
  else {
    // ====== Play ====== //
    curTime = context.currentTime;
    noteCount = parseInt($(".ts-top").val(), 10);
    schedule();

    $(this).data("what", "pause").css({
      background: "#F75454",
      color: "#FFF"
    }).text("Stop");
  }
});

/* Tap tempo */
// $(".tap-btn").click(function() {
//     var d = new Date();
//     var temp = parseInt(d.getTime(), 10);
//
//     $(".bpm-input").val( Math.ceil(60000 / (temp - delta)) );
//     delta = temp;
// });

// document.onmousedown = function() {
//   buttonDown = true;
// };
//
// document.onmouseup = function() {
//   buttonDown = false;
// };

$('.tap-btn').on( "mousedown touchstart", function(e){

  buttonDown = true;

 })

 $('.tap-btn').on( "mouseup touchend", function(e){

   buttonDown = false;

  })
//
// $( ".tap-btn" )
//   .mouseup(function() {
//     buttonDown = false;
//
//   })
//   .mousedown(function() {
//     buttonDown = true;
//   })
//   .mouse2touch();

  $( 'body' ).keydown(function(e) {
    if (e.key === ' ' || e.key === 'Spacebar') {
      // ' ' is standard, 'Spacebar' was used by IE9 and Firefox < 37
      e.preventDefault()
      buttonDown = true;
    }
  });

  $( window ).keyup(function(e) {
    if (e.key === ' ' || e.key === 'Spacebar') {
      // ' ' is standard, 'Spacebar' was used by IE9 and Firefox < 37
      e.preventDefault()
      buttonDown = false;
    }
  });

//  -------------

// document.onmousedown = function() {
//   buttonDown = true;
// };
//
// document.onmouseup = function() {
//   buttonDown = false;
// };

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
      $(".bpm-input").val( Math.ceil(60000 / beatMS) );

    }
  }

  beatprogress = (sinceResetMS / beatMS) % 1;

  var b = Math.floor(beatprogress*20);
  var beatprog = "";
  for(var i = 0; i < 20; i++) {
    beatprog += i==b ? "|" : "-";
  }

  // update output
  // elements.beatms.html("beat length: "+beatMS);
  elements.bpm.html("bpm: "+60000/beatMS);
  // elements.millis.html("millis: "+ms);
  // elements.resetms.html("reset: "+resetMS);
  // elements.lasttapms.html("lasttap: "+lastTapMS);
  // elements.tapdurations.html("tap durations: ["+tapDurations+"]");
  // elements.tapdurationindex.html("tap duration index: "+tapDurationIndex);
  // elements.tapsinchain.html("taps in chain: "+tapsInChain);
  // elements.lasttapskipped.html("last tap skipped: "+lastTapSkipped);
  // elements.beatprogress.html("beat progress: "+parseFloat(beatprogress).toFixed(2)+" "+beatprog);

  // if a beat has occured since last loop()
  sinceResetMS = ms - resetMS;
  // if(sinceResetMS % beatMS < sinceResetMSOld % beatMS) {
  //   elements.beat.stop().css('opacity','1').animate({opacity:0},200);
  // }

  // set old vars
  buttonDownOld = buttonDown;
  sinceResetMSOld = sinceResetMS;
};

// begin loop
setInterval(loop,10);

//
// event handlers for demo
//

// document.onmousedown = function() {
//   buttonDown = true;
// };
//
// document.onmouseup = function() {
//   buttonDown = false;
// };
