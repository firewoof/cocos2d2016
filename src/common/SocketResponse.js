
/**
 * Created by Administrator on 14-11-12.
 */

var RESPONSE_LOGIN = "AUTH";
var RESPONSE_HEARTBEAT = "HEARTBEAT";
var RESPONSE_QUOTE = "MARKET_TOPIC";
var RESPONSE_PRODUCT = "TRADE_PRODUCT"; //交易品更新
var RESPONSE_DIRECTION_RATIO = "DIRECTION_RATIO";           //看涨看跌人数
var RESPONSE_ORDER_COUNT = "ORDER_COUNT";                   //交易单结算
var RESPONSE_TEST_ORDER_COUNT = "TEST_ORDER_COUNT";         //模拟单结算
var RESPONSE_FUND = "FUND";
var RESPONSE_USER_ORDER = "FETCH_USER_ORDER";               //用户最新下单
var RESPONSE_NOTICE = "NOTICE";
var RESPONSE_ONLINE_NUM = "ONLINE";                         //在线人数更新
var RESPONSE_ACTION_MAIL_UNREAD = "NEW_MAIL";               //新邮件
var RESPONSE_POSITION_COUNT = "POSITION_COUNT";             //持仓数
var RESPONSE_TEST_POSITION_COUNT = "TEST_POSITION_COUNT";
var RESPONSE_FEEDBACK_NOTIFY = "FEEDBACK_NOTIFY";
var RESPONSE_REDDOT_NOTIFY = "REDDOT_NOTIFY";               //红点
var RESPONSE_ROOM_NEW_JOIN_APPLY = "ROOM_NEW_JOIN_APPLY";            //新的房间邀请信息
var RESPONSE_ROOM_DEL_JOIN_APPLY = "ROOM_DEL_JOIN_APPLY";            //房间邀请信息删除
var RESPONSE_ROOM_JOIN_APPLY_RESULT = "ROOM_JOIN_APPLY_RESULT";      //推送申请结果给申请者
var RESPONSE_ROOM_ID_LIST = "ROOM_ID_LIST";
var RESPONSE_ROOM_DEL_MEMBER  = "ROOM_DEL_MEMBER";
var RESPONSE_ROOM_NEW_MEMBER  = "ROOM_NEW_MEMBER";
var RESPONSE_ROOM_NAME_CHANGE = "ROOM_NAME_CHANGE";
var RESPONSE_ROOM_TRADE_ORDER = "ROOM_TRADE_ORDER";

/**
 * SocketResponse
 */
var SocketResponse = SocketResponse || { handlers:{} };

/**
 * @type {string}
 * @data {json string}
 */
SocketResponse.dispatchEvent = function(type, data) {
    var handler = SocketResponse.handlers[type];
    if (handler) {
        handler(data, type);
    }
};

/**
 * 认证成功
 * @param data
 * @param type
 */
SocketResponse.handlers[RESPONSE_LOGIN] = function(data, type) {
    cc.log("认证成功::", JSON.stringify(data));
    cc.log("替换加密key::", DataPool.aesKey);
    //更新密钥
    SocketManager.getInstance().afterLoginSuccess();

    //恢复场景数据
    MainController.getInstance().recoverSceneData();

    cc.eventManager.dispatchCustomEvent(NOTIFY_TCP_AUTH_SUCCESS);
};

/**
 * 心跳
 * @param data
 * @param type
 */
SocketResponse.handlers[RESPONSE_HEARTBEAT] = function(data, type) {
    cc.log("RESPONSE_HEARTBEAT");
    //SocketRequest.heartBeat();
};

/**
 * 抓取用户的下单情况
 * @param data
 * @param type
 */
