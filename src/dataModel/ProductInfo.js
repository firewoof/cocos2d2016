/**
 * Created by 玲英 on 2016/7/18.
 */

/**
 * 产品信息
 * @type {Function}
 */
var ProductInfo = cc.Class.extend({
    _assetId:0,
    _assetName:"",
    _isDefault:false,               //是否是默认产品
    _name:"",                       //产品名称
    _duration:0,                    //下单到结算的间隔
    _maxBetAmount:1000,             //最大投注额
    _minBetAmount:1,                //最小投注额
    _initOdds:0.75,                 //初始赔率
    _openTimeArray:undefined,
    _id:0,
    _isFocused:false,
    _precise:5,
    _optionType:undefined,
    _maxPositionCount:999,       //最大的未结算订单数
    _orderGap:2,                   //下单间隔
    _orderAmountList:undefined,   //金额输入项
    _isSaturdayEnabled:true,
    _isSundayEnabled:true,
    _notTradeTimeArray:undefined,     //不可交易时间段(跨天)
    _noMoreTradeTime:120,           //距离休市 前n秒 不可交易(但能结算)
    _noMoreTradeTimeTip:300,        //距离休市 前n秒 开始提示:xxx即将休市
    _touchOffsetList:undefined,     //(触碰版)
    _feeRateList:undefined,         //(触碰版)手续费率列表
    _status:1,                      //OPTION_STATUS_REMOVED:0表示下架 正常为1
    _minWaveRange:undefined,        //最小波动范围（用来优化显示）
    _durationList:undefined,        //结算时间可选列表
    _oddsList:undefined,
    _operateType:0,
    _weekSchedule:undefined,

    //-----辅助数据区------=
    _fetchPlayers:undefined,        //抓取的用户列表
    _isFetching:false,              //辅助变量 true表示正在抓取用户，防止并发抓用户导致无法剔除已有的用户
    _lastKickTime:0,                //辅助变量 最后一次剔除用户的时间

    ctor:function(jsonData)
    {
        this._openTimeArray = [];
        this._notTradeTimeArray = [];
        this._fetchPlayers = new Array(4);  //固定4个 push原则::见缝就插
        this._fetchLength = 0;
        this._isFocused = false;
        this._optionType = ProductInfo.OPTION_TYPE_NORMAL;
        this._status = ProductInfo.OPTION_STATUS_NORMAL;
        this._orderAmountList = [1,5,20,50,100,200,500,1000, 2000];
        this._touchOffsetList = [1, 4, 7];
        this._touchOffsetShowList = [1, 4, 7];
        this._durationList = [60, 4 * 60, 12 * 60];
        this._oddsList = [];
        this._feeRateList = [0.10, 0.12, 0.15];
        this._weekSchedule = new WeekSchedule();
        if(jsonData){
            this.initFromJson(jsonData);

            //容错
            var extAttributeData = jsonData["extAttribute"];
            if(!extAttributeData || extAttributeData["operateType"] == undefined){
                cc.log("extAttributeData::", JSON.stringify(extAttributeData));
                if(this.isTouchOption()){
                    this._operateType = ProductInfo.OPTION_OPERATE_TOUCH_OFFSET_CHOOSE;
                }else{
                    this._operateType = ProductInfo.OPTION_OPERATE_HIGH_LOW_LIST;
                }
            }
        }
    },

    initFromJson:function(jsonData)
    {
        this._isDefault             = ALCommon.getValueWithKey(jsonData, "isDefault", this._isDefault);
        this._name                  = ALCommon.getValueWithKey(jsonData, "name", this._name);
        this._duration              = ALCommon.getValueWithKey(jsonData, "duration", this._duration);
        this._maxBetAmount          = ALCommon.getValueWithKey(jsonData, "maxOrderAmount", this._maxBetAmount);
        this._minBetAmount          = ALCommon.getValueWithKey(jsonData, "minOrderAmount", this._minBetAmount);
        this._initOdds              = ALCommon.getValueWithKey(jsonData, "initLoseRate", this._initOdds);
        this._id                    = ALCommon.getValueWithKey(jsonData, "id", this._id);
        this._precise               = ALCommon.getValueWithKey(jsonData, "scale", this._precise);
        this._optionType            = ALCommon.getValueWithKey(jsonData, "optionType", this._optionType);
        this._assetId               = ALCommon.getValueWithKey(jsonData, "assetId", this._assetId);
        this._assetName             = ALCommon.getValueWithKey(jsonData, "assetName", this._assetName);
        this._orderGap              = ALCommon.getValueWithKey(jsonData, "orderInterval", this._orderGap);
        this._maxPositionCount      = ALCommon.getValueWithKey(jsonData, "positionCount", this._maxPositionCount);
        this._isSundayEnabled       = ALCommon.getValueWithKey(jsonData, "canSundayTrade", this._isSundayEnabled);
        this._isSaturdayEnabled     = ALCommon.getValueWithKey(jsonData, "canSaturdayTrade", this._isSaturdayEnabled);

        //扩展属性(这里客户端自己拆出来)
        var extAttributeData = jsonData["extAttribute"];
        if(extAttributeData) {
            //split
            this._touchOffsetList = ALCommon.getSplitArrayWithKey(extAttributeData, "touchOffsetList", this._touchOffsetList);
            this._touchOffsetShowList = ALCommon.getSplitArrayWithKey(extAttributeData, "touchOffsetShowList", this._touchOffsetShowList);
            this._feeRateList = ALCommon.getSplitArrayWithKey(extAttributeData, "feeRateList", this._feeRateList);
            this._orderAmountList = ALCommon.getSplitArrayWithKey(extAttributeData, "orderAmountList", this._orderAmountList);
            this._durationList = ALCommon.getSplitArrayWithKey(extAttributeData, "durationList", this._durationList);
            this._oddsList = ALCommon.getSplitArrayWithKey(extAttributeData, "loseRateList", this._oddsList);

            //
            this._noMoreTradeTimeTip = ALCommon.getValueWithKey(extAttributeData, "noMoreTradeTimeTip", this._noMoreTradeTimeTip);
            this._minWaveRange = ALCommon.getValueWithKey(extAttributeData, "minWaveRange", this._minWaveRange);
            this._operateType = ALCommon.getValueWithKey(extAttributeData, "operateType", this._operateType);
        }

        cc.log("this._operateType:", this._operateType);
        //周开放时间表
        this._weekSchedule.initFromJson(jsonData);

        //不可交易时间段[{"begin":10086, "end"}] 支持跨天(判断的时候 请判断绝对时间)
        var notTradeTimeFrame = jsonData["notTradeTimeFrame"];
        for(var i = 0; i < notTradeTimeFrame.length; i++)
        {
            var timeStageInfo = new TimeStage(notTradeTimeFrame[i]);
            this._notTradeTimeArray.push(timeStageInfo);
        }

        //下架
        var oldStatus = this._status;
        this._status                = ALCommon.getValueWithKey(jsonData, "status", this._status);
        if(oldStatus != this._status && this.isRemoved()){
            this.removeUselessBets(true);   //模拟的
            this.removeUselessBets(false);  //正式的
            cc.log("产品下架通知，强制关闭订单列表");
            cc.eventManager.dispatchCustomEvent(NOTIFY_PRODUCT_REMOVED);
        }
    }
});

