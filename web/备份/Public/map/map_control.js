function mission(cameraid,time,cameralist,clen){
	//get information
	//image,imageId
	
	var v = document.getElementById('video');//获取视频节点
	v.pause();
	
	var start=document.getElementById("s1Id").value;
	var end=document.getElementById("s2Id").value;
	var len=document.getElementById("lenId").value;
	
	/*if(start==""||end==""||len==""){
		alert("参数不完整");
		return;
	}*/
	
	var img=document.getElementById("myimg");
	var pic=img.src;
	
	/*if(pic.length==0){
		alert("未截取图像");
		return;
	}*/
	
	var information={
		'image':pic,
		'equipmentId':cameraid,
		'veiryTime':time,
		'StartTime':start,
		'EndTime':end,
		'length':len
	};
	
	$.ajax({
		url: "http://127.0.0.1:8899/recognition",
		data:information,
		type:"POST",
		dataType:"JSON",
		crossDomain:true,
		async:true,
		success:function(data){
			//solve data
			var jsondata=eval(data);
			
			//error alert
			if(jsondata['code']!=0){
				var err="error:"+jsondata['code']+"\n"+
						"msg:"+jsondata['msg']
				alert(error);
				return;
			}
			
			//img,time,score,camera
			var result=jsondata['result'];
			var n=0;
			var camera=new Array(n),img=new Array(n),score=new Array(n),imgtime=new Array(n);
			for(var key in result){
				camera[n]=key;
				var a=result[key];
				img[n]=a['image'][0];
				score[n]=a['affinity'][0];
				imgtime[n]=a['time'][0];
				n=n+1;
			}
			
			
			//sort
			var i=0,j=0;
			var record=new Array(n);
			for(i=0;i<n;i++)
				record[i]=i;
			
			//sort
			for(i=0;i<n;i++)
				for(j=0;j<n-1-i;j++)
					if(imgtime[record[i]]>imgtime[record[i+1]]){
						var t=record[i];
						record[i]=record[i+1];
						record[i+1]=t;
					}
			
			//get site
			var site=new Array(n);
			for(i=0;i<n;i++){
				var nn=camera[record[i]];
				for(j=0;j<clen;j++)
					if(cameralist[j][0]==nn)
						break;
				
				if(j==clen){
					alert("camera error");
					return;
				}
				
				site[i]=[cameralist[j][1],cameralist[j][2]];
			}
			
			var display="";
			for(var t=0;t<n;t++){
				var num=record[t];
				var ttime=imgtime[num];//20200501100320
				var date=ttime.slice(0,4)+"."+ttime.slice(4,6)+"."+ttime.slice(6,8);
				var tt=ttime.substring(8,10)+":"+ttime.substring(10,12)+":"+ttime.substring(12,14);
				
				display+=
					"<div class=\"display\" id=\"display\" style=\"border:1px solid;;margin=10px\">"+
						"<img id=\"ImagePic"+t+"\" style=\"float:left\">"+
						"cam:"+camera[num]+"<br>"+date+"<br>"+tt+"<br>"+
						"affinity:"+score[num]+
					"</div>";
				
				if((t+1)%4==0)
					display+="<br>";
			}
			
			display+="<img onClick=\"tclose()\" class=\"vclose\" src=\"./static/icon/close.jpg\" width=\"25\" height=\"25\"/>";
			
			$('.videos').html(display);
			$('.videos').show();
			
			
			for(var t=0;t<n;t++)
				$("#ImagePic"+t).attr("src","data:image/jpg;base64,"+img[record[t]]);
			
			var arrow,arrowHead;
			for(i=0;i<n-1;i++){
				arrow = BM.polyline([ site[i],site[i+1] ]).addTo(map);
				arrowHead = BM.polylineDecorator(arrow, {
					patterns: [
						{offset: '100%', repeat: 0, symbol: BM.Symbol.arrowHead({pixelSize: 15, polygon: false, pathOptions: {stroke: true}})}
					]
				}).addTo(map);
			}
		},
		
		error:function(errorThrown){
			alert("服务响应错误");
		}
	});
}

function tclose(){
	$('.videos').html();
	$('.videos').hide();
}