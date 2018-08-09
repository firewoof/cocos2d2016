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
 * �������������ݻ�,���������ȷ��ش���
 * @param data
 * @param start
 * @param length
 * @return
 */
int ByteCircle::pushData(const unsigned char* data, size_t start, size_t length){
    if(NULL==data){
        return ERR_NULL;
    }
    
    //����
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
    
    //������д�����ݻ�,���������
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

//���ָ�����ȵ�����
//���ص�char*��Ҫ�������ͷ�
unsigned char* ByteCircle::getData(size_t length){
    //����
//    ThreadLock fieldLock(lock);
    //
    if(length>dataLength)
        return NULL;

    unsigned char* data = new unsigned char[length];
    int result = getData(data, 0, length);
    
    //��ȡ�����ݾͿ����ͷ�����
    if(result < 0) {
        return NULL;
    }
    return data;
}

//���ָ�����ȵ�����, ��д��ָ��������
int ByteCircle::getData(unsigned char* data, size_t length){
    return getData(data, 0, length);
}

//���ָ�����ȵ�����, ��д��ָ�������еĿ�ʼλ��
int ByteCircle::getData(unsigned char* data, size_t start, size_t length){
    if (NULL==data) {
        return ERR_NULL;
    }
    
    //��ʼ���ʱ���������, ����
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
 * �����ݴ����ݻ�����
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
 * �����ݴ����ݻ�����
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
 * ��ȡһ�����ݰ�
 * ������ݰ���ͷ4byte�����ݰ�����
 * @return ��Ҫ�����ͷ��ڴ�
 */
cocos2d::Data* ByteCircle::getPackage(){  
//    ThreadLock fieldLock(lock);

	unsigned char lengthData[HEADER_SIZE] = { 0 };

	// ��ȡ��ͷ
	int result = getData(lengthData, HEADER_SIZE);
    if(result<0){
        return new cocos2d::Data();
    }

	int length = ByteUtil::byteToValue<int>(lengthData);
    // ���ݴ���
    if(length<0 || length>size){
        //printf("ByteCircle::getPackage: get package error. length=%d\n",length);
        return NULL;
    }
	// ��������
	if (length + HEADER_SIZE > dataLength){
        return new cocos2d::Data();
    }
	// �����ݰ�
	if (0 == length){
		skip(HEADER_SIZE);
		return new cocos2d::Data();
	}

    //��ȡ����
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




