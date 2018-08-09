/**
 * 登录 controller
 */

ClientLoginController = cc.Class.extend({

    _curShowLoadPercent : 0,
    _curRequestIndex : 0,
    _curRequestList : [],

    ctor : function(model) {
       this._model = model;

       this._curShowLoadPercent = undefined;
       this._curRequestIndex = 0;
       this._curRequestList = [];

       this._view = new ClientLoginView(this._model, this._controller);
    },

    startup:function(){
        //资源加载
        this.preLoad();

        this._view.show(function(){
            this.loginFlow();
        }.bind(this));
    },

    /**
     * 走登录流程
     */
    loginFlow:function(){
        var account = cs.getItem(GB.ST_ACCOUNT);
        var password = cs.getItem(GB.ST_PASSWORD);
        var serverAddr = GB.serverAddr = cs.getItem(GB.ST_SERVER_ADDR);
        GB.invitationCode = cs.getItem(GB.ST_INVITATION_CODE);
        if(account && password && serverAddr){
            this.login();
        }else{
            //选择登录
            this._view.showLoginType();
        }
    },

    /**
     * 资源和设置
     */
    preLoad:function(){
        this.resetData();
        this.loadLogicRes();
        this.checkConfig();
    },

    /**
     * res
     */
    loadLogicRes:function(){
        //加载资源
        cc.spriteFrameCache.removeSpriteFrames();
        cc.loader.load(g_resources, function (err){
            if (err) {
                cc.log("g_resources", err);
            }
            cc.log("load g_resources finish");
        });

        //加载纹理
        cc.spriteFrameCache.addSpriteFrames("res/arts/ui_general.plist");
        //texture packer特殊处理的图
        var frame = new cc.SpriteFrame("res/arts/other/icon_transparent.png");
        cc.spriteFrameCache.addSpriteFrame(frame, "icon_transparent.png");
    },

    /**
     * 进场设置
     */
    checkConfig:function(){
        var isOpenAudio = cs.getItem("isOpenAudio") || 1;
        MainController.getInstance().setOpenAudio(isOpenAudio!=0);
    },

    /**
     * 正式登录
     */
    login:function(){
        //显示加载进度
        this._view.showLoading();

        //进场percent
        var loadingPercent = this._curShowLoadPercent = 0.20;
        ProxyClientLoginer.showPercent(loadingPercent);
        cc.log("loadingPercent", loadingPercent);

        //登录
        this.requestLogin();
    }
});

ClientLoginController.prototype.chooseLoginMode =  function(){
    if(GB.isSplitLoginModel){
        this.accessAccountServer()
    }else{
        this.oldLoginMode();
    }
};

/**
 * 无账号服务器的登录模式
 */
ClientLoginController.prototype.oldLoginMode = function(){
    var localInvitationCode = this.getLocalInvitationCode();
    if(localInvitationCode){
        GB.invitationCode = localInvitationCode;
        cc.log("在本机已经输入过邀请码了::",localInvitationCode);
    }
    GB.serverAddr = ServerAddr.getServerByBuildVersion(buildVersion) || "test.aiweipan.com";
    if(!GB.invitationCode){
        ClientLoginModule.getInstance().showInvitation();
    }else{
        ClientLoginModule.getInstance().login();
    }
};

/**
 * 查询本地是否保存了邀请码
 */
ClientLoginController.prototype.getLocalInvitationCode = function(){
    var platform =  DataPool.platform || cs.getItem("platform");
    var account = "Phone" == platform ? DataPool.phone : DataPool.openId;
    var invitationMapStr = cs.getItem(GB.ST_INVITATION_MAP_STR) || "{}";
    var map = JSON.parse(invitationMapStr);
    var invitationCode = map[account];
    if(cc.sys.os == cc.sys.OS_ANDROID && !invitationCode){
        invitationCode = DeviceInfoManager.getInstance().getInvitationCode();
    }
    return  invitationCode;
};

ClientLoginController.prototype.saveInvitationCode = function(account, invitationCode){
    if(invitationCode == null){
        return;
    }
    var invitationMapStr = cs.getItem(GB.ST_INVITATION_MAP_STR) || "{}";
    var map = JSON.parse(invitationMapStr);
    //保存
    map[account] = invitationCode;
    var mapStr =  JSON.stringify(map);
    cs.setItem(GB.ST_INVITATION_MAP_STR, mapStr);
    cc.log("保存邀请码::", mapStr);
};

