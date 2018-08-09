//
//  GameException.h
//  BMTest
//
//  Created by Sunwing on 13-9-9.
//
//

#ifndef __GameException__H__
#define __GameException__H__

#include "cocos2d.h"

using namespace std;

enum ErrorType {
    ERR_CONTINUE = 1,
    ERR_OK       = 0,
    ERR_UNKNOWN			                    =-1,	  //未知错误
    ERR_OUT_BOUND                           =-2,      //数组越界
    ERR_NULL			                    =-3,      //空指针错误
    ERR_LOOP			                    =-4,      //死循环错误
    ERR_IO				                    =-5,      //IO错误
    ERR_LOGIC			                    =-6,      //逻辑错误
    ERR_MEMORY			                    =-7,      //内存溢出


    ERR_SYS				                    =-9,      //系统故障
    ERR_NET 			                    =-11,	  //网络无响应
    ERR_SERVER_STOP		                    =-12,     //服务器未启动
    ERR_REGESTER_STOP	                    =-13,     //服务器暂停注册
    ERR_SERVER_BUSY		                    =-14,     //系统繁忙,请稍候再试!
    ERR_ALPHA			                    =-17,     //封测期间,只有指定的账号才能进入游戏
    ERR_PROTOCOL		                    =-18,     //关键数据错误
    ERR_DB_EXCEPTION	                    =-19,     //数据库错误
    ERR_SESSION			                    =-20,     //sessionID 与 用户ID不匹配
    ERR_NO_HEART_BEAT_OVERTIME              =-21,     //太长时间无反应, 自动登出
    ERR_LOGIN_ON_OTHER_DEVICE               =-22,     //您的账户在其他设备上登入



    ERR_HTTP_LINK_NULL                      =-10001,  //服务器地址为未定义
    ERR_CONTROL_BUFFER_FULL                 =-10002,  //controlQueue已满
    };

class GameException {
    
    CC_SYNTHESIZE(ErrorType, type, Type)  ;
    CC_SYNTHESIZE_PASS_BY_REF(string, message, Message)  ;
    
public:
    GameException()
    :type(ERR_OK)
    ,message("")
    {
    }
    
    GameException(ErrorType _type, const char* msg, ...)
    :type(_type)
    {
        char strBuf[1024]={0};
        va_list ap;
        va_start(ap, msg);
        vsnprintf(strBuf, 1024, msg, ap);
        va_end(ap);
        message = strBuf;
    }
    
    ~GameException(){}
};


#endif /* defined(__GameException__H__) */
