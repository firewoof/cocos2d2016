/**
 * Created by Jony on 2016/11/21
 */

var SetLayer = cc.Layer.extend({

    ctor:function(index)
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
        var layer = ccs.loadWithVisibleSize(res.SetLayer_json).node;
        // 加入到当前layer中。
        this.addChild(layer);

        var titlePanel = ccui.helper.seekWidgetByName(layer, "titlePanel");
        // 返回按钮
        var backBtn = this._backBtn = ccui.helper.seekWidgetByName(titlePanel, "backBtn");

        //设置面板
        var setPanel = this._setPanel = ccui.helper.seekWidgetByName(layer, "setPanel");
        var soundPanel = ccui.helper.seekWidgetByName(setPanel, "soundPanel");
        var loginOutBtn = this._loginOutBtn = ccui.helper.seekWidgetByName(setPanel, "loginOutBtn");
        loginOutBtn.setVisible(Player.getInstance().getOnline());

        var soundCheckBtn = this._soundCheckBtn = ccui.helper.seekWidgetByName(soundPanel, "soundCheckBtn");
        var soundSelectedTag = this._soundSelectedTag = ccui.helper.seekWidgetByName(soundCheckBtn, "selected");
        this._soundSelectedTag.setVisible(MainController.getInstance().isOpenAudio());
    },

    initAllClickFunc:function()
    {
        // 返回
        this._backBtn.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            MainController.popLayerFromRunningScene(this);
        }.bind(this));

        this._loginOutBtn.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);

            var str = "<l c=3b4b79>"+ LocalString.getString("LOGON_OUT_TIP")+ "\n</l>";
            var richTextEx = UIString.scriptToRichTextEx(str, 270, "Arial", 30, cc.BLACK);
            var content = UICommon.createPanelAlignWidgetsWithPadding(46, cc.UI_ALIGNMENT_VERTICAL_CENTER, richTextEx);

            var layer = new ConfirmPopLayer(content,null,function(){
                //new HttpRequest("userSignOut", {}, function(data){
                //    MainController.popLayerFromRunningScene(layer);
                //    MainController.popLayerFromRunningScene(this);
                //
                //    Player.getInstance().setOnline(false);
                //
                //    //清理邮件数据
                //    MailManager.getInstance().cleanMailData();
                //
                //    //先清理敏感数据
                //    Player.getInstance().cleanTradeData();
                //
                //    cc.eventManager.dispatchCustomEvent(NOTIFY_REFRESH_LOGIN_STATE);
                //
                //}.bind(this));
                MainController.getInstance().logout();
            }.bind(this));
            layer.setCloseButtonVisible(false);
            MainController.pushLayerToRunningScene(layer);
        }.bind(this));

        this._soundCheckBtn.addClickEventListener(function(sender)
        {
            var visible = !MainController.getInstance().isOpenAudio();
            this._soundSelectedTag.setVisible(visible);
            MainController.getInstance().setOpenAudio(visible);
            if(visible)
                cc.sys.localStorage.setItem("isOpenAudio", 1);
            else
                cc.sys.localStorage.setItem("isOpenAudio", 0);
        }.bind(this));
    }
});