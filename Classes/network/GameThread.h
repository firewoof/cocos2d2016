//
//  GameThread.h
// Created by Sunwing on 13-5-7.
//
//

#ifndef __GameThread__H__
#define __GameThread__H__

#include <iostream>
#include <thread>

class GameThread
{ 
public:
    std::thread *_thread = nullptr;
	std::thread::id _threadId;
    
    GameThread();
    virtual ~GameThread();
    
    void threadStop();
    void threadStart();
    
    bool getIsStop();
    bool getIsRunning();
    
    void setIsDeleteAfterThreadEnded(bool _isDelete);
private:
    
    bool isStop;
    bool isRunning;
    bool isDelete;
    
    //��ѭ��ǰ����һ��
    virtual int beforeLoop(){return -1;};
    //ѭ�����ϵ���
    virtual int loop(){return -1;};
    //��ѭ�����������һ��
    virtual int afterLoop(){return -1;};
    
    
    static void* run(void*);
    
protected:
    

    
};
#endif /* defined(__GameThread__H__) */
