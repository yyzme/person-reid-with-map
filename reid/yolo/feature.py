# -*- coding: utf-8 -*-

from __future__ import print_function, division

import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim import lr_scheduler
from torch.autograd import Variable
import torch.backends.cudnn as cudnn
import numpy as np
import torchvision
from torchvision import datasets, models, transforms
import os
import scipy.io
#import yaml
from model import PCB, PCB_test
from base64 import b64encode

def getf(path,camera):
    flag=torch.cuda.is_available()
    
    menu="../../video/"+camera
    if not os.path.exists(menu):
        os.makedirs(menu)
    
    torch.cuda.set_device(0)
    #cudnn.benchmark = True
    
    dataloaders,image_datasets=prepare(data_dir="../../work/"+camera,menu=path,batch_size=2,worker=4)
    model=load_model(use_PCB=flag)
    
    time=[]
    imgs=[]
    paths = image_datasets[path].imgs
    for pp in paths:
        img=imageToStr(pp[0])
        imgs.append(img)
        
        filename = os.path.basename(pp[0])
        filename=filename.split('_')[0]
        time.append(filename)
    
    feature = extract_feature(model,dataloaders[path])
    
    result = {'feature':feature.numpy(),'time':time,'image':imgs}
    savepath="../../video/"+camera+"/"+path+".mat"
    scipy.io.savemat(savepath,result)

def imageToStr(image):
    with open(image,'rb') as f:
        image_byte=b64encode(f.read())
    image_str=image_byte.decode('ascii') #byte类型转换为str
    return image_str

######################################################################
# Load model
#---------------------------
def load_network(network,name,epoch):
    save_path = os.path.join('../..',name,'net_%s.pth'%epoch)
    network.load_state_dict(torch.load(save_path))
    return network

def load_model(name="model",epoch="last",use_PCB=True):
    model_structure = PCB(751)
    #model_structure = PCB(opt.nclasses)
    model = load_network(model_structure,name,epoch)
    model = PCB_test(model)
    
    model = model.eval()
    if use_PCB:
        model = model.cuda()
    
    return model

######################################################################
# Extract feature
# ----------------------
#
# Extract feature from  a trained model.
#
def fliplr(img):
    '''flip horizontal'''
    inv_idx = torch.arange(img.size(3)-1,-1,-1).long()  # N x C x H x W
    img_flip = img.index_select(3,inv_idx)
    return img_flip

def extract_feature(model,dataloaders,use_PCB=True,ms=[1]):
    features = torch.FloatTensor()
    #count = 0
    for data in dataloaders:
        img, label = data
        n, c, h, w = img.size()
        #count += n
        #print(count)
        ff = torch.FloatTensor(n,512).zero_().cuda()
        if use_PCB:
            ff = torch.FloatTensor(n,2048,6).zero_().cuda() # we have six parts

        for i in range(2):
            if(i==1):
                img = fliplr(img)
            input_img = Variable(img.cuda())
            for scale in ms:
                if scale != 1:
                    # bicubic is only available in pytorch>= 1.1
                    print(type(scale))
                    input_img = nn.functional.interpolate(input_img, scale_factor=scale, mode='bicubic', align_corners=False)
                outputs = model(input_img) 
                ff += outputs
        # norm feature
        if use_PCB:
            # feature size (n,2048,6)
            # 1. To treat every part equally, I calculate the norm for every 2048-dim part feature.
            # 2. To keep the cosine score==1, sqrt(6) is added to norm the whole feature (2048*6).
            fnorm = torch.norm(ff, p=2, dim=1, keepdim=True) * np.sqrt(6)
            ff = ff.div(fnorm.expand_as(ff))
            ff = ff.view(ff.size(0), -1)
        else:
            fnorm = torch.norm(ff, p=2, dim=1, keepdim=True)
            ff = ff.div(fnorm.expand_as(ff))
        
        features = torch.cat((features,ff.data.cpu()), 0)
    return features

#######################################################################
# prepare data
def prepare(data_dir,menu,batch_size=8,worker=16):
    data_transforms = transforms.Compose([
        transforms.Resize((384,192), interpolation=3),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]) 
    ])
    
    image_datasets = {x: datasets.ImageFolder( os.path.join(data_dir,x) ,data_transforms) for x in [menu]}
    dataloaders = {x: torch.utils.data.DataLoader(image_datasets[x], batch_size,
                                             shuffle=False, num_workers=worker) for x in [menu]}
    
    return dataloaders,image_datasets

if __name__=="__main__":
    getf("202005271703")
