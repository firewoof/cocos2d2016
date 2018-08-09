//
//  EventGame.cpp
//Created by zouly on 2016 / 09 / 22.
//
//

#include "EventGame.h"

EventGame::EventGame(const std::string& eventName)
:cocos2d::EventCustom(eventName)
,_strData("")
{
    
}

EventGame::~EventGame(){
    
}