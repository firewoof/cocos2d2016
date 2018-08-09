/**
 * 客户端配置
 * Created by Jony on 2016/10/5.
 */

var ClientConfig = cc.Class.extend({
    _hasSetPayPassword:false,  //是否已经设置支付密码
    _withdrawFee:0.0,          //提现手续费比例0.xx
    _mask:true,                //是否屏蔽人工充值
    _rechargeMinAmount:0,      //最小充值金额
    _rechargeMaxAmount:0,      //最大充值金额
    _withDrawMinAmount:0,      //最小提现金额
    _withDrawMaxAmount:0,      //最大提现金额
    _minWithdrawFee: 0,        //提现最低手续费
    _maxWithdrawFee: 0,        //提现最高手续费
    _rechargeAmountList:"",    //充值金额选择列表（字符串，分隔）
    _tcpAddressIP:null,          //tcp ip地址 记住不要给默认值 这里tcp的重连需要这里做判断
    _tcpPort:null,            //端口
    _isPracticeEnabled:false,   //是否允许模拟交易
    _operateType:0,             //(交易大厅)操作模式
    _isWhiteListUser:false,     //是否白名单用户
    _isNeedInvitationCode:false,   //是否需要邀请码才能注册
    _isOpenRegister:true,
    _isOpenRecharge:true,
    _appRechargeType:null,       // 充值方式
    //_timeScaleList:undefined,
    _isReChargeNeedName:false,    //充值需要姓名
    _isWithdrawNeedIdCard:false,//提现需要上传身份证

    _chartSolidTypes:undefined,
    //_chartLineTypes:undefined,
    _chartCandleTypes:undefined,

    ctor:function(jsonData) {
        //this._timeScaleList = [5, 15, 30, 60, 120];
        this._chartSolidTypes = [5 * 60, 15 * 60, 30 * 60, 60 * 60, 120 * 60];
        //this._chartLineTypes = [5 * 60, 15 * 60, 30 * 60, 60 * 60, 120 * 60];
        this._chartCandleTypes = [60, 5*60, 15*60, 30*60, 60*60, 120*60, 240*60];
        this._fixedInputList = [100, 200];

        if(jsonData)
            this.initFromJson(jsonData);
    },

    initFromJson:function(jsonData)
    {
        this._hasSetPayPassword     = ALCommon.getValueWithKey(jsonData, "hasSetPayPassword", this._hasSetPayPassword);
        this._withdrawFee           = ALCommon.getValueWithKey(jsonData, "withdrawFee", this._withdrawFee);
        this._mask                  = ALCommon.getValueWithKey(jsonData, "mask", this._mask);
        this._rechargeMinAmount     = ALCommon.getValueWithKey(jsonData, "rechargeMinAmount", this._rechargeMinAmount);
        this._rechargeMaxAmount     = ALCommon.getValueWithKey(jsonData, "rechargeMaxAmount", this._rechargeMaxAmount);
        this._withDrawMinAmount     = ALCommon.getValueWithKey(jsonData, "withDrawMinAmount", this._withDrawMinAmount);
        this._withDrawMaxAmount     = ALCommon.getValueWithKey(jsonData, "withDrawMaxAmount", this._withDrawMaxAmount);
        this._minWithdrawFee        = ALCommon.getValueWithKey(jsonData, "minWithdrawFee", this._minWithdrawFee);
        this._maxWithdrawFee        = ALCommon.getValueWithKey(jsonData, "maxWithdrawFee", this._maxWithdrawFee);
        this._rechargeAmountList    = ALCommon.getValueWithKey(jsonData, "rechargeAmountList", this._rechargeAmountList);
        this._tcpAddressIP          = ALCommon.getValueWithKey(jsonData, "mpsAddress", this._tcpAddressIP);
        this._tcpPort               = ALCommon.getValueWithKey(jsonData, "mpsPort", this._tcpPort);
        this._isPracticeEnabled     = ALCommon.getValueWithKey(jsonData, "openTestTrade", this._isPracticeEnabled);
        this._operateType           = ALCommon.getValueWithKey(jsonData, "operateType", this._operateType);
        this._isWhiteListUser       = ALCommon.getValueWithKey(jsonData, "inWhiteUserList", this._isWhiteListUser);
        this._isNeedInvitationCode  = ALCommon.getValueWithKey(jsonData, "needInvitedCode", this._isNeedInvitationCode);
        this._isOpenRegister        = ALCommon.getValueWithKey(jsonData, "openRegister", this._isOpenRegister);
        this._isOpenRecharge        = ALCommon.getValueWithKey(jsonData, "openRecharge", this._isOpenRecharge);
        this._appRechargeType       = ALCommon.getValueWithKey(jsonData, "appRechargeType", this._appRechargeType);
        this._isReChargeNeedName      = ALCommon.getValueWithKey(jsonData, "isRechargeNeedName", this._isReChargeNeedName);
        this._isWithdrawNeedIdCard  = ALCommon.getValueWithKey(jsonData, "isWithdrawNeedIdCard", this._isWithdrawNeedIdCard);

        //split ","
        this._chartSolidTypes       = ALCommon.getSplitArrayWithKey(jsonData, "kLineTypes", this._chartSolidTypes);
        this._chartCandleTypes      = ALCommon.getSplitArrayWithKey(jsonData, "kLineTypes", this._chartCandleTypes);
        this._fixedInputList       = ALCommon.getSplitArrayWithKey(jsonData, "fixedInputList", this._fixedInputList);

        //时区及对时
        var serverTime = jsonData["servTime"];
        var timezone = jsonData["timezone"];
        this.adaptTimezone(serverTime, timezone);

        //
        //this._tcpAddressIP = "192.168.1.16";
        //this._tcpPort      = 12306;
        var localTcpIP = cc.sys.localStorage.getItem("tcpIP");
        cc.log("localTcpIP:",localTcpIP);
        if(buildVersion == BUILDVERSION_DEVELOP && localTcpIP){
            if(localTcpIP.indexOf(":") != -1){
                var splitArray = localTcpIP.split(":");
                this._tcpAddressIP = splitArray[0];
                this._tcpPort = splitArray[1];
            }else{
                this._tcpAddressIP = localTcpIP;
                this._tcpPort = 12306;
            }
        }
    }
});

