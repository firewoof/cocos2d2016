/**
 * Created by 玲英 on 2016/11/28.
 */

/**
 * 方便使用xMlHtpRequest的属性
 */
var HttpXRequest = cc.Class.extend({
    _successCallBack:undefined,
    _isAutoToken:true,
    _encryptType:"AES",
    _sendData:undefined,
    _url:undefined,
    _reConnectTimes: 0,
    _tryCount:1,
    _showTips:false,

    ctor:function()
    {
        this._sendData = {};
        this._args = {};
        this._logInfo = new LogModel();
        this._logInfo.setType(GB.LOG_TYPE_REQUEST);

        this.initRequest();
    },

    initRequest:function()
    {
        var request = this._request = new XMLHttpRequest();

        //回调
        request.onloadstart = this.onloadstart.bind(this);
        request.ontimeout = this.ontimeout.bind(this);
        request.onabort = this.onabort.bind(this);
        request.onerror = this.onerror.bind(this);
        request.onloadend = this.onloadend.bind(this);
        request.onreadystatechange = this.onreadystatechange.bind(this);

        //默认十秒超时
        this.setTimeout(10);
    },

    generateUUID:function(){
        if(GB.uuid){
            return GB.uuid;
        }
        var uuid = cs.getItem(GB.ST_UUID);
        if(!uuid){
            var SOS = "";
            if(cc.sys.os == cc.sys.OS_ANDROID){
                SOS = "DR";
            }else if(cc.sys.os == cc.sys.OS_IOS){
                SOS = "AP"
            }else if(cc.sys.os == cc.sys.OS_WINDOWS){
                SOS = "WD"
            }
            uuid = SOS + ALCommon.getRandomInteger(10000,99999) +"_"+ TimeHelper.formatSecs(cs._genCurSecs(),"yyMMddHHmmss");
            cs.setItem(GB.ST_UUID, uuid);
        }
        GB.uuid = uuid;
        return uuid;
    },

    setArgs:function(args)
    {
        var args = args || {};
        this._args = args;

        var urlKey = args["urlKey"];
        var sendData = args["sendData"];
        var isAutoToken = args["isAutoToken"];
        var encryptType = args["encryptType"];
        var timeout = args["timeout"];
        var tryCount = args["tryCount"];
        var showTips = args["showTips"];
        

        var successCallBack = args["successCallBack"];
        var errorCallBack = args["errorCallBack"];
        var onSysErrorCallBack = args["onSysErrorCallBack"];
        var onTimeoutCallBack = args["onTimeoutCallBack"];
        var onreadystatechangeCallBack = args["onreadystatechangeCallBack"];
        var onErrorCallBack = args["onErrorCallBack"];
        if(HTTP_LOG_ENABLED) cc.log("args::", JSON.stringify(args));

        if(urlKey != undefined) this.setUrlKey(urlKey);
        if(tryCount != undefined) this.setTryCount(tryCount);
        if(showTips != undefined) this.setShowTips(showTips);
        if(sendData != undefined) this.setSendData(sendData);
        if(isAutoToken != undefined) this.setAutoToken(isAutoToken);
        if(encryptType != undefined) this.setEncryptType(encryptType);

        if(successCallBack != undefined) this.setSuccessCallBack(successCallBack);
        if(errorCallBack != undefined) this.setErrorCallBack(errorCallBack);

        if(onErrorCallBack != undefined) this.setOnErrorCallBack(onErrorCallBack);
        if(onTimeoutCallBack != undefined) this.setOnTimeoutCallBack(onTimeoutCallBack);
        if(onreadystatechangeCallBack != undefined) this.setOnreadystatechangeCallBack(onreadystatechangeCallBack);
        //if(onSysErrorCallBack != undefined) this.setOnSysErrorCallBack(onSysErrorCallBack);
    },

    getArgs:function(args)
    {
        return this._args || {};
    },

    setTimeout:function(secs)
    {
        if(secs > 0)
        {
            this._request.timeout = secs * 1000;
        }
    },

    setUrl:function(url)
    {
        this._url = url;
    },

    getUrl:function(url)
    {
        return this._url;
    },

    setUrlKey:function(urlKey)
    {
        this._tag = "HttpRequest/Url: " + urlKey;
        this.setUrl(ServerAddr.getUrl(urlKey));
        if(!this._args["urlKey"])
            this._args["urlKey"] = urlKey;

    },

    setTryCount:function(tryCount)
    {
        this._tryCount = tryCount;
        if(!this._args["tryCount"])
            this._args["tryCount"] = tryCount;
    },

    setShowTips:function(showTips)
    {
        this._showTips = showTips;
        if(!this._args["showTips"])
            this._args["showTips"] = showTips;
    },

    send:function()
    {
        //日志
        this._logInfo.setRequestArgs(this._args);

        var params = this.getParams();
        if(HTTP_LOG_ENABLED) cc.log("params:: ", params);
        if(this._isAutoToken && this._sendData && "" == this._sendData["acct"]) return;
        this._request.open("POST", this.getUrl());
        this._request.send(params);
    },

    setAutoToken:function(isAutoToken)
    {
        this._isAutoToken = isAutoToken == false ? isAutoToken : true;
        if(!this._args["isAutoToken"])
            this._args["isAutoToken"] = isAutoToken;
    },

    setEncryptType:function(encryptType)
    {
        if(!encryptType)
            return;
        this._encryptType = encryptType;
        if(!this._args["encryptType"])
            this._args["encryptType"] = encryptType;
    },

    setSendData:function(sendData)
    {
        this._sendData = sendData || {};
        if(!this._args["sendData"])
            this._args["sendData"] = sendData;
    },

    setSuccessCallBack:function(successCallBack)
    {
        if(!successCallBack)
            return;
        this._successCallBack = successCallBack;
        if(!this._args["successCallBack"])
            this._args["successCallBack"] = successCallBack;
    },

    setOnreadystatechangeCallBack:function(onreadystatechangeCallBack)
    {
        if(!onreadystatechangeCallBack)
            return;
        this._onreadystatechangeCallBack = onreadystatechangeCallBack;
        if(!this._args["onreadystatechangeCallBack"])
            this._args["onreadystatechangeCallBack"] = onreadystatechangeCallBack;
    },

    setErrorCallBack:function(errorCallBack)
    {
        if(!errorCallBack)
            return;
        this._errorCallBack = errorCallBack;
        if(!this._args["errorCallBack"])
            this._args["errorCallBack"] = errorCallBack;
    },

    setOnErrorCallBack:function(onErrorCallBack)
    {
        if(!onErrorCallBack)
            return;
        this._onErrorCallBack = onErrorCallBack;
        if(!this._args["onErrorCallBack"])
            this._args["onErrorCallBack"] = onErrorCallBack;
    },

    setOnTimeoutCallBack:function(onTimeoutCallBack)
    {
        if(!onTimeoutCallBack)
            return;
        this._onTimeoutCallBack = onTimeoutCallBack;
        if(!this._args["onTimeoutCallBack"])
            this._args["onTimeoutCallBack"] = onTimeoutCallBack;
    },

    //setOnSysErrorCallBack:function(callBack)
    //{
    //    if(!callBack)
    //        return;
    //    this._onSysErrorCallBack = callBack;
    //    if(!this._args["onSysErrorCallBack"])
    //        this._args["onSysErrorCallBack"] = callBack;
    //},

    /**
     * 预备参数
     */
    getParams:function()
    {
        //预备好参数
        var paramsArray = [];
        var sendData = this._sendData || {};
        var encryptType = this._encryptType;
        var isAutoToken = this._isAutoToken;

        // 自动添加Token
        if(isAutoToken){
            sendData["acct"] = DataPool.accessToken;
        }
        //自动加uuid
        sendData["uuid"] = this.generateUUID();

        for (var key in sendData)
        {
            var val = sendData[key];
            if(val != null && typeof(val) == "object")
            {
                val = JSON.stringify(val);
                if(key == "auth"){
                    if(HTTP_LOG_ENABLED) cc.log("加密类型: "+ encryptType);
                    if(encryptType == "AES") {
                        val = CustomCryptico.AESEncrypt(val);
                    }
                    else
                    {
                        cc.log("RSA 加密");
                        val = CustomCryptico.RSAEncrypt(val);
                        paramsArray.push("rauth"+ "=" +val);
                        continue;
                    }
                }
            }
            paramsArray.push(key+ "=" +val);
        }
        var params = paramsArray.join("&");

        return params;
    },

    onloadstart:function()
    {
        if(HTTP_LOG_ENABLED) cc.log("xmlHttp.onloadstart");
        if(HTTP_LOG_ENABLED) G_collectLog("................start......................", this._tag);
        if(HTTP_LOG_ENABLED) G_collectLog("sendData: " + this._url + " "+ JSON.stringify(this._sendData), this._tag);
        this._logInfo.pushProcessLog(this._url);
    },

    ontimeout:function()
    {
        var request = this._request;
        cc.log("xmlHttp.timeout: " + request.timeout);
        G_collectLog("xmlHttp.timeout: " + request.timeout, this._tag);

        testSeverLog(this._tag + ", timeout:"+request.timeout);
        this._logInfo.pushProcessLog("reConnectTimes:"+this._reConnectTimes+"  timeout" + request.timeout);

        this.reConnect(this._onTimeoutCallBack);
    },

    onabort:function()
    {
        cc.log("xmlHttp.onabort");
        G_collectLog("xmlHttp.onabort", this._tag);
        this._logInfo.pushProcessLog("onabort....");
    },

    onerror:function()
    {
        cc.log("xmlHttp.onerror");
        G_collectLog("xmlHttp.onerror", this._tag);
        testSeverLog(this._tag + ", onerror....");
        this._logInfo.pushProcessLog("onerror....");

        this.reConnect(this._onErrorCallBack);
    },

    onload:function()
    {
        if(HTTP_LOG_ENABLED) cc.log("xmlHttp...url::", this._url);
        if(HTTP_LOG_ENABLED) cc.log("xmlHttp.onload");
    },

    onloadend:function()
    {
        if(HTTP_LOG_ENABLED) cc.log("xmlHttp.onloadend:" + this._tag);
        this._logInfo.pushProcessLog("http onloadend....");
    },

    checkVersion:function(data){
        if(!data)
            return;
        cc.log("checkVersion::", JSON.stringify(data));
        var remoteVersion = data["version"];
        var localVersion = DeviceInfoManager.getInstance().getVersionCode();
        if(remoteVersion && localVersion){
            var remoteVersionSplits = remoteVersion.split(".");
            var localVersionSplits = localVersion.split(".");
            //防止跳过热更
            if(remoteVersionSplits[0] == localVersionSplits[0]){
                    cc.sys.restartVM();
            }else{
                this.bigVersionUpdate(data);
            }
        }
    },

    bigVersionUpdate:function(data)
    {
        if(!data)
            return;
        G_collectLog("bigVersionUpdate:" + JSON.stringify(data), this._tag);
        var downloadUrl = data["downloadUrl"];
        if(cc.sys.os == cc.sys.OS_ANDROID && data["downloadUrl"]){
            var text = new ccui.Text("发现新版本，点击确定，下载安装最新包", FONT_ARIAL_BOLD, 36);
            text.setColor(cs.BLACK);
            var layer = new PopLayerWithOKButton(text,null,function(){
                MainController.getInstance().downloadApk(downloadUrl);
                MainController.popLayerFromRunningScene(layer);
            });
            layer.setMaskTouchEnabled(false);
            MainController.pushLayerToRunningScene(layer);
        }

        var appId = data["appId"] || "1198136406";
        if(cc.sys.os == cc.sys.OS_IOS && appId){
            var text = new ccui.Text("发现新版本，点击确定，下载安装最新包", FONT_ARIAL_BOLD, 36);
            text.setColor(cs.BLACK);
            var layer = new PopLayerWithOKButton(text,null,function(){
                MainController.popLayerFromRunningScene(layer);
                //去往商店下载
                var url = cc.formatStr("http://itunes.apple.com/us/app/id%s", appId);
                cc.Application.getInstance().openURL(url);
            });
            layer.setMaskTouchEnabled(false);
            MainController.pushLayerToRunningScene(layer);
        }
    },

    onreadystatechange:function()
    {
        var request = this._request;
        var tag = this._tag;
        if(request.readyState == 4)
        {
            cc.log(request.statusText);
            //G_collectLog("xmlHttp.statusText: "+request.statusText, tag);
            //cc.log("request.status::",request.status);
            if(request.status != 200){
                this._logInfo.pushProcessLog("request status:"+request.status);
                //弹出日志上报
                this.caseFirsNON200(request.status)
            }
            switch (request.status) {
                case 200:
                    {
                        HttpXRequest.isFirstRequestSuccess = true;
                        if(this._onreadystatechangeCallBack){
                            this._onreadystatechangeCallBack(request.responseText);
                        }

                        if(request.responseText.length>0){
                            var info = JSON.parse(request.responseText);
                            G_collectLog("info.status == " + info.status, tag);
                            cc.log("data::" + JSON.stringify(info));
                            this._logInfo.pushProcessLog("info status:"+ info.status);
                            if(HTTP_LOG_ENABLED) cc.log("info.status == " + info.status);
                            if(info.status == "80000000")//80000000
                            {
                                cc.log("Token过期");
                                G_collectLog("Token过期", tag);
                                if(DataPool.hasLogin){
                                    var callBack = function(){
                                        HttpManager.sendRequest(this.getArgs());
                                    }.bind(this);
                                    refreshToken(callBack);
                                }
                                else{
                                    DataPool.aesKey = "";
                                    exchangeAesKey(function(){
                                        HttpManager.sendRequest(this.getArgs());
                                    }.bind(this))
                                }
                            }
                            else{
                                var data = info.data;
                                if(info["encrypt"] == 1){
                                    var aesKey = DataPool.aesKey;
                                    if(this._args["urlKey"] == "keyExchange") {
                                        aesKey = this._args["sendData"]["auth"]["ak"];
                                    }
                                    var decryptData = CustomCryptico.AESDecrypt(data, aesKey);
                                    data = JSON.parse(decryptData); // 业务数据解密
                                }

                                //log
                                this._logInfo.setContent(JSON.stringify(data));

                                //防止非000错误的长时间Loading
                                if(info.status != "000"){
                                    MainController.getInstance().hideLoadingWaitLayer();
                                }

                                if(info.status == "000") {
                                    if(this._successCallBack) {
                                        this._successCallBack(data);
                                    }
                                }
                                else if(info.status == "80003001")
                                {
                                    //大版本更新
                                    this.checkVersion(data);
                                }
                                else if(info.status == "80000002")//下线通知
                                {
                                    cc.log("强制下线通知");
                                    MainController.getInstance().forceOffline(info.message);
                                }
                                else if(info.status == "80001003")//充值跳转提示
                                {
                                    cc.log("余额不足");
                                    MainController.getInstance().showGoToRechargeLayer();
                                }
                                else if(info.status == "80101002")//解决请先注册问题
                                {
                                    cc.log("解决请先注册问题");
                                    //登出
                                    MainController.getInstance().logout();
                                }
                                else if(info.status == "80099001")//不合法的请求
                                {
                                    G_collectLog("不合法的请求", tag);
                                    testSeverLog(tag + ", 不合法的请求");
                                }
                                else
                                {
                                    // 自定义的错误回调
                                    if(this._errorCallBack) {
                                        this._errorCallBack();
                                    }
                                    // 公用弹出错误提示
                                    var message = info.message;
                                    //win32 任意情况都要弹出来
                                    if(!info.message && cc.sys.platform == cc.sys.WIN32)
                                    {
                                        message = info.message || "unKnow error "+ info.status;
                                    }
                                    if(message)
                                    {
                                        MainController.showAutoDisappearAlertByText(message);
                                    }
                                }
                            }
                        }
                        else
                        {
                            cc.log("返回数据为空");
                            return;
                        }
                    }
                    break;
                case 404:
                    if(this._errorCallBack) {
                        this._errorCallBack();
                    }
                    testSeverLog(tag + ", case 404:...找不到页面.");
                    break;
                case 500:
                    MainController.showAutoDisappearAlertByText("您的网络似乎不稳定...");
                    testSeverLog(tag + ", case 500:...服务器内部错误");
                    break;
                case 504:
                    if(this._onTimeoutCallBack) this._onTimeoutCallBack();
                    testSeverLog(tag + ", case 504: Gateway Time-out");
                    break;
                case 502:
                    testSeverLog(tag + ", case 502");
                    break;
                default:
                    G_collectLog("请求完成但相应状态异常，状态码xmlHttp.status: " + request.status, tag);
                    cc.log("请求完成但相应状态异常，状态码xmlHttp.status: " + request.status);
                    break;
            }
        }
    },

    /**
     * 第一次 非200的日志上报反馈界面（非主场景）
     */
    caseFirsNON200:function(status){
        if(cc.director.getRunningScene() instanceof MainScene){
            return;
        }
        //防止重复弹窗
        if(MainController.getTopLayer()._layerName != "HTTP_NON_200"){
            var label = new cc.LabelTTF("当前网络状况不佳", FONT_ARIAL_BOLD, 28);
            label.setColor(cs.GRAY);
            var alertLayer = new ConfirmPopLayer(label);
            alertLayer.setMaskTouchEnabled(true, function(){});
            alertLayer._layerName = "HTTP_NON_200";
            MainController.pushLayerToRunningScene(alertLayer);
            alertLayer.getOkButton().setTitleText("重试");
            alertLayer.getCancelButton().setTitleText("反馈问题");
            //点击确定再次重试
            alertLayer.setOkButtonCallFunc(function(sender){
                HttpManager.sendRequest(this.getArgs());
            }.bind(this));

            alertLayer.setCancelButtonCallFunc(function(sender){
                MainController.getInstance().uploadLogFile();
                MainController.showAutoDisappearAlertByText("反馈成功");
                HttpManager.sendRequest(this.getArgs());
            }.bind(this))
        }
    },

    reConnect: function(handler)
    {
        this._reConnectTimes += 1;
        if(this._reConnectTimes < this._tryCount)
        {
            //Todo
            this.initRequest();
            this.send();
        }
        else
        {
            if (handler) {
                handler();
            }
            if (this._showTips) 
            {
                MainController.getInstance().showNetworkConnectFailLayer("NET_NOT_AVAILABLE");
            }
        }
    }

});