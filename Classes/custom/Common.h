//
//  Common.h
//  Created by no one on 2016-7-21.
//
//

#ifndef __CCX_5__Common__
#define __CCX_5__Common__

//#include "cocos-ext.h"
#include "cocos2d.h"

using namespace std;
//USING_NS_CC_EXT;
//USING_NS_CC;

class Common
{
public:
    
    /**
     如果vector保存的是一组指针，清掉指针的内存，指针是通过new出来的
     */
    template<class T>
    static inline void clearVector(vector<T*>* _vect){
        if (nullptr==_vect) {
            return;
        }
        for(int i=0;i<(_vect)->size();i++){
            CC_SAFE_DELETE((_vect)->at(i));
        }
        (_vect)->clear();
    }
   
    static vector<string*>* spliteString(const string& str, const char* delim);
    
	static cocos2d::Data* AES128EncryptWithKey(const string& Data, const string& keyhexstr);

	//
	static int RSACryptFromFile();

	static std::string base64_encode(unsigned char const* bytes_to_encode, unsigned int in_len);
	static std::string base64_decode(std::string const& encoded_string);

	static std::string CharStr2HexStr(unsigned char const* pucCharStr, int iSize);
	static std::string HexStr2CharStr(char const* pszHexStr, int iSize);

	static std::string generateAESKey(int len = 16);
	static std::string AESEncryt(string Data, const char * pwd);
	static std::string AESDecryt(string final_encode, const char * pwd);

    /**
     CCData由于在线程中用到, 所以要自己手动释放(delete)
     NAR means No Auto Release
     */
	static cocos2d::Data* AES128DecryptWithKey_NAR(cocos2d::Data* data, const string& key);
    
// ------------ 从字符串中读出 host & port ------------------
    /**
     切割ip:port这样格式的地址
     */
    static const std::string getIPFromAddress(const string& address);
    /**
     切割ip:port这样格式的地址
     */
    static int getPortFromAddress(const string& address);
    
//- random method
    
    /** 随机random 0 至 1 之前的数 */
    static float random_0_TO_1();

    static int random(int range);
    
    /**
     是否random至一个数小于指定的数
     */
    static bool isRandomInRange(int numLess100);
    
    static bool randomBool();
    
    /** 返回 －(range-1) 至 range-1 范围内的随机数 */
    static int random(int range, bool isOnlyPlus);
    
    /** 返回 begin(包括)至end(不包括) 之间的随机数 */
    static int randomFromBegin(int begin, int end);
    
// ------------------------数字处理-------------
    /**
     16进制转10进制
     */
    static int hexStringToInt(const std::string& hexStr);
    static std::string dataToHexString(const unsigned char* data, size_t length);
    
// ----------时间日期-------------------
    /**
     格式化时间输出格式 类型"10:22:33"
     */
    static const std::string transformTime(int sec);

    /** 将秒数转成 00:00 这样的格式的时间 ， 同样可用于分钟数转换*/
    static const std::string transformTime4(int sec);
    
    static uint64_t getCurrentTime();
// -----------------颜色转换--------------
    // 修改源码 add by fish 2014.4.14
	static inline cocos2d::Color3B ccc3BFromccc4B(const cocos2d::Color4B& c)
    {
		cocos2d::Color3B c3 = { c.r, c.g, c.b };
        return c3;
    }
    
    // 修改源码 add by fish 2014.4.14
	static inline cocos2d::Color4B ccc4BFromccc3B(const cocos2d::Color3B& c)
    {
		cocos2d::Color4B c4 = { c.r, c.g, c.b, 255 };
        return c4;
    }

    
//-- 方便的功能
    /**
     颜色转成16进制的格式:
     eg:
     ff0000
     */
    static const std::string colorToHex(int red, int green, int blue);
    
    /**
     颜色转成16进制的格式:
     eg:
     ff0000
     */
	static const std::string colorToHex(const cocos2d::Color3B& color);
    
    /**
     10进制转16进制
     isAdaptSize: 是否不足2位的时候, 前面补0
     */
    static const std::string toHex(int tmpid, bool isAdaptSize);
    
    /**
     指定str从beginIndex开始, 后续的文字是否与targetStr匹配
     */
    static bool isSubStringMatch(const string& str, const string& targetStr, int beginIndex);
    
    
    /** 截取字符，必满乱码的处理；*/
    static string subString(const std::string& str ,size_t start ,size_t end);
    
    /** 获取字符串的真实长度处理 */
    static int getRealStringLength(const std::string& str);
    
    /** 检查字符p是否是双字节汉字的一个字节 */
    static bool isChinese(char p);

    /**
     uft8下一个字符
     就是直接复制的ccUTF8.cpp里面一个宏，将其改造成函数公开出来
     */
    static char* utf8GetNextChar(char* p);
    static const char* utf8GetNextChar(const char* p);

    /** 比较两个UTF8字符 */
    static bool utf8CharEqual(const char* ch1, const char* ch2);

    /** 求UTF8字符串中每个字符的下标 */
    static long utf8CharIndices(const char* p, size_t* indices);

    /**
     从str中去除包含在trimChars中的所有字符（不包括最后的'\0'）
     说明：此函数直接修改传入的第一个参数，并将其作为返回值返回
     */
    static char* trimmingCharactersInSet(char* str, const char* trimChars);

    /** 去除前后空格 */
    static char* trim(char *str);

    /**
     字符串长度：其中ascii字符为计1，汉字计2
     参数2：indices将写入各个字开始的下标，可传NULL。如果indices中有些值为(size_t)-1，则说明这个下标处是一个汉字
     参数3：maxLen是检测的最大长度，这个与返回值一样，ascii字符为计1，汉字计2，如果参数2传NULL，这个值将被忽略
     返回值为长度
     */
    static size_t stringNormalLength(const char* str, size_t* indices, size_t maxLen);

// ----------string-----------
    static void remove_space(string& str);
    static std::string remove_space(const std::string& str);

    static char *adjustStringForAtlas(char* str);
    static std::string adjustStringForAtlas(const std::string& str);
    static std::string& adjustStringForAtlas(std::string& str);



//------调用浏览器打开网页------
    static void openUrl(const char* strUrl);
};

#endif /* defined(__CCX_5__Common__) */
