(function($) {

    $.fn.zoom = function(params) {

    	if ($(this).size() == 0)
    		throw new Error('Target element not found');

    	if ($(this).find('img').size() == 0)
    		throw new Error('Target element must contained img element');

    	// Plugin Initialization
	    var options = $.extend($.fn.zoom.default_options, params);

	    for (var req in $.fn.zoom.required_options) {
    		if (options.hasOwnProperty(req))
    			throw new Error('Required option "' + req + '" seems to be empty');
    	}

	    // Detect mobile client
	    var useragent = navigator.userAgent;
		useragent = useragent.toLowerCase();
		var mobile = false;
		if (useragent.indexOf('iphone') != -1 || useragent.indexOf('symbianos') != -1 || useragent.indexOf('ipad') != -1 || useragent.indexOf('ipod') != -1 || useragent.indexOf('android') != -1 || useragent.indexOf('blackberry') != -1 || useragent.indexOf('samsung') != -1 || useragent.indexOf('nokia') != -1 || useragent.indexOf('windows ce') != -1 || useragent.indexOf('sonyericsson') != -1 || useragent.indexOf('webos') != -1 || useragent.indexOf('wap') != -1 || useragent.indexOf('motor') != -1 || useragent.indexOf('symbian') != -1 ) {
			mobile = true;
		}

		var pictureW; // zooming picture width
		var pictureH; //zooming picture height
		var zoomId = "zoom-" + $.fn.zoom.counter; //zoom wrapper
		var lensId = "lens-" + $.fn.zoom.counter; // lens above zoom block
		var zoomerId = "zoomer-" + $.fn.zoom.counter; //in magnifier we have same picture that we want to zoom, but in background. 
		var x; //x coord
		var y; //y coord
		var bgx; //background X position of picture in magnifier 
		var bgy; //background Y position of picture in magnifier 
		var zoomOffset; //wrapper of whole picture offset

		$.fn.zoom.counter++;

		// while moving mouse
		function move(evt) {
			if(!mobile) {
				x = evt.pageX; // set magnifier positio
				y = evt.pageY;  // -2*zoomRad-20;
			} else if (mobile) {
				x = evt.pageX; // clientX needed in ios <5
				y = evt.pageY;
				event.preventDefault();
			}

			y = y - zoomOffset.top; // get mouse coordinates with offset
			x = x - zoomOffset.left;

			// invert mouse coordinates for zoomed picter
			bgx = options['zoomCoeff'] * (x - options['zoomedAreaXoffset']) - options['zoomRad']; 
			bgy = options['zoomCoeff'] * (y - options['zoomedAreaYoffset']) - options['zoomRad'];
			x = x - options['zoomRad']; // offset magnifier
			if (mobile) {
				y = y - options['zoomRad'] - options['zoomRad'] - 20;
			} else{
				y = y - options['zoomRad'];
			}

			// while mouse move background moves too
			$('#' + zoomId).css({"left" : x + "px", "top" : y + "px", "visibility" : "visible"});
			// while mouse move background moves too
			$('#' + zoomerId).css({"background-position" : -bgx + "px -" + bgy + "px"});
		}

		// on start moving above object
		function start(evt) {
			if(!mobile) {
			  x = evt.pageX; // set magnifier position
			  y = evt.pageY;  // -2*zoomRad-20;
			} else {
			  x = evt.clientX;
			  y = evt.clientY - zoomRad - 20;
			}
			y = y - zoomOffset.top; // set magnifier position
			x = x - zoomOffset.left;
			$('#' + zoomId).show().css({"top" : x + "px", "left": y + "px"}); // achieve magnifier !
		}

		function end(evt){
		  $('#' + zoomId).css("visibility","hidden"); // remove magnifier
		}


		$(this).css({'position': 'relative', 'margin': 0, 'background': "#000 url('ebola-bg.jpg') no-repeat 0 0"})
		// create magnifier
		$(this).append('<div style="visibility:hidden" id="' + zoomId + '"><div id="' + zoomerId + '"></div><div id="' + lensId + '"></div></div>');
		$('#' + lensId).css({height : '100%', 'width' : '100%', 'position' : 'absolute', 'background' : "url('" + options['lensSrc'] + "') no-repeat 0 0", 'z-index' : '3', 'top' : '0', 'left' : '0'})
		$("#" + zoomerId).css({'background-repeat' : 'no-repeat', "background-image" : "url('" + options['zoomSrc'] + "')", "width" : 2 * options['zoomRad'] + "px", "height" : 2 * options['zoomRad'] + "px", "border-radius" : options['zoomRad'] + "px", "-webkit-border-radius" : options['zoomRad'] + "px", "-moz-border-radius" : ['zoomRad'] + "px", "margin-top" : options['zoomLensOffset'] + "px", "margin-left" : options['zoomLensOffset'] + "px"});
		$("#" + zoomId).css({"width" : 2 * (options['zoomLensOffset'] + options['zoomRad']) + "px", "height" : 2 * (options['zoomLensOffset'] + options['zoomRad']) + "px", 'position': 'absolute'});
		// get offset of zooming picture
		zoomOffset = $(this).offset();
		// get zooming picture size
		pictureW = $(this).find("img").css("width");
		pictureH = $(this).find("img").css("height");
		// svg countur
		var zoomLayout = Raphael($(this)[0], pictureW, pictureH);
		$("svg").css({"position" : "absolute", "top" : "0", "left" : "20px"});
		zoomLayout.path(options['svgCountur'])
			//styles for countur on wich event fires
			.attr({"fill" : options['counturColor'], "fill-opacity" : options['counturOpacity'], "stroke-width" : 0, "stroke" : "none"}) 
			.hover(start, end).mousemove(move) // touche events
			.touchstart(start).touchmove(move)
			.touchend(end);
    }

    $.fn.zoom.counter = 1;

    $.fn.zoom.required_options = [
    	'svgCountur',
    	'zoomSrc'
    ];

    $.fn.zoom.default_options = {
    	zoomRad: 100, //radius of magnifier
    	counturOpacity: 0,
    	counturColor: '#f00',
    	zoomCoeff: 1.947, //zooming coefficient
    	zoomLensOffset: 25, // offset between zoom wrapper an zoom (magnifier)
    	zoomedAreaXoffset: 20, //if zooming picture and zoom-picture has offset between each other
		zoomedAreaYoffset: 732,
		lensSrc: 'lens.png'
    };
})(jQuery)