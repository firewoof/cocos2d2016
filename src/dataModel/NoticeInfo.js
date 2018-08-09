/**
 * Created by 玲英 on 2016/11/18.
 */
var NoticeInfo = cc.Class.extend({
    _type:1,
    _nickName:"",
    _message:"",
    _avatarUrl:"",


    //订单的信息
    _direction:0,
    _productId:0,
    _betAmount:0,
    _earnAmount:0,

    ctor:function(jsonData)
    {
        if(jsonData)
            this.initFromJson(jsonData);
    },

    initFromJson:function(jsonData)
    {
        this._type          = ALCommon.getValueWithKey(jsonData, "type", this._type);
        this._nickName      = ALCommon.getValueWithKey(jsonData, "nickName", this._nickName);
        this._message       = ALCommon.getValueWithKey(jsonData, "message", this._message);
        this._avatarUrl     = ALCommon.getValueWithKey(jsonData, "headPhoto", this._avatarUrl);

        this._direction     = ALCommon.getValueWithKey(jsonData, "direction", this._direction);
        this._productId     = ALCommon.getValueWithKey(jsonData, "pid", this._productId);
        this._betAmount     = ALCommon.getValueWithKey(jsonData, "amount", this._betAmount);
        this._earnAmount    = ALCommon.getValueWithKey(jsonData, "countMoney", this._earnAmount);
    }
});

NoticeInfo.TYPE_NORMAL = 1;
NoticeInfo.TYPE_ORDER = 2;
NoticeInfo.TYPE_ORDER_RESULT = 3;

NoticeInfo.prototype.getType = function()
{
    return this._type;
};

NoticeInfo.prototype.getRichStr = function()
{
    var richStr = "";
    var productName = this.getProductName();    //产品名称
    var nickName = this.getNickName();          //玩家名称
    var directionStr = this.getDirectionStr();  //看涨看跌
    var earnAmount = this._earnAmount;
    var betAmount = this._betAmount;

    //下单
    if(this._type == NoticeInfo.TYPE_ORDER_RESULT) {
        richStr = cc.formatStr(LocalString.getString("WORLD_MESSAGE_WIN"), nickName, productName, directionStr, earnAmount, LocalString.getString("YUAN"));
    }else{
        richStr = cc.formatStr("<l c=c5f0ab>%s</l>", this._message);
    }

    return richStr;
};

NoticeInfo.prototype.getNickName = function()
{
    return this._nickName;
};

NoticeInfo.prototype.getAvatarUrl = function()
{
    return this._avatarUrl;
};

NoticeInfo.prototype.getMessage = function()
{
    return this._message;
};

NoticeInfo.prototype.getDirection = function()
{
    return this._direction;
};

NoticeInfo.prototype.getDirectionStr = function()
{
    var str = "";
    if(this._direction > 0){
        str = LocalString.getString("BULLISH");
    }else{
        str = LocalString.getString("BEARISH");
    }
    return str;
};

NoticeInfo.prototype.getProductName = function()
{
    var productInfo = Player.getInstance().getProductById(this._productId);
    if(productInfo){
        return productInfo.getName();
    }
    return "";
};

NoticeInfo.prototype.getProductId = function()
{
    return this._productId;
};

NoticeInfo.prototype.getBetAmount = function()
{
    return this._betAmount;
};

NoticeInfo.prototype.getEarnAmount = function()
{
    return this._earnAmount;
};