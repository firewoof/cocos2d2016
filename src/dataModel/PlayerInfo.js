/**
 * Created by Administrator on 2016/5/20.
 */

/**
 * 玩家数据
 * @type {Function}
 */
var SimplePlayer = cc.Class.extend({
    _id:-1,
    _level:1,               //等级
    _nickName:"",           //昵称
    _monthWin:0,            //月盈利金额
    _isVip:false,           //是否vip
    _winRate:0,             //周胜率
    _avatarUrl:"",          //头像url地址,
    _weekWin:0,             //周盈利金额,
    _totalWin:0,            //总盈利金额
    _idFlag:"",             //身份唯一标识(不同于id)
    _showId:"",             //头像弹出显示唯一id
    _role:0,
    _phone:undefined,                      //手机号码
    _realName:undefined,                    //真实姓名

    ctor:function(jsonData)
    {
        if(jsonData)
            this.initFromJson(jsonData);
    },

    initFromJson:function(jsonData)
    {
        this._role = ALCommon.getValueWithKey(jsonData, "role", this._role);
        var baseData = jsonData["base"];
        if(baseData){
            this._avatarUrl = ALCommon.getValueWithKey(baseData, "headPhoto", this._avatarUrl);
            this._id        = ALCommon.getValueWithKey(baseData, "id", this._id);
            this._nickName  = ALCommon.getValueWithKey(baseData, "nickName", this._nickName);
            this._idFlag    = ALCommon.getValueWithKey(baseData, "idFlag", this._idFlag);
            this._showId    = ALCommon.getValueWithKey(baseData, "showId", this._showId);
            this._phone     = ALCommon.getValueWithKey(baseData, "phone", this._phone);
            this._realName  = ALCommon.getValueWithKey(baseData, "realName", this._realName);
        }

        var statusData = jsonData["stat"];
        if(statusData){
            this._level     = ALCommon.getValueWithKey(statusData, "grade", this._level);
            this._isVip     = ALCommon.getValueWithKey(statusData, "isVip", this._isVip);
            this._winRate   = ALCommon.getValueWithKey(statusData, "winRate", this._winRate);
            this._monthWin  = ALCommon.getValueWithKey(statusData, "monthWin", this._monthWin);
            this._winRate   = ALCommon.getValueWithKey(statusData, "winRate", this._winRate);
            this._weekWin   = ALCommon.getValueWithKey(statusData, "weekWin", this._weekWin);
            this._totalWin  = ALCommon.getValueWithKey(statusData, "totalWin", this._totalWin);
        }
    }
});

/**
 * @returns {Number}
 */
SimplePlayer.prototype.getLevel = function() {
    return this._level;
};

SimplePlayer.prototype.getRole = function() {
    return this._role;
};

/**
 * @returns {String}
 */
SimplePlayer.prototype.getNickName = function() {
    return this._nickName;
};

SimplePlayer.prototype.setNickName = function(value) {
    this._nickName = value;
};

SimplePlayer.prototype.setRole = function(role) {
    this._role = role;
};

/**
 * @returns {Number}
 */
SimplePlayer.prototype.getMonthWin = function() {
    return this._monthWin;
};

/**
 * @returns {Number}
 */
SimplePlayer.prototype.getWeekWin = function() {
    return this._weekWin;
};

/**
 * @returns {Number}
 */
SimplePlayer.prototype.getTotalWin = function() {
    return this._totalWin;
};

/**
 * @returns {Boolean}
 */
SimplePlayer.prototype.isVip = function() {
    return this._isVip;
};

/**
 * @returns {Number}
 */
SimplePlayer.prototype.getWinRate = function() {
    return this._winRate;
};

/**
 * @returns {String}
 */
SimplePlayer.prototype.getAvatarUrl = function() {
    return this._avatarUrl;
};

SimplePlayer.prototype.setAvatarUrl = function(value) {
    this._avatarUrl = value;
};

