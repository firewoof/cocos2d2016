#include "HttpDownload.h"

USING_NS_CC;
using namespace std;
using namespace cocos2d::network;


HttpDownload::HttpDownload()
{
}

HttpDownload::~HttpDownload()
{
}


/**
**����ͼƬ���浽���ز����棬���뵽Androidƽ̨֮��ע���������Ȩ��
**/
void HttpDownload::downloadImage(const string& url, const std::function<void(string& filename)>& callback)
{
	HttpRequest* request = new HttpRequest();
	request->setUrl(url);
	request->setRequestType(HttpRequest::Type::GET);

	ccHttpRequestCallback httpRequestCallback = [callback](HttpClient* client, HttpResponse* response)
	{
		if (!response)
		{
			return;
		}

		// You can get original request type from: response->request->reqType
		HttpRequest* request = response->getHttpRequest();
		//const char* tag = response->getHttpRequest()->getTag();

		//if (0 != strlen(tag))
		//{
		//	log("%s completed", response->getHttpRequest()->getTag());
		//}
		log("response back url:%s", request->getUrl());		
		string url(request->getUrl());		

		if (!response->isSucceed())
		{
			log("downloadImage error buffer: %s", response->getErrorBuffer());
			return;
		}

		std::vector<char> *buffer = response->getResponseData();
		if (!buffer || buffer->size() == 0) 
		{
			log("downloadImage error buffer is null or size == 0");
			return ;
		}
		 
		//create image
		Image* image = new Image();
		bool ret = image->initWithImageData((unsigned char*)buffer->data(), buffer->size());
		if (!ret) {
			log("download image->initImageData parse failed");
			return;
		}

		string filename = CMD5Checksum::GetMD5OfString(url);
		if (image->getFileType() == Image::Format::PNG) {
			filename += ".png";
		}
		if (image->getFileType() == Image::Format::JPG) {
			filename += ".jpg";
		}
		
		string savePath = FileUtils::getInstance()->getWritablePath() + "downLoadAvatars/" + filename;
		log("savePath:%s", savePath.c_str());
		//save to local		
		image->saveToFile(savePath);

		//�����������
		cocos2d::TextureCache::getInstance()->addImage(image, filename);
		image->release();
		CCLOG("image download complete:: %s", filename.c_str());
		//֪ͨ�ϲ�
		callback(filename);
	};

	//���ǻص�����ͻص�����
	request->setResponseCallback(httpRequestCallback);

	HttpClient::getInstance()->send(request);

	//�ͷ��ڴ�
	request->release();
}