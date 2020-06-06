import configparser
import pymysql
from DBUtils.PooledDB import PooledDB, SharedDBConnection
from math import sqrt
from math import cos

def db_con():
    cf = configparser.ConfigParser()
    path = r"./person_reid_config.ini"
    cf.read(path)
    try:
        g_ip = cf.get("database", "ip")
        g_user = cf.get("database", "user")
        g_password = cf.get("database", "password")
        g_dbname = cf.get("database", "dbname")
        
        if g_password=="None":
            g_password=""
    except:
        print("config.get(database) fail.")
        return POOLDB
    
    POOLDB = PooledDB(
        # 指定数据库连接驱动
        creator=pymysql,
        # 连接池允许的最大连接数，0和None表示没有限制
        maxconnections=6,
        # 初始化时，连接池至少创建的空闲连接，0表示不创建
        mincached=2,
        # 连接池中空闲的最多连接数，0和None表示没有限制
        maxcached=5,
        # 连接池中最多共享的连接数量，0和None表示全部共享
        maxshared=3,
        # 连接池中如果没有可用共享连接后，是否阻塞等待，True表示等待
        blocking=True,
        # 一个链接最多被重复使用的次数，None表示无限制
        maxusage=None,
        # 开始会话前执行的命令列表
        setsession=[],
        host=g_ip,
        port=3306,
        user=g_user,
        passwd=g_password,
        db=g_dbname,
        charset='utf8'
    )

    return POOLDB

def db_inf(sql_select):
    pool=db_con()
    db=pool.connection()
    cursor = db.cursor()
    
    cursor.execute(sql_select)
    results = cursor.fetchall()
    
    db.close()
    
    return results

def getcamera(camera,length):
    sql_select="select cameraid,latitude,longitude from camera";
    results=db_inf(sql_select=sql_select)
    
    length=float(length)
    
    allcamera={}
    x,y=0,0
    for row in results:
        cid=row[0]
        if cid==camera:
            x,y=row[1],row[2]
        else:
            allcamera[row[0]]=(row[1],row[2])
    
    cameras=[]
    for key in allcamera:
        (xx,yy)=allcamera[key]
        len=sqrt( (111000*(x-xx))**2 + (111000*cos((x+xx)/2)*(y-yy))**2 )
        if len<=length:
            cameras.append(key)
    
    return cameras
