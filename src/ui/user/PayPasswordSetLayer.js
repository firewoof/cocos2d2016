/**
 * Created by Jony on 2016/9/5.
 */

var PayPasswordSetLayer = cc.Layer.extend({
    _passwordCompleted: false,
    _rePasswordCompleted: false,
    _phoneCompleted: false,
    _codeCompleted: false,

    ctor: function () {
        this._super();
        //UI
        this.initUI();
        //点击事件
        this.initAllClickFunc();
    },

    cleanup: function () {
        this.removeAllCustomListeners();
        this._super();
    },

    initUI: function () {
        var layer = ccs.loadWithVisibleSize(res.PayPasswordSetLayer_json).node;
        // 加入到当前layer中。
        this.addChild(layer);
        // 按钮
        var backBtn = this._backBtn = ccui.helper.seekWidgetByName(layer, "backBtn");

        var setPanel = this._setPanel = ccui.helper.seekWidgetByName(layer, "setPanel");
        var confirmBtn = this._confirmBtn = ccui.helper.seekWidgetByName(setPanel, "confirmBtn");
        this._confirmBtn.setGray(true);

        // 输入支付密码
        var payPasswordBg = ccui.helper.seekWidgetByName(setPanel, "payPasswordBg");
        this._payPasswordEditBox = new cc.EditBox(payPasswordBg.getContentSize(), new cc.Scale9Sprite("bg_common_bar.png"));
        payPasswordBg.addChild(this._payPasswordEditBox);
        this._payPasswordEditBox.setPosition(centerInner(payPasswordBg));
        this._payPasswordEditBox.setFontSize(24);
        this._payPasswordEditBox.setFontColor(cs.BLACK);
        this._payPasswordEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
        this._payPasswordEditBox.setInputFlag(cc.EDITBOX_INPUT_FLAG_PASSWORD);
        this._payPasswordEditBox.setPlaceHolder(LocalString.getString("PLEASE_INPUT_PAY_PASSWORD"));
        this._payPasswordEditBox.setPlaceholderFontColor(cs.GRAY);
        this._payPasswordEditBox.setPlaceholderFontSize(24);
        this._payPasswordEditBox.setMaxLength(6);
        this._payPasswordEditBox.setReturnType(cc.KEYBOARD_RETURNTYPE_DONE);
        this._payPasswordEditBox.setDelegate(this);

        // 再次输入支付密码
        var secondPayPasswordBg = ccui.helper.seekWidgetByName(setPanel, "secondPayPasswordBg");
        this._secondPayPasswordEditBox = new cc.EditBox(secondPayPasswordBg.getContentSize(), new cc.Scale9Sprite("bg_common_bar.png"));
        secondPayPasswordBg.addChild(this._secondPayPasswordEditBox);
        this._secondPayPasswordEditBox.setPosition(centerInner(secondPayPasswordBg));
        this._secondPayPasswordEditBox.setFontSize(24);
        this._secondPayPasswordEditBox.setFontColor(cs.BLACK);
        this._secondPayPasswordEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
        this._secondPayPasswordEditBox.setInputFlag(cc.EDITBOX_INPUT_FLAG_PASSWORD);
        this._secondPayPasswordEditBox.setPlaceHolder(LocalString.getString("PLEASE_RE_INPUT_PAY_PASSWORD"));
        this._secondPayPasswordEditBox.setPlaceholderFontColor(cs.GRAY);
        this._secondPayPasswordEditBox.setPlaceholderFontSize(24);
        this._secondPayPasswordEditBox.setMaxLength(6);
        this._secondPayPasswordEditBox.setReturnType(cc.KEYBOARD_RETURNTYPE_DONE);
        this._secondPayPasswordEditBox.setDelegate(this);

        // 输入手机号
        var accountBg = ccui.helper.seekWidgetByName(setPanel, "accountBg");
        this._accountEditBox = new cc.EditBox(accountBg.getContentSize(), new cc.Scale9Sprite("bg_common_bar.png"));
        accountBg.addChild(this._accountEditBox);
        this._accountEditBox.setPosition(centerInner(accountBg));
        this._accountEditBox.setFontSize(24);
        this._accountEditBox.setFontColor(cs.BLACK);
        this._accountEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_PHONENUMBER);
        this._accountEditBox.setPlaceHolder(LocalString.getString("PLEASE_INPUT_PHONE"));
        this._accountEditBox.setPlaceholderFontColor(cs.GRAY);
        this._accountEditBox.setPlaceholderFontSize(24);
        this._accountEditBox.setMaxLength(11);
        this._accountEditBox.setReturnType(cc.KEYBOARD_RETURNTYPE_DONE);
        this._accountEditBox.setDelegate(this);

        var getCodeBtn = this._getCodeBtn = ccui.helper.seekWidgetByName(setPanel, "getCodeBtn");
        var hasSendTxt = this._hasSendTxt = ccui.helper.seekWidgetByName(setPanel, "hasSendTxt");
        this.enableGetCodeBtnTouch(false);

        var phone = Player.getInstance().getPhone();
        if(phone != undefined && phone != ""){
            this._accountEditBox.setString(phone);
            this._accountEditBox.setEnabled(false);
            this.enableGetCodeBtnTouch(true);
        }
        // 验证码
        var codeBg = ccui.helper.seekWidgetByName(setPanel, "codeBg");
        this._codeEditBox = new cc.EditBox(codeBg.getContentSize(), new cc.Scale9Sprite("bg_common_bar.png"));
        codeBg.addChild(this._codeEditBox);
        this._codeEditBox.setPosition(centerInner(codeBg));
        this._codeEditBox.setFontSize(24);
        this._codeEditBox.setFontColor(cs.BLACK);
        this._codeEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
        this._codeEditBox.setPlaceHolder(LocalString.getString("PLEASE_INPUT_CODE"));
        this._codeEditBox.setPlaceholderFontColor(cs.GRAY);
        this._codeEditBox.setPlaceholderFontSize(24);
        this._codeEditBox.setMaxLength(6);
        this._codeEditBox.setReturnType(cc.KEYBOARD_RETURNTYPE_DONE);
        this._codeEditBox.setDelegate(this);

        // 结果面板
        var resultPanel = this._resultPanel = ccui.helper.seekWidgetByName(layer, "resultPanel");
        var resultConfirmBtn = this._resultConfirmBtn = ccui.helper.seekWidgetByName(resultPanel, "confirmBtn");
        //var resultStateTxt = this._resultStateTxt = ccui.helper.seekWidgetByName(resultPanel, "txt_result");
    },

    initAllClickFunc: function () {
        // 返回
        this._backBtn.addClickEventListener(function (sender) {
            MainController.playButtonSoundEffect(sender);
            MainController.popLayerFromRunningScene(this);
        }.bind(this));

        // 获取验证码按钮响应
        this._getCodeBtn.addClickEventListener(function (sender) {
            MainController.playButtonSoundEffect();
            var phone = this._accountEditBox.getString().trim();
            if(this.isInputPhoneLegal(phone))
            {
                // 获取验证码请求
                var get_code_req = {
                    auth: {phone: phone}
                };
                // 调用网络连接方法，获取data
                new HttpRequest("accountPassvcode", get_code_req, function(data){
                    cc.log("获取验证码成功");
                    this.enableGetCodeBtnTouch(false);
                    this.enableSendTxtCountDown(true);
                }.bind(this));
            }

        }.bind(this));

        // 点击确认按钮响应
        this._confirmBtn.addClickEventListener(function (sender) {
            MainController.playButtonSoundEffect();
            var firstPassword = Crypto.MD5(this._payPasswordEditBox.getString());
            var secondPassword =  Crypto.MD5( this._secondPayPasswordEditBox.getString());
            var tipTxt = "";
            if(firstPassword != secondPassword)
            {
                tipTxt = LocalString.getString("TWO_PASSWORD_NOT_EQUAL");
                this._payPasswordEditBox.setString("");
                this._secondPayPasswordEditBox.setString("");
            }
            if(tipTxt != ""){
                MainController.showAutoDisappearAlertByText(tipTxt);
                return;
            }

            var phone = this._accountEditBox.getString();
            var code = this._codeEditBox.getString();

            var req = {
                auth: { payPassword: firstPassword,
                        confirmPayPassword: secondPassword,
                        phone: phone,
                            vcode:code
                }
            };
            var succCallback = function(data)
            {
                ClientConfig.getInstance().setHasSetPayPassword(true);
                Player.getInstance().setPhone(phone);
                DataPool.curPayPassword = firstPassword;
                this.showResultPanel(true);
            }.bind(this);
            new HttpRequest("accountSetpass", req, succCallback);

        }.bind(this));

        this._resultConfirmBtn.addClickEventListener(function (sender) {
            MainController.playButtonSoundEffect(sender);
            MainController.popLayerFromRunningScene(this);
        }.bind(this));
    },

    editBoxEditingDidBegin: function (editBox) {
        if(this._accountEditBox == editBox) {
            if (this._getCodeBtn.isVisible())
                this.enableGetCodeBtnTouch(false);
        }
    },

    editBoxTextChanged: function (editBox, text) {
        var txt = text.trim();
        if(editBox == this._payPasswordEditBox) { this._passwordCompleted = txt.length == 6}
        else if(editBox == this._secondPayPasswordEditBox) {this._rePasswordCompleted = txt.length == 6}
        else if(editBox == this._accountEditBox) {this._phoneCompleted = txt.length  == 11;}
        else if(editBox == this._codeEditBox) {this._codeCompleted = txt.length == 6}

        this._confirmBtn.setGray(!this.isInputCompleted());
    },

    editBoxReturn: function (editBox) {
        var text = editBox.getString().trim();
        if(this._accountEditBox == editBox) {
            this.enableGetCodeBtnTouch(text != "")
        }

        if(editBox._tipsText){
            editBox._tipsText.setVisible(false);
        }
        if(editBox == this._payPasswordEditBox || editBox == this._secondPayPasswordEditBox){
            var reg = new RegExp(/^\d{6}$/);
            if(!reg.test(text)){
                this.showInputErrorTips("密码必须是6位数字", editBox);
            }
        }
        //cc.log("editBox  was returned !");
    },

    showInputErrorTips:function(tips, editBox){
        var parent = editBox.getParent();
        var tipsText = editBox._tipsText;
        if(!tipsText){
            tipsText = new cc.LabelTTF("", FONT_ARIAL_BOLD, 24);
            tipsText.setColor(cs.RED);
            parent.addChild(tipsText);
            tipsText.setAnchorPoint(ANCHOR_RIGHT);
            tipsText.setPos(rightInner(parent), ANCHOR_RIGHT);
            tipsText.setPositionXAdd(-25);
            editBox._tipsText = tipsText;
        }
        tipsText.setVisible(true);
        tipsText.setString(tips);
    },

    isInputCompleted: function()
    {
        if(this._codeCompleted && this._passwordCompleted && this._rePasswordCompleted)
            return true;
        return false;
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

    // 倒计时
    timer: function () {
        this._timeOut -= 1;
        if(this._timeOut == 0){

            this.enableSendTxtCountDown(false);
            this._getCodeBtn.setVisible(true);
            this.enableGetCodeBtnTouch(this._accountEditBox.getString().trim() != "");

            return;
        }
        this._hasSendTxt.setString(cc.formatStr(LocalString.getString("GET_CODE_COUNT_DOWN"), this._timeOut));
    },

    showResultPanel: function(visible)
    {
        this._resultPanel.setVisible(visible);
        this._setPanel.setVisible(!visible);
    },

    isInputPhoneLegal: function ( phone ) {
        var reg = /^1[3|4|5|7|8][0-9]{9}$/; //验证规则
        // var reg = /^1[0-9]{10}$/;
        if(phone.length<11 || !reg.test(phone)) {
            MainController.showAutoDisappearAlertByText(LocalString.getString("REGISTER_PHONE_NOT_OK"));

            return false;
        }

        return true;
    },
    isInputCodeLegal: function ( code ) {
        var reg = /^\d{6}$/;
        if(!reg.test(code)) {
            MainController.showAutoDisappearAlertByText(LocalString.getString("REGISTER_CODE_NOT_OK"));

            return false;
        }
        return true;
    }

});