//访问账号服务器
ClientLoginController.prototype.accessAccountServer = function(){
    var successCallBack = function(data)
    {
        var result = data["result"];
        var serverAddr = data["host"];
        var invitationCode  = data["code"];
        //
        if(invitationCode && invitationCode != ""){
            GB.invitationCode = invitationCode;
        }
        if(result == "1"){            //已注册
            GB.serverAddr = serverAddr;
            this.login();
        }
        else if(result == "0")
        {     //未注册
            //安卓包邀请码
            var packetInvitationCode = DeviceInfoManager.getInstance().getInvitationCode();
            if(cc.sys.os == cc.sys.OS_ANDROID && packetInvitationCode){
                this.requestHost(packetInvitationCode, function(){
                    ClientLoginModule.getInstance().login();
                }.bind(this));
            }
            else{
                ClientLoginModule.getInstance().showInvitation();
            }
        }
    }.bind(this);

    cc.log("vcode:",DataPool.vcode);
    cc.log("openId:",DataPool.openId);
    cc.log("phone:",DataPool.phone);
    HttpManager.requestAccountLogin(successCallBack, DataPool.openId, DataPool.phone, DataPool.vcode);
};

ClientLoginController.prototype.requestHost = function(invitationCode, callBack){
    var responseCallBack = function(data)
    {
        var result = data["result"];
        var isSuccess = data["result"] == "0";
        var serverAddr = data["host"];
        if(!isSuccess){
            MainController.showAutoDisappearAlertByText("acctHost failed 请输入正确的邀请码");
            ClientLoginModule.getInstance().showInvitation();
            return;
        }else{
            GB.serverAddr = serverAddr || GB.serverAddr;
            GB.invitationCode = invitationCode || GB.invitationCode;
        }
        if(callBack){
            callBack();
        }
    }.bind(this);

    var errorCallBack = function(){
        MainController.showAutoDisappearAlertByText("acctHost error");
    };

    var timeoutCallBack = function(){
        MainController.showAutoDisappearAlertByText("网络请求超时(acctHost)");
    };
    HttpManager.requestAcctHost(responseCallBack, errorCallBack, timeoutCallBack,  invitationCode);
};


ClientLoginController.prototype.requestLogin = function(){

    // 版本检测
    this.buildVersionRequest();
    // 登录请求
    this.buildLoginRequest();
    // 其它请求
    this.buildOtherRequest();

    // 执行请求
    this.requestNext();
};

ClientLoginController.prototype.buildVersionRequest = function() {
    var request = this._curRequestList;
    request.push({
        "urlKey":"clientVersion",
        "sendData":{
            version: DeviceInfoManager.getInstance().getVersionCode(),
            agentId: DeviceInfoManager.getInstance().getChannel(),
            platform: cc.sys.os
        },
        "successCallBack": ohandler(this, this.onOneUrlComplete),
        "onErrorCallBack": ohandler(this, this.onOneUrlFailed),
        "onTimeoutCallBack": ohandler(this, this.onOneUrlFailed),
        "isAutoToken":false,
        "tryCount": 3
    });
};

ClientLoginController.prototype.buildLoginRequest = function() {
    var request = this._curRequestList;

    var aesKey = DataPool.aesKey = cs.getItem("aesKey") || "";
    var accessToken = DataPool.accessToken = cs.getItem("accessToken") || "";
    var platform =  DataPool.platform || cs.getItem("platform") || "guest";
    var registerURL = DataPool.registerURL;
    var registerData = DataPool.registerData;
    cc.log("buildLoginRequest::", platform);
    cc.log("aesKey::", aesKey);
    cc.log("accessToken::", accessToken);
    cc.log("registerURL::", registerURL);
    cc.log("registerData::", JSON.stringify(registerData));

    // 交换秘钥
    if(aesKey == "" || accessToken == "") {
        var type = "guest" != platform ? 1 : 2;
        var aesKey = DataPool.aesKey = CustomCryptico.generateAESKey();
        request.push({
            "urlKey":"keyExchange",
            "sendData":{ auth: {ak: aesKey, type:type} },
            "successCallBack":ohandler(this, this.keyExchangeComplete),
            "onErrorCallBack": ohandler(this, this.onOneUrlFailed),
            "onTimeoutCallBack": ohandler(this, this.onOneUrlFailed),
            "isAutoToken":false,
            "encryptType":"RSA",
            "tryCount": 3
        });
    }

    // 唯一ID登录
    if (DataPool.showId) {
        request.push({
            "urlKey":"userLogin",
            "sendData":{ auth:{ showId:DataPool.showId } },
            "successCallBack":ohandler(this, this.userLoginComplete),
            "onErrorCallBack": ohandler(this, this.onOneUrlFailed),
            "onTimeoutCallBack": ohandler(this, this.onOneUrlFailed),
            "tryCount": 3
        });
        return;
    }

    // 重新登录
    if (registerURL && registerData) {
        registerData.auth.invitedCode = GB.invitationCode;  //fix invitationCode
        var successCallBack = "register" == registerURL ? ohandler(this, this.registerComplete) : ohandler(this, this.socialRegisterComplete);
        request.push({
            "urlKey":registerURL,
            "sendData":registerData,
            "successCallBack":successCallBack,
            "onErrorCallBack": ohandler(this, this.onOneUrlFailed),
            "onTimeoutCallBack": ohandler(this, this.onOneUrlFailed),
            "tryCount": 3
        });
        return;
    }

    // 首次登录
    var account = cs.getItem("account");
    var password = cs.getItem("password");
    if("guest" !=  platform || (account && password)) {
        var phone = "Phone" == platform ? account : undefined;
        var openId = "Phone" == platform ? undefined : account;
        var req = {
            auth:{
                phone:phone,
                openId:openId,
                password: password,
                version: DeviceInfoManager.getInstance().getVersionCode()
            }
        };
        request.push({
            "urlKey":"userLogin",
            "sendData":req,
            "successCallBack":ohandler(this, this.userLoginComplete),
            "onErrorCallBack": ohandler(this, this.onOneUrlFailed),
            "onTimeoutCallBack": ohandler(this, this.onOneUrlFailed),
            "tryCount": 3
        });
    }
    //else{
    //    request.push({
    //        "urlKey":"guestLoginToken",
    //        "sendData":{},
    //        "successCallBack":handler(this, this.guestLoginTokenComplete),
    //        "onErrorCallBack": handler(this, this.onOneUrlFailed),
    //        "onTimeoutCallBack": handler(this, this.onOneUrlFailed),
    //        "tryCount": 3
    //    });
    //}
};

