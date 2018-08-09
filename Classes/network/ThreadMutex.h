//
//  ThreadMutex.h
//
//  实现一个区域锁, 以便更简单地处理线程同步问题
//
//  利用离开一个命名区间时, 析构函数的自动调用解锁
//
//  这个锁可以递归调用
//
//  因为使用自动释放的锁需要构造一个类的实例, 所以最好是用在比较复杂的逻辑中
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


//构造这个类的实例会锁住线程
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
