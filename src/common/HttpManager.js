/**
 * Created by 玲英 on 2016/11/24.
 */

var HttpManager = HttpManager || {};


var localUrl = {
    // 用户
    keyExchange: "cis_user/auth/keyExchange",
    getCode: "cis_user/user/vcode",
    register: "cis_user/user/registe",
    userLogin: "cis_user/user/login",
    guestLoginToken: "cis_user/guest/loginToken",
    guestLogin: "cis_user/guest/login",
    refreshToken: "cis_user/auth/refresh",
    userDetail: "cis_user/user/detail",
    userOthersDetail: "cis_user/user/othersDetail",
    totalWinList: "cis_user/top/totalWinList",
    weekWinList: "cis_user/top/weekWinList",
    accountRechargeTestCoin: "cis_user/account/rechargeTestCoin",
    accountRecharge: "cis_user/account/recharge",
    queryChudianyunRechargeHtml: "cis_user/account/queryChudianyunRechargeHtml", // 获取曝光币充值页面
    queryChudianyunWithdrawHtml: "cis_user/account/queryChudianyunWithdrawHtml", // 获取曝光币提现页面
    accountDetail: "cis_user/account/detail",
    userUpdate: "cis_user/user/update",
    clientConfig: "cis_user/client/config",
    rechargeQuery: "cis_user/account/rechargeQuery",
    appleIapPayResult: "cis_user/account/appleIapPayResult",
    accountPassvcode: "cis_user/account/passvcode",
    accountSetpass: "cis_user/account/setpass",
    accountWithdraw: "cis_user/account/withdraw",
    accountCheckpass: "cis_user/account/checkpass",
    feedbackAdd: "cis_user/feedback/add",
    feedbackGet: "cis_user/feedback/get",
    fundsConfig: "cis_user/funds/config",
    fundsDetail: "cis_user/funds/detail",
    clientVersion: "cis_user/client/version",
    userSignOut: "cis_user/user/signOut",
    userSignIn: "cis_user/user/signIn",
    userSocialRegister: "cis_user/user/socailRegiste",
    mailList: "cis_user/mail/mailList",
    mailRead: "cis_user/mail/read",
    mailDelete: "cis_user/mail/delete",
    checkInvitedCode: "cis_user/user/checkInvitedCode",
    checkBinding:"cis_user/user/checkBinding",
    checkVcode:"cis_user/user/checkVcode",
    clientTime:"cis_user/client/time",
    saveUserConfig:"cis_user/client/saveUserConfig",
    loadUserConfig:"cis_user/client/loadUserConfig",
    saveRealName:"cis_user/user/payInfoUpLoad",

    redDotList:"cis_user/reddot/redDotList",
    clearRedDot:"cis_user/reddot/clearRedDot",

    tradeOthersRecord: "cis_trade/trade/othersRecord",
    tradeProductList:"cis_trade/option/list",                  //产品列表(所有的)
    //tradeProductList:"cis_trade/product/list",                  //产品列表(所有的)
    tradeQuoteRtPrice:"cis_trade/market/rtPrice",               //当前行情
    tradeInit:"cis_trade/trade/init",                           //进入交易场景
    tradeOrder:"cis_trade/trade/order",                         //下单
    tradeMarketHistory:"cis_trade/market/history",              //查历史行情
    tradeQuery:"cis_trade/trade/query",                         //请求结算结果的()
    tradeCurrentDayRecord:"cis_trade/trade/currentDayRecord",   //当天的持仓记录(每次十条)
    //tradeRecord:"cis_trade/trade/record",                       //所有交易记录(每次十条)
    //tradeMyProduct:"cis_trade/product/myProducts",              //我关注的产品
    tradeProductUpdate:"cis_trade/product/update",              //更新同步我的产品
    //tradeUserFetch:"cis_trade/trade/userFetch",                 //抓取用户
    //tradeLatestRecord:"cis_trade/trade/latestRecord",           //已抓到的用户的最近的单
    tradeFetchUser:"cis_trade/trade/fetchUser",                 //抓取新用户）
    tradeUpdateFetchUser:"cis_trade/trade/updateFetchUser",     //更新抓取用户给服务器
    tradePosition:"cis_trade/trade/statInfo",                  //持仓数查询
    tradeKHistory:"cis_trade/market/khistory",                   //蜡烛图 k线历史
    tradeCurKline:"cis_trade/market/rtkline",                   //最新的蜡烛

    //=======模拟场====
    "tradeTestQuoteRtPrice":"cis_trade/market/testRtPrice",     //当前行情(模拟场)
    tradeTestInit:"cis_trade/test/init",                        //交易进场(模拟场)
    tradeTestOrder:"cis_trade/test/order",                      //下单(模拟场)
    tradeTestQuery:"cis_trade/test/query",                      //结算(模拟场)
    //tradeTestRecord:"cis_trade/test/record",                    //持仓记录(所有的)(模拟场)
    tradeTestCurrentDayRecord:"cis_trade/test/currentDayRecord" ,  //当天的持仓记录(模拟场)
    //tradeTestUserFetch:"cis_trade/test/userFetch",                 //抓取用户

    //======房间系统======
    createRoom:"cis_misc/room/create",                                // 创建房间 {name:房间名}
    applyJoinRoom:"cis_misc/room/applyJoinRoom",                      // 申请加入 {roomId: 房间ID}
    approveJoinRoom:"cis_misc/room/approveJoinRoom",                  // 批准加入 {roomId: 房间ID, userId: 用户ID}
    rejectJoinRoom:"cis_misc/room/rejectJoinRoom",                    // 拒绝加入 {roomId: 房间ID, userId: 用户ID}
    setAdminUsers:"cis_misc/room/setAdminUsers",                      // 设置管理员 {roomId: 房间ID, adminUsers: [用户ID1,用户ID2,...]}
    deleteUsers:"cis_misc/room/deleteUsers",                          // 删除用户 {roomId: 房间ID, deleteUsers: [用户ID1,用户ID2,...]}
    modifyName:"cis_misc/room/modifyName",                            // 修改房间名 {roomId: 房间ID, name: 房间名}
    modifyIntro:"cis_misc/room/modifyIntro",                          // 修改简介 {roomId: 房间ID, name: 简介}
    modifyInviteAuthority:"cis_misc/room/modifyInviteAuthority",      // 修改邀请权限 {roomId: 房间ID, inviteFlag: 是否只有房主可以邀请}
    modifyJoinAuthority:"cis_misc/room/modifyJoinAuthority",          // 修改加入权限 {roomId: 房间ID, authFlag: 加入房间是否需要验证}
    quitRoom:"cis_misc/room/quitRoom",                                // 退出房间 {roomId: 房间ID}
    dismissRoom:"cis_misc/room/dismissRoom",                          // 解散房间 {roomId: 房间ID}
    queryRoomList:"cis_misc/room/queryRoomList",                      // 查询房间列表
    queryJoinApplyList:"cis_misc/room/queryJoinApplyList",            // 查询申请列表
    queryRoomDetailInfo:"cis_misc/room/queryRoomDetailInfo",          // 查询房间相信信息 {roomId: 房间ID}
    searchRoom:"cis_misc/room/searchRoom",                            // 查询房间 {roomId: 房间ID}
    queryUnReadApplyResult:"cis_misc/room/queryUnReadApplyResult",    //查询未读的申请结果通知
    readApplyResult:"cis_misc/room/readApplyResult",                  //标记申请结果通知为已经读取
    queryRoomTradeInfo:"cis_misc/room/queryRoomTradeInfo " ,          //查询房间交易大厅信息
    enterRoom:"cis_misc/room/enterRoom ",                             //进入房间
    setTradeOption:"cis_misc/room/setTradeOption",                    //设置期权
    enterHall:"cis_misc/room/enterHall",                              //进入大厅
    share:"cis_misc/room/share",                                      //{roomId:房间ID} 获得分享的页面URL

    //=======账号服务=======
    acctLogin:"cis_acct/acct/login",
    acctVCode:"cis_acct/acct/vcode",
    acctHost:"cis_acct/acct/host"
};

