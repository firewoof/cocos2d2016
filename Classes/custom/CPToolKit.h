//
//	SDK接入工具类
//  CPToolKit.h
//  Created by zouly.
//
//

#ifndef _CPToolKit_h_
#define _CPToolKit_h_

#include <iostream>
#include <map>
#include <functional>


class CPToolKit {
	//回调函数集合
    static std::map<std::string, std::function<void (std::string) >> callbackMap;
    
public:
	//show 登录界面
    static void showLoginUI();
	//充值界面
    static void showChargeUI(int price,
                             const std::string& billNO,
                             const std::string& billTitle,
                             const std::string& roleID,
                             const std::string& zoneID,
                             const std::string& billDesc,
                             const std::string& jsonDataStr
                             );
    //用户中心
    static void showCenter();
    //注销
    static void logout();
    
    static void quitGame();
    //注册回调
    static void addCallback(const std::string& callbackKey, const std::function<void (std::string)> &callfunc);
    //执行回调
    static void exeCallback(const std::string& callbackKey, const std::string& result);        
    //
    static bool isSDKReady();
    
    static bool _isSDKReady;

};
#endif