SocketResponse.handlers[RESPONSE_USER_ORDER] = function(data, type) {
    cc.log("订单更新::", JSON.stringify(data));
    var productId = data["pid"];
    var userId = data["userId"];
    var productInfo = Player.getInstance().getProductById(productId);
    if(productInfo){
        var newBetInfo = new BetInfo(data);
        var fetchPlayers = productInfo.getFetchPlayers();
        for(var i = 0; i < fetchPlayers.length; i++)
        {
            var tempPlayer = fetchPlayers[i];
            if(tempPlayer && tempPlayer.getId() == userId){
                tempPlayer.appendOrder(newBetInfo);
                cc.eventManager.dispatchCustomEvent(NOTIFY_FETCH_NEW_ORDER, {"betPlayer":tempPlayer, "newBetInfo":newBetInfo});
                break;
            }
        }
    }
};

/**
 * 货币变化
 * @param data
 * @param type
 */
SocketResponse.handlers[RESPONSE_FUND] = function(data, type) {
    cc.log("资金变化::", JSON.stringify(data));
    var newBalance = data["balance"];
    var newTestCoin = data["testCoin"];
    var balance = Player.getInstance().getBalance();
    var testCoin = Player.getInstance().getTestCoin();

    if(newBalance != undefined && newBalance != balance) {
        Player.getInstance().setBalance(newBalance);
        cc.eventManager.dispatchCustomEvent(NOTIFY_REFRESH_USER_BALANCE);
    }

    if(newTestCoin != undefined && newTestCoin != testCoin) {
        Player.getInstance().setTestCoin(newTestCoin);
        cc.eventManager.dispatchCustomEvent(NOTIFY_REFRESH_USER_TEST_COIN);
    }
};

/**
 * 公告
 * @param data
 * @param type
 */
SocketResponse.handlers[RESPONSE_NOTICE] = function(data) {
    //cc.log("公告::",JSON.stringify(data));
    if(isEducationVersion) return;
    var message = data["message"];
    //公告文本太长方案 拆分n行
    var splitLen = 50;//50/2个汉字
    var charLen = message == undefined ? 0 : message.getCharLen();
    //cc.log("charLen::", charLen);
    if(charLen > splitLen){
        var splitNum = Math.ceil(charLen/splitLen);
        var strLenCounter = 0;
        for(var i = 0; i < splitNum; i++) {
            var copyData = ALCommon.deepClone(data);
            var subObj = copyData.message.subStrCH(strLenCounter, splitLen);
            //cc.log("subObj::", JSON.stringify(subObj));
            copyData.message = subObj.str;
            var noticeInfo = new NoticeInfo(copyData);
            cc.eventManager.dispatchCustomEvent(NOTIFY_NOTICE, noticeInfo);
            strLenCounter = subObj.end;
        }
    }else{
        var noticeInfo = new NoticeInfo(data);
        cc.eventManager.dispatchCustomEvent(NOTIFY_NOTICE, noticeInfo);
    }
};

/**
 * 在线人数
 * @param data
 */
SocketResponse.handlers[RESPONSE_ONLINE_NUM] = function(data) {
    //cc.log(TimeHelper.formatSecs() + "  在线人数::",JSON.stringify(data));
    var onlineNum = data["online"];
    //var elapse = data["elapse"];
    //if(!elapse || !onlineNum)
    //    return;
    var elapse = 10;
    cc.eventManager.dispatchCustomEvent(NOTIFY_ONLINE_NUM_UPDATE, {"onlineNum": onlineNum, "elapse": elapse});
};

/**
 * 看涨看跌人数变化
 * @param data
 * @param type
 */
SocketResponse.handlers[RESPONSE_DIRECTION_RATIO] = function(data, type) {
    //cc.log("RESPONSE_DIRECTION_RATIO::",JSON.stringify(data));
    var down = data["down"];
    var up = data["up"];
    var productId = data["pid"];
    var risePercent = (down == up) ? 50 : (up / (down + up) * 100);
    cc.eventManager.dispatchCustomEvent(NOTIFY_RISE_FALL_PERCENT, {"risePercent":risePercent, "productId":productId});
};


/**
 * 行情更新
 * @param data
 * @param type
 */
