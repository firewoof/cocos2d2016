/**
 * Created by Administrator on 14-11-6.
 */

var SOCKET_EVENT_PRIORITY = 100;
var AES_COMMON_KEY = "9aa44e879829712f";

var SocketManager = cc.Class.extend({
    ctor:function(){
        this._respMap = {};  // 这是一个map
        this._isWaitingConnect = false;
        this._isConnectSuccess = false;
        this._reconnectCounter = 0;   //重连计数器
        this._lastTryConnect = 0;
        this._lastResponseTime = 0.0;
        this._isLoginSuccess = false;   //是否认证成功
        this.MAX_RECONNECT = 2;         //最多尝试次数
        this.RECONNECT_DURATION = 5;

        this._cacheRequest = [];

        this.addListener();
    },

    addListener:function()
    {

        cc.log("SocketManager Listener create");

        // 监听重试
        this._retryEventListener = cc.eventManager.addListener({
            event: cc.EventListener.CUSTOM,
            eventName: "socket_event_retry",
            callback: function(event) {
                var str = "重试连接 " + event.getStrData();
                cc.log(str);
            }.bind(this)
        }, SOCKET_EVENT_PRIORITY);

        // 监听重试失败
        this._retryfailEventListener = cc.eventManager.addListener({
            event: cc.EventListener.CUSTOM,
            eventName: "socket_event_retry_fail",
            callback: function(event) {
                var str = "重试失败";
                cc.log(str);

                this._isWaitingConnect = false;
                this._isConnectSuccess = false;
                this._isLoginSuccess = false;
                if(isTestServer)
                    MainController.showAutoDisappearAlertByText("重试连接失败...");
            }.bind(this)
        }, SOCKET_EVENT_PRIORITY);

        // 监听尝试连接
        this._tryEventListener = cc.eventManager.addListener({
            event: cc.EventListener.CUSTOM,
            eventName: "socket_event_try_connect",
            callback: function(event) {
                var str = "尝试连接到 " + event.getStrData();
                cc.log(str);

            }.bind(this)
        }, SOCKET_EVENT_PRIORITY);

        // 监听连接成功
        this._connectSuccessEventListener = cc.eventManager.addListener({
            event: cc.EventListener.CUSTOM,
            eventName: "socket_event_connected",
            callback: function(event) {
                //var str = "连接成功";
                cc.log("socket connect Success");
                this._isWaitingConnect = false;
                this._isConnectSuccess = true;
                this._isDelayRetryConnect = false;

                var topLayer = MainController.getTopLayer();
                if(topLayer._layerName == "TCP_RECONNECT_CONFIRM" ){
                    topLayer.removeFromParent();
                }

                //发起登录认证
                cc.log("认证前 AES:", DataPool.aesKey);
                SocketRequest.loginAuth(DataPool.accessToken);
                MainController.getInstance().hideLoadingWaitLayer();
            }.bind(this)
        }, SOCKET_EVENT_PRIORITY);

        // 监听连接失败
        this._connectFailEventListener = cc.eventManager.addListener({
            event: cc.EventListener.CUSTOM,
            eventName: "socket_event_connect_fail",
            callback: function(event) {
                var str = "连接失败";
                cc.log(str);

                this._isWaitingConnect = false;
                this._isConnectSuccess = false;
                this._isLoginSuccess = false;
            }.bind(this)
        }, SOCKET_EVENT_PRIORITY);

        // 监听断开连接
        this._disconnectEventListener = cc.eventManager.addListener({
            event: cc.EventListener.CUSTOM,
            eventName: "socket_event_disconnect",
            callback: function(event) {
                var logStr = "断开连接";
                G_collectLog(logStr);
                cc.log(logStr);

                //重连
                this.reConnect();

            }.bind(this)
        }, SOCKET_EVENT_PRIORITY);

        // 监听收包
        this._receiveEventListener = cc.eventManager.addListener({
            event: cc.EventListener.CUSTOM,
            eventName: "socket_event_receive_package",
            callback: function(event) {
                if(event.getStrData() == null){
                    cc.log("receive package content::", event.getStrData());
                    return;
                }
                var jsonResp = JSON.parse( event.getStrData() );
                var type = jsonResp["action"];
                var data = jsonResp["data"];

                //cc.log(receiveEventListener event.getStrData() );
                SocketResponse.dispatchEvent(type, data);

            }.bind(this)
        }, SOCKET_EVENT_PRIORITY);
    }
});

