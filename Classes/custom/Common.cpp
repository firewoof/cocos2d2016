//
//  Common.cpp
//  CCX_5
//
//  Created by Fay on 14-3-14.
//
//

#include <algorithm>
#include "Common.h"
#include "Rijndael.h"
#include "external/json/rapidjson.h"

//#include <regex.h>
#include <sys/types.h>
#include <stdio.h>
#include <cstring>
#include <zlib.h>
#include <sstream>

#if (defined WIN32) || (defined _WIN32)
#else
#include <sys/time.h>
#include <string>
#endif


#if CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID
#include "jni/JniHelper.h"
#endif

USING_NS_CC;


// -------------- 分割字符串 ------------------------------
vector<string*>* Common::spliteString(const string& str, const char* delim){
    
    char *cstr, *p;
    vector<string*>* res = new vector<string*>();
    cstr = new char[str.size()+1];
    strcpy(cstr,str.c_str());
    p = strtok(cstr,delim);
    while(p!=nullptr)
    {
        //连续空行也能支持
        //        if(strcmp(p, "")!=0){
        res->push_back(new string(p));
        //        }
        p = strtok(nullptr,delim);
    }
    delete [] cstr;
    
    return res;
}

// -------------- AES加解密 ------------------------------

//Test.cpp
#include "Rijndael.h"

using namespace std;

static const std::string base64_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

static inline bool is_base64(unsigned char c) {
	return (isalnum(c) || (c == '+') || (c == '/'));
}

std::string Common::base64_encode(unsigned char const* bytes_to_encode, unsigned int in_len) {
	std::string ret;
	int i = 0;
	int j = 0;
	unsigned char char_array_3[3];
	unsigned char char_array_4[4];

	while (in_len--) {
		char_array_3[i++] = *(bytes_to_encode++);
		if (i == 3) {
			char_array_4[0] = (char_array_3[0] & 0xfc) >> 2;
			char_array_4[1] = ((char_array_3[0] & 0x03) << 4) + ((char_array_3[1] & 0xf0) >> 4);
			char_array_4[2] = ((char_array_3[1] & 0x0f) << 2) + ((char_array_3[2] & 0xc0) >> 6);
			char_array_4[3] = char_array_3[2] & 0x3f;

			for (i = 0; (i < 4); i++)
				ret += base64_chars[char_array_4[i]];
			i = 0;
		}
	}

	if (i)
	{
		for (j = i; j < 3; j++)
			char_array_3[j] = '\0';

		char_array_4[0] = (char_array_3[0] & 0xfc) >> 2;
		char_array_4[1] = ((char_array_3[0] & 0x03) << 4) + ((char_array_3[1] & 0xf0) >> 4);
		char_array_4[2] = ((char_array_3[1] & 0x0f) << 2) + ((char_array_3[2] & 0xc0) >> 6);
		char_array_4[3] = char_array_3[2] & 0x3f;

		for (j = 0; (j < i + 1); j++)
			ret += base64_chars[char_array_4[j]];

		while ((i++ < 3))
			ret += '=';

	}

	return ret;

}

std::string Common::base64_decode(std::string const& encoded_string) {
	int in_len = encoded_string.size();
	int i = 0;
	int j = 0;
	int in_ = 0;
	unsigned char char_array_4[4], char_array_3[3];
	std::string ret;

	while (in_len-- && (encoded_string[in_] != '=') && is_base64(encoded_string[in_]))
	{
		char_array_4[i++] = encoded_string[in_]; in_++;
		if (i == 4) {
			for (i = 0; i < 4; i++)
				char_array_4[i] = base64_chars.find(char_array_4[i]);

			char_array_3[0] = (char_array_4[0] << 2) + ((char_array_4[1] & 0x30) >> 4);
			char_array_3[1] = ((char_array_4[1] & 0xf) << 4) + ((char_array_4[2] & 0x3c) >> 2);
			char_array_3[2] = ((char_array_4[2] & 0x3) << 6) + char_array_4[3];

			for (i = 0; (i < 3); i++)
				ret += char_array_3[i];
			i = 0;
		}
	}

	if (i) {
		for (j = i; j < 4; j++)
			char_array_4[j] = 0;

		for (j = 0; j < 4; j++)
			char_array_4[j] = base64_chars.find(char_array_4[j]);

		char_array_3[0] = (char_array_4[0] << 2) + ((char_array_4[1] & 0x30) >> 4);
		char_array_3[1] = ((char_array_4[1] & 0xf) << 4) + ((char_array_4[2] & 0x3c) >> 2);
		char_array_3[2] = ((char_array_4[2] & 0x3) << 6) + char_array_4[3];

		for (j = 0; (j < i - 1); j++) ret += char_array_3[j];
	}

	return ret;
}



