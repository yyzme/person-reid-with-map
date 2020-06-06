# -*- coding: utf-8 -*-

from __future__ import print_function, division

import argparse
from math import floor
from video import function
from feature import getf

if __name__=="__main__":
    parser = argparse.ArgumentParser(description='Object Detect')
    parser.add_argument('--videopath',default="video.avi", type=str,help='')
    parser.add_argument('--time',default='0', type=str,help='gpu_ids: e.g. 0  0,1,2  0,2')
    parser.add_argument('--camera',default='0', type=str,help='gpu_ids: e.g. 0  0,1,2  0,2')
    opt = parser.parse_args()
    
    video=opt.videopath
    time=opt.time#202005011000
    
    nn=time[-2]+time[-1]
    name=time[0:-2]
    nn=floor(int(nn)/5)
    
    menu=function(videofile=video,time=name,cc=nn,camera=opt.camera)
    
    getf(menu,opt.camera)