/**
 * 登录认证成功后的操作
 */
SocketManager.prototype.afterLoginSuccess = function()
{
    cs.NetworkManager.changeEncrytKey(DataPool.aesKey);
    this._reconnectCounter = 0;
    this._isLoginSuccess = true;

    //发送所有缓存的请求
    var tempCacheRequest = this._cacheRequest;
    this._cacheRequest = [];
    for(var i = 0; i < tempCacheRequest; i++)
    {
        var request = tempCacheRequest[i];
        this.sendRequest(request);
    }
};

/**
 * @returns {boolean}
 */
SocketManager.prototype.sendRequest = function(request) {
    if(this._isLoginSuccess)
        cs.NetworkManager.addRequest(request.toJson());
    else
        this._cacheRequest.push(request);
};

/**
 * @returns {boolean}
 */
SocketManager.prototype.isLoginSuccess = function() {
    return this._isLoginSuccess;
};


/**
 * @returns {boolean}
 */
SocketManager.prototype.isWaitingConnect = function() {
    //超过一定时间则重置
    var timeout = 30;
    if(this._lastWaitingTime && (cs.getCurSecs() - this._lastWaitingTime) > timeout){
        this._isWaitingConnect = false;
        cc.log("socket 等待连接超时，重置标记， timeout:", timeout);
    }
    return this._isWaitingConnect;
};

/**
 * @returns {boolean}
 */
SocketManager.prototype.isConnectSuccess = function() {
    return this._isConnectSuccess;
};

SocketManager.prototype.setWaitingConnect = function(isWaiting)
{
    this._isWaitingConnect = isWaiting;
    if(isWaiting){
        this._lastWaitingTime = cs._genCurSecs();
        this._try
    }
};

/**
 * connectToServer 连接（与下面尝试连接不同的是，这个在连接成功后会开启收发数据线程，如果连接失败，会重试3次
 * @param {string} ip
 * @param {unsigned short} port
 * @param {function(boolean)} callback
 */
SocketManager.prototype.connectToServer = function(ip, port) {
    if (this.isWaitingConnect()) {
        cc.log("重连中....return");
        return;
    }
    this.setWaitingConnect(true);

    //确保监听重建
    if(!this._connectSuccessEventListener) {
        this.addListener();
    }

    //token刷新成功回调
    var successCallBack = function(data)
    {
        //预防 data null也触发重连
        if(data == null){
            G_collectLog("token刷新 data is null....");
            reConnectCallBack();
            return;
        }
        //重设 acct
        reSetAccessToken(data.at);

        cc.log("http畅通，token刷新完毕,let's do TCP connect");

        //arg0 encrytKey， arg1 decrytKey
        cs.NetworkManager.setAESKEY(AES_COMMON_KEY, DataPool.aesKey);
        cs.NetworkManager.connectToServer(ip, port);
    }.bind(this);

    var reConnectCallBack = function() {
        this.setWaitingConnect(false);
        //触发断线重连
        cc.eventManager.dispatchCustomEvent("socket_event_disconnect");
    }.bind(this);

    //token刷新超时回调
    var onTimeoutCallBack = function()
    {
        G_collectLog("tcp连接前 token刷新超时....");
        reConnectCallBack();
    }.bind(this);

    var onErrorCallBack = function() {
        G_collectLog("tcp连接前 token刷新出错(可能网络不可达继续请求)....");
        reConnectCallBack();
    }.bind(this);

    //先刷token再连接
    var flag = Player.getInstance().getIdFlag();
    cc.log("tcp连接前 刷新token, idflag: " + flag);
    var sendData = {
        auth: { idflag:flag }
    };

    var args = {
        urlKey:"refreshToken",
        sendData:sendData,
        successCallBack:successCallBack,
        isAutoToken:false,
        encryptType:"RSA",
        timeout:10,
        tryCount:3,
        onTimeoutCallBack:onTimeoutCallBack,
        onErrorCallBack:onErrorCallBack
    };

    HttpManager.sendRequest(args);
};

