/**
 * wbt.hinter.js v1.0.0
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2012, WBTech
 * http://wbtech.pro/
 */
;(function($){
     function wbtHinter($el, params) {
        this.els = $el;
        this.modal = (params.modal == undefined) ? true : params.modal;
        this.action = params.action || "click";
        this.hover = params.hover || 400;
        this.hints = [];
        this.placement = params.placement || "global";
        this.classname = params.classname || "";
        this.alignHorizontal = params.alignHorizontal || "left";
        this.alignVertical = params.alignVertical || "bottom";
        this.beforeShow = params.beforeShow || function() {};
        this.afterShow = params.afterShow || function() {};
        this.beforeHide = params.beforeHide || function() {};
        this.afterHide = params.afterHide || function() {};

        this.createHints();
    }

    wbtHinter.prototype.createHints = function() {
        var self = this;

        $.each(this.els, function() {
            el = new wbtHinterInstance({
                trigger: $(this),
                parent: self
            });
            if(el.hint) {
                self.hints.push(el);
            }
        });

        $("body").on("click", $.proxy(function(){
            $.each(this.hints, function() {
                if(this.hint.hasClass("active")) {
                    this.hideHint();
                }
            });
        }, this));
    };

    wbtHinter.prototype.touchEnabled = function() {
        return "ontouchstart" in window;
    }

    function wbtHinterInstance( params ) {
        this.parent = params.parent;
        this.trigger = params.trigger.addClass("wbt-hint_trigger");
        this.hint = "";
        this.hintClose = "";
        this.hintClass = this.parent.classname;
        this.html = this.trigger.data("wbt-hint-source") ? $(this.trigger.data("wbt-hint-source")).html() : this.trigger.data("wbt-hint-content");

        this.mouseHover = 0;

        if(this.html) {
            this.createHint();
            this.bindEvents();
        }
    }

    wbtHinterInstance.prototype.createHint = function() {
        if(this.htmlSource) {
            this.html = $(this.htmlSource).html();
        }

        this.hint = $("<div />", {
            "html": this.html,
            "class": "wbt-hint" + (this.hintClass ? " " + this.hintClass : "")
        });

        if(this.parent.placement=="local") {
            this.hint.appendTo(this.trigger.parent());
        } else if(this.parent.placement == "global") {
            this.hint.appendTo("body");
        } else {
            this.hint.appendTo(this.parent.placement);
        }

        if(this.parent.action == "click" || this.parent.touchEnabled()) {
            this.hintClose = $("<a />", {
                "href": "#",
                "class": "wbt-hint_close"
            }).appendTo(this.hint);
        }
    }

    wbtHinterInstance.prototype.bindEvents = function() {
        var self = this;

        this.trigger.on("click", $.proxy(this.events.clickTrigger, this));
        this.hint.on("click", $.proxy(this.events.clickHint, this));

        if(this.parent.action == "click" || this.parent.touchEnabled()) {
            this.hintClose.on("click", $.proxy(this.events.clickHintClose, this));
        }
        if(this.parent.action == "hover" && !this.parent.touchEnabled()) {
            this.trigger.on("mouseenter", function(){ self.events.mouseHover.call(self, true); });
            this.trigger.on("mouseleave", function(){ self.events.mouseHover.call(self, false); });
            this.hint.on("mouseenter", function(){ self.events.mouseHover.call(self, true); });
            this.hint.on("mouseleave", function(){ self.events.mouseHover.call(self, false); });
        }
    }

    wbtHinterInstance.prototype.events = {
        clickTrigger: function(e) {
            e.stopPropagation();
            e.preventDefault();
            if(!this.mouseHover) {
                this.toggleHint();
            }
        },
        clickHint: function(e) {
            if(e.target.nodeName != "A") {
                e.stopPropagation();
            }
        },
        clickHintClose: function(e) {
            e.stopPropagation();
            e.preventDefault();
            this.hideHint();
        },
        mouseHover: function(enter) {
            var self = this;
            clearInterval(this.mouseHover);
            this.mouseHover = 0;
            if(this.hint.hasClass("active") != enter) { 
                this.mouseHover = setTimeout(function(){
                    if(enter) {
                        self.showHint() 
                    } else {
                        self.hideHint();
                    }
                }, this.parent.hover);
            }
        }
    }

    wbtHinterInstance.prototype.toggleHint = function() {	
        if(this.hint.hasClass("active")) {
            this.hideHint();
        } else {
            this.showHint();
        }
    }

    wbtHinterInstance.prototype.hideHint = function() {	
        if(this.trigger.hasClass("active")) {
            this.parent.beforeHide.call(this);
            this.trigger.removeClass("active");
            this.hint.removeClass("active");
            this.hint.removeClass("wbt-hint_active");
            this.parent.afterHide.call(this);
        }
    }

    wbtHinterInstance.prototype.showHint = function() {	
        this.parent.beforeShow.call(this);
        this.setPosition();
        if(this.parent.modal) {
            $.each(this.parent.hints, function() {
                this.hideHint();
            });
        }
        this.trigger.addClass("active");
        this.hint.addClass("active");
        this.hint.addClass("wbt-hint_active");
        this.parent.afterShow.call(this);
    }

    wbtHinterInstance.prototype.setPosition = function() {
        currentLeft = this.trigger.offset().left;
        currentTop = this.trigger.offset().top;
        widthHint = this.hint.outerWidth(true);
        heightHint = this.hint.outerHeight();
        widthWindow = $(window).width();
        heightWindow = $("body").height();
        newLeft = currentLeft;
        newTop = currentTop;

        if(this.parent.alignHorizontal == "right") {
            newLeft -= widthHint - this.trigger.outerWidth();
        }
        if(this.parent.alignVertical == "top") {
            newTop -= heightHint;
        }

        if(widthHint + newLeft > widthWindow) { newLeft = widthWindow - widthHint - 10; }
        if(newLeft <= 10) { newLeft = 10; }
        if(heightHint + newTop > heightWindow) { newTop = heightWindow - heightHint - 10; }
        if(newTop <= 10) { newTop = 10; }

        this.hint.css("left", newLeft);
        this.hint.css("top", newTop);
    }

    $.fn.wbtHinter = function(params){
        return new wbtHinter(this, params);
    };
})(jQuery);