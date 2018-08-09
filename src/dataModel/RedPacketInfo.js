/**
 * Created by Administrator on 2016/12/21.
 */

var RedPacketInfo = cc.Class.extend({
    //_Avatar: undefined, //头像组件
    _strTime: "00.00.00",  //抢红包的时间
    _userName: "name", //用户名字
    _money: "100", //抢到的金钱数量
    _timeStamp: 0, //天

    ctor:function(jsonData) {
        if(jsonData)
            this.initFromJson(jsonData);
    },

    initFromJson:function(jsonData) {
        //this._Avatar = ALCommon.getValueWithKey(jsonData, "Avatar", this._Avatar);
        this._strTime = ALCommon.getValueWithKey(jsonData, "strTime", this._strTime);
        this._userName = ALCommon.getValueWithKey(jsonData, "userName", this._userName);
        this._money = ALCommon.getValueWithKey(jsonData, "money",  this._money);
        this._timeStamp = ALCommon.getValueWithKey(jsonData, "timeStamp",  this._timeStamp);
    }
});

/**
 *
 * @returns {*}
 */
RedPacketInfo.prototype.getAvatarDt = function(){
    return this._Avatar;
};

/**
 *
 * @returns {string}
 */
RedPacketInfo.prototype.getStrTimeDt = function(){
    return this._strTime;
};

/**
 *
 * @returns {string}
 */
RedPacketInfo.prototype.getUserNameDt = function(){
    return this._userName;
};

/**
 *
 * @returns {string}
 */
RedPacketInfo.prototype.getMoneyLabelDt = function(){
    return this._money;
};

/**
 *
 * @returns {string}
 */
RedPacketInfo.prototype.getTimestamp = function(){
    return this._timeStamp;
};

/**
 *
 * @param Avatar
 */
RedPacketInfo.prototype.setAvatarDt = function(Avatar){
    this._Avatar = Avatar;
};

/**
 *
 * @param strTime
 */
RedPacketInfo.prototype.setStrTimeDt = function(strTime){
    this._strTime = strTime;
};

/**
 *
 * @param userName
 */
RedPacketInfo.prototype.setUserNameDt = function(userName){
    this._userName = userName;
};

/**
 *
 * @param moneyLabel
 */
RedPacketInfo.prototype.setMoneyLabelDt = function(moneyLabel){
  this._money = moneyLabel;
};

/**
 *
 * @param Day
 */
RedPacketInfo.prototype.setTimestamp = function(timestamp){
    this._timestamp = timestamp;
}



