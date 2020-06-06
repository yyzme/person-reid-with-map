# encoding: utf-8

import torch
from torch import nn

class TripleLoss(nn.Module):
    def __init__(self, margin=0.3):
        super(TripleLoss, self).__init__()
        self.margin = margin # 阈值
        self.rank_loss = nn.MarginRankingLoss(margin=margin)
 
    def forward(self, inputs, labels, norm=False):      
        dist_mat = self.euclidean_dist(inputs, inputs, norm=norm)  # 距离矩阵
        dist_ap, dist_an = self.hard_sample(dist_mat, labels) # 取出每个anchor对应的最大
        y = torch.ones_like(dist_an) # 系数矩阵，1/-1
        loss = self.rank_loss(dist_ap, dist_an, y)
        return loss
 
    @staticmethod
    def hard_sample( dist_mat, labels, ):
        # 距离矩阵的尺寸是 (batch_size, batch_size)
        assert len(dist_mat.size()) == 2
        assert dist_mat.size(0) == dist_mat.size(1)
        N = dist_mat.size(0)
 
        # 选出所有正负样本对
        is_pos = labels.expand(N, N).eq(labels.expand(N, N).t()) # 两两组合， 取label相同的a-p
        is_neg = labels.expand(N, N).ne(labels.expand(N, N).t()) # 两两组合， 取label不同的a-n
        
        list_ap, list_an = [], []
        # 取出所有正样本对和负样本对的距离值
        for i in range(N):
            list_ap.append( dist_mat[i][is_pos[i]].max().unsqueeze(0) ) 
            list_an.append( dist_mat[i][is_neg[i]].max().unsqueeze(0) )
            dist_ap = torch.cat(list_ap)  # 将list里的tensor拼接成新的tensor
            dist_an = torch.cat(list_an)
        return dist_ap, dist_an
 
    @staticmethod
    def normalize(x, axis=1):
        x = 1.0*x / (torch.norm(x, 2, axis, keepdim=True) + 1e-12)
        return x
 
    @staticmethod
    def euclidean_dist(x, y, norm=True):
        if norm:
            x = self.normalize(x)
            y = self.normalize(y)
        m, n = x.size(0), y.size(0)
        xx = torch.pow(x, 2).sum(dim=1, keepdim=True).expand(m, n)
        yy = torch.pow(y, 2).sum(dim=1, keepdim=True).expand(n, m).t()
        dist = xx + yy # 任意的两个样本组合， 求第二范数后求和 x^2 + y^2
        dist.addmm_( 1, -2, x, y.t() ) # (x-y)^2 = x^2 + y^2 - 2xy
        dist = dist.clamp(min=1e-12).sqrt()
        return dist

class CrossEntropyLabelSmooth(nn.Module):
    def __init__(self, num_classes, epsilon=0.1, use_gpu=True):
        super(CrossEntropyLabelSmooth, self).__init__()
        self.num_classes = num_classes
        self.epsilon = epsilon
        self.use_gpu = use_gpu
        self.logsoftmax = nn.LogSoftmax(dim=1)

    def forward(self, inputs, targets):
        log_probs = self.logsoftmax(inputs)
        targets = torch.zeros(log_probs.size()).scatter_(1, targets.unsqueeze(1).data.cpu(), 1)
        if self.use_gpu: targets = targets.cuda()
        targets = (1 - self.epsilon) * targets + self.epsilon / self.num_classes
        loss = (- targets * log_probs).mean(0).sum()
        return loss

def make_loss(num_classes):    # modified by gu
    triplet = TripleLoss()  # triplet loss
    xent = CrossEntropyLabelSmooth(num_classes=num_classes)     # new add by luo
    
    def loss_func(score, feat, target):
        return xent(score, target) + 0.0001*triplet(feat, target)

    return loss_func