SocketResponse.handlers[RESPONSE_QUOTE] = function(data, type) {
   // cc.log(JSON.stringify(data));
    var productId = data["pid"];
    var quoteDataList = data["pl"];
    if(!quoteDataList)
        return;
    var cusSecs = cs.getCurSecs();
    //小于当前时间一分钟的行情 一律丢弃
    if(quoteDataList[0]["t"] < (cusSecs - 60))
    {
        if(isTestServer){
            var logStr = "推送行情过于落后::"+ TimeHelper.formatSecs(quoteDataList[0]["t"]);
            MainController.showAutoDisappearAlertByText(logStr);
        }
        return;
    }

    //支持多个行情的订阅
    for(var i = 0; i < quoteDataList.length; i++){
        var quoteData = quoteDataList[i];
        if(!quoteData)
            continue;

        //获取指定行情的数据队列
        var lineData = Player.getInstance().getLineDataById(productId);
        //产品数据可能还没有
        if(!lineData)
            continue;

        //数据队列可能有缺失的数据，先填充假数据(至多补n秒)
        var latestData = lineData.getLatestData();
        var diff = quoteData["t"] - latestData.getXValue();
        if(diff > 0 && diff < GB.QuoteFragmentNum * 60){
            if(diff > 1){
                var maxLen = Math.min(diff, GB.QuoteFragmentNum * 60  - 1);    //暂定最多填充GB.QuoteFragmentNum个片段
                cc.log("行情订阅 检测队列末端缺失，暂补假数据 num::", maxLen);
                for(var i = 0; i < maxLen; i++)
                {
                    var tempSamplePoint = new SamplePointData(ALCommon.deepClone(quoteData));
                    tempSamplePoint.setReal(false);
                    tempSamplePoint.setXValue(quoteData["t"] - i - 1);
                    lineData.pushData(tempSamplePoint);
                }
                var paddingScope = {startSecs:quoteData["t"] - maxLen, endSecs:quoteData["t"]};
                lineData.setPaddingScope(paddingScope);
            }
            lineData.pushData(new SamplePointData(quoteData));
        }
    }
    cc.eventManager.dispatchCustomEvent(NOTIFY_QUOTE_UPDATE, {"productId":productId, "quoteDataList":quoteDataList, "diff":diff});
    //
    var latestQuoteTime = quoteDataList.last()["t"];
    var curSecs = cs.getCurSecs();
    //相差超过2秒则进行对时
    if(latestQuoteTime && Math.abs(curSecs - latestQuoteTime) > 2
        && (latestQuoteTime - MainController.getInstance().getLastFixTime()) > 60){
        cc.log("触发时间校对...");
        HttpManager.requestClientTime();
    }
};

/**
 * 正式场订单结算
 */
SocketResponse.handlers[RESPONSE_ORDER_COUNT] = function(data, type) {
    if(!data)
        return;
    cc.log(TimeHelper.formatSecs(undefined, "HH:mm:ss") + "  推送结算::"+ JSON.stringify(data));

    cc.log("订单更新::",TimeHelper.formatSecs(undefined, "HH:mm:ss"));
    var betArray = Player.getInstance().getCurDayBetArray();
    var orderId = data["orderId"];
    var updateBetInfo = null;
    for(var i = 0; i < betArray.length; i++) {
        var betInfo = betArray[i];
        if(betInfo && betInfo.getOrderId() == orderId) {
            betInfo.initFromJson(data);
            updateBetInfo = betInfo;
            break;
        }
    }
    if(updateBetInfo){
        cc.eventManager.dispatchCustomEvent(NOTIFY_ORDER_COUNT, updateBetInfo);
    }

    ////服务器端的要求 延迟更新
    //setTimeout(function(){
    //}, 1000);
};

/**
 * 模拟场单结算
 * @param data
 * @param type
 */