// 根据邀请码获取服务器地址
var ServerAddr = {
    serverMap:undefined,

    getServerAddr:function(urlKeyOrCode) {
        //保险
        var host = GB.serverAddr;
        if(GB.isSplitLoginModel  && localUrl[urlKeyOrCode].startsWith("cis_acct")){
            host = ACCOUNT_ADDR;
        }
        host = host || ServerAddr.getServerByBuildVersion(buildVersion) || "test.aiweipan.com";
        return host;
    },

    getServerByBuildVersion:function(buildVersion){
        if(!ServerAddr.serverMap){
            var serverMap = ServerAddr.serverMap = {};
            serverMap[BUILDVERSION_DEVELOP] = "192.168.1.180";
            serverMap[BUILDVERSION_BETA] = "test.aiweipan.com";
            serverMap[BUILDVERSION_RELEASE] = this.getReleaseUrlbyAppName(appName);
            cc.log("init ServerAddr.serverMap::", JSON.stringify(ServerAddr.serverMap));
        }
        return ServerAddr.serverMap[buildVersion];
    },

    getReleaseUrlbyAppName: function (appname) {
        return appname + ".aiweipan.com";
    },

    /**
     * 找到对应key的value否则返回key
     * @param {string} key
     * @returns {*|String}
     */
    getUrl:function(key) {
        var host = ServerAddr.getServerAddr(key);
        //if (localUrl[key].startsWith("cis_user")) {
        //    host = "192.168.1.19:8060"
        //}
        //if (localUrl[key].startsWith("cis_misc")) {
        //    host = "192.168.1.34:8065"
        //}
        //if (localUrl[key].startsWith("cis_trade")) {
        //    host = "192.168.1.21:8090"
        //}
        if(buildVersion == BUILDVERSION_DEVELOP){
            var localCisUser = cc.sys.localStorage.getItem("cis_user");
            var localCisTrade = cc.sys.localStorage.getItem("cis_trade");
            var localCisMisc = cc.sys.localStorage.getItem("cis_misc");
            if(localCisUser && localUrl[key].startsWith("cis_user")){
                host = localCisUser;
                if(!localCisUser.indexOf(":")){
                    host = localCisUser + ":" + 8060;
                }
            }
            if(localCisTrade && localUrl[key].startsWith("cis_trade")){
                host = localCisTrade;
                if(!localCisTrade.indexOf(":")){
                    host = localCisTrade + ":" + 8090;
                }
            }
            if(localCisMisc && localUrl[key].startsWith("cis_misc")){
                host = localCisMisc;
                if(!localCisMisc.indexOf(":")){
                    host = localCisMisc + ":" + 8065;
                }
            }
        }
        var value = "http://" + host + "/" + localUrl[key];
        return value != undefined ? value : key;
    }
};

