//
//  SocketUtil.cpp
//
//  Created by Sunwing on 13-5-4.
//
//

#include "SocketUtil.h"

#include "cocos2d.h"
#include <fcntl.h>  //�ļ�ϵͳ��صĳ�������
#include <errno.h>
#include "GameException.h"
#include "ByteUtil.h"
#include "NetworkManager.h"

//linux���ļ��� 
#if (CC_TARGET_PLATFORM == CC_PLATFORM_IOS) || (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
#include <sys/socket.h>   
#include <arpa/inet.h>  //�����ַת��
#include <netdb.h>
#include <unistd.h>
#endif

#if (CC_TARGET_PLATFORM == CC_PLATFORM_IOS) || (CC_TARGET_PLATFORM == CC_PLATFORM_MAC)
#include <netinet/tcp.h>
#elif(CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
#include <linux/tcp.h>
#elif(CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)
#pragma comment(lib, "Ws2_32.lib")
#include <winsock2.h>
#include <ws2tcpip.h>
typedef int socklen_t;
#define close(s) closesocket(s)
#endif


int SocketUtil::connect(const char* host, unsigned short port)
{
	std::string ip = getIPByName(host);
	// IPv6
	if (std::string::npos != ip.find(":")) {
		return connect_ipv6(ip.c_str(), port);
	}
	else // IPv4
	{
		int handle = connect_ipv4(ip.c_str(), port);
		//if (handle < 0) { // ����һ��IPv6����
		//	handle = connect_ipv6(IPv4ToIPv6(ip).c_str(), port);
		//}
		return handle;
	}
}

// IPv4
int SocketUtil::connect_ipv4(const char* ip, unsigned short port)
{
	//win32�ĳ�ʼ��
#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)
	WSAData wsadata;
	int iResult = WSAStartup(MAKEWORD(2, 2), &wsadata);
	if (iResult != NO_ERROR)
	{
		WSACleanup();
		CCLOG("Error at WSAStartup()\n");
		return -1;
	}
#endif

	// create socket
	int socketHandle = socket(AF_INET, SOCK_STREAM, 0);
	if (socketHandle < 0) {
		CCLOG("Error at socket(AF_INET)\n");
		return -1;
	}

	//ģʽ==������
	setNonBlockMode(socketHandle);

	//���³�ʱ����ֻ��������ģʽ�����ã�������ģʽ��recv��send��Ҫ�Լ�����д
#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)
	if (socketHandle == INVALID_SOCKET)
	{
		CCLOG("error at socket():%ld\n", WSAGetLastError());
		close(socketHandle);
		WSACleanup();
		return -1;
	}
	int timeout = 30 * 1000; //ms
	int on = 1;
	setsockopt(socketHandle, SOL_SOCKET, SO_SNDTIMEO, (const char*)&timeout, sizeof(timeout));
	setsockopt(socketHandle, SOL_SOCKET, SO_RCVTIMEO, (const char*)&timeout, sizeof(timeout));
	setsockopt(socketHandle, SOL_SOCKET, SO_REUSEADDR, (const char*)&on, sizeof(on));


#elif (CC_TARGET_PLATFORM == CC_PLATFORM_IOS) || (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
	//�������ӳ�ʱʱ��
	struct timeval timeout = { 30, 0 };//��   
	struct timeval rcvTimeout = { 30, 0 };//��

	int on = 1;
	setsockopt(socketHandle, SOL_SOCKET, SO_SNDTIMEO, &timeout, sizeof(timeout));
	setsockopt(socketHandle, SOL_SOCKET, SO_RCVTIMEO, &rcvTimeout, sizeof(rcvTimeout));
	setsockopt(socketHandle, SOL_SOCKET, SO_REUSEADDR, &on, sizeof(on));
#endif    

	int keepAliveOn = 1;        // ��̽��
	int keepIdleTime = 5;        // ��ʼ̽��ǰ�Ŀ��еȴ�ʱ��
	int keepInterval = 5;       // ����̽��ֽڵ�ʱ����
	int keepCount = 3;          // ����̽��ֽڵĴ���

#if (CC_TARGET_PLATFORM == CC_PLATFORM_IOS) || (CC_TARGET_PLATFORM == CC_PLATFORM_MAC)
	if (setsockopt(socketHandle, IPPROTO_TCP, TCP_KEEPALIVE, &keepIdleTime, sizeof(keepIdleTime))<0){
		CCLOG("SocketUtil::connect: set keep alive idle time error");
		::close(socketHandle);
		return -1;
	}
#elif (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
	if (setsockopt(socketHandle, IPPROTO_TCP, TCP_KEEPIDLE, &keepIdleTime, sizeof(keepIdleTime))<0){
		CCLOG("SocketUtil::connect: set keep alive idle time error");
		::close(socketHandle);
		return -1;
	}
#endif

	// ����
	struct sockaddr_in svraddr;
	memset(&svraddr, 0, sizeof(svraddr));
	svraddr.sin_family = AF_INET;
	svraddr.sin_addr.s_addr = inet_addr(ip);
	svraddr.sin_port = htons(port);

#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)
	while (true)
	{
		int ret = ::connect(socketHandle, (struct sockaddr*)&svraddr, sizeof(svraddr));
		if (ret == SOCKET_ERROR)
		{
			int r = WSAGetLastError();
			if (r == WSAEALREADY || r == WSAEWOULDBLOCK || r == WSAEINVAL)
			{
				Sleep(20);
				continue;
			}
			else if (r == WSAEISCONN)//�׽���ԭ���Ѿ����ӣ���  
			{
				break;
			}
			else
			{
				if (errno != EINPROGRESS) {
					CCLOG("Connect Error! errno::%d desc::%s  connect ret::%d", errno, strerror(errno), ret);
					close(socketHandle);
					return -1;
				}
				return false;
			}
		}
		if (ret == 0)
		{
			break;
		}
	}
#else
	//��������
	int ret = ::connect(socketHandle, (struct sockaddr*)&svraddr, sizeof(svraddr));
	if (ret >= 0) {
		CCLOG("Client connect OK  address: %s:%d ", ip, port);
		return socketHandle;
	}
	if (errno != EINPROGRESS) {
		CCLOG("Connect Error! errno::%d desc::%s  connect ret::%d", errno, strerror(errno), ret);
		close(socketHandle);
		return -1;
	}
#endif

	fd_set myset;
	int valopt;
	socklen_t lon;
	timeval selectTimeOut = { 30, 0 };
	do {
		FD_ZERO(&myset);
		FD_SET(socketHandle, &myset);
		int rt = select(socketHandle + 1, NULL, &myset, NULL, &selectTimeOut);
		if (rt < 0 && errno != EINTR) {
			CCLOG("Error connecting %d - %s", errno, strerror(errno));
			::close(socketHandle);
			return -1;
		}
		else if (rt > 0)
		{
			// Socket selected for write
			lon = sizeof(int);
			//�������״̬
#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)
			int status = getsockopt(socketHandle, SOL_SOCKET, SO_ERROR, (char*)(&valopt), &lon);
#else
			int status = getsockopt(socketHandle, SOL_SOCKET, SO_ERROR, (void*)(&valopt), &lon);
#endif // (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)

			if (status < 0) {
				CCLOG("Error in getsockopt() %d - %s", errno, strerror(errno));
				::close(socketHandle);
				return -1;
			}
			// Check the value returned...
			if (valopt) {
				CCLOG("Error in delayed connection() %d - %s", valopt, strerror(valopt));
				::close(socketHandle);
				return -1;
			}
			break;
		}
		else {
			CCLOG("Timeout in select() - Cancelling! %d", rt);
			::close(socketHandle);
			return -1;
		}
	} while (true);
	CCLOG("Client connect OK ��socketFd=%d, ip=%s:%d", socketHandle, ip, port);
	return socketHandle;
}

