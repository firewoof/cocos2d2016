#include "ByteUtil.h"

void ByteUtil::writeShort(short value, unsigned char* data)
{

}

void ByteUtil::writeInt(int value, unsigned char* data)
{

}
void ByteUtil::writeFloat(float value, unsigned char* data)
{

}
void ByteUtil::writeLong(long long value, unsigned char* data)
{

}
void ByteUtil::writeDouble(double value, unsigned char* data)
{

}

unsigned char * ByteUtil::shortToByte(const short value)
{
	return ByteUtil::valueToByte(value);
}

unsigned char * ByteUtil::intToByte(const int value)
{
	return ByteUtil::valueToByte(value);
}
unsigned char * ByteUtil::floatToByte(const float value)
{
	return ByteUtil::valueToByte(value);
}
unsigned char * ByteUtil::doubleToByte(const double value)
{
	return ByteUtil::valueToByte(value);
}
unsigned char * ByteUtil::longToByte(const long long value)
{
	return ByteUtil::valueToByte(value);
}

short ByteUtil::readShort(const unsigned char* data)
{
	return (short)*data;
}

int ByteUtil::readInt(const unsigned char* data)
{
	return (int)*data;
}

float ByteUtil::readFloat(const unsigned char* data)
{
	return (float)*data;
}

long long ByteUtil::readLong(const unsigned char* data)
{
	return (long long)*data;
}

double ByteUtil::readDouble(const unsigned char* data)
{
	return (double)*data;
}