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
    ERR_UNKNOWN			                    =-1,	  //δ֪����
    ERR_OUT_BOUND                           =-2,      //����Խ��
    ERR_NULL			                    =-3,      //��ָ�����
    ERR_LOOP			                    =-4,      //��ѭ������
    ERR_IO				                    =-5,      //IO����
    ERR_LOGIC			                    =-6,      //�߼�����
    ERR_MEMORY			                    =-7,      //�ڴ����


    ERR_SYS				                    =-9,      //ϵͳ����
    ERR_NET 			                    =-11,	  //��������Ӧ
    ERR_SERVER_STOP		                    =-12,     //������δ����
    ERR_REGESTER_STOP	                    =-13,     //��������ͣע��
    ERR_SERVER_BUSY		                    =-14,     //ϵͳ��æ,���Ժ�����!
    ERR_ALPHA			                    =-17,     //����ڼ�,ֻ��ָ�����˺Ų��ܽ�����Ϸ
    ERR_PROTOCOL		                    =-18,     //�ؼ����ݴ���
    ERR_DB_EXCEPTION	                    =-19,     //���ݿ����
    ERR_SESSION			                    =-20,     //sessionID �� �û�ID��ƥ��
    ERR_NO_HEART_BEAT_OVERTIME              =-21,     //̫��ʱ���޷�Ӧ, �Զ��ǳ�
    ERR_LOGIN_ON_OTHER_DEVICE               =-22,     //�����˻��������豸�ϵ���



    ERR_HTTP_LINK_NULL                      =-10001,  //��������ַΪδ����
    ERR_CONTROL_BUFFER_FULL                 =-10002,  //controlQueue����
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
