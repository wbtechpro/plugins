// JavaScript Document
var drag_id="draggable";
var client_w=$(window).width();

var useragent = navigator.userAgent;
useragent = useragent.toLowerCase();
var mobile; //mobile or not

if (useragent.indexOf('iphone') != -1 || useragent.indexOf('symbianos') != -1 || useragent.indexOf('ipad') != -1 || useragent.indexOf('ipod') != -1 || useragent.indexOf('android') != -1 || useragent.indexOf('blackberry') != -1 || useragent.indexOf('samsung') != -1 || useragent.indexOf('nokia') != -1 || useragent.indexOf('windows ce') != -1 || useragent.indexOf('sonyericsson') != -1 || useragent.indexOf('webos') != -1 || useragent.indexOf('wap') != -1 || useragent.indexOf('motor') != -1 || useragent.indexOf('symbian') != -1 ) {
   mobile=true;
}
else{mobile=false;}

var s; //start x
var e; //end x
var d; //difference between start x and end x 
var drag_left=0; //css left of draggable
var mouse_down=false; //is mouse button clicked now

function start_drag(evt){
  if(mobile == false) {
    s = evt.clientX;mouse_down=true;
  } else {
    s = evt.targetTouches[0].clientX;
  }

}

function move_drag(evt){
  if (mouse_down==true && mobile==false){e=evt.clientX;}
  else if(mouse_down==false && mobile==true){evt.preventDefault();e=evt.targetTouches[0].clientX;}
  else if(mouse_down==false && mobile==false){return false}
  d=e-s;
  d=drag_left+d;
  if (d>0 || d<=client_w-parseInt($("#"+drag_id).css("width"))){return false}
  else{$("#"+drag_id).css("left",d);}
}

function end_drag(evt){
  mouse_down=false;
  drag_left=$("#"+drag_id).css("left");
  drag_left=parseInt(drag_left);
}



$(document).ready(function(){
$("#"+drag_id).mousedown(function(e) { e.preventDefault(); });

  document.getElementById(drag_id).addEventListener('touchmove', function(event) {event.preventDefault();}, false);
  var draggable=document.getElementById(drag_id);

  draggable.addEventListener('touchstart', start_drag, false);
  draggable.addEventListener('touchend', end_drag, false);
  draggable.addEventListener('touchmove', move_drag, false);
  
  draggable.addEventListener('mousedown', start_drag, false);
  document.addEventListener('mouseup', end_drag, false);
  document.addEventListener('mousemove', move_drag, false);
})
