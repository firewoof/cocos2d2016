/**
 * 登录界面
 * Created by Administrator on 2016/5/6.
 */
MAX_ACCOUNT_NUM = 30;
MAX_PASSWORD_NUM = 20;

var LoginLayer = cc.Layer.extend({
    _loginButton:null,
    _accountEditBox:null,
    _passwordEditBox:null,

    _systemAnnouncement:"",

    _okButtonCallback : null,

    _session:"",
    _account:"",
    _password:"",

    ctor: function() {
        this._super()
        this.initUI();
    },

    initUI:function()
    {
        cc.log("----- initUI LoginLayer 4444 ok");

        var ui = cc.BuilderReader.load("ccbi/LoginLayer", this, this.getContentSize(), "ccbi");
        if (ui == null)
        {
            return;
        }

        // 登录按钮
        this.buttonLayer.initButton();
        this.buttonLayer.setTitleText(GameLocalString.getLocalString("LOGIN_LAYER_OK"));
        this.buttonLayer.setTitleFontSize(36);
        this.buttonLayer.addTouchCallBack(this.okButtonAction.bind(this));

        // 前端按钮
        this.changeFrontServerButton.setVisible(MainController.isTestChannel());
        if(MainController.isTestChannel())
        {
            this.changeFrontServerButton.initButton();
            this.changeFrontServerButton.setColorBlue();
            this.changeFrontServerButton.setTitleText("前端");
            this.changeFrontServerButton.setTitleFontSize(30);
            this.changeFrontServerButton.addTouchCallBack(this.changeFrontServerButtonAction.bind(this));
        }

        // 用户名
        this.accountTitleLabel.setString(GameLocalString.getLocalString("LOGIN_LAYER_ACCOUNT_NAME"));

        // 密码
        this.pwTitleLabel.setString(GameLocalString.getLocalString("LOGIN_LAYER_PW"));


        // 账号
        var editBoxSize = this.accountLayer.getContentSize();
        var editBoxSprite = new cc.Scale9Sprite("blank_tp1.png");
        editBoxSprite.setInsetLeft(20);
        editBoxSprite.setInsetTop(20);
        editBoxSprite.setInsetRight(20);
        editBoxSprite.setInsetBottom(20);

        var accountEditBox = new cc.EditBox(editBoxSize, editBoxSprite);
        this._accountEditBox = accountEditBox;
        accountEditBox.setFontColor(cc.WHITE);
        accountEditBox.setFontName(FONT_ARIAL_BOLD);
        accountEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
        accountEditBox.setMaxLength(MAX_ACCOUNT_NUM);
//        accountEditBox.setPlaceHolder(GameLocalString.getLocalString("LOGIN_LAYER_ACCOUNT_NAME"));
        this.accountLayer.addChild(accountEditBox, 100);
        accountEditBox.setPosition(centerInner(this.accountLayer));

        // 密码
        editBoxSize = this.pwLayer.getContentSize();
        editBoxSprite = new cc.Scale9Sprite("blank_tp1.png");
        editBoxSprite.setInsetLeft(20);
        editBoxSprite.setInsetTop(20);
        editBoxSprite.setInsetRight(20);
        editBoxSprite.setInsetBottom(20);

        var passwordEditBox = new cc.EditBox(editBoxSize, editBoxSprite);
        this._passwordEditBox = passwordEditBox;
        passwordEditBox.setFontColor(cc.WHITE);
        passwordEditBox.setFontName(FONT_ARIAL_BOLD);
        passwordEditBox.setInputFlag(cc.EDITBOX_INPUT_FLAG_PASSWORD);
//        passwordEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
        passwordEditBox.setMaxLength(MAX_PASSWORD_NUM);
//        passwordEditBox.setPlaceHolder(GameLocalString.getLocalString("LOGIN_LAYER_PW"));
        this.pwLayer.addChild(passwordEditBox);
        passwordEditBox.setPosition(centerInner(this.pwLayer));

        // 背景界面
        var popLayer = new PopLayer(ui);
        popLayer.setCloseButtonVisible(false);
        popLayer.setTitleString(GameLocalString.getLocalString("LOGIN_LAYER_TITLE"));
        this.addChild(popLayer);

        var account = cc.sys.localStorage.getItem("account");
        var password = cc.sys.localStorage.getItem("password");

        var name = "guest" + BPCommon.getRandomInteger(1, 9999);
        this._accountEditBox.setString( (!account || account == "") ? name: account);
        this._passwordEditBox.setString(password || "qqqqqq");

        if(USE_TEST_DATA)
        {
            this._accountEditBox.setString("10024");
            this._passwordEditBox.setString("qqqqqq");
        }
    },

    okButtonAction:function(button, event)
    {
        cc.log("----LoginLayer okButtonAction");
        MainController.playButtonSoundEffect(button);

        if(USE_TEST_DATA)
        {
            cc.log("----111 TO_TEST_CASE");
            this._testEnter();
            return;
        }

        this._account = this._accountEditBox.getString();
        this._password = this._passwordEditBox.getString();

        // 去掉左右空格
        this._account = this._account.trim();
        this._password = this._password.trim();

        // 提示账号不能为空
        if(this._account == "")
        {
            // 失去焦点
            this._passwordEditBox.onExit();
            this._accountEditBox.onExit();

            MainController.showAlertByText(GameLocalString.getLocalString("LOGIN_LAYER_TIPS1"), {callback:function(al) {
                this._passwordEditBox.onEnter();
                this._accountEditBox.onEnter();
//                this._accountEditBox.touchDownAction(null, ccui.Widget.TOUCH_ENDED);
                MainController.popLayerFromRunningScene(al);
            }.bind(this)});
            return;
        }

        // 提示密码不能为空
        if(this._password == "")
        {
            // 失去焦点
            this._passwordEditBox.onExit();
            this._accountEditBox.onExit();

            MainController.showAlertByText(GameLocalString.getLocalString("LOGIN_LAYER_TIPS2"), {callback:function(al) {
                this._passwordEditBox.onEnter();
                this._accountEditBox.onEnter();
//                this._passwordEditBox.touchDownAction(null, ccui.Widget.TOUCH_ENDED);
                MainController.popLayerFromRunningScene(al);
            }.bind(this)});
            return;
        }

        MainController.popLayerFromRunningScene(this);
        if(this._okButtonCallback)
        {
            this._okButtonCallback(this._account, this._password, this._cuid, this._session);
        }

    },

    /**
     * 测试登录
     */
    _testEnter: function() {

    }
})
