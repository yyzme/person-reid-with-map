var v={
	video: document.getElementById("video"),
	play: document.getElementById("play"),//播放按钮
	pause: document.getElementById("pause"),//暂停按钮
	duration: document.getElementById("duration"),//总时长
	currentTime: document.getElementById("currentTime"),//当前播放时间
	progress: document.getElementsByClassName("progress")[0],//进度条容器
	timrBar: document.getElementsByClassName("timrBar")[0], //进度条
	fullScreen: document.getElementById("screen"),//全屏按钮
	warp: document.getElementById("video-warp"),//视频区域距离左边距离
	capture:document.getElementById("capture")
}

v.video.onloadedmetadata = function() {
	//开始
	v.play.onclick = function() {
		if(v.video.paused || v.video.ended) {
			v.video.play();
			this.style.display = "none";
			v.pause.style.display = "inline-block";
		}
	}
	
	//暂停
	v.pause.onclick = function() {
		if(!v.video.paused && !v.video.ended) {
			v.video.pause();
			v.pause.style.display = "none";
			v.play.style.display = "inline-block";
		}
	}
	
	//获取时长
	v.duration.innerHTML = timer(v.video.duration);
	v.currentTime.innerHTML = timer(v.video.currentTime);
	
	//进度条跟随
	v.video.ontimeupdate = function() {
		var currentTime = v.video.currentTime;
		var duration = v.video.duration;
		var percent = currentTime / duration * 100;
		v.timrBar.style.width = percent + "%";
		v.currentTime.innerHTML = timer(v.video.currentTime);
	};
	
	//进度条获取坐标调用 拖拽实现方法
	var enableProgressDrag = function(e) {
		var progressDrag = false;
		v.progress.onmousedown = function(e) {
			progressDrag = true;
			var len=document.body.clientWidth/2-320;
			updateprogress(e.pageX - v.warp.offsetLeft-len);
		}
		
		document.onmouseup = function(e) {
			if(progressDrag) {
				progressDrag = false;
				var len=document.body.clientWidth/2-320;
				updateprogress(e.pageX - v.warp.offsetLeft-len);
			}
		}
		
		v.progress.onmousemove = function(e) {
			if(progressDrag) {
				var len=document.body.clientWidth/2-320;
				updateprogress(e.pageX - v.warp.offsetLeft-len);
				progressDrag=false;
			}
		}
	};
	enableProgressDrag();
	
	var isScreen=false;
	v.fullScreen.addEventListener("click",function(e){
		if(isScreen==false){
			requestFullscreen(v.video);
			isScreen=true;
		}
		else{
			//exitFullscreen(v.video);
			exitFullscreen();
			isScreen=false;
		}
	});
	
	var iscapture=false;
	v.capture.onclick=function(e){
		iscapture=true;
		if(!v.video.paused && !v.video.ended) {
			v.video.pause();
			v.pause.style.display = "none";
			v.play.style.display = "inline-block";
		}
	}
	
	var Capture = function(e) {
		var ready=false;
		var ax=0,ay=0,bx=0,by=0;
		
		v.video.onmousedown = function(e) {
			if(iscapture==true){
				ax=e.layerX;
				ay=e.layerY;
				
				ready=true;
			}
		}
		
		/*v.video.onmousemove = function(e) {
			if(iscapture==true&&ready==true){
				//var context = document.getElementById("myCanvas").getContext("2d");
				
				var canvas = document.createElement('canvas');
				
				bx=e.layerX;
				by=e.layerY;
				context.strokeRect(ax,ay,bx,by);
			}
		}*/
		
		v.video.onmouseup=function(e){
			if(ready==true&&iscapture==true){
				var vh=v.video.videoHeight;
				var vw=v.video.videoWidth;
				
				bx=e.layerX;
				by=e.layerY;
				var width=Math.abs(ax-bx);
				var height=Math.abs(ay-by);
				
				ax=Number(ax/512*vw);
				ay=Number(ay/282.12*vh);
				bx=Number(bx/512*vw);
				by=Number(by/282.12*vh);
				ww=Math.abs(ax-bx);
				hh=Math.abs(ay-by);
				
				var xx=Math.min(ax,bx);
				var yy=Math.min(ay,by);
				
				var alpha=hh/ww,height=0,width=0;
				if(alpha>=1){
					height=90;
					width=Math.ceil(90/alpha);
				}
				else{
					width=90;
					height=Math.ceil(90*alpha);
				}
				
				var c = document.createElement("canvas");
				c.width = 90;
				c.height = 90;
				var ctx=c.getContext("2d");
				ctx.drawImage(v.video,xx,yy,ww,hh,0,0,width,height);
				var img=document.getElementById("myimg");
				img.src=c.toDataURL("image/png");
				
				ready=false;
				iscapture=false;
			}
		}
	}
	Capture();
}

function updateprogress(x) {
	var percent = 100 * (x - v.progress.offsetLeft) / v.progress.offsetWidth;
	if(percent > 100) {
		percent = 100;
	}
	if(percent < 0) {
		percent = 0;
	}
	v.timrBar.style.width = percent + "%";
	v.video.currentTime = v.video.duration * percent / 100;
}

function timer(seconds) {
	var minute = Math.floor(seconds / 60);
	if(minute < 10) {
		minute = "0" + minute;
	}
	
	var second = Math.floor(seconds % 60);
	if(second < 10) {
		second = "0" + second;
	}
	
	return minute + ":" + second;
}

function requestFullscreen(ele) {
	// 全屏兼容代码
	if (ele.requestFullscreen) {
		ele.requestFullscreen();
	}
	else if (ele.webkitRequestFullscreen) {
		ele.webkitRequestFullscreen();
	}
	else if (ele.mozRequestFullScreen) {
		ele.mozRequestFullScreen();
	}
	else if (ele.msRequestFullscreen) {
		ele.msRequestFullscreen();
	}
}

// 取消全屏
function exitFullscreen() {
	if (document.exitFullscreen) {
		document.exitFullscreen();
	}
	else if (document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	}
	else if (document.msExitFullscreen) {
		document.msExitFullscreen();
	}
	else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	}
}