ClientLoginController.prototype.buildOtherRequest = function() {
    var request = this._curRequestList;
    // 用户详情
    request.push({
        "urlKey":"userDetail",
        "sendData":{},
        "successCallBack":handler(this, this.userDetailComplete),
        "onErrorCallBack": handler(this, this.onOneUrlFailed),
        "onTimeoutCallBack": handler(this, this.onOneUrlFailed),
        "tryCount": 3
    });

    // 客户端配置
    request.push({
        "urlKey":"clientConfig",
        "sendData":{},
        "successCallBack":handler(this, this.clientConfigComplete),
        "onErrorCallBack": handler(this, this.onOneUrlFailed),
        "onTimeoutCallBack": handler(this, this.onOneUrlFailed),
        "tryCount": 3
    });
};

ClientLoginController.prototype.keyExchangeComplete = function(args) {
    var data = args[0];
    cc.log("keyExchangeComplete", JSON.stringify(data));
    reSetAccessToken(data.at);
    reSetAESKey(data.ak);

    this.onOneUrlComplete();
};

ClientLoginController.prototype.guestLoginTokenComplete = function(args){
    var data = args[0];
    cc.log("guestLoginTokenComplete", JSON.stringify(data));
    var gid = cs.getItem("guestId") || undefined;
    var req = {
        auth:{
            gid:gid,
            agentId:DeviceInfoManager.getInstance().getChannel(),
            version:DeviceInfoManager.getInstance().getVersionCode(),
            glt:data.glt,
            invitedCode:GB.invitationCode
        }
    };
    var request = {
        "urlKey":"guestLogin",
        "sendData":req,
        "successCallBack":handler(this, this.guestLoginComplete),
        "onErrorCallBack": handler(this, this.onOneUrlFailed),
        "onTimeoutCallBack": handler(this, this.onOneUrlFailed),
        "tryCount": 3
    };
    HttpManager.sendRequest(request);
};

ClientLoginController.prototype.guestLoginComplete = function(args) {
    var data = args[0];
    cc.log('guestLoginComplete', JSON.stringify(data));
    DataPool.hasLogin = true;
    DataPool.isGuestLogin = true;
    cs.setItem("guestId",data.gid);

    reSetAccessToken(data.at);
    reSetAESKey(data.ak);
    Player.getInstance().setOnline(data.onLine);

    this.onOneUrlComplete();
};

ClientLoginController.prototype.registerComplete = function(args) {
    var data = args[0];
    var phone = DataPool.registerData.auth.phone;
    cc.log('userLoginComplete', JSON.stringify(data), phone);

    cs.setItem("platform", "Phone");
    cs.setItem("account", phone);
    cs.setItem("password", data.password);

    var req = {
        auth:{
            phone: phone,
            password: data.password,
            version: DeviceInfoManager.getInstance().getVersionCode()
        }
    };
    var request = {
        "urlKey":"userLogin",
        "sendData":req,
        "successCallBack":ohandler(this, this.userLoginComplete),
        "onErrorCallBack": ohandler(this, this.onOneUrlFailed),
        "onTimeoutCallBack": ohandler(this, this.onOneUrlFailed),
        "tryCount": 3
    };
    HttpManager.sendRequest(request);
};

