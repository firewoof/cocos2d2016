/**
 * 热更新.
 */
var UpdateLayer = cc.Layer.extend({
    _lastPointN : 0,

    ctor: function(bigUpdate) {
        this._super();

        this.LOAD_TIPS = "正在下载更新文件";
        this.LOAD_FINISH = "更新完毕";

        this.initUI(bigUpdate);
        this.schedule(this.updateSetLoadingTxt, 0.6);
    },

    initUI:function(bigUpdate)
    {
        var layer = ccs.loadWithVisibleSize("res/arts/UpdateLayer.json").node;
        //加入到当前layer中。
        this.addChild(layer);

        var loadingPanel = ccui.helper.seekWidgetByName(layer, "loadingPanel");
        var loadingBg = this._loadingBg = ccui.helper.seekWidgetByName(loadingPanel, "loadingBg");
        var loadingBar = this._loadingBar = ccui.helper.seekWidgetByName(loadingBg, "bar");
        var loadingFlash = this._loadingFlash = ccui.helper.seekWidgetByName(loadingBg, "flash");
        var loadingTxt = this._loadingTxt = ccui.helper.seekWidgetByName(loadingPanel, "txt");
        var percentPanel = ccui.helper.seekWidgetByName(loadingPanel, "percentPanel");
        var percentTxt = this._percentTxt = ccui.helper.seekWidgetByName(percentPanel, "num");
        percentTxt.setString("0");

        //替换(避免文本长度过长遭裁剪)
        var newLoadingTxt = new cc.LabelTTF(this.LOAD_TIPS, "Arial", loadingTxt.getFontSize());
        newLoadingTxt.setAnchorPoint(cc.p(0, 0.5));
        var pos = loadingTxt.getPosition();
        var parent = loadingTxt.getParent();
        loadingTxt.removeFromParent();
        parent.addChild(newLoadingTxt);
        newLoadingTxt.setPosition(parent.width * 0.5 - newLoadingTxt.width * 0.5, pos.y);
        this._loadingTxt = newLoadingTxt;

        //更新完成text
        var finishTxt = this._finishTxt = new cc.LabelTTF(this.LOAD_FINISH, "Arial", loadingTxt.getFontSize());
        finishTxt.setAnchorPoint(cc.p(0.5, 0.5));
        parent.addChild(finishTxt);
        finishTxt.setPosition(cc.p(parent.width * 0.5, loadingTxt.getPositionY()));
        finishTxt.setVisible(false);


        if (bigUpdate) {
            this.addListener();
        }

        ccui.helper.seekWidgetByName(layer, "Image_1").setVisible(false);//屏蔽银联标志
    },

    addListener:function()
    {
        this._downloadProgressListener = cc.eventManager.addCustomListener("NOTIFY_DOWN_LOAD_PROGRESS", function(event)
        {
            var progress = event.getUserData();
            if(progress) {
                this.refresh(progress / 100);
            }
        }.bind(this));
    },

    refresh: function (percent) {
        var width = this._loadingBg.width * percent;
        this._loadingBar.width = width;
        this._loadingFlash.setPositionX(width);

        var num = (percent * 100).toFixed(0);
        this._percentTxt.setString(num);

        this.updateFinish(percent);
    },

    updateSetLoadingTxt: function()
    {
        this._lastPointN += 1;
        if(this._lastPointN > 3)
            this._lastPointN = 1;
        var point = "";
        for(var i = 0;i<this._lastPointN; i++)
        {
            point += ".";
        }
        var tips = "正在下载更新文件" + point;
        this._loadingTxt.setString(tips);
    },

    updateFinish:function(percent) {
        if (percent < 1.0 )
            return;

        this.unschedule(this.updateSetLoadingTxt);
        this._finishTxt.setVisible(true);
        this._loadingTxt.setVisible(false);
    }

});

/**
 * 弹出框
 */