SimplePlayer.prototype.getAvatarSrcName = function() {
    return cs.NativeTool.stringByMD5(this._avatarUrl);
};

SimplePlayer.prototype.getId = function() {
    return this._id;
};

SimplePlayer.prototype.getIdFlag = function() {
    return this._idFlag;
};

SimplePlayer.prototype.getShowId = function() {
    return this._showId;
};

SimplePlayer.prototype.getPhone = function() {
    return this._phone;
};

SimplePlayer.prototype.isExistsRealNameAndPhone = function() {
    return this._phone && this._phone!="" && this._realName && this._realName != "";
};

SimplePlayer.prototype.setPhone = function(value) {
    this._phone = value;
};

SimplePlayer.prototype.getRealName = function() {
    return this._realName;
};

SimplePlayer.prototype.setRealName = function(value) {
    this._realName = value;
};

/**
 * 玩家数据
 */
var Player = SimplePlayer.extend({

    //account
    _accountId:0,
    _balance:0,
    _freezeMoney:0,
    _mallCoin:0,
    _status:1,
    _testCoin:0,

    //stat
    _channelId:0,
    _flowerCount:0,
    _highestWin:0,
    _influence:0,
    _loseRate:0,
    _shitCount:0,
    _totalTrade:0,
    _totalWin:0,
    _tradeCount:0,
    _winCount:0,
    _winRank:"",
    _givenCount:0,
    _highestDayWin:0,
    _weekRanking:"",

    // 产品相关
    _productArray: undefined,               //所有产品
    _focusedProductIdArray: undefined,      //关注的产品id
    _lastSelectedProductId: undefined,      //最近使用的
    _lastBetAmount:0,                       //最近一次下单的金额
    _quoteDataCache:undefined,              //缓存的行情数据(){["t":1000, "p":1.10255]}....(大概8分钟的数据，每隔一段时间取最新的固化一次)
    _kLineDataMap:undefined,               //每个品种的行情数据池（>24小时的池，不会固化下来）
    _kLineGroupMap:undefined,               //每个品种的蜡烛图数据
    _curDayBetArray:undefined,              //当天的所有订单
    _curDaySmBetArray:undefined,            //当天所有模拟单
    _curProductId:100001,

    _smPositionCount:0,                     //模拟场持仓数
    _positionCount:0,                       //正式场持仓数

    _roomIdList:undefined,                  //所加入的房间(推送维护)
    _roomId:undefined,                      //当前所在的id
    _roomInfo:undefined,                    //当前房间信息(与roomId对应，roomId决定roomInfo数据)

    _invitationCode:null,

    // 登录登出状态
    _online: false,

    ctor:function(jsonData)
    {
        this._isInit = false;
        this._productArray = [];
        this._focusedProductIdArray = [];
        this._productIdMap = {};        //产品id->productInfo 的映射
        this._productTypeArray = [];    //[ {"tid":10086, "name":指数}， {"tid":10087, "name":股票}]
        this._quoteDataCache = {};
        this._kLineDataMap = {};       //产品的数据池
        this._kLineGroupMap = {};
        this._curDayBetArray = [];
        this._curDaySmBetArray = [];    //模拟订单
        this._redDotMap = {};
        this._roomIdList = [];
        this._roomIdMap = {};

        if(jsonData)
            this.initFromJson(jsonData);
    },

    initFromJson:function(jsonData)
    {
        this._isInit = true;

        var oldNickName = this._nickName;
        var oldAvatarUrl = this._avatarUrl;
        this._super(jsonData);

        //负责用户基础信息的刷新通知
        if(this._nickName != oldNickName) {
            cc.eventManager.dispatchCustomEvent(NOTIFY_REFRESH_USER_NICK_NAME);
        }

        //
        this._invitationCode = ALCommon.getValueWithKey(jsonData, "invitedCode", this._invitationCode);

        this._roomInfo = ALCommon.getClassObjectWithKey(jsonData, "room", this._roomInfo, RoomModel);

        var accountData = jsonData["account"];
        if(accountData){
            this._accountId     = ALCommon.getValueWithKey(accountData, "accountId", this._accountId);
            //this._balance       = ALCommon.getValueWithKey(accountData, "balance", this._balance);
            this._freezeMoney   = ALCommon.getValueWithKey(accountData, "freezeMoney", this._freezeMoney);
            this._mallCoin      = ALCommon.getValueWithKey(accountData, "mallCoin", this._mallCoin);
            this._status        = ALCommon.getValueWithKey(accountData, "status", this._status);
            //this._testCoin      = ALCommon.getValueWithKey(accountData, "testCoin", this._testCoin);
            var newTestCoin = accountData["testCoin"];
            var newBalance = accountData["balance"];
            if(newTestCoin != undefined && newTestCoin != this._testCoin) {
                this._testCoin = newTestCoin;
                cc.eventManager.dispatchCustomEvent(NOTIFY_REFRESH_USER_TEST_COIN);
                cc.log("source send NOTIFY_REFRESH_USER_TEST_COIN");
            }
            if(newBalance != undefined && newBalance != this._balance){
                this._balance = newBalance;
                cc.eventManager.dispatchCustomEvent(NOTIFY_REFRESH_USER_BALANCE);
                cc.log("source send NOTIFY_REFRESH_USER_BALANCE");
            }
        }

        var statusData = jsonData["stat"];
        if(statusData){
            this._channelId     = ALCommon.getValueWithKey(statusData, "channelId", this._channelId);
            this._flowerCount   = ALCommon.getValueWithKey(statusData, "flowerCount", this._flowerCount);
            this._highestWin    = ALCommon.getValueWithKey(statusData, "highestWin", this._highestWin);
            this._influence     = ALCommon.getValueWithKey(statusData, "influence", this._influence);
            this._loseRate      = ALCommon.getValueWithKey(statusData, "loseRate", this._loseRate);
            this._shitCount     = ALCommon.getValueWithKey(statusData, "shitCount", this._shitCount);
            this._totalTrade    = ALCommon.getValueWithKey(statusData, "totalTrade", this._totalTrade);
            this._totalWin      = ALCommon.getValueWithKey(statusData, "totalWin", this._totalWin);
            this._tradeCount    = ALCommon.getValueWithKey(statusData, "tradeCount", this._tradeCount);
            this._winCount      = ALCommon.getValueWithKey(statusData, "winCount", this._winCount);
            this._winRank       = ALCommon.getValueWithKey(statusData, "winRanking", this._winRank);
            this._givenCount    = ALCommon.getValueWithKey(statusData, "givenCount", this._givenCount);
            this._highestDayWin = ALCommon.getValueWithKey(statusData, "highestDayWin", this._highestDayWin);
            this._weekRanking   = ALCommon.getValueWithKey(statusData, "weekRanking", this._weekRanking);
        }

    }

});

