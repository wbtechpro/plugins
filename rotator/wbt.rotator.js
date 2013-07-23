/**
 * wbt.rotator.js v1.0.2
 *
 * Licensed under the MIT license.
 * http://opensource.org/licenses/mit-license.php
 *
 * Dependencies: jQuery 1.7+
 *
 * Basic usage:
 * $(".any-selector").wbtRotator({
 *   frameSrc: "path/template/{{30}}.jpg"
 * });
 *
 * For more instructions and examples, please visit http://wbtech.pro/blog/articles/rotator/
 *
 * Copyright 2012, WBTech
 * http://wbtech.pro/
 */
;(function($){
    function WBTRotator($el, params) {
        this.cfg = $.extend({}, WBTRotator.prototype.defaults, params);
        this.$el = $el.addClass("wbt-rotator");
        this.$frames = $();
        this.$frameCurrent = $();
        this.frameCurrent = this.cfg.frameFirst;
        this.frameCount = 0;
        this.frameLoadedCount = 0;
        this.frameSize = {"width": 0, "height": 0};
        this.pointerPressed = false;
        this.pointerPosition = {"x": 0, "y": 0};

        if(!this.$el.length) {
            return $.wbtError("Specify non empty rotator placeholder.");
        }

        if(!this.cfg.frameSrc || this.cfg.frameSrc.length == 0) {
            return $.wbtError("Specify 'frameSrc' in $().wbtRotator() call.");
        }

        // Dealing with template string
        if(typeof this.cfg.frameSrc === 'string') {
            this.getFrameSrc();
        }
        this.frameCount = this.cfg.frameSrc.length;

        if(this.cfg.showLoader) {
            this.$loader = $("<span>&#9654;</span>").attr({"class": "wbt-rotator-loader"}).appendTo(this.$el);
        }

        if(!this.cfg.frameCover) {
            this.cfg.frameCover = this.cfg.frameSrc[0];
        }
        this.loadCover();

        if(this.cfg.rotateManual) {
            if(this.cfg.cursor == "arrows") {
                if(this.cfg.invertAxes) {
                    this.$el.addClass("wbt-rotator__vertical");
                } else {
                    this.$el.addClass("wbt-rotator__horizontal");
                }
            } else if (this.cfg.cursor == "grab") {
                this.$el.addClass("wbt-rotator__grab");
            }



        }

        if(this.cfg.autoLoad) {
            this.loadImages();
        }

        this.$el.on("click.wbt-rotator", $.proxy(this.loadImages, this));
    }

    WBTRotator.prototype.defaults = {
        showLoader: true,
        frameCover: "", // if not present, first frame taken
        frameSrc: "",
        frameFirst: 0,
        leadingZero: true,
        autoLoad: true,
        rotateAuto: false,
        rotateAutoSpeed: 100, // milliseconds per frame
        rotateManual: true, // disable keyboard and mouse for rotation
        invertAxes: false, // false: horizontal; true: vertical
        invertMouse: false, // false: counter-clockwise; true: clockwise
        invertAutoRotate: false, // false: counter-clockwise; true: clockwise
        enableMouseWheel: true,
        cursor: "arrows"
        // TODO: User events support
    };

    WBTRotator.prototype.registerEvents = function() {
        this.$el[0].addEventListener($.wbtIsTouch() ? "touchstart" : "mousedown", $.proxy(this.onPointerDown, this));
        document.addEventListener($.wbtIsTouch() ? "touchend" : "mouseup", $.proxy(this.onPointerUp, this));
        document.addEventListener($.wbtIsTouch() ? "touchmove" : "mousemove", $.proxy(this.onPointerMove, this));

        if(this.cfg.enableMouseWheel){
            this.$el.on("mousewheel DOMMouseScroll", $.proxy(this.onScroll, this));
        }
        if(this.cfg.rotateAuto) {
            this.$el.on("mouseenter", $.proxy(this.onPointerEnter, this));
            this.$el.on("mouseleave", $.proxy(this.onPointerLeave, this));
        }
    };

    WBTRotator.prototype.getCoverSrc = function() {
    };

    WBTRotator.prototype.getFrameSrc = function() {
        var frameCount = parseInt(this.cfg.frameSrc.replace(/.*{{|}}.*/g, "")), // Remove everything except contents between {{ and }}
            frameCountLength = ("" + frameCount).length,
            frameIndex = 0,
            frameIndexLength = 0,
            frameSrc = [];

        for(var i=0; i<frameCount; i++) {
            frameIndex = i;
            if(this.cfg.leadingZero) {
                while(frameIndexLength = ("" + frameIndex).length < frameCountLength) {
                    frameIndex = "0" + frameIndex;
                }
            }
            frameSrc.push(this.cfg.frameSrc.replace(/{{.*}}/, frameIndex));
        }

        this.cfg.frameSrc = frameSrc;
    };

    WBTRotator.prototype.loadCover = function() {
        var self = this;
        this.$cover = $("<img />")
            .attr({
                "class": "wbt-rotator-cover",
                "src": this.cfg.frameCover,
                "alt": ""
            })
            .appendTo(this.$el)
            .on("load", function(){
                self.frameSize = {"width": self.$cover.width(), "height": self.$cover.height()};
                self.$el.width(self.frameSize.width).height(self.frameSize.height);
            });
    };

    WBTRotator.prototype.loadImages = function() {
        // Avoid double initialization
        this.$el.off("click.wbt-rotator").addClass("wbt-rotator__loading");

        var self = this;

        for(var i=0; i < this.frameCount; i++) {
            $("<img />")
                .attr({
                    "class": "wbt-rotator-image",
                    "src": this.cfg.frameSrc[i],
                    "alt":""
                })
                .appendTo(this.$el)
                .on("load", function(e) {
                    self.frameLoadedCount++;
                    self.loadImagesAnimation();
                    if(self.frameLoadedCount == 1 && !self.frameCover) {
                        var $this = $(this);
                        self.frameSize = {"width": $this.width(), "height": $this.height()};
                        self.$el.width(self.frameSize.width).height(self.frameSize.height);
                    }
                    if(self.frameLoadedCount == self.frameCount) {
                        self.loadImagesComplete();
                    }
                });
        }
    };

    WBTRotator.prototype.loadImagesAnimation = function() {
        if(this.cfg.showLoader) {
        }
    };

    WBTRotator.prototype.loadImagesComplete = function() {
        this.$el.removeClass("wbt-rotator__loading").addClass("wbt-rotator__loaded");
        this.$frames = this.$el.children(".wbt-rotator-image");
        this.$frameCurrent = this.$frames.eq(this.frameCurrent).addClass("wbt-rotator-image__active");

        this.registerEvents();

        if(this.cfg.rotateAuto) {
            this.startAutoRotate();
        }
    };

    WBTRotator.prototype.onPointerDown = function(e) {
        (e.preventDefault) ? e.preventDefault() : e.returnValue = false;

        this.$el.addClass("wbt-rotator__active");
        this.pointerPressed = true && this.cfg.rotateManual;
        this.pointerPosition.x = e.pageX;
        this.pointerPosition.y = e.pageY;
    };

    WBTRotator.prototype.onPointerUp = function() {
        if(this.pointerPressed) {
            this.$el.removeClass("wbt-rotator__active");
            this.pointerPressed = false;
            this.frameCurrent = this.$frameCurrent.index(".wbt-rotator-image");
        }
    };

    WBTRotator.prototype.onPointerMove = function(e) {
        (e.preventDefault) ? e.preventDefault() : e.returnValue = false;

        if(this.pointerPressed) {
            if(this.cfg.invertAxes) {
                this.changeFrame(e.pageY - this.pointerPosition.y);
            } else {
                this.changeFrame(e.pageX - this.pointerPosition.x);
            }
        }

        // TODO: add momentum
    };

    WBTRotator.prototype.onPointerEnter = function() {
//        this.stopAutoRotate();
    };

    WBTRotator.prototype.onPointerLeave = function() {
//        this.startAutoRotate();
    };

    WBTRotator.prototype.onScroll = function(e, delta) {
        if(this.cfg.rotateManual) {
            e.preventDefault();

            var scrollUp;
            if(undefined != e.wheelDelta) {
                scrollUp = (e.wheelDelta > 0);
            } else if(undefined != e.detail) {
                scrollUp = (e.detail > 0);
            } else {
                scrollUp = (e.originalEvent.wheelDelta > 0);
            }
            // TODO: smoother movement
            this.changeFrame(scrollUp ? this.frameCurrent++: this.frameCurrent--);
        }
    };

    WBTRotator.prototype.changeFrame = function(newIndex) {
        // Invert
        newIndex = this.cfg.invertMouse ? -newIndex : newIndex;

        // Normalize
        newIndex = Math.floor(newIndex * this.frameCount / (this.invertAxes ? this.frameSize.height : this.frameSize.width));

        // Add to current frame index
        newIndex += this.frameCurrent;

        // Rotate around total frame count
        newIndex %= this.frameCount;
        // TODO: allow non-circular rotation, arc rotation

        this.$frameCurrent.removeClass("wbt-rotator-image__active");
        this.$frameCurrent = this.$frames.eq(newIndex);
        this.$frameCurrent.addClass("wbt-rotator-image__active");
    };

    WBTRotator.prototype.startAutoRotate = function() {
        var self = this;

        setInterval(function(){
            if(!self.pointerPressed) {
                self.changeFrame(self.cfg.invertAutoRotate ? self.frameCurrent++: self.frameCurrent--);
            }
        }, this.cfg.rotateAutoSpeed);
    };

    WBTRotator.prototype.stopAutoRotate = function() {
        // TODO: Stop on mouse hover
    };

    $.wbtError = function(error) {
        if(window.console && window.console.error) {
            console.error(error);
        }
    };

    $.wbtIsTouch = function() {
        return (('ontouchstart' in window) || (window.DocumentTouch && document instanceof DocumentTouch)) ? true : false
    };

    $.fn.wbtRotator = function(params){
        return new WBTRotator(this, params);
    };
})(jQuery);