(function( wbtDragOverflow, $, undefined ) {
	var isMobile,
		isMousePressed = false,
		dragStartX,
		dragStartY,
		dragEndX,
		dragEndY,
		posLeft = 0,
		posScrollTop,
		posScrollLeft;

	wbtDragOverflow.init = function(options) {
		var	els = options.selector,
			hasIcon = (options.icon === undefined) ? true : options.icon,
			cursorType = (options.cursor === undefined) ? "grab" : options.cursor;

		if(!els) {
			return;
		}

		detectMobile();

		$.each(els, function(){
			$this = $(this);

			if($this.width() < $this.parent().width()) {
				return true;
			}

			$this.addClass("wbt-draggable_active");

			switch(cursorType) {
				case "arrow":
					$this.addClass("wbt-draggable_cursor-arrow");
					break;
				case "grab":
					$this.addClass("wbt-draggable_cursor-grab");
					break;
			}

			$this.wrap("<div class=\"wbt-draggable_wrap\" style=\"height:" + $this.height() + "px\"/>");

			if(hasIcon) {
				$this.after("<span class=\"wbt-draggable_icon\" />");
			}

			if(isMobile) {
				this.addEventListener("touchstart", onDragStart, false);
				this.addEventListener("touchend", onDragEnd, false);
				this.addEventListener("touchmove", onDragMove, false);
			} else {
				$this.on("mousedown", onDragStart);
				$this.on("mouseup", onDragEnd);
				$this.on("mousemove", onDragMove);
				$this.on("mouseleave", onDragEnd);
			}
		});

		if(hasIcon) {
			$("body").on("mousedown", ".wbt-draggable_icon", function(e){e.preventDefault();});
		}
	}

	var detectMobile = function() {
		useragent = navigator.userAgent.toLowerCase();
		if (useragent.indexOf("iphone") != -1 || useragent.indexOf("symbianos") != -1 || useragent.indexOf("ipad") != -1 || useragent.indexOf("ipod") != -1 || useragent.indexOf("android") != -1 || useragent.indexOf("blackberry") != -1 || useragent.indexOf("samsung") != -1 || useragent.indexOf("nokia") != -1 || useragent.indexOf("windows ce") != -1 || useragent.indexOf("sonyericsson") != -1 || useragent.indexOf("webos") != -1 || useragent.indexOf("wap") != -1 || useragent.indexOf("motor") != -1 || useragent.indexOf("symbian") != -1 ) {
			isMobile = true;
		}
		else {
			isMobile = false;
		}
	}

	var onDragStart = function (e) {
		posScrollTop = $(document).scrollTop();
		posScrollLeft = $(document).scrollLeft();
		if(isMobile) {
			dragStartX = e.touches[0].pageX;
			dragStartY = e.touches[0].pageY;
		}
		else {
			e.preventDefault();
			isMousePressed = true;
			dragStartX = e.pageX;
			dragStartY = e.pageY;
			$(this).addClass("wbt-active");
		}
	}

	var onDragEnd = function () {
		isMousePressed = false;
		posLeft = $(this).position().left;
		posScrollTop = $(document).scrollTop();
		posScrollLeft = $(document).scrollLeft();

		if(!isMobile) {
			$(this).removeClass("wbt-active");
		}
	}

	var onDragMove = function (e) { // register global touch events?
		var $this = $(this);
		if(isMobile) {
			//$("#test").text(e.touches[0].pageX);
			if(e.touches.length == 1) {
				e.preventDefault(); // prevents page scrolling, allows immidiate event firing
			} else {
				return;
			}
			dragEndX = e.touches[0].pageX;
			dragEndY = e.touches[0].pageY;
		} else {
			e.preventDefault();
			if(isMousePressed) {
				dragEndX = e.pageX;
				dragEndY = e.pageY;
			} else {
				return false;
			}
		}

		dragChangeX = posLeft + (dragEndX - dragStartX);
		maxChangeX = $this.parent().width() - $this.width();
		if (dragChangeX > 0) {
			dragChangeX = 0;
		}
		if (dragChangeX < maxChangeX) {
			dragChangeX = maxChangeX;
		}

		$this.css("left", dragChangeX);
		
		if(isMobile) {
			dragChangeY = posScrollTop + (dragStartY - dragEndY);
			if (dragChangeY <= 0) {
				dragChangeY = 1; // not 0 to avoid android 2.3 toolbar glitch
			}
			$(window).scrollTop(dragChangeY);
			posScrollTop = dragChangeY;
		}
	}
}( window.wbtDragOverflow = window.wbtDragOverflow || {}, jQuery ));