Player.reset = function(){
    Player._instance = undefined;
};

/**
 * @returns {Player | SimplePlayer}
 */
Player.getInstance = function()
{
    if(!Player._instance)
    {
        cc.log("============new Player instance=========================");
        Player._instance = new Player();
    }
    return Player._instance;
};

Player.prototype.getInvitationCode = function()
{
    return this._invitationCode;
};

/**
 * @returns {ProductInfo}
 */
Player.prototype.getCurProductInfo = function()
{
    return this._productIdMap[this._curProductId];
};

/**
 *  {LineChartInfo}
 * @returns {*}
 */
Player.prototype.getCurLineData = function()
{
    return this.getLineDataById(this._curProductId);
};

Player.prototype.getSmPositionCount = function()
{
    return this._smPositionCount;
};

Player.prototype.getPositionCount = function()
{
    return this._positionCount;
};

Player.prototype.setSmPositionCount = function(value)
{
    this._smPositionCount = value;
};

Player.prototype.setPositionCount = function(value)
{
    this._positionCount = value;
};

Player.prototype.getCurLineData = function()
{
    return this.getLineDataById(this._curProductId);
};

Player.prototype.setCurProductId = function(value)
{
    this._curProductId = value;
};

Player.prototype.isInit = function()
{
  return this._isInit;
};