SocketResponse.handlers[RESPONSE_TEST_ORDER_COUNT] = function(data, type) {
    if(!data)
        return;

    cc.log(TimeHelper.formatSecs(undefined, "HH:mm:ss") + "  推送结算::"+ JSON.stringify(data));
    var betArray = Player.getInstance().getCurDaySmBetArray();
    var orderId = data["orderId"];
    var updateBetInfo = null;
    for(var i = 0; i < betArray.length; i++) {
        var betInfo = betArray[i];
        if(betInfo.getOrderId() == orderId) {
            betInfo.initFromJson(data);
            updateBetInfo = betInfo;
            break;
        }
    }
    if(updateBetInfo){
        cc.eventManager.dispatchCustomEvent(NOTIFY_ORDER_COUNT, updateBetInfo);
    }
    ////服务器端的要求 延迟更新
    //setTimeout(function(){
    //
    //}, 1000);
};

/**
 * 产品更新
 * @param data
 * @param type
 */
SocketResponse.handlers[RESPONSE_PRODUCT] = function(data, type) {
    cc.log("产品更新::"+JSON.stringify(data));
    var player = Player.getInstance();

    var productGroupList = data;
    //玩法
    for(var t = 0; t < productGroupList.length; t++)
    {
        var groupData = productGroupList[t];
        //产品列表
        var optionListData = groupData["optionList"];
        for(var i = 0; i < optionListData.length; i++)
        {
            var productData = optionListData[i];
            if(productData == undefined)
                continue;
            var productId = productData["id"];
            var productInfo = player.getProductById(productId);
            if(productInfo != undefined)
            {
                productInfo.initFromJson(productData);
            }
        }
    }

    cc.eventManager.dispatchCustomEvent(NOTIFY_PRODUCT_INFO_UPDATE);
};

/**
 * 正式场持仓数更新
 */
SocketResponse.handlers[RESPONSE_POSITION_COUNT] = function(data) {
    cc.log("正式场持仓数更新::"+JSON.stringify(data));
    var positionCount = data["positionCount"];
    if(Player.getInstance().isLimited())
        return;
    if(positionCount < 0)
        positionCount = 0;
    Player.getInstance().setPositionCount(positionCount);
    cc.eventManager.dispatchCustomEvent(NOTIFY_POSITION_CHANGES);
};

/**
 * 模拟场 持仓数更新
 */
SocketResponse.handlers[RESPONSE_TEST_POSITION_COUNT] = function(data) {
    cc.log("模拟场 持仓数更新::"+JSON.stringify(data));
    var positionCount = data["positionCount"];
    if(Player.getInstance().isLimited())
        return;
    if(positionCount < 0)
        positionCount = 0;
    Player.getInstance().setSmPositionCount(positionCount);
    cc.eventManager.dispatchCustomEvent(NOTIFY_POSITION_CHANGES);

};

/**
 * 新邮件
 * @param data
 * @param type
 */
SocketResponse.handlers[RESPONSE_ACTION_MAIL_UNREAD] = function(data, type) {
    cc.log("新邮件::", JSON.stringify(data));
    //TODO
    //cc.eventManager.dispatchCustomEvent(NOTIFY_NEW_MAIL);
};

/**
 * 客服反馈
 * @param data
 * @param type
 */
SocketResponse.handlers[RESPONSE_FEEDBACK_NOTIFY] = function(data) {
    cc.log("新的客服反馈::", JSON.stringify(data));
    cc.eventManager.dispatchCustomEvent(NOTIFY_FEEDBACK, data.FeedBackNotify);
};

/**
 * 红点
 */
SocketResponse.handlers[RESPONSE_REDDOT_NOTIFY] = function(data) {
    cc.log("红点推送::", JSON.stringify(data));
    cc.log(" Player.getInstance()::",Player.getInstance());
    var data = data["RedDotNotify"];
    Player.getInstance().addRedDotNumByType(data.type, data.count);
    cc.eventManager.dispatchCustomEvent(NOTIFY_RED_DOT, data.type);
};