//Function to convert unsigned char to string of length 2
void Char2Hex(unsigned char ch, char* szHex)
{
	unsigned char byte[2];
	byte[0] = ch/16;
	byte[1] = ch%16;
	for(int i=0; i<2; i++)
	{
		if(byte[i] >= 0 && byte[i] <= 9)
			szHex[i] = '0' + byte[i];
		else
			szHex[i] = 'A' + byte[i] - 10;
	}
	szHex[2] = 0;
}

//Function to convert string of length 2 to unsigned char
void Hex2Char(char const* szHex, unsigned char& rch)
{
	rch = 0;
	for(int i=0; i<2; i++)
	{
		if(*(szHex + i) >='0' && *(szHex + i) <= '9')
			rch = (rch << 4) + (*(szHex + i) - '0');
		else if(*(szHex + i) >='A' && *(szHex + i) <= 'F')
			rch = (rch << 4) + (*(szHex + i) - 'A' + 10);
		else
			break;
	}
}

//Function to convert string of unsigned chars to string of chars
std::string CharStr2HexStr(unsigned char const* pucCharStr, int iSize)
{
	int i;
	char szHex[3];
	char* pszHexStr;
	pszHexStr[0] = 0;
	for(i=0; i<iSize; i++)
	{
		Char2Hex(pucCharStr[i], szHex);
		strcat(pszHexStr, szHex);
	}
	std::string temp = pszHexStr;
	return temp;
}

//Function to convert string of chars to string of unsigned chars
std::string Common::HexStr2CharStr(char const* pszHexStr, int iSize)
{
	int i;
	char pucCharStr[1024] = { 0 };
	unsigned char ch;
	for(i=0; i<iSize; i++)
	{
		Hex2Char(pszHexStr+2*i, ch);
		pucCharStr[i] = ch;
	}
	std::string temp = pucCharStr;

	return temp;
}