/**
 * @returns {number}
 */
Player.prototype.getTestCoin = function() {
    return this._testCoin;
};

Player.prototype.setTestCoin = function(value) {
    this._testCoin = value;
};

Player.prototype.setRoomId = function(roomId){
    this._roomInfo.setRoomId(roomId);
};

Player.prototype.getRoomId = function(){
  return  this._roomInfo.getRoomId();
};

Player.prototype.getRoomInfo = function(){
    return  this._roomInfo;
};

Player.prototype.getRoomList= function(){
  return  this._roomIdList;
};

Player.prototype.setRoomList = function(roomList){
    this._roomIdList = roomList || [];
    this._roomIdMap = {};
    for(var i = 0; i < this._roomIdList.length; i++){
        this._roomIdMap[roomList[i]] = roomList[i];
    }
    return this._roomIdList;
};

Player.prototype.isRoomJoined = function(roomId){
    return this._roomIdMap[roomId] != undefined;
};

/**
 * 初始化产品列表
 * @param jsonData
 */
Player.prototype.initProductList = function(productGroupList)
{
    if(!productGroupList){
        return;
    }

    //玩法
    for(var t = 0; t < productGroupList.length; t++)
    {
        var groupData = productGroupList[t];
        var isTypeExist = false;
        for(var k = 0; k < this._productTypeArray.length; k++)
        {
            if(this._productTypeArray[k].optionType == groupData.optionType)
            {
                isTypeExist = true;
                break;
            }
        }
        if(!isTypeExist)
            this._productTypeArray.push({"optionType": groupData["optionType"], "name": groupData["optionTypeCn"]});

        //产品列表
        var optionListData = groupData["optionList"];
        for(var i = 0; i < optionListData.length; i++)
        {
            var productData = optionListData[i];
            if(productData == undefined)
                continue;
            var productId = productData["id"];
            var productInfo = this._productIdMap[productId];
            if(productInfo != undefined)
            {
                productInfo.initFromJson(productData);
            }
            else
            {
                productInfo = new ProductInfo(productData);
                this._productIdMap[productId] = productInfo;
                this._productArray.push(productInfo);
            }
        }
    }
};

Player.prototype.initRedDot = function(redDotList)
{
    if(this.isLimited()){
        return;
    }
    for(var i = 0; i < redDotList.length; i++){
        var redDotData = redDotList[i];
        if(redDotData && redDotData["type"] != undefined){
            this._redDotMap[redDotData["type"]] = redDotData["count"];
        }
        cc.eventManager.dispatchCustomEvent(NOTIFY_RED_DOT,redDotData["type"]);
    }
};

Player.prototype.getRedDotSum = function(){
    var sum = 0;
    for(var i in this._redDotMap){
       sum = this._redDotMap[i] + sum;
    }
    return sum;
};

Player.prototype.getRedDotNumByType = function(type)
{
    //return this._redDotMap[type];
    var value = this._redDotMap[type];
    return value == undefined ? 0 : value;
};

Player.prototype.addRedDotNumByType = function(type, count)
{
    if(this.isLimited()){
        return;
    }
    cc.log("this._redDotMap[type]::",JSON.stringify(this._redDotMap[type]));

    var originValue = this._redDotMap[type];
    if(originValue != undefined){
        this._redDotMap[type] = originValue + count;
    }else{
        this._redDotMap[type] = count;
    }
    cc.log("红点数量：：",this._redDotMap[type]);
};

Player.prototype.setRedDotNumByType = function(type,num)
{
    this._redDotMap[type] = num;
};


/**
 * @returns {Array}
 */
Player.prototype.getFocusedProductIdArray = function()
{
    return this._focusedProductIdArray;
};

/**
 * 通过产品id来获取productInfo
 * @param id
 * @returns {ProductInfo}
 */
