#ifndef _CUSTOM_CSB_H_
#define  _CUSTOM_CSB_H_
#include <time.h>
#include "Common.h"

#include "CMD5Checksum.h"
#include "HttpDownload.h"
#include "ImageCrop.h"

//#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)  
//#include "curl/include/win32/curl/curl.h"
//#pragma comment(lib,"libcurl_imp.lib")
//#elif (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)  
//#include "curl/curl.h"
//#endif  

using namespace std;


class NativeTool
{
public:
	NativeTool();
	virtual ~NativeTool();

	static double getClockTick();
	static double getCurMillSecs();

	static std::string generateAESKey(){ return Common::generateAESKey();}
	static std::string AESEncryt(string Data, const char * pwd){ return Common::AESEncryt(Data, pwd); }
	static std::string AESDecryt(string final_encode, const char * pwd){ return Common::AESDecryt(final_encode, pwd); }

	static std::string stringByMD5(const string& srcStr) { return CMD5Checksum::GetMD5OfString(srcStr); }

	static void downloadImage(const string& url, const std::function<void(string& filename)>& callback) 
	{
		HttpDownload* httpDownload = new HttpDownload();
		httpDownload->downloadImage(url, callback);
	}

	static void openPhoto(const std::function<void(std::string filepath)>& callback)
	{
		ImageCrop* imageCrop = new ImageCrop();
		imageCrop->openPhoto(callback);
	}

	static void openCamera(std::function<void(std::string filepath)>& callback)
	{
		ImageCrop* imageCrop = new ImageCrop();
		imageCrop->openCamera(callback);
	}
};

#endif