HttpRequest = function(urlKey, sendData, successCallBack, errorCallBack, isAutoToken, encryptType)
{
    var args =
    {
        "urlKey":urlKey,
        "sendData":sendData,
        "successCallBack":successCallBack,
        "errorCallBack":errorCallBack,
        "isAutoToken":isAutoToken,
        "encryptType":encryptType
    };

    //cc.log("args: ", JSON.stringify(args));
    HttpManager.sendRequest(args);
};


var CustomCryptico = {};
// RSA公钥加密
CustomCryptico.RSAEncrypt = function(plaintText){
    var modules = "00d0ab50b3bcd4bd44e3df493eef15baddef8fc0c5dfed5222882ee5108d75b66f7332695ab182231e9598a17e36148fccc2b3b7f231b906a8f95b355318f38019c7d2253d3eb80751836faa3ca12c4da1f66eade4999515e7723000464f4be061e6b0ae1c38abe2afc7278b17341590845945b95283a9839889a0cff6c5c7b1c5";
    var exponent="010001";
    var key = RSAUtils.getKeyPair(exponent, '', modules);
    cc.log("RSA加密前："+ plaintText);
    //cc.log("key："+ JSON.stringify(key));
    var encryptedBase64Str = RSAUtils.encryptedString(key, plaintText);

    return encryptedBase64Str;
}
// AES秘钥生成
CustomCryptico.generateAESKey = function(){
    var key = cs.NativeTool.generateAESKey();;
    cc.log("随机生成AESKey: "+ key);
    return key;
}

CustomCryptico.AESEncrypt = function(plaintText){
    if(HTTP_LOG_ENABLED) cc.log("加密前Str: "+ plaintText);
    var encryptedBase64Str = cs.NativeTool.AESEncryt(plaintText, DataPool.aesKey);
    return encryptedBase64Str;
}

CustomCryptico.AESDecrypt = function(encryptedBase64Str, aesKey){
    if(HTTP_LOG_ENABLED) cc.log("解密前Str: " + encryptedBase64Str);
    if(HTTP_LOG_ENABLED) cc.log("aesKey: " + aesKey);
    var decryptedStr = cs.NativeTool.AESDecryt(encryptedBase64Str, aesKey);
    if(HTTP_LOG_ENABLED) cc.log("解密后Str: " + decryptedStr); //
    return decryptedStr;
}

function reSetAccessToken ( acct ) { DataPool.accessToken = acct;
    cc.sys.localStorage.setItem("accessToken",acct);
    cc.log("刷新accessToken: " + acct);
}
function reSetAESKey ( key ) { DataPool.aesKey = key;
    cc.sys.localStorage.setItem("aesKey",key);
    cc.log("刷新AESKey: " + key);
}

/**
 * 交换秘钥
 */
function exchangeAesKey( _callBack, type )
{
    if(DataPool.aesKey == "" || DataPool.accessToken == ""){
        cc.log("交换秘钥");
        var aesKey = CustomCryptico.generateAESKey();
        var req = {
            auth: {ak: aesKey
            }
        }
        if(type) req.auth.type = type;
        var args = {
            "urlKey":"keyExchange",
            "sendData":req,
            "successCallBack":function(data){
                reSetAccessToken(data.at);
                reSetAESKey(data.ak);

                _callBack();
            },
            "isAutoToken":false,
            "encryptType":"RSA",
            "tryCount": 3,
            "showTips": true
        };
        HttpManager.sendRequest(args);
    }
    else{
        _callBack();
    }

}

/**
 * 公共的 多余三个参数的 建议以 args拼装放进来
 * @param argsOrUrlKey
 * @param {Object} [sendData]
 * @param [Function] [successCallBack]
 var urlKey = args["urlKey"];
 var sendData = args["sendData"];
 var successCallBack = args["successCallBack"];
 var errorCallBack = args["errorCallBack"];
 var autoToken = args["autoToken"];
 var encryptType = args["encryptType"];
 var timeout = args["timeout"];
 var timeoutCallBack = args["timeoutCallBack"];
 */
HttpManager.sendRequest = function(argsOrUrlKey, sendData, successCallBack, tryCount, showTips) {
    var request = new HttpXRequest();

    if(typeof argsOrUrlKey != "string"){
        request.setArgs(argsOrUrlKey);
    }else{
        var args =
        {
            "urlKey":argsOrUrlKey,
            "sendData":sendData,
            "successCallBack":successCallBack,
            "tryCount":tryCount,
            "showTips": showTips
        };
        request.setArgs(args);
    }

    request.send();
};

