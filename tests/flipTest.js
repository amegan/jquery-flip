/*global ok:false, strictEqual:false, start:false, test:false, stop:false */

function $flip() {
  return $(':jqmData(role="flip")');
}

function getFlipObject() {
  // check internal data
  var elem = $flip().get(0);
  var flip = $.data(elem, 'plugin_flip');
  if (flip === undefined) {
    // register again
    $(':jqmData(role="flip")').flip();
    flip = $.data(elem, 'plugin_flip');
  }
  return flip;
}

function test_SplitElem() {
  var flipEffect = getFlipObject().effect;
  var $current = $($flip().get(0)).children('.flipCurrent');
  var $pager = $($flip().get(0)).children('.pager');
  var offset = $current.offset();
  var top = offset.top;
  var width = $current.parent().width();
  var height = $current.parent().height() - $pager.height();

  // -----------------------------------------------------------
  // no element passed
  var splitted = flipEffect._splitElem(null, 'custom');
  var $first = splitted.first;
  var $second = splitted.second;

  // first half
  ok($first, 'first element is created');
  strictEqual($first.attr('class'),
              'splitHalf firstHalf customFirst',
              'checked first element class');
              strictEqual($first.children().attr('class'),
                          'splitEmpty',
                          'contents of first child is custom one');

                          // second half
                          ok($second, 'second element is created');
                          strictEqual($second.attr('class'),
                                      'splitHalf secondHalf customSecond',
                                      'first element is createded');
                                      strictEqual($first.children().attr('class'),
                                                  'splitEmpty',
                                                  'contents of second child is custom one');

                                                  // clear
                                                  $('.firstHalf').replaceWith('');
                                                  $('.secondHalf').replaceWith('');

                                                  // -----------------------------------------------------------
                                                  // forwardDir == RTOL
                                                  splitted = flipEffect._splitElem($current, 'custom');
                                                  $first = splitted.first;
                                                  $second = splitted.second;

                                                  // first half
                                                  ok($first, 'RTOL: first element is created');
                                                  strictEqual($first.attr('class'),
                                                              'splitHalf firstHalf customFirst',
                                                              'RTOL: checked first element class');
                                                              strictEqual($first.children(':first').text(),
                                                                          'Page 1',
                                                                          'RTOL: contents of first child is Page 1');
                                                                          strictEqual($first.height(), height, 'RTOL: full height');
                                                                          strictEqual($first.width(), Math.floor(width / 2), 'RTOL: first half width is floored');

                                                                          // second half
                                                                          ok($second, 'RTOL: second element is created');
                                                                          strictEqual($second.attr('class'),
                                                                                      'splitHalf secondHalf customSecond',
                                                                                      'RTOL: first element is createded');
                                                                                      strictEqual($second.children(':first').text(),
                                                                                                  'Page 1',
                                                                                                  'RTOL: contents of first child is Page 1');
                                                                                                  strictEqual($second.height(), height,
                                                                                                              'RTOL: full height');
                                                                                                              strictEqual($second.width(),
                                                                                                                          Math.ceil(width / 2),
                                                                                                                          'RTOL: second half width is ceiled');
                                                                                                                          strictEqual($second.offset().left,
                                                                                                                                      Math.floor(width / 2),
                                                                                                                                      'RTOL: second half left position is floored. It must be same as first half width.');

                                                                                                                                      $('.firstHalf').replaceWith('');
                                                                                                                                      $('.secondHalf').replaceWith('');

                                                                                                                                      // -----------------------------------------------------------
                                                                                                                                      // forwardDir == LTOR
                                                                                                                                      flipEffect.options.forwardDir = 'ltor';
                                                                                                                                      var $next = $($flip().get(0)).children('.flipCurrent').next();
                                                                                                                                      splitted = flipEffect._splitElem($next, 'second');
                                                                                                                                      $first = splitted.first;
                                                                                                                                      $second = splitted.second;

                                                                                                                                      // first half
                                                                                                                                      ok($first, 'LTOR: first element is created');
                                                                                                                                      strictEqual($first.attr('class'),
                                                                                                                                                  'splitHalf firstHalf secondFirst',
                                                                                                                                                  'LTOR: checked first element class');
                                                                                                                                                  strictEqual($first.children(':first').text(),
                                                                                                                                                              'Page 2',
                                                                                                                                                              'LTOR: contents of first child is Page 2');
                                                                                                                                                              strictEqual($first.height(),
                                                                                                                                                                          height,
                                                                                                                                                                          'LTOR: full height');
                                                                                                                                                                          strictEqual($first.width(),
                                                                                                                                                                                      Math.floor(width / 2),
                                                                                                                                                                                      'LTOR: first half width is floored');

                                                                                                                                                                                      // second half
                                                                                                                                                                                      ok($second, 'LTOR: second element is created');
                                                                                                                                                                                      strictEqual($second.attr('class'),
                                                                                                                                                                                                  'splitHalf secondHalf secondSecond',
                                                                                                                                                                                                  'LTOR: first element is createded');
                                                                                                                                                                                                  strictEqual($second.children(':first').text(),
                                                                                                                                                                                                              'Page 2',
                                                                                                                                                                                                              'LTOR: contents of first child is Page 2');
                                                                                                                                                                                                              strictEqual($second.height(),
                                                                                                                                                                                                                          height,
                                                                                                                                                                                                                          'LTOR: full height');
                                                                                                                                                                                                                          strictEqual($second.width(),
                                                                                                                                                                                                                                      Math.ceil(width / 2),
                                                                                                                                                                                                                                      'LTOR: second half width is ceiled');
                                                                                                                                                                                                                                      strictEqual($second.offset().left,
                                                                                                                                                                                                                                                  Math.floor(width / 2),
                                                                                                                                                                                                                                                  'LTOR: second half left position is floored. It must be same as first half width.');

                                                                                                                                                                                                                                                  $('.firstHalf').replaceWith('');
                                                                                                                                                                                                                                                  $('.secondHalf').replaceWith('');

                                                                                                                                                                                                                                                  // -------------------------------------------------------------
                                                                                                                                                                                                                                                  // forwardDir == TTOB
                                                                                                                                                                                                                                                  flipEffect.options.forwardDir = 'ttob';
                                                                                                                                                                                                                                                  $next = $($flip().get(0)).children('.flipCurrent');

                                                                                                                                                                                                                                                  splitted = flipEffect._splitElem($next, 'custom');
                                                                                                                                                                                                                                                  $first = splitted.first;
                                                                                                                                                                                                                                                  $second = splitted.second;

                                                                                                                                                                                                                                                  // first half
                                                                                                                                                                                                                                                  ok($first, 'TTOB: first element is created');
                                                                                                                                                                                                                                                  strictEqual($first.attr('class'),
                                                                                                                                                                                                                                                              'splitHalf firstHalf customFirst',
                                                                                                                                                                                                                                                              'TTOB: checked first element class');
                                                                                                                                                                                                                                                              strictEqual($first.children(':first').text(),
                                                                                                                                                                                                                                                                          'Page 1',
                                                                                                                                                                                                                                                                          'TTOB: contents of first child is Page 1');
                                                                                                                                                                                                                                                                          strictEqual($first.height(),
                                                                                                                                                                                                                                                                                      Math.floor(height / 2),
                                                                                                                                                                                                                                                                                      'TTOB: first half height is floored');

                                                                                                                                                                                                                                                                                      // second half
                                                                                                                                                                                                                                                                                      ok($second, 'TTOB: second element is created');
                                                                                                                                                                                                                                                                                      strictEqual($second.attr('class'),
                                                                                                                                                                                                                                                                                                  'splitHalf secondHalf customSecond',
                                                                                                                                                                                                                                                                                                  'TTOB: first element is createded');
                                                                                                                                                                                                                                                                                                  strictEqual($second.children(':first').text(),
                                                                                                                                                                                                                                                                                                              'Page 1',
                                                                                                                                                                                                                                                                                                              'TTOB: contents of first child is Page 1');
                                                                                                                                                                                                                                                                                                              strictEqual($second.height(),
                                                                                                                                                                                                                                                                                                                          Math.ceil(height / 2),
                                                                                                                                                                                                                                                                                                                          'TTOB: second half height is ceiled');
                                                                                                                                                                                                                                                                                                                          strictEqual($second[0].offsetTop,
                                                                                                                                                                                                                                                                                                                                      Math.floor(height / 2),
                                                                                                                                                                                                                                                                                                                                      'TTOB: second half top positiojn is floored. It must be same as first half height.');

                                                                                                                                                                                                                                                                                                                                      $('.firstHalf').replaceWith('');
                                                                                                                                                                                                                                                                                                                                      $('.secondHalf').replaceWith('');

                                                                                                                                                                                                                                                                                                                                      // -----------------------------------------------------------
                                                                                                                                                                                                                                                                                                                                      // forwardDir == BTOT
                                                                                                                                                                                                                                                                                                                                      flipEffect.options.forwardDir = 'ttob';
                                                                                                                                                                                                                                                                                                                                      splitted = flipEffect._splitElem($current, 'custom');
                                                                                                                                                                                                                                                                                                                                      $first = splitted.first;
                                                                                                                                                                                                                                                                                                                                      $second = splitted.second;

                                                                                                                                                                                                                                                                                                                                      // first half
                                                                                                                                                                                                                                                                                                                                      ok($first, 'BTOT: first element is created');
                                                                                                                                                                                                                                                                                                                                      strictEqual($first.attr('class'),
                                                                                                                                                                                                                                                                                                                                                  'splitHalf firstHalf customFirst',
                                                                                                                                                                                                                                                                                                                                                  'BTOT: checked first element class');
                                                                                                                                                                                                                                                                                                                                                  strictEqual($first.children(':first').text(),
                                                                                                                                                                                                                                                                                                                                                              'Page 1',
                                                                                                                                                                                                                                                                                                                                                              'BTOT: contents of first child is Page 1');
                                                                                                                                                                                                                                                                                                                                                              strictEqual($first.height(),
                                                                                                                                                                                                                                                                                                                                                                          Math.floor(height / 2),
                                                                                                                                                                                                                                                                                                                                                                          'BTOT: first half height is floored');

                                                                                                                                                                                                                                                                                                                                                                          // second half
                                                                                                                                                                                                                                                                                                                                                                          ok($second, 'BTOT: second element is created');
                                                                                                                                                                                                                                                                                                                                                                          strictEqual($second.attr('class'),
                                                                                                                                                                                                                                                                                                                                                                                      'splitHalf secondHalf customSecond',
                                                                                                                                                                                                                                                                                                                                                                                      'BTOT: first element is createded');
                                                                                                                                                                                                                                                                                                                                                                                      strictEqual($second.children(':first').text(),
                                                                                                                                                                                                                                                                                                                                                                                                  'Page 1',
                                                                                                                                                                                                                                                                                                                                                                                                  'BTOT: contents of first child is Page 1');
                                                                                                                                                                                                                                                                                                                                                                                                  strictEqual($second.height(),
                                                                                                                                                                                                                                                                                                                                                                                                              Math.floor(height / 2),
                                                                                                                                                                                                                                                                                                                                                                                                              'BTOT: second half height is ceiled');
                                                                                                                                                                                                                                                                                                                                                                                                              strictEqual($second[0].offsetTop,
                                                                                                                                                                                                                                                                                                                                                                                                                          Math.floor(height / 2),
                                                                                                                                                                                                                                                                                                                                                                                                                          'BTOT: second half top positiojn is floored. It must be same as first half height.');

                                                                                                                                                                                                                                                                                                                                                                                                                          $('.firstHalf').replaceWith('');
                                                                                                                                                                                                                                                                                                                                                                                                                          $('.secondHalf').replaceWith('');


                                                                                                                                                                                                                                                                                                                                                                                                                          // reset forwardDir
                                                                                                                                                                                                                                                                                                                                                                                                                          flipEffect.options.forwardDir = 'rtol';
}