/**
 * 房间新的申请信息
 */
SocketResponse.handlers[RESPONSE_ROOM_NEW_JOIN_APPLY] = function(data) {
    cc.log("邀请信息推送", JSON.stringify(data));
    cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_NEW_JOIN_APPLY, data);
};

/**
 * 房间邀请信息已经被其他管理员处理
 */
SocketResponse.handlers[RESPONSE_ROOM_DEL_JOIN_APPLY] = function(data) {
    cc.log("邀请信息推送::", JSON.stringify(data));
    cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_DEL_JOIN_APPLY, data);
};

/**
 * 玩家申请房间消息回馈
 */
SocketResponse.handlers[RESPONSE_ROOM_JOIN_APPLY_RESULT] = function(data) {
    cc.log("申请房间消息回馈::", JSON.stringify(data));
    cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_JOIN_APPLY_RESULT, data);
};

/**
 * roomIdList更新
 */
SocketResponse.handlers[RESPONSE_ROOM_ID_LIST] = function(data) {
    cc.log("房间IdList更新::", JSON.stringify(data));
    var player = Player.getInstance();
    var roomIdList = player.setRoomList(data["roomIdList"]);
    var curRoomId = player.getRoomId();
    var isExists = false;
    for(var i = 0; i < roomIdList.length; i++){
        var roomId = roomIdList[i];
        if(curRoomId == roomId){
            isExists = true;
            break;
        }
    }
    //表示被房间剔除
    if(!isExists){
        player.setRoomId(undefined);
        player.getRoomInfo().destroy();
        cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_STATE_CHANGE);
    }
    cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_ID_LIST_UPDATE);
};

/**
 * memberId 删除
 */
SocketResponse.handlers[RESPONSE_ROOM_DEL_MEMBER] = function(data) {
    cc.log("房间删除成员::", JSON.stringify(data));
    var roomId = data["roomId"];
    var curRoom = Player.getInstance().getRoomInfo();
    if(curRoom.getRoomId() == roomId){
        if(data["memberNum"] != undefined){
            curRoom.setMemberNum(data["memberNum"]);
        }
        cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_BASIC_CHANGE);
        cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_DEL_MEMBER, data);
    }
};

/**
 * 房间新增成员
 */
SocketResponse.handlers[RESPONSE_ROOM_NEW_MEMBER] = function(data) {
    cc.log("房间新增成员::", JSON.stringify(data));
    var roomId = data["roomId"];
    var curRoom = Player.getInstance().getRoomInfo();
    if(curRoom.getRoomId() == roomId){
        if(data["memberNum"] != undefined){
            curRoom.setMemberNum(data["memberNum"]);
        }
        cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_BASIC_CHANGE);
        cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_NEW_MEMBER, data);
    }
};

/**
 * 房间成员下单
 */
SocketResponse.handlers[RESPONSE_ROOM_TRADE_ORDER] = function(data) {
    if(data["order"]["result"] == BetInfo.RESULT_TYPE_UN_SETTLE){
        cc.log("房间成员下单::", JSON.stringify(data));
    }else{
        cc.log("房间成员订单结算::", JSON.stringify(data));
    }
    var roomId = data["roomId"];
    var curRoom = Player.getInstance().getRoomInfo();
    if(roomId == curRoom.getRoomId()){
        cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_TRADE_ORDER, data);
    }
};

/**
 * 房间成员下单
 */
SocketResponse.handlers[RESPONSE_ROOM_NAME_CHANGE] = function(data) {
    cc.log("房间改名::", JSON.stringify(data));
    var roomId = data["roomId"];
    var curRoom = Player.getInstance().getRoomInfo();
    if(roomId == curRoom.getRoomId()){
        var roomName = data["name"];
        curRoom.setRoomName(roomName);
        cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_BASIC_CHANGE);
        //cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_NAME_CHANGE, {"roomId":roomId, "roomName":roomName});
    }
};