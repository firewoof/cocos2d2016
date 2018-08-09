//
//  ByteCircle.h
//  Created by zouly on 2015-09-10.
//
//

#ifndef __ByteCircle__H__
#define __ByteCircle__H__

//#include "ThreadMutex.h"
#include "cocos2d.h"

class ByteCircle {
    
public:
    //ThreadMutex* lock;
    
	unsigned char* circle;
    
    size_t size;
    
    ByteCircle(size_t _size);
    ~ByteCircle();
    
    int getSize();
    
    int pushData(const unsigned char* data, size_t start, size_t length);
    
    //���ָ�����ȵ�����
    //���ص�char*��Ҫ�������ͷ�
    unsigned char* getData(size_t length);
    
    //���ָ�����ȵ�����, ��д��ָ��������
    int getData(unsigned char* data, size_t length);

    //���ָ�����ȵ�����, ��д��ָ�������еĿ�ʼλ��
    int getData(unsigned char* data, size_t start, size_t length);
    
    //����ָ������
    void skip(size_t length);
    
    /**
	 * �����ݴ����ݻ�����
	 *
	 * @param length
	 * @return ����ָ��, ��Ҫ���ͷ�
	 */
    unsigned char* popData(size_t length);
    
    //�����ݻ�����һ��package���ȵ�����
    void popData(const cocos2d::Data* package);
    
    /**
	 * ��ȡһ�����ݰ�
	 * ������ݰ���ͷ4byte�����ݰ�����
	 * @return ����ָ��, ��Ҫ���ͷ�
	 */
    cocos2d::Data* getPackage();
    
    void reset();

private:
    int dataHead;
    int dataLength;

};

#endif /* defined(__ByteCircle__H__) */