// IPv6
int SocketUtil::connect_ipv6(const char* ip, unsigned short port)
{
	//win32�ĳ�ʼ��
#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)
	WSAData wsadata;
	int iResult = WSAStartup(MAKEWORD(2, 2), &wsadata);
	if (iResult != NO_ERROR)
	{
		WSACleanup();
		CCLOG("Error at WSAStartup()\n");
		return -1;
	}
#endif

	int socketHandle = socket(AF_INET6, SOCK_STREAM, 0);
	if (socketHandle < 0) {
		CCLOG("Error at socket(AF_INET)\n");
		return -1;
	}

	//ģʽ==������
	setNonBlockMode(socketHandle);

	//���³�ʱ����ֻ��������ģʽ�����ã�������ģʽ��recv��send��Ҫ�Լ�����д
#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)
	if (socketHandle == INVALID_SOCKET)
	{
		CCLOG("error at socket():%ld\n", WSAGetLastError());
		close(socketHandle);
		WSACleanup();
		return -1;
	}
	int timeout = 30 * 1000; //ms
	int on = 1;
	setsockopt(socketHandle, SOL_SOCKET, SO_SNDTIMEO, (const char*)&timeout, sizeof(timeout));
	setsockopt(socketHandle, SOL_SOCKET, SO_RCVTIMEO, (const char*)&timeout, sizeof(timeout));
	setsockopt(socketHandle, SOL_SOCKET, SO_REUSEADDR, (const char*)&on, sizeof(on));


#elif (CC_TARGET_PLATFORM == CC_PLATFORM_IOS) || (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
	//�������ӳ�ʱʱ��
	struct timeval timeout = { 30, 0 };//��   
	struct timeval rcvTimeout = { 30, 0 };//��

	int on = 1;
	setsockopt(socketHandle, SOL_SOCKET, SO_SNDTIMEO, &timeout, sizeof(timeout));
	setsockopt(socketHandle, SOL_SOCKET, SO_RCVTIMEO, &rcvTimeout, sizeof(rcvTimeout));
	setsockopt(socketHandle, SOL_SOCKET, SO_REUSEADDR, &on, sizeof(on));
#endif    

	int keepAliveOn = 1;        // ��̽��
	int keepIdleTime = 5;        // ��ʼ̽��ǰ�Ŀ��еȴ�ʱ��
	int keepInterval = 5;       // ����̽��ֽڵ�ʱ����
	int keepCount = 3;          // ����̽��ֽڵĴ���

#if (CC_TARGET_PLATFORM == CC_PLATFORM_IOS) || (CC_TARGET_PLATFORM == CC_PLATFORM_MAC)
	if (setsockopt(socketHandle, IPPROTO_TCP, TCP_KEEPALIVE, &keepIdleTime, sizeof(keepIdleTime))<0){
		CCLOG("SocketUtil::connect: set keep alive idle time error");
		::close(socketHandle);
		return -1;
	}
#elif (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
	if (setsockopt(socketHandle, IPPROTO_TCP, TCP_KEEPIDLE, &keepIdleTime, sizeof(keepIdleTime))<0){
		CCLOG("SocketUtil::connect: set keep alive idle time error");
		::close(socketHandle);
		return -1;
	}
#endif

	struct sockaddr_in6 svraddr;
	memset(&svraddr, 0, sizeof(svraddr));
	svraddr.sin6_family = AF_INET6;
	svraddr.sin6_port = htons(port);
	if (inet_pton(AF_INET6, ip, &svraddr.sin6_addr) < 0) {
		CCLOG("Error at inet_pton(AF_INET6)\n");
		::close(socketHandle);
		return -1;
	}

#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)
	while (true)
	{
		int ret = ::connect(socketHandle, (struct sockaddr*)&svraddr, sizeof(svraddr));
		if (ret == SOCKET_ERROR)
		{
			int r = WSAGetLastError();
			if (r == WSAEWOULDBLOCK || r == WSAEINVAL)
			{
				Sleep(20);
				continue;
			}
			else if (r == WSAEISCONN)//�׽���ԭ���Ѿ����ӣ���  
			{
				break;
			}
			else
			{
				if (errno != EINPROGRESS) {
					CCLOG("Connect Error! errno::%d desc::%s  connect ret::%d", errno, strerror(errno), ret);
					close(socketHandle);
					return -1;
				}
				return false;
			}
		}
		if (ret == 0)
		{
			break;
		}
	}
#else
	//��������
	int ret = ::connect(socketHandle, (struct sockaddr*)&svraddr, sizeof(svraddr));
	if (ret >= 0) {
		CCLOG("Client connect OK �� address: %s:%d ", ip, port);
		return socketHandle;
	}
	if (errno != EINPROGRESS) {
		CCLOG("Connect Error! errno::%d desc::%s  connect ret::%d", errno, strerror(errno), ret);
		close(socketHandle);
		return -1;
	}
#endif

	fd_set myset;
	int valopt;
	socklen_t lon;
	timeval selectTimeOut = { 30, 0 };
	do {
		FD_ZERO(&myset);
		FD_SET(socketHandle, &myset);
		int rt = select(socketHandle + 1, NULL, &myset, NULL, &selectTimeOut);
		if (rt < 0 && errno != EINTR) {
			CCLOG("Error connecting %d - %s", errno, strerror(errno));
			::close(socketHandle);
			return -1;
		}
		else if (rt > 0)
		{
			// Socket selected for write
			lon = sizeof(int);
			//�������״̬
#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)
			int status = getsockopt(socketHandle, SOL_SOCKET, SO_ERROR, (char*)(&valopt), &lon);
#else
			int status = getsockopt(socketHandle, SOL_SOCKET, SO_ERROR, (void*)(&valopt), &lon);
#endif // (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)

			if (status < 0) {
				CCLOG("Error in getsockopt() %d - %s", errno, strerror(errno));
				::close(socketHandle);
				return -1;
			}
			// Check the value returned...
			if (valopt) {
				CCLOG("Error in delayed connection() %d - %s", valopt, strerror(valopt));
				::close(socketHandle);
				return -1;
			}
			break;
		}
		else {
			CCLOG("Timeout in select() - Cancelling! %d", rt);
			::close(socketHandle);
			return -1;
		}
	} while (true);

	CCLOG("Client connect OK ��socketFd=%d, ip=%s:%d", socketHandle, ip, port);
	return socketHandle;
}