// Token刷新
function refreshToken(callBack)
{
    var timeStamp = cs._genCurSecs();
    var lastTimeStamp =  DataPool.doRefreshTokenTime || 0;
    cc.log("refreshToken", "begin", timeStamp, DataPool.doRefreshToken, DataPool.doRefreshTokenTime);
    if(DataPool.doRefreshToken && (timeStamp - lastTimeStamp) < 12)
    {
        if(callBack) {
            callBack();
        }
        cc.log("refreshToken", "return", timeStamp, DataPool.doRefreshToken, DataPool.doRefreshTokenTime);
        return;
    }

    cc.log("refreshToken", "request", timeStamp, DataPool.doRefreshToken, DataPool.doRefreshTokenTime);
    DataPool.doRefreshTokenTime = timeStamp;
    DataPool.doRefreshToken = true;

    var idFlag = Player.getInstance().getIdFlag();
    G_collectLog("刷新token, idflag: " + idFlag);
    var req = {
        auth: { idflag:idFlag }
    };
    var successCallBack = function(data){
        DataPool.doRefreshToken = undefined;
        DataPool.doRefreshTokenTime = undefined;

        G_collectLog("进入刷新token成功回调函数，新的token值：" + data.at);
        G_collectLog("旧的token值：" +  DataPool.accessToken);

        reSetAccessToken(data.at);
        if(callBack)
            callBack();
    };
    var args =
    {
        "urlKey":"refreshToken",
        "sendData":req,
        "successCallBack":successCallBack,
        "isAutoToken":false,
        "encryptType":"RSA",
        "timeout":"5",
        "tryCount":2
    };
    //cc.log("args: ", JSON.stringify(args));
    HttpManager.sendRequest(args);
}

var MaxCollectNum = 100;
function G_collectLog(content, tag)
{
    var timeStr = TimeHelper.formatSecs(cs.getCurSecs());
    var str = timeStr + "  "+ (tag || "") + "  "+ content;

    cc.log(str);

    DataPool.logArr.unshift(str);
    //缓冲下 每超过50条删一次
    if(DataPool.logArr.length > (MaxCollectNum+50))
    {
        DataPool.logArr.splice(0, 50);
    }
}

/**
 * new Request，than you can customize the request
 * @param argsOrUrlKey
 * @param sendData
 * @param successCallBack
 * @returns {HttpXRequest}
 */
HttpManager.createRequest = function(argsOrUrlKey, sendData, successCallBack) {
    var request = new HttpXRequest();

    if(typeof argsOrUrlKey != "string"){
        request.setArgs(argsOrUrlKey);
    }else{
        var args =
        {
            "urlKey":argsOrUrlKey,
            "sendData":sendData,
            "successCallBack":successCallBack
        };
        request.setArgs(args);
    }
    return request;
};

/**
 * example...
 * @param arg1 参数1--注释
 * @param arg2 参数2--注释
 * @param arg3 ......
 */
HttpManager.requestXXXXXX = function(arg1, arg2, arg3){
    //参数对象 在里面组装
    //.............
    //.............
};

/**
 * 抓一个新的用户
 * @param successCallBack
 * @param productId
 */
HttpManager.requestFetchNewUser = function(successCallBack, productId, idFlag)
{
    var requestData = {
        "auth":{
            "pid":productId,            //产品id
            "fetchCount":1,             //抓几个 效果与 idFlag互斥
            "fetchNew":1,               //1表示要抓新的用户 0抓老的
            "idFlag":idFlag             //抓取指定的用户
        }
    };
    var urlKey = "tradeFetchUser";
    cc.log("尝试抓取新的.....");
    HttpManager.sendRequest(urlKey, requestData, successCallBack);
};

/**
 * 交易大厅左侧人物 抓
 * @param callBack
 * @param pid
 * @param fetchCount 抓多少个
 * @param fetchNew 1表示抓新的 0 表示抓旧的
 * @param idFlag
 */
HttpManager.requestFetchUser = function(successCallBack, productId, fetchCount, idFlag) {
    var fetchNew = 1;
    if(idFlag || fetchCount > 1) {
        fetchNew = 0;
    }
    var requestData = {
        "auth":{
            "pid":productId,            //产品id
            "fetchCount":fetchCount,    //抓几个 效果与 idFlag互斥
            "fetchNew":fetchNew,        //1表示要抓新的用户 0抓老的
            "idFlag":idFlag
        }
    };
    var urlKey = "tradeFetchUser";
    HttpManager.sendRequest(urlKey, requestData, successCallBack);
};

/**
 *
 * @param successCallBack
 * @param idFlags
 */
HttpManager.requestUpdateFetchUser = function(successCallBack, productId, idFlags) {
    var requestData = {
        "auth":{
            "pid":productId,
            "idFlags":idFlags             //抓取指定的用户
        }
    };
    var urlKey = "tradeUpdateFetchUser";
    HttpManager.sendRequest(urlKey, requestData, successCallBack);
};

/**
 * 请求产品配置
 * @param successCallBack
 * @param productId
 * @param idFlags
 */
HttpManager.requestProductList = function(successCallBack) {
    var urlKey = "tradeProductList";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, {}, successCallBack, tryCount);
};

/**
 * 请求行情历史
 * @param successCallBack
 * @param productId
 * @param startTime       起始
 * @param endTime         ....
 * @param timeoutCallBack         ....
 */
HttpManager.requestQuoteHistory = function(successCallBack, productId, startTime, endTime, stride, dots,timeoutCallBack) {

    var request = new HttpXRequest();
    var sendData = {
        "auth":{
            "pid":productId,
            "btime":startTime,
            "etime":endTime,
            "stride":stride,
            "dots":dots
        }
    };
    var urlKey = "tradeMarketHistory";
    var tryCount = 3;
    request.setUrlKey(urlKey);
    request.setTryCount(tryCount);
    request.setSendData(sendData);
    request.setSuccessCallBack(successCallBack);
    request.setTimeout(6);
    request.setOnTimeoutCallBack(timeoutCallBack);
    request.send();
};

/**
 * k线的历史
 */
