//
//  SocketThread.h
//
//  Created by sunwing on 13-11-6.
//
//

#ifndef __SocketThread__H__
#define __SocketThread__H__

#ifndef SOCKET_SLEEP_TIME
#define SOCKET_SLEEP_TIME 30000
#endif

#include <iostream>
#include "GameThread.h"
#include "ByteCircle.h"
#include "cocos2d.h"

using namespace std;

class SocketThread : public GameThread
{
public:
    static int64_t lastSendDataTime;
	static int64_t lastRecvDataTime;

public:
    
    static void setIP(const string& _ip);
    static const string& getIP();
    static void setPort(uint16_t _port);
    static uint16_t getPort();
    
    static void start();
    static void stop();

    static int sendData(const unsigned char* data, const int64_t& length);
    static int sendData(cocos2d::Data* data);

	static int tryConnect(void);
    static void closeConnection(void);

    static bool getRunning(){return _instance!=NULL && _instance->getIsRunning() && _instance->getIsStop()==false;}
    
    static int releaseSocketHandlerAndStop();
    
private:
    
    SocketThread();
    ~SocketThread();
    
    int writeData(const unsigned char* data,size_t length);
    
    static SocketThread* _instance;
    static SocketThread* getInstance();
        
    string ip;
    uint16_t port;
	int socketHandle;

	ByteCircle* inCircle;
	ByteCircle* outCircle;
            
    ssize_t sendData();
	ssize_t recvData();
    
	int reconnect();
    int openConnection();
    void socketShutdown();

    virtual int beforeLoop();
    virtual int loop();
    virtual int afterLoop();
};

#endif /* defined(__SocketThread__H__) */
