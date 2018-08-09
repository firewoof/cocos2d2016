//
//  SocketUtil.h
//
//  Created by Sunwing on 13-5-4.
//
//

#ifndef __SocketUtil__H__
#define __SocketUtil__H__

#include <iostream>
#include "cocos/base/CCConsole.h"

class SocketUtil {
    
public:
    
    static int connect(const char* host, unsigned short port);
	static int connect_ipv4(const char* ip, unsigned short port);
	static int connect_ipv6(const char* ip, unsigned short port);
    
	static ssize_t receiveData(int handle, unsigned char* buffer, const int64_t& length);
    
    static ssize_t sendData(int handle, const unsigned char* data, const int64_t& length);
    
    static ssize_t setBlockMode(int handle);
    
    static ssize_t setNonBlockMode(int handle);
    
    static std::string getLocalIP(int handle);

	static std::string getIPByName(const char* name);
	static std::string IPv4ToIPv6(std::string IPv4);
    
};
#endif /* defined(__SocketUtil__H__) */
