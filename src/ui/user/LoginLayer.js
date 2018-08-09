/**
 * 登录界面
 * Created by Administrator on 2016/5/6.
 */
var LoginLayer = cc.Layer.extend({
    _loginType: 0,
    _account: "",
    _code: "",
    _configMap: {},

    ctor: function() {
        this._super();

        cc.loader.loadJson("res/arts/CustomConfig.json",function(err, jsonData){
            this._configMap = jsonData;
        }.bind(this));

        this.initUI();
        this.initAllButtonClick();
    },

    initUI:function()
    {
        //var bgSprite = new cc.Sprite("bg_register.jpg");
        //this.addChild(bgSprite);
        //bgSprite.setPos(cc.pCenter(cc.winSize), ANCHOR_CENTER);

        var layer = ccs.loadWithVisibleSize(res.LoginLayer_json).node;
        //加入到当前layer中。
        this.addChild(layer);

        var backPanel = this._backPanel = ccui.helper.seekWidgetByName(layer, "backPanel");

        var registerPanel = this._registerPanel =ccui.helper.seekWidgetByName(layer, "registerPanel");
        var getCodeBtn = this._getCodeBtn = ccui.helper.seekWidgetByName(registerPanel, "getCodeBtn");
        var hasSendTxt = this._hasSendTxt = ccui.helper.seekWidgetByName(registerPanel, "hasSendTxt");
        var confirmBtn = this._confirmBtn = ccui.helper.seekWidgetByName(registerPanel, "confirmBtn");
        var agreementBtn = this._agreementBtn = ccui.helper.seekWidgetByName(registerPanel, "agreementBtn");
        agreementBtn.setTitleText(this._configMap.agreementTitle);
        var agreementText = ccui.helper.seekWidgetByName(registerPanel, "Text_7");
        if (isEducationVersion) {
            agreementBtn.setVisible(false);
            agreementText.setVisible(false);
        }

        var accountBtn = this._accountBtn = ccui.helper.seekWidgetByName(registerPanel, "accountBtn");
        var accountBtnTxt = ccui.helper.seekWidgetByName(accountBtn, "txt");
        this._accountBtnTxt = new ccui.Text("xx", FONT_ARIAL_BOLD, 24);
        accountBtnTxt.addChild(this._accountBtnTxt);
        this._accountBtnTxt.setAnchorPoint(0, 0.5);
        //this._accountBtnTxt.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
        this._accountBtnTxt.setPos(leftInner(accountBtnTxt), ANCHOR_LEFT);

        var codeBtn = this._codeBtn = ccui.helper.seekWidgetByName(registerPanel, "codeBtn");
        var codeBtnTxt = ccui.helper.seekWidgetByName(codeBtn, "txt");
        this._codeBtnTxt = new ccui.Text("", FONT_ARIAL_BOLD, 24);
        codeBtnTxt.addChild(this._codeBtnTxt);
        this._codeBtnTxt.setAnchorPoint(0, 0.5);
        this._codeBtnTxt.setPos(leftInner(codeBtnTxt), ANCHOR_LEFT);

        var keyboardPanel = this._keyboardPanel = ccui.helper.seekWidgetByName(layer, "keyboardPanel");
        for(var i =0 ;i<10;i++)
        {
            this["_Btn"+i] = ccui.helper.seekWidgetByName(keyboardPanel, "Button_"+i);
        }
        var _delBtn = this._delBtn = ccui.helper.seekWidgetByName(keyboardPanel, "delBtn");
        var _okBtn = this._okBtn = ccui.helper.seekWidgetByName(keyboardPanel, "okBtn");

        this.initRegisterState();

        //光标
        this._accountLight = new ccui.Text("|", FONT_ARIAL_BOLD, 30);
        //this._accountLight.setColor(cc.color(0,0,0));
        this._accountLight.setAnchorPoint(0, 0.5);
        //this.addChild(this._light);
        var seq = cc.sequence(cc.fadeIn(0.3),cc.delayTime(0.3),cc.fadeOut(0.3));
        var forever = cc.repeatForever(seq);
        this._accountLight.runAction(forever);
        this._accountLight.setVisible(false);

        this._accountBtnTxt.addChild(this._accountLight);

        //光标
        this._codeLight = new ccui.Text("|", FONT_ARIAL_BOLD, 30);
        //this._codeLight.setColor(cc.color(0,0,0));
        this._codeLight.setAnchorPoint(0, 0.5);
        //this.addChild(this._codeLight);
        var seq = cc.sequence(cc.fadeIn(0.3),cc.delayTime(0.3),cc.fadeOut(0.3));
        var forever = cc.repeatForever(seq);
        this._codeLight.runAction(forever);

        this._codeBtnTxt.addChild(this._codeLight);
        this._codeLight.setVisible(false);

        //增加返回按钮
        var closeBtn = this._closeBtn = new ccui.Button("icon_common_back_new.png", "","", ccui.Widget.PLIST_TEXTURE);
        this.addChild(closeBtn);
        closeBtn.setPos(cc.p(15, cc.winSize.height - 15), ANCHOR_LEFT_TOP);
        closeBtn.setVisible(true);
    },

    //setBlankClickEnabled:function(isEnable)
    //{
    //    this._backPanel.setTouchEnabled(isEnable == true);
    //    this._closeBtn.setVisible(isEnable == false);
    //},

    initAllButtonClick: function (sender) {
        this._closeBtn.addClickEventListener(function(){
            MainController.popLayerFromRunningScene(this);
            ClientLoginModule.getInstance().showLoginType();
        }.bind(this));

        //this._backPanel.addClickEventListener(function(sender) {
        //    MainController.playButtonSoundEffect(sender);
        //    MainController.popLayerFromRunningScene(this);
        //}.bind(this));

        this._agreementBtn.addClickEventListener(function(sender) {
            MainController.playButtonSoundEffect();
            MainController.getInstance().showUserAgreementLayer(this._configMap);
        }.bind(this));

        this._getCodeBtn.addClickEventListener(function(sender) {
            this.onGetCodeBtnClick();
        }.bind(this));

        this._accountBtn.addClickEventListener(function(sender) {
            this.openKeyboard();
            this._attachText = this._accountBtnTxt;
            this._codeLight.setVisible(false);
            if(this._codeBtnTxt.getString() == "")
            {
                this.showPlaceHolder(this._codeBtnTxt);
            }
            this.freshInputText();
        }.bind(this));
        this._codeBtn.addClickEventListener(function(sender) {
            this.openKeyboard();
            this._attachText = this._codeBtnTxt;
            this._accountLight.setVisible(false);
            if(this._accountBtnTxt.getString() == "")
            {
                this.showPlaceHolder(this._accountBtnTxt);
            }
            this.freshInputText();
        }.bind(this));

        for(var i =0 ;i<10;i++)
        {
            this["_Btn"+i].param = i;
            this["_Btn"+i].addClickEventListener(function(sender) {
                MainController.playButtonSoundEffect();
                var oldStr = this._attachText.getString();
                var newStr = oldStr + sender.param;
                if( this._attachText == this._accountBtnTxt)
                {
                     if(oldStr.length == 11)
                         return;
                     this._account = newStr;
                    if(newStr.length == 11)
                    {
                        this.enableGetCodeBtnTouch(true);
                    }
                }
                else
                {
                     if(oldStr.length == 6)
                         return;
                     this._code = newStr;
                }

                this.freshInputText();
            }.bind(this));
        }

        //this._delBtn.addLongTouchEventListener(function(sender) {
        //    cc.log("this._delBtn.addLongTouchEventListener(function(sender) {");
        //    if( this._attachText == this._accountBtnTxt)
        //    {
        //        this._account = this._account.substring(0,this._account.length-1);
        //        //this._attachText.setString(this._account);
        //        if(this._account.length != 11)
        //        {
        //            this.enableGetCodeBtnTouch(false);
        //        }
        //    }
        //    else
        //    {
        //        this._code = this._code.substring(0,this._code.length-1);
        //        //this._attachText.setString(this._code);
        //    }
        //
        //    this.freshInputText();
        //
        //}.bind(this));

        this._delBtn.addClickEventListener(function(sender) {
            MainController.playButtonSoundEffect();
            if( this._attachText == this._accountBtnTxt)
            {
                this._account = this._account.substring(0,this._account.length-1);
                //this._attachText.setString(this._account);
                if(this._account.length != 11)
                {
                    this.enableGetCodeBtnTouch(false);
                }
            }
            else
            {
                this._code = this._code.substring(0,this._code.length-1);
                //this._attachText.setString(this._code);
            }

            this.freshInputText();
        }.bind(this));

        this._okBtn.addClickEventListener(function(sender) {
            this.hideKeyboard();
        }.bind(this));

        this._confirmBtn.addClickEventListener(function(sender) 
        {
            var self = this;
            DataPool.hasLogin = false;
            var phone = this._account;
            var code = this._code;
            if(this.isInputPhoneLegal(phone) && this.isInputCodeLegal(code))
            {
                DataPool.platform = GB.LOGIN_FLATFORM_PHONE;
                DataPool.phone = phone;
                var req = {
                    auth:{
                        phone: phone,
                        code: code,
                        agentId: DeviceInfoManager.getInstance().getChannel(),
                        invitedCode:GB.invitationCode,
                        platform: cc.sys.os,
                        appStore: appStoreName
                    }
                };

                DataPool.hasLogin = false;
                DataPool.registerURL = "register";
                DataPool.registerData = req;
                DataPool.platform = GB.LOGIN_FLATFORM_PHONE;
                DataPool.showId = null;
                DataPool.vcode = code;
                cc.sys.localStorage.removeItem("aesKey");
                cc.sys.localStorage.removeItem("accessToken");

                if(GB.isSplitLoginModel){
                    ProxyClientLoginer.chooseLoginMode();
                }else{
                    var successCallBack = function(){
                        ProxyClientLoginer.chooseLoginMode();
                    };
                    HttpManager.requestCheckVcode(successCallBack, phone, code)
                }
            }
        }.bind(this));
    },

    //requestConfirm:function(){
    //    var phone = this._account;
    //    var code = this._code;
    //    var successCallBack = function(){
    //        ProxyClientLoginer.login();
    //    };
    //    HttpManager.requestCheckVcode(successCallBack, phone, code)
    //},

    // 初始化注册状态
    initRegisterState: function () {
        this._account = "";
        this._code = "";
        this.showPlaceHolder(this._accountBtnTxt);
        this.showPlaceHolder(this._codeBtnTxt);

        this.enableGetCodeBtnTouch(false);
        this.enableSendTxtCountDown(false);

        if(this._isKeyboardOpen)
        {
            this.hideKeyboard();
        }
    },

    // 初始化注册状态
    showPlaceHolder: function (attachTxt) {
        var originalStr = attachTxt == this._accountBtnTxt? LocalString.getString("PLEASE_INPUT_PHONE"):LocalString.getString("PLEASE_INPUT_CODE");
        attachTxt.setString(originalStr);
        attachTxt.setColor(cc.color.GRAY);
    },

    // 更改获取验证码按钮显示状态
    enableGetCodeBtnTouch: function ( enabled ) {
        this._getCodeBtn.setTouchEnabled(enabled);
        if( enabled ) {
            this._getCodeBtn.setGray(false);
            //this._getCodeBtn.setColor(cc.color(71,188,248));
        }
        else {
            this._getCodeBtn.setGray(true);
            //this._getCodeBtn.setColor(cc.color.GRAY);
        }
    },
    // 更改倒计时文本
    enableSendTxtCountDown: function ( enabled ) {
        if( enabled ) {
            this._getCodeBtn.setVisible(false);
            this._hasSendTxt.setVisible(true);
            //timer倒计时60
            this._timeOut = 60;
            this._hasSendTxt.setString(cc.formatStr(LocalString.getString("GET_CODE_COUNT_DOWN"), this._timeOut));
            this._hasSendTxt.schedule(this.timer.bind(this),1,this._timeOut);
        }
        else {
            this._getCodeBtn.setVisible(true);
            this._hasSendTxt.setVisible(false);
            this._hasSendTxt.setString("");
            this._hasSendTxt.unscheduleAllCallbacks();
        }
    },
    // 点击获取验证码按钮响应
    onGetCodeBtnClick: function () {
        //待验证的手机号码
        DataPool.verifyPhone = this._account;
        var callback = function()
        {
            var phone = this._account;
            if(this.isInputPhoneLegal(phone))
            {
                this._getCodeBtn.setGray(true);

                if(GB.isSplitLoginModel){
                    this.requestVCode();
                }else{
                    this.oldRequestVCode();
                }
            }

        }.bind(this);

        //先验证检查是否需要邀请码(不需要则立即返回)
        MainController.getInstance().checkInvitationBind(callback);
    },

    requestVCode:function(){
        this._getCodeBtn.setGray(true);
        var errfuc = function()
        {
            this._getCodeBtn.setGray(false);
        }.bind(this);

        var successCallBack = function(data){
            cc.log("获取验证码成功");
            this._getCodeBtn.setGray(false);
            this.enableGetCodeBtnTouch(false);
            this.enableSendTxtCountDown(true);

            //自动切换验证码响应
            this.openKeyboard();
            this._attachText = this._codeBtnTxt;
            this._accountLight.setVisible(false);
            if(this._accountBtnTxt.getString() == "")
            {
                this.showPlaceHolder(this._accountBtnTxt);
            }
            this.freshInputText();
        }.bind(this);

        HttpManager.requestPhoneVerifyCode(successCallBack, errfuc, this._account);
    },

    oldRequestVCode:function(){
        var phone = this._account;
        // 获取验证码请求
        var get_code_req = {
            auth: {
                phone: phone,
                agentId: DeviceInfoManager.getInstance().getChannel()
            }
        };
        var errfuc = function()
        {
            this._getCodeBtn.setGray(false);
        }.bind(this);

        var args = {
            "urlKey":"getCode",
            "sendData":get_code_req,
            "successCallBack":function(data){
                cc.log("获取验证码成功");
                this._getCodeBtn.setGray(false);
                this.enableGetCodeBtnTouch(false);
                this.enableSendTxtCountDown(true);

                //自动切换验证码响应
                this.openKeyboard();
                this._attachText = this._codeBtnTxt;
                this._accountLight.setVisible(false);
                if(this._accountBtnTxt.getString() == "")
                {
                    this.showPlaceHolder(this._accountBtnTxt);
                }
                this.freshInputText();

            }.bind(this),
            "errorCallBack":errfuc,
            "isAutoToken":false,
            "encryptType":"RSA",
            "tryCount": 3,
            "showTips": true
        };
        HttpManager.sendRequest(args);
    },
    
    // 倒计时
    timer: function () {
        this._timeOut -= 1;
        if(this._timeOut == 0){

            this.enableSendTxtCountDown(false);
            this._getCodeBtn.setVisible(true);
            this.enableGetCodeBtnTouch(this._account != "");

            return;
        }
        this._hasSendTxt.setString(cc.formatStr(LocalString.getString("GET_CODE_COUNT_DOWN"), this._timeOut));
    },

    isInputPhoneLegal: function ( phone ) {
        if(phone.length == 0) {
            MainController.showAutoDisappearAlertByText(LocalString.getString("PLEASE_INPUT_PHONE"));
            return false;
        }
        var reg = /^1[3|4|5|7|8][0-9]{9}$/;
        if(phone.length<11 || !reg.test(phone)) {
            MainController.showAutoDisappearAlertByText(LocalString.getString("REGISTER_PHONE_NOT_OK"));
            return false;
        }
        return true;
    },

    isInputCodeLegal: function ( code ) {
        if(code.length == 0) {
            MainController.showAutoDisappearAlertByText(LocalString.getString("PLEASE_INPUT_CODE"));
            return false;
        }
        var reg = /^\d{6}$/;
        if(!reg.test(code)) {
            MainController.showAutoDisappearAlertByText(LocalString.getString("REGISTER_CODE_NOT_OK"));
            return false;
        }
        return true;
    },

    openKeyboard: function( )
    {
        if(!this._isKeyboardOpen)
        {
            this._keyboardPanel.runAction(
                cc.sequence(cc.callFunc(function() {
                    //this._confirmBtn.setVisible(false);
                }.bind(this)) , cc.moveBy(0.3,cc.p(-this._keyboardPanel.width, 0)) )
            );

            this._isKeyboardOpen = true;
        }

    },

    hideKeyboard: function(  )
    {
        var light = (this._attachText == this._accountBtnTxt) ? this._accountLight : this._codeLight;
        light.setVisible(false);
        this._keyboardPanel.runAction(
            cc.sequence(cc.moveBy(0.3,cc.p(this._keyboardPanel.width, 0)),
            cc.callFunc(function() {
                  //this._confirmBtn.setVisible(true);
                    if(this._attachText.getString() == "")
                    {
                        this.showPlaceHolder(this._attachText);
                    }
                }.bind(this)))
        );

        this._isKeyboardOpen = false;
    },

    freshInputText: function()
    {
        var str = (this._attachText == this._accountBtnTxt) ? this._account : this._code;
        this._attachText.setString(str);
        this._attachText.setColor(cc.color.WHITE);

        var light = (this._attachText == this._accountBtnTxt) ? this._accountLight : this._codeLight;
        light.setVisible(true);
        light.setPos(cc.p(this._attachText.width + 4,this._attachText.height/2 + 4));
    }


});