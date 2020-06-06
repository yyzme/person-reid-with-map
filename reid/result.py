# -*- coding: utf-8 -*-

from __future__ import print_function, division

import numpy as np
from camerabase import getcamera
import torch
from extract import imgfeature
import scipy.io

moon=[31,28,31,30,31,30,31,31,30,31,30,31]
len=5

def reidapi(image,camera,current,start,end,length):
    cameras=getcamera(camera=camera,length=length)
    
    namelist=[]
    year=int(start[0:4])#2020 05 01 10 00
    month=int(start[4:6])
    date=int(start[6:8])
    hour=int(start[8:10])
    minute=int(start[10:-1]+start[-1])
    
    ey=int(end[0:4])
    em=int(end[4:6])
    ed=int(end[6:8])
    eh=int(end[8:10])
    emin=int(end[10:-1]+end[-1])
    
    while not (year==ey and month==em and date==ed and hour==eh and minute==emin):
        one=str(year)
        if month<10:
            one+="0"
        one+=str(month)
        if date<10:
            one+='0'
        one+=str(date)
        if hour<10:
            one+='0'
        one+=str(hour)
        mmm=minute//5
        if mmm<10:
            one+='0'
        one+=str(mmm)
        
        namelist.append(one)
        
        minute+=5
        if minute>=60:
            minute=0
            hour+=1
            if hour==24:
                hour=0
                date+=1
                monmax=moon[month]
                if month==2 and ((year%4==0 and year%100!=0) or year%400==0):
                    monmax+=1
                if date>monmax:
                    date=1
                    month+=1
                    if month>12:
                        month=1
                        year+=1
    
    query=imgfeature(image,current)
    results={}
    
    for camera in cameras:
        p=[]
        time=[]
        img=[]
        
        for name in namelist:
            path="../video/"+camera+"/"+name+".mat"
            a,b,c=result(path=path,query=query,num=len)#affinity,img,time
            if a==None:
                continue
            
            for i in range(len):
                p.append(a[i])
                img.append(b[i])
                time.append(c[i])
        
        #sort
        index = np.argsort(p)
        index = index[::-1]
        pp=[]
        ii=[]
        tt=[]
        for i in range(len):
            pp.append(p[index[i]])
            ii.append(img[index[i]])
            tt.append(time[index[i]])
        
        results[camera]={
            "image":ii,
            "affinity":pp,
            "time":tt
        }
    
    inf={
        "code":0,
        "msg":"SUCCESS",
        "result":results
    }
    
    return inf

def result(path,query,num=5):
    try:
        result = scipy.io.loadmat(path)
    except:
        return None,0,0
    
    print(path)
    gallery = torch.FloatTensor(result['feature'])
    image=torch.FloatTensor(result['image'])
    time=torch.FloatTensor(result['time'])
    print('aaa')
    
    query = query.cuda()
    gallery = gallery.cuda()
    
    query = query.view(-1,1)
    score = torch.mm(gallery,query)
    score = score.squeeze(1).cpu()
    score = score.numpy()
    # predict index
    index = np.argsort(score)  #from small to large
    index = index[::-1]
    
    index=index[:num]
    p=[]
    img=[]
    tt=[]
    for k in range(num):
        p.append(score[index[k]])
        img.append(image[index[k]])
        tt.append(image[k])
    
    return p,img,tt