function getDumEvent(x, y) {
  return {clientX: x, clientY: y, preventDefault: function() {}};
}

function testFlipForward() {
  var flip = getFlipObject();

  var bodyWidth = document.body.clientWidth;
  var bodyHeight = document.body.clientWidth;

  var startX = Math.floor(bodyWidth * 0.8);
  var startY = Math.floor(bodyHeight * 0.5);
  var limit = Math.floor(bodyWidth * 0.7);

  // simulate mouse (touch) down
  flip.vmousedown(getDumEvent(startX, startY));

  var loop = function(step) {
    var v = -1 * step * step;

    // move mouse
    var nextX = startX + v;
    var nextY = startY + v;

    var dumEvent = getDumEvent(nextX, nextY);
    flip.vmousemove(dumEvent);

    // check mouse position
    var mousePos = flip._getClientMousePos(dumEvent);
    strictEqual(mousePos.x, nextX, 'x position is same as nextX');
    strictEqual(mousePos.y, nextY, 'y position is same as nextY');

    // check mouse movement
    var diff = flip._getMouseMovement(nextX, nextY);
    var expectDiff = v + flip.effect.START_OFFSET;
    if (Math.abs(v) < flip.effect.START_OFFSET) {
      strictEqual(diff, null,
                  'getMouseMovement should return null' +
                    'if diff is smaller than defined offset');
    } else {
                    strictEqual(diff, v + flip.effect.START_OFFSET, 'diffX and v are same');
                  }

                  // TODO: need more checking
                  // - ratio
                  // - flipping element position
                  // - shadow position and alpha
                  if (startX + v < limit) {
                    // mouseup to end interaction
                    flip.vmouseup(getDumEvent(nextX, nextY));

                    // start backward test after 700 msec
                    setTimeout(bridge, 700);
                    return;
                  } else {
                    setTimeout(function() {loop(step + 1)}, 100);
                  }
  }

  setTimeout(function() {loop(1)}, 0);
}

