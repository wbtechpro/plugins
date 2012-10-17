/*<p>
	Touches: <span id="t"></span>, ScrollTop: <span id="s"></span>
	<br>
	ClientXY/PageXY/ScreenXY:
	<br>
	<span id="c">&nbsp;</span>
	<br>
	<span id="q">&nbsp;</span>
</p>*/
(function( wbtDragOverflow, $, undefined ) {
	var isMobile = false,
		isMousePressed = false,
		dragStartX,
		dragStartY,
		dragEndX,
		dragEndY,
		posLeft = 0,
		posScrollTop,
		posScrollLeft;

	wbtDragOverflow.init = function(els) {
		detectMobile();
		$.each(els, function(){
			$this = $(this);
			$this.addClass("wbt-draggable_active").
				wrap("<div class=\"wbt-draggable_wrap\" style=\"height:" + $this.height() + "px\"/>");
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

	var onDragMove = function (e) {
		$this = $(this);
		//$("#s").text(dump(e));
/*
$("#q").text("");
$("#q").css("white-space", "pre");
$.each(e, function(i, k){
	t = $("#q").text();
	a = $("#q").text(t + i+": "+k+"\n");
});
*/

		if(isMobile) {
$("#t").text(e.touches.length + "/" + e.targetTouches.length + "/" + e.changedTouches.length);
$("#c").text(
e.touches[0].clientX + ":" + e.touches[0].clientY + "/" +
e.touches[0].pageX + ":" + e.touches[0].pageY + "/" +
e.touches[0].screenX + ":" + e.touches[0].screenY);
			if(e.touches.length == 1) {
				e.preventDefault(); // prevent image dragging to allow immidiate scrolling
			} else {
				return;
			}
			dragEndX = e.touches[0].pageX;
			dragEndY = e.touches[0].pageY;
		} else {
			e.preventDefault();
			if(isMousePressed) {
$("#c").text(
e.clientX + ":" + e.clientY + "/" +
e.pageX + ":" + e.pageY + "/" +
e.screenX + ":" + e.screenY);
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
			/*if($(document).scrollLeft() > 0) {
				$(document).scrollLeft(posScrollTop - dragChangeX);
			}*/
		}
		if (dragChangeX < maxChangeX) {
			dragChangeX = maxChangeX;
		}
		$this.css("left", dragChangeX);

		if(isMobile || true) {
			dragChangeY = posScrollTop + (dragStartY - dragEndY);
			if (dragChangeY <= 0) {
				dragChangeY = 1; // not 0 to avoid android 2.3 toolbar glitch
			}

$("#s").text(posScrollTop + " + (" + dragStartY + " - " + dragEndY + ")");
			$(window).scrollTop(dragChangeY);
			posScrollTop = dragChangeY;
		}
	}
}( window.wbtDragOverflow = window.wbtDragOverflow || {}, jQuery ));