Player.prototype.getProductById = function(id)
{
  return this._productIdMap[id];
};

///**
// * @returns {Array}
// */
//Player.prototype.getBetInfoArray = function()
//{
//    return this._betInfoArray;
//};

/**
 * @returns {Array}
 */
Player.prototype.getProductArray = function()
{
    return this._productArray;
};

/**
 * @returns {Array}
 */
Player.prototype.getProductTypeArray = function()
{
    return this._productTypeArray;
};

/**
 * @returns {Number}
 */
Player.prototype.getAccountId = function() {
    return this._accountId;
};

/**
 * @returns {Number}
 */
Player.prototype.getBalance = function() {
    return this._balance;
};

/**
 * @returns {Number}
 */
Player.prototype.setBalance = function(value) {
    this._balance = value;
};

/**
 * @returns {Number}
 */
Player.prototype.getFreezeMoney = function() {
    return this._freezeMoney;
};

/**
 * @returns {Number}
 */
Player.prototype.getMallCoin = function() {
    return this._mallCoin;
};

/**
 * @returns {Number}
 */
Player.prototype.getStatus = function() {
    return this._status;
};

/**
 * @returns {Number}
 */
Player.prototype.getTestCoin = function() {
    return this._testCoin;
};

/**
 * @returns {Number}
 */
Player.prototype.getChannelId = function() {
    return this._channelId;
};

/**
 * @returns {Number}
 */
Player.prototype.getFlowerCount = function() {
    return this._flowerCount;
};

/**
 * @returns {Number}
 */
Player.prototype.getHighestWin = function() {
    return this._highestWin;
};

/**
 * @returns {Number}
 */
Player.prototype.getInfluence = function() {
    return this._influence;
};

/**
 * @returns {Number}
 */
Player.prototype.getLoseRate = function() {
    return this._loseRate;
};

/**
 * @returns {Number}
 */
Player.prototype.getShitCount = function() {
    return this._shitCount;
};

/**
 * @returns {Number}
 */
Player.prototype.getTotalTrade = function() {
    return this._totalTrade;
};

/**
 * @returns {Number}
 */
Player.prototype.getTotalWin = function() {
    return this._totalWin;
};

/**
 * @returns {Number}
 */
Player.prototype.getTradeCount = function() {
    return this._tradeCount;
};

/**
 * @returns {Number}
 */
Player.prototype.getWinCount = function() {
    return this._winCount;
};

/**
 * @returns {number}
 */
Player.prototype.isGuest = function() {
    return DataPool.isGuestLogin;
};

Player.prototype.isLimited = function()
{
  return (this.isGuest() || !this.getOnline());
};

Player.prototype.getLastSelectedProductId = function() {
    return this._lastSelectedProductId;
};

Player.prototype.setLastSelectedProductId = function(value) {
    this._lastSelectedProductId = value;
};

/**
 * @returns {Number}
 */
Player.prototype.getWinRank = function() {
    return this._winRank;
};

/**
 * @returns {Number}
 */
Player.prototype.getWeekRank = function() {
    return this._weekRanking;
};

/**
 * @returns {Number}
 */
Player.prototype.getGivenCount = function() {
    return this._givenCount;
};

/**
 * @returns {Number}
 */
Player.prototype.getHighestDayWin = function() {
    return this._highestDayWin;
};

Player.prototype.getLastBetAmount = function() {
    return this._lastBetAmount;
};

Player.prototype.setLastBetAmount = function(value) {
    cc.log("setLastBetAmount::", value);
    this._lastBetAmount = value;
};

Player.prototype.getQuoteDataCache = function()
{
    return this._quoteDataCache;
};

Player.prototype.getCurDayBetArray = function()
{
    return this._curDayBetArray;
};

Player.prototype.setCurDayBetArray = function(value)
{
    this._curDayBetArray = value;
};


Player.prototype.getCurDaySmBetArray = function()
{
    return this._curDaySmBetArray;
};

