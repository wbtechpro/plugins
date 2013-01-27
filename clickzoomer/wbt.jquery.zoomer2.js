/*
Zoomer v.7
WB--Tech.Lab plugins family (jQuery depended)
Plugin #6 for zoomimg image fragments version 1
Released under the MIT licence http://opensource.org/licenses/mit-license.php
Date of release 8.10.2012

README see at wbtech.pro/blog/zoom2
example see at wbtech.pro/cases/newzoom

SHORT MANUAL
1. create array "zoomed_info" to set zooming images
2. set images with zooming areas. legend:
	x,y,zoom-coeff,zoom-file-src,zoom-file-width,zoom-file-height
	x and y are coordinates relative to whole image-canvas when it's zoomed
3. put code in #zoom-map id
4. offset of magnify is hardcode=30 px !
var zoomed_info=[
[1600,1000,2.5,'folder/image.src',800,800],
[1250,1280,2.5,'folder/image2.src',800,800]
];

*/


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
		'<div class="zoom-pointer" style="left:' + 
		((zoomed_info[i][0] / zoomed_info[i][2]) - 30) + 'px;top:' + 
		((zoomed_info[i][1] / zoomed_info[i][2]) - 30) + 'px;" data-zoom="' + 
		zoomed_info[i][2] + '"><img src="magnify.png" width="60" height="60"></div><img width="' + 
		zoomed_info[i][4] + '" height="' + 
		zoomed_info[i][5] + '" class="zoomed" style="left:' + 
		(zoom_width - zoomed_info[i][4] / 2) + 'px;top:' + 
		(zoom_height - zoomed_info[i][5] / 2) + 'px" src="' + 
		zoomed_info[i][3] + '">'
	  );
	  
	  $(".zoom-pointer:eq("+i+")");
/* js animate of pointers appiarance
	  .animate({"width":"toggle","height":"toggle","top":"-=25px","left":"-=25px"},{duration:1500, easing:"easeOutBounce"});
*/
	  if(i<zoomed_info.length-1){i++;setTimeout(iteration,200);}
	  else {return false }
	}
	iteration();
    var zoom_pointers = $(".zoom-pointer");
    $(zoom_obj).on("click",".zoom-pointer",(function () {
        num = $(".zoom-pointer").index(this);

        z = $(this).attr("data-zoom");
        x = $(this).css("left");
        x = parseInt(x) + 30;
        y = $(this).css("top");
        y = parseInt(y) + 30;
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
            left: x - 30 + "px",
            top: y - 30 + "px",
            "opacity": "show"
        });
        $(".zoom-pointer").animate({
            "opacity": "show"
        });
    }));
});