//����Ϊ������ģʽ
ssize_t SocketUtil::setNonBlockMode(int fd) 
{
#if(CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)
	u_long flags = 1;
	ssize_t ret = ioctlsocket(fd, FIONBIO, &flags);  	
#else
	int flags = fcntl(fd, F_GETFL, 0);//��ȡ������sockfd�ĵ�ǰ״̬����������
	ssize_t ret = fcntl(fd, F_SETFL, flags | O_NONBLOCK);//����ǰsockfd����Ϊ������
#endif
	if (ret == -1)
		CCLOG("setNonBlockMode error ret::%d", ret);
	return ret;
}

//����Ϊ����ģʽ
ssize_t SocketUtil::setBlockMode(int fd)
{
#if(CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)
	u_long flags = 0;	
	ssize_t ret = ioctlsocket(fd, FIONBIO, &flags);
#else
	int flags = fcntl(fd,F_GETFL,0);//��ȡ������sockfd�ĵ�ǰ״̬����������
	ssize_t ret = fcntl(fd, F_SETFL, flags & (~O_NONBLOCK));//����ǰsockfd����Ϊ����
#endif
	if (ret == -1)
		CCLOG("setNonBlockMode error ret::%d", ret);
	return ret;
}


/**
 * ����0��������,��ʾ���ݳ���
 * ������Ҫ���½�������
 */
