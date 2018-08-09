//
//  SocketThread.cpp
//  Cocos2dxTest
//
//  һ����ָ����ַ��������, ��������, ���������ص�socket�߳�
//  ���յ������ݻ�ŵ�ָ�����ȵ�ѭ��ʹ��buffer��
//  ����������, ���������ݲ�����������
//  ��ѭLazy����Э��
//
//  Created by Lakoo on 13-5-6.
//
//

#include "SocketThread.h"
#include "SocketUtil.h"
#include "ByteUtil.h"
#include "Common.h"
#include "NetworkManager.h"
#include <memory>

#if(CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)
#define close(s) closesocket(s)
#define usleep(s) Sleep(s/1000)
#else
#include <netdb.h>
#include <unistd.h>
#endif

using namespace std;


SocketThread* SocketThread::_instance=nullptr;

int64_t SocketThread::lastSendDataTime = 0;
int64_t SocketThread::lastRecvDataTime = 0;

const unsigned int bufferSize = 128 * 1024;


SocketThread* SocketThread::getInstance(){
    if (nullptr == _instance) {
        _instance = new SocketThread();
    }
    return _instance;
}

SocketThread::SocketThread()
:socketHandle(-1)
{
    ip = "127.0.0.1";
    port = 0;

	//����4M��������
	inCircle = new ByteCircle(4 * 1024 * 1024);
	outCircle = new ByteCircle(512 * 1024);
}

SocketThread::~SocketThread(){
	delete inCircle;
	delete outCircle;
}

int SocketThread::beforeLoop(){    
    return reconnect();
}

int SocketThread::afterLoop(){
    
    socketShutdown();

	lastRecvDataTime = 0;
	lastSendDataTime = 0;

	outCircle->skip(outCircle->getSize());
	inCircle->skip(inCircle->getSize());

    stringstream ss;
    ss<<getIP()<<":"<<getPort();
    NetworkManager::dispatchEventSafe(gamesocket::EVENT_DISCONNECT, ss.str());
    return 0;
}

int SocketThread::loop(){

	// ��������
    ssize_t result = sendData();
    if(result < 0){
		CCLOG("send result::%d", result);
		return -1;
    }
	// ������Ӧ
	result = recvData();
    if(result < 0){
		CCLOG("recv result::%d", result);
		return -1;
    }

    // Sleep 30����
#if(CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)
	Sleep(SOCKET_SLEEP_TIME/1000);
#else
	usleep(SOCKET_SLEEP_TIME);
#endif    
    return 0;
}


void SocketThread::setIP(const string& _ip){
    getInstance()->ip = _ip;
}

const string& SocketThread::getIP(){
    return getInstance()->ip;
}

void SocketThread::setPort(uint16_t _port){
    getInstance()->port = _port;
}

uint16_t SocketThread::getPort(){
    return getInstance()->port;
}

//���������������
ssize_t SocketThread::sendData(){

	//��������, ������
	NetworkManager::getRequestData();
    uint64_t currentTime = Common::getCurrentTime();
	int length = outCircle->getSize();
    if(length <= 0){
		// �������
		NetworkManager::check_heartbeat(currentTime, lastSendDataTime);
        return 0;
    }

	static unsigned char outBuffer[bufferSize];
	length = length < bufferSize ? length : bufferSize;
	outCircle->getData(outBuffer, 0, length);
	ssize_t sended = SocketUtil::sendData(socketHandle, outBuffer, length);
	if (sended < 0)
		return sended;
    
	// ���ͳɹ�������״̬
	outCircle->skip(sended);
	lastSendDataTime = currentTime>0 ? currentTime : lastSendDataTime;
	//CCLOG("SocketThread::sendData: send %d bytes", length);
    return 0;
}


//���Զ��������·�������
ssize_t SocketThread::recvData(){
	
	static unsigned char inBuffer[bufferSize] = { 0 };
    ssize_t result = SocketUtil::receiveData(socketHandle, inBuffer, bufferSize);
    if(result < 0) {
        return result;
    }

	uint64_t currentTime = Common::getCurrentTime();
    if(result > 0) {
        //CCLOG("SocketThread::recvData: recv %d bytes", result);
        inCircle->pushData(inBuffer, 0, result);
		lastRecvDataTime = currentTime>0 ? currentTime : lastRecvDataTime;
    }
	else{
		// �����
		if (!NetworkManager::check_keepalived(currentTime, lastRecvDataTime)) {
			return -100;
		}
	}

	do 
	{
		//���Զ������ݰ�
		auto_ptr<cocos2d::Data> package(inCircle->getPackage());

		//����NULL ����, �ж�����
		if (NULL == package.get()){
			return -1;
		}
		//���ؿհ�, ����
		if (package->getSize() == 0){
			return 0;
		}
		//������, �������ݰ�
		NetworkManager::onReceiveData(package.get());

	} while (true);
    
    return 0;
}

