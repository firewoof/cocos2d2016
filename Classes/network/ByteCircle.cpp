//
//  ByteCircle.cpp
//  Cocos2dxTest
//  Created by zouly on 2015-09-10.
//


#include "ByteCircle.h"
#include "GameException.h"
//#include "ThreadMutex.h"
#include "ByteUtil.h"
#include <memory>

#define HEADER_SIZE 4

using namespace std;


ByteCircle::ByteCircle(size_t _size ):dataHead(0),dataLength(0) {
    size=_size;
	circle = new unsigned char[_size];
    
//    lock = new ThreadMutex();
}

ByteCircle::~ByteCircle(){
    delete[] circle;
//    delete lock;
}

int ByteCircle::getSize(){
    return dataLength;
}


/**
 * 将数据推入数据环,超出环长度返回错误
 * @param data
 * @param start
 * @param length
 * @return
 */
int ByteCircle::pushData(const unsigned char* data, size_t start, size_t length){
    if(NULL==data){
        return ERR_NULL;
    }
    
    //上锁
//    ThreadLock fieldLock(lock);
    
    if(dataLength+length>size){
        
        return ERR_OUT_BOUND;
    }
    size_t dataNewStart = dataHead+dataLength;
    if(dataNewStart>=size){
        dataNewStart-=size;
    }
    size_t dataNewEnd = dataNewStart+length-1;
    if(dataNewEnd>=size){
        dataNewEnd -=size;
    }
    
    //将数据写入数据环,分两种情况
    if(dataNewStart<=dataNewEnd)
	{
        memcpy(circle+dataNewStart, data+start, length);
        dataLength += length;
    }
	else
	{
		size_t part1 = size - dataNewStart;
		size_t part2 = dataNewEnd + 1;
		memcpy(circle + dataNewStart, data + start, part1);
		memcpy(circle, data + start + part1, part2);
		dataLength += length;
	}
       
    return ERR_OK;
}

//获得指定长度的数据
//返回的char*需要被主动释放
unsigned char* ByteCircle::getData(size_t length){
    //上锁
//    ThreadLock fieldLock(lock);
    //
    if(length>dataLength)
        return NULL;

    unsigned char* data = new unsigned char[length];
    int result = getData(data, 0, length);
    
    //获取完数据就可以释放锁了
    if(result < 0) {
        return NULL;
    }
    return data;
}

//获得指定长度的数据, 并写入指定数组中
int ByteCircle::getData(unsigned char* data, size_t length){
    return getData(data, 0, length);
}

//获得指定长度的数据, 并写入指定数组中的开始位置
int ByteCircle::getData(unsigned char* data, size_t start, size_t length){
    if (NULL==data) {
        return ERR_NULL;
    }
    
    //开始访问本对象数据, 上锁
//    ThreadLock fieldLock(lock);
    
    if(length > dataLength){
        return ERR_OUT_BOUND;
    }
    
    if(dataHead + length <= size)
	{
        memcpy(data+start, circle+dataHead, length);
    }
	else
	{
        size_t part1 = size-dataHead;
        size_t part2 = length -part1;

        memcpy(data+start, circle+dataHead, part1);
        memcpy(data+start+part1, circle, part2);
    }
    
    return 0;
}

void ByteCircle::skip(size_t length){
    
//    ThreadLock fieldLock(lock);
    
    if(length > dataLength)
        return;

    dataHead+=length;
    dataLength-=length;
    if(dataHead>=size){
        dataHead-=size;
    }
}

/**
 * 将数据从数据环弹出
 *
 * @param length
 * @return
 */
unsigned char* ByteCircle::popData(size_t length){
    
//    synchronized(lock)
	{
        unsigned char* data = getData(length);
        skip(length);
        return data;
    }
    return NULL;
}

/**
 * 将数据从数据环弹出
 *
 * @param length
 * @return
 */
void ByteCircle::popData(const cocos2d::Data* package){
    
    if(NULL==package){
        return;
    }
//    synchronized(lock)
	{
        getData(package->getBytes(), package->getSize());
        skip(package->getSize());
    }
    
}

/**
 * 获取一个数据包
 * 这个数据包开头4byte是数据包长度
 * @return 需要主动释放内存
 */
cocos2d::Data* ByteCircle::getPackage(){  
//    ThreadLock fieldLock(lock);

	unsigned char lengthData[HEADER_SIZE] = { 0 };

	// 获取包头
	int result = getData(lengthData, HEADER_SIZE);
    if(result<0){
        return new cocos2d::Data();
    }

	int length = ByteUtil::byteToValue<int>(lengthData);
    // 数据错乱
    if(length<0 || length>size){
        //printf("ByteCircle::getPackage: get package error. length=%d\n",length);
        return NULL;
    }
	// 不完整包
	if (length + HEADER_SIZE > dataLength){
        return new cocos2d::Data();
    }
	// 空数据包
	if (0 == length){
		skip(HEADER_SIZE);
		return new cocos2d::Data();
	}

    //获取包体
	skip(HEADER_SIZE);
	unsigned char* _bytes = new unsigned char[length];
	cocos2d::Data* body = new cocos2d::Data();
	body->fastSet(_bytes, length);
	getData(body->getBytes(), body->getSize());
	skip(body->getSize());

    //printf("ByteCircle::getPackage: get package length=%d\n",length);
	return body;
}

void ByteCircle::reset(){
   
//	ThreadLock fieldLock(lock);
    
    dataHead=0;
    dataLength=0;
}