HttpManager.requestQuoteKHistory = function(successCallBack, productId, ktype, startTime, endTime, timeoutCallBack) {

    var request = new HttpXRequest();
    var sendData = {
        "auth":{
            "pid":productId,
            "btime":startTime,
            "etime":endTime,
            "ktype":ktype
        }
    };
    var urlKey = "tradeKHistory";
    var tryCount = 3;
    request.setUrlKey(urlKey);
    request.setTryCount(tryCount);
    request.setSendData(sendData);
    request.setSuccessCallBack(successCallBack);
    request.setTimeout(6);
    request.setOnTimeoutCallBack(timeoutCallBack);
    request.send();
};

HttpManager.requestLatestKline = function(successCallBack, productId, ktype)
{

    var request = new HttpXRequest();
    var sendData = {
        "auth":{
            "pid":productId,
            //"btime":startTime,
            //"etime":endTime,
            "ktype":ktype
        }
    };
    var urlKey = "tradeCurKline";
    var tryCount = 3;
    request.setUrlKey(urlKey);
    request.setTryCount(tryCount);
    request.setSendData(sendData);
    request.setSuccessCallBack(successCallBack);
    request.setTimeout(6);
    request.send();
};

/**
 * 请求下单
 * @param successCallBack
 * @param isSimulateTrade   是模拟交易还是正式交易
 * @param productId         ....
 * @param time              下单时间
 * @param amount            下单金额
 * @param direction         下单方向(买涨/买跌)
 * @param price             下单时的行情价
 * @param duration          下单时选择的结算间隔
 */
HttpManager.requestDoBet = function (successCallBack, isSimulateTrade, productId, time, amount, direction, price, tradeCount, feeRate, touchOffset, duration)
{
    //请求下单
    var requestData = {
        "auth": {
            "pid": productId,
            "time": time,
            "amount": amount,
            "direction": direction,
            "cprice": price,
            "tradeCount":tradeCount,
            "feeRate":feeRate,
            "touchOffset":touchOffset,
            "duration":duration
        }
    };

    var urlKey = "tradeOrder";
    if (isSimulateTrade)
        urlKey = "tradeTestOrder";
    HttpManager.sendRequest(urlKey, requestData, successCallBack);
};

/**
 * 请求当天内,(最近)订单
 * @param successCallBack
 * @param isSimulateTrade
 * @param pageSize          最近多少单
 */
HttpManager.requestCurDayRecord = function (successCallBack, isSimulateTrade, pageSize) {
    var requestData =
    {
        "pageId":0,     //默认查询从第0个开始, 第0个表示是最近的
        "pageSize":pageSize
    };
    var urlKey = "tradeCurrentDayRecord";
    if(isSimulateTrade)
        urlKey = "tradeTestCurrentDayRecord";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};


/**
 * 查询订单结果
 * @param successCallBack
 * @param isSimulateTrade
 * @param {*|Array | String | (BetArray|orderIds)}   betArrayOrStr
 */
HttpManager.requestQueryOrder = function (successCallBack, isSimulateTrade, betArrayOrStr) {
    var orderIds = betArrayOrStr;
    if(cc.isArray(betArrayOrStr)){
        orderIds = "";
        for(var i = 0; i < betArrayOrStr.length; i++){
            var betInfo = betArrayOrStr[i];
            if(i == 0)
                orderIds += betInfo.getOrderId();
            else
                orderIds += "," + betInfo.getOrderId();
        }
    }

    var requestData = {
        "auth":{
            "orderIds":orderIds
        }
    };
    var urlKey = "tradeQuery";
    if(isSimulateTrade)
        urlKey = "tradeTestQuery";
    HttpManager.sendRequest(urlKey, requestData, successCallBack);
};

/**
 * 查询持仓数
 * @constructor
 */
HttpManager.requestPositionNum = function()
{
    var requestData = {};
    var urlKey = "tradePosition";
    var successCallBack = function(jsonData){
        var positionCount = jsonData["positionCount"];
        Player.getInstance().setPositionCount(positionCount || 0);
        cc.eventManager.dispatchCustomEvent(NOTIFY_POSITION_CHANGES);
    };
    HttpManager.sendRequest(urlKey, requestData, successCallBack);
};

HttpManager.requestFundDetail = function(successCallBack, fundsTime,  fundsType, fundsPage){
    var requestData = {
        auth:{
            fundsTime: fundsTime,
            fundsType: fundsType,
            pageNumber: fundsPage
        }
    };
    var urlKey = "fundsDetail";
    //待服务器部署
    HttpManager.sendRequest(urlKey, requestData, successCallBack);
};

HttpManager.requestFundsConfig = function(successCallBack){

    var urlKey = "fundsConfig";

    //待服务器部署
    HttpManager.sendRequest(urlKey, {}, successCallBack);
};

/**
 * 检查是否绑定了邀请码
 * @param successCallBack
 * @param openId 第三方登录
 * @param phone 手机登录
 */
HttpManager.requestCheckBinding = function(successCallBack, openId, phone){
    var requestData = {
        auth:{
            openId: openId,
            phone: phone
        }
    };
    var urlKey = "checkBinding";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};

/**
 * 查询用户详情
 * @constructor
 */
