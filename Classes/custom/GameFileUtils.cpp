//
//  GameFileUtils.cpp
//

#include "GameFileUtils.h"
#include "Common.h"
#include "cocos2d.h"
//#include "sha1.h"
#if (CC_TARGET_PLATFORM != CC_PLATFORM_WIN32)
#include <fcntl.h>
#include <dirent.h>
#include <sys/stat.h>
#include <unistd.h>
#endif

#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)
#include "direntWin32.h"
#endif

using namespace std;
USING_NS_CC;

GameFileUtils::GameFileUtils()
{
}


GameFileUtils::~GameFileUtils()
{
}

int GameFileUtils::writeFile(const std::string& filePath, cocos2d::Data *data, const std::string& writeType){
    
    FILE* filefd = fopen(filePath.c_str(), writeType.c_str());
    
    if (filefd==NULL) {
        std::cout<<"create file is err!"<<std::endl;
        return -1;
    }
    fwrite(data->getBytes(), data->getSize(), 1, filefd);
//    CCLOG("%s) write file: %s", writeType,filePath);
    fclose(filefd);
    return 0;
}

int GameFileUtils::writeStringToFile(const std::string &filePath, const std::string &data, const std::string& writeType){
    FILE* filefd = fopen(filePath.c_str(), writeType.c_str());
    
    if (filefd==NULL) {
        std::cout<<"create file is err!"<<std::endl;
        return -1;
    }
    fwrite(data.c_str(), data.size(), 1, filefd);
    //    CCLOG("%s) write file: %s", writeType,filePath);
    fclose(filefd);
	CCLOG("write path: %s", filePath.c_str());
    return 0;
}

int GameFileUtils::deleteFile(const std::string& filePath){

    CCLOG("delete: %s",filePath.c_str());
    return remove(filePath.c_str());
}

int GameFileUtils::createPath(const std::string& filePath){
    
    string path = getWritablePath();

    vector<string*>* dirList = Common::spliteString(filePath, "/");
    
    int minus = filePath.back()=='/'?0:1;
    
    for (int i=0; i<dirList->size()-minus; i++) {
        string& dirName = *dirList->at(i);
        if (dirName.empty()) {
            continue;
        }
        printf("%s/",dirName.c_str());
        if (access(path.append(dirName).append("/").c_str(), 0)!=0) {
			if (mkdir(path.c_str(), 0777)<0){
                CCLOG("create dir fail: %s ",path.c_str());
            }
        }
    }
//    printf("\n");
    //Common::clearVector(dirList);
    CC_SAFE_DELETE(dirList);
    
    return 0;
}


std::string GameFileUtils::getWritablePath(){
    string path = FileUtils::getInstance()->getWritablePath();
    return path;
}


void GameFileUtils::removeAllFiles(const std::string& relativePath){
    std::vector<std::string> fileList = getFileListInPath((getWritablePath()+relativePath).c_str(),true);
    
    if(fileList.empty()){
        return;
    }
    for (std::vector<std::string>::iterator itr = fileList.begin(); itr!=fileList.end(); itr++) {
        deleteFile((*itr).c_str());
    }

    
    //Common::clearVector(fileList);
    //CC_SAFE_DELETE(fileList);
}

