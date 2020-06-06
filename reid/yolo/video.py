from __future__ import division

import os
import torch
import torch.nn as nn
from torch.autograd import Variable
import numpy as np
import cv2 
from util import *
from darknet import Darknet
from preprocess import prep_image, inp_to_image, letterbox_image

def get_test_input(input_dim, CUDA):
    img = cv2.imread("dog-cycle-car.png")
    img = cv2.resize(img, (input_dim, input_dim))
    
    img_ =  img[:,:,::-1].transpose((2,0,1))
    img_ = img_[np.newaxis,:,:,:]/255.0
    img_ = torch.from_numpy(img_).float()
    img_ = Variable(img_)
    
    if CUDA:
        img_ = img_.cuda()
    
    return img_

def prep_image(img, inp_dim):
    orig_im = img
    dim = orig_im.shape[1], orig_im.shape[0]
    img = (letterbox_image(orig_im, (inp_dim, inp_dim)))
    img_ = img[:,:,::-1].transpose((2,0,1)).copy()
    img_ = torch.from_numpy(img_).float().div(255.0).unsqueeze(0)
    return img_, orig_im, dim

def function(videofile,time,cc,camera,confidence=0.5,nms_thesh=0.4):
    menu=time
    if(cc<10):
        menu+='0'
    menu+=str(cc)
    allmenu="../../work/"+camera
    if not os.path.exists(allmenu):
        os.makedirs(allmenu)
    allmenu=allmenu+"/"+menu
    if not os.path.exists(allmenu):
        os.makedirs(allmenu)
    allmenu+='/0'
    if not os.path.exists(allmenu):
        os.makedirs(allmenu)
    
    num=0
    CUDA=torch.cuda.is_available()
    
    model = Darknet("cfg/yolov3.cfg")
    model.load_weights("cfg/yolov3.weights")
    model.net_info["height"] = "416"
    inp_dim = int(model.net_info["height"])
    assert inp_dim % 32 == 0 
    assert inp_dim > 32
    
    if CUDA:
        model.cuda()
    
    model(get_test_input(inp_dim, CUDA), CUDA)
    model.eval()
    
    cap = cv2.VideoCapture(videofile)
    assert cap.isOpened(), 'Cannot capture source'
    
    step = round(cap.get(cv2.CAP_PROP_FPS))
    
    count=-1
    while cap.isOpened():
        ret, frame = cap.read()
        count+=1
        if(count%step!=0):
            continue
        else:
            count=0
        
        num+=1
        if ret:
            img, orig_im, dim = prep_image(frame, inp_dim)
            im_dim = torch.FloatTensor(dim).repeat(1,2)                        
            
            if CUDA:
                im_dim = im_dim.cuda()
                img = img.cuda()
            
            with torch.no_grad():   
                output = model(Variable(img), CUDA)
            output = write_results(output, confidence, num_classes=80, nms = True, nms_conf = nms_thesh)
            
            if type(output) == int:
                continue
            
            im_dim = im_dim.repeat(output.size(0), 1)
            scaling_factor = torch.min(inp_dim/im_dim,1)[0].view(-1,1)
            
            output[:,[1,3]] -= (inp_dim - scaling_factor*im_dim[:,0].view(-1,1))/2
            output[:,[2,4]] -= (inp_dim - scaling_factor*im_dim[:,1].view(-1,1))/2
            
            output[:,1:5] /= scaling_factor
    
            for i in range(output.shape[0]):
                output[i, [1,3]] = torch.clamp(output[i, [1,3]], 0.0, im_dim[i,0])
                output[i, [2,4]] = torch.clamp(output[i, [2,4]], 0.0, im_dim[i,1])
            
            yy=0
            for x in output:
                yy+=1
                
                cls = int(x[-1])
                if(cls!=0):
                    continue
                
                a,b = tuple(x[1:3].int())
                c,d = tuple(x[3:5].int())
                
                result=orig_im[b:d,a:c]
                
                min=num//60+cc*5
                if min<10:
                    min='0'+str(min)
                else:
                    min=str(min)
                second=num%60
                if second<10:
                    second='0'+str(second)
                else:
                    second=str(second)
                
                yyy="_"+str(yy)
                
                imgname=allmenu+"/"+time+min+second+yyy+".jpg"
                try:
                    result=cv2.resize(result,(60,120))
                    cv2.imwrite(imgname,result)
                except:
                    continue
        else:
            break
    
    return menu
