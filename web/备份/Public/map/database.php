<?php
	$con = mysqli_connect('localhost','root','');
	if (!$con){
		die('Could not connect: ' . mysqli_error($con));
	}
	
	mysqli_select_db($con,"reid");//选择数据库
	mysqli_set_charset($con, "utf8");//设置编码
	
	$sql="SELECT * from camera";
	$result = mysqli_query($con,$sql);
	
	$n=0;
	$size=array();
	
	while($row = mysqli_fetch_array($result)){
		array_push($size,$row['cameraid'],(float)$row['latitude'],(float)$row['longitude']);
		$n=$n+1;
	}
	
	$marker=array(
		'num'=>$n,
		'size'=>$size,
	);
	
	mysqli_close($con);
	
	$json_string=json_encode($marker);
	echo $json_string;
?>