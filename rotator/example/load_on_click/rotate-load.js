

var rotate_id="pics";

var p=0; //last visible img
var imgs; //imgs quantity
var m; //maximum difference=img width

var drag_id="draggable";
var drag_left=0; //css left of draggable

var rotate_drag; //what object moved

var urls=["01", "02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40","41","42","43","44","45","46","47","48","49","50","51","52","53","54","55","56","57","58","59","60"]

var useragent = navigator.userAgent;
useragent = useragent.toLowerCase();
var mobile; //mobile or not

if (useragent.indexOf('iphone') != -1 || useragent.indexOf('symbianos') != -1 || useragent.indexOf('ipad') != -1 || useragent.indexOf('ipod') != -1 || useragent.indexOf('android') != -1 || useragent.indexOf('blackberry') != -1 || useragent.indexOf('samsung') != -1 || useragent.indexOf('nokia') != -1 || useragent.indexOf('windows ce') != -1 || useragent.indexOf('sonyericsson') != -1 || useragent.indexOf('webos') != -1 || useragent.indexOf('wap') != -1 || useragent.indexOf('motor') != -1 || useragent.indexOf('symbian') != -1 ) {
   mobile=true;
}
else{mobile=false;}

var imgs; //imgs quantity
var m; //maximum difference=img width

var s; //start x
var e; //end x
var d; //difference between start x and end x 
var z; //current image on air
var mouse_down=false; //is mouse button clicked now

function start(evt){
  if(mobile==false){s=evt.clientX;mouse_down=true;}
  else{s=evt.targetTouches[0].clientX;}
  p=$("#"+rotate_id+" img").index($("#"+rotate_id+" img:visible")[0]);
  rotate_drag=true;
}

function move(evt){
  if (mouse_down==true && mobile==false){e=evt.clientX;}
  else if(mouse_down==false && mobile==true){evt.preventDefault();e=evt.targetTouches[0].clientX;}
  else if(mouse_down==false && mobile==false){return false}
  if(rotate_drag==true){
	d=e-s;
	if(d>m){d=d-m;}
	else if(d<-m){d=d+m;}
	z=Math.floor(d*imgs/m);
	$("#"+rotate_id+" img").hide();
	z=-z;
	z=z+p;
	if(z<0 || z>=imgs){z=Math.abs(imgs-Math.abs(z))}
	$("#"+rotate_id+" img:eq("+z+")").show();
  }
  else{return false}
}

function end(evt){
  mouse_down=false;
  p=$("#"+rotate_id+" img").index($("#"+rotate_id+" img:visible")[0]);
}

function start_drag(evt){
  if(mobile==false){s=evt.clientX;mouse_down=true;}
  else{s=evt.targetTouches[0].clientX;}
  rotate_drag=false;
}

function move_drag(evt){
  if (mouse_down==true && mobile==false){e=evt.clientX;}
  else if(mouse_down==false && mobile==true){evt.preventDefault();e=evt.targetTouches[0].clientX;}
  else if(mouse_down==false && mobile==false){return false}
  if(rotate_drag==false){
	d=e-s;
	d=drag_left+d;
	$("#"+drag_id).css("left",d);
  }
  else{return false}
}

function end_drag(evt){
  mouse_down=false;
  drag_left=$("#"+drag_id).css("left");
  drag_left=parseInt(drag_left);
}

$(document).ready(function(){
  $("#"+rotate_id).mousedown(function(e) { e.preventDefault(); });

  $("#"+rotate_id).mousewheel(function(event, delta) {
	  if (delta > 0) { //Scroll up
		$("#"+rotate_id+" img").hide();
		p=p+1;
		if(p<0 || p>=imgs){p=Math.abs(imgs-Math.abs(p))}
		$("#"+rotate_id+" img:eq("+p+")").show();
	  } else if (delta < 0) { //Scroll Down
		$("#"+rotate_id+" img").hide();
		p=p-1;
		if(p<0 || p>=imgs){p=Math.abs(imgs-Math.abs(p))}
		$("#"+rotate_id+" img:eq("+p+")").show();
	  }
	  return false;//cancel the default scroll action on the selected area (html here)
  });
  
  var pics=document.getElementById(rotate_id);
  if(pics!=null){
	document.getElementById(rotate_id).addEventListener('touchmove', function(event) {event.preventDefault();}, false);
	
	pics.addEventListener('touchstart', start, false);
	pics.addEventListener('touchend', end, false);
	pics.addEventListener('touchmove', move, false);
	
	pics.addEventListener('mousedown', start, false);
	document.addEventListener('mouseup', end, false);
	document.addEventListener('mousemove', move, false);
  }

  var draggable=document.getElementById(drag_id);
  if(draggable!=null){
	document.getElementById(drag_id).addEventListener('touchmove', function(event) {event.preventDefault();}, false);
	
	draggable.addEventListener('touchstart', start_drag, false);
	draggable.addEventListener('touchend', end_drag, false);
	draggable.addEventListener('touchmove', move_drag, false);
	
	draggable.addEventListener('mousedown', start_drag, false);
	document.addEventListener('mouseup', end_drag, false);
	document.addEventListener('mousemove', move_drag, false);
  }
	
	$("#"+rotate_id).addClass("loading");
	$("#"+rotate_id).append('<div id="loader"></div><div id="pics-fake"></div>');
	for (i=0;i<urls.length;i++){
		var img=new Image();
		$("#"+rotate_id).append(img);
	}


	var sprite_pos;
	function update( data ){
	  sprite_pos=-data.loaded*40;
	  $("#loader").css("background-position", "0 "+sprite_pos+"px");
	};
	
	function request(data ){
	  update( data );
	}
	
	function complete(data){
		update( data );
	}
	
	function finish(){
		$("#"+rotate_id).css("background","none").removeClass("loading");
		imgs=$("#"+rotate_id+" img").length;
		m=$("#"+rotate_id+" img").css("width");
		m=parseInt(m);
		$("#"+rotate_id+" img").hide();
		$("#"+rotate_id+" img:eq(0)").show(); // hardcode!
		$("#pics-fake").remove();
		$("#loader").remove();
	}
	
	$("#pics-fake").click(function(){
		for (i=0;i<urls.length;i++){
			$("#"+rotate_id+" img:eq("+i+")").attr("src",base_url+urls[i]+".jpg");
		}
		$.preload($("#"+rotate_id+" img"),{
		  onRequest:request,
		  onComplete:complete,
		  onFinish:finish
	  });
	});
});