Player.prototype.setCurDaySmBetArray = function(value)
{
    this._curDaySmBetArray = value;
};

/**
 * 得到未结算订单
 * @param productId
 * @param isSimulate
 * @returns {Array}
 */
Player.prototype.getUnSettledOrders= function(productId, isSimulate)
{
    var unSettledOrders = [];
    var betArray = isSimulate == true ? this._curDaySmBetArray : this._curDayBetArray;
    for(var i = 0; i < betArray.length; i++) {
        var betInfo = betArray[i];
        if(betInfo.getProductId() == productId && !betInfo.isSettled()){
            unSettledOrders.push(betInfo);
        }
    }

    return unSettledOrders;
};


Player.prototype.readQuoteDataCache = function()
{
    //var callFunc = function(jsonData, productId){
    //    cc.log("读取行情:", productId);
    //    this._quoteDataCache[productId+""] = jsonData;
    //}.bind(this);
    //
    //var fileNameArray = cs.GameFileUtils.getFileNameListInPath("quoteCache", false);
    ////cc.log("读取行情 fileNameArray:"+ fileNameArray.length);
    //for(var i = 0; i < fileNameArray.length; i++)
    //{
    //    var fileName = fileNameArray[i];
    //    var productId = parseInt(fileName.replace(".json", ""));
    //    if(!cc.isNumber(productId))
    //        continue;
    //    //cc.log("读取行情:"+ productId + " fileName::", fileName);
    //    cc.loader.loadJson(jsb.fileUtils.getWritablePath() + "quoteCache/" + fileName,function(err,jsonData){
    //        try{
    //            if(!err){
    //                callFunc(jsonData, productId);
    //            }else{
    //                cc.log(err);
    //                //callFunc(undefined, err);
    //            }
    //        }catch(e) {
    //            cc.log(e.stack);
    //        }
    //    });
    //}
};

/**
 * 存储最新n分钟行情数据
 * @param {Number} [productId]
 */
Player.prototype.saveQuoteData = function(productId)
{
    if(productId) {
        var quoteData = this._quoteDataCache[productId];
        if(quoteData)
            cs.writeJsonToFile("quoteCache/"+productId+".json", quoteData);
    }else{
        for(var productId in this._quoteDataCache){
            var quoteData = this._quoteDataCache[productId];
            cs.writeJsonToFile("quoteCache/"+productId+".json", quoteData);
        }
    }
    cc.log("缓存的行情保存到本地.....", TimeHelper.formatSecs());
};

/**
 * 读取历史订单数据
 */
