//
//  ThreadMutex.h
//
//  ʵ��һ��������, �Ա���򵥵ش����߳�ͬ������
//
//  �����뿪һ����������ʱ, �����������Զ����ý���
//
//  ��������Եݹ����
//
//  ��Ϊʹ���Զ��ͷŵ�����Ҫ����һ�����ʵ��, ������������ڱȽϸ��ӵ��߼���
//
//  Created by Sunwing on 13-9-9.
//
//

#ifndef __ThreadMutex__H__
#define __ThreadMutex__H__

#define synchronized(X) for(ThreadLock X##_lock(X);X##_lock;X##_lock.setUnlock())


#include <mutex>

class ThreadMutex {
    
public:
    ThreadMutex(){
		pLock = new std::recursive_mutex();
    }

    ~ThreadMutex(){
        delete pLock;
    }
    
    void lock() { 
		pLock->lock(); 
	}

    void unlock() { 
		pLock->unlock(); 
	}

private:
	std::recursive_mutex* pLock;
};


//����������ʵ������ס�߳�
class ThreadLock{
    
public:
    ThreadLock(ThreadMutex* _mutex):mutex(_mutex),islock(true){
        mutex->lock();
    }

    ~ThreadLock(){
        mutex->unlock();
    }
    
    void setUnlock(){
        islock=false;
    }
    
    operator bool () const{
        return islock;
    }
    
private:
    ThreadMutex* mutex;
    bool islock;
};


#endif /* defined(__ThreadMutex__H__) */
