/**
 * Created by 黄聪 on 2016/12/28.
 */

var InvitationCodeLayer = BaseLayer.extend({

    ctor: function () {
        this._super("InvitationCodeLayer");

        //设置点击退出层
        var touchPanel = new ccui.Layout();
        touchPanel.setContentSize(cc.winSize);
        this.addChild(touchPanel);
        touchPanel.setTouchEnabled(true);
        //touchPanel.addClickEventListener(function () {
        //    this.hide();
        //}.bind(this));

        this.initUI();

        this.initAllButtonClick();
    },

    editBoxEditingDidBegin:function()
    {
        this._verifyTipsText.setOpacity(0);
        this._verifyTipsText.stopAllActions();
    },

    initUI: function() {

        //创建验证界面层
        var rootLayer = this._rootLayer = ccs.load(res.VerificationCode_json).node;
        this.addChild(rootLayer);
        rootLayer.setPos(cc.p(cc.winSize.width / 2, cc.winSize.height / 2), ANCHOR_CENTER);
        rootLayer.setTouchEventEnabled(true);

        //从Studio中取出需要的组件
        var verifyTipsText = this._verifyTipsText = ccui.helper.seekWidgetByName(rootLayer, "verifyTipsText");
        var verifyBtn = this._verifyBtn = ccui.helper.seekWidgetByName(rootLayer, "verifyBtn");
        var hasAccountBtn = this._hasAccountBtn = ccui.helper.seekWidgetByName(rootLayer, "hasAccountBtn");
        var closeBtn = this._closeBtn = ccui.helper.seekWidgetByName(rootLayer, "closeBtn");
        var editBoxPanel = ccui.helper.seekWidgetByName(rootLayer, "editBoxPanel");
        verifyTipsText.setOpacity(0);

        //创建EditBox
        var verifyEditBox = this._verifyEditBox = new cc.EditBox(editBoxPanel.getContentSize(), new cc.Scale9Sprite("bg_common_bottom_frame.png"));
        editBoxPanel.addChild(verifyEditBox);
        verifyEditBox.setAnchorPoint(0.5, 0);
        verifyEditBox.setPos(centerInner(editBoxPanel));
        verifyEditBox.setName("");
        verifyEditBox.setDelegate(this);
        verifyEditBox.setFontColor(cc.color(21,25,26));
        //verification.setFontSize(30);
        verifyEditBox.setMaxLength(100);
        verifyEditBox.setPlaceHolder(""); //输入提示文字
        verifyEditBox.setInputFlag(cc.EDITBOX_INPUT_FLAG_SENSITIVE);//修改为不使用密文
        verifyEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE); //开启任何文本的输入键盘,不包括换行

    },

    initAllButtonClick: function()
    {
        //验证
        this._verifyBtn.addClickEventListener(function(sender){
            MainController.playButtonSoundEffect(sender);

            var invitationCode = this._verifyEditBox.getString().trim();
            if(invitationCode == ""){
                this.doVerifyTipsAction("输入不能为空");
                return ;
            }
            cc.log("验证::", sender);
            //置灰
            sender.setGray(true);
            //
            var responseCallBack = function(data)
            {
                var isSuccess = data["checked"] > 0;
                var tips = data["message"];
                if(!isSuccess){
                    this.doVerifyTipsAction(tips);
                    this._verifyBtn.setGray(false);
                }else{
                    //保存 关闭界面
                    cs.setItem(GB.ST_INVITATION_CODE, invitationCode);
                    //GB.hasInvitationCode = true;
                    GB.invitationCode = invitationCode;
                    InvitationCodeLayer.instance.removeFromParent();
                    InvitationCodeLayer.instance = null;
                }
            }.bind(this);

            var errorCallBack = function()
            {
                MainController.showAutoDisappearAlertByText("验证失败");
                this._verifyBtn.setGray(false);
            }.bind(this);
            var timeoutCallBack = function()
            {
                MainController.showAutoDisappearAlertByText("请求超时,请检查您的网络");
                this._verifyBtn.setGray(false);
            }.bind(this);

            HttpManager.requestInvitedCode(responseCallBack, invitationCode, errorCallBack, timeoutCallBack);
        }.bind(this));

        //已有帐号切换到登录页面
        this._hasAccountBtn.setTouchEnabled(true);
        this._hasAccountBtn.addClickEventListener(function(sender){
            //MainController.playButtonSoundEffect(sender);//这里比较特殊 不要发声音
            cc.log("登录::", sender);
            MainController.popLayerFromRunningScene(this);
            MainController.getInstance().showLoginLayer();
        }.bind(this));

        this._closeBtn.addClickEventListener(function(sender){
            this.hide();
        }.bind(this));
    },

    show:function()
    {
      this.setVisible(true);
    },

    hide:function()
    {
        this.setVisible(false);
        this._verifyTipsText.setOpacity(0);
        this._verifyTipsText.stopAllActions();
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

InvitationCodeLayer.getInstance = function()
{
    if(InvitationCodeLayer.instance == undefined){
        var layer = InvitationCodeLayer.instance = new InvitationCodeLayer();
        layer.setVisible(false);
        //置于靠上层 阻塞操作
        cc.director.getRunningScene().addChild(InvitationCodeLayer.instance, 3);
    }
    return InvitationCodeLayer.instance;
};