HttpManager.requestUserDetail = function(successCallBack, uid, errorCallBack, timeoutCallBack)
{
    var request = new HttpXRequest();
    var args =
    {
        "urlKey":"userOthersDetail",
        "sendData":{
            auth:
            {
                uid:uid
            }
        },
        "successCallBack":successCallBack
    };
    request.setArgs(args);
    request.setTimeout(10);
    request.setErrorCallBack(errorCallBack);
    request.setOnTimeoutCallBack(errorCallBack);
    request.setOnTimeoutCallBack(timeoutCallBack);
    request.send();
};

HttpManager.requestQueryRoomList = function(successCallBack){
    var requestData = {};
    var urlKey = "queryRoomList";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};

HttpManager.requestQueryJoinApplyList = function(successCallBack){
    var requestData = {};
    var urlKey = "queryJoinApplyList";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};

HttpManager.requestQueryRoomDetailInfo = function(successCallBack,roomId){
    var requestData = {
        auth:{
            roomId: roomId
        }
    };
    var urlKey = "queryRoomDetailInfo";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};

HttpManager.requestDismissRoom = function(successCallBack,roomId){
    var requestData = {
        auth:{
            roomId: roomId
        }
    };
    var urlKey = "dismissRoom";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};

HttpManager.requestQuitRoom = function(successCallBack,roomId){
    var requestData = {
        auth:{
            roomId: roomId
        }
    };
    var urlKey = "quitRoom";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};

HttpManager.requestModifyJoinAuthority = function(successCallBack,roomId,authFlag){
    var requestData = {
        auth:{
            roomId: roomId,
            authFlag:authFlag
        }
    };
    var urlKey = "modifyJoinAuthority";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};

HttpManager.requestModifyInviteAuthority = function(successCallBack,roomId,inviteFlag){
    var requestData = {
        auth:{
            roomId: roomId,
            inviteFlag:inviteFlag
        }
    };
    var urlKey = "modifyInviteAuthority";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};

HttpManager.requestModifyIntro = function(successCallBack,roomId,intro){
    var requestData = {
        auth:{
            roomId: roomId,
            intro:intro
        }
    };
    var urlKey = "modifyIntro";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};

HttpManager.requestModifyName = function(successCallBack,roomId,name){
    var requestData = {
        auth:{
            roomId: roomId,
            name:name
        }
    };
    var urlKey = "modifyName";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};

HttpManager.requestDeleteUsers = function(successCallBack,roomId,deleteUsers){
    var requestData = {
        auth:{
            roomId: roomId,
            deleteUsers:deleteUsers
        }
    };
    var urlKey = "deleteUsers";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};

/**
 * 请求红点列表
 * @param successCallBack
 */
HttpManager.requestRedDotList = function(successCallBack){
    var requestData = {
    };
    var urlKey = "redDotList";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};

HttpManager.requestSetAdminUsers = function(successCallBack,roomId,adminUsers){
    var requestData = {
        auth:{
            roomId: roomId,
            adminUsers:adminUsers
        }
    };
    var urlKey = "setAdminUsers";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};

HttpManager.requestRejectJoinRoom = function(successCallBack,roomId,userId){
    var requestData = {
        auth:{
            roomId: roomId,
            userId:userId
        }
    };
    var urlKey = "rejectJoinRoom";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};

HttpManager.requestApproveJoinRoom = function(successCallBack,roomId,userId){
    var requestData = {
        auth:{
            roomId: roomId,
            userId:userId
        }
    };
    var urlKey = "approveJoinRoom";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};

HttpManager.requestApplyJoinRoom = function(successCallBack,roomId){
    var requestData = {
        auth:{
            roomId: roomId
        }
    };
    var urlKey = "applyJoinRoom";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};

HttpManager.requestCreateRoom = function(successCallBack,name){
    var requestData = {
        auth:{
            name: name
        }
    };
    var urlKey = "createRoom";
    HttpManager.sendRequest(urlKey, requestData, successCallBack);
};

HttpManager.requestSearchRoom = function(successCallBack,name) {
    var requestData = {
        auth: {
            name: name
        }
    };
    var urlKey = "searchRoom";
    HttpManager.sendRequest(urlKey, requestData, successCallBack);
};

HttpManager.requestQueryUnReadApplyResult  = function(successCallBack){
    var requestData = {
    };
    var urlKey = "queryUnReadApplyResult";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};

HttpManager.requestReadApplyResult  = function(successCallBack,roomId){
    var requestData = {
        auth: {
           roomId: roomId
        }
    };
    var urlKey = "readApplyResult";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};

HttpManager.requestQueryRoomTradeInfo  = function(successCallBack, tradeOptionId){
    var requestData = {
        auth: {
            tradeOptionId: tradeOptionId
        }
    };
    var urlKey = "queryRoomTradeInfo";
    HttpManager.sendRequest(urlKey, requestData, successCallBack);
};

HttpManager.requestEnterRoom  = function(successCallBack,roomId){
    var requestData = {
        auth: {
            roomId: roomId
        }
    };
    var urlKey = "enterRoom";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};

HttpManager.requestSetTradeOption  = function(successCallBack, tradeOptionId){
    var requestData = {
        auth: {
            tradeOptionId: tradeOptionId
        }
    };
    var urlKey = "setTradeOption";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};

HttpManager.requestEnterHall  = function(successCallBack){
    var requestData = {
    };
    var urlKey = "enterHall";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};

HttpManager.requestRoomShare  = function(successCallBack, roomId){
    var requestData = {
        auth: {
            roomId: roomId
        }
    };
    var urlKey = "share";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};

