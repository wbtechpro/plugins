/**
 * wbt.slider.js v0.9.0 beta
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2012, WBTech
 * http://wbtech.pro/
 */
// TODO: add circular
;(function($){

    function wbtSlider($el, params) {
        this.defaults = {
            "nav": true,
            "dots": false,
            "ranges": false,
            "circular": true,
            "showBy": 1,
            "changeBy": 1,
            "beforeChange": function(){},
            "afterChange": function(){}
        };
        this.cfg = $.extend({}, this.defaults, params);

        this.$slider = $el;
        this.$slider.addClass("wbt-slider_list");
        this.$wrap = this.$slider.wrap('<div class="wbt-slider_wrap"></div>').parent();
        this.sliderLength = this.$slider.children().length;
        if (this.cfg.nav) {
            this.$nav = $('<div class="wbt-slider_nav"><a href="#" class="wbt-slider_prev" data-dir="prev">Назад</a><a href="#" class="wbt-slider_next" data-dir="next">Вперед</a></div>').appendTo(this.$wrap);

        }
        if (this.cfg.dots) {
            var temp = "",
                i,
                tt;
            for (i = 0; i < this.sliderLength; i++) {
                tt = this.$slider.children().eq(i).data("title");
                temp += '<li><a href="#">' + (tt ? tt : '') + '</a></li>';
            }
            this.$dots = $('<ul class="wbt-slider_dots">' + temp + '</ul>').appendTo(this.$wrap);
        }

        this.itemsWidth = 0;
        this.itemsVisible = 0;
        this.currentIndex = 0;
        this.events.click.call(this);

        var self = this,
            interval = 0;
        setTimeout(function () {
            self.initSlider();
        }, 60);

        $(window).on("resize", function () {
            clearInterval(interval);
            interval = setTimeout(function () {
                self.initSlider();
            }, 100);
        });
    }

    wbtSlider.prototype.changeIndex = function (direction) {
        var newIndex = this.currentIndex,
            maxIndex = this.cfg.changeBy === 1 ?
                this.sliderLength - this.itemsVisible :
                this.sliderLength - this.sliderLength % this.itemsVisible;


        if (direction === parseInt(direction, 10)) {
            newIndex = direction;
        } else {
            newIndex +=
                direction === "next" ? (this.cfg.changeBy === 1 ? 1 : this.itemsVisible) :
                (direction === "prev") ? -(this.cfg.changeBy === 1 ? 1 : this.itemsVisible) : 0;
        }

        if (newIndex < 0) {
            newIndex = maxIndex;
        }
        if (newIndex >= this.sliderLength) {
            newIndex = 0;
        }
        if (newIndex >= maxIndex) {
            newIndex = maxIndex;
        }

        this.cfg.beforeChange();
        this.currentIndex = newIndex;
        this.$slider.css({ "margin-left": -(this.currentIndex * this.itemsWidth) });
        this.cfg.afterChange();


        if (this.cfg.dots) {
            this.$dots.children().removeClass("active");
            this.$dots.children().eq(this.currentIndex).addClass("active");
        }
    };

    wbtSlider.prototype.calculateRanges = function (index) {
        if (index < 0 || index >= this.sliderLength) {
            return "";
        }
        var lower = index + 1,
            upper = ((index + this.itemsVisible > this.sliderLength) ? this.sliderLength : index + this.itemsVisible);
        if (lower === upper) {
            return lower;
        }
        return lower + "-" + upper;
    };

    wbtSlider.prototype.updateRanges = function () {
        if (this.cfg.ranges && this.cfg.changeBy !== 1) {
            var changeBy = this.cfg.changeBy === 1 ? 1 : this.itemsVisible;
            this.cfg.ranges.lower.text(this.calculateRanges(this.currentIndex - changeBy));
            this.cfg.ranges.upper.text(this.calculateRanges(this.currentIndex + changeBy));
        }
    };

    wbtSlider.prototype.initSlider = function () {
        this.itemsWidth = Math.floor(this.$wrap.width() / this.cfg.showBy);
        this.$slider.children().css("width", this.itemsWidth);
        this.itemsVisible = Math.floor(this.$wrap.width() / (this.itemsWidth));

        if (this.cfg.ranges) {
            this.updateRanges();
        }

        this.changeIndex();

        if (this.cfg.nav) {
            if (this.sliderLength <= this.itemsVisible) {
                this.$nav.hide();
            } else {
                this.$nav.show();
            }
        }
    };

    wbtSlider.prototype.events = {
        click: function () {
            var self = this;
            if (this.cfg.nav) {
                this.$nav.on("click", "a", function (e) {
                    e.preventDefault();
                    self.changeIndex($(this).data("dir"));
                    if (self.config.ranges) {
                        self.updateRanges();
                    }
                });
            }

            if (this.cfg.dots) {
                this.$dots.on("click", "a", function (e) {
                    e.preventDefault();
                    self.changeIndex($(this).parent("li").index());
                });
            }
        }
    };

    $.fn.wbtSlider = function(params){
        return new wbtSlider(this, params);
    };
})(jQuery);