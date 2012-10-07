function wbtTip( options ) {
	this.els = options.elements;
	this.modal = (options.modal == undefined) ? true : options.modal;
	this.operatesBy = options.operatesBy || "click";
	this.hover = options.hover || 400;
	this.tips = [];
	this.placement = options.placement || "global";
	this.classname = options.classname || "";
	this.align = options.align || "left";
	this.beforeShow = options.beforeShow || function() {};
	this.afterShow = options.afterShow || function() {};
	this.beforeHide = options.beforeHide || function() {};
	this.afterHide = options.afterHide || function() {};

	this.createTips();
}

wbtTip.prototype.createTips = function() {
	var self = this;

	$.each(this.els, function() {
		el = new wbtTipInstance({
			trigger: $(this),
			parent: self
		});
		if(el.tip) {
			self.tips.push(el);
		}
	});

	$("body").on("click", $.proxy(function(){
		$.each(this.tips, function() {
			if(this.tip.hasClass("active")) {
				this.hideTip();
			}
		});
	}, this));
};

wbtTip.prototype.touchEnabled = function() {
    return "ontouchstart" in window;
}

function wbtTipInstance( options ) {
	this.parent = options.parent;
	this.trigger = options.trigger.addClass("wbt-tip_trigger");
	this.tip = "";
	this.tipClose = "";
	this.tipClass = this.parent.classname;
	this.html = this.trigger.data("wbt-tip-source") ? $(this.trigger.data("wbt-tip-source")).html() : this.trigger.data("wbt-tip-content");

	this.mouseHover = 0;

	if(this.html) {
		this.createTip();
		this.bindEvents();
	}
}

wbtTipInstance.prototype.createTip = function() {
	if(this.htmlSource) {
		this.html = $(this.htmlSource).html();
	}

	this.tip = $("<div />", {
		"html": this.html,
		"class": "wbt-tip" + (this.tipClass ? " " + this.tipClass : "")
	});

	if(this.parent.placement=="local") {
		this.tip.appendTo(this.trigger.parent());
	} else if(this.parent.placement == "global") {
		this.tip.appendTo("body");
	} else {
		this.tip.appendTo(this.parent.placement);
	}

	if(this.parent.operatesBy == "click" || this.parent.touchEnabled()) {
		this.tipClose = $("<a />", {
			"href": "#",
			"class": "wbt-tip_close"
		}).appendTo(this.tip);
	}
}

wbtTipInstance.prototype.bindEvents = function() {
	var self = this;

	this.trigger.on("click", $.proxy(this.events.clickTrigger, this));
	this.tip.on("click", $.proxy(this.events.clickTip, this));

	if(this.parent.operatesBy == "click" || this.parent.touchEnabled()) {
		this.tipClose.on("click", $.proxy(this.events.clickTipClose, this));
	}
	if(this.parent.operatesBy == "hover" && !this.parent.touchEnabled()) {
		this.trigger.on("mouseenter", function(){ self.events.mouseHover.call(self, true); });
		this.trigger.on("mouseleave", function(){ self.events.mouseHover.call(self, false); });
		this.tip.on("mouseenter", function(){ self.events.mouseHover.call(self, true); });
		this.tip.on("mouseleave", function(){ self.events.mouseHover.call(self, false); });
	}
}

wbtTipInstance.prototype.events = {
	clickTrigger: function(e) {
		e.stopPropagation();
		e.preventDefault();
		if(!this.mouseHover) {
			this.toggleTip();
		}
	},
	clickTip: function(e) {
		if(e.target.nodeName != "A") {
			e.stopPropagation();
		}
	},
	clickTipClose: function(e) {
		e.stopPropagation();
		e.preventDefault();
		this.hideTip();
	},
	mouseHover: function(enter) {
		var self = this;
		clearInterval(this.mouseHover);
		this.mouseHover = 0;
		if(this.tip.hasClass("active") != enter) { 
			this.mouseHover = setTimeout(function(){
				if(enter) {
					self.showTip() 
				} else {
					self.hideTip();
				}
			}, this.parent.hover);
		}
	}
}

wbtTipInstance.prototype.toggleTip = function() {	
	if(this.tip.hasClass("active")) {
		this.hideTip();
	} else {
		this.showTip();
	}
}

wbtTipInstance.prototype.hideTip = function() {	
	if(this.trigger.hasClass("active")) {
		this.parent.beforeHide.call(this);
		this.trigger.removeClass("active");
		this.tip.removeClass("active");
		this.tip.removeClass("wbt-tip_active");
		this.parent.afterHide.call(this);
	}
}

wbtTipInstance.prototype.showTip = function() {	
	this.parent.beforeShow.call(this);
	this.setPosition();
	if(this.parent.modal) {
		$.each(this.parent.tips, function() {
			this.hideTip();
		});
	}
	this.trigger.addClass("active");
	this.tip.addClass("active");
	this.tip.addClass("wbt-tip_active");
	this.parent.afterShow.call(this);
}

wbtTipInstance.prototype.setPosition = function() {	
	currentLeft = this.trigger.offset().left;
	currentTop = this.trigger.offset().top;
	widthTip = this.tip.outerWidth();
	heightTip = this.tip.outerHeight();
	widthWindow = $(window).width();
	heightWindow = $(window).height();
	newLeft = currentLeft;
	if(this.parent.align == "right") {
		newLeft -= widthTip - this.trigger.outerWidth();
	}
	newTop = currentTop;
	if(widthTip + newLeft > widthWindow) { newLeft = widthWindow - widthTip - 10; }
	if(newLeft < currentLeft) { newLeft = currentLeft; }
	if(heightTip + newTop > heightWindow) { newTop = heightWindow - heightTip - 10; }
	if(newTop < currentTop) { newTop = currentTop; }

	this.tip.css("left", newLeft);
	this.tip.css("top", newTop);
}