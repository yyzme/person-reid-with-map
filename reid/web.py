# -*- coding: utf-8 -*-

import flask,json
from flask import request
from flask import Response
import base64
from result import reidapi

server = flask.Flask(__name__)

@server.route('/recognition', methods=['post'])
def registerPost():
    try:
        image=request.values.get('image')
        equipmentId=request.values.get('equipmentId')
        veiryTime=request.values.get('veiryTime')
        StartTime=request.values.get('StartTime')
        EndTime=request.values.get("EndTime")
        length=request.values.get('length')
    except:
        inf={
            "code":400,
            "msg":"ERROR_JSON",
            "result":{}
        }
        
        resp = Response(json.dumps(inf),content_type='application/json')
        resp.headers['Access-Control-Allow-Origin'] = 'http://127.0.0.1:81'
        resp.headers['Access-Control-Allow-Methods'] =  'POST'
            
        return resp
    
    none=image is None or equipmentId is None or StartTime is None or EndTime is None or length is None
    space=(image=="")or(equipmentId=="")or(StartTime=="")or(EndTime=="")or(length=="")
    if none and space:
        inf={
            "code":400,
            "msg":"ERROR_JSON",
            "result":{}
        }
        
        resp = Response(json.dumps(inf),content_type='application/json')
        resp.headers['Access-Control-Allow-Origin'] = 'http://127.0.0.1:81'
        resp.headers['Access-Control-Allow-Methods'] =  'POST'
        
        return resp
    
    try:
        inf=reidapi(image=image,camera=equipmentId,current=veiryTime,start=StartTime,end=EndTime,length=length)
    except:
        inf={
            "code":500,
            "msg":"ERROR_REID",
            "result":{}
        }
        
        resp = Response(json.dumps(inf),content_type='application/json')
        resp.headers['Access-Control-Allow-Origin'] = 'http://127.0.0.1:81'
        resp.headers['Access-Control-Allow-Methods'] =  'POST'
            
        return resp
    
    resp = Response(json.dumps(inf),content_type='application/json')
    resp.headers['Access-Control-Allow-Origin'] = 'http://127.0.0.1:81'
    resp.headers['Access-Control-Allow-Methods'] =  'POST'
    
    return resp

if __name__ == '__main__':
    # port可以指定端口，默认端口是5000
    # host默认是127.0.0.1,写成0.0.0.0的话，其他人可以访问，代表监听多块网卡上面
    #server.run(debug=True, port=8899, host='0.0.0.0')
    server.run(debug=True, port=8899)