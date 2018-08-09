//
//  NetworkManager.h
//  BlackSG_JS
//
//  Created by Sunwing on 14/10/20.
//
//

#ifndef __BlackSG_JS__NetworkManager__
#define __BlackSG_JS__NetworkManager__

#include <stdio.h>
#include <vector>
#include "cocos2d.h"
#include "ByteCircle.h"


namespace gamesocket {
    static const std::string EVENT_TRY_CONNECT     = "socket_event_try_connect";
    static const std::string EVENT_CONNECTED       = "socket_event_connected";
    static const std::string EVENT_CONNECT_FAIL    = "socket_event_connect_fail";
    static const std::string EVENT_RETRY           = "socket_event_retry";
    static const std::string EVENT_DISCONNECT      = "socket_event_disconnect";
    static const std::string EVENT_RETRY_FAIL      = "socket_event_retry_fail";
    static const std::string EVENT_RECEIVE_PACKAGE = "socket_event_receive_package";
    static const std::string EVENT_BEFORE_SEND     = "socket_event_before_send";
    static const std::string EVENT_SENT_DATA       = "socket_event_sent_data";
    static const std::string DOWNLOAD_START        = "DOWNLOAD_START";
    static const std::string DOWNLOAD_CHECK        = "DOWNLOAD_CHECK";
    static const std::string DOWNLOAD_INTERRUPT    = "DOWNLOAD_INTERRUPT";
    static const std::string DOWNLOAD_PERCENT      = "DOWNLOAD_PERCENT";
    static const std::string DOWNLOAD_FINISH       = "DOWNLOAD_FINISH";
    static const std::string DOWNLOAD_CONFIRM      = "DOWNLOAD_CONFIRM";
    static const std::string START_HEART_BEAT      = "START_HEART_BEAT";
    static const std::string STOP_HEART_BEAT       = "STOP_HEART_BEAT";
}


class ThreadMutex;


class NetworkManager
{
public:
	NetworkManager();
	virtual ~NetworkManager();

private:
    //�����¼�
	static std::vector<cocos2d::EventCustom*> _eventList;
	//�������
	static std::vector<std::string> _requestList;
    
    //�߳�������ס�̣߳����а���
    static ThreadMutex _eventLock;
    static ThreadMutex _requestLock;

	// AES��Կ
	static std::string decryt_key;
	static std::string encryt_key;

	// ����ǰ��ֵ
	static void resetbeforstartup();
    
public:
	// �������
	static bool isHeartBeat;
	static int64_t heartBeatInterval;
	static void check_heartbeat(int64_t currentTime, int64_t lastSendDataTime);
	static bool check_keepalived(int64_t currentTime, int64_t lastRecvDataTime);
    
    //�̰߳�ȫ�ط����¼�
    static void dispatchEventSafe(const std::string& _eventName, const std::string& _userData="");
    //�̰߳�ȫ�ؽ�event���ɵ�ϵͳ�¼�ģ��
    static void dispatchAndReleaseAllEvent();
    
    // ��������
	static void addRequest(const std::string& _request);
    static void getRequestData();

    //�����յ������ݰ�
    static void onReceiveData(cocos2d::Data* _package);
    
    //���ӵ�ָ�������������������߳�
    static void connectToServer(const std::string& _ip, uint16_t port);
    //�������ӵ����������������������߳�
    static int tryConnectToServer(const std::string& _ip, uint16_t port);
    //�Ͽ�����
    static void disconnect();
	
	//����AES��Կ
	static void setAESKEY(const std::string& encryt, const std::string& decryt) { encryt_key = encryt; decryt_key = decryt; };
	static void changeEncrytKey(const std::string& key) { encryt_key = key; };
    
};

#endif /* defined(__BlackSG_JS__NetworkManager__) */
