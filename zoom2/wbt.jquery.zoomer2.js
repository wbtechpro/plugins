// JavaScript Document
var zoom_obj = "#zoom-map";
var z;
var x;
var y;
var w;
var h;
var num;
var zoom_pics = new Array();
$(document).ready(function () {
    var zoom_img = $(zoom_obj).children("img:eq(0)");
    var zoom_width = parseInt($(zoom_img).css("width")) / 2;
    var zoom_height = parseInt($(zoom_img).css("height")) / 2;
    $(zoom_obj).css({
        "width": 2 * zoom_width + "px",
        "height": 2 * zoom_height + "px"
    });

	var i=0;
	function iteration(){
	  $(zoom_obj).append(
		'<div class="zoom-pointer" style="display:none;left:' + 
		zoomed_info[i][0] / zoomed_info[i][2] + 'px;top:' + 
		zoomed_info[i][1] / zoomed_info[i][2] + 'px;" data-zoom="' + 
		zoomed_info[i][2] + '"></div><img width="' + 
		zoomed_info[i][4] + '" height="' + 
		zoomed_info[i][5] + '" class="zoomed" style="left:'+
		(zoom_width - zoomed_info[i][4]/2)+'px;top:'+
		(zoom_height-zoomed_info[i][5]/2)+'px" src="' + 
		zoomed_info[i][3] + '">'
	  );
//	  console.log(zoomed_info[i][4]/2);
	  $(".zoom-pointer:eq("+i+")").animate({"width":"toggle","height":"toggle"},{duration:1500, easing:"easeOutBounce"})
	  if(i<zoomed_info.length-1){i++;setTimeout(iteration,200);}
	  else {return false }
	}
	iteration();
    var zoom_pointers = $(".zoom-pointer");
	
    $(zoom_obj).on("click",".zoom-pointer",(function () {
        num = $(".zoom-pointer").index(this);
		console.log(num);
        z = $(this).attr("data-zoom");
        x = $(this).css("left");
        x = parseInt(x);
        y = $(this).css("top");
        y = parseInt(y);
        $(zoom_img).fadeTo("fast", .8).animate({
            "marginLeft": (zoom_width - z * x),
            "marginTop": (zoom_height - z * y),
            width: (2 * z * zoom_width),
            height: (2 * z * zoom_height)
        }, {
            queue: false,
            duration: 400
        });
        $(this).animate({
            left: zoom_width,
            top: zoom_height,
            "opacity": "hide"
        });
        $(".zoom-pointer").animate({
            "opacity": "hide"
        });
        setTimeout(function () {
            $(zoom_img).fadeTo("fast", 1);
            $(".zoomed:eq(" + num + ")").animate({
                "opacity": "show"
            }, {
                duration: 400
            })
        }, 300);
    }));
    $(zoom_obj).on("click",".zoomed",(function () {
        $(zoom_img).fadeTo("fast", 1).animate({
            "marginLeft": 0,
            "marginTop": 0,
            width: (2 * zoom_width),
            height: (2 * zoom_height)
        }, {
            queue: false,
            duration: 400
        });
        $(this).animate({
            "opacity": "hide"
        }, {
            duration: 400
        });
        $(this).prev(".zoom-pointer:hidden").animate({
            left: x + "px",
            top: y + "px",
            "opacity": "show"
        });
        $(".zoom-pointer").animate({
            "opacity": "show"
        });
    }));
});