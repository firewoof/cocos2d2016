#include "ImageCrop.h"
#include "cocos2d.h"
#include "CPToolKit.h"

#if ( CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
//#import "ImagePickerViewController.h"
//#import "RootViewController.h"
#endif

#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
#include "platform/android/jni/JniHelper.h"
#include <jni.h>
#define JAVA_CLASS "com.luogu.custom/ImageCrop"
#define JAVA_FUNC_OPEN_PHOTO    "openPhoto"
#define JAVA_FUNC_OPEN_CAMERA   "openCamera"
#endif

#define IMAGE_CROP_SUCCESS "__ImageCropSuccess"

USING_NS_CC;


ImageCrop::ImageCrop()
{
	//Director::getInstance()->getEventDispatcher()->addCustomEventListener(kImageCropEvent, [=](EventCustom *event)
	//{
	//	std::string *imgPath = (std::string*)event->getUserData();
	//	_callback(*imgPath);
	//});
}

ImageCrop* ImageCrop::_instance = nullptr;
ImageCrop* ImageCrop::getInstance()
{
	if (!_instance)
	{
		_instance = new (std::nothrow) ImageCrop();
	}
	return _instance;
}

void ImageCrop::destroyInstance()
{
	CC_SAFE_DELETE(_instance);
}

void ImageCrop::openCamera(const std::function<void(std::string)>& callback)
{   
	CPToolKit::addCallback(IMAGE_CROP_SUCCESS, callback);
#if (CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
	ImagePickerViewController * imagePickerViewController = [[ImagePickerViewController alloc]initWithNibName:nil bundle : nil];

	RootViewController *_viewController = (RootViewController*)m_viewController;
	[_viewController.view addSubview : imagePickerViewController.view];
	[imagePickerViewController takePhoto];
#endif
     

#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
	JniMethodInfo info;
	CCLOG("prepare to access android static func:: openCamera");
	bool ret = JniHelper::getStaticMethodInfo(info, JAVA_CLASS, JAVA_FUNC_OPEN_CAMERA, "()V");
	if (ret)
	{
		info.env->CallStaticVoidMethod(info.classID, info.methodID);
	}
#endif
}

void ImageCrop::openPhoto(const std::function<void(std::string)>& callback)
{
	CPToolKit::addCallback(IMAGE_CROP_SUCCESS, callback);
#if (CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
	ImagePickerViewController * imagePickerViewController = [[ImagePickerViewController alloc]initWithNibName:nil bundle : nil];

	RootViewController *_viewController = (RootViewController*)m_viewController;
	[_viewController.view addSubview : imagePickerViewController.view];
	[imagePickerViewController localPhoto];
#endif
     
#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
	JniMethodInfo info;
	bool ret = JniHelper::getStaticMethodInfo(info, JAVA_CLASS, JAVA_FUNC_OPEN_PHOTO, "()V");
	if (ret)
	{
		info.env->CallStaticVoidMethod(info.classID, info.methodID);
	}
#endif

}

#if (CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
void ImageCrop::setViewController(void *viewController)
{
	m_viewController = viewController;
}
#endif


//--------Java回调C++--------native 方法
#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)

extern "C"
{
	void Java_com_luogu_custom_ImageCrop_onImageSaved(JNIEnv *env, jobject thiz, jstring path)
	{
		std::string strPath = JniHelper::jstring2string(path);
		//必须这样，否则由于线程问题会显示黑块无法正常创建精灵
		Director::getInstance()->getScheduler()->performFunctionInCocosThread([=, strPath]()mutable{
			CPToolKit::exeCallback(IMAGE_CROP_SUCCESS, strPath);
			//Director::getInstance()->getEventDispatcher()->dispatchCustomEvent(kImageCropEvent, &strPath);
		});
	}
}

#endif
