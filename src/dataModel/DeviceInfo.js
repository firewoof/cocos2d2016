
/**
 * Created by Jony on 2016/8/18.
 */
var DeviceInfoManager = cc.Class.extend({
    _channel:null,
    _invitationCode:null,

    ctor:function()
    {
        this._channel = DEFAULT_CHANNEL;
        if(cc.sys.os == cc.sys.OS_ANDROID )
        {
            var ret = jsb.reflection.callStaticMethod("com/luogu/custom/JavaUtil", "getChannelFromApk", "(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;", "agent", "");
            var splitArray = ret.split('_');
            //note："agent_[channel]_[invitationCode]"
            var channel = splitArray[1];
            var invitationCode = splitArray[2];
            this._channel = channel ? channel : this._channel;
            this._invitationCode = invitationCode ? invitationCode : this._invitationCode;
        }
    }
});

DeviceInfoManager.reset =  function(){
    this._instance = null;
};

/**
 * @returns {DeviceInfoManager}
 */
DeviceInfoManager.getInstance = function()
{
    if(!this._instance)
    {
        //cc.log("============new DeviceInfoManager instance=========================");
        this._instance = new DeviceInfoManager();
    }
    return this._instance;
};

/**
 * @returns {string}
 */
DeviceInfoManager.prototype.getChannel = function()
{
    //return "10000013"; //环球国际招商版
    //return "10000019"; //环球国际业务版
    //return "10000118";
    //return "10000077";
    //return "10000090"; // 全城交易
    //return "10000081"; // 人人交易
    //return "10000114"; // 交易之家
    return this._channel;
};

DeviceInfoManager.prototype.getInvitationCode = function()
{
    return this._invitationCode || Player.getInstance().getInvitationCode();
};

/**
 * @returns {string}
 */
DeviceInfoManager.prototype.getImei = function()
{
    var imeiNum = cc.sys.localStorage.getItem("imei") || "";
    if("" == imeiNum)
    {
        if( cc.sys.os == cc.sys.OS_ANDROID ) {
            imeiNum = jsb.reflection.callStaticMethod("com/luogu/custom/JavaUtil", "getDeviceImei", "()Ljava/lang/String;");
        }
        cc.sys.localStorage.setItem("imei", imeiNum);
    }
    return imeiNum;
};
/**
 * @returns {Bool}
 */
DeviceInfoManager.prototype.isNetworkAvailable = function() {
    if( cc.sys.os == cc.sys.OS_ANDROID ) {
        return jsb.reflection.callStaticMethod("com/luogu/custom/JavaUtil", "isNetworkAvailable", "()Z");
    }
    return true;
};

/**
 * @returns {string}
 */
DeviceInfoManager.prototype.getVersionCode = function()
{
    //if( cc.sys.os == cc.sys.OS_ANDROID ) {
    //    return jsb.reflection.callStaticMethod("com/luogu/custom/JavaUtil", "getVersionName", "()Ljava/lang/String;");
    //}
    // 主版本.次版本.阶段版本
    return "5.0.17061310";
};