Player.prototype.readBetData = function() {
    //24小时之内的订单
    var zeroTime = cs.getCurSecs() - 24 * 60 * 60;
    var callFunc = function(betDataArray)
    {
        G_collectLog("读取本地保存的正式订单: ", betDataArray.length);
        cc.log("读取本地保存的正式订单: ", betDataArray.length);
        if(!cc.isArray(betDataArray))
        {
            cc.log("异常::", betDataArray);
            return;
        }
        for(var i = betDataArray.length - 1; i >= 0; i--) {
            var betInfo = new BetInfo(betDataArray[i]);
            //小于当天凌晨的订单数据不保存
            if(betInfo.getBetTime() < zeroTime)
                continue;
            this._curDayBetArray.push(betInfo);
        }
        cc.log("this._curDayBetArray::", this._curDayBetArray.length);
        //如果文件读取的今日订单为空 则请求一次服务器, 再保存一次(这是为了保证用户)
        if(this._curDayBetArray.length == 0) {
            G_collectLog("读取本地保存的有效正式订单为0 尝试请求服务器:");
            cc.log("读取本地保存的有效正式订单为0 尝试请求服务器");
            var isSimulate = false;
            this.loadAllBetData(isSimulate);
        }
    }.bind(this);

    //如果没有文件
    var fileName = "betData_%s.json";
    fileName = cc.formatStr(fileName, this.getId());
    var isFileExist = jsb.fileUtils.isFileExist(jsb.fileUtils.getWritablePath() + fileName);
    if(!isFileExist) {
        cs.writeJsonToFile(fileName, this._curDayBetArray);
    }

    //读取正常交易订单
    cs.readJsonFromFile(fileName, callFunc);

    //================读取模拟单====================
    var callFunc = function(betDataArray){
        if(!(betDataArray instanceof Array))
            return;
        cc.log("读取本地保存的模拟订单: ", betDataArray.length);
        for(var i = betDataArray.length - 1; i >= 0 ; i--) {
            var betInfo = new BetInfo(betDataArray[i]);
            //小于当天凌晨的订单数据不保存
            if(betInfo.getBetTime() < zeroTime)
                continue;
            this._curDaySmBetArray.push(betInfo);
        }

        //如果文件读取的今日订单为空 则请求一次服务器, 再保存一次(这是为了保证用户)
        if(this._curDaySmBetArray.length == 0) {
            cc.log("读取本地保存的有效模拟订单为0 尝试请求服务器");
            var isSimulate = true;
            this.loadAllBetData(isSimulate);
        }
    }.bind(this);

    //如果没有文件
    var fileName = "betSmData_%s.json";
    if(this.isGuest()){
        fileName = cc.formatStr(fileName, this.getId() + "_guest");     //游客到模拟单(因为服务器不能保证 游客的id 跟 正式用户id唯一)
    }else{
        fileName = cc.formatStr(fileName, this.getId());
    }

    var isFileExist = jsb.fileUtils.isFileExist(jsb.fileUtils.getWritablePath() + fileName);
    if(!isFileExist) {
        cs.writeJsonToFile(fileName, this._curDaySmBetArray);
    }

    //读取正常交易订单
    cs.readJsonFromFile(fileName, callFunc);
};


Player.prototype.loadAllBetData = function(isSimulateTrade){
    //受限状态就不查订单数了
    if(this.isLimited()){
        return;
    }
    var responseCallBack = function(responseData)
    {
        cc.log("load 返回::", TimeHelper.formatSecs());
        var listDataArray = responseData["list"];
        cc.log("load 订单返回数:: ", listDataArray.length);
        var betInfoArray = [];
        for(var i = 0; i < listDataArray.length; i++)
        {
            var betData = listDataArray[i];
            var betInfo = new BetInfo(betData);
            betInfo.setSimulateTrade(isSimulateTrade);
            betInfoArray.push(betInfo);
        }
        if(isSimulateTrade)
        {
            this.setCurDaySmBetArray(betInfoArray);
        }else{
            this.setCurDayBetArray(betInfoArray);
        }
        //保存
        this.saveBetData(isSimulateTrade);
    }.bind(this);

    var pageSize = 50;
    HttpManager.requestCurDayRecord(responseCallBack, isSimulateTrade, pageSize);
};

//本地保存的最大的订单数
var MAX_SAVE_BET_NUM = 50;
Player.prototype.saveBetModule = function(isSimulateTrade, fileName)
{
    var zeroTime = cs.getCurSecs() - 24 * 60 * 60;
    //最多保存n条
    var maxSave = MAX_SAVE_BET_NUM;

    var betArray = isSimulateTrade ? this._curDaySmBetArray : this._curDayBetArray;
    var counter = 0;
    var betDataArray = [];

    //内存最多只保存 1.5倍 * maxSave数的betInfo
    if(betArray.length > 1.5 * maxSave){
        betArray.splice(maxSave, betArray.length - maxSave);
    }

    var len = betArray.length;
    for(var i = 0; i < len; i++) {
        var betInfo = betArray[i];
        if(!betInfo){
            cc.log("i::", i);
            cc.log("betInfo is null, previous betInfo::", TimeHelper.formatSecs(this._curDayBetArray[i+1].getBetTime()));
            continue;
        }
        //小于当天凌晨的订单数据不保存
        if(betInfo.getBetTime() < zeroTime)
            continue;
        if(counter >= maxSave)
            break;
        var jsonData = betInfo.toJsonData();
        betDataArray.push(jsonData);
        counter++;
    }
    //反转
    betDataArray.reverse();
    //保存到本地
    if(betDataArray.length > 0)
    {
        cc.log("保存当天正式订单到本地:"+ fileName + " length:" + betDataArray.length);
        cs.writeJsonToFile(fileName, betDataArray);
    }
};

