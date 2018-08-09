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
//析构函数, 强制停止线程
GameThread::~GameThread(){
    threadStop();
}

//启动线程
void GameThread::threadStart(){
    
    isStop=false;
    if (_thread == nullptr) {
        _thread = new std::thread(run, this);
		_threadId = _thread->get_id();
    }
}

//关闭线程,直到线程完全退出
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
    
    //执行前置任务
	thread->isRunning = true;
	thread->isStop = false;
    int result = thread->beforeLoop();
    if(result < 0){
        return NULL;
    }
    
    //执行循环体
    while (false==thread->isStop) {
        result = thread->loop();
        if(result < 0){
            break;
        }
    }

	//执行后置任务
	// 利用对象退出时调用析构函数来触发
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