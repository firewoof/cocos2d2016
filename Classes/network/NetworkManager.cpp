//
//  NetworkManager.cpp
//  BlackSG_JS
//
//  Created by Sunwing on 14/10/20.
//
//

#include "NetworkManager.h"
#include "ThreadMutex.h"
#include "Common.h"
#include "SocketThread.h"
#include "EventGame.h"
#include "ByteUtil.h"
#include <time.h>

#define EVENT_QUEUE_SIZE 256


// 消息队列
std::vector<cocos2d::EventCustom*> NetworkManager::_eventList;
ThreadMutex NetworkManager::_eventLock;

// 请求队列
std::vector<std::string> NetworkManager::_requestList;
ThreadMutex NetworkManager::_requestLock;

int64_t NetworkManager::heartBeatInterval = 30*1000;
bool NetworkManager::isHeartBeat = true;

// 秘钥
std::string NetworkManager::encryt_key = "9aa44e879829712f";
std::string NetworkManager::decryt_key = "9aa44e879829712f";


NetworkManager::NetworkManager(){

}
NetworkManager::~NetworkManager(){

}

//线程安全地分派事件
void NetworkManager::dispatchEventSafe(const std::string& _eventName, const std::string& _userData){
    
	unsigned int size = 0;
	{
		ThreadLock lock(&_eventLock);
		EventGame* _event = new EventGame(_eventName);
		_event->setStrData(_userData);
		_event->setUserData((void*)_userData.c_str());
		_eventList.push_back(_event);
		size = _eventList.size();
	}
	//CCLOG("_eventList.length: %d", size);
	//防止网络包挤积压(UI已经暂停，而网络线程还在继续) 
	if (size > EVENT_QUEUE_SIZE) {
		////取出第一个
		//EventGame* replaceEvent = dynamic_cast<EventGame*>(_eventList.at(0));
		////从队头移除
		//_eventList.erase(_eventList.begin());
		////赋值后从尾部插入
		//replaceEvent->setStrData(_userData);
		//replaceEvent->setUserData((void*)_userData.c_str());		
		//_eventList.push_back(replaceEvent);
		NetworkManager::disconnect();
	}
}

void NetworkManager::dispatchAndReleaseAllEvent(){
	cocos2d::Director* _director = cocos2d::Director::getInstance();
	if (!_director->getEventDispatcher()->isEnabled())
		return;
	
	std::vector<cocos2d::EventCustom*> eventList;
	{
		ThreadLock lock(&_eventLock);
		_eventList.swap(eventList);
	}

	EventGame*  _event;    
	for (size_t i = 0; i < eventList.size(); i++) {
		_event = dynamic_cast<EventGame*>(eventList.at(i));		
		if (_event)
		{
			_director->getEventDispatcher()->dispatchEvent(_event);
			//CCLOG("dispatch %s::%s", _event->getEventName().c_str(), _event->getStrData().c_str());
			delete _event;
		}        
    }
}

//增加请求
void NetworkManager::addRequest(const std::string& _request)
{
	CCLOG("addRequest::%s", _request.c_str());
	ThreadLock lock(&_requestLock);
	_requestList.push_back(_request);
}

//转换请求为数据
void NetworkManager::getRequestData()
{   
	std::vector<std::string> requestList;
	{
		ThreadLock lock(&_requestLock);
		_requestList.swap(requestList);
	}
    
	static unsigned char byte[sizeof(int32_t)] = { 0 };
	for (std::vector<std::string>::iterator iter = requestList.begin(); iter != requestList.end(); ++iter)
	{
		//CCLOG("encryt_key::%s, content:%s", encryt_key.c_str(), iter->c_str());
		std::string jsonData = Common::AESEncryt(*iter, encryt_key.c_str());
		//CCLOG("after encryt_key::%s", jsonData.c_str());
		int32_t size = jsonData.size();
		//auto_ptr<unsigned char> length(ByteUtil::intToByte(size));
		//SocketThread::sendData(length.get(), sizeof(int32_t));
		SocketThread::sendData(ByteUtil::valueToByte(size, byte), sizeof(int32_t));
		SocketThread::sendData((unsigned char*)jsonData.data(), size);
    }
}


//处理收到的数据包
void NetworkManager::onReceiveData(cocos2d::Data* _package){
	if (nullptr == _package)
		return;

	std::string base64((char*)_package->getBytes(), _package->getSize());
	std::string jsonstr = Common::AESDecryt(base64, decryt_key.c_str());
	//CCLOG("decryt_key::%s", decryt_key.c_str());
	//CCLOG("base64::%s", base64.c_str());
	//int seconds = time((time_t*)NULL);
	//printf("NetworkManager:%d\n", seconds);
	//CCLOG("NetworkManager::onReceiveData::%s", jsonstr.c_str());
	//CCLOG("NetworkManager::onReceiveTime:%d", seconds);
    dispatchEventSafe(gamesocket::EVENT_RECEIVE_PACKAGE, jsonstr );
}

// 心跳检测
void NetworkManager::check_heartbeat(int64_t currentTime, int64_t lastSendDataTime){
	if (isHeartBeat && lastSendDataTime>0 && (currentTime - lastSendDataTime) > heartBeatInterval)
	{
		CCLOG("heartBeatInterval::%f", heartBeatInterval / 1000);
		NetworkManager::addRequest("{\"action\":\"HEARTBEAT\"}");
	}
}

bool NetworkManager::check_keepalived(int64_t currentTime, int64_t lastRecvDataTime){
	if (lastRecvDataTime>0 && (currentTime - lastRecvDataTime) > (heartBeatInterval + 5 * 1000)) {
		return false;
	}
	return true;
}

//连接到server，如果线程运行中且ip和port相同，不会做任何事情
void NetworkManager::connectToServer(const std::string& _ip, uint16_t _port){
    
    if(_ip==SocketThread::getIP() && _port==SocketThread::getPort() && SocketThread::getRunning()) {
        return;
    }

    SocketThread::stop();

	//清空重置
	resetbeforstartup();

    //默认empty的时候不修改ip
    if(!_ip.empty()){
        SocketThread::setIP(_ip);
    }
    //默认0的时候不修改port
    if (_port > 0) {
        SocketThread::setPort(_port);
    }

    SocketThread::start();
}

//尝试连接到服务器
int NetworkManager::tryConnectToServer(const std::string &_ip, uint16_t _port){

    class TryConnectThread:public GameThread 
	{
        std::string ip;
        uint16_t port;
    public:
        TryConnectThread(const std::string &_ip, uint16_t _port):ip(_ip),port(_port){}
        //在循环前调用一次
        virtual int beforeLoop(){
            SocketThread::stop();
            SocketThread::setIP(ip);
            SocketThread::setPort(port);
            SocketThread::tryConnect();
            return -1; //调用完退出线程
        }
        //循环不断调用
        virtual int loop(){
            return -1;
        }
        //在循环结束后调用一次
        virtual int afterLoop(){
            return -1;
        }
    };
    TryConnectThread* tempThread = new TryConnectThread(_ip,_port);
    tempThread->setIsDeleteAfterThreadEnded(true);
    tempThread->threadStart();
    return 0;
}

void NetworkManager::resetbeforstartup()
{
	std::vector<std::string> requestList;
	{
		ThreadLock lock(&_requestLock);
		_requestList.swap(requestList);
	}
	std::vector<cocos2d::EventCustom*> eventList;
	{
		ThreadLock lock(&_eventLock);
		_eventList.swap(eventList);
	}
}

void NetworkManager::disconnect(){
    SocketThread::stop();
}