function bridge() {
  // check pager position
  var flip = getFlipObject();

  var $elem = $(flip.element);

  // 2nd dot (index=1) must be current
  strictEqual($elem.find('.pager span.dot').eq(1).hasClass('current'),
              true, 'Pager is set to 2nd one');

              // start new testing
              testFlipBackward();
}

function testFlipBackward() {
  var flip = getFlipObject();

  var bodyWidth = document.body.clientWidth;
  var bodyHeight = document.body.clientWidth;

  var startX = Math.floor(bodyWidth * 0.2);
  var startY = Math.floor(bodyHeight * 0.5);
  var limit = Math.floor(bodyWidth * 0.3);

  // start mouse down
  flip.vmousedown(getDumEvent(startX, startY));

  var loop = function(step) {
    var v = step * step;

    // move mouse
    var nextX = startX + v;
    var nextY = startY + v;

    var dumEvent = getDumEvent(nextX, nextY);
    flip.vmousemove(dumEvent);

    // check mouse position
    var mousePos = flip._getClientMousePos(dumEvent);
    strictEqual(mousePos.x, nextX, 'x position is same as nextX');
    strictEqual(mousePos.y, nextY, 'y position is same as nextY');

    // check mouse movement
    var diff = flip._getMouseMovement(nextX, nextY);
    var expectDiff = v + flip.effect.START_OFFSET;
    if (Math.abs(v) < flip.effect.START_OFFSET) {
      strictEqual(diff, null,
                  'getMouseMovement returns null ' +
                    'if diff is smaller than defined offset');
    } else {
                    strictEqual(diff, v - flip.effect.START_OFFSET, 'diffX and v are same');
                  }

                  // need more check on this

                  if (startX + v > limit) {
                    // mouseup to end interaction
                    flip.vmouseup(getDumEvent(nextX, nextY));

                    // start check routine after 700 msec
                    setTimeout(testEndFlipping, 700);

                    return;
                  } else {
                    setTimeout(function() {loop(step + 1)}, 100);
                  }
  }

  setTimeout(function() {loop(1)}, 0);
}