ProductInfo.OPTION_TYPE_NORMAL = 1; //固定局
ProductInfo.OPTION_TYPE_TOUCH = 2;  //

ProductInfo.OPTION_STATUS_REMOVED = 0;  //下架
ProductInfo.OPTION_STATUS_NORMAL = 1;  //正常

ProductInfo.OPTION_OPERATE_NORMAL = 0;                  //默认
ProductInfo.OPTION_OPERATE_HIGH_LOW_LIST = 1;           //涨跌--结算间隔列表
ProductInfo.OPTION_OPERATE_TOUCH_OFFSET_CHOOSE = 2;     //触碰--止盈止损点选择
ProductInfo.OPTION_OPERATE_TOUCH_OFFSET_HQGJ = 3;       //触碰--止盈止损点选择(环球国际)
ProductInfo.OPTION_OPERATE_HIGH_LOWL_FEE = 4;           //涨跌--手续费模式
ProductInfo.OPTION_OPERATE_TOUCH_OFFSET_FEE = 5;        //触碰--手续费模式


/**
 * 产品是否开放
 * @param {boolean} [isSimulateTrade]
 * @param {number} [curSecs]
 * @returns {boolean}
 */
ProductInfo.prototype.isOpen = function(isSimulateTrade, curSecs) {
    var curSecs = curSecs || cs.getCurSecs();
    var isSimulateTrade = isSimulateTrade == undefined ? GB.isSimulateTrade : isSimulateTrade ;

    var isWhiteListUser = ClientConfig.getInstance().isWhiteListUser();
    if(isWhiteListUser){
        return true;
    }
    //cc.log("isWhiteListUser::", isWhiteListUser);
    var curData = cs.getDate();
    var weekSchedule = this._weekSchedule;
    var logArray = [];
    logArray.push(this.getName());

    if(this.isRemoved()){
        logArray.push("产品下架");
        cc.log(logArray.join(","));
        return false;
    }

    //如果在不可开放时间内
    for(var i = 0, len = this._notTradeTimeArray.length; i < len; i++){
        var timeStage = this._notTradeTimeArray[i];
        if(timeStage.isContaint(curSecs)){
            logArray.push("在不开放时间内");
            cc.log(logArray.join(","));
            return false;
        }
    }

    //一周配置中符合交易时间段
    if(weekSchedule && weekSchedule.isContained(curSecs)){
        return true;
    }

    logArray.push("当前休市");
    cc.log(logArray.join(","));
    return false;
};



