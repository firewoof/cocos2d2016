/**
 * Created by Jony on 2016/8/8.
 */
var LoginTypeLayer = cc.Layer.extend({
    _enableMaskTouch: true,
    _configMap: {},

    ctor:function(player)
    {
        this._super();

        cc.loader.loadJson("res/arts/CustomConfig.json",function(err, jsonData){
            this._configMap = jsonData;
        }.bind(this));

        //UI
        this.initUI();

        //点击事件
        this.initAllClickFunc();

        //
        this._hasLoginPlatform = cc.sys.localStorage.getItem("platform") || "";
    },

    cleanup:function(){
        this.removeAllCustomListeners();
        this._super();
    },

    initUI:function()
    {
        //var bgSprite = new cc.Sprite("bg_register.jpg");
        //this.addChild(bgSprite);
        //bgSprite.setPos(cc.pCenter(cc.winSize), ANCHOR_CENTER);

        var layer  = ccs.loadWithVisibleSize(res.LoginTypeLayer_json).node;
        // 加入到当前layer中。
        this.addChild(layer);
        //遮罩
        var backPanel = this._backPanel = ccui.helper.seekWidgetByName(layer, "backPanel");
        // 按钮
        var detailPanel = this._detailPanel = ccui.helper.seekWidgetByName(layer, "detailPanel");
        var phoneBtn = this._phoneBtn = ccui.helper.seekWidgetByName(detailPanel, "phoneBtn");
        var wechatBtn = this._wechatBtn = ccui.helper.seekWidgetByName(detailPanel, "wechatBtn");
        var qqBtn = this._qqBtn = ccui.helper.seekWidgetByName(detailPanel, "qqBtn");
        var weiboBtn = this._weiboBtn = ccui.helper.seekWidgetByName(detailPanel, "weiboBtn");
        var agreementBtn = this._agreementBtn = ccui.helper.seekWidgetByName(detailPanel, "agreementBtn");
        agreementBtn.setTitleText(this._configMap.agreementTitle);
        var goToBtn = this._goToBtn = ccui.helper.seekWidgetByName(detailPanel, "goToBtn");
        goToBtn.setVisible(false);
        //wechatBtn.setGray(true);
        //qqBtn.setGray(true);

        //先禁用这个
        weiboBtn.setGray(true);
    },

    //setBlankClickEnabled:function(isEnable)
    //{
    //    this._backPanel.setTouchEnabled(isEnable == true);
    //},

    initAllClickFunc:function()
    {
        //this._backPanel.addClickEventListener(function(sender) {
        //    MainController.playButtonSoundEffect(sender);
        //    MainController.popLayerFromRunningScene(this);
        //}.bind(this));

        //手机号登陆
        this._phoneBtn.addClickEventListener(function(sender)
        {
            var layer = new LoginLayer();
            MainController.pushLayerToRunningScene(layer);
        }.bind(this));

        //微信登陆
        this._wechatBtn.addClickEventListener(function(sender)
        {
            this.onThirdPlatformBtnClick("Wechat");
        }.bind(this));
        //QQ登陆
        this._qqBtn.addClickEventListener(function(sender)
        {
            this.onThirdPlatformBtnClick("QQ");
        }.bind(this));
        //微博登陆
        this._weiboBtn.addClickEventListener(function(sender)
        {
            this.onThirdPlatformBtnClick("SinaWeibo");
        }.bind(this));

        this._agreementBtn.addClickEventListener(function(sender) {
            MainController.playButtonSoundEffect();
            MainController.getInstance().showUserAgreementLayer(this._configMap);
        }.bind(this));

        this._goToBtn.addClickEventListener(function(sender) {
            MainController.playButtonSoundEffect();
            MainController.popLayerFromRunningScene(this);
            //登出
            MainController.getInstance().logout();
        }.bind(this));
    },

    onThirdPlatformBtnClick: function(platformName)
    {
        //if(Player.getInstance().isGuest() || this._hasLoginPlatform != platformName) {
        if(Player.getInstance().isLimited()) {
            //授权登录
            JavascriptBridge.getInstance().ShareSDKAuthorize(platformName);
        }
        else {
            // 签入
            new HttpRequest("userSignIn", {}, function(data){
                Player.getInstance().setOnline(true);
                cc.eventManager.dispatchCustomEvent(NOTIFY_REFRESH_LOGIN_STATE);
            }.bind(this));
        }
    }
});
