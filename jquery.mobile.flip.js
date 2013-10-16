/*
*  Project: Flip
*  Description: Flip to change the contents
*  Author: Hiro Inami
*  License: MIT License
*/


// the semi-colon before function invocation is a safety net against
// sconcatenated cripts and/or other plugins which may not be closed properly.
;(function ($, window, document, undefined) {

  // undefined is used here as the undefined global variable in ECMAScript 3 is
  // mutable (ie. it can be changed by someone else). undefined isn't really
  // being passed in so we can ensure the value of it is truly undefined.
  // In ES5, undefined can no longer be modified.

  // window and document are passed through as local variables rather than
  // globals as this (slightly) quickens the resolution process and can be
  // more efficiently minified (especially when both are regularly referenced
  // in your plugin).
  //
  var DIR_RTOL = 'rtol';
  var DIR_LTOR = 'ltor';
  var DIR_TTOB = 'ttob';
  var DIR_BTOT = 'btot';

  // Create the defaults once
  var pluginName = 'flip',
  defaults = {
    effect: 'flip',           // "flip" or "slide"
                              // (slide will be selected for non-3d
                              // transition supported browser)
    forwardDir: DIR_RTOL,     // "ltor" | "rtol" | "ttob" | "btot"
    height: '',               // height string "" means auto
    keyboardNav: true,        // flag to do support keyboard naviation
    showPager: false,         // flag to show pager
    loop: false               // flag for loop conte
  };

  var _PREFIX_DATA = 'data-';
  var _NS = 'flip-';

  var TYPE_TEXT = 0;
  var TYPE_BOOL = 1;

  var JQM_ATTRS = [
    {key: 'effect', attr: 'effect', type: TYPE_TEXT},
    {key: 'forwardDir', attr: 'forward-dir', type: TYPE_TEXT},
    {key: 'height', attr: 'height', type: TYPE_TEXT},
    {key: 'keyboardNav', attr: 'keyboard-nav', type: TYPE_BOOL},
    {key: 'showPager', attr: 'show-pager', type: TYPE_BOOL},
    {key: 'loop', attr: 'loop', type: TYPE_BOOL}
  ];

  var _FIRST_HALF = 1;
  var _SECOND_HALF = -1;

  var CSSPREFIX = '';
  var KEY_LEFT = 37;
  var KEY_RIGHT = 39;

  var CURRENT = 'flipCurrent';
  var CLASS_CURRENT = '.'+CURRENT;

  var FLIPPING_BASE_ZINDEX = 10000;

  function Flip(element, options) {
    this.START_OFFSET = 8;
    this.MAX_DISTANCE = 250;
    this.THREASHOLD_RATIO = 0.5;

    this.element = element;
    this.options = options;

    this.flippingSide = null;
    this.currentRatio = null;

    this.isInAnimation = false;

    this.flippingElement = null;
    this.backFilippingElement = null;
  }

  Flip.prototype._initShadow = function() {
    var $elem = $(this.element);
    var $cur = $elem.children(CLASS_CURRENT);
    var elemWidth = $cur.width();
    var elemHeight = $cur.height();

    var $flipShadow = $('<div class="flipShadow"></div>').hide();
    $flipShadow.css('position', 'absolute')
    .css('background-color', '#111111')
    .css('opacity', '0.9')
    .css('display', 'none')
    .css('zIndex', FLIPPING_BASE_ZINDEX);

    if (this._isVertical()) {
      $flipShadow
      .css('width', (elemWidth) + 'px')
      .css('height', (elemHeight / 2) + 'px')
      .css('top', (elemHeight / 2) + 'px')
      .css('left', '0');

    } else {
      $flipShadow
      .css('width', (elemWidth / 2) + 'px')
      .css('height', elemHeight + 'px')
      .css('left', (elemWidth / 2) + 'px')
      .css('top', '0');
    }

    return $flipShadow;
  };

  Flip.prototype._isVertical = function() {
    return (this.options.forwardDir === DIR_TTOB ||
                      this.options.forwardDir === DIR_BTOT) ? true : false;
  }

  Flip.prototype._splitElem = function($elem, customClass) {

    var $flipRoot = $(this.element);
    if ($elem === null || $elem.length === 0) {
      var rootWidth = $flipRoot.width();
      var rootHeight = $flipRoot.height();

      if (this.options.showPager) {
        var $pager = $flipRoot.children('.pager');
        rootHeight -= $pager.height();
      }

      $elem = $('<div class="splitEmpty" style="width: ' +
                rootWidth + 'px; height: ' + rootHeight + 'px;"></div>');
    }

    var isVertical = this._isVertical();

    var firstCustom = customClass + 'First';
    var secondCustom = customClass + 'Second';

    var $firstHalf = $flipRoot.children(firstCustom);
    if ($firstHalf.length === 0) {
      $firstHalf = $('<div class="splitHalf firstHalf ' +
                      firstCustom + '"></div>').css('zIndex', FLIPPING_BASE_ZINDEX);
    } else {
      $firstHalf.empty();
    }

    var $secondHalf = $flipRoot.children(secondCustom);
    if ($secondHalf.length === 0) {
      $secondHalf = $('<div class="splitHalf secondHalf ' +
                      secondCustom + '"></div>').css('zIndex', FLIPPING_BASE_ZINDEX);
    } else {
      $secondHalf.empty();
    }

    // clone object
    $firstHalf.append($elem.clone());
    $secondHalf.append($elem.clone());

    // cancel anchor click in the flipping element
    // should be find because flip effect is working here
    $firstHalf.find('a').each(function(idx, anchor) {
        $(anchor).bind("click", function(event) {
          return false;
        });
    });

    $secondHalf.find('a').each(function(idx, anchor) {
        $(anchor).bind("click", function(event) {
          return false;
        });
    });

    // adjust widht/height
    var elemWidth = $elem.width();
    var elemHeight = $elem.height();

    // for first half element
    if (isVertical) {
      $firstHalf
      .css('width', elemWidth + 'px')
      .css('height', Math.floor(elemHeight / 2) + 'px');

      $firstHalf.children(':first')
      .css('height', elemHeight + 'px')
      .css('display', 'block');
    } else {
      $firstHalf
      .css('width', Math.floor(elemWidth / 2) + 'px')
      .css('height', elemHeight + 'px');

      $firstHalf.children(':first')
      .css('width', elemWidth + 'px')
      .css('display', 'block');
    }


    // for second half element
    if (isVertical) {
      $secondHalf
      .css('width', elemWidth + 'px')
      .css('height', Math.ceil(elemHeight / 2) + 'px')
      .css('top', Math.floor(elemHeight / 2) + 'px');

      $secondHalf.children(':first')
      .css('height', elemHeight + 'px')
      .css('display', 'block')
      .css('top', -1 * Math.floor(elemHeight / 2) + 'px');
    } else {
      $secondHalf
      .css('width', Math.ceil(elemWidth / 2) + 'px')
      .css('height', elemHeight + 'px')
      .css('left', Math.floor(elemWidth / 2) + 'px');

      $secondHalf.children(':first')
      .css('width', elemWidth + 'px')
      .css('display', 'block')
      .css('left', -1 * Math.floor(elemWidth / 2) + 'px');
    }

    if ($flipRoot.children(firstCustom).length === 0) {
      $flipRoot.append($firstHalf);
    }

    if ($flipRoot.children(secondCustom).length === 0) {
      $flipRoot.append($secondHalf);
    }

    return {first: $firstHalf, second: $secondHalf};
  }

  Flip.prototype.init = function(flippingSide) {
    // this.currentRatio must be null
    if (this.currentRatio !== null) {
      return;
    }

    // init currentRatio value
    this.currentRatio = 0;
    this.flippingSide = flippingSide;

    var $elem = $(this.element);

    // find currently shown element
    var $cur = $elem.children(CLASS_CURRENT);
    var $underContent = null;
    var $flippingElem = null
    var $flippingBackElem = null;

    if (this.options.forwardDir === DIR_LTOR && flippingSide === _FIRST_HALF ||
        this.options.forwardDir === DIR_RTOL && flippingSide === _SECOND_HALF ||
        this.options.forwardDir === DIR_TTOB && flippingSide === _FIRST_HALF ||
        this.options.forwardDir === DIR_BTOT && flippingSide === _SECOND_HALF) {
      $underContent = this.getNextContent($cur);
    } else {
      $underContent = this.getPrevContent($cur);
    }

    var back = this._splitElem($underContent, 'back');
    var front = this._splitElem($cur, 'front');

    if (flippingSide === _SECOND_HALF) {
      $flippingElem = front.second;
      $flippingBackElem = back.first;
    } else {
      $flippingElem = front.first;
      $flippingBackElem = back.second;
    }

    this.flippingElement = $flippingElem;
    this.backFilippingElement = $flippingBackElem;

    // set zIndex
    $flippingElem.css('zIndex', FLIPPING_BASE_ZINDEX+1);
    $flippingBackElem.css('zIndex', FLIPPING_BASE_ZINDEX);

    // hide flipShadow first, otherwise dark area could be visible
    var $flipShadow = this._initShadow();

    if (this._isVertical()) {
      // add class
      $flippingElem.addClass('verticalFlipping');
      $flippingBackElem.addClass('verticalFlipping');

      if (flippingSide === _FIRST_HALF) {
        $flipShadow.css('top', '0px');
      }
    } else {
      $flippingElem.addClass('holizontalFlipping');
      $flippingBackElem.addClass('holizontalFlipping');

      if (flippingSide === _FIRST_HALF) {
        $flipShadow.css('left', '0px');
      }
    }

    $elem.append($flipShadow);

    // create flip element for page forward
    $flippingElem.addClass('flipping');
    $flippingBackElem.addClass('backflipping');

    // flip start
    $cur = $elem.children(CLASS_CURRENT);
    $cur.removeClass(CURRENT);
    $cur.addClass('working');

    $flipShadow.show();
  }

  Flip.prototype.step = function(ratio) {
    var $working = $(this.element).children('.working');
    if ($working.length === 0) {
      return;
    }

    this.currentRatio = ratio;

    var $flipping = this.flippingElement;
    var $backFlipping = this.backFilippingElement;

    // move page element
    var transformKey = CSSPREFIX + 'Transform';
    $flipping.css(transformKey, this._calculateFlipRotateCSS(ratio));
    $backFlipping.css(transformKey, this._calculateBackFlipRotateCSS(ratio));

    // control which side is visible and flipShadow div
    // basically, it is just y = -1.2*x^2 + 1.2
    var formula = function(p) {
      var factor = 1.2;
      return -1 * factor * (p - 1) * (p - 1) + factor;
    }

    var $elem = $(this.element);
    var elemHeight = $flipping.height();
    var flipShadowRatio = 0;

    var degree = Math.abs(180 * ratio);
    if (degree > 90) {
      $flipping.css('zIndex', FLIPPING_BASE_ZINDEX);
      $backFlipping.css('zIndex', FLIPPING_BASE_ZINDEX+1);

      if ($backFlipping.css('display') === 'none') {
        $backFlipping.css('display', 'block');
        $flipping.css('display', 'none');
      }

      // move flipShadow position (right-to-left or left-to-right)
      if (this._isVertical()) {
        if (this.flippingSide === _SECOND_HALF) {
          $('.flipShadow').css('top', '0');
        } else {
          $('.flipShadow').css('top', elemHeight + 'px');
        }
      } else {
        if (this.flippingSide === _SECOND_HALF) {
          $('.flipShadow').css('left', '0');
        } else {
          $('.flipShadow').css('left', '50%');
        }
      }


      // set new flipShadow
      flipShadowRatio = Math.max(0, 1 - formula((180 - degree) / 90));
      $('.flipShadow').css('opacity', 0.9 * flipShadowRatio);

    } else {
      $flipping.css('zIndex', FLIPPING_BASE_ZINDEX+1);
      $backFlipping.css('zIndex', FLIPPING_BASE_ZINDEX);

      if ($flipping.css('display') === 'none') {
        $backFlipping.css('display', 'none');
        $flipping.css('display', 'block');
      }

      if (this._isVertical()) {
        if (this.flippingSide === _SECOND_HALF) {
          // vertical flipshadow must calculate height based on the
          // flipping object because pager area affect height=50%
          $('.flipShadow').css('top', elemHeight + 'px');
        } else {
          $('.flipShadow').css('top', '0');
        }
      } else {
        if (this.flippingSide === _SECOND_HALF) {
          $('.flipShadow').css('left', '50%');
        } else {
          $('.flipShadow').css('left', '0');
        }
      }

      flipShadowRatio = Math.max(0, 1 - formula((degree) / 90));
      $('.flipShadow').css('opacity', 0.9 * flipShadowRatio);
    }
  }

  Flip.prototype._calculateFlipRotateCSS = function (ratio)
  {
    if (this._isVertical()) {
       return 'rotateX(' + (-1 * 180 * ratio) + 'deg)';
    } else {
       return 'rotateY(' + (180 * ratio) + 'deg)';
    }
  }

  Flip.prototype._calculateBackFlipRotateCSS = function(ratio)
  {
    if (this._isVertical()) {
      if (this.flippingSide === _FIRST_HALF) {
        return 'rotateX(' + (-1 * (180 + (180 * ratio))) + 'deg)';
      } else {
        return 'rotateX(' + (180 - (180 * ratio)) + 'deg)';
      }
    } else {
      if (this.flippingSide === _FIRST_HALF) {
        return 'rotateY(' + (180 + (180 * ratio)) + 'deg)';
      } else {
        return 'rotateY(' + (-1 * (180 - (180 * ratio))) + 'deg)';
      }
    }
  }


  Flip.prototype.actionBK = function(to) {
    var endRatio = to;
    var startRatio = this.currentRatio;

    // get propert rotateX or rotateY setting
    var $flipping = this.flippingElement;
    var $backFlipping = this.backFilippingElement;

    // insert this into the
    $flipping.addClass("flipAction");
    $backFlipping.addClass("flipBackAction");

    // insert keyframe
    var flipStartRotate = this._calculateFlipRotateCSS(startRatio);
    var flipEndRotate = this._calculateFlipRotateCSS(endRatio);

    var keyframe = '@keyframes flip {';
    keyframe += '0% {'+flipStartRotate+';}';
    keyframe += '100% {'+flipEndRotate+';}';
    keyframe += '}';

    // FIXME: needs to control z-index or visibility

    // add event listener to remove animation after animation finished


  }

  // This can be done by complete css animation. That should be faster.
  Flip.prototype.action = function(to) {
    var endRatio = to;
    var startRatio = this.currentRatio;

    var _this = this;
    var x = 0;
    var b = Math.abs(this.currentRatio);
    var c = Math.abs(to - this.currentRatio);
    var d = c;

    var sign = 1;
    if (this.currentRatio < 0) {
      sign = -1;
    } else if (this.currentRatio === 0) {
      if (endRatio < 0) {
        sign = -1;
      }
    }

    var formulaA = function(t) {
      // simple version of quadratic easeOut
      t = Math.abs(t) / d;
      return -1 * c * t * (t - 2) + b;
    }

    var formula = function(t) {
      // simple version of cubic easeOut
      t = Math.abs(t) / d;
      t = t - 1;
      return c * (t * t * t + 1) + b;
    }

    if (to === 0) {
      // replace start and end so that same logic can be used
      b = 0;
    }

    var loop = function() {
      // to next step
      x = Math.min(1, x + 0.05);
      var y = Math.min(1.0, formula(x));
      if (endRatio === 0) {
        // set next ratio to the reverse direction
        y = Math.abs(startRatio) - y;
      }

      // next ratio
      if (sign < 0) {
        y = -1 * y;
      }

      _this.step(y);

      // call until ratio is 1
      if (x + 0.05 < d) {
        setTimeout(loop, 20);
      } else {
        // to omit last step
        _this.currentRatio = endRatio;

        // end callback
        _this.cleanup();
      }
    }

    this.isInAnimation = true;
    loop();
  }

  Flip.prototype.cleanup = function() {

    var $elem = $(this.element);
    var $current = $elem.children('.working');

    // clear flip elem
    $('.flipShadow').replaceWith('');
    $('.firstHalf').replaceWith('');
    $('.secondHalf').replaceWith('');

    var $nextCurrent = $current;
    if (this.options.forwardDir === DIR_LTOR &&
        this.flippingSide === _FIRST_HALF ||
        this.options.forwardDir === DIR_RTOL &&
        this.flippingSide === _SECOND_HALF ||
        this.options.forwardDir === DIR_TTOB &&
        this.flippingSide === _FIRST_HALF ||
        this.options.forwardDir === DIR_BTOT &&
        this.flippingSide === _SECOND_HALF) {
      if (Math.abs(this.currentRatio) === 1) {
        $nextCurrent = this.getNextContent($current);
      }
    } else {
      if (Math.abs(this.currentRatio) === 1) {
        $nextCurrent = this.getPrevContent($current);
      }
    }

    // to avoid flushing screen, add .current class first
    // then remove .working class
    $nextCurrent.addClass(CURRENT);
    $current.removeClass('working');

    //
    if (typeof(this.options.didEndFlip) === 'function') {
      this.options.didEndFlip();
    }

    this.currentRatio = null;
    this.flippingSide = null;
    this.isInAnimation = false;
  }

  Flip.prototype.getNextContent = function($current) {

    var $nextCurrent = $current.next('.flipContent');
    if ($nextCurrent.length === 0 && this.options.loop) {
      var $elem = $(this.element);
      $nextCurrent = $elem.children('.flipContent').first();
    }

    return ($nextCurrent.length === 0) ? $() : $nextCurrent;
  }

  Flip.prototype.getPrevContent = function($current) {
    var $prevCurrent = $current.prev('.flipContent');
    if ($prevCurrent.length === 0 && this.options.loop) {
      var $elem = $(this.element);
      $prevCurrent = $elem.children('.flipContent').last();
    }

    return ($prevCurrent.length === 0) ? $() : $prevCurrent;
  }

  Flip.prototype.shouldTransitionContinue = function(ratio, context) {
    var td1 = 1, td2 = 1;
    var d1 = 0, d2 = 0;

    if (context.tList.length >= 2) {
      td1 = context.tList[context.tList.length - 1];
      td2 = context.tList[context.tList.length - 2];

      d1 = context.dList[context.dList.length - 1];
      d2 = context.dList[context.dList.length - 2];
    } else if (context.tList.length === 1) {
      td1 = context.tList[context.tList.length - 1];

      d1 = context.dList[context.dList.length - 1];
    }

    var now = new Date().getTime();
    var lastTDiff = (now - context.lastInfo.time) / 100;
    var factor = (lastTDiff < 1) ? 1 : 1 / (10 * lastTDiff * lastTDiff);

    var origRatio = ratio;
    ratio = ratio + factor * ((d1 / td1) + (d2 / td2));
    //console.log("LastTDiff "+lastTDiff+" Factor: "
    //+factor+" Orig Ratio: "+origRatio+" Final Ratio: "+ratio);

    // adjust value
    if (this.flippingSide === _FIRST_HALF)
    {
      ratio = Math.max(0, Math.min(1, ratio));
    }
    else
    {
      ratio = Math.max(-1, Math.min(0, ratio));
    }

    return (Math.abs(ratio) > this.THREASHOLD_RATIO);
  }

  function Slide(element, options) {
    this.element = element;
    this.options = options;

    this.slideSide = null;
    this.currentRatio = null;

    this.START_OFFSET = 3;
    this.MAX_DISTANCE = 400; // must be initialized at this.init()

    this.isInAnimation = false;
  }

  Slide.prototype.init = function(slideSide) {
    // this.currentRatio must be null
    if (this.currentRatio !== null) {
      return;
    }

    if (this.options.forwardDir === DIR_RTOL ||
        this.options.forwardDir === DIR_LTOR) {
      this.MAX_DISTANCE = $(this.element).width();
    } else {
      this.MAX_DISTANCE = $(this.element).height();
    }

    this.THREASHOLD_RATIO = Math.min(0.15, 100 / this.MAX_DISTANCE);

    // init currentDiff value
    this.currentRatio = 0;
    this.slideSide = slideSide;

    var $elem = $(this.element);

    var $cur = $elem.children(CLASS_CURRENT);
    var $nextContent = null;
    var $flippingElem, $flippingBackElem;
    var isNext = false;

    if (this.options.forwardDir === DIR_LTOR && slideSide === _FIRST_HALF ||
        this.options.forwardDir === DIR_RTOL && slideSide === _SECOND_HALF ||
        this.options.forwardDir === DIR_TTOB && slideSide === _FIRST_HALF ||
        this.options.forwardDir === DIR_BTOT && slideSide === _SECOND_HALF) {
      $nextContent = this.getNextContent($cur);
      isNext = true;
    } else {
      $nextContent = this.getPrevContent($cur);
    }

    if ($nextContent === null) {
      $nextContent = $();
    }

    // create copy
    var $slidingBg = $('.slidingBg');
    if ($slidingBg.length === 0) {
      $slidingBg = $('<div class="slidingBg"></div>');
    } else {
      $slidingBg.empty();
    }

    $slidingBg.hide();

    if (isNext) {
      $elem.append($slidingBg.append($nextContent.clone()));
    } else {
      $elem.append($slidingBg.append($cur.clone()));
    }

    $slidingBg.css('width', $cur.width() + 'px');
    $slidingBg.css('height', $cur.height() + 'px');
    $slidingBg.children(':first').css('display', 'block');

    var $sliding = $('.sliding');
    if ($sliding.length === 0) {
      $sliding = $('<div class="sliding"></div>');
    } else {
      $sliding.empty();
    }

    if (isNext) {
      $elem.append($sliding.append($cur.clone()));
    } else {
      $elem.append($sliding.append($nextContent.clone()));
    }

    $sliding.css('width', $cur.width() + 'px')
            .css('height', $cur.height() + 'px')
            .css('zIndex', FLIPPING_BASE_ZINDEX);

    if (!isNext) {
      switch (this.options.forwardDir) {
        case DIR_RTOL:
          $sliding.css('left', -1 * this.MAX_DISTANCE + 'px');
          break;

        case DIR_LTOR:
          $sliding.css('left', this.MAX_DISTANCE + 'px');
          break;

        case DIR_TTOB:
          $sliding.css('top', this.MAX_DISTANCE + 'px');
          break;

        case DIR_BTOT:
          $sliding.css('top', -1 * this.MAX_DISTANCE + 'px');
          break;
      }
    }

    $sliding.children(':first').css('display', 'block');


    // slide start
    $cur = $elem.children(CLASS_CURRENT);
    $cur.removeClass(CURRENT);
    $cur.addClass('working');

    $slidingBg.show();

    //$slideShadow.show();
  }

  Slide.prototype.step = function(ratio) {
    this.currentRatio = ratio;
    var distance = this.MAX_DISTANCE * ratio;

    var $elem = $(this.element);
    var $sliding = $elem.children('.sliding');

    var height = $elem.height();

    // slide
    switch (this.options.forwardDir) {
      case DIR_LTOR:
        if (this.slideSide === _FIRST_HALF) {
          $sliding.css('left', distance + 'px');
        } else {
          $sliding.css('left', this.MAX_DISTANCE + distance + 'px');
        }
        break;

      case DIR_RTOL:
        if (this.slideSide === _FIRST_HALF) {
          $sliding.css('left', -1 * this.MAX_DISTANCE + distance + 'px');
        } else {
          $sliding.css('left', distance + 'px');
        }
        break;

      case DIR_TTOB:
        if (this.slideSide === _FIRST_HALF) {
          $sliding.css('top', distance + 'px');
        } else {
          $sliding.css('top', this.MAX_DISTANCE + distance + 'px');
        }
        break;

      case DIR_BTOT:
        if (this.slideSide === _FIRST_HALF) {
          $sliding.css('top', -1 * this.MAX_DISTANCE + distance + 'px');
        } else {
          $sliding.css('top', distance + 'px');
        }
        break;
    }
  }

  Slide.prototype.action = function(to) {
    var endRatio = to;

    var _this = this;
    var step = 0.09;

    var loop = function() {
      var delta = (to - _this.currentRatio < 0) ? -1 : 1;

      // next ratio
      var nextRatio = _this.currentRatio;
      if (delta < 0) {
        nextRatio = Math.max(endRatio, _this.currentRatio + step * delta);
      } else {
        nextRatio = Math.min(endRatio, _this.currentRatio + step * delta);
      }

      _this.step(nextRatio);

      // call until ratio is 1
      if (nextRatio !== endRatio) {
        setTimeout(loop, 20);
      } else {
        // end callback
        _this.cleanup();
      }
    }

    this.isInAnimation = true;
    loop();
  }

  Slide.prototype.cleanup = function() {
    var $elem = $(this.element);
    var $current = $elem.children('.working');

    // clear flip elem
    $('.sliding').replaceWith('');
    $('.slidingBg').replaceWith('');
    $('.slideShadow').replaceWith('');

    var slideSide = this.slideSide;
    var $nextCurrent = $current;
    if (this.options.forwardDir === DIR_LTOR && slideSide === _FIRST_HALF ||
        this.options.forwardDir === DIR_RTOL && slideSide === _SECOND_HALF ||
        this.options.forwardDir === DIR_TTOB && slideSide === _FIRST_HALF ||
        this.options.forwardDir === DIR_BTOT && slideSide === _SECOND_HALF) {
      if (Math.abs(this.currentRatio) === 1) {
        $nextCurrent = this.getNextContent($current);
      }
    } else {
      if (Math.abs(this.currentRatio) === 1) {
        $nextCurrent = this.getPrevContent($current);
      }
    }

    // to avoid flushing screen, add .current class first
    // then remove .working class
    $nextCurrent.addClass(CURRENT);
    $current.removeClass('working');

    //
    if (typeof(this.options.didEndFlip) === 'function') {
      this.options.didEndFlip();
    }

    this.currentRatio = null;
    this.slideSide = null;
    this.isInAnimation = false;
  }

  Slide.prototype.getNextContent = function($current) {
    var $nextCurrent = $current.next('.flipContent');
    if ($nextCurrent.length === 0 && this.options.loop) {
      var $elem = $(this.element);
      $nextCurrent = $elem.children('.flipContent').first();
    }

    return ($nextCurrent.length === 0) ? $() : $nextCurrent;
  }

  Slide.prototype.getPrevContent = function($current) {
    var $prevCurrent = $current.prev('.flipContent');
    if ($prevCurrent.length === 0 && this.options.loop) {
      var $elem = $(this.element);
      $prevCurrent = $elem.children('.flipContent').last();
    }

    return ($prevCurrent.length === 0) ? $() : $prevCurrent;
  }

  Slide.prototype.shouldTransitionContinue = function(ratio, context) {

    var lastDiff = context.dList[context.dList.length - 1];

    // static check, TODO: should be more complicated
    return (Math.abs(ratio) > this.THREASHOLD_RATIO);
  }


  // The actual plugin constructor
  function Plugin(element, options) {
    this.element = element;

    // jQuery has an extend method which merges the contents of two or
    // more objects, storing the result in the first object. The first object
    // is generally empty as we don't want to alter the default options for
    // future instances of the plugin
    this.options = $.extend({}, defaults, options);

    this._defaults = defaults;
    this._name = pluginName;

    this.jqmInit();

    //
    this._clickContext = {
      downPt: null,
      downTime: null,
      flipside: null,
      dList: [],
      tList: []
    };

    // init effect class
    this.options.didEndFlip = this._getCleanupFunc();

    if (this.options.effect === 'flip' && this.isFlipSupported()) {
      this.effect = new Flip(this.element, this.options);
    } else {
      this.effect = new Slide(this.element, this.options);
    }

    this.init();
  }

  Plugin.prototype.jqmInit = function() {
    if ($.mobile === null) {
      return;
    }

    // check element data- attribute for jqm initialization
    var $elem = $(this.element);

    if (typeof $.mobile !== 'undefined' && $.mobile.ns) {
      _NS = $.mobile.ns;
    }

    for (var i = 0, len = JQM_ATTRS.length; i < len; i++) {
      var attr = JQM_ATTRS[i];
      var val = $elem.attr(_PREFIX_DATA + _NS + attr.attr);
      if (val) {
        if (attr.type === TYPE_BOOL) {
          this.options[attr.key] = (val.toLowerCase() === 'true') ? true : false;
        } else {
          this.options[attr.key] = val;
        }
      }
    }
  }

  Plugin.prototype.isFlipSupported = function() {
    var ua = $.browser;
    if (ua.webkit) {
      return true;
    }

    // Mozilla 11.0 or newer
    if (ua.mozilla && parseInt(ua.version.slice(0, 2), 10) > 10) {
      return true;
    }

    return false;
  }

  /**
   * @return {Object} mouse object.
   */
  Plugin.prototype._getMouseMovement = function(curX, curY) {
    if (this._clickContext.downPt === null) {
      return null;
    }

    var diffX = curX - this._clickContext.downPt.x;
    var diffY = curY - this._clickContext.downPt.y;

    var diff = (this.options.forwardDir === DIR_RTOL ||
                 this.options.forwardDir === DIR_LTOR) ? diffX : diffY;

    if (this._clickContext.flipside === null) {
      if (Math.abs(diff) > this.effect.START_OFFSET) {
        if (diff < 0) {
          this._clickContext.flipside = _SECOND_HALF;
        } else {
          this._clickContext.flipside = _FIRST_HALF;
        }

        this.effect.init(this._clickContext.flipside);
      } else {
        return null;
      }
    }

    // adjust offset
    var sign = (this._clickContext.flipside === _SECOND_HALF) ? -1 : 1;
    diff = diff - (this.effect.START_OFFSET * sign);

    return diff;
  }

  Plugin.prototype._getClientMousePos = function(event) {
    if (event.clientX === null && event.originalEvent) {
      return {x: event.originalEvent.clientX, y: event.originalEvent.clientY};
    } else {
      return {x: event.clientX, y: event.clientY};
    }
  }

  Plugin.prototype.vmousedown = function(event) {

    if (this._clickContext.downPt) {
      return false;
    }

    if (this.effect.isInAnimation) {
      return false;
    }

    var mousePos = this._getClientMousePos(event);
    var now = new Date().getTime();

    this._clickContext.downPt = mousePos;
    this._clickContext.downTime = now;
    this._clickContext.lastInfo = {x: mousePos.x, y: mousePos.y, time: now};
    this._clickContext.dList = [];
    this._clickContext.tList = [];

    return true;
  }

  Plugin.prototype._getRatio = function(diff) {
    var ratio = diff / this.effect.MAX_DISTANCE;

    if (this._clickContext.flipside === _FIRST_HALF) {
      // ratio should be 0 to 1
      ratio = Math.min(Math.max(0, ratio), 1);
    } else {
      ratio = Math.min(Math.max(-1, ratio), 0);
    }

    return ratio;
  }


  Plugin.prototype._pushMouseInfo = function(mousePos) {

    // -------------------------------------------------------------
    // push diff/accl info
    var now = new Date().getTime();
    var delta = 0;
    if (this.options.forwardDir === DIR_LTOR ||
        this.options.forwardDir === DIR_RTOL) {
      delta = mousePos.x - this._clickContext.lastInfo.x;
    } else {
      delta = mousePos.y - this._clickContext.lastInfo.y;
    }

    if (delta === 0) {
      return false;
    }

    var tDiff = (now - this._clickContext.lastInfo.time);

    //console.log("Delta :"+ delta
                //+" (x,y)=("+this._clickContext.lastInfo.x
                //+","+this._clickContext.lastInfo.y+")"
                //+" (x,y)=("+mousePos.x+","+mousePos.y+")"
                //+" tDelta = "+tDiff
    //);


    // record last 20
    if (this._clickContext.dList.length > 20) {
      this._clickContext.dList.shift();
      this._clickContext.tList.shift();
    }

    this._clickContext.dList.push(delta);
    this._clickContext.tList.push(tDiff);

    this._clickContext.lastInfo = {x: mousePos.x, y: mousePos.y, time: now};

    return true;
  }

  Plugin.prototype.vmousemove = function(event) {
    if (this._clickContext.downPt === null) {
      return false;
    }

    if (this.effect.isInAnimation) {
      return false;
    }

    var mousePos = this._getClientMousePos(event);
    var diff = this._getMouseMovement(mousePos.x, mousePos.y);
    if (diff === null) {
      return false;
    }

    // -------------------------------------------------------------
    // push diff/accl info
    if (!this._pushMouseInfo(mousePos)) {
      return false;
    }

    // get ratio
    var ratio = this._getRatio(diff);

    this.effect.step(ratio);

    event.preventDefault();
    return false;
  }

  Plugin.prototype.flipPrev = function() {
    if (this._clickContext.flipside !== null) {
      return;
    }

    var $elem = $(this.element);
    var $current = $elem.children(CLASS_CURRENT);

    var $prevCurrent = this.effect.getPrevContent($current);
    var forwardDir = this.options.forwardDir;
    if ($prevCurrent.length > 0) {
      if (forwardDir === DIR_RTOL || forwardDir === DIR_BTOT) {
        this._clickContext.flipside = _FIRST_HALF;
        this.effect.init(this._clickContext.flipside);
        this.effect.action(1);
      } else {
        this._clickContext.flipside = _SECOND_HALF;
        this.effect.init(this._clickContext.flipside);
        this.effect.action(-1);
      }
    // } else {
      // TODO: implement some animation to indicate the first page
    }
  }

  Plugin.prototype.flipNext = function() {
    if (this._clickContext.flipside !== null) {
      return;
    }

    var $elem = $(this.element);
    var $current = $elem.children(CLASS_CURRENT);

    var $nextCurrent = this.effect.getNextContent($current);
    var forwardDir = this.options.forwardDir;
    if ($nextCurrent.length > 0) {
      if (forwardDir === DIR_RTOL || forwardDir === DIR_BTOT) {
        this._clickContext.flipside = _SECOND_HALF;
        this.effect.init(this._clickContext.flipside);
        this.effect.action(-1);
      } else {
        this._clickContext.flipside = _FIRST_HALF;
        this.effect.init(this._clickContext.flipside);
        this.effect.action(1);
      }
    //} else {
      // TODO: implement some animation to indicate the last page
    }
  }

  Plugin.prototype._getCleanupFunc = function($nextCurrent) {
    var _this = this;

    var origFunc = this.options.didEndFlip;

    return function() {
      var idx = $(_this.element).children(CLASS_CURRENT).index();
      if (_this.options.showPager) {
        // update pager positio
        _this.setPagerPos(idx);
      }

      _this._clickContext.downPt = null;
      _this._clickContext.downTime = null;
      _this._clickContext.flipside = null;
      _this._clickContext.lastInfo = null;
      _this._clickContext.dList = [];
      _this._clickContext.aList = [];

      if (typeof(origFunc) === 'function')
      {
        // invoke original callback
        origFunc(idx);
      }
    }
  }

  Plugin.prototype.vmouseup = function(event) {
    if (this._clickContext.downPt === null) {
      return true;
    }

    if (this.effect.isInAnimation) {
      return true;
    }

    var mousePos = this._getClientMousePos(event);
    var $elem = $(this.element);

    var diff = this._getMouseMovement(mousePos.x, mousePos.y);
    if (diff === null) {
      this._clickContext.downPt = null;
      this._clickContext.flipside = null;
      this._clickContext.downTime = null;
      this._clickContext.lastInfo = null;
      this._clickContext.dList = [];
      this._clickContext.aList = [];

      return true;
    }

    var ratio = this._getRatio(diff);
    var sign = (this._clickContext.flipside === _SECOND_HALF) ? -1 : 1;

    // push mouse info
    // this._pushMouseInfo(mousePos);

    var $current = $elem.children('.working');
    var $nextCur = null;
    var targetRatio = 0;
    var optionForwardDir = this.options.forwardDir;
    var flipside = this._clickContext.flipside;
    if (optionForwardDir === DIR_LTOR && flipside === _FIRST_HALF ||
        optionForwardDir === DIR_RTOL && flipside === _SECOND_HALF ||
        optionForwardDir === DIR_TTOB && flipside === _FIRST_HALF ||
        optionForwardDir === DIR_BTOT && flipside === _SECOND_HALF) {

      $nextCur = this.effect.getNextContent($current);
      if (this.effect.shouldTransitionContinue(ratio, this._clickContext) &&
          $nextCur.length > 0) {
        targetRatio = sign;
      } else {
        $nextCur = $current;
        targetRatio = 0;
      }
    } else {
      $nextCur = this.effect.getPrevContent($current);
      if (this.effect.shouldTransitionContinue(ratio, this._clickContext) &&
          $nextCur.length > 0) {
        targetRatio = sign;
      } else {
        $nextCur = $current;
        targetRatio = 0;
      }
    }

    // run animation
    this.effect.action(targetRatio);

    event.preventDefault();

    return true;
  }

  Plugin.prototype.initPager = function() {
    var PAGER_HEIGHT = 24;

    var $elem = $(this.element);

    // shrink height for pager area
    var height = $elem.height();
    var heightCSS = (height - PAGER_HEIGHT) + 'px';
    $elem.children('div,p,section,article').each(function(idx, child) {
      $(child).css('height', heightCSS);
    });

    var flipPageCount = $elem.children('.flipContent').length;
    $elem.append($('<div class="pager"></div>'));

    var $pager = $elem.children('.pager');
    for (var i = 0; i < flipPageCount; i++) {
      $pager.append($('<span class="dot">&nbsp;</span>'));
    }

    // set current
    var idx = $elem.children(CLASS_CURRENT).index();
    var $currentA = $pager.children('.dot');
    $currentA.eq(idx).addClass("current");
  }

  Plugin.prototype.setPagerPos = function(pageIdx) {
    var $elem = $(this.element);
    $elem.find('.pager span.dot.current').removeClass("current");
    $elem.find('.pager span.dot').eq(pageIdx).addClass("current");
  }

  Plugin.prototype.pagerTap = function(event) {
    // check position
    var $elem = $(this.element);

    var $pager = $elem.children('.pager');
    var pagerWidth = $pager.width();

    var forwardDir = this.options.forwardDir;
    var mouse = this._getClientMousePos(event);
    if (mouse.x < pagerWidth / 2) {
      // backward
      this.flipPrev();
    } else {
      // forward
      this.flipNext();
    }
  }


  Plugin.prototype._isAccessFromMobileBrowser = function() {
    if( navigator.userAgent.match(/Android/i) ||
     navigator.userAgent.match(/webOS/i) ||
     navigator.userAgent.match(/iPhone/i) ||
     navigator.userAgent.match(/iPod/i) ||
     navigator.userAgent.match(/BlackBerry/)
     ){
       return true;
    }

    return false;
  }

  Plugin.prototype.init = function() {
    //
    // detect browser to switch css prefix
    var ua = $.browser;
    if (ua.webkit) {
      CSSPREFIX = 'webkit';
    } else if (ua.mozilla && parseInt(ua.version.slice(0, 2), 10) > 10) {
      CSSPREFIX = 'Moz';
    }

    // --------------------------------------------------
    // setup objects
    var $elem = $(this.element);
    var heightCSS = this.options.height;

    if (heightCSS === '') {
       var parentHeight = $elem.parent().height();
       if (parentHeight === 0) {
         parentHeight = $(document.body).height();
       }

      // calculate available height
      heightCSS = parentHeight - $elem.offset().top + 'px';
    }

    $elem.addClass('flipContainer').css('height', heightCSS);
    $elem.children('div,p,section').each(function(idx, child) {
      $(child).addClass('flipContent').css('height', heightCSS);
    });

    var $cur = $elem.children(CLASS_CURRENT);
    if ($cur.length === 0) {
      $elem.children().eq(0).addClass(CURRENT);
    }

    // --------------------------------------------------
    // add event hook
    var mousedown = 'mousedown',
    mousemove = 'mousemove',
    mouseup = 'mouseup',
    click = 'click';

    if ($.mobile) {
      mousedown = 'vmousedown',
      mousemove = 'vmousemove',
      mouseup = 'vmouseup',
      click = 'vclick';
    }

    var _this = this;

    // --------------------------------------------------
    // Special hook for img elem
    // (to prevent native img drag and drop on desktop browsers)
    if (!this._isAccessFromMobileBrowser()) {
      $elem.find('img').each(function(idx, anchor) {
        $(anchor).bind(mousedown, function(event) {
          event.preventDefault();
        });
       });
    }


    // --------------------------------------------------
    // init pager
    if (this.options.showPager) {
      this.initPager();

      // attach event handler
      var $pager = $elem.children('.pager');
      $pager.bind(mousedown, function(event) {
        event.preventDefault();
        return false;
      });

      $pager.bind(mouseup, function(event) {
        _this.pagerTap(event);
        event.preventDefault();
        return false;
      });

    }

    $(this.element).bind(mousedown, function(event) {
      return _this.vmousedown(event);
    });

    $(this.element).bind(mousemove, function(event) {
      return _this.vmousemove(event);
    });

    $(this.element).bind(mouseup, function(event) {
      return _this.vmouseup(event);
    });

    // -------------------------------------------------
    // add keyboard hook
    if (this.options.keyboardNav) {
      $(document)
      .unbind('keydown.flip')
      .bind('keydown.flip', function(e) {
        if (!$(e.target).is('input, textarea, select, button')) {
          // Left arrow
          var forwardDir = _this.options.forwardDir;
          if (e.keyCode === KEY_LEFT) {
            if (forwardDir === DIR_RTOL) {
              _this.flipNext();
            } else {
              _this.flipPrev();
            }
          }

          // Right arrow
          else if (e.keyCode === KEY_RIGHT) {
            if (forwardDir === DIR_RTOL) {
              _this.flipPrev();
            } else {
              _this.flipNext();
            }
          }
        }
      });
    }
  };

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[pluginName] = function(options) {
    if (this.length > 1) {
      // force to disable keyboard support
      options.keyboardNav = false;
    }

    return this.each(function() {
      if (!$.data(this, 'plugin_' + pluginName)) {
        var instance = new Plugin(this, options);
        $.data(this, 'plugin_' + pluginName, instance);
      }
    });
  }

  // bind
  $(document).bind('pageinit create', function(e) {
    $(':jqmData(role="flip")', e.target).flip();
  });

})(jQuery, window, document);