/**
 * 获得下一次休市的时间
 * 请确保 产品现在是开放的 再调用这个方法
 */
ProductInfo.prototype.getNextRestTime = function()
{
    var zeroSecs = cs.getZeroSecs();                    //当天临晨
    var endDaySecs = zeroSecs + 24 * 60 * 60;           //当天24点
    var curSecs = cs.getCurSecs();                      //当前时间

    //为了方便判断 默认当前减一s
    var nextRestTime = zeroSecs + 24 * 60 * 60 * 999;

    var isWhiteListUser = ClientConfig.getInstance().isWhiteListUser();
    if(isWhiteListUser){
        cc.log("白名单用户...不休时了");
        return nextRestTime;
    }

    nextRestTime = this._weekSchedule.getNextRestTime();

    //看是否有更贴近的不可交易时间
    for(var i = 0, len = this._notTradeTimeArray.length; i < len; i++)
    {
        var notTradeTimeStage = this._notTradeTimeArray[i];
        var originBeginTime = notTradeTimeStage.getOriginBeginTime();
        if(originBeginTime > curSecs && originBeginTime < nextRestTime){
            nextRestTime = originBeginTime;
        }
    }

    return nextRestTime;
};

ProductInfo.prototype.getTouchOffsetShowList = function()
{
    return this._touchOffsetShowList;
};

ProductInfo.prototype.isTouchOption = function()
{
    return this._optionType == ProductInfo.OPTION_TYPE_TOUCH;
};

ProductInfo.prototype.getWeekSchedule = function()
{
    return this._weekSchedule;
};

ProductInfo.prototype.getTouchOffsetList = function()
{
    return this._touchOffsetList;
};

ProductInfo.prototype.getOperateType = function()
{
    return this._operateType;
};

ProductInfo.prototype.getDurationList = function()
{
    return this._durationList;
};

ProductInfo.prototype.getOddsList = function()
{
    return this._oddsList;
};

ProductInfo.prototype.getFeeRateList = function()
{
    return this._feeRateList;
};

ProductInfo.prototype.getFetchPlayers = function()
{
  return this._fetchPlayers;
};

ProductInfo.prototype.getOptionType = function()
{
    return this._optionType;
};

ProductInfo.prototype.getMinWaveRange = function()
{
    return this._minWaveRange;
};

ProductInfo.prototype.getFetchLength = function()
{
    return this._fetchLength;
};

ProductInfo.prototype.isFetching = function()
{
    return this._isFetching;
};

ProductInfo.prototype.setFetching = function(value)
{
    this._isFetching = value;
};

ProductInfo.prototype.getStatus = function()
{
    return this._status;
};

/**
 * 是否下架
 * @returns {number}
 */
ProductInfo.prototype.isRemoved = function()
{
    return this._status == ProductInfo.OPTION_STATUS_REMOVED;
};

/**
 * 所有抓取用户的订单
 * @param playerId
 */
ProductInfo.prototype.getFetchBetArray = function()
{
    var betArray = [];
    for(var i = 0; i < this._fetchPlayers.length; i++)
    {
        var tempFetchPlayer = this._fetchPlayers[i];
        if(!tempFetchPlayer)
            continue;
        var tempBetArray = tempFetchPlayer.getBetArray();
        for(var k = 0; k < tempBetArray.length; k++){
            betArray.push(tempBetArray[i]);
        }
    }
    return betArray;
};

/**
 * 抓满n个用户
 * @param {Number} [num]
 */
ProductInfo.prototype.requestFullPlayers = function(num)
{
    var num = num == undefined ? 4 : num;
    var responseCallBack = function(jsonData) {
        var userList = jsonData["userList"];
        for (var i = 0; i < userList.length; i++)
        {
            var newPlayer = new BetPlayer(userList[i]);
            newPlayer.setProductId(this.getId());
            this.pushFetchPlayer(newPlayer);
        }
        //通知tradingHall刷新头像
        cc.eventManager.dispatchCustomEvent(NOTIFY_FETCH_FULL_PLAYERS, this.getId());
    }.bind(this);

    //抓4个
    HttpManager.requestFetchUser(responseCallBack, this.getId(), num);
};

/**
 * 抓指定用户
 * @param {Numeber} [num]
 */
ProductInfo.prototype.requestFetchPlayer = function(callBack, idFlag, fixIndex)
{
    var num = 1;

    var responseCallBack = function(jsonData) {
        //var newPlayers = this._fetchPlayers;
        cc.log("fixIndex::", fixIndex);
        var userList = jsonData["userList"];

        if(!userList || userList.length == 0) {
            callBack();
            return;
        }
        var newPlayer = new BetPlayer(userList[0]);
        if(idFlag != newPlayer.getIdFlag()) {
            var logStr = "抓取指定用户接口, 返回的数据idflag前后不一致";
            testSeverLog(logStr);
        }
        this.pushFetchPlayer(newPlayer, fixIndex);
        if(callBack)
            callBack();
    }.bind(this);

    //抓指定
    HttpManager.requestFetchUser(responseCallBack, this.getId(), num ,idFlag);
};

