//
//  GameFileUtils.h
//  Created by zouly on 16-7-21.
//
//

#ifndef __BMGame__GameFileUtils__
#define __BMGame__GameFileUtils__

#include <iostream>
#include <vector>
#include "cocos2d.h"


#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)
#include <windows.h>  
#include <io.h>
#include <stdio.h>
#endif

class GameFileUtils {
  
public:
	GameFileUtils();
	virtual ~GameFileUtils();

    /**
     * write data to file
     * if the file is not exist, create it
     */
    static int writeFile(const std::string& filePath, cocos2d::Data* data, const std::string& writeType="w");
    
    /**
     * write string to file
     * if the file is not exist, create it
     */
    static int writeStringToFile(const std::string& filePath, const std::string& data, const std::string& writeType="w");
    
    /**
     * delete file
     */
    static int deleteFile(const std::string& filePath);
    /**
     * create path if it is not exist
     */
    static int createPath(const std::string& filePath);
    
    /**
     * if android, use sdcard/
     */
    static std::string getWritablePath();
    
    /**
     * delete all files in writablePath
     */
    static void removeAllFiles(const std::string& relativePath);
    
    /**
     * get file list in path
     */
    static std::vector<std::string> getFileListInPath(const std::string& path = nullptr, bool isGetDir=false);
    
    /**
     * get file list in path
     */
    static std::vector<std::string> getFileList(const std::string& path, std::vector<std::string>& fileList, bool isGetDir=false);

	/*
	* get file name list in path
	*/
	static std::vector<std::string> getFileNameListInPath(const std::string& folderPath, bool isGetDir);
    
    //static bool verifyFileWithSha1(const std::string& fileName, const std::string& sha1Code);

	//将char* 转成wchar_t*的实现函数如下：

	//这是把asii字符转换为unicode字符，和上面相同的原理
	

};
#endif /* defined(__BMGame__GameFileUtils__) */