//
//	SDK���빤����
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
	//�ص���������
    static std::map<std::string, std::function<void (std::string) >> callbackMap;
    
public:
	//show ��¼����
    static void showLoginUI();
	//��ֵ����
    static void showChargeUI(int price,
                             const std::string& billNO,
                             const std::string& billTitle,
                             const std::string& roleID,
                             const std::string& zoneID,
                             const std::string& billDesc,
                             const std::string& jsonDataStr
                             );
    //�û�����
    static void showCenter();
    //ע��
    static void logout();
    
    static void quitGame();
    //ע��ص�
    static void addCallback(const std::string& callbackKey, const std::function<void (std::string)> &callfunc);
    //ִ�лص�
    static void exeCallback(const std::string& callbackKey, const std::string& result);        
    //
    static bool isSDKReady();
    
    static bool _isSDKReady;

};
#endif