/**
 * 抓新的用户
 * @param callBack
 * @param fixIndex
 */
ProductInfo.prototype.requestFetchNewPlayer = function(callBack, fixIndex)
{
    var responseCallBack = function(jsonData) {
        //var newPlayers = this._fetchPlayers;
        cc.log("fixIndex::", fixIndex);
        var userList = jsonData["userList"];

        if(!userList || userList.length == 0) {
            callBack();
            return;
        }
        var newPlayer = new BetPlayer(userList[0]);
        this.pushFetchPlayer(newPlayer, fixIndex);
        if(callBack)
            callBack();
    }.bind(this);

    HttpManager.requestFetchNewUser(responseCallBack, this.getId());
};

/**
 * 添加抓取用户
 * @param {*} newPlayer
 * @param {Number} [fixIndex] 指定添加位置
 * @returns {boolean}
 */
ProductInfo.prototype.pushFetchPlayer = function(newPlayer, fixIndex)
{
    var isExists = false;
    for(var i = 0; i < this._fetchPlayers.length; i++){
        var tempPlayer = this._fetchPlayers[i];
        if(tempPlayer && tempPlayer.getId() == newPlayer.getId()){
            isExists = true;
            break;
        }
    }

    var isPushSuccess = false;
    if(!isExists)
    {
        //cc.log("this._fetchPlayers.length = ",this._fetchPlayers.length);
        newPlayer.setProductId(this.getId());
        if(fixIndex == undefined)
        {
            for(var i = 0; i < this._fetchPlayers.length; i++) {
                if(!this._fetchPlayers[i])
                {
                    this._fetchPlayers[i] = newPlayer;
                    this._fetchLength += 1;
                    isPushSuccess = true;
                    cc.log("push fetchPlayer success");
                    break;
                }
            }
        }else{
            if(this._fetchPlayers[fixIndex] == undefined) {
                this._fetchPlayers[fixIndex] = newPlayer;
                isPushSuccess = true;
            }
        }
    }

    if(isPushSuccess){
        //通知
        cc.eventManager.dispatchCustomEvent(NOTIFY_FETCH_PLAYER_CHANGES, this._id);
        return true;
    }

    return false;
};


/**
 * 剔除一个 把剩下的更新给服务器
 * request update fetchPlayers
 * @param {Numeber} [num]
 */
ProductInfo.prototype.removeFetchPlayer = function(playerId, callBack)
{
    var idFlags = "";
    var kickIndex = -1;
    var fetchPlayers = this._fetchPlayers;
    for(var i = 0; i < fetchPlayers.length; i++)
    {
        var tempPlayer = fetchPlayers[i];
        if(!tempPlayer)
            continue;
        if(tempPlayer && tempPlayer.getId() == playerId) {
            kickIndex = i;
            continue;
        }
        if(idFlags == "")
            idFlags += tempPlayer.getIdFlag();
        else
            idFlags += "," + tempPlayer.getIdFlag();
    }

    var responseCallBack = function(jsonData) {
        var newIdFlag = jsonData["idFlag"];
        var isAllowRemove = false;
        //idFlag返回表示 有新的可以抓取 可以剔除
        if(newIdFlag && newIdFlag != Player.getInstance().getIdFlag()) {
            var kickPlayer = fetchPlayers[kickIndex];
            //cc.log("kickPlayer.getIdFlag()::", kickPlayer.getIdFlag());
            //cc.log("kickPlayer.getIdFlag() != newIdFlag === ", kickPlayer.getIdFlag() != newIdFlag);
            //不同的才剔除
            if(kickPlayer.getIdFlag() != newIdFlag){
                isAllowRemove = true;
                //剔除成功
                fetchPlayers[kickIndex] = null;
                this._fetchLength -= 1;
                //通知
                cc.eventManager.dispatchCustomEvent(NOTIFY_FETCH_PLAYER_CHANGES, this._id);
            }
        }

        if(callBack){
            if(isAllowRemove){
                callBack(this.getId(), newIdFlag);
            } else{
                callBack(this.getId());
            }
        }
    }.bind(this);

    HttpManager.requestUpdateFetchUser(responseCallBack, this.getId(), idFlags);

};



ProductInfo.prototype.getNoMoreTradeTime = function()
{
    return this._noMoreTradeTime;
};

ProductInfo.prototype.getNoMoreTradeTimeTip = function()
{
    return this._noMoreTradeTimeTip;
};

/**
 * @returns {number}
 */
ProductInfo.prototype.getPrecise = function()
{
    return this._precise;
};

ProductInfo.prototype.isSaturdayEnabled = function()
{
    return this._isSaturdayEnabled;
};

