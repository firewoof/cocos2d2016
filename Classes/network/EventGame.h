//
//  EventGame.h
//  Created by zouly on 2016/09/22.
//
//

#ifndef __BlackSG_JS__EventGame__
#define __BlackSG_JS__EventGame__

//#include <stdio.h>
#include "cocos2d.h"

class EventGame : public cocos2d::EventCustom {
    
    CC_SYNTHESIZE_PASS_BY_REF(std::string, _strData, StrData);
public:
    EventGame(const std::string& eventName);
    ~EventGame();
};

#endif /* defined(__BlackSG_JS__EventGame__) */
