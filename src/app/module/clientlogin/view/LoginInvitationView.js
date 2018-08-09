/**
 * Created by Administrator on 2017-04-08.
 */

GB.LOGIN_FLATFORM_WECHAT = "Wechat";
GB.LOGIN_FLATFORM_SINA_WEIBO = "SinaWeibo";
GB.LOGIN_FLATFORM_QQ = "QQ";
GB.LOGIN_FLATFORM_PHONE = "Phone";

//邀请码长度
GB.INVITATION_CODE_LEN = 8;

//登录-邀请码模式
var LoginInvitationView = BaseLayer.extend({

    ctor: function () {
        this._super("LoginInvitationView");

        this.setOpacity(0);
        //设置点击退出层
        var touchPanel = new ccui.Layout();
        touchPanel.setContentSize(cc.winSize);
        this.addChild(touchPanel);
        touchPanel.setTouchEnabled(true);

        this.initUI();

        this.initAllButtonClick();
    },

    //editBoxEditingDidBegin:function()
    //{
    //    this._verifyTipsText.setOpacity(0);
    //    this._verifyTipsText.stopAllActions();
    //},

    initUI: function() {

        //创建验证界面层
        var rootLayer = this._rootLayer = ccs.load(res.SplitInvitationCodeView_json).node;
        this.addChild(rootLayer);
        rootLayer.setPos(cc.p(cc.winSize.width / 2, cc.winSize.height / 2), ANCHOR_CENTER);
        rootLayer.setTouchEventEnabled(true);

        //从Studio中取出需要的组件
        var bottomPanel = ccui.helper.seekWidgetByName(rootLayer, "bottomPanel");
        var verifyTipsText = this._verifyTipsText = ccui.helper.seekWidgetByName(rootLayer, "verifyTipsText");
        var editBgPanel = ccui.helper.seekWidgetByName(rootLayer, "editBgPanel");
        var keyboardPanel = this._keyboardPanel = ccui.helper.seekWidgetByName(bottomPanel, "keyboardPanel");
        verifyTipsText.setOpacity(0);

        var marginLeft = 4;
        //光标
        var cursor = this._cursor = new ccui.Text("|", FONT_ARIAL_BOLD, 30);
        cursor.setAnchorPoint(ANCHOR_LEFT);
        editBgPanel.addChild(cursor);
        cursor.setPos(cc.p(marginLeft, editBgPanel.height * 0.5), ANCHOR_LEFT);
        cursor.setAnchorPoint(0, 0.5);
        var seq = cc.sequence(cc.fadeIn(0.3),cc.delayTime(0.3),cc.fadeOut(0.3));
        var forever = cc.repeatForever(seq);
        cursor.runAction(forever);

        var codeText = this._codeText = new ccui.Text("", FONT_ARIAL_BOLD, 30);
        codeText.setAnchorPoint(ANCHOR_LEFT);
        editBgPanel.addChild(codeText);
        codeText.setPos(cc.p(marginLeft, editBgPanel.height * 0.5), ANCHOR_LEFT);

        //增加返回按钮
        var closeBtn = this._closeBtn = new ccui.Button("icon_common_back_new.png", "","", ccui.Widget.PLIST_TEXTURE);
        this.addChild(closeBtn);
        closeBtn.setPos(cc.p(15, cc.winSize.height - 15), ANCHOR_LEFT_TOP);

        //
        this.freshInputText("");
    },

    initAllButtonClick: function()
    {
        this.initKeyBoard();

        this._closeBtn.addClickEventListener(function(sender){
            MainController.popLayerFromRunningScene(this);
            ClientLoginModule.getInstance().showLoginType();
        }.bind(this));
    },

    initKeyBoard:function()
    {
        var delBtn = ccui.helper.seekWidgetByName(this._keyboardPanel, "delBtn");
        var okBtn = ccui.helper.seekWidgetByName(this._keyboardPanel, "okBtn");

        delBtn.addClickEventListener(function()
        {
            var oldStr = this._codeText.getString();
            var newStr = oldStr.substr(0, oldStr.length - 1);
            this.freshInputText(newStr);
            this._verifyTipsText.stopAllActions();
            this._verifyTipsText.setOpacity(0);
        }.bind(this));

        okBtn.addClickEventListener(function()
        {
            var indeedStr = this._codeText.getString();
            if(GB.isSplitLoginModel){
                this.doRequest(indeedStr);
            }else{
                this.doRequestOld(indeedStr);
            }
        }.bind(this));

        //数字键盘
        for(var i =0; i < 10; i++)
        {
            var btn = ccui.helper.seekWidgetByName(this._keyboardPanel, "Button_"+i);
            btn.param = i;
            btn.addClickEventListener(function(sender) {
                var oldStr = this._codeText.getString();
                var newStr = (oldStr + sender.param).trim();
                if(newStr.length <= GB.INVITATION_CODE_LEN){
                    this.freshInputText(newStr);
                }
                var indeedStr = this._codeText.getString();
                if(indeedStr.length == GB.INVITATION_CODE_LEN){
                    if(GB.isSplitLoginModel){
                        this.doRequest(indeedStr);
                    }else{
                        this.doRequestOld(indeedStr);
                    }
                }
            }.bind(this));
        }

    },

    doRequestOld:function(invitationCode)
    {
        var responseCallBack = function(data)
        {
            MainController.getInstance().hideLoadingWaitLayer();
            var isSuccess = data["checked"] > 0;
            var tips = data["message"];
            if(!isSuccess){
                this.doVerifyTipsAction(tips);
            }else{
                //保存 关闭界面
                cs.setItem(GB.ST_INVITATION_CODE, invitationCode);
                GB.invitationCode = invitationCode;
                MainController.popLayerFromRunningScene(this);
                ProxyClientLoginer.login();
            }
        }.bind(this);

        MainController.getInstance().showLoadingWaitLayer();
        HttpManager.requestInvitedCode(responseCallBack, this.errorCallBack.bind(this), this.timeoutCallBack.bind(this),  invitationCode);
    },

    doRequest:function(invitationCode){
        var responseCallBack = function(data)
        {
            MainController.getInstance().hideLoadingWaitLayer();
            var result = data["result"];
            var isSuccess = data["result"] == "0";
            var tips = "";
            if(result == "1"){
                tips = LocalString.getString("INVITATION_ERROR_TIPS");
            }
            var serverAddr = data["host"];
            if(!isSuccess){
                this.doVerifyTipsAction(tips);
            }else{
                //cs.setItem(GB.ST_SERVER_ADDR, serverAddr);    //废弃 登录成功才保存serverAddr
                GB.serverAddr = serverAddr;
                GB.invitationCode = invitationCode;

                MainController.popLayerFromRunningScene(this);
                ProxyClientLoginer.login();

            }
        }.bind(this);

        MainController.getInstance().showLoadingWaitLayer();
        HttpManager.requestAcctHost(responseCallBack, this.errorCallBack.bind(this), this.timeoutCallBack.bind(this),  invitationCode);
    },

    errorCallBack:function(){
        MainController.getInstance().hideLoadingWaitLayer();
        MainController.showAutoDisappearAlertByText("验证失败");
    },

    timeoutCallBack:function(){
        MainController.getInstance().hideLoadingWaitLayer();
        MainController.showAutoDisappearAlertByText("请求超时,请检查您的网络");
    },

    freshInputText: function(str)
    {
        this._codeText.setString(str);
        this._cursor.setPos(rightOutter(this._codeText), ANCHOR_LEFT);
        this._cursor.setPositionYAdd(this._cursor.height  * 0.08);
    },

    doVerifyTipsAction:function(tipsStr)
    {
        this._verifyTipsText.setString(tipsStr);
        this._verifyTipsText.runAction(new cc.Repeat(new cc.Sequence(
            new cc.FadeIn(0.5),
            new cc.FadeOut(0.5)
        ), 6));
    }
});