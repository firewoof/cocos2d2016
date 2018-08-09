/**
 * Created by Jony on 2016/3/15.
 */

GB.SOCIAL_PLATFORM_WECHAT = "Wechat";
GB.SOCIAL_PLATFORM_WECHATMOMENTS = "WechatMoments";
GB.SOCIAL_PLATFORM_QQ = "QQ";
GB.SOCIAL_PLATFORM_QZONE = "QZone";
GB.SOCIAL_PLATFORM_SINAWEIBO = "SinaWeibo";

var ShareLayer = cc.Layer.extend({
    ctor:function()
    {
        this._super();
        //UI
        this.initUI();
        //点击事件
        this.initAllClickFunc();
    },

    initUI:function()
    {
        var layer  = ccs.loadWithVisibleSize(res.ShareLayer_json).node;
        // 加入到当前layer中。
        this.addChild(layer);

        // 按钮
        var backPanel = this._backPanel = ccui.helper.seekWidgetByName(layer, "backPanel");

        var detailPanel = this._detailPanel = ccui.helper.seekWidgetByName(layer, "detailPanel");
        var wechatMomentsBtn = this._wechatMomentsBtn = ccui.helper.seekWidgetByName(detailPanel, "wechatMomentBtn");
        var wechatBtn = this._wechatBtn = ccui.helper.seekWidgetByName(detailPanel, "wechatBtn");
        var qqBtn = this._qqBtn = ccui.helper.seekWidgetByName(detailPanel, "qqBtn");
        var qzoneBtn = this._qzoneBtn = ccui.helper.seekWidgetByName(detailPanel, "qzoneBtn");
        var weiboBtn = this._weiboBtn = ccui.helper.seekWidgetByName(detailPanel, "weiboBtn");

        //先禁用这个
        weiboBtn.setGray(true);

        this._shareBtnArray = [this._wechatMomentsBtn, this._wechatBtn, this._qqBtn, this._qzoneBtn, this._weiboBtn];
    },

    initAllClickFunc:function()
    {
        this._backPanel.addClickEventListener(function(sender) {
            MainController.playButtonSoundEffect(sender);
            MainController.popLayerFromRunningScene(this);
        }.bind(this));

        for(var i = 0; i< this._shareBtnArray.length; i++)
        {
            this._shareBtnArray[i].addClickEventListener(function(sender) {
                MainController.playButtonSoundEffect(sender);
                MainController.popLayerFromRunningScene(this);

                var platform = "";
                if(sender == this._wechatMomentsBtn) {
                    platform = GB.SOCIAL_PLATFORM_WECHATMOMENTS;
                }
                else if(sender == this._wechatBtn) {
                    platform = GB.SOCIAL_PLATFORM_WECHAT;
                }
                else if(sender == this._qqBtn) {
                    platform = GB.SOCIAL_PLATFORM_QQ;
                }
                else if(sender == this._qzoneBtn) {
                    platform = GB.SOCIAL_PLATFORM_QZONE;
                    if(cc.sys.os == cc.sys.OS_IOS)
                    {
                        platform = GB.SOCIAL_PLATFORM_QQ;
                    }
                }
                else if(sender == this._weiboBtn) {
                    platform = GB.SOCIAL_PLATFORM_SINAWEIBO;
                }
                var titleUrl = APP_MLINK_DEFAULT[appName];
                if(typeof titleUrl === "object")
                {
                    titleUrl = titleUrl[buildVersion];
                }
                var shareData =
                {
                    platform: platform,
                    title: LocalString.getString("SHARE_TEMP_TITLE"),
                    titleUrl: titleUrl,
                    text: cc.formatStr(LocalString.getString("INVITATION_CODE"), DeviceInfoManager.getInstance().getInvitationCode()) + LocalString.getString("SHARE_TEMP_TEXT"),
                    imageUrl: "http://static.aiweipan.com/share/images/appIcon/" + appName + ".png"
                };
                JavascriptBridge.getInstance().ShareSDKShowShare(shareData);
            }.bind(this));
        }
    }
});
