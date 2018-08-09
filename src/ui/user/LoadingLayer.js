/**
 * 登录加载进度
 * Created by Jony on 2016/9/27.
 */
var LoadingLayer = cc.Layer.extend({
    _time: 0,
    _curPercent:0,
    _targetPercent: 0,
    _speed: 0.03,

    ctor: function() {
        this._super();

        this.initUI();
        this.scheduleUpdate();
        this.schedule(this.reSetLoadingTxt,0.6);
    },

    initUI:function()
    {
        var layer = ccs.loadWithVisibleSize(res.LoadingLayer_json).node;
        //加入到当前layer中。
        this.addChild(layer);

        var loadingPanel = ccui.helper.seekWidgetByName(layer, "loadingPanel");
        var loadingBg = this._loadingBg = ccui.helper.seekWidgetByName(loadingPanel, "loadingBg");
        var loadingBar = this._loadingBar = ccui.helper.seekWidgetByName(loadingBg, "bar");
        var loadingFlash = this._loadingFlash = ccui.helper.seekWidgetByName(loadingBg, "flash");
        var loadingTxt = this._loadingTxt = ccui.helper.seekWidgetByName(loadingPanel, "txt");
        var percentPanel = ccui.helper.seekWidgetByName(loadingPanel, "percentPanel");
        var percentTxt = this._percentTxt = ccui.helper.seekWidgetByName(percentPanel, "num");
        this._percentTxt.setString("0");

        //logBtn
        if(isTestServer || cc.sys.platform == cc.sys.WIN32) {
            var logBtn = new ccui.Layout();
            logBtn.setTouchEnabled(true);
            logBtn.setContentSize(150, 90);
            this.addChild(logBtn);
            logBtn.setPos(leftTopInner(this), ANCHOR_LEFT_TOP);
            this._logBtnClickTimes = 0;
            logBtn.addClickEventListener(function (sender) {
                this._logBtnClickTimes += 1;
                if (this._logBtnClickTimes < 6) return;

                var layer = new ClientLogLayer();
                MainController.pushLayerToRunningScene(layer);

                this._logBtnClickTimes = 0;
            }.bind(this));
        }

        //
        if(isEducationVersion) {
            ccui.helper.seekWidgetByName(layer, "Image_1").setVisible(false);//屏蔽银联标志
        }
    },

    updateProgress:function(percent) {
        percent = percent > 1.0 ? 1.0 : percent;
        this._targetPercent = percent;
        cc.log("updateProgress", percent);
    },

    update: function(dt)
    {
        this._curPercent += this._speed;
        if (this._curPercent > this._targetPercent) {
            this._curPercent = this._targetPercent;
        }
        this.refresh(this._curPercent);
    },

    refresh: function (percent) {
        var width = this._loadingBg.width*percent;
        this._loadingBar.width = width;
        this._loadingFlash.setPositionX(width);

        var num = (percent * 100).toFixed(0);
        this._percentTxt.setString(num);

        this.updateFinish(percent);
    },

    reSetLoadingTxt: function()
    {
        this._lastPointN += 1;
        if(this._lastPointN > 3) this._lastPointN = 1;
        var point = "";
        for(var i = 0;i<this._lastPointN; i++)
        {
            point += ".";
        }
        this._loadingTxt.setString(LocalString.getString("LOADING_TIP")+point);
    },

    updateFinish:function(percent) {
        if (percent <= 1.0 )
            return;

        this.unschedule(this.updateSetLoadingTxt);
        this._loadingTxt.setString("加载完毕");
    }

});
