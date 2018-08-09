/**
 * 充值前用户姓名录入
 * Created by Administrator on 2017/4/25.
 */
var UserAuthentication = BaseLayer.extend({
    _account: "",            //待验证的手机号码
    _hasChekedPhone:"",      //已验证的手机号码
    _isCheckCode:false,     //是否已经验证过验证码

    ctor:function() {
        this._super();

        this.initUI();
        this.initAllButtonClick();

        this.setFullScreenOpaque(false);


        //this._blockPanel.addClickEventListener(function(){
        //    MainController.popLayerFromRunningScene(this);
        //}.bind(this));

    },
    initUI:function(){

        var rootNode = ccs.loadWithVisibleSize(res.UserInfoAuthentication_json).node;

        this.addChild(rootNode);

        var userNameEditBoxPanel = this._userNameEditBoxPanel = ccui.helper.seekWidgetByName(rootNode,"userNameEditBoxPanel");

        this._userNameEditBox = new cc.EditBox(userNameEditBoxPanel.getContentSize(),new cc.Scale9Sprite("bg_common_bottom_frame.png"));
        userNameEditBoxPanel.addChild(this._userNameEditBox);
        this._userNameEditBox.setPosition(centerInner(userNameEditBoxPanel));
        this._userNameEditBox.setFontSize(24);
        this._userNameEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
        this._userNameEditBox.setMaxLength(15);
        this._userNameEditBox.setFontColor(cs.BLACK);
        this._userNameEditBox.setPlaceHolder(LocalString.getString("PLEASE_INPUT_NAME"));
        this._userNameEditBox.setPlaceholderFontColor(cs.GRAY);
        this._userNameEditBox.setPlaceholderFontSize(24);
        this._userNameEditBox.setDelegate(this);

        var obtainVerfyCodeBtn = this._obtainVerfyCodeBtn = ccui.helper.seekWidgetByName(rootNode,"obtainVerfyCodeBtn");

        var userPhoneEditBoxPanel = this._userPhoneEditBoxPanel = ccui.helper.seekWidgetByName(rootNode,"userPhoneEditBoxPanel");
        var panelSize = userPhoneEditBoxPanel.getContentSize();
        var diff = 25;
        var editBoxSize = cc.size(panelSize.width - obtainVerfyCodeBtn.getContentSize().width - diff , panelSize.height);
        this._userPhoneEditBox = new cc.EditBox(editBoxSize,new cc.Scale9Sprite("bg_common_bottom_frame.png"));
        userPhoneEditBoxPanel.addChild(this._userPhoneEditBox);
        this._userPhoneEditBox.setPos(leftInner(userPhoneEditBoxPanel), ANCHOR_LEFT);
        this._userPhoneEditBox.setFontSize(24);
        this._userPhoneEditBox.setFontColor(cs.BLACK);
        this._userPhoneEditBox.setMaxLength(11);
        this._userPhoneEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
        this._userPhoneEditBox.setPlaceHolder(LocalString.getString("PLEASE_INPUT_PHONE"));
        this._userPhoneEditBox.setPlaceholderFontColor(cs.GRAY);
        this._userPhoneEditBox.setPlaceholderFontSize(24);
        this._userPhoneEditBox.setDelegate(this);

        var phone = Player.getInstance().getPhone();
        if(phone != undefined && phone != ""){
            this._userPhoneEditBox.setString(phone);
            this._userPhoneEditBox.setEnabled(false);
        }

        var verfyCodeEditBoxPanel = this._verfyCodeEditBoxPanel = ccui.helper.seekWidgetByName(rootNode,"verfyCodeEditBoxPanel");
        this._verifyCodeEditBox = new cc.EditBox(verfyCodeEditBoxPanel.getContentSize(),new cc.Scale9Sprite("bg_common_bottom_frame.png"));
        verfyCodeEditBoxPanel.addChild(this._verifyCodeEditBox);
        this._verifyCodeEditBox.setPosition(centerInner(verfyCodeEditBoxPanel));
        this._verifyCodeEditBox.setFontSize(24);
        this._verifyCodeEditBox.setFontColor(cs.BLACK);
        this._verifyCodeEditBox.setMaxLength(6);
        this._verifyCodeEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
        this._verifyCodeEditBox.setPlaceHolder(LocalString.getString("PLEASE_INPUT_CODE"));
        this._verifyCodeEditBox.setPlaceholderFontColor(cs.GRAY);
        this._verifyCodeEditBox.setPlaceholderFontSize(24);
        this._verifyCodeEditBox.setDelegate(this);

        var hasSendTxt = this._hasSendTxt = ccui.helper.seekWidgetByName(rootNode, "hasSendTxt");

        var sureBtn = this._sureBtn = ccui.helper.seekWidgetByName(rootNode,"sureBtn");

        var closeBtn = this._closeBtn = ccui.helper.seekWidgetByName(rootNode,"closeBtn");

    },

    initAllButtonClick:function(){

        this._obtainVerfyCodeBtn.addClickEventListener(function(sender) {
            cc.log("获取验证码");
            this.onGetCodeBtnClick();
        }.bind(this));

        this._sureBtn.addClickEventListener(function(sender){

            var realName = this._userNameEditBox.getString().trim();
            var phone = this._userPhoneEditBox.getString().trim();
            var code = this._verifyCodeEditBox.getString().trim();
            var txtTip = "";
            if(realName.length == 0)
            {
                txtTip = LocalString.getString("PLEASE_INPUT_REALNAME");
            }
            else if(phone.length == 0)
            {
                txtTip = LocalString.getString("PLEASE_INPUT_PHONE");
            }
            else if(code.length == 0)
            {
                txtTip = LocalString.getString("PLEASE_INPUT_CODE");
            }
            else if(this._account.length == 0)
            {
                txtTip = LocalString.getString("PLEASE_REQUEST_CODE");
            }
            else if(this._account != phone)
            {
                this._isCheckCode = false;
                txtTip = LocalString.getString("PLEASE_REQUEST_CODE_AGAIN");
            }
            else if(this._hasChekedPhone == phone){
                this._isCheckCode = true;
            }

            if(txtTip != "")
            {
                MainController.showAutoDisappearAlertByText(txtTip);
                return;
            }

            var callBack = function(){
                MainController.getInstance().hideLoadingWaitLayer();
                MainController.popLayerFromRunningScene(this);

                Player.getInstance().setPhone(phone);
                Player.getInstance().setRealName(realName);
                //再次弹出充值界面
                MainController.getInstance().showRechargeLayer();
            }.bind(this);

            if(this.isInputPhoneLegal(phone) && this.isInputCodeLegal(code))
            {
                var successCallBack = function(){
                    this._hasChekedPhone = phone;
                    HttpManager.requestSaveRealName(callBack,realName,phone);
                }.bind(this);

                if(this._isCheckCode){
                    HttpManager.requestSaveRealName(callBack,realName,phone);
                }
                else
                {
                    MainController.getInstance().showLoadingWaitLayer();
                    HttpManager.requestCheckVcode(successCallBack, phone, code);
                }
            }

        }.bind(this));

        this._closeBtn.addClickEventListener(function(sender){
            MainController.popLayerFromRunningScene(this);
        }.bind(this));

    },

    // 点击获取验证码按钮响应
    onGetCodeBtnClick: function () {
        //待验证的手机号码
        var phone = this._userPhoneEditBox.getString().trim();
        DataPool.verifyPhone = phone;
        if(this.isInputPhoneLegal(phone))
        {
            this._obtainVerfyCodeBtn.setGray(true);
            this.doRequestVerifyCode(phone);
        }
    },

    /**
     * 请求验证码
     */
    doRequestVerifyCode:function(phone){
        this._obtainVerfyCodeBtn.setGray(true);
        var errfuc = function()
        {
            this._obtainVerfyCodeBtn.setGray(false);
        }.bind(this);

        var successCallBack = function(data){
            cc.log("获取验证码成功");
            this._account = this._userPhoneEditBox.getString().trim();
            this._obtainVerfyCodeBtn.setGray(false);
            this.enableGetCodeBtnTouch(false);
            this.enableSendTxtCountDown(true);

        }.bind(this);

        HttpManager.requestGetCode(successCallBack, errfuc, phone);
    },

    // 更改获取验证码按钮显示状态
    enableGetCodeBtnTouch: function ( enabled ) {
        this._obtainVerfyCodeBtn.setTouchEnabled(enabled);
        if( enabled ) {
            this._obtainVerfyCodeBtn.setGray(false);
        }
        else {
            this._obtainVerfyCodeBtn.setGray(true);

        }
    },

    // 更改倒计时文本
    enableSendTxtCountDown: function ( enabled ) {
        if( enabled ) {
            this._obtainVerfyCodeBtn.setVisible(false);
            this._hasSendTxt.setVisible(true);
            //timer倒计时60
            this._timeOut = 60;
            this._hasSendTxt.setString(cc.formatStr(LocalString.getString("GET_CODE_COUNT_DOWN"), this._timeOut));
            this._hasSendTxt.schedule(this.timer.bind(this),1,this._timeOut);
        }
        else {
            this._obtainVerfyCodeBtn.setVisible(true);
            this._hasSendTxt.setVisible(false);
            this._hasSendTxt.setString("");
            this._hasSendTxt.unscheduleAllCallbacks();
        }
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

    // 倒计时
    timer: function () {
        this._timeOut -= 1;
        if(this._timeOut == 0){

            this.enableSendTxtCountDown(false);
            this._obtainVerfyCodeBtn.setVisible(true);
            this.enableGetCodeBtnTouch(this._account != "");

            return;
        }
        this._hasSendTxt.setString(cc.formatStr(LocalString.getString("GET_CODE_COUNT_DOWN"), this._timeOut));
    }
});