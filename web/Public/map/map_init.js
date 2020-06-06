BM.Config.HTTP_URL = 'http://127.0.0.1:9000';
// 在ID为map的元素中实例化一个地图，并设置地图的ID号为 bigemap.googlemap-streets，ID号程序自动生成，无需手动配置，并设置地图的投影为百度地图 ，中心点，默认的级别和显示级别控件
var map = BM.map('map', 'bigemap.googlemap-streets', {center: [30, 104], zoom: 8, zoomControl: true });

var cameralist=new Array();
var clen=0;

if (window.XMLHttpRequest){
	xmlhttp=new XMLHttpRequest();
}
else{
	xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
}
xmlhttp.onreadystatechange=function(){
	if (xmlhttp.readyState==4 && xmlhttp.status==200){
		var result=JSON.parse(xmlhttp.responseText);
		clen=result['num'];
		var size=result['size'];
		
			for(var m=0;m<clen;m++){
				var lat=BM.latLng(size[3*m+1],size[3*m+2]);
				var camera=BM.marker(lat);
				camera.attribution=size[3*m];
				cameralist[m]=[size[3*m],size[3*m+1],size[3*m+2]];
				
				camera.on('click',camera_click);
				camera.addTo(map);
			}
	}
}
xmlhttp.open("GET","./Public/map/database.php",true);
xmlhttp.send();

function close1(){
	var v = document.getElementById('video');//获取视频节点
	$('.videos').hide();//点击关闭按钮关闭暂停视频
	v.pause();
	$('.videos').html();
}

moon=[31,28,31,30,31,30,31,31,30,31,30,31];

function camera_click(e){
	xx=e.latlng.lat;
	yy=e.latlng.lng;
	
	var cameraid=this.attribution;
	
	var myDate = new Date();
	var year=myDate.getFullYear();
	var time=year.toString();
	var month=myDate.getMonth()+1;
	if(month<10)
		time+="0";
	time+=month.toString();
	var day=myDate.getDate();
	if(day<10)
		time+="0";
	time+=day.toString();
	var hour=myDate.getHours();
	if(hour<10)
		time+="0";
	time+=hour.toString();
	var minute=myDate.getMinutes();
	if(minute<10)
		time+="0";
	time+=minute.toString();
	//myDate.getSeconds();//秒
	
	var end=Math.floor(minute/5)*5;
	var s=new Array(4),e=new Array(4);
	for(var tt=0;tt<4;tt++){
		if(end>=5){
			e[tt]=formtime(year,month,day,hour,end);
			end-=5;
			s[tt]=formtime(year,month,day,hour,end);
		}
		else{
			e[tt]=formtime(year,month,day,hour,end);
			
			end=55;
			if(hour==0){
				hour=23;
				if(day==1){
					if(month==1){
						month=12;
						day=30;
						yera-=1;
					}
					else{
						month-=1;
						day=moon[month];
						if(month==2&&((year%4==0&&year%100!=0)||year%400==0))
							day+=1;
					}
				}
				else
					day-=1;
			}
			else
				hour-=1;
			
			s[tt]=formtime(year,month,day,hour,end);
		}
	}
	
	var name=cameraid+".mp4";
	
	var display=
		"<div class=\"video-warp\" id=\"video-warp\">"+
			//"<video id=\"video\" poster=\"./yyz.jpg\">"+
			"<video id=\"video\">"+
				"<source src="+"./"+name+" type=\"video/mp4\"></source>"+
			"</video>"+
			"<div class=\"controls\" id=\"controls\">"+
				"<i id=\"play\"></i>"+
				"<i id=\"pause\"></i>"+
				"<i id=\"capture\"></i>"+
				"<!--进度条-->"+
				"<div class=\"progress\">"+
					"<div class=\"timrBar\"></div>"+
				"</div>"+
				"<!--时长-->"+
				"<div class=\"video-timer\">"+
					"<span id=\"currentTime\">00:00</span>"+
					"<em>/</em>"+
					"<span id=\"duration\">00:00</span>"+
				"</div>"+
				"<i id=\"screen\"></i>"+
			"</div>"+
		"</div>"+
		
		"<div class=\"select\" id=\"set\" style=\"float:left;width:90px;marginLeft=10px\">"+
			"<p>开始时间</p>"+
			"<select id=\"s1Id\" style=\"width: 100px;margin-bottom:10px\">"+
				"<option></option>"+//2020
				"<option value="+s[0]+" id=\"sid1\">"+s[0]+"</option>"+
				"<option value="+s[1]+" id=\"sid2\">"+s[1]+"</option>"+
				"<option value="+s[2]+" id=\"sid3\">"+s[2]+"</option>"+
				"<option value="+s[3]+" id=\"sid3\">"+s[3]+"</option>"+
			"</select>"+
			"<br>"+
			"<p>结束时间</p>"+
			"<select id=\"s2Id\" style=\"width: 100px;margin-bottom:10px\">"+
				"<option></option>"+
				"<option value="+e[0]+" id=\"eid1\">"+e[0]+"</option>"+
				"<option value="+e[1]+" id=\"eid2\">"+e[1]+"</option>"+
				"<option value="+e[2]+" id=\"eid3\">"+e[2]+"</option>"+
				"<option value="+e[3]+" id=\"eid4\">"+e[3]+"</option>"+
			"</select>"+
			"<br>"+
			"<p>距离</p>"+
			"<input id=\"lenId\" type=\"text\" name=\"length\" style=\"width: 100px;margin-bottom:10px\">"+
			"<br>"+
			"<input type=\"button\" onclick=\"mission("+cameraid+","+time+","+xx+","+yy+",cameralist,clen)\" style=\"margin-bottom:10px\" value=\"查询\"></input>"+
			"<br>"+
			"<img id=\"myimg\">"+
			"<img onClick=\"close1()\" class=\"vclose\" src=\"./static/icon/close.jpg\" width=\"25\" height=\"25\"/>"+
		"</div>"+
		"<script src=\"./Public/video/video.js\"></script>";
	
	$('.videos').html(display);
	$('.videos').show();
}

function formtime(yy,mm,dd,hh,min){
	var result=yy.toString();
	if(mm<10)
		result+="0";
	result+=mm.toString();
	
	if(dd<10)
		result+="0";
	result+=dd.toString();
	
	if(hh<10)
		result+="0";
	result+=hh.toString();
	
	if(min<10)
		result+="0";
	result+=min.toString();
	
	return result;
}