ClientConfig.prototype.setTcpAddressIPAndTcpPort = function(tcpAddressIP,tcpPort){
    this._tcpAddressIP = tcpAddressIP;
    this._tcpPort = tcpPort;
};

ClientConfig.OPRATE_TYPE_NORMAL = 0;
ClientConfig.OPRATE_TYPE_HQGJ = 1;    //环球国际
ClientConfig.OPRATE_TYPE_ZYHB = 2;    //正元恒邦

ClientConfig.reset = function()
{
    this._instance = null;
};
/**
 * @returns {ClientConfig}
 */
ClientConfig.getInstance = function()
{
    if(!this._instance)
    {
        //cc.log("============new ClientConfig instance=========================");
        this._instance = new ClientConfig();
    }
    return this._instance;
};

/**
 * 时间及时区校对
 * @param serverTime
 * @param timezone
 */
ClientConfig.prototype.adaptTimezone = function(serverTime, timezone){
    // 同步时间
    if(serverTime == undefined)
        return;

    var fixedTime = MainController.getInstance()._fixedTime = serverTime - new Date().getTime();
    window.SERVER_UTC = timezone || SERVER_UTC;

    //立即生成一次时间戳
    cs._genCurSecs();
    cc.log("同步时间:", TimeHelper.formatSecs(), TimeHelper.formatMilliSec(serverTime), fixedTime/1000);
    cc.log("SERVER_UTC:", window.SERVER_UTC);
};

ClientConfig.prototype.getChartItemTypes = function(chartType)
{
    var types = [];
    switch (chartType){
        case GB.CHART_TYPE_SOLID:
            types = this._chartSolidTypes;
            break;
        default:
            types = this._chartCandleTypes;
    }
    return types;
};

ClientConfig.prototype.isReChargeNeedName = function() {
    return this._isReChargeNeedName;
};

ClientConfig.prototype.isWithdrawNeedIdCard = function() {
    return this._isWithdrawNeedIdCard;
};

/**
 * @returns {Bool}
 */
ClientConfig.prototype.getHasSetPayPassword = function() {
    return this._hasSetPayPassword;
};

ClientConfig.prototype.isWhiteListUser = function() {
    return this._isWhiteListUser;
};

ClientConfig.prototype.isOpenRegister = function() {
    return this._isOpenRegister;
};

ClientConfig.prototype.isOpenRecharge = function() {
    return this._isOpenRecharge;
};

ClientConfig.prototype.getFixedInputList = function() {
    return this._fixedInputList;
};

/**
 * @returns {Number}
 */
ClientConfig.prototype.getOperateType = function() {
    return this._operateType;
};

ClientConfig.prototype.isNeedInvitationCode = function() {
    return this._isNeedInvitationCode;
};

/**
 * @returns {string}
 */
ClientConfig.prototype.getTcpAddressIP = function() {
    return this._tcpAddressIP;
};

/**
 * @returns {*}
 */
ClientConfig.prototype.getTcpPort = function() {
    return this._tcpPort;
};

ClientConfig.prototype.isPracticeEnabled = function() {
    return this._isPracticeEnabled;
};

/**
 * @returns {*}
 */
ClientConfig.prototype.setHasSetPayPassword = function(b) {
    this._hasSetPayPassword = b;
};


/**
 * @returns {Number}
 */
ClientConfig.prototype.getWithdrawFee = function() {
    return this._withdrawFee;
};

/**
 * @returns {Bool}
 */
ClientConfig.prototype.getMask = function() {
    return this._mask;
};

/**
 * @returns {Number}
 */
ClientConfig.prototype.getRechargeMinAmount = function() {
    return this._rechargeMinAmount;
};

/**
 * @returns {Number}
 */
ClientConfig.prototype.getRechargeMaxAmount = function() {
    return this._rechargeMaxAmount;
};

/**
 * @returns {Number}
 */
ClientConfig.prototype.getWithDrawMinAmount = function() {
    return this._withDrawMinAmount;
};

/**
 * @returns {Number}
 */
ClientConfig.prototype.getWithDrawMaxAmount = function() {
    return this._withDrawMaxAmount;
};

/**
 * @returns {String}
 */
ClientConfig.prototype.getRechargeAmountList = function() {
    return this._rechargeAmountList;
};


/**
 * @returns {Number}
 */
ClientConfig.prototype.getMinWithdrawFee = function() {
    return this._minWithdrawFee;
};

/**
 * @returns {Number}
 */
ClientConfig.prototype.getMaxWithdrawFee = function() {
    return this._maxWithdrawFee;
};

/**
 * @returns {Number}
 */
ClientConfig.prototype.getAppRechargeType = function() {
    return this._appRechargeType;
};