var PopupLayer = cc.Layer.extend({
    _titleLabel:undefined,      //标题
    _okButton:undefined,        //按钮
    _isFullScreen:undefined,
    _centerContent : undefined,
    _defaultOpacity: 160,

    ctor:function(msg, okCallBack){
        this._super();
        this._defaultOpacity = 160;

        this.initWithContent(msg,okCallBack);
    },

    initWithContent:function(msg, okCallBack){
        // 遮罩
        var mask = this._maskPanel = new ccui.Layout();
        mask.setContentSize(cc.winSize);
        mask.setBackGroundColor(cc.BLACK || cc.RED);
        mask.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        mask.setBackGroundColorOpacity(this._defaultOpacity);
        this.addChild(mask);

        // 内容底板
        var popLayerSize = cc.size(619, 332);
        var centerContent  = this._centerContent = new ccui.ImageView("bg_common_bar.png", ccui.Widget.LOCAL_TEXTURE);
        centerContent.setScale9Enabled(true);
        centerContent.setContentSize(popLayerSize);
        centerContent.setAnchorPoint(cc.p(0.5,0.5));
        centerContent.setPosition(cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.5));
        centerContent.setTouchEnabled(true);    //中心区域阻隔事件
        this.addChild(centerContent);

        //标题
        var titleLabel = this._titleLabel = new cc.LabelTTF("提示", "Arial-BoldMT", 36);
        titleLabel.setColor(cc.color(21, 25, 26));
        titleLabel.setPosition(cc.p(popLayerSize.width * 0.5, popLayerSize.height - 36));
        centerContent.addChild(titleLabel);

        // 内容
        var content = cc.LabelTTF(msg, "Arial-BoldMT", 28);
        content.setColor(cc.color(143, 162, 176));
        content.setAnchorPoint(cc.p(0.5,0.5));
        content.setPosition(cc.p(popLayerSize.width * 0.5, popLayerSize.height* 0.5 + 36));
        centerContent.addChild(content);

        // 确定按钮
        var self = this;
        var okButton = this._okButton =  new ccui.Button();
        okButton.loadTextureNormal("btn_common_red_n.png", ccui.Widget.PLIST_TEXTURE);
        okButton.setScale9Enabled(true);
        okButton.setContentSize(cc.size(250, 80));
        okButton.setTitleFontSize(32);
        okButton.setTitleText("确定重试");
        okButton.setAnchorPoint(cc.p(0.5,0.5));
        okButton.setPosition(cc.p(popLayerSize.width * 0.5, 80));
        okButton.addClickEventListener(function(sender) {
            if (okCallBack != undefined) {
                okCallBack();
            }
            self.removeFromParent();
        }.bind(this));
        centerContent.addChild(okButton);

        //默认灰色遮罩
        this.setFullScreen();
    },

    /**
     * 设置popLayer是否带遮罩
     * @param {Boolean} [isFullScreen]
     */
    setFullScreen:function(isFullScreen){
        var isFullScreen = isFullScreen == undefined ? true : isFullScreen;    //默认全屏
        if(isFullScreen == this._isFullScreen){
            return;
        }
        if(isFullScreen == true) {
            this._maskPanel.setOpacity(this._defaultOpacity);
            this.setMaskTouchEnabled(true);
            this._isFullScreen = true;
        }

        if(isFullScreen == false){
            this._maskPanel.setOpacity(0);
            this._isFullScreen = false;
        }
    },

    /**
     * 是否遮罩也相应点击
     */
    setMaskTouchEnabled: function(isEnabled, callBack)
    {
        var isEnabled = isEnabled == undefined ? true : isEnabled;
        this._maskPanel.setTouchEnabled(isEnabled);
        if(isEnabled && callBack)
        {
            this._maskPanel.addClickEventListener(callBack);
        }
    }
});


/**
 * 更新器 view
 * Created by lex on 2016/12/06.
 */

ClientUpdateView = cc.Class.extend({
    ctor : function(model, controller){
        this._model = model;
        this._controller = controller;
        this._view = null;
        this._popup = null;

        //this._model.curDownloadedSizeChangedSignal.add(this.onDownloadingChanged2UpdateView, this);
        this._model.curShowLoadingPercentChangedSignal.add(this.onShowLoadingPercent2UpdateView, this);
    }
});

ClientUpdateView.prototype.show = function(bigUpdate){
    //
    cc.log("ClientUpdateView.prototype.show");
    if (null == this._view) {
        var scene = new cc.Scene();
        this._view = new UpdateLayer(bigUpdate);
        scene.addChild(this._view);
        cc.director.runScene(scene);
    }
};

ClientUpdateView.prototype.showPopup = function(content, callBack){
    //
    cc.log("ClientUpdateView.prototype.showPopup");
    var layer = this._popup = new PopupLayer(content, callBack);
    var scene = cc.director.getRunningScene();
    if (layer && scene) {
        scene.addChild(layer);
    }
};

ClientUpdateView.prototype.destroy = function(){
    if(this._view){
        this._view.removeFromParent(true);
        this._view = null;
    }
    if(this._popup){
        this._popup.removeFromParent(true);
        this._popup = null;
    }
};

ClientUpdateView.prototype.onShowLoadingPercent2UpdateView = function(value){
    if (this._view) {
        this._view.refresh(value);
    }
};