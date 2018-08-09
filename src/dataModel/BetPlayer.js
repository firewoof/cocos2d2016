/**
 * Created by 玲英 on 2016/8/15.
 */
var BetPlayer = SimplePlayer.extend({
    _isRequesting:false,    //正在请求结果（辅助变量，防止多线程请求多次发送）
    _maxRequestCounter:3,   //到点请求结算结果最多请求几次
    _betArray:undefined,
    _productId:-1,
    //_associ

    //自定义数据
    _betMap:undefined,

    ctor:function(jsonData)
    {
        this._maxRequestCounter = 3;
        this._betArray = [];
        this._betMap = {};
        if(jsonData)
            this.initFromJson(jsonData);
    },

    initFromJson:function(jsonData)
    {
        this._super(jsonData);

        this._betArray = [];
        this._betMap = {};
        this._betArray          = ALCommon.getArrayWithKey(jsonData, "orderList", this._betArray, BetInfo);

        //排序最新下的单放后面
        if(this._betArray.length > 0){
            this._betArray.sort(function(a, b){
                var aBetTime = a.getBetTime();
                var bBetTime = b.getBetTime();
                return bBetTime < aBetTime;
            });

            //init map
            for(var i = 0; i < this._betArray.length; i++){
                var betInfo = this._betArray[i];
                this._betMap[betInfo.getOrderId()] = betInfo;
            }
        }
    }
});

BetPlayer.prototype.getMaxRequestCounter = function()
{
    return this._maxRequestCounter;
};

BetPlayer.prototype.getBetArray = function()
{
    return this._betArray;
};

BetPlayer.prototype.getProductId = function()
{
    return this._productId;
};

BetPlayer.prototype.setProductId = function(productId)
{
    this._productId = productId;
};

BetPlayer.prototype.getBetById = function(id)
{
    return this._betMap[id];
};

BetPlayer.prototype.appendOrder = function(betInfo)
{
    //剔除已结算的订单
    for(var i = 0; i < this._betArray.length; i++){
        var tempInfo = this._betArray[i];
        if(tempInfo.isSettled()){
            this._betMap[tempInfo.getOrderId()] = undefined;
            this._betArray.splice(i, 1);
            i--;
        }
    }
    //现在不允许超过40单 20的缓冲
    if(this._betArray.length > 60) {
        var delNum = this._betArray.length - 40;
        for(var i = 0; i < delNum; i++){
            var tempInfo = this._betArray[i];
            this._betMap[tempInfo.getOrderId()] = undefined;
        }
        this._betArray.splice(0, delNum);
        cc.log("超过60单未结算....强制剔除前"+delNum+"单.");
    }

    this._betArray.push(betInfo);
    this._betMap[betInfo.getOrderId()] = betInfo;
    //cc.log("添加订单后　betMap::", JSON.stringify(this._betMap));
    var ids =  "";
    for(var id in this._betMap){
        if(this._betMap[id]){
            ids += id +","
        }
    }
    cc.log("添加订单后　betMap::"+ids);
};

BetPlayer.prototype.printBetMap = function()
{
    var ids =  "";
    for(var id in this._betMap){
        if(this._betMap[id]){
            ids += id +","
        }
    }
    cc.log(this.getNickName() +"　betMap::"+ids);
};

BetPlayer.prototype.getLatestUnSettledBet = function(productId)
{
    for(var i = this._betArray.length - 1; i >= 0; i--){
        var betInfo = this._betArray[i];
        if(betInfo && !betInfo.isSettled() && betInfo.getProductId() == productId){
            return betInfo;
        }
    }
};

BetPlayer.prototype.maxRequestCounterReduce = function()
{
    this._maxRequestCounter--;
};
