//
//  ByteUtil.h
//
//  ����������ת���ɱ�����������
//
//  �жϱ�����big-endian����small
//  Created by Sunwing on 13-5-8.
//
//

#ifndef __ByteUtil__H__
#define __ByteUtil__H__

#include <string>

#ifndef REVERSE_MEMCPY
//����copy src�����ݵ� dest
//BACKUP: 
#define REVERSE_MEMCPY(dest,src,length) for(int i=0;i<length;i++){*(dest+i)=*(src+length-1-i);}

#endif

//�ж�cpu�Ǵ�˻���С��, ʹ�ò�ͬ�����ת������
#ifndef HOST_NETWORK_CONVERTOR
#if __DARWIN_BYTE_ORDER == __DARWIN_LITTLE_ENDIAN
#define HOST_NETWORK_CONVERTOR(dest,src,length) REVERSE_MEMCPY(dest,src,length)
#else // __DARWIN_BYTE_ORDER == BIG_ENDIAN
#define HOST_NETWORK_CONVERTOR(dest,src,length) memcpy(dest,src,length);
#endif
#endif

class ByteUtil {
    
public:
    static void writeShort(short value,unsigned char* data);
    static void writeInt(int value,unsigned char* data);
    static void writeFloat(float value,unsigned char* data);
    static void writeLong(long long value,unsigned char* data);
    static void writeDouble(double value,unsigned char* data);

    
    
    static unsigned char * shortToByte(const short value);
    static unsigned char * intToByte(const int value);
    static unsigned char * floatToByte(const float value);
    static unsigned char * doubleToByte(const double value);
    static unsigned char * longToByte(const long long value);
    
    static short readShort(const unsigned char* data);
    static int readInt(const unsigned char* data);
    static float readFloat(const unsigned char* data);
    static long long readLong(const unsigned char* data);
    static double readDouble(const unsigned char* data);
    
    //static bool checkBit(int index, const unsigned char* data, int length);
    //static void setBit(int index, bool bit, unsigned char* data, int length);
    
    //static std::string getHexString(const unsigned char* data, int length, const std::string& spliter);
    
    //������ת���������ֽ���,д���Ӧ��ַ
    template <class T>
    static void writeValue(T value, unsigned char* data) {
        int valueLength = sizeof(value);
        unsigned char * p_value = (unsigned char *)&value;
        HOST_NETWORK_CONVERTOR(data,p_value,valueLength)
    }
    
    //��������ֽ��������, ����ֵ������Ҫ�ͷ�
    template <class T>
    static unsigned char* valueToByte(T value) {
        unsigned char * data = new unsigned char[sizeof(T)];
        writeValue(value, data);
        return data;
    }
	template <class T>
	static unsigned char* valueToByte(T value, unsigned char* data) {
		writeValue(value, data);
		return data;
	}
    //��һ�����ݰ�ָ�����ʹ�bufferȡ��, ���������л�����������
    template <class T>
    static T byteToValue(const unsigned char* data)
    {
        T value=0;
        int _length = sizeof(T);
        unsigned char *p = (unsigned char *)&value;
        HOST_NETWORK_CONVERTOR(p,data,_length);
        return value;
    }
};

#endif /* defined(__ByteUtil__H__) */