ClientLoginController.prototype.socialRegisterComplete = function(args) {
    var data = args[0];
    var openId = DataPool.registerData.auth.openId;
    var platform = DataPool.platform || "party";
    cc.log('socialRegisterComplete', JSON.stringify(data), platform, openId);

    cs.setItem("platform", platform);
    cs.setItem("account", openId);
    cs.setItem("password", data.password);

    var req = {
        auth:{
            openId: openId,
            password: data.password,
            version: DeviceInfoManager.getInstance().getVersionCode()
        }
    };
    var request = {
        "urlKey":"userLogin",
        "sendData":req,
        "successCallBack":ohandler(this, this.userLoginComplete),
        "onErrorCallBack": ohandler(this, this.onOneUrlFailed),
        "onTimeoutCallBack": ohandler(this, this.onOneUrlFailed),
        "tryCount": 3
    };
    HttpManager.sendRequest(request);
};

ClientLoginController.prototype.userLoginComplete = function(args) {
    var data = args[0];
    cc.log('userLoginComplete', JSON.stringify(data));
    DataPool.hasLogin = true;
    DataPool.isGuestLogin = false;
    DataPool.showId = null;
    DataPool.registerURL = null;
    DataPool.registerData = null;
    //重置单例对象
    MainController.getInstance().clean();
    cs.removeItem("guestId");

    reSetAccessToken(data.at);
    reSetAESKey(data.ak);
    Player.getInstance().setOnline(data.onLine);

    this.onOneUrlComplete();

    //登录成功后才将serverAddr保存到本地(登录过程中出错 导致客户端报废)
    cs.setItem(GB.ST_SERVER_ADDR, GB.serverAddr);

    //请求自定义远端存储数据
    RemoteStorage.getInstance().loadStorage();
};

ClientLoginController.prototype.userDetailComplete = function(args){
    var data = args[0];
    cc.log('userDetailComplete', JSON.stringify(data));
    Player.getInstance().initFromJson(data);

    //player会带真正所属的邀请码
    var  account = cs.getItem(GB.ST_ACCOUNT);
    this.saveInvitationCode(account,  Player.getInstance().getInvitationCode());

    this.onOneUrlComplete();
};

ClientLoginController.prototype.clientConfigComplete = function(args){
    var data = args[0];
    cc.log('clientConfigComplete', JSON.stringify(data));

    // 拿到客户端配置数据
    ClientConfig.getInstance().initFromJson(data);

    this.onOneUrlComplete();
};

ClientLoginController.prototype.onOneUrlComplete = function(args){
    var requestList = this._curRequestList;
    var curRequestIndex = this._curRequestIndex;
    this._curRequestIndex = (curRequestIndex + 1);

    var loadingPercent = this._curShowLoadPercent;
    this._leftPercent = this._leftPercent || (1 - loadingPercent);
    cc.log("loadingPercent", "onOneUrlComplete", loadingPercent, this._leftPercent);
    loadingPercent = loadingPercent + this._leftPercent * (curRequestIndex + 1) / requestList.length;
    this._curShowLoadPercent = loadingPercent;
    ProxyClientLoginer.showPercent(loadingPercent);
    cc.log("loadingPercent", "onOneUrlComplete", loadingPercent, this._leftPercent);

    this.requestNext();
};

ClientLoginController.prototype.requestNext = function(){
    var requestList = this._curRequestList;
    var curRequestIndex = this._curRequestIndex;

    // 检测是否加载完成
    if (curRequestIndex >= requestList.length) {
        MainController.getInstance().connectToServer();
        cc.director.runScene(new cc.TransitionFade(0.5, new MainScene(), cc.BLACK));
    }
    else {
        var args = requestList[curRequestIndex];
        HttpManager.sendRequest(args);
    }
};

ClientLoginController.prototype.onOneUrlFailed = function(args){
    var requestList = this._curRequestList;
    var curRequestIndex = this._curRequestIndex;
    var request = requestList[curRequestIndex];
    cc.log("onOneUrlFailed", request);

    // 提示框
    var callback = function() {
        this.requestNext();
    }.bind(this);
    ProxyClientLoginer.showPopup(LocalString.getString("LOGIN_NET_NOT_AVAILABLE"), callback);
};

ClientLoginController.prototype.resetData = function(){
    this._leftPercent = null;
    this._curRequestIndex = 0;
    this._curRequestList = [];
    if (this._curShowLoadPercent){
        this._curShowLoadPercent = 0;
    }
};

ClientLoginController.prototype.guestLogin = function(){
    DataPool.showId = null;
    DataPool.platform = null;
    DataPool.registerURL = null;
    DataPool.registerData = null;
    cs.removeItem("aesKey");
    cs.removeItem("accessToken");
    cs.removeItem("platform");
    cs.removeItem("account");
    cs.removeItem("password");

    this.requestLogin();
};