var PayPasswordVerifyLayer = cc.Layer.extend({
    _defaultOpacity: 160,
    _password: "",

    ctor:function()
    {
        this._super();
        //UI
        this.initUI();

        //点击事件
        this.initAllClickFunc();
    },

    cleanup:function(){
        this.removeAllCustomListeners();
        this._super();
    },

    initUI:function()
    {
        //遮罩
        var mask = this._maskPanel = new ccui.Layout();
        mask.setContentSize(cc.winSize);
        mask.setBackGroundColorEx(cc.BLACK);
        mask.setBackGroundColorOpacity(this._defaultOpacity);
        this.addChild(mask);

        var layer  = ccs.loadWithVisibleSize(res.PayPasswordVerifyLayer_json).node;
        // 加入到当前layer中。
        this.addChild(layer);
        // 按钮
        var detailPanel = this._detailPanel = ccui.helper.seekWidgetByName(layer, "detailPanel");
        var detailPanelPos = ccui.helper.seekWidgetByName(layer, "detailPanel_posY");
        var confirmBtn = this._confirmBtn = ccui.helper.seekWidgetByName(detailPanel, "confirmBtn");
        var forgetBtn = this._forgetBtn = ccui.helper.seekWidgetByName(detailPanel, "forgetBtn");

        var numPanel = ccui.helper.seekWidgetByName(detailPanel, "numPanel");

        for(var i = 1;i<=6;i++)
        {
            this["_point" + i] = ccui.helper.seekWidgetByName(numPanel, "point_"+i);
        }

        var keyboardPanel = this._keyboardPanel = ccui.helper.seekWidgetByName(layer, "keyboardPanel");
        var keyboardPanelPos = ccui.helper.seekWidgetByName(layer, "keyboardPanel_posY");
        for(var i =0 ;i<10;i++)
        {
            this["_Btn"+i] = ccui.helper.seekWidgetByName(keyboardPanel, "Button_"+i);
        }
        var _delBtn = this._delBtn = ccui.helper.seekWidgetByName(keyboardPanel, "delBtn");
        var _okBtn = this._okBtn = ccui.helper.seekWidgetByName(keyboardPanel, "okBtn");

        this._keyboardPanel.runAction(cc.sequence(cc.delayTime(0.4), cc.moveTo(0.2,cc.p(keyboardPanelPos.x,keyboardPanelPos.y))));
        this._detailPanel.runAction(cc.sequence(cc.delayTime(0.4), cc.moveTo(0.2,cc.p(detailPanelPos.x,detailPanelPos.y))));
        //
        ////主动打开键盘
        //this._payPasswordEditBox.touchDownAction(this._payPasswordEditBox, ccui.Widget.TOUCH_ENDED);
    },

    initAllClickFunc:function() {
        this._maskPanel.setTouchEnabled(true);
        this._maskPanel.addClickEventListener(function (sender) {
            MainController.playButtonSoundEffect(sender);
            MainController.popLayerFromRunningScene(this);
            //if(cc.sys.isMobile) buglySetTag(26232);
        }.bind(this));

        this._forgetBtn.addClickEventListener(function (sender) {
            MainController.playButtonSoundEffect(sender);
            MainController.popLayerFromRunningScene(this);
            // 重新设置支付密码
            MainController.pushLayerToRunningScene(new PayPasswordSetLayer());
        }.bind(this));

        this._okBtn.addClickEventListener(function (sender) {
            MainController.playButtonSoundEffect(sender);

            var tipTxt = "";
            if(this._password.length == 0)
            {
                tipTxt = LocalString.getString("PASSWORD_VERIFY_NULL");
            }
            else if(this._password.length != 6)
            {
                tipTxt = LocalString.getString("PASSWORD_VERIFY_NEED_SIX");
            }

            if(tipTxt != "")
            {
                MainController.showAutoDisappearAlertByText(tipTxt);
                return;
            }
            cc.log("this._password: " +this._password);
            var payPassword = Crypto.MD5(this._password);
            var req = {
                auth:{payPassword: payPassword}
                };

            var curLayer = this;

            var sucCallback = function()
            {
                DataPool.curPayPassword = payPassword;
                var appRechargeType = ClientConfig.getInstance().getAppRechargeType();
                if(appRechargeType == 8) {
                    // 曝光币直接跳到对方提供的Web提现页面
                    var req = {};
                    new HttpRequest("queryChudianyunWithdrawHtml", req, function(data){
                        var layer = new WebPayLayer(data.html, LocalString.getString("WITHDRAW_WEB_TITLE"), "chudianyun.com");
                        layer.disableDetector();
                        MainController.pushLayerToRunningScene(layer);
                        MainController.popLayerFromRunningScene(curLayer);
                    });
                }
                else {
                    //打开提现界面
                    var layer = new CashOutLayer();
                    MainController.pushLayerToRunningScene(layer);
                    MainController.popLayerFromRunningScene(curLayer);
                }
            }.bind(this);

            var errCallback = function()
            {
                for(var i = 1;i<=6;i++)
                {
                    this["_point" + i].setVisible(false);
                }

                this._password = "";
            }.bind(this);
            // 验证支付密码是否正确
            new HttpRequest("accountCheckpass", req, sucCallback, errCallback);

        }.bind(this));

        for(var i =0 ;i<10;i++)
        {
            this["_Btn"+i].param = i;
            this["_Btn"+i].addClickEventListener(function(sender) {
                MainController.playButtonSoundEffect();
                if(this._password.length < 6)
                {
                    this._password += sender.param;
                    this["_point" + this._password.length].setVisible(true);
                }
            }.bind(this));
        }
        this._delBtn.addClickEventListener(function(sender) {
           MainController.playButtonSoundEffect();
           if(this._password.length > 0)
           {
               this["_point" + this._password.length].setVisible(false);
               this._password = this._password.substr(0,this._password.length - 1);
           }
        }.bind(this));
    }
});