ProductInfo.prototype.isSundayEnabled = function()
{
    return this._isSundayEnabled;
};

ProductInfo.prototype.getMaxUnSettledOrders = function()
{
    return this._maxPositionCount;
};

ProductInfo.prototype.getOrderAmountList = function()
{
    return this._orderAmountList;
};

ProductInfo.prototype.getOrderGap = function()
{
    return this._orderGap;
};

ProductInfo.prototype.getOptionType = function()
{
    return this._optionType;
};

//ProductInfo.prototype.isWeekendAvailabe = function()
//{
//    //周六周末 判断是否可交易
//    var curDay = cs.getDate().getDay();
//    var isSaturday = curDay == 6;
//    var isSunday = curDay == 0;
//    if(!this.isSaturdayEnabled() && isSaturday){
//        return false;
//    }
//
//    if(!this.isSundayEnabled() && isSunday){
//        return false;
//    }
//
//    return true;
//};

/**
 * 下一个开放时间
 * @param curSecs
 */
ProductInfo.prototype.getNextOpenTimeStr = function()
{
    var curSecs = cs.getCurSecs();
    var zeroSecs = cs.getZeroSecs();
    var curDay = cs.getDate();
    var endToday = zeroSecs + 24 * 3600;

    //下架
    if(this.isRemoved()){
        return LocalString.getString("PRODUCT_NOT_YET_SHORT");
    }

    //如果在不可开放时间内
    for(var i = 0, len = this._notTradeTimeArray.length; i < len; i++){
        var timeStage = this._notTradeTimeArray[i];
        if(timeStage.isContaint(curSecs)){
            return LocalString.getString("PRODUCT_NOT_YET_SHORT");
        }
    }

    var nextOpenScope = this._weekSchedule.getNextOpenScope();
    if(nextOpenScope){
        var beginTime = nextOpenScope.beginTime;
        cc.log("nextOpen::" + TimeHelper.formatSecs(beginTime) );
        if(beginTime < endToday){
            return TimeHelper.formatSecs(beginTime, "HH:mm") + LocalString.getString("PRODUCT_OPEN_TIPS");
        }
        if(beginTime >= endToday && beginTime < (endToday + 24 * 3600)){
            return LocalString.getString("COMMON_TOMORROW") + TimeHelper.formatSecs(beginTime, "HH:mm") + LocalString.getString("PRODUCT_OPEN_TIPS");
        }
    }

    return LocalString.getString("PRODUCT_NOT_YET_SHORT");

};

/**
 * @returns {Boolean}
 */
ProductInfo.prototype.isDefault = function() {
    return this._isDefault;
};

ProductInfo.prototype.isFocused = function() {
    return this._isFocused;
};

/**
 * @returns {Boolean}
 */
ProductInfo.prototype.setFocused = function(bool) {
    var bool = bool == false ? false : true;
    this._isFocused = bool;
};

ProductInfo.prototype.getOpenTimeArray = function() {
    return this._openTimeArray;
};

/**
 * 时间戳获得可用的开放时间段
 * @param secs []
 * @returns {*}
 */
ProductInfo.prototype.getValidTimeStage = function(secs) {
    var secs = cs.getCurSecs() || secs;
    for(var i = 0; i < this._openTimeArray.length; i++)
    {
        var timeStage = this._openTimeArray[i];
        if(timeStage.isValidInDay(secs))
        {
            return timeStage;
        }
    }
    return null;
};

/**
 * @returns {number}
 */
ProductInfo.prototype.getId = function() {
    return this._id;
};

ProductInfo.prototype.setId = function(value) {
    this._id = value;
};

/**
 * @returns {string}
 */
ProductInfo.prototype.getName = function() {
    return this._name;
};

/**
 * @param {string} name
 */
ProductInfo.prototype.setName = function(name) {
    this._name = name;
};

/**
 * @returns {Number}
 */
ProductInfo.prototype.getTradeGap = function() {
    return this._duration;
};

//ProductInfo.prototype.getTradeStageGap = function() {
//    return this._tradeInterval + this._settleInterval;
//};

/**
 * @param {Number} tradeStageInterval
 */
ProductInfo.prototype.getTradeSettleGap = function(tradeInterval) {
    return this._duration;
};

/**
 * @returns {Number}
 */
ProductInfo.prototype.getMaxBetAmount = function() {
    return this._maxBetAmount;
};

/**
 * @param {Number} maxBetAmount
 */
ProductInfo.prototype.setMaxBetAmount = function(maxBetAmount) {
    this._maxBetAmount = maxBetAmount;
};

/**
 * @returns {Number}
 */
ProductInfo.prototype.getMinBetAmount = function() {
    return this._minBetAmount;
};

/**
 * @param {Number} minBetAmount
 */
ProductInfo.prototype.setMinBetAmount = function(minBetAmount) {
    this._minBetAmount = minBetAmount;
};

/**
 * @returns {Number}
 */