int SocketThread::writeData(const unsigned char* data, size_t length){
    return outCircle->pushData(data, 0, length);
}

int SocketThread::openConnection(){
    socketHandle = SocketUtil::connect(ip.c_str(), port);
	CCLOG("SocketThread::openConnection: done! socketHandle::%d", socketHandle);

	stringstream ss;
	ss << ip << ":" << port;

	//����ʧ��
    if(socketHandle < 0){
        NetworkManager::dispatchEventSafe(gamesocket::EVENT_CONNECT_FAIL, ss.str());
        return -1;
    }
    
    //����������֤����
    ssize_t result = SocketUtil::setBlockMode(socketHandle);
    if(result < 0){
        NetworkManager::dispatchEventSafe(gamesocket::EVENT_CONNECT_FAIL, ss.str());
        return -1;
    }
    result = SocketUtil::setNonBlockMode(socketHandle);
    if(result < 0){
        NetworkManager::dispatchEventSafe(gamesocket::EVENT_CONNECT_FAIL,ss.str());
        return -1;
    }
    
    //֪ͨ���ӽ���
    NetworkManager::dispatchEventSafe(gamesocket::EVENT_CONNECTED, ss.str());
	return 0;
}

int SocketThread::reconnect(){
    
    for(int i=0; i<1; i++){
        if (getIsStop()) {
            break;
        }
        stringstream ss;
        ss<<ip<<":"<<port;
        if (0 == i) {
            NetworkManager::dispatchEventSafe(gamesocket::EVENT_TRY_CONNECT, ss.str());
        }
		else{
            ss<<" "<<i;
            NetworkManager::dispatchEventSafe(gamesocket::EVENT_RETRY, ss.str());
        }
        CCLOG("reconnect socketHandle shutdown %d reconnect ip=%s:%d", socketHandle, getIP().c_str(), getPort());
        socketShutdown();

        if(0 == openConnection()){
            return 0;
        }
    }

    stringstream ss;
    ss<<ip<<":"<<port;
    NetworkManager::dispatchEventSafe(gamesocket::EVENT_RETRY_FAIL, ss.str());
    //�˳�
    return -1;

}

int SocketThread::sendData(const unsigned char* data, const int64_t& length){
    return getInstance()->writeData(data, length);
}

int SocketThread::sendData(cocos2d::Data* _data){
    return getInstance()->writeData(_data->getBytes(), _data->getSize());
}


void SocketThread::start(){
    SocketThread* _socketThread = getInstance();
    if(_socketThread->getIsStop() && !_socketThread->getIsRunning()){
        _socketThread->threadStart();
    }
}

void SocketThread::stop(void){
	closeConnection();
}

int SocketThread::tryConnect(void){
    CCLOG("tryConnect---");
	return getInstance()->openConnection();
}

void SocketThread::socketShutdown(){
    if(socketHandle >= 0){
#if(CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)
		//nothing to do
#else
		::shutdown(socketHandle, SHUT_RDWR);
#endif      
        ::close(socketHandle);     
        socketHandle = -1;
    }
}

int SocketThread::releaseSocketHandlerAndStop(){
    SocketThread* _socketThread = getInstance();
    int returnSocketHandle = _socketThread->socketHandle;
    SocketThread::getInstance()->socketHandle=-1;
    _socketThread->threadStop();
    return returnSocketHandle;
}

void SocketThread::closeConnection(void)
{
    SocketThread* _socketThread = getInstance();
	CCLOG("SocketThread::closeConnection %d closeConnection ip=%s:%d", _socketThread->socketHandle, getIP().c_str(), getPort());
	_socketThread->socketShutdown();
    _socketThread->threadStop();
    //���������߳�ֱ���߳���ȫֹͣ
    //while (_socketThread->getIsRunning()) {
    //    usleep(10000);
    //}
}