////非block的整数倍填充字节
//void PaddingData1(string& str,char* szDataIn)
//{
//	int length=strlen(str.data());
//	int k=length%BLOCK_SIZE;
//	int j=length/BLOCK_SIZE;
//	int padding=BLOCK_SIZE-k;
//	memset(szDataIn,0x00,strlen(szDataIn));
//	memcpy(szDataIn,str.data(),length);
//	for(int i=0;i<padding;i++)
//	{
//		szDataIn[j*BLOCK_SIZE+k+i]=padding;
//        
//	}
//	szDataIn[j*BLOCK_SIZE+k+padding]='\0';
//    
//}
std::string Common::generateAESKey(int len)
{
	char arrCharElem[62] = { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' };
	char* keyStr = new char[len+1];
	keyStr[len] = '\0';
	srand((unsigned)time(0));
	for (auto i = 0; i < len; ++i)
	{
		auto iRand = rand() % sizeof(arrCharElem);
		keyStr[i] = arrCharElem[iRand];
	}
	std::string temp = keyStr;
	delete[] keyStr;
	return temp;
}
std::string Common::AESEncryt(std::string Data, const char * pwd)
{
	//const long LENGTH =Data.length();  如果不需要转码就不需要
	//Data = string_To_UTF8(Data);
	int length = Data.size();
	int block_num = length / 16;
	/*
	if(length%16)
	{
	block_num++;
	}
	*/
	//构造加密块,padding方式为PKCS5  syl_
	char* p_data = new char[(block_num + 1) * 16 + 1]; //block*16+1 这种方式会不会有隐患？当16字节整数倍时还需要填补16个字节。但分配内存不够？(后期验证，存在隐患)
	memset(p_data, 0x00, (block_num + 1) * 16 + 1);
	strcpy(p_data, Data.c_str());
	int k = length%BLOCK_SIZE;
	int j = length / BLOCK_SIZE;
	int padding = BLOCK_SIZE - k;
	for (int i = 0; i<padding; i++)
	{
		p_data[j*BLOCK_SIZE + k + i] = padding;
	}
	p_data[j*BLOCK_SIZE + k + padding] = '\0';
	//unsigned char key[24]="1123456781234567";    //syl_自己定
	unsigned char iv[16] = { 0x12, 0x34, 0x56, 0x78, 0x55, 0x26, 0x32, 0x62, 0x12, 0x34, 0x56, 0x78, 0x73, 0x79, 0x45, 0x46 };
	// HexStr2CharStr(keyhexstr.c_str(),key,24);  syl_解密  自己注释的。
	CRijndael oRijndael;
	//设置解密的key和IV时，与加密的key和IV保持一致
	oRijndael.MakeKey(pwd, (char*)iv, 16, 16);//注：IV向量:dadadadadadadada syl_   oRijndael.MakeKey((char*)key, "0102030405060708", 24, 16);
	//明文
	char *szDataIn = new char[(block_num + 1) * 16 + 1];
	//加密后的密文
	char *szDataOut = new char[(block_num + 1) * 16 * 2 + 1];
	memset(szDataIn, 0, (block_num + 1) * 16 + 1);
	memset(szDataOut, 0, (block_num + 1) * 16 * 2 + 1);
	strcpy(szDataIn, p_data);
	memset(szDataOut, 0, (block_num + 1) * 16 * 2 + 1);
	//加密字符串
	oRijndael.Encrypt(szDataIn, szDataOut, (block_num + 1) * 16, CRijndael::ECB);

	string temp_caculate = szDataOut;
	//std::cout<<"size"<<temp_caculate.length()<<"   block_num"<<block_num<<endl;
	//std::string base64_encode(unsigned char const* bytes_to_encode, unsigned int in_len)
	string final_encode = base64_encode((unsigned char const*)szDataOut, (block_num + 1) * 16);// syl_
	//std::cout<<"final_encode_length"<<"   "<<final_encode<<"    "<<final_encode.length()<<endl;//syl_
	delete[] p_data;
	delete[] szDataIn;
	delete[] szDataOut;
	return final_encode;
}

std::string Common::AESDecryt(std::string final_encode, const char * pwd)
{
	//unsigned char key[24]="1123456781234567"; 
	unsigned char iv[16] = { 0x12, 0x34, 0x56, 0x78, 0x55, 0x26, 0x32, 0x62, 0x12, 0x34, 0x56, 0x78, 0x73, 0x79, 0x45, 0x46 };

	CRijndael oRijndael;
	oRijndael.MakeKey(pwd, (char*)iv, 16, 16);  //syl_  oRijndael.MakeKey((char*)key, "0102030405060708", 24, 16);
	//解密数据
	string final_decode = base64_decode(final_encode);
	int block_num = final_decode.length() / 16;
	//std::cout<<"final_decode_length"<<"   "<<final_decode<<"    "<<final_decode.length()<<endl; //syl_
	//明文
	char *szDataIn = new char[block_num * 16 + 1];
	memset(szDataIn, 0, block_num * 16 + 1);
	oRijndael.Decrypt(final_decode.c_str(), szDataIn, block_num * 16, CRijndael::ECB);
	//string temp_retult = UTF8_To_string(szDataIn); 不需要转码？？？？好奇怪。
	string temp_retult = szDataIn;
	//avoid crash
	if (!temp_retult.empty())
		temp_retult = temp_retult.substr(0, temp_retult.length() - int(temp_retult[temp_retult.length() - 1]));
	//std::cout<<temp_retult<<endl;
	//delete [] p_data;
	delete[] szDataIn;
	//delete [] szDataOut;
	return temp_retult;
}

Data* Common::AES128EncryptWithKey(const string& inputData, const string& keyhexstr)
{
    //One block testing
    CRijndael oRijndael;
//    oRijndael.MakeKey(keyhexstr.c_str(), "\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0", 16, 16);
//    oRijndael.MakeKey(keyhexstr.c_str(), "0102030405060708", 16, 16);
    oRijndael.MakeKey(keyhexstr.c_str(), CRijndael::sm_chain0, 16, 16);
    
    //int BLOCK_SIZE = 16;

//    CCLOG("before zip DataLength=%lu",inputData.size());
    
    unsigned long compressedDataLength = MAX(1024,inputData.size());
    unsigned char* szDataIn = new unsigned char[compressedDataLength];
//    int padding = BLOCK_SIZE - (inputData.size() % BLOCK_SIZE);
//    CCLOG("padding == %d, inputData.size() == %lu, blockNum == %d, inputData.size() / BLOCK_SIZE == %lu, pDataSize %% BLOCK_SIZE == %d", padding, inputData.size(), blockNum, inputData.size() / BLOCK_SIZE, pDataSize % BLOCK_SIZE);
    
    // szDataIn全置0
    //memset(szDataIn, 0, compressedDataLength);
    // inputData压缩复制到szDataIn
    //int result = compress(szDataIn, &compressedDataLength, (unsigned char*)inputData.c_str(), inputData.size());
    
	//if (result != Z_OK) {
	//	CCLOG("zip error=%d", result);
	//	delete[] szDataIn;
	//	return new Data;
	//}

//    CCLOG("after zip DataLength=%lu",compressedDataLength);
    
    size_t blockNum = (compressedDataLength / BLOCK_SIZE + 1);
    size_t pDataSize = blockNum * BLOCK_SIZE;
    int padding = BLOCK_SIZE - (compressedDataLength % BLOCK_SIZE);
    
//    strcpy(szDataIn, inputData.c_str());
    
    // szDataIn最后一部分PCK7填充补齐
    memset(szDataIn + pDataSize - padding, padding, padding);
    
    // 分配szDataOut的内存
    unsigned char *szDataOut = (unsigned char *)malloc(pDataSize);
    // szDataOut全置0
    memset(szDataOut, 0, pDataSize);
    
//    string aa(szDataIn, pDataSize);
//    CCLOG("aa == %s", aa.c_str());
    
    //    char szDataIn[] = "aaaaaaaabbbbbbbb";
//    char szDataOut[17] = "\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0";
    
    
//    char *szHex = new char[pDataSize];
//    memset(szHex, 0, pDataSize);
//    CharStr2HexStr((unsigned char*)szDataIn, szHex, pDataSize);
//    cout << szHex << endl;
    
    oRijndael.ResetChain();
    oRijndael.Encrypt((char*)szDataIn, (char*)szDataOut, pDataSize, CRijndael::CBC);

//    CharStr2HexStr((unsigned char*)szDataOut, szHex, pDataSize);
//    cout << szHex << endl;
    
//    memset(szDataIn, 0, pDataSize);
//    oRijndael.ResetChain();
//    oRijndael.Decrypt(szDataOut, szDataIn, pDataSize, CRijndael::CBC);
//    CharStr2HexStr((unsigned char*)szDataIn, szHex, pDataSize);
//    cout << szHex << endl;
//    string cc(szDataIn, pDataSize);
//    CCLOG("cc == %s", cc.c_str());
    cocos2d::Data* finalData = new Data;
    finalData->fastSet(szDataOut, pDataSize);
    
    delete[] szDataIn;
//    delete[] ptrData;
    return finalData;
//    return NULL;
}


static unsigned char* uncompressBuff = (unsigned char*) malloc(6*1024*1024);
/**
 CCData由于在线程中用到, 所以要自己手动释放(delete)
 NAR means No Auto Release
 */
Data* Common::AES128DecryptWithKey_NAR(Data* data, const string& key)
{
	if (NULL == data || NULL == data->getBytes() || 0L == data->getSize())
    {
        Data* finalData = new Data();
//        finalData->autorelease();
        return finalData;
    }

    CRijndael oRijndael;
    //    oRijndael.MakeKey(keyhexstr.c_str(), "\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0", 16, 16);
    //    oRijndael.MakeKey(keyhexstr.c_str(), "0102030405060708", 16, 16);
    oRijndael.MakeKey(key.c_str(), CRijndael::sm_chain0, 16, 16);
    
    oRijndael.ResetChain();
    char* dataOut = (char*)malloc(data->getSize());
    oRijndael.Decrypt((const char*)data->getBytes(), dataOut, data->getSize(), CRijndael::CBC);
    Data* finalData = new Data;
    unsigned char lastChar= dataOut[data->getSize()-1];
    if (lastChar==0) {
        finalData->fastSet((unsigned char*)dataOut, data->getSize()-16);
    }else{
        finalData->fastSet((unsigned char*)dataOut, data->getSize()-lastChar);
    }
    
    CCLOG("before unzip DataLength=%lu",finalData->getSize());
    
    //buff不重新分配了，开2m常驻内存
	//unsigned long buffLength = 6 * 1024 * 1024;
	//int result = uncompress(uncompressBuff, &buffLength, finalData->getBytes(), finalData->getSize());

	//CCLOG("after unzip DataLength=%lu", buffLength);
	//if (result != Z_OK){
	//	CCLOG("unzip error=%d", result);
	//	return new Data;
	//}
    //从buff copy数据出来
//    unsigned char * resultData = (unsigned char *) malloc(buffLength);
//    memcpy(resultData, uncompressBuff, buffLength);
//    finalData->fastSet(resultData, buffLength);
    free(dataOut);
    
    return finalData;
}

//string Common::hexadecimalString(CCData* data)
//{
//    
//}
//#ifdef _DEBUG
//#pragma comment(lib,"..\\lib\\ssleay32.lib")
//#else
//#pragma comment(lib,"..\\lib\\ssleay32.lib")
//#endif
// ------------ RSA加密 ------------------
int Common::RSACryptFromFile()
{
	//char msg[] = "i, i have no data to enc";
	//char msg2[256];
	//int r;

	////读公匙

	//RSA *key;
	//FILE *fp = fopen("publickey.pem", "r");
	////FILE *fp = fopen("public.txt", "r");//ok

	//if (fp == NULL)
	//	printf("fp error!");
	//key = PEM_read_RSAPublicKey(fp, NULL, NULL, NULL);

	//r = RSA_public_encrypt(strlen(msg), (unsigned char *)msg, (unsigned char *)msg2, key, RSA_PKCS1_PADDING); // or RSA_PKCS1_OAEP_PADDING


	//FILE *fp1 = fopen("msg2.txt", "w");
	//fwrite(msg2, sizeof(unsigned char), r, fp1);
	//fflush(fp1);


	//printf("\nmsg2:\n");

	//for (int i = 0; i < r; i++)
	//{
	//	printf("%02x", (unsigned char)msg2[i]);
	//}
	//printf("\n");

	return 1;
}

// ------------ 从字符串中读出 host & port ------------------
/**
 切割ip:port这样格式的地址
 */
const std::string Common::getIPFromAddress(const string& address)
{
//    CCLOG("getIPFromAddress -> %s", address.c_str());
    if (address.empty())
        return "";
    
    size_t index = address.find(":");
    if(index == string::npos){
        return "";
    }
    
    string ip = address.substr(0, index);
//    CCLOG("getIPFrommAddress ip = %s", ip.c_str());
    return ip;
}

/**
 切割ip:port这样格式的地址
 */
int Common::getPortFromAddress(const string& address)
{
    if (address.empty())
        return -1;
    
    size_t index = address.find(":");
    if(index != string::npos ){
        return -1;
    }
    
    string port = address.substr(index+1, address.length());
    return atoi(port.c_str());
}

//- random method

/** 随机random 0 至 1 之前的数 */
float Common::random_0_TO_1()
{
    return rand()/(float)RAND_MAX;
}

int Common::random(int range)
{
    return Common::random(range, true);
}

/**
 是否random至一个数小于指定的数
 */
bool Common::isRandomInRange(int numLess100)
{
    int num = Common::random(100);
    return num <= numLess100;
}
    
bool Common::randomBool()
{
    return Common::random(2)==0?true:false;
}

/** 返回 －(range-1) 至 range-1 范围内的随机数 */
int Common::random(int range, bool isOnlyPlus)
{
    if(range == 0)
    {
        return 0;
    }
#ifdef _MSC_VER
    int num = rand() % range;
#else
    int num = arc4random()%range;
#endif
    if(isOnlyPlus)
        num = fabsf(num);
    return num;
}

/** 返回 begin(包括)至end(不包括) 之间的随机数 */
int Common::randomFromBegin(int begin, int end)
{
    int min = MIN(begin, end);
    int max = MAX(begin, end);
    
    int num = Common::random(max - min);
    return num + min;
}

// ------------------------数字处理-------------
/**
 16进制转10进制
 */
int Common::hexStringToInt(const std::string &hexStr)
{
    unsigned int outVal=0;  // = stoi(hexStr,0,16);
    
    sscanf(hexStr.c_str(),"%x",&outVal);
    //    todo
    //    NSScanner* scanner = [NSScanner scannerWithString:[NSString stringWithFormat:@"0x%@", hexStr]];
    //    [scanner scanHexInt:&outVal];
    return outVal;
}

std::string Common::dataToHexString(const unsigned char* data, size_t length){
    char* charArray = (char*)malloc(length*2+1);
    memset(charArray, 0, length*2+1);
    std::stringstream ss;
    for(int i=0;i<length;i++){
        sprintf(charArray+i*2, "%.2x", data[i]);
    }
    std::string result = std::string(charArray);
    free(charArray);
    return result;
}



// ----------时间日期-------------------
/**
 格式化时间输出格式 类型"10:22:33"
 */
const std::string Common::transformTime(int sec)
{
//    // Jeff3的新算法：
//    div_t ret1 = div(sec, 60);  // 余数为秒 商为分
//    div_t ret2 = div(ret1.quot, 60); // 余数为分 商为小时
    
    time_t t = sec;
    //产生"YYYY-MM-DD hh:mm:ss"格式的字符串。
    char s[32];
    memset(s, 0, 32);
    strftime(s, sizeof(s), "%H:%M:%S", gmtime(&t));
    
    return string(s);
}

/** 将秒数转成 00:00 这样的格式的时间 ， 同样可用于分钟数转换*/
const std::string Common::transformTime4(int sec)
{
    time_t t = sec;
    //产生"mm:ss"格式的字符串。
    char s[32];
    memset(s, 0, 32);
    strftime(s, sizeof(s), "%M:%S", gmtime(&t));
    
    return string(s);
}

uint64_t Common::getCurrentTime()
{
    timeval now;
    // gettimeofday 成功则返回0，失败返回－1
    if(gettimeofday(&now, nullptr)==0){
        uint64_t value = (((uint64_t)now.tv_sec) * 1000 + now.tv_usec /1000.0);   
        return value;
    }
    return 0;
}


// ----------字符串相关-------------------

/**
 颜色转成16进制的格式:
 eg:
 ff0000
 */
const std::string Common::colorToHex(const Color3B& color)
{
    return Common::colorToHex(color.r, color.g, color.b);
}

/**
 颜色转成16进制的格式:
 eg:
 ff0000
 */
const std::string Common::colorToHex(int red, int green, int blue)
{
    red = MIN(red, 255);
    green = MIN(green, 255);
    blue = MIN(blue, 255);


    char str[10];
    memset(str, 0, 10);
    sprintf(str, "%.2X%.2X%.2X",red, green, blue);
    return string(str);

//    string redStr = Common::toHex(red, true);
//    string greenStr = Common::toHex(green, true);
//    string blueStr = Common::toHex(blue, true);
//    
//    return format("%s%s%s", redStr.c_str(), greenStr.c_str(), blueStr.c_str());
}


/**
 10进制转16进制
 isAdaptSize: 是否不足2位的时候, 前面补0
 */
const std::string Common::toHex(int tmpid, bool isAdaptSize)
{
    char str[10];
    memset(str, 0, 10);
    sprintf(str, isAdaptSize ? "%.2X" : "%X",tmpid);
    return string(str);

}

/**
 指定str从beginIndex开始, 后续的文字是否与targetStr匹配
 */
bool Common::isSubStringMatch(const string& str, const string& targetStr, int beginIndex)
{
    if(beginIndex < 0 || beginIndex >= str.length() || targetStr.empty())
    {
        return false;
    }
    
    if(str.length() - beginIndex < targetStr.length())
    {
        return false;
    }
    
    for(int i = 0 ; i < targetStr.length() ; i ++)
    {
        if(str.c_str()[i+beginIndex] != targetStr.c_str()[i])
        {
            return false;
        }
    }
    return true;
}

/** 截取字符，避免乱码的处理；*/
string Common::subString(const std::string& str, size_t start, size_t size)
{
    if(str.length() > 0)
    {
        size_t len = str.length();
        
        string tmp = "";
        
        //先把str里的汉字和英文分开
        vector<string> dump;
        int i = 0;
        while(i < len)
        {
            if (Common::isChinese(str.at(i)))
            {
                dump.push_back(str.substr(i,3));
//                CCLOG("push -> %s", str.substr(i,3).c_str());
                i = i + 3;
            }
            else
            {
                dump.push_back(str.substr(i,1));
                i = i + 1;
            }
        }
        
        size_t iDumpSize = dump.size();
//        end = end > 0 ? end : iDumpSize;
//        CCLOG("str == %s, chinese size == %d", str.c_str(), calcCharCount(str.c_str()));
//        CCLOG("dump's size == %d, start == %d, size == %d, str's size == %lu", iDumpSize, start, size, str.length());
        
        size = min(size, iDumpSize);
//        if(start < 0 || start > end)
       
        for(i = 0; i < size; i++)
        {
//            CCLOG("i == %d", i);
            tmp += dump[i + start];
        }
        
        return tmp;
    }
    else
    {
        printf("str is not string\n");
        return "";
    }
}

/** 获取字符串的真实长度处理 */
int Common::getRealStringLength(const std::string& str)
{
    int i = 0;
    size_t len = str.length();
    int num = 0;
    
    while(i < len)
    {
        if (Common::isChinese(str.at(i)))
        {
            num++;
            i = i + 3;
        }
        else
        {
            num++;
            i = i + 1;
        }
    }
    
    return num;
}

/** 检查字符p是否是双字节汉字的一个字节 */
bool Common::isChinese(char p)
{
    if(~(p >> 8) == 0)
    {
        return true;
    }
    
    return false;
}


// NOTE: 这是从ccUTF8.cpp里面复制过来的！主要是要cc_utf8_next_char这个宏
static const char utf8_skip_data[256] = {
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1,
    2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    2, 2, 2, 2, 2, 2, 2,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 5,
    5, 5, 5, 6, 6, 1, 1
};

static const char *const g_utf8_skip = utf8_skip_data;

#define cc_utf8_char_len(p) (g_utf8_skip[*(unsigned char *)(p)])
#define cc_utf8_next_char(p) (char *)((p) + g_utf8_skip[*(unsigned char *)(p)])

char* Common::utf8GetNextChar(char* p)
{
    return cc_utf8_next_char(p);
}

const char* Common::utf8GetNextChar(const char* p)
{
    return cc_utf8_next_char(p);
}

bool Common::utf8CharEqual(const char* ch1, const char* ch2)
{
    if (ch1 == NULL || ch2 == NULL)
    {
        assert(0);
        return false;
    }

    size_t n1 = cc_utf8_char_len(ch1);
    size_t n2 = cc_utf8_char_len(ch2);
    return (n1 == n2 && strncmp(ch1, ch2, n1) == 0);
}

long Common::utf8CharIndices(const char* str, size_t* indices)
{
    if (indices == NULL)
    {
        return StringUtils::getCharacterCountInUTF8String(str);
    }

    long len = 0;
    for (const char* p = str; *p != '\0'; )
    {
        indices[len++] = p - str;
        p = cc_utf8_next_char(p);
    }
    return len;
}

size_t Common::stringNormalLength(const char* str, size_t* indices, size_t maxLen)
{
    size_t len = 0;

    if (indices == NULL)
    {
        for (const char *p = str; *p != '\0'; )
        {
            size_t n = cc_utf8_char_len(p);
            len += ((n == 1) ? 1 : 2);
            p += n;
        }
    }
    else
    {
        for (const char *p = str; *p != '\0' && len < maxLen; )
        {
            size_t n = cc_utf8_char_len(p);
            if (n == 1)
            {
                indices[len] = p - str;
                len += 1;
            }
            else
            {
                indices[len] = p - str;
                indices[len + 1] = (size_t)-1;
                len += 2;
            }
            p += n;
        }
    }

    return len;
}

/**
 从str中去除包含在trimChars中的所有字符（不包括最后的'\0'）
 说明：此函数将操作结果存储在buf中
 */
static char* _trimmingToOtherSpace(const char* str, char* buf, const char* trimChars)
{
    size_t len = 0;
    for (const char *p1 = str, *p2 = NULL; *p1 != '\0'; p1 = p2)
    {
        p2 = cc_utf8_next_char(p1);
        size_t n1 = p2 - p1;
        
        bool match = false;
        for (const char *q1 = trimChars, *q2 = NULL; *q1 != '\0'; q1 = q2)
        {
            q2 = cc_utf8_next_char(q1);
            size_t n2 = q2 - q1;
            
            if (n1 == n2 && strncmp(p1, q1, n1) == 0)
            {
                match = true;
                break;
            }
        }

        if (!match)
        {
            strncpy(buf + len, p1, n1);
            len += n1;
            buf[len] = '\0';
        }
        else
        {
            p1 = p2;
        }
    }

    return buf;
}

/**
 从str中去除包含在trimChars中的所有字符（不包括最后的'\0'）
 说明：此函数为原地操作
 */
static char* _trimmingToSameSpace(char* str, const char* trimChars)
{
    size_t len = strlen(str);
    for (char *p1 = str, *p2 = str; *p1 != '\0'; )
    {
        p2 = cc_utf8_next_char(p1);
        size_t n1 = p2 - p1;
        
        bool match = false;
        for (const char *q1 = trimChars, *q2 = trimChars; *q1 != '\0'; q1 = q2)
        {
            q2 = cc_utf8_next_char(q1);
            size_t n2 = q2 - q1;
            
            if (n1 == n2 && strncmp(p1, q1, n1) == 0)
            {
                match = true;
                break;
            }
        }
        
        if (match)
        {
            // +1保证最后的'\0'也一并移动
            memmove(p1, p2, len - (p2 - str) + 1);
        }
        else
        {
            p1 = p2;
        }
    }
    
    return str;
}

/**
 从str中去除包含在trimChars中的所有字符（不包括最后的'\0'）
 说明：此函数直接修改传入的第一个参数，并将其作为返回值返回
 */
char* Common::trimmingCharactersInSet(char* str, const char* trimChars)
{
    size_t len1 = strlen(str);
    char *buf = (char *)malloc(len1 + 1);

    if (buf == NULL)
    {
        return _trimmingToSameSpace(str, trimChars);  // 内存不够，进行原地操作
    }
    else
    {
        _trimmingToOtherSpace(str, buf, trimChars);  // 操作到buf中，再拷贝回去
        strcpy(str, buf);
        free(buf);
        return str;
    }
}

/**
 去除前后空格
 */
char* Common::trim(char *str)
{
    char *p = str;
    const size_t len = strlen(str);
    for (; *p != '\0'; ++p)
    {
        if ((unsigned)(*p + 1) > 256 || !isspace(*p))
        {
            break;
        }
    }

    if (*p != '\0')
    {
        char *q = str + len - 1;
        for (; q > p; --q)
        {
            if ((unsigned)(*q + 1) > 256 || !isspace(*q))
            {
                break;
            }
        }

        if (p > str)
        {
            size_t cnt = q - p + 1;
            memmove(str, p, cnt);
            str[cnt] = '\0';
        }
        else
        {
            q[1] = '\0';
        }
    }
    else
    {
        *str = '\0';
    }
    return str;
}

void Common::remove_space(string& str)
{
    string buff(str);
    char space = ' ';
    str.assign(buff.begin() + buff.find_first_not_of(space),
               buff.begin() + buff.find_last_not_of(space) + 1);
}

std::string Common::remove_space(const std::string& str)
{
    std::string ret(str);
    remove_space((string&)ret);
    return ret;
}


char* Common::adjustStringForAtlas(char* str)
{
    for (char* p = str; *p != '\0'; ++p)
    {
        switch (*p)
        {
            case '+': *p = '9' + 1; break;
            case '-': *p = '9' + 2; break;
            case ':': *p = '9' + 3; break;
            default: break;
        }
    }
    return str;
}

std::string Common::adjustStringForAtlas(const std::string& str)
{
    std::string ret(str);
    adjustStringForAtlas(const_cast<char*>(ret.c_str()));
    return ret;
}

std::string& Common::adjustStringForAtlas(std::string& str)
{
    adjustStringForAtlas(const_cast<char*>(str.c_str()));
    return str;
}

void Common::openUrl(const char *strUrl)
{
#if CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID
    JniMethodInfo minfo;
    if(JniHelper::getStaticMethodInfo(minfo,
                                      "org/cocos2dx/lib/Cocos2dxWebView",
                                      "openURL",
                                      "(Ljava/lang/String;)V"))
    {
        jstring StringArg = minfo.env->NewStringUTF(strUrl);
        minfo.env->CallStaticVoidMethod(minfo.classID, minfo.methodID, StringArg);
        minfo.env->DeleteLocalRef(StringArg);
        minfo.env->DeleteLocalRef(minfo.classID);
    }
#endif
}