ProductInfo.prototype.getInitOdds = function() {
    return this._initOdds;
};

/**
 * @param {Number} initOdds
 */
ProductInfo.prototype.setInitOdds = function(initOdds) {
    this._initOdds = initOdds;
};

/**
* 移除被下架的订单
*/
ProductInfo.prototype.removeUselessBets = function(isSimulateTrade)
{
    if(!this.isRemoved()){
        return;
    }
    cc.log("产品下架.....准备剔除订单");
    var betArray = Player.getInstance().getCurDayBetArray();
    if(isSimulateTrade){
        betArray = Player.getInstance().getCurDaySmBetArray();
    }

    //map 方便返回时查询
    var isExists = false;
    for(var i = 0; i < betArray.length; i++){
        var betInfo = betArray[i];
        if(betInfo.getProductId() == this._id){
            isExists = true;
            break;
        }
    }
    if(isExists){
        cc.log("记录存在已下架订单，移除.....");
        for(var i = 0; i < betArray.length; i++){
            var betInfo = betArray[i];
            if(betInfo.getProductId() == this._id){
                betArray.splice(i, 1);
                i--;
            }

        }

        //save
        Player.getInstance().saveBetData(isSimulateTrade);
    }
};


var WeekSchedule = cc.Class.extend({
    _openScopeArray:undefined,
    _openFormatArray:undefined,
    _closeDaysOfWeek:undefined,

    ctor:function(jsonData)
    {
        this._originTradeTimeListStr = null;
        this._originTradeDayListStr = null;
        this._openScopeArray = [];
        this._openFormatArray = [];

        if(jsonData)
            this.initFromJson(jsonData);
    },

    initFromJson:function(jsonData)
    {
        var tradeTimeListStr = jsonData["tradeTimeFrame"];
        var tradeDayListStr = jsonData["tradeDayList"];
        var extAttributeData = jsonData["extAttribute"];

        this._closeDaysOfWeek = extAttributeData["closeDaysOfWeek"];

        if( tradeTimeListStr && tradeDayListStr
            && (this._originTradeTimeListStr != tradeTimeListStr || this._originTradeDayListStr != tradeDayListStr))
        {
            if(this._originTradeTimeListStr && this._originTradeDayListStr)
            {
                cc.log(jsonData["name"] + " 周开放计划表更新");
            }
            cc.log("---------------"+jsonData["name"]+"--------------");
            this.parseConfig(tradeTimeListStr, tradeDayListStr);
        }
    },

    parseConfig:function(tradeTimeListStr, tradeDayListStr)
    {
        this._originTradeTimeListStr = tradeTimeListStr;
        this._originTradeDayListStr = tradeDayListStr;

        this._openScopeArray = [];
        this._openFormatArray = [];

        /**
         * 这里的时间戳全部以周一为基准，只要将周一的时间调整到服务器的周一即可就行，星期xx则以UTCDay 时区设置为服务器时区即可
         */
        var mondayZeroSecs = this.getMondayZeroSecs();
        cc.log("本周一：",TimeHelper.formatSecs(mondayZeroSecs));
        var tradeDayList = tradeDayListStr.split(",");
        var tradeDayEnabledMap = this._tradeDayEnabledMap = {};
        for(var i = 0; i < tradeDayList.length; i++){
            tradeDayEnabledMap[tradeDayList[i]] = true;
        }

        //算出七天的可交易区间
        var sevenDay = [1,2,3,4,5,6,0];
        var sundayEndOffset = 7*24*3600;
        for(var t = 0; t < sevenDay.length; t++) {
            var day = sevenDay[t];
            //不可交易
            if(!tradeDayEnabledMap[day]){
                cc.log("周" + (t+1) + " 不开放交易");
                continue;
            }
            var zeroFromMonday = t * 24 * 3600;
            //解析 08:01:00-2,12:00-8
            var stageList = tradeTimeListStr.split(",");
            //解析每个可交易时间段
            for(var i = 0;  i < stageList.length; i++) {
                var stage = stageList[i];

                //tempArray[0] 表示起始时间 08:01:00, tempArray[1]表示持续时间
                var tempArray = stage.split("-");
                var beginTimeStr = tempArray[0];
                var duration = parseFloat(tempArray[1]);
                //距离周一0点的偏移
                var beginTimeOffset = zeroFromMonday + this.hourStrToSecs(beginTimeStr);
                var endTimeOffset = beginTimeOffset + duration * 3600;
                //跨周处理,周日跨周一
                if (endTimeOffset / (sundayEndOffset) > 1) {
                    //周日先持续到24点
                    var scopeObj = {
                        "beginTimeOffset":beginTimeOffset,
                        "endTimeOffset":sundayEndOffset
                    };
                    this._openScopeArray.push(scopeObj);    //注意先后顺序

                    //拆分，将周日部分转移到周一
                    beginTimeOffset = 0;
                    endTimeOffset = endTimeOffset % (sundayEndOffset);
                    var scopeObj = {
                        "beginTimeOffset":beginTimeOffset,
                        "endTimeOffset":endTimeOffset
                    };
                    this._openScopeArray.unshift(scopeObj);
                }else{
                    var scopeObj = {
                        "beginTimeOffset":beginTimeOffset,
                        "endTimeOffset":endTimeOffset
                    };
                    this._openScopeArray.push(scopeObj);
                }
            }
        }


        var copyEndDay = ALCommon.deepClone(this._openScopeArray.last());
        var copyFistDay = ALCommon.deepClone(this._openScopeArray[0]);
        //考虑到循环边缘下一次开放时间判断 多放一项上周最后一项的进去
        copyEndDay.beginTimeOffset -= sundayEndOffset;
        copyEndDay.endTimeOffset -= sundayEndOffset;
        this._openScopeArray.unshift(copyEndDay);
        //下周一第一项
        copyFistDay.beginTimeOffset += sundayEndOffset;
        copyFistDay.endTimeOffset += sundayEndOffset;
        this._openScopeArray.push(copyFistDay);

        //检查跨天是否影响到了周非开放日的配置
        if(this._closeDaysOfWeek){
            for(var i = 0; i < this._openScopeArray.length; i++){
                var tempScope = this._openScopeArray[i];
                //timeOffset 已经处理过，getDate实际对应点就是服务器时间了
                var beginDate = cs.getDate((tempScope.beginTimeOffset + 1 + mondayZeroSecs) * 1000);    //-1防止算到前一天
                var endDate = cs.getDate((tempScope.endTimeOffset - 1 + mondayZeroSecs) * 1000);    //-1防止算到第二天
                var endDay = endDate.getUTCDay() == 0 ? 7 : endDate.getUTCDay();
                var beginDay = beginDate.getUTCDay() == 0 ? 7 : beginDate.getUTCDay();
                if(this._closeDaysOfWeek.indexOf(endDay) >= 0){
                    tempScope.endTimeOffset = tempScope.beginTimeOffset + 3600*24 - tempScope.beginTimeOffset % (3600*24) - 1;
                    //cc.log("endTimeOffset 跨天配置周"+(endDay - 1)+"调整::" + TimeHelper.formatSecs(tempScope.endTimeOffset + mondayZeroSecs));
                }
                if(this._closeDaysOfWeek.indexOf(beginDay) >= 0){
                    tempScope.beginTimeOffset = tempScope.beginTimeOffset + 3600*24 - tempScope.beginTimeOffset % (3600*24) + 1 ;
                }
            }
        }

        for(var i = 0; i < this._openScopeArray.length; i++){
            var scopeObj = this._openScopeArray[i];
            var beginDate = new cs.getDate((scopeObj.beginTimeOffset + mondayZeroSecs) * 1000);
            var openFormatStr = "["+TimeHelper.formatSecs(scopeObj.beginTimeOffset + mondayZeroSecs)
                + " ~ " + TimeHelper.formatSecs(scopeObj.endTimeOffset + mondayZeroSecs) +"]";
            cc.log("周" + this.getCnDay(beginDate.getDay()) + " " + openFormatStr);
            this._openFormatArray.push(openFormatStr);
        }
    },

    getCnDay:function(day){
        var str = "";
        switch (day){
            case 1:
                str+="一";
                break;
            case 2:
                str+="二";
                break;
            case 3:
                str+="三";
                break;
            case 4:
                str+="四";
                break;
            case 5:
                str+="五";
                break;
            case 6:
                str+="六";
                break;
            case 0:
                str+="日";
                break;
            default :
                str = "unknown"
        }
        return str;
    },

    getOpenFormatArray:function()
    {
        return this._openFormatArray;
    },

    isContained:function(secs)
    {
        var secs = secs || cs.getCurSecs();
        var mondayZeroSecs = this.getMondayZeroSecs(secs);
        var offsetFromMonday = secs - mondayZeroSecs;
        var len = this._openScopeArray.length;

        if(len == 0)
            return true;

        for(var i = 0; i < len; i++){
            var scopeObj = this._openScopeArray[i];
            if(offsetFromMonday >= scopeObj.beginTimeOffset && offsetFromMonday <= scopeObj.endTimeOffset){
                return true;
            }
            else if(offsetFromMonday < scopeObj.beginTimeOffset)
            {
                return false;
            }
        }

        return false;
    },

    /**
     * 得到下一个开放时间段
     * @returns {{beginTime: *, endTime: *}}
     */
    getNextOpenScope:function()
    {
        var mondayZeroSecs = this.getMondayZeroSecs();
        var curSecs = cs.getCurSecs();
        var curOffset = curSecs - mondayZeroSecs;
        var len = this._openScopeArray.length;
        for(var i = 0; i < len; i++) {
            var scopeObj = this._openScopeArray[i];
            var nextObj = this._openScopeArray[i + 1];
            if(scopeObj && nextObj) {
                if(curOffset > scopeObj.endTimeOffset && curOffset < nextObj.beginTimeOffset){
                    var scope =
                    {
                        "beginTime":nextObj.beginTimeOffset + mondayZeroSecs,
                        "endTime":nextObj.endTimeOffset + mondayZeroSecs
                    };
                    cc.log("product nextOpen::", JSON.stringify(scope));
                    return scope;
                }
            }
        }
    },

    /**
     * 得到下一次休市时间
     * @returns {{beginTime: *, endTime: *}}
     */
    getNextRestTime:function()
    {
        var mondayZeroSecs = this.getMondayZeroSecs();
        var curSecs = cs.getCurSecs();
        var curOffset = curSecs - mondayZeroSecs;
        var len = this._openScopeArray.length;
        for(var i = 0; i < len; i++) {
            var scopeObj = this._openScopeArray[i];
            if(scopeObj && scopeObj) {
                if(curOffset > scopeObj.beginTimeOffset && curOffset < scopeObj.endTimeOffset ){
                    return scopeObj.endTimeOffset + mondayZeroSecs;
                }
            }
        }
    },

    /**
     * 本周周一凌晨 -- 这里需要服务器的周一
     * @returns [number]
     */
    getMondayZeroSecs:function(secs)
    {
        var secs = (secs || cs.getCurSecs());
        var zeroSecs = cs.getZeroSecs(secs * 1000);
        //服务器日期
        var date = cs.getDate(secs * 1000);
        date.setUTCHours(SERVER_UTC);
        var day = date.getUTCDay();
        var diffSecs = day > 0 ? (day - 1) * 24 * 3600 : 6 * 24 * 3600;
        var mondayZeroSecs = zeroSecs - diffSecs;
        return mondayZeroSecs;
    },

  /**
     * 时转秒
     * @param hourStr
     * @returns {*}
     */
    hourStrToSecs:function(hourStr)
    {
        var subArray = hourStr.split(":");
        if(subArray.length < 3){
            return null;
        }
        var countSecs = parseInt(subArray[0]) * 3600 + parseInt(subArray[1]) * 60 + parseInt(subArray[2]);
        return countSecs;
    }
});