std::vector<std::string> GameFileUtils::getFileListInPath(const std::string& folderPath,bool isGetDir){
    
    //获得完整路径
    string fullPath;
	size_t pos = folderPath.find("/");
	if (pos != string::npos) {
		fullPath = folderPath;
	}
	else{
		fullPath = getWritablePath() + folderPath;
	}
	
	/*{
		if (!folderPath.empty() && !folderPath.compare(""))
		{
		CCLOG("1111folderPath::%s", folderPath);
		fullPath = getWritablePath();
		fullPath.append(folderPath);
		}
		fullPath = getWritablePath();
		CCLOG("2222fullPath::%s", folderPath);
		}*/

	DIR *dp;
	struct dirent* dirp;
    
	if((dp = opendir(fullPath.c_str())) == NULL)
	{
		CCLOG("can not match the folder path %s",fullPath.c_str());
		std::vector<std::string> empty;
		return empty;
	}
    //std::vector<std::string>* fileList = new std::vector<std::string>;
	std::vector<std::string> fileList;
	while ((dirp = readdir(dp))!=NULL)
	{		
		
#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)		
		string path = fullPath + "/" + dirp->d_name;
		int mystringSize = (int)(path.length() + 1);
		wchar_t* mywstring = new wchar_t[mystringSize];
		MultiByteToWideChar(CP_ACP, 0, path.c_str(), -1, mywstring, mystringSize);
		//use mywstring to do:
		if (GetFileAttributes(mywstring) == FILE_ATTRIBUTE_DIRECTORY)
		{
		delete [] mywstring;
#else
		string path = fullPath + "/" + dirp->d_name;
		struct stat buf;
		stat(path.c_str(), &buf);
		// 如果是目录
		if (S_ISDIR(buf.st_mode))
		{
#endif                
            
            if( (strcmp(dirp->d_name,".") == 0 ) || (strcmp(dirp->d_name,"..") == 0))
            {
                continue;
            }
                        //CCLOG("name=%s,mode=%d    %s",dirp->d_name, buf.st_mode, fullPath.c_str());			
            
            //如果是目录，递归调用
            if (isGetDir) {
                fileList.push_back(path);
            }
            std::vector<std::string> subList = getFileListInPath(path.c_str(),isGetDir);
            fileList.insert(fileList.end(), subList.begin(), subList.end());
            //delete subList;
		}
		else
		{
			if ((strcmp(dirp->d_name, ".") == 0) || (strcmp(dirp->d_name, "..") == 0))
			{
				continue;
			}
			// 如果是文件            
            //std::string* fileName = new std::string(path);		
			CCLOG("getFileListInPath path::%s", path.c_str());
			fileList.push_back(path);
		}
	}
    closedir(dp);
    return fileList;
}

std::vector<std::string> GameFileUtils::getFileNameListInPath(const std::string& folderPath, bool isGetDir){

	//获得完整路径
	string fullPath;
	size_t pos = folderPath.find("/");
	if (pos != string::npos) {
		fullPath = fullPath;
	}
	else{
		fullPath = getWritablePath() + folderPath;
	}

	/*{
	if (!folderPath.empty() && !folderPath.compare(""))
	{
	CCLOG("1111folderPath::%s", folderPath);
	fullPath = getWritablePath();
	fullPath.append(folderPath);
	}
	fullPath = getWritablePath();
	CCLOG("2222fullPath::%s", folderPath);
	}*/

	DIR *dp;
	struct dirent* dirp;

	if ((dp = opendir(fullPath.c_str())) == NULL)
	{
		CCLOG("can not match the folder path %s", fullPath.c_str());
		std::vector<std::string> empty;
		return empty;
	}
	//std::vector<std::string>* fileList = new std::vector<std::string>;
	std::vector<std::string> fileNameList;
	while ((dirp = readdir(dp)) != NULL)
	{

#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)		
		string path = fullPath + "/" + dirp->d_name;
		int mystringSize = (int)(path.length() + 1);
		wchar_t* mywstring = new wchar_t[mystringSize];
		MultiByteToWideChar(CP_ACP, 0, path.c_str(), -1, mywstring, mystringSize);
		//use mywstring to do:
		if (GetFileAttributes(mywstring) == FILE_ATTRIBUTE_DIRECTORY)
		{
			delete[] mywstring;
#else
		string path = fullPath + "/" + dirp->d_name;
		struct stat buf;
		stat(path.c_str(), &buf);
		// 如果是目录
		if (S_ISDIR(buf.st_mode))
		{
#endif                

			if ((strcmp(dirp->d_name, ".") == 0) || (strcmp(dirp->d_name, "..") == 0))
			{
				continue;
			}
			//CCLOG("name=%s,mode=%d    %s",dirp->d_name, buf.st_mode, fullPath.c_str());			

			//如果是目录，递归调用
			if (isGetDir) {
				fileNameList.push_back(dirp->d_name);
			}
			std::vector<std::string> subList = getFileNameListInPath(path.c_str(), isGetDir);
			fileNameList.insert(fileNameList.end(), subList.begin(), subList.end());
			//delete subList;
		}
		else
		{
			if ((strcmp(dirp->d_name, ".") == 0) || (strcmp(dirp->d_name, "..") == 0))
			{
				continue;
			}
			// 如果是文件            
			//std::string* fileName = new std::string(path);		
			CCLOG("getFileNameListInPath path::%s", dirp->d_name);
			fileNameList.push_back(dirp->d_name);
		}
		}
	closedir(dp);
	return fileNameList;
	}

std::vector<std::string> GameFileUtils::getFileList(const std::string& folderPath, std::vector<std::string>& fileList, bool isGetDir){
    //获得完整路径
    string fullPath;
    if (folderPath[0]=='/') {
        fullPath=folderPath;
    }else{
		fullPath = FileUtils::getInstance()->getWritablePath();
        fullPath.append(folderPath);
    }
    
    DIR *dp;
    struct dirent* dirp;
    
    if((dp = opendir(fullPath.c_str())) == NULL)
    {
        CCLOG("can not match the folder path %s",fullPath.c_str());
        return fileList;
    }

    while ((dirp=readdir(dp))!=NULL)
    {
        string path = fullPath+"/" + dirp->d_name;
        
#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)		
		int mystringSize = (int)(path.length() + 1);
		wchar_t* mywstring = new wchar_t[mystringSize];
		MultiByteToWideChar(CP_ACP, 0, path.c_str(), -1, mywstring, mystringSize);
		//use mywstring to do:
		if (GetFileAttributes(mywstring) == FILE_ATTRIBUTE_DIRECTORY)
		{
			delete[] mywstring;
#else
		struct stat buf;
		stat(path.c_str(), &buf);
		// 如果是目录
		if (S_ISDIR(buf.st_mode))
		{
#endif  
            
            if( (strcmp(dirp->d_name,".") == 0 ) || (strcmp(dirp->d_name,"..") == 0))
            {
                continue;
            }
            //            CCLOG("name=%s,mode=%d    %s",dirp->d_name, buf.st_mode, fullPath.c_str());
            
            //如果是目录，递归调用
            if (isGetDir) {
                fileList.push_back(path);
            }
            getFileList(path.c_str(),fileList,isGetDir);

        }
        else
        {
            // 如果是文件
//            CCLOG("name=%s,mode=%d    %s",dirp->d_name, buf.st_mode, path.c_str());
            fileList.push_back(path);
        }
    }
    closedir(dp);
    return fileList;
}

//bool GameFileUtils::verifyFileWithSha1(const std::string &fileName, const std::string &sha1Code){
//    cocos2d::Data fileData = cocos2d::FileUtils::getInstance()->getDataFromFile(fileName);
//    if (fileData.getSize()<=0) {
//        return false;
//    }
//    SHA1* sha1 = new SHA1;
//    sha1->addBytes((const char*)fileData.getBytes(), (int)fileData.getSize());
//    unsigned char* digest = sha1->getDigest();
//    std::string localSha1Str = Common::dataToHexString(digest,20);
//    free(digest);
//    delete sha1;
//    CCLOG("%s\n%s",localSha1Str.c_str(),sha1Code.c_str());
//    return localSha1Str.compare(sha1Code)==0;
//}



//#include "dirent.h"

