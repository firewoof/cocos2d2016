var WebPayLayer = cc.Layer.extend({
    ctor:function(html, title, waitUrl)
    {
        this._super();
        //UI
        this.initUI(html, title, waitUrl);
        //点击事件
        this.initAllClickFunc();
    },

    cleanup:function(){
        this.removeAllCustomListeners();
        this._super();
    },

    initUI:function(html, title, waitUrl)
    {
        var layer = ccs.loadWithVisibleSize(res.WebPayLayer_json).node;
        this.addChild(layer);
        var titlePanel = ccui.helper.seekWidgetByName(layer, "titlePanel");
        this._backBtn = ccui.helper.seekWidgetByName(titlePanel, "backBtn");
        var progressPanel = ccui.helper.seekWidgetByName(titlePanel, "progressPanel");
        var progressImage = ccui.helper.seekWidgetByName(progressPanel, "progressImage");
        var loadingCircle = new LoadingCircle();
        loadingCircle.setPos(centerInner(progressImage), ANCHOR_CENTER);
        progressImage.addChild(loadingCircle);
        progressImage.scheduleUpdate();
        if(waitUrl == null) {
            progressPanel.setVisible(false);
        }

        var webPanel = ccui.helper.seekWidgetByName(layer, "webPanel");
        var webView = new ccui.WebView();
        var size = webPanel.getContentSize();
        webView.setPosition(cc.p(size.width/2, size.height/2));
        webView.setContentSize(size);
        webView.setScalesPageToFit(true);

        webView.setEventListener(ccui.WebView.EventType.LOADED, function(sender, url){
            cc.log("event LOADED:"+JSON.stringify(url));
            if(url.trim().endsWith(".apk")){
                cc.sys.openURL(url);
            }
            if(waitUrl != null && url.indexOf(waitUrl) != -1) {
                // 加载完waitUrl后隐藏progressPanel
                progressPanel.setVisible(false);
            }
            return true;
        });

        webView.loadHTMLString(html);
        webPanel.addChild(webView);
        this._webView = webView;
        if(title != null) {
            var titleTxt = ccui.helper.seekWidgetByName(titlePanel, "titleTxt");
            if(titleTxt != null) {
                titleTxt.setString(title);
            }
        }
    },

    disableDetector:function() {
        this._webView.disableDetector();
    },

    initAllClickFunc:function()
    {
        // 返回
        this._backBtn.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            MainController.popLayerFromRunningScene(this);
            var appRechargeType = ClientConfig.getInstance().getAppRechargeType();
            if(appRechargeType == 8) {
                // 曝光币没有rechargeQuery接口
                return;
            }
            // 只能通过rechargeQuery接口确定是否充值成功
            new HttpRequest("rechargeQuery", {auth: {orderNo: DataPool.curRechargeOrderNo}}, function(data){
                if(data.is_trade_success) {
                    G_rechargeResultCallback("SUCCESS");
                }
                else {
                    G_rechargeResultCallback("CANCEL");
                }
            });
        }.bind(this));
    }
}

);