/**
 * 时间间隔
 */
var TimeStage = cc.Class.extend({
    _beginFromZero:0,   //与零点的时间offset
    _endFromZero:0,     //与零点的时间offset
    _beginTime:0,       //服务器下发的最原始的时间戳
    _endTime:0,         //服务器下发的最原始的时间戳

    ctor:function(jsonData)
    {
        this._beginTime = cs.getZeroSecs();
        this._endTime = cs.getZeroSecs() + 24 * 60 * 60;
        if(jsonData)
            this.initFromJson(jsonData);
    },

    initFromJson:function(jsonData)
    {
        var zeroTime = cs.getZeroSecs();

        //与0点的时间差
        var begin = jsonData["begin"];
        var end = jsonData["end"];
        if(begin)
        {
            this._beginFromZero = begin - zeroTime;
            this._beginTime = begin;
        }
        if(end)
        {
            this._endFromZero = end - zeroTime;
            this._endTime = end;
        }

        //cc.log("time=>[" + this.getBeginTimeStr() + " - " + this.getEndTimeStr() +"]");
    }
});

/**
 * @returns {number}
 */
TimeStage.prototype.getEndFromZero = function()
{
    return this._endFromZero;
};

TimeStage.prototype.getBeginFromZero = function()
{
    return this._beginFromZero;
};

