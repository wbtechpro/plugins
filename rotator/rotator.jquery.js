(function($){
    $.fn.rotate = function(params){
    
        // Calling instance method if exist
        if (this.data('rotate')){
            var rotator = this.data('rotate');
            if (undefined != rotator[params]){
                rotator[params]();
                return this;
            }
        }
        
        // Plugin Initialization
        var options = $.extend($.fn.rotate.default_options, params);
        
        if (!options.axisX && !options.axisY){
            error('You must set axisX or axisY option to TRUE');
            return this;
        }
        
        var current = options.startFrame;
        
        if (options.fileNumStart > options.fileNumEnd){
            error('fileNumEnd must be greater than fileNumStart');
            return this;
        }
        
        var start_pos; //start x
        var end_pos; //end x
        var diff; //difference between start x and end x 
        var curr; //current image on air
        var mouse_down = false; //is mouse button clicked now
        var last_visible = options.startFrame;
        var max_diff;
        var z;
        var images_count = options.fileNumEnd - options.fileNumStart + 1;
        var element = this;
        var ready = false;
        var img_width;
        var img_height;
        var rotate_interval_id;
        var hovered;
        
        // Storing instance object in data
        var rotator = {}
        rotator.element = this;
        
        rotator.load = function(){
            // Create image elements
            var total = options.fileNumEnd - options.fileNumStart + 1;
            var loaded = 0;
            var length = ('' + options.fileNumEnd).length;
            for (var i = options.fileNumStart; i <= options.fileNumEnd; i++){
                var num = i;
                if (options.zeroStarted && (('' + i).length < length)) {
                    var div = length - ('' + i).length;
                    for (var j = 0; j < div; j++) {
                        num = '0' + num;
                    }
                }
                var img = new Image();
                img.src = options.base_url + options.folder + options.filePrefix + num + '.' + options.extension;
                this.element.append(img);
                $(img).bind('load', function(e){
                    if (loaded == 0) {
                        img_width = $(this).width();
                        img_height = $(this).height();
                    }
                    loaded++;
                    if (undefined != params['onFrameLoaded'])
                        params['onFrameLoaded']({loaded: loaded, total: total});
                    
                    // On Load complete
                    if (loaded == total){
                        if (undefined != params['onLoadFinish'])
                            params['onLoadFinish']();
                        load_complete();
                    }
                })
            }    
        }
        
        this.data('rotate', rotator);
        
        // Autoloading
        if (options.autoload)
            rotator.load();
            
        // Detect mobile devices
        var useragent = navigator.userAgent;
        useragent = useragent.toLowerCase();
        var mobile;
        if (useragent.indexOf('iphone') != -1 || useragent.indexOf('symbianos') != -1 || useragent.indexOf('ipad') != -1 || useragent.indexOf('ipod') != -1 || useragent.indexOf('android') != -1 || useragent.indexOf('blackberry') != -1 || useragent.indexOf('samsung') != -1 || useragent.indexOf('nokia') != -1 || useragent.indexOf('windows ce') != -1 || useragent.indexOf('sonyericsson') != -1 || useragent.indexOf('webos') != -1 || useragent.indexOf('wap') != -1 || useragent.indexOf('motor') != -1 || useragent.indexOf('symbian') != -1 ) {
            mobile = true;
        }else{
            mobile = false;
        }
        
        // Add event listeners
        if (!mobile){
            $(document).bind('mouseup', on_end_callback);
            
            $(this).bind('mousedown', function(e){
                (e.preventDefault)?e.preventDefault():e.returnValue = false;
                if (options['axisY'])
                    start_pos = e.clientY;
                else
                    start_pos = e.clientX;
                mouse_down = true;
                last_visible = element.children().index(element.find("img:visible")[0]);
            });
	        
	        $(document).bind('mousemove', function(e){
	            (e.preventDefault)?e.preventDefault():e.returnValue = false;
	            if(!mouse_down)
	                return false;
	            if (options['axisY'])
	                end_pos = e.clientY;
	            else
	                end_pos = e.clientX;
	            rotate();
	        });
	        
	        if (options.mouseWheel){
	            $(this).bind('mousewheel DOMMouseScroll', function(e, delta){
	                e.preventDefault();
                    console.log(e);
	                if (undefined != e.wheelDelta){
	                    var up = (e.wheelDelta > 0);
	                }else if (undefined != e.detail){
	                    var up = (e.detail > 0);
	                }
	                if (up){
	                    last_visible++;
                    }else{
	                    last_visible--;
                    }
	                element.children().hide();
	                if((last_visible < 0) || (last_visible >= images_count))
	                    last_visible = Math.abs(images_count - Math.abs(last_visible));
	                element.find("img:eq(" + last_visible + ")").show();
	                if (undefined != options.onRotate)
                        options.onRotate(last_visible);
	            })
            }

            if (options.autorotate) {
                element.bind('mouseenter', function() {
                    hovered = true;
                    stop_autorotate();
                });
                element.bind('mouseleave', function() {
                    hovered = false;
                    start_autorotate();
                });
            }
        }else{
            this[0].addEventListener('touchend', on_end_callback, false)
            
            this[0].addEventListener('touchstart', function(e){
                if (options['axisY'])
    	            start_pos = e.targetTouches[0].clientY;
    	        else
    	            start_pos = e.targetTouches[0].clientX;
	            last_visible = element.children().index(element.find("img:visible")[0]);
	        }, false)
	        
	        this[0].addEventListener('touchmove', function(e){
	            e.preventDefault();
	            if (options['axisY'])
    	            end_pos = e.targetTouches[0].clientY;
    	        else
    	            end_pos = e.targetTouches[0].clientX;
	            rotate();
	        }, false);
        }
        
        function on_end_callback(e){
            mouse_down = false;
            last_visible = element.children().index(element.find("img:visible")[0]);
        }
        
        function rotate(){
            var old_frame = z;
            diff = end_pos - start_pos;
            if(diff > max_diff)
                diff -= max_diff;
            else if(diff < -max_diff)
                diff += max_diff;
            z = Math.floor(diff * images_count / max_diff);
            element.children().hide();
            // Invert
            if (options.invert)
                z = -z;
            z = z + last_visible;
            if((z < 0) || (z >= images_count))
                z = Math.abs(images_count - Math.abs(z));
            element.find("img:eq(" + z + ")").show();
            if ((old_frame != z) && (undefined != options.onRotate))
                options.onRotate(z);
        }
        
        // On load complete
        function load_complete(){
            ready = true;
            max_diff = element.children().css("width");
    		max_diff = parseInt(max_diff);
    		element.children().hide();
		    element.find("img:eq(" + options.startFrame + ")").show();
            if (undefined != options.cursorImg) {
                element.css('cursor', options.cursorImg);
            }
            element.css({overflow: 'hidden', width: img_width,height: img_height});

            // Start autorotate if needed
            if (true == options.autorotate) {
                start_autorotate();
            }
        }
        
        function start_autorotate() {
            if (rotate_interval_id || hovered)
                return;
            rotate_interval_id = setInterval(function() {
                if (mouse_down)
                    return;
                last_visible++;
                element.children().hide();
                if((last_visible < 0) || (last_visible >= images_count))
                    last_visible = Math.abs(images_count - Math.abs(last_visible));
                element.find("img:eq(" + last_visible + ")").show();
                if (undefined != options.onRotate)
                    options.onRotate(last_visible);
            }, options.frameInterval);
        }

        function stop_autorotate() {
            if (rotate_interval_id) {
                clearInterval(rotate_interval_id);
                rotate_interval_id = false;
            }
        }

        return this;
    }
    
    $.fn.rotate.default_options = {
        axisX: true,
        axisY: false,
        invert: false,
        folder: 'images/',
        base_url: '/',
        extension: 'jpg',
        autoload: true,
        filePrefix: 'image-',
        fileNumStart: 1,
        fileNumEnd: 60,
        startFrame: 1,
        mouseWheel: true,
        autorotate: false,
        frameInterval: 50,
        onFrameLoaded: undefined, // Image loaded callback
        onLoadFinish: undefined, // All image loaded callback
        onRotate: undefined, // Image rotate callback
        cursorImg: undefined,
        zeroStarted: false
    }
    
    function error(msg){
        if (window.console &&  window.console.error)
            console.error(msg);
    }
})(jQuery)
