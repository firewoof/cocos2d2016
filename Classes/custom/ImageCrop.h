#ifndef ImageCrop_hpp
#define ImageCrop_hpp

#include <stdio.h>
#include <functional>

#define kImageCropEvent "ImageCropEvent"


class ImageCrop
{
public:
	ImageCrop();
	static ImageCrop* getInstance();
	static void destroyInstance();
	void openCamera(const std::function<void(std::string filepath)>& callback);
	void openPhoto(const std::function<void(std::string filepath)>& callback);

#if ( CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
	//设置AppController iOS平台在AppController.mm里调用把rootViewController传递过来
	void setViewController(void* viewController);
	void *m_viewController;
#endif 
private:
    static ImageCrop* _instance;
	//std::function<void(std::string )> _callback;

};

#endif