TimeStage.prototype.getBeginTime = function()
{
    return cs.getZeroSecs() + this._beginFromZero;
};

TimeStage.prototype.getEndTime = function()
{
    return cs.getZeroSecs() + this._endFromZero;
};

TimeStage.prototype.getOriginBeginTime = function()
{
    return this._beginTime;
};

TimeStage.prototype.getOriginEndTime = function()
{
    return this._endTime;
};

/**
 * 判断时间段在当天是否合法
 * @param {Number} [curSecs]
 * @returns {Boolean}
 */
TimeStage.prototype.isValidInDay = function(curSecs)
{
    var now = cs.getDate();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);

    var zeroTime = parseInt(now.getTime()/1000);
    var curSecs = curSecs || cs.getCurSecs();
    var curFromZero = curSecs - zeroTime;
    if(curFromZero >= this._beginFromZero && curFromZero <= (this._endFromZero+1))    //浮动误差 一秒，适应服务器零点只能配23：59：59的情况
        return true;
    else
        return false;
};

/**
 * 用来判断绝对时间
 * @param curSecs
 * @returns {boolean}
 */
TimeStage.prototype.isContaint = function(curSecs){
    var curSecs = curSecs || cs.getCurSecs();
    if(curSecs >= this._beginTime && curSecs <= (this._endTime + 1))
        return true;
    else
        return false;
};