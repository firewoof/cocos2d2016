#ifndef __HttpDownload__
#define __HttpDownload__

#include "cocos2d.h"
//http обтьсп╧ь
#include "network/HttpClient.h"
#include "network/HttpRequest.h"
#include "network/HttpResponse.h"
#include "CMD5Checksum.h"


class HttpDownload
{
public:
	HttpDownload();
	~HttpDownload();

public:
	void downloadImage(const std::string& url, const std::function<void(std::string& filename)>& callback);
};

#endif