/**
 * 清除红点
 * @param successCallBack
 */
HttpManager.requestClearRedDot  = function(successCallBack, type){
    var requestData = {
        auth:{
            type:type
        }
    };
    var urlKey = "clearRedDot";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};

//请求一次所有未结算的订单
HttpManager.requestAllUnSettledOrders = function(isSimulateTrade) {
    var curSecs = cs.getCurSecs();
    //只对正式单设CD,模拟交易后续会慢慢废弃
    if(!isSimulateTrade || isSimulateTrade == undefined){
        if(this._lastQueryUnSettledTime > 0 && (curSecs - this._lastQueryUnSettledTime) < 60){
            cc.log("批量查询未结算订单 CD中 ....CD:: ", (curSecs - this._lastQueryUnSettledTime));
            return;
        }
        this._lastQueryUnSettledTime = curSecs;
    }
    var unSettledOrders = [];
    var betArray = Player.getInstance().getCurDayBetArray();
    if(isSimulateTrade){
        betArray = Player.getInstance().getCurDaySmBetArray();
    }

    //map 方便返回时查询
    var cusSecs = cs.getCurSecs();
    var unSettledMap = {};
    for(var i = 0; i < betArray.length; i++){
        var betInfo = betArray[i];
        if(!betInfo.isSettled()){
            var tradeSettleTime = betInfo.getTradeSettleTime();
            //未到结算时间
            if(tradeSettleTime > 0 && (cusSecs < tradeSettleTime)){
                continue;
            }
            unSettledOrders.push(betInfo);
            unSettledMap[betInfo.getOrderId()] = betInfo;
        }
    }

    if(unSettledOrders.length == 0)
        return;

    var successCallBack = function(jsonData){
        var countList = jsonData["countList"];
        for(var i = 0; i < countList.length; i++){
            var betData = countList[i];
            var orderId = betData["orderId"];
            var betInfo = unSettledMap[orderId];
            if(betInfo){
                betInfo.initFromJson(betData);
                //通知结算
                if(betInfo.isSettled())
                    cc.eventManager.dispatchCustomEvent(NOTIFY_ORDER_COUNT, betInfo);
            }
        }
    };

    cc.log("查询所有未结算订单：", isSimulateTrade);
    HttpManager.requestQueryOrder(successCallBack, isSimulateTrade, unSettledOrders);
};

/**
 * 同步时间
 * @param successCallBack
 */
HttpManager.requestClientTime  = function(){
    var requestData = {};
    var urlKey = "clientTime";
    var successCallBack = function(data){
        var serverTime = data["time"];
        MainController.getInstance()._fixedTime = serverTime - new Date().getTime();
        //立即生成一次时间戳
        cs._genCurSecs();
    };

    MainController.getInstance().setLastFixTime(cs._genCurSecs());
    HttpManager.sendRequest(urlKey, requestData, successCallBack);
};

/**
 * 登录
 */
HttpManager.requestUserSignIn = function(){
    var requestData = {};
    var urlKey = "userSignIn";
    var successCallBack = function()
    {
        Player.getInstance().setOnline(true);
        cc.eventManager.dispatchCustomEvent(NOTIFY_REFRESH_LOGIN_STATE);
    };
    HttpManager.sendRequest(urlKey, requestData, successCallBack);
};

/**
 * 账号服务
 */
HttpManager.requestAccountLogin = function(successCallBack, openId, phone, vcode){
    var request = new HttpXRequest();
    var sendData = {
        "openId":openId || "",
        "phone":phone  || "",
        "product":appName,
        "vcode":vcode
    };
    var urlKey = "acctLogin";
    var tryCount = 3;
    request.setUrlKey(urlKey);
    request.setTryCount(tryCount);
    request.setSendData(sendData);
    request.setAutoToken(false);
    request.setSuccessCallBack(successCallBack);
    request.setTimeout(6);
    //request.setOnTimeoutCallBack(timeoutCallBack);
    request.send();
};

/**
 *  请求手机验证码（账号服务器）
 * @param successCallBack
 * @param openId
 * @param phone
 */
HttpManager.requestPhoneVerifyCode = function(successCallBack, errorCallBack, phone){
    var request = new HttpXRequest();
    var sendData = {
        "phone":phone,
        "product":appName
    };
    var urlKey = "acctVCode";
    request.setUrlKey(urlKey);
    request.setSendData(sendData);
    request.setAutoToken(false);
    request.setSuccessCallBack(successCallBack);
    request.setTimeout(6);
    request.setErrorCallBack(errorCallBack);
    request.send();
};

/**
 * 请求手机验证码
 * @param successCallBack
 * @param errorCallBack
 * @param phone
 */
HttpManager.requestGetCode = function(successCallBack, errorCallBack, phone){
    var request = new HttpXRequest();
    var sendData = {
        auth:{
            "phone":phone,
            "agentId":DeviceInfoManager.getInstance().getChannel()
        }
    };

    var urlKey = "getCode";
    request.setUrlKey(urlKey);
    request.setSendData(sendData);
    request.setAutoToken(false);
    request.setEncryptType("RSA");
    request.setSuccessCallBack(successCallBack);
    request.setTimeout(6);
    request.setErrorCallBack(errorCallBack);
    request.setShowTips(true);
    request.send();
};

/**
 * 版本号
 */
