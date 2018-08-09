#include "NativeTool.h"
//#include <iostream>
#include <stdio.h>
#include "cocos2d.h"
#include "Common.h"
#include "ImageCrop.h"
//#include "platform/CCFileUtils.h"

USING_NS_CC;


NativeTool::NativeTool()
{
}


NativeTool::~NativeTool()
{
}

//返回程序启动至今的毫秒数
double NativeTool::getClockTick()
{

	double times = (double)clock() / CLOCKS_PER_SEC * 1000;

	//CCLOG("clock() :: %ld", clock() / CLOCKS_PER_SEC);
	//CCLOG("CLOCKS_PER_SEC:: %ld", CLOCKS_PER_SEC);
	//CCLOG("clock :: %f ", clock() * 1.0 / CLOCKS_PER_SEC * 1000);
	//CCLOG("Elapsed time:%u secs", clock() / CLOCKS_PER_SEC);

	return times;
}

double NativeTool::getCurMillSecs()
{	
	double millSecs = cocos2d::utils::gettime() * 1000;
	//CCLOG("millSecs:: %f", millSecs);
	return millSecs;
}