///**
// * tryConnectToServer 尝试连接
// * @param {string} ip
// * @param {unsigned short} port
// * @param {function(boolean)} callback
// */
//SocketManager.prototype.tryConnectToServer = function(ip, port) {
//    if (!this._isWaitingConnect) {
//        this._isWaitingConnect = true;
//        //确保监听重建
//        if(!this._connectSuccessEventListener) {
//            this.addListener();
//        }
//        cs.NetworkManager.tryConnectToServer(ip, port);
//    }
//};

SocketManager.prototype.disconnect = function() {
    cc.log("SocketManager::disconnect");
    //停掉所有监听
    for(var prop in this){
        if(this[prop] instanceof cc.EventListener){
            cc.eventManager.removeListener(this[prop]);
            this[prop] = null;
        }
    }

    cc.log("主动断开 tcp连接");
    cs.NetworkManager.disconnect();

    this._isWaitingConnect = false;
    this._isConnectSuccess = false;
    this._reconnectCounter = 0;   //重连计数器
    this._isLoginSuccess = false;   //是否认证成功
    this._cacheRequest = [];
};

SocketManager.prototype.reConnect = function()
{
    if(this._isDelayRetryConnect){
        cc.log("延迟重试中....return");
        return;
    }
    cc.log("尝试重连 已尝试次数::", this._reconnectCounter);
    this._isConnectSuccess = false;
    this._isLoginSuccess = false;

    if(this._reconnectCounter >= this.MAX_RECONNECT){
        MainController.getInstance().hideLoadingWaitLayer();
        //this._reconnectCounter = 0; //重置 这样能允许主动触发尝试
        //防止重复弹窗
        if(MainController.getTopLayer()._layerName != "TCP_RECONNECT_CONFIRM"){
            var alertLayer = MainController.getAlertLayer("请确保wifi或网络数据正常");
            alertLayer.setMaskTouchEnabled(true, function(){});
            alertLayer._layerName = "TCP_RECONNECT_CONFIRM";
            MainController.pushLayerToRunningScene(alertLayer);
            alertLayer.setTitleString("掉线了?");
            alertLayer.getOkButton().setTitleText("重新连接");
            //点击确定再次重试
            alertLayer.setOkButtonCallFunc(function(popLayer){
               popLayer.removeFromParent();
                this._reconnectCounter = 0;
                this.setWaitingConnect(false);
                this._isDelayRetryConnect = false;
                MainController.getInstance().connectToServer();
            }.bind(this));
        }
        return;
    }

    this._isDelayRetryConnect = true;

    //延迟delayTime 再次请求连接
    var delay = this._reconnectCounter > 0 ? this.RECONNECT_DURATION * 1000 : 0;
    setTimeout(function(){
        this._isDelayRetryConnect = false;
        var logStr = TimeHelper.formatSecs() + " 第"+this._reconnectCounter+"次重连";
        G_collectLog(logStr);
        cc.log(logStr);
        this.setWaitingConnect(false);
        MainController.getInstance().connectToServer();
        this._reconnectCounter++;
    }.bind(this), delay);
};

/**
 * getResponseByTag 获取指定tag的Response
 * @param {int} tag
 * @param {boolean} remove
 * @returns {SocketGameResponse}
 */
SocketManager.prototype.getResponseByTag = function(tag, remove) {
    var resp = this._respMap[tag];
    if (resp == undefined) {
        return null;
    }

    if (remove) {
        delete this._respMap[tag];
    }
    return resp;
};


SocketManager.reset = function(){
    if(SocketManager.instance){
        SocketManager.instance.disconnect();
    }
    SocketManager.instance = null;
};

SocketManager.getInstance = function()
{
  if(!SocketManager.instance){
      SocketManager.instance = new SocketManager();
      cc.log("SocketManager create:: ===========");
  }
   return SocketManager.instance;
};