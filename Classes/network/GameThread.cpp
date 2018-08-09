//
//  GameThread.cpp
//  Created by Sunwing on 13-5-7.
//
//

#include "GameThread.h"


GameThread::GameThread():isRunning(false),isStop(false),isDelete(false)
{
    isStop=true;
}
//��������, ǿ��ֹͣ�߳�
GameThread::~GameThread(){
    threadStop();
}

//�����߳�
void GameThread::threadStart(){
    
    isStop=false;
    if (_thread == nullptr) {
        _thread = new std::thread(run, this);
		_threadId = _thread->get_id();
    }
}

//�ر��߳�,ֱ���߳���ȫ�˳�
void GameThread::threadStop(){
    isStop=true;
    if (_thread != nullptr) {
//        _thread->join();
        _thread->detach();
		delete _thread;
        _thread = nullptr;
        isRunning = false;
    }
}

void* GameThread::run(void * arg)
{
	class ExecuteAfterEnd
	{
	private:
		GameThread* m_pThread;
	public:
		ExecuteAfterEnd(GameThread* _thread) :m_pThread(_thread){};
		~ExecuteAfterEnd()
		{
			m_pThread->afterLoop();
			m_pThread->isRunning = false;
			m_pThread->isStop = true;
		};
	};

    GameThread* thread = (GameThread*) arg;
    ExecuteAfterEnd executeAfterEnd(thread);
    
    //ִ��ǰ������
	thread->isRunning = true;
	thread->isStop = false;
    int result = thread->beforeLoop();
    if(result < 0){
        return NULL;
    }
    
    //ִ��ѭ����
    while (false==thread->isStop) {
        result = thread->loop();
        if(result < 0){
            break;
        }
    }

	//ִ�к�������
	// ���ö����˳�ʱ������������������
    return NULL;
}

bool GameThread::getIsStop(){
    return isStop;
}
bool GameThread::getIsRunning(){
    return isRunning;
}

void GameThread::setIsDeleteAfterThreadEnded(bool _isDelete){
    isDelete = _isDelete;
}