function testEndFlipping() {
  // check pager position
  var flip = getFlipObject();

  var $elem = $(flip.element);
  // 1st dot (index=0) must be current
  strictEqual($elem.find('.pager span.dot').eq(0).hasClass('current'),
              true, 'Pager is set to 1st one');

              // resume Qunit test runner
              start();
}



$(document).ready(function() {
  $.mobile.ns = 'test-';

  test('Initialization library', function() {
    ok($().flip, 'flip library is loaded.');
    ok($(':jqmData(role="flip")').flip(), 'flip library is initialized.');
  });

  test("Flip object initialization", function() {
    ok($(":jqmData(role='flip')").flip(), "flip library is initialized.");

    // check internal data
    var flipObj = getFlipObject();

    strictEqual(flipObj.options.effect, 'flip', "Default effect option is 'flip'");
    strictEqual(flipObj.options.forwardDir, 'rtol', "Default forward direction option is 'rtol'");
    strictEqual(flipObj.options.height, '424px', "Height is set to 424px in html");
    strictEqual(flipObj.options.keyboardNav, true, "Default keyboard navigation option is 'true'");
    strictEqual(flipObj.options.showPager, true, "showpager option is set to 'true'");
    strictEqual(flipObj.options.loop, true, "Default loop option is set to 'true'");

    // element check
    strictEqual($flip().children(".flipContent").length, 3, "3 elems defined as flip page");
  });

  test('Test _splitElem', test_SplitElem);

  test('Test basic flip forward/backward animation', function() {
    stop();  // stop testrunner for async test
    testFlipForward();
  });
});
