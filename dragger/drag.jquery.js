(function($) {
    $.fn.drag = function(params) {

    	if ($(this).size() == 0)
    		throw new Error('Draggable element not found');

    	// Plugin Initialization
	    var options = $.extend($.fn.drag.default_options, params);
	    // Client width
	    var client_w = $(window).width();
	    var useragent = navigator.userAgent;
		useragent = useragent.toLowerCase();

		// Detect mobile client
		var mobile = false;
		if (useragent.indexOf('iphone') != -1 || useragent.indexOf('symbianos') != -1 || useragent.indexOf('ipad') != -1 || useragent.indexOf('ipod') != -1 || useragent.indexOf('android') != -1 || useragent.indexOf('blackberry') != -1 || useragent.indexOf('samsung') != -1 || useragent.indexOf('nokia') != -1 || useragent.indexOf('windows ce') != -1 || useragent.indexOf('sonyericsson') != -1 || useragent.indexOf('webos') != -1 || useragent.indexOf('wap') != -1 || useragent.indexOf('motor') != -1 || useragent.indexOf('symbian') != -1 ) {
			mobile = true;
		}

		var s; //start x
		var e; //end x
		var d; //difference between start x and end x 
		var drag_left = 0; //css left of draggable
		var mouse_down = false; //is mouse button clicked now

		function start_drag(evt){
			if (mobile){
				s = evt.targetTouches[0].clientX;
			} else {
				s = evt.clientX;
				mouse_down = true;
			}
		}

		function move_drag(evt){
			if (mouse_down && !mobile) {
				e = evt.clientX;
			} else if (!mouse_down && mobile) {
				evt.preventDefault();
				e = evt.targetTouches[0].clientX;
			} else if (!mouse_down && !mobile) {
				return false;
			}
			d = e - s;
			d = drag_left + d;
			drag_width = parseInt($(this).css('width'));
			if ((d > 0) || (d <= (client_w - drag_width))) {
				return false
			} else {
				$(this).css("left", d);
			}
		}

		function end_drag(evt){
			mouse_down = false;
			drag_left = $(this).css("left");
			drag_left = parseInt(drag_left);
		}

		// Setting up an events
		$(this).mousedown(function(e) {
			e.preventDefault();
		});
		$(this)[0].addEventListener('touchmove', function(event) {
			event.preventDefault();
		}, false);

		if (mobile) {
			$(this).bind('touchstart', start_drag);
			$(this).bind('touchend', end_drag);
			$(this).bind('touchmove', move_drag);
		} else {
			$(this).bind('mousedown', start_drag);
			$(this).bind('mouseup', end_drag);
			$(this).bind('mousemove', move_drag);
		}
    }

    $.fn.drag.default_options = {};
})(jQuery)