HttpManager.requestClientVersion = function(successCallBack, onErrorCallBack, onTimeoutCallBack)
{
    var request = new HttpXRequest();
    var sendData = {
        "version": DeviceInfoManager.getInstance().getVersionCode(),
        "agentId": DeviceInfoManager.getInstance().getChannel(),
        "platform": cc.sys.os
    };
    request.setUrlKey("clientVersion");
    request.setSendData(sendData);
    request.setSuccessCallBack(successCallBack);
    request.setOnErrorCallBack(onErrorCallBack);
    request.setOnTimeoutCallBack(onTimeoutCallBack);
    request.setAutoToken(false);
    request.setTryCount(3);
    request.send();
};

/**
 * 查询验证邀请码
 * @constructor
 */
HttpManager.requestCheckVcode = function(successCallBack, phone, code)
{
    var request = new HttpXRequest();
    var sendData = {
        "phone":phone,
        "code":code
    };
    request.setUrlKey("checkVcode");
    request.setSendData(sendData);
    request.setAutoToken(false);
    request.setTimeout(10);
    request.setSuccessCallBack(successCallBack);
    //request.setErrorCallBack(errorCallBack);
    //request.setOnTimeoutCallBack(timeoutCallBack);
    request.send();
};



/**
 * 查询验证邀请码
 * @constructor
 */
HttpManager.requestInvitedCode = function(successCallBack, errorCallBack, timeoutCallBack, invitedCode)
{
    var request = new HttpXRequest();
    var sendData = {
        "invitedCode":invitedCode,
        "appName":appName
    };
    request.setUrlKey("checkInvitedCode");
    request.setSendData(sendData);
    request.setAutoToken(false);
    request.setTimeout(10);
    request.setSuccessCallBack(successCallBack);
    request.setErrorCallBack(errorCallBack);
    request.setOnTimeoutCallBack(timeoutCallBack);
    request.send();
};


/**
 * 邀请码获取主机地址
 */
HttpManager.requestAcctHost = function(successCallBack, errorCallBack, onTimeoutCallBack, invitationCode){
    var request = new HttpXRequest();
    var sendData = {
        "code":invitationCode,
        "product":appName,
        "phone":DataPool.phone,
        "openId":DataPool.openId
    };
    request.setUrlKey("acctHost");
    request.setTryCount(3);
    request.setSendData(sendData);
    request.setAutoToken(false);
    request.setSuccessCallBack(successCallBack);
    request.setOnTimeoutCallBack(onTimeoutCallBack);
    request.setErrorCallBack(errorCallBack);
    request.setTimeout(6);
    request.send();
};

/**
 * 密钥交换
 */
HttpManager.requestKeyExchange = function(successCallBack, onErrorCallBack, onTimeoutCallBack, AESKey, type)
{
    var request = new HttpXRequest();
    var sendData = {
        auth: {
            "ak": AESKey,
            "type":type
        }
    };
    request.setUrlKey("keyExchange");
    request.setSendData(sendData);
    request.setSuccessCallBack(successCallBack);
    request.setOnErrorCallBack(onErrorCallBack);
    request.setOnTimeoutCallBack(onTimeoutCallBack);
    request.setAutoToken(false);
    request.setEncryptType("RSA");
    request.setTryCount(3);
    request.send();
};

/**
 * 唯一id登录
 */
HttpManager.requestLoginByUid = function(successCallBack, onErrorCallBack, onTimeoutCallBack, uid)
{
    var request = new HttpXRequest();
    var sendData = {
        auth: {
            "showId": uid
        }
    };
    request.setUrlKey("userLogin");
    request.setSendData(sendData);
    request.setSuccessCallBack(successCallBack);
    request.setOnErrorCallBack(onErrorCallBack);
    request.setOnTimeoutCallBack(onTimeoutCallBack);
    request.setTryCount(3);
    request.send();
};

/**
 * 请求远端存储配置
 * @param successCallBack
 */
HttpManager.requestLoadUserConfig = function(successCallBack){
    var requestData = {
        auth:{
            "key":"clientDefaultConfig"
        }
    };
    var urlKey = "loadUserConfig";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};

/**
 * 保存配置到远程
 * @param successCallBack
 * @param userConfigJsonStr
 */
HttpManager.requestSaveUserConfig = function(successCallBack, remoteStorageJson){
    var requestData = {
        auth:{
            "key":"clientDefaultConfig",
            "value":remoteStorageJson
        }
    };
    var urlKey = "saveUserConfig";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};

/**
 * 身份证正反面
 * @param successCallBack
 */
HttpManager.requestLoadIdCardUrl = function(successCallBack){
    var requestData = {
        auth:{
            "key":"idCardUrl"
        }
    };
    var urlKey = "loadUserConfig";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};

/**
 * 保存身份证正反面
 * @param successCallBack
 */
HttpManager.requestSaveIdCardUrl = function(successCallBack, idCardUrl){
    var requestData = {
        auth:{
            "key":"idCardUrl",
            "value":idCardUrl
        }
    };
    var urlKey = "saveUserConfig";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};


/**
 * 保存用户姓名
 * @param successCallBack
 * @param realName
 * @param phone
 */
HttpManager.requestSaveRealName = function(successCallBack, realName, phone){
    var requestData = {
        auth:{
            "realName":realName,
            "phone":phone
        }
    };
    var urlKey = "saveRealName";
    var tryCount = 3;
    HttpManager.sendRequest(urlKey, requestData, successCallBack, tryCount);
};