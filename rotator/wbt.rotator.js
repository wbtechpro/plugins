// Generated by CoffeeScript 1.7.1

/*
wbt.rotator.js v2.1.0

Dependencies: jQuery 1.7+, Snap SVG 0.2+

Basic usage:
$(".any-selector").wbtRotator({
  src: "path/template/{{30}}.jpg",
  masks: [{
    title: "First Mask",
    src: "path/to/mask/{{30}}.svg"
  }, {
    title: "Second Mask",
    src: "path/to/mask/{{30}}.svg"
  }]
});

Copyright 2014, Visual Science, http://visualscience.ru/
Created by WB—Tech, http://wbtech.pro/
 */

(function() {
  (function($) {
    var WBTRotator;
    WBTRotator = function($el, params) {
      var $legendDescription, $legendTitle, $sel, mask, _i, _j, _len, _len1, _ref, _ref1;
      this.cfg = $.extend({}, WBTRotator.prototype.defaults, params);
      this.cfg.frameSrc = this.createSrcArray(this.cfg.src);
      this.cfg.frameCover = this.cfg.cover;
      this.cfg.frameFirst = this.cfg.first;
      this.cfg.maskSrc = this.cfg.masks;
      this.cfg.language = this.cfg.language.toUpperCase();
      this.$el = $el.addClass("wbt-rotator");
      this.$elContent = $("<div></div>").attr({
        "class": "wbt-rotator-content"
      }).prependTo(this.$el);
      this.$frameCurrent = $();
      this.$maskCurrent = $();
      this.$frames = $();
      this.frames = {
        previous: 0,
        current: this.cfg.frameFirst,
        total: this.cfg.frameSrc.length,
        loaded: 0,
        size: {
          width: 0,
          height: 0
        }
      };
      this.$masks = {};
      this.masks = {
        current: "",
        titles: this.cfg.maskSrc.length,
        total: this.cfg.maskSrc.length * this.frames.total,
        loaded: 0
      };
      this.$legendTitles = {};
      this.$legendDescriptions = {};
      this.pointerPressed = false;
      this.pointerMoved = false;
      this.pointerPosition = {
        x: 0,
        y: 0
      };
      if (!this.$el.length) {
        return $.wbtError("Specify non empty rotator placeholder.");
      }
      if (!this.cfg.frameSrc) {
        return $.wbtError("Specify 'src' in $().wbtRotator() call.");
      }
      if ($.wbtRotator.l10n != null) {
        _ref = this.cfg.maskSrc;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          mask = _ref[_i];
          if ((mask.title == null) && mask.titleId) {
            mask.title = $.wbtRotator.l10n[this.cfg.language].masks[mask.titleId].title;
            mask.description = $.wbtRotator.l10n[this.cfg.language].masks[mask.titleId].description;
          }
        }
      }
      this.$loader = $("<span></span>").attr({
        "class": "wbt-rotator-loader"
      }).prependTo(this.$elContent);
      if (!this.cfg.frameCover) {
        this.cfg.frameCover = this.cfg.src.replace(/{{.*}}/, "00");
      }
      this.loadCover();
      if (this.cfg.rotateManual) {
        if (this.cfg.cursor === "arrows") {
          if (this.cfg.invertAxes) {
            this.$el.addClass("wbt-rotator__vertical");
          } else {
            this.$el.addClass("wbt-rotator__horizontal");
          }
        } else {
          if (this.cfg.cursor === "grab") {
            this.$el.addClass("wbt-rotator__grab");
          }
        }
      }
      if (this.cfg.autoLoad) {
        this.loadImages();
      } else {
        this.$elContent.on("" + ($.wbtIsTouch() ? "singleTap" : "click") + ".wbt-rotator", $.proxy(this.loadImages, this));
      }
      this.maskSVG = Snap();
      this.$maskSVG = $(this.maskSVG.node);
      this.$maskSVG.appendTo(this.$elContent).attr({
        "class": "wbt-rotator-mask"
      });
      if (typeof this.cfg.maskSrc === "object") {
        if (this.cfg.autoLoad) {
          this.loadSVG();
        } else {
          this.$elContent.on("" + ($.wbtIsTouch() ? "singleTap" : "click") + ".wbt-rotator", $.proxy(this.loadSVG, this));
        }
      } else {

      }
      if (this.cfg.legend) {
        this.$maskLegend = $("<div></div>").attr({
          "class": "wbt-rotator-legend"
        }).appendTo(this.$el);
        this.$maskHeading = $("<div></div>").attr({
          "class": "wbt-rotator-heading"
        }).appendTo(this.$maskLegend).text($.wbtRotator.l10n[this.cfg.language].heading);
        this.$maskTitles = $("<ul></ul>").attr({
          "class": "wbt-rotator-titles_list"
        }).appendTo(this.$maskLegend);
        this.$maskDescriptions = $("<ul></ul>").attr({
          "class": "wbt-rotator-descriptions_list"
        }).appendTo(this.$maskLegend);
        _ref1 = this.cfg.maskSrc;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          mask = _ref1[_j];
          $legendTitle = $("<li></li>").attr("class", "wbt-rotator-titles_item").appendTo(this.$maskTitles).data("title", mask.title);
          $("<span></span>").attr("class", "wbt-rotator-titles_text").appendTo($legendTitle).html(mask.title);
          $("<span></span>").attr("class", "wbt-rotator-titles_icon").appendTo($legendTitle).css("background-color", mask.color || "#fff");
          $legendDescription = $("<li></li>").attr("class", "wbt-rotator-descriptions_item").appendTo(this.$maskDescriptions).data("title", mask.title).html(mask.description);
          this.$legendTitles[mask.title] = $legendTitle;
          this.$legendDescriptions[mask.title] = $legendDescription;
        }
        this.$maskTitles.on("" + ($.wbtIsTouch() ? "singleTap" : "click"), "li", $.proxy(this.onPathClick, this, null));
        if (!$.wbtIsTouch()) {
          this.$maskTitles.on("mouseover", "li", $.proxy(this.onPathOver, this, null));
          this.$maskTitles.on("mouseout", "li", $.proxy(this.onPathOut, this, null));
        }
        this.$maskTitles = $("<select><option selected>en</option><option>ru</option></select>").attr({
          "class": "wbt-rotator-titles_list"
        }).prependTo(this.$maskHeading);
        $sel = $("select").wbtFormStyler();
        $sel.parent().find(".wbt-input-select_options").css("background-color", this.$el.css("background-color"));
      }
    };
    WBTRotator.prototype.defaults = {
      language: "EN",
      frameCover: "",
      frameSrc: "",
      frameFirst: 0,
      first: 0,
      leadingZero: true,
      autoLoad: true,
      rotateAuto: false,
      rotateAutoSpeed: 100,
      rotateManual: true,
      invertAxes: false,
      invertMouse: false,
      invertAutoRotate: false,
      enableMouseWheel: true,
      circular: true,
      fogging: true,
      legend: true,
      cursor: "grab"
    };
    WBTRotator.prototype.registerEvents = function() {
      this.$elContent[0].addEventListener(($.wbtIsTouch() ? "touchstart" : "mousedown"), $.proxy(this.onPointerDown, this));
      document.addEventListener(($.wbtIsTouch() ? "touchend" : "mouseup"), $.proxy(this.onPointerUp, this));
      document.addEventListener(($.wbtIsTouch() ? "touchmove" : "mousemove"), $.proxy(this.onPointerMove, this));
      if (this.cfg.enableMouseWheel) {
        this.$elContent.on("mousewheel DOMMouseScroll", $.proxy(this.onScroll, this));
      }
      if (this.cfg.rotateAuto) {
        this.$elContent.on("mouseenter", $.proxy(this.onPointerEnter, this));
        this.$elContent.on("mouseleave", $.proxy(this.onPointerLeave, this));
      }
    };
    WBTRotator.prototype.createSrcArray = function(template) {
      var i, itemCount, itemCountLength, itemIndex, itemIndexLength, itemSrcArray;
      itemCount = parseInt(template.replace(/.*{{|}}.*/g, ""));
      itemCountLength = ("" + itemCount).length;
      itemIndex = 0;
      itemIndexLength = 0;
      itemSrcArray = [];
      i = 1;
      while (i <= itemCount) {
        itemIndex = i;
        if (this.cfg.leadingZero) {
          while (itemIndexLength = ("" + itemIndex).length < itemCountLength) {
            itemIndex = "0" + itemIndex;
          }
        }
        itemSrcArray.push(template.replace(/{{.*}}/, itemIndex));
        i++;
      }
      return itemSrcArray;
    };
    WBTRotator.prototype.updateLoader = function() {
      this.$loader.css("background-position", "left -" + (Math.round((this.frames.loaded + this.masks.loaded) * 60 / (this.frames.total + this.masks.total)) * 40) + "px");
    };
    WBTRotator.prototype.loadCover = function() {
      this.$cover = $("<img />").attr({
        "class": "wbt-rotator-cover",
        src: this.cfg.frameCover,
        alt: ""
      }).appendTo(this.$elContent).on("load", (function(_this) {
        return function() {
          _this.frames.size = {
            width: _this.$cover.width(),
            height: _this.$cover.height()
          };
          _this.$elContent.width(_this.frames.size.width).height(_this.frames.size.height);
        };
      })(this)).on("error", (function(_this) {
        return function() {
          if (_this.cfg.frameCover !== _this.cfg.frameSrc[0]) {
            _this.cfg.frameCover = _this.cfg.frameSrc[0];
            _this.loadCover();
          }
        };
      })(this));
    };
    WBTRotator.prototype.loadSVG = function() {
      var getCallback, i, index, mask, maskSrc, _i, _j, _len, _ref, _ref1, _results;
      this.$elContent.off("" + ($.wbtIsTouch() ? "singleTap" : "click") + ".wbt-rotator");
      this.$el.addClass("wbt-rotator__loading");
      _ref = this.cfg.maskSrc;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        mask = _ref[index];
        this.cfg.maskSrc[index].srcArray = this.createSrcArray(mask.src);
      }
      _results = [];
      for (i = _j = 0, _ref1 = this.frames.total - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        _results.push((function() {
          var _k, _len1, _ref2, _results1;
          _ref2 = this.cfg.maskSrc;
          _results1 = [];
          for (index = _k = 0, _len1 = _ref2.length; _k < _len1; index = ++_k) {
            maskSrc = _ref2[index];
            getCallback = (function(_this) {
              return function(title, index) {
                return function(data) {
                  return _this.loadedSVG(data, title, index);
                };
              };
            })(this);
            _results1.push($.get(maskSrc.srcArray[i], getCallback(this.cfg.maskSrc[index].title, i)));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };
    WBTRotator.prototype.loadedSVG = function(documentSVG, title, index) {
      var imageGroup, imageNew, mask, path, pathGroup, _i, _j, _len, _len1, _ref, _ref1;
      this.masks.loaded++;
      this.updateLoader();
      if (this.$masks[title] == null) {
        this.$masks[title] = {};
      }
      if (this.$masks[title].paths == null) {
        this.$masks[title].paths = [];
      }
      if (this.$masks[title].images == null) {
        this.$masks[title].images = [];
      }
      imageNew = this.maskSVG.image(this.cfg.frameSrc[index], 0, 0);
      imageNew.attr("display", "none");
      imageGroup = this.maskSVG.g().append(imageNew);
      pathGroup = this.maskSVG.g().attr({
        display: "none",
        fill: "transparent",
        cursor: "pointer"
      });
      $(documentSVG).find("path").each((function(_this) {
        return function(index, el) {
          var pathNew;
          pathNew = _this.maskSVG.path($(el).attr("d"));
          pathNew.transform("s.25,.25,0,0");
          if ($.wbtIsTouch()) {
            pathNew.touchstart(function() {
              return _this.pointerMoved = false;
            });
            pathNew.touchmove(function() {
              return _this.pointerMoved = true;
            });
            pathNew.touchend(function() {
              if (!_this.pointerMoved) {
                return $.proxy(_this.onPathClick, _this, pathNew)();
              }
            });
          } else {
            pathNew.click($.proxy(_this.onPathClick, _this, pathNew));
            pathNew.mouseover($.proxy(_this.onPathOver, _this, pathNew));
            pathNew.mouseout($.proxy(_this.onPathOut, _this, pathNew));
          }
          pathNew.data("index", index);
          pathNew.data("title", title);
          return pathGroup.add(pathNew);
        };
      })(this));
      this.$masks[title].paths[index] = pathGroup;
      this.$masks[title].paths[index].data("id", index);
      imageNew.attr("mask", pathGroup.clone().attr({
        fill: "#fff",
        display: ""
      }));
      this.$masks[title].images[index] = imageNew;
      if (this.masks.loaded === this.masks.total) {
        _ref = this.cfg.maskSrc;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          mask = _ref[_i];
          _ref1 = this.$masks[mask.title].paths;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            path = _ref1[_j];
            path.appendTo(this.maskSVG);
          }
        }
        if (this.frames.loaded === this.frames.total) {
          return this.loadComplete();
        }
      }
    };
    WBTRotator.prototype.loadImages = function() {
      var i, _i, _ref;
      this.$elContent.off("" + ($.wbtIsTouch() ? "singleTap" : "click") + ".wbt-rotator");
      this.$el.addClass("wbt-rotator__loading");
      for (i = _i = 0, _ref = this.frames.total; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        $("<img />").attr({
          "class": "wbt-rotator-image",
          src: this.cfg.frameSrc[i],
          alt: ""
        }).appendTo(this.$elContent).on("load", (function(_this) {
          return function(e) {
            var $this;
            _this.frames.loaded++;
            _this.updateLoader();
            if (_this.frames.loaded === 1 && !_this.frameCover) {
              $this = $(e.target);
              _this.frames.size = {
                width: $this.width(),
                height: $this.height()
              };
              _this.$elContent.width(_this.frames.size.width);
              _this.$elContent.height(_this.frames.size.height);
            }
            if (_this.frames.loaded === _this.frames.total && _this.masks.loaded === _this.masks.total) {
              _this.loadComplete();
            }
          };
        })(this));
      }
    };
    WBTRotator.prototype.loadComplete = function() {
      this.$elContent.on("" + ($.wbtIsTouch() ? "singleTap" : "click") + ".wbt-rotator", "image", $.proxy(this.onPathDeselect, this, null));
      this.$frames = this.$elContent.children(".wbt-rotator-image");
      this.changeFrame(this.frames.current);
      this.$el.removeClass("wbt-rotator__loading").addClass("wbt-rotator__loaded");
      this.registerEvents();
      if (this.cfg.rotateAuto) {
        this.startAutoRotate();
      }
    };
    WBTRotator.prototype.onPointerDown = function(e) {
      this.$el.addClass("wbt-rotator__active");
      this.pointerPressed = true && this.cfg.rotateManual;
      if (e.touches && e.touches.length > 1) {
        this.pointerPressed = false;
      } else {
        this.pointerPosition.x = e.pageX;
        this.pointerPosition.y = e.pageY;
      }
    };
    WBTRotator.prototype.onPointerUp = function() {
      if (this.pointerPressed) {
        this.$el.removeClass("wbt-rotator__active");
        this.pointerPressed = false;
        this.frames.current = this.$elContent.children(".wbt-rotator-image").index(this.$frameCurrent);
      }
    };
    WBTRotator.prototype.onPointerMove = function(e) {
      var delta, x, y;
      if (this.pointerPressed) {
        if (!e.touches || e.touches && e.touches.length === 1) {
          if (e.preventDefault) {
            e.preventDefault();
          } else {
            e.returnValue = false;
          }
        }
        if (e.touches) {
          x = e.touches[0].pageX;
          y = e.touches[0].pageY;
        } else {
          x = e.pageX;
          y = e.pageX;
        }
        if (this.cfg.invertAxes) {
          delta = y - this.pointerPosition.y;
        } else {
          delta = x - this.pointerPosition.x;
        }
        delta = Math.floor(delta * this.frames.total / (this.invertAxes ? this.frames.size.height : this.frames.size.width));
        if (this.cfg.invertMouse) {
          delta = this.frames.current - delta;
        } else {
          delta = this.frames.current + delta;
        }
        this.changeFrame(delta);
      }
    };
    WBTRotator.prototype.onPathDeselect = function(el, e) {
      if (this.masks.current) {
        if (!this.cfg.fogging) {
          this.$masks[this.masks.current].paths[this.frames.current].attr({
            fill: "rgba(255,255,255,0)"
          });
        }
        if (this.cfg.legend) {
          this.$legendTitles[this.masks.current].removeClass("wbt-rotator-titles_item__active");
          this.$legendDescriptions[this.masks.current].removeClass("wbt-rotator-descriptions_item__active");
        }
        this.masks.current = "";
        return this.$el.removeClass("wbt-rotator-mask__active");
      }
    };
    WBTRotator.prototype.onPathClick = function(el, e) {
      var colorRGB, mask, title, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _results;
      title = el ? el.data("title") : $(e.target).data("title") || $(e.target).closest("li").data("title");
      if (!this.masks.current) {
        this.masks.current = title;
        this.findFrame();
        _ref = this.cfg.maskSrc;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          mask = _ref[_i];
          if (mask.title === title) {
            colorRGB = Snap.getRGB(mask.color);
            this.$masks[this.masks.current].paths[this.frames.current].attr({
              fill: "rgba(" + colorRGB.r + "," + colorRGB.g + "," + colorRGB.b + ",.4)"
            });
          }
        }
        if (this.cfg.fogging) {
          this.$el.addClass("wbt-rotator-mask__active");
        }
      } else {
        if (this.masks.current !== title) {
          if (!this.cfg.fogging) {
            this.$masks[this.masks.current].paths[this.frames.current].attr({
              fill: "rgba(255,255,255,0)"
            });
          }
          this.masks.current = title;
          this.findFrame();
          _ref1 = this.cfg.maskSrc;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            mask = _ref1[_j];
            if (mask.title === title) {
              colorRGB = Snap.getRGB(mask.color);
              this.$masks[this.masks.current].paths[this.frames.current].attr({
                fill: "rgba(" + colorRGB.r + "," + colorRGB.g + "," + colorRGB.b + ",.4)"
              });
            }
          }
        } else {
          this.masks.current = "";
          this.$el.removeClass("wbt-rotator-mask__active");
        }
      }
      if (this.cfg.legend) {
        _ref2 = this.cfg.maskSrc;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          mask = _ref2[_k];
          this.$legendTitles[mask.title].toggleClass("wbt-rotator-titles_item__active", mask.title === this.masks.current);
          this.$legendDescriptions[mask.title].toggleClass("wbt-rotator-descriptions_item__active", mask.title === this.masks.current);
        }
      }
      if (!this.cfg.fogging && !this.masks.current || this.cfg.fogging) {
        this.$masks[title].paths[this.frames.current].attr({
          fill: "rgba(255,255,255,0)"
        });
      }
      _ref3 = this.cfg.maskSrc;
      _results = [];
      for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
        mask = _ref3[_l];
        if (this.masks.current && mask.title !== this.masks.current) {
          _results.push(this.$masks[mask.title].images[this.frames.current].attr({
            display: "none"
          }));
        } else {
          this.$masks[mask.title].paths[this.frames.current].attr({
            display: ""
          });
          _results.push(this.$masks[mask.title].images[this.frames.current].attr({
            display: ""
          }));
        }
      }
      return _results;
    };
    WBTRotator.prototype.onPathOver = function(el, e) {
      var colorRGB, mask, title, _i, _j, _len, _len1, _ref, _ref1, _results;
      title = el ? el.data("title") : $(e.target).data("title") || $(e.target).closest("li").data("title");
      _ref = this.cfg.maskSrc;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        mask = _ref[_i];
        if (mask.title === title && mask.title !== this.masks.current) {
          colorRGB = Snap.getRGB(mask.color);
          this.$masks[mask.title].paths[this.frames.current].attr({
            fill: "rgba(" + colorRGB.r + "," + colorRGB.g + "," + colorRGB.b + ",.4)"
          });
        }
      }
      if (this.cfg.legend) {
        _ref1 = this.cfg.maskSrc;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          mask = _ref1[_j];
          this.$legendTitles[mask.title].toggleClass("wbt-rotator-titles_item__hover", mask.title === title);
          _results.push(this.$legendDescriptions[mask.title].toggleClass("wbt-rotator-descriptions_item__hover", mask.title === title));
        }
        return _results;
      }
    };
    WBTRotator.prototype.onPathOut = function(el, e) {
      var mask, title, _i, _len, _ref, _results;
      title = el ? el.data("title") : $(e.target).data("title") || $(e.target).closest("li").data("title");
      if (this.cfg.fogging || title !== this.masks.current) {
        this.$masks[title].paths[this.frames.current].attr({
          fill: "rgba(255,255,255,0)"
        });
      }
      if (this.cfg.legend) {
        _ref = this.cfg.maskSrc;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          mask = _ref[_i];
          this.$legendTitles[mask.title].removeClass("wbt-rotator-titles_item__hover");
          _results.push(this.$legendDescriptions[mask.title].removeClass("wbt-rotator-descriptions_item__hover"));
        }
        return _results;
      }
    };
    WBTRotator.prototype.onPointerEnter = function() {};
    WBTRotator.prototype.onPointerLeave = function() {};
    WBTRotator.prototype.onScroll = function(e, delta) {
      var scrollUp;
      if (this.cfg.rotateManual) {
        e.preventDefault();
        scrollUp = void 0;
        if (undefined !== e.wheelDelta) {
          scrollUp = e.wheelDelta > 0;
        } else if (undefined !== e.detail) {
          scrollUp = e.detail > 0;
        } else {
          scrollUp = e.originalEvent.wheelDelta > 0;
        }
        if (scrollUp) {
          this.frames.current++;
        } else {
          this.frames.current--;
        }
        if (this.cfg.circular) {
          this.frames.current += this.frames.total;
          this.frames.current %= this.frames.total;
        } else {
          if (this.frames.current > this.frames.total - 1) {
            this.frames.current = this.frames.total - 1;
          }
          if (this.frames.current < 0) {
            this.frames.current = 0;
          }
        }
        this.changeFrame(this.frames.current);
      }
    };
    WBTRotator.prototype.findFrame = function() {
      var animateStep, path, pathsRotated, stepsBackward, stepsForward, _i, _j, _len;
      pathsRotated = this.$masks[this.masks.current].paths.slice(0);
      stepsForward = 0;
      pathsRotated.rotate(this.frames.current);
      for (_i = 0, _len = pathsRotated.length; _i < _len; _i++) {
        path = pathsRotated[_i];
        if (!path.node.childElementCount) {
          stepsForward++;
        } else {
          break;
        }
      }
      stepsBackward = 0;
      pathsRotated.rotate(1);
      for (_j = pathsRotated.length - 1; _j >= 0; _j += -1) {
        path = pathsRotated[_j];
        if (!path.node.childElementCount) {
          stepsBackward++;
        } else {
          break;
        }
      }
      animateStep = (function(_this) {
        return function(stepsRemaining, direction) {
          _this.frames.current += direction;
          _this.frames.current %= _this.frames.total;
          console.log(_this.frames.current);
          _this.changeFrame(_this.frames.current);
          if (stepsRemaining > 1) {
            return setTimeout(function() {
              return animateStep(stepsRemaining - 1, direction);
            }, 40);
          }
        };
      })(this);
      if (stepsForward === 0 || stepsBackward === 0) {
        return false;
      } else {
        if (stepsBackward > stepsForward) {
          animateStep(stepsForward, 1);
        }
        if (stepsBackward < stepsForward) {
          animateStep(stepsBackward, -1);
        }
      }
      return true;
    };
    WBTRotator.prototype.changeFrame = function(newIndex) {
      var colorRGB, mask, _i, _len, _ref;
      if (this.cfg.circular) {
        newIndex += this.frames.total;
        newIndex %= this.frames.total;
      } else {
        if (newIndex > this.frames.total - 1) {
          newIndex = this.frames.total - 1;
        }
        if (newIndex < 0) {
          newIndex = 0;
        }
      }
      if (newIndex === this.framePrevious) {
        return;
      }
      this.$frameCurrent.removeClass("wbt-rotator-image__active");
      this.$frameCurrent = this.$frames.eq(newIndex);
      this.$frameCurrent.addClass("wbt-rotator-image__active");
      _ref = this.cfg.maskSrc;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        mask = _ref[_i];
        this.$masks[mask.title].paths[this.frames.previous].attr({
          display: "none",
          fill: "rgba(255,255,255,0)"
        });
        this.$masks[mask.title].images[this.frames.previous].attr({
          display: "none"
        });
        this.$masks[mask.title].paths[newIndex].attr({
          display: ""
        });
        if (!this.cfg.fogging && this.masks.current === mask.title) {
          colorRGB = Snap.getRGB(mask.color);
          this.$masks[mask.title].paths[newIndex].attr({
            fill: "rgba(" + colorRGB.r + "," + colorRGB.g + "," + colorRGB.b + ",.4)"
          });
        }
        if (this.masks.current && this.masks.current === mask.title) {
          this.$masks[mask.title].images[newIndex].attr({
            display: ""
          });
        }
      }
      this.frames.previous = newIndex;
    };
    WBTRotator.prototype.startAutoRotate = function() {
      setInterval(((function(_this) {
        return function() {
          if (_this.cfg.invertAutoRotate) {
            ++_this.frames.current;
          } else {
            --_this.frames.current;
          }
          if (!_this.pointerPressed) {
            _this.changeFrame(_this.frames.current);
          }
        };
      })(this)), this.cfg.rotateAutoSpeed);
    };
    WBTRotator.prototype.stopAutoRotate = function() {};
    $.wbtError = function(error) {
      if (window.console && window.console.error) {
        console.error(error);
      }
    };
    $.wbtIsTouch = function() {
      if (("ontouchstart" in window) || (window.DocumentTouch && document instanceof DocumentTouch)) {
        return true;
      } else {
        return false;
      }
    };
    $.fn.wbtRotator = function(params) {
      return new WBTRotator(this, params);
    };
    $.wbtRotator = {} || $.wbtRotator;
    Array.prototype.rotate = (function() {
      var push, splice;
      push = Array.prototype.push;
      splice = Array.prototype.splice;
      return function(count) {
        var len;
        len = this.length >>> 0;
        count = count >> 0;
        count = ((count % len) + len) % len;
        push.apply(this, splice.call(this, 0, count));
        return this;
      };
    })();
  })(jQuery);

}).call(this);
