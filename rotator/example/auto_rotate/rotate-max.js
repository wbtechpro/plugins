// JavaScript Document
var block_id="pics";
var p=0; //last visible img
var timing=90;

var useragent = navigator.userAgent;
useragent = useragent.toLowerCase();
var mobile; //mobile or not

if (useragent.indexOf('iphone') != -1 || useragent.indexOf('symbianos') != -1 || useragent.indexOf('ipad') != -1 || useragent.indexOf('ipod') != -1 || useragent.indexOf('android') != -1 || useragent.indexOf('blackberry') != -1 || useragent.indexOf('samsung') != -1 || useragent.indexOf('nokia') != -1 || useragent.indexOf('windows ce') != -1 || useragent.indexOf('sonyericsson') != -1 || useragent.indexOf('webos') != -1 || useragent.indexOf('wap') != -1 || useragent.indexOf('motor') != -1 || useragent.indexOf('symbian') != -1 ) {
   mobile=true;
}
else{mobile=false;}

var imgs; //imgs quantity
var m; //maximum difference=img width

var timer;
function rotate(x,y){
	var z=y-1;
	if(x==z){
	  $("#"+block_id+" img:first-child").show();
	  $("#"+block_id+" img:eq("+x+")").hide();
	  x=$("#"+block_id+" img").index($("#"+block_id+" img:first-child")[0]);
	}
	else{
	  $("#"+block_id+" img:eq("+x+")").hide();
	  x=x+1;
	  $("#"+block_id+" img:eq("+x+")").show();
	}
	  //$("#one").html(x);
	  timer=setTimeout("rotate("+x+","+y+")",timing);
}


$(document).ready(function(){
  $("#"+block_id).mousedown(function(e) { e.preventDefault(); });
  imgs=$("#"+block_id+" img").length;
  m=$("#"+block_id+" img").css("width");
  m=parseInt(m);
  $("#"+block_id+" img").hide();
  $("#"+block_id+" img:eq("+p+")").show();
  
  setTimeout("rotate("+p+","+imgs+")",timing);
  $("#"+block_id).hover(function(){
	clearTimeout(timer);
	p=$("#"+block_id+" img").index($("#"+block_id+" img:visible")[0]);
  },function(){
	rotate(p,imgs),timing;
  });
  $("#"+block_id).mousewheel(function(event, delta) {
	  if (delta > 0) { //Scroll up
		$("#"+block_id+" img").hide();
		p=p+1;
		if(p<0 || p>=imgs){p=Math.abs(imgs-Math.abs(p))}
		$("#"+block_id+" img:eq("+p+")").show();
	  } else if (delta < 0) { //Scroll Down
		$("#"+block_id+" img").hide();
		p=p-1;
		if(p<0 || p>=imgs){p=Math.abs(imgs-Math.abs(p))}
		$("#"+block_id+" img:eq("+p+")").show();
	  }
	  return false;//cancel the default scroll action on the selected area (html here)
  });
});

var s; //start x
var e; //end x
var d; //difference between start x and end x 
var z; //current image on air
var mouse_down=false; //is mouse button clicked now

function start(evt){
  if(mobile==false){s=evt.clientX;mouse_down=true;}
  else{s=evt.targetTouches[0].clientX;}
  p=$("#"+block_id+" img").index($("#"+block_id+" img:visible")[0]);
}

function move(evt){
  if (mouse_down==true && mobile==false){e=evt.clientX;}
  else if(mouse_down==false && mobile==true){evt.preventDefault();e=evt.targetTouches[0].clientX;}
  else if(mouse_down==false && mobile==false){return false}
  d=e-s;
  if(d>m){d=d-m;}
  else if(d<-m){d=d+m;}
  z=Math.floor(d*imgs/m);
  $("#"+block_id+" img").hide();
  z=-z;
  z=z+p;
  if(z<0 || z>=imgs){z=Math.abs(imgs-Math.abs(z))}
  $("#"+block_id+" img:eq("+z+")").show();
}

function end(evt){
  mouse_down=false;
  p=$("#"+block_id+" img").index($("#"+block_id+" img:visible")[0]);
}

$(function() {
  var pics=document.getElementById(block_id);
if("addEventListener" in pics) {
	document.getElementById(block_id).addEventListener('touchmove', function(event) {event.preventDefault();}, false);
   // выполнится для IE 9 и выше, и для всех остальных браузеров 
  pics.addEventListener('touchstart', start, false);
  pics.addEventListener('touchend', end, false);
  pics.addEventListener('touchmove', move, false);
  
  pics.addEventListener('mousedown', start, false);
  document.addEventListener('mouseup', end, false);
  document.addEventListener('mousemove', move, false);
} 
})