ssize_t SocketUtil::receiveData(int handle, unsigned char* buffer, const int64_t& length){
	/**
	*  socket result
	*	r = 0, ��ʾ�����ж�
	*	r > 0, ��ʾ�����ݿɽ���
	*	r < 0, ��WOULD_BLOCK��ʾ��ʱ�����ݿɽ��գ�������ʾ����
	**/

    if(NULL == buffer){
        return ERR_NULL;
    }
	if (handle < 0) {
		return ERR_UNKNOWN;
	}
    	
	ssize_t result = recv(handle, (char*)buffer, length, 0);
#if(CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)		
		if (result == SOCKET_ERROR)
		{
			int r = WSAGetLastError();
			if (r == WSAEWOULDBLOCK)
			{
				return 0;
			}
			else if (r == WSAENETDOWN)
			{
				return -1;
			}
		}
		else if (0 == result)
		{
			printf("SocketUtil::receiveData result=0 : errno=%d\n", errno);
			return ERR_NET;
		}
		else 
		{
			return result;
		}
	
#else
    //�����������ݳ���
    if(result > 0){
        return result;
    }
    if(0 == result){
        printf("SocketUtil::receiveData result=0 : errno=%d\n",errno);
        return ERR_NET;
    }
	// result < 0
    switch (errno) {
		case EAGAIN:
		case EINTR:
		case EINPROGRESS:
            return 0;
        default:
            CCLOG("SocketUtil::receiveData: errno=%d\n",errno);
            return ERR_NET;
    }
#endif

	return result;
}

ssize_t SocketUtil::sendData(int handle, const unsigned char* data, const int64_t& length){
    if(NULL==data){
        return ERR_NULL;
    }
	if (handle < 0) {
		return ERR_UNKNOWN;
	}
	ssize_t result = send(handle, (char*)data, length, 0);
	if (result < 0){
		CCLOG("SocketUtil::sendData: errno=%d\n", errno);
    }
	return result;
}

std::string SocketUtil::getLocalIP(int handle){
    struct sockaddr_in sa;
    socklen_t len;
    getsockname(handle,  ( struct sockaddr* )&sa, &len);
    
    return string(inet_ntoa(sa.sin_addr),len);
}

std::string SocketUtil::getIPByName(const char* name) 
{
	struct addrinfo *cur, *result;
	if (0 != getaddrinfo(name, NULL, NULL, &result)) {
		CCLOG("Error at getaddrinfo()\n");
		return std::string(name);
	}
	char ipaddr[128] = { 0 };
	for (cur = result; cur != NULL; cur = cur->ai_next)
	{
		const struct sockaddr *sa = cur->ai_addr;
		if (AF_INET6 == sa->sa_family)
		{
            if( NULL != inet_ntop(AF_INET6, &((struct sockaddr_in6*)sa)->sin6_addr, (char *)ipaddr, sizeof(ipaddr)) )
                break;
		}
        else
        {
            if( NULL != inet_ntop(AF_INET, &((struct sockaddr_in*)sa)->sin_addr, (char *)ipaddr, sizeof(ipaddr)) )
                break;
        }
	}
	freeaddrinfo(result);

	return std::string(ipaddr);
}

std::string SocketUtil::IPv4ToIPv6(std::string IPv4)
{
	return std::string("::FFFF.") + IPv4;
}


