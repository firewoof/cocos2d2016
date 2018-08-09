//
//  CPToolKit.mm
//  BMGame
//
//  Created by Sunwing on 14-6-7.
//
//

#include "CPToolKit.h"
//#include "DownloadThread.h"
#include "json/document.h"
#include "json/filestream.h"
#include "json/stringbuffer.h"
#include "json/writer.h"
#include "NetworkManager.h"

std::map<std::string, std::function<void (std::string)>> CPToolKit::callbackMap;
bool CPToolKit::_isSDKReady = false;

void CPToolKit::showLoginUI(){

}

/**
 * @param price     充值money数
 * @param billNo    订单号
 * @param billTitle 商品名
 * @param roleId    角色ID
 * @param zoneId    服务器分区...
 */
void CPToolKit::showChargeUI(int price,
                             const std::string &billNO,
                             const std::string &billTitle,
                             const std::string &roleID,
                             const std::string &zoneID,
                             const std::string &billDesc,
                             const std::string &jsonDataStr
                             ){
   
    
}

void CPToolKit::showCenter(){
#ifdef CHANNEL_ID_101_PP
    [[PPAppPlatformKit share] showSDKCenter];
#elif CP_KUAIYONG
    [[KYSDK instance] setUpUser];
#else
#endif
    
}


void CPToolKit::logout(){
#ifdef CHANNEL_ID_101_PP
     [[PPAppPlatformKit share] logout];
#endif
}

void CPToolKit::quitGame(){
#ifdef CP_KUAIYONG
    [[KYSDK instance] userLogOut ];
#endif
}

bool CPToolKit::isSDKReady(){
    return CPToolKit::_isSDKReady;
}

void CPToolKit::addCallback(const std::string& callbackKey, const std::function<void (std::string)> &callfunc){
    printf("CPToolKit::addCallback->callbackKey == %s\n", callbackKey.c_str());
    CPToolKit::callbackMap[callbackKey] = callfunc;
}

/**
 * @param callBackKey 注册回调的key
 * @param result      执行某个key的回调希望传递的参数
 */
void CPToolKit::exeCallback(const std::string& callbackKey, const std::string& result){
    printf("exeCallback callbackKey == %s\n", callbackKey.c_str());
    printf("exeCallback result == %s\n", result.c_str());
    auto fun = CPToolKit::callbackMap[callbackKey];
    
    //NetworkManager::dispatchEventSafe(callbackKey, result);
    
    if(fun == nullptr){
        printf("not found callFunc by key [ %s ]\n", callbackKey.c_str());
        return;
    }
    
    CCLOG("result str = %s",result.c_str());

    fun(result);
}

