
/**
 * Created by Administrator on 2016/6/13.
 */
var BetInfo = cc.Class.extend({
    _betTime:0,         //投注时间
    _betAmount:0,       //投注金额
    _betQuotePrice:0,   //下单时的行情价格
    _settleQuotePrice:0,//结算时的行情价格
    _tradeSettleTime:0,    //交易结束时间
    _index:0,               //
    _isBullish:false,
    _odds:0,            //赔率
    _orderId:-1,
    _earnAmount:0,  //盈利额(包括本金)
    _result:100,     //输还是赢  0输 1赢 2是平   100表示还未结算
    _productId:-1,
    _isSimulateTrade:false,  //是否是模拟币的下单
    _touchOffset:0,

    _isRequesting:false,    //正在请求结果（辅助变量，防止多线程请求多次发送）
    _maxRequestCounter:3,   //到点请求结算结果最多请求几次

   ctor:function(jsonData)
   {
       this._result = BetInfo.RESULT_TYPE_UN_SETTLE;
       if(jsonData)
        this.initFromJson(jsonData);
   },

    initFromJson:function(jsonData)
    {
        this._betQuotePrice     = ALCommon.getValueWithKey(jsonData, "beginPrice", this._betQuotePrice);
        this._settleQuotePrice  = ALCommon.getValueWithKey(jsonData, "endPrice", this._settleQuotePrice);
        this._isBullish         = ALCommon.getValueWithKey(jsonData, "direction", this._isBullish);
        this._tradeSettleTime   = ALCommon.getValueWithKey(jsonData, "countTime", this._tradeSettleTime);
        this._betTime           = ALCommon.getValueWithKey(jsonData, "tradeTime", this._betTime);
        this._productId         = ALCommon.getValueWithKey(jsonData, "pid", this._productId);
        this._result            = ALCommon.getValueWithKey(jsonData, "result", this._result);
        this._odds              = ALCommon.getValueWithKey(jsonData, "totalLoseRate", this._odds);
        this._orderId           = ALCommon.getValueWithKey(jsonData, "orderId", this._orderId);
        this._betAmount         = ALCommon.getValueWithKey(jsonData, "amount", this._betAmount);
        this._earnAmount        = ALCommon.getValueWithKey(jsonData, "countMoney", this._earnAmount);
        this._cstat             = ALCommon.getValueWithKey(jsonData, "cstat", this._cstat);
        this._touchOffset       = ALCommon.getValueWithKey(jsonData, "touchOffset", this._touchOffset);

        this._isSimulateTrade   = ALCommon.getValueWithKey(jsonData, "isSimulateTrade", this._isSimulateTrade);
    }
});

BetInfo.RESULT_TYPE_LOST = 0;
BetInfo.RESULT_TYPE_WIN = 1;
BetInfo.RESULT_TYPE_EQUAL = 2;
BetInfo.RESULT_TYPE_UN_SETTLE = 100;    //未结算

BetInfo.prototype.toJsonData = function()
{
    var jsonData =
    {
        beginPrice: this._betQuotePrice,
        endPrice: this._settleQuotePrice,
        direction: this._isBullish,
        countTime: this._tradeSettleTime,
        tradeTime: this._betTime,
        pid: this._productId,
        result: this._result,
        totalLoseRate: this._odds,
        touchOffset: this._touchOffset,
        orderId: this._orderId,
        amount: this._betAmount,
        countMoney: this._earnAmount,
        isSimulateTrade: this._isSimulateTrade
    };

    return jsonData;
};

BetInfo.prototype.getMaxRequestCounter = function()
{
    return this._maxRequestCounter;
};

BetInfo.prototype.maxRequestCounterReduce = function()
{
    this._maxRequestCounter--;
};

BetInfo.prototype.isWin = function()
{
    return this._result == BetInfo.RESULT_TYPE_WIN;
};

BetInfo.prototype.isLost = function()
{
    return this._result == BetInfo.RESULT_TYPE_LOST;
};

BetInfo.prototype.isEqual = function()
{
    return this._result == BetInfo.RESULT_TYPE_EQUAL;
};

BetInfo.prototype.getBetTime = function()
{
    return this._betTime;
};

BetInfo.prototype.getCstat = function()
{
    return this._cstat;
};

BetInfo.prototype.setCstat = function(value)
{
    this._cstat = value;
};

BetInfo.prototype.isRequesting = function()
{
    return this._isRequesting;
};

BetInfo.prototype.setIsRequesting = function(value)
{
    this._isRequesting = value;
};

/**
 * 潜在收益
 * @returns {number}
 */
BetInfo.prototype.getPotentialEarn = function()
{
    return this._betAmount + this._betAmount * this._odds;
};

BetInfo.prototype.getBetQuotePrice = function()
{
    return this._betQuotePrice;
};

BetInfo.prototype.setBetQuotePrice = function(value)
{
    this._betQuotePrice = value;
};

BetInfo.prototype.getSettleQuotePrice = function()
{
    return this._settleQuotePrice;
};

BetInfo.prototype.isSettled = function()
{
    return this._result != BetInfo.RESULT_TYPE_UN_SETTLE;
};

BetInfo.prototype.isSimulateTrade = function()
{
    return this._isSimulateTrade;
};

BetInfo.prototype.setSimulateTrade = function(bool)
{
    var bool = bool == true ? bool : false;
    this._isSimulateTrade = bool;
};

BetInfo.prototype.getEarnAmount = function()
{
    return this._earnAmount;
};

BetInfo.prototype.getProductId = function()
{
    return this._productId;
};

BetInfo.prototype.setProductId = function(value)
{
    this._productId = value;
};

BetInfo.prototype.setEarnAmount = function(value)
{
    this._earnAmount = value;
};

BetInfo.prototype.setResult = function(value)
{
    this._result = value;
};

/**
 * @returns {number}
 */
BetInfo.prototype.getResult = function()
{
    return this._result;
};

BetInfo.prototype.getOrderId = function()
{
    return this._orderId;
};

BetInfo.prototype.setOrderId = function(value)
{
    this._orderId = value;
};

BetInfo.prototype.setOdds = function(value)
{
    this._odds = value;
};

BetInfo.prototype.setBetTime = function(value)
{
    this._betTime = value;
};

BetInfo.prototype.setBetAmount = function(value)
{
    this._betAmount = value;
};

BetInfo.prototype.getBetAmount = function()
{
    return this._betAmount;
};

BetInfo.prototype.getTradeBeginTime = function()
{
    return this._betTime;
};

BetInfo.prototype.getTradeSettleTime = function()
{
    return this._tradeSettleTime;
};

BetInfo.prototype.setTradeSettleTime = function(value)
{
    this._tradeSettleTime = value;
};

/**
 * @returns {number}
 */
BetInfo.prototype.getIndex = function()
{
    return this._index;
};

BetInfo.prototype.setIndex = function(value)
{
    this._index = value;
};

BetInfo.prototype.isBullish = function(value)
{
    return this._isBullish;
};

/**
 * 设置是否看涨
 * @param value
 */
BetInfo.prototype.setIsBullish = function(value)
{
    this._isBullish = value;
};

BetInfo.prototype.getOdds = function()
{
    return this._odds;
};

BetInfo.prototype.getTouchOffset = function()
{
    return  this._touchOffset;
};

BetInfo.prototype.getOptionType = function()
{
    return Player.getInstance().getProductById(this._productId).getOptionType();
};

BetInfo.prototype.isTouchOption = function()
{
    return Player.getInstance().getProductById(this._productId).getOptionType() == ProductInfo.OPTION_TYPE_TOUCH;
};