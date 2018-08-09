/**
 * 全局常量--规则：这里的全局常量请在函数内部用
 * Created by Administrator on 2017-03-29.
 */
//账号服务器地址
//ACCOUNT_ADDR =  "192.168.1.180";
ACCOUNT_ADDR =  "account.aiweipan.com";

// 应用名
APPNAME_YYMY  = window.APPNAME_YYMY || "yymy";
APPNAME_QCJY  = window.APPNAME_QCJY || "qcjy";
APPNAME_RRJY  = window.APPNAME_RRJY || "rrjy";
APPNAME_JYZJ  = window.APPNAME_JYZJ || "jyzj";
APPNAME_WZJY  = window.APPNAME_WZJY || "wzjy";
APPNAME_PPJY  = window.APPNAME_PPJY || "ppjy";
APPNAME_LLTJ  = window.APPNAME_LLTJ || "lltj";
APPNAME_AQQ   = window.APPNAME_AQQ  || "aqq";

// MagicWindow mLink配置(待整合到深度短链分发管理那里)
var APP_MLINK_DEFAULT =
{
    qcjy : {
        dev: "https://a.mlinks.cc/AKkL",
        beta: "https://a.mlinks.cc/AK48"
    },
    rrjy : "https://a.mlinks.cc/AK4G",
    jyzj : "https://a.mlinks.cc/AK4y",
    wzjy : "https://a.mlinks.cc/AK4x",
    ppjy : {
        release: "https://a.mlinks.cc/AK64",
        beta: "https://a.mlinks.cc/AKJ9"
    },
    lltj : "https://a.mlinks.cc/AKxZ",
    aqq  : "https://a.mlinks.cc/AKx1"
};

/*
 * ShareSDK初始化数据
 * */
// 全城交易内服
var ShareSDKInitData_QCJY_DEV = {
    "SDKAppKey": "192d8594be8b8",
    "SinaWeibo":{
        "AppKey":"3196315674",
        "AppSecret":"7cc9ca79a7b27bf92b352329ce13f130",
        "RedirectUrl": "Http://aiweipan.com/authCallback"
    },
    "QQ":{
        "AppId":"1105733659",
        "AppKey":"upJT4Jif7UlFIt6i"
    },
    "Wechat":{
        "AppId":"wx00f260f12bc99d51",
        "AppSecret":"c42dd0d016222734fed8d920c599fe24"
    }
};
// 全城交易
var ShareSDKInitData_QCJY = {
    "SDKAppKey": "192d8594be8b8",
    "SinaWeibo":{
        "AppKey":"3196315674",
        "AppSecret":"7cc9ca79a7b27bf92b352329ce13f130",
        "RedirectUrl": "Http://aiweipan.com/authCallback"
    },
    "QQ":{
        "AppId":"1105733659",
        "AppKey":"upJT4Jif7UlFIt6i"
    },
    "Wechat":{
        "AppId":"wxc360f2f3f5bc3e18",
        "AppSecret":"e0f74ec565eab08f6d86f2d6feccd0e0"
    }
};
// 人人交易
var ShareSDKInitData_RRJY = {
    "SDKAppKey": "192d8594be8b8",
    "SinaWeibo":{
        "AppKey":"3196315674",
        "AppSecret":"7cc9ca79a7b27bf92b352329ce13f130",
        "RedirectUrl": "Http://aiweipan.com/authCallback"
    },
    "QQ":{
        "AppId":"1105993925",
        "AppKey":"KgiL6hhOrmDL34at"
    },
    "Wechat":{
        "AppId":"wx54606b6abebf6175",
        "AppSecret":"148b77ea3e6a85c39dfa8721c6a764e2"
    }
};
// 交易之家
var ShareSDKInitData_JYZJ = {
    "SDKAppKey": "192d8594be8b8",
    "SinaWeibo":{
        "AppKey":"3196315674",
        "AppSecret":"7cc9ca79a7b27bf92b352329ce13f130",
        "RedirectUrl": "Http://aiweipan.com/authCallback"
    },
    "QQ":{
        "AppId":"1106002772",
        "AppKey":"dsUtmHEkBn5IsxMD"
    },
    "Wechat":{
        "AppId":"wxc2ec45a06708732d",
        "AppSecret":"a45dd70649ffbe6b281003e379692515"
    }
};
// 王者交易
var ShareSDKInitData_WZJY = {
    "SDKAppKey": "192d8594be8b8",
    "SinaWeibo":{
        "AppKey":"3196315674",
        "AppSecret":"7cc9ca79a7b27bf92b352329ce13f130",
        "RedirectUrl": "Http://aiweipan.com/authCallback"
    },
    "QQ":{
        "AppId":"1105927315",
        "AppKey":"NTDWdAqB41ftau6r"
    },
    "Wechat":{
        "AppId":"wx9289819fc5014b0b",
        "AppSecret":"9b10dfb10c1b54e8d2211629630adebb"
    }
};
// PP交易
var ShareSDKInitData_PPJY = {
    "SDKAppKey": "192d8594be8b8",
    "SinaWeibo":{
        "AppKey":"3196315674",
        "AppSecret":"7cc9ca79a7b27bf92b352329ce13f130",
        "RedirectUrl": "Http://aiweipan.com/authCallback"
    },
    "QQ":{
        "AppId":"1106070194",
        "AppKey":"xOLqpfgRZBLyBCib"
    },
    "Wechat":{
        "AppId":"wx7a20e4ed64828758",
        "AppSecret":"c9e1f411717575f802293680504fc5d7"
    }
};

// 利来投教
var ShareSDKInitData_LLTJ = {
    "SDKAppKey": "192d8594be8b8",
    "SinaWeibo":{
        "AppKey":"3196315674",
        "AppSecret":"7cc9ca79a7b27bf92b352329ce13f130",
        "RedirectUrl": "Http://aiweipan.com/authCallback"
    },
    "QQ":{
        "AppId":"1106153152",
        "AppKey":"CB7j5pq0DaY1AblF"
    },
    "Wechat":{
        "AppId":"wx8ec229c4a4940f19",
        "AppSecret":"46487a827a355371a225b0eaaa97a1e1"
    }
};

// 爱期权
var ShareSDKInitData_AQQ = {
    "SDKAppKey": "192d8594be8b8",
    "SinaWeibo":{
        "AppKey":"3196315674",
        "AppSecret":"7cc9ca79a7b27bf92b352329ce13f130",
        "RedirectUrl": "Http://aiweipan.com/authCallback"
    },
    "QQ":{
        "AppId":"1106077403",
        "AppKey":"sATQaHHimy1704ff"
    },
    "Wechat":{
        "AppId":"wx0a0b3994de81804a",
        "AppSecret":"f2c1b7eef71eadfb49446d7f77429c1f"
    }
};



//
var ShareSDKInitData = {
    qcjy : ShareSDKInitData_QCJY,
    rrjy : ShareSDKInitData_RRJY,
    jyzj : ShareSDKInitData_JYZJ,
    wzjy : ShareSDKInitData_WZJY,
    ppjy : ShareSDKInitData_PPJY,
    lltj : ShareSDKInitData_LLTJ,
    aqq  : ShareSDKInitData_AQQ
};