Player.prototype.saveBetData = function(isSimulateTrade) {
    //================保存正式场订单====================
    if(!isSimulateTrade){
        //保存到本地
        var fileName = "betData_%s.json";
        fileName = cc.formatStr(fileName, this.getId());
        cc.log("fileName::", fileName);
        this.saveBetModule(isSimulateTrade, fileName);
    }else{
        //保存到本地
        var fileName = "betSmData_%s.json";
        if(this.isGuest()){
            fileName = cc.formatStr(fileName, this.getId() + "_guest");     //游客的模拟单(因为服务器不能保证游客的id跟正式用户id唯一)
        }else{
            fileName = cc.formatStr(fileName, this.getId());
        }
        this.saveBetModule(isSimulateTrade, fileName);
    }
};

Player.prototype.getNumOfUnsettleOrders = function(isSimulate) {
    var betArray = this._curDayBetArray;
    if(isSimulate)
        betArray = this._curDaySmBetArray;

    var num = 0;
    var curSecs = cs.getCurSecs();
    for(var i = 0; i < betArray.length; i++){
        var betInfo = betArray[i];
        if(betInfo.isSettled() || betInfo.getTradeSettleTime() <= curSecs)
            break;
        else
            num++;
    }
    return num;
};

/**
 * @param {Number} [productId]
 */
Player.prototype.getLineDataById = function(productId){
    var lineChartInfo = null;
    if(productId) {
        var productInfo = this.getProductById(productId);
        //可能产品数据还没下来
        if(!productInfo)
            return null;
        var quoteData = this._kLineDataMap[productId];
        if (!quoteData) {
            lineChartInfo = this._kLineDataMap[productId] = new LineChartInfo();
            lineChartInfo._productInfo = productInfo;
            cc.log("新建数据池：", lineChartInfo.getProductInfo().getName());
        }else{
            lineChartInfo = this._kLineDataMap[productId];
        }
    }
    return lineChartInfo;
};

/**
 * @param {Number} [productId]
 */
Player.prototype.getKLineGroupById = function(productId){
    var lineGroup = null;
    if(productId) {
        var productInfo = this.getProductById(productId);
        //可能产品数据还没下来
        if(!productInfo)
            return null;
        var quoteData = this._kLineGroupMap[productId];
        if (!quoteData) {
            lineGroup = this._kLineGroupMap[productId] = new KLineGroupInfo(productInfo);
            cc.log("新建数据池：", lineGroup.getProductInfo().getName());
        }else{
            lineGroup = this._kLineGroupMap[productId];
        }
    }
    return lineGroup;
};

Player.prototype.getKlineData = function(productId, type)
{
    var klineGroup = this.getKLineGroupById(productId);
    return klineGroup.getLineInfoByType(type)
};

/**
 * @param {Bool}
 */
Player.prototype.setOnline = function(b) {
    this._online = (b == 1);
};

Player.prototype.getOnline = function() {
    return this._online;
};

/**
 * 退出登录 需要清理的敏感数据
 */
Player.prototype.cleanTradeData = function()
{
    cc.log("退出登录人物数据清除");
    this._curDayBetArray = [];
    this._curDaySmBetArray = [];
    this._positionCount = 0;
    this._smPositionCount = 0;
    this._redDotMap = [];
    //清除后保存一次订单信息
    this.saveBetData();

    //通知持仓数更新
    cc.eventManager.dispatchCustomEvent(NOTIFY_POSITION_CHANGES);
    cc.eventManager.dispatchCustomEvent(NOTIFY_RED_DOT);
    cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_STATE_CHANGE);
};

