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


// ��Ϣ����
std::vector<cocos2d::EventCustom*> NetworkManager::_eventList;
ThreadMutex NetworkManager::_eventLock;

// �������
std::vector<std::string> NetworkManager::_requestList;
ThreadMutex NetworkManager::_requestLock;

int64_t NetworkManager::heartBeatInterval = 30*1000;
bool NetworkManager::isHeartBeat = true;

// ��Կ
std::string NetworkManager::encryt_key = "9aa44e879829712f";
std::string NetworkManager::decryt_key = "9aa44e879829712f";


NetworkManager::NetworkManager(){

}
NetworkManager::~NetworkManager(){

}

//�̰߳�ȫ�ط����¼�
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
	//��ֹ���������ѹ(UI�Ѿ���ͣ���������̻߳��ڼ���) 
	if (size > EVENT_QUEUE_SIZE) {
		////ȡ����һ��
		//EventGame* replaceEvent = dynamic_cast<EventGame*>(_eventList.at(0));
		////�Ӷ�ͷ�Ƴ�
		//_eventList.erase(_eventList.begin());
		////��ֵ���β������
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

//��������
void NetworkManager::addRequest(const std::string& _request)
{
	CCLOG("addRequest::%s", _request.c_str());
	ThreadLock lock(&_requestLock);
	_requestList.push_back(_request);
}

//ת������Ϊ����
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


//�����յ������ݰ�
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

// �������
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

//���ӵ�server������߳���������ip��port��ͬ���������κ�����
void NetworkManager::connectToServer(const std::string& _ip, uint16_t _port){
    
    if(_ip==SocketThread::getIP() && _port==SocketThread::getPort() && SocketThread::getRunning()) {
        return;
    }

    SocketThread::stop();

	//�������
	resetbeforstartup();

    //Ĭ��empty��ʱ���޸�ip
    if(!_ip.empty()){
        SocketThread::setIP(_ip);
    }
    //Ĭ��0��ʱ���޸�port
    if (_port > 0) {
        SocketThread::setPort(_port);
    }

    SocketThread::start();
}

//�������ӵ�������
int NetworkManager::tryConnectToServer(const std::string &_ip, uint16_t _port){

    class TryConnectThread:public GameThread 
	{
        std::string ip;
        uint16_t port;
    public:
        TryConnectThread(const std::string &_ip, uint16_t _port):ip(_ip),port(_port){}
        //��ѭ��ǰ����һ��
        virtual int beforeLoop(){
            SocketThread::stop();
            SocketThread::setIP(ip);
            SocketThread::setPort(port);
            SocketThread::tryConnect();
            return -1; //�������˳��߳�
        }
        //ѭ�����ϵ���
        virtual int loop(){
            return -1;
        }
        //��ѭ�����������һ��
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
