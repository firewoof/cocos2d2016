
var WebShopLayer = BaseLayer.extend({
    ctor:function(url)
    {
        this._super();
        //UI
        this.initUI(url);
        //点击事件
        this.initAllClickFunc();

        //this.addListeners();
    },

    initUI:function(url)
    {
        var layer = ccs.loadWithVisibleSize(res.WebShopLayer_json).node;
        this.addChild(layer);
        var titlePanel = ccui.helper.seekWidgetByName(layer, "titlePanel");
        this._backBtn = ccui.helper.seekWidgetByName(titlePanel, "backBtn");
        var webPanel = ccui.helper.seekWidgetByName(layer, "webPanel");

        var webView = this._webView = new ccui.WebView();
        webView.setContentSize(webPanel.getContentSize());
        webView.setScalesPageToFit(true);
        webView.loadURL(url);
        webPanel.addChild(webView);
        webView.setPos(centerInner(webPanel));
        webView.setEventListener(ccui.WebView.EventType.LOADING,function (sender, url) {
            cc.log("event LOADING:"+JSON.stringify(url));
            return true;
        });

        webView.setEventListener(ccui.WebView.EventType.LOADED,function (sender, url) {
            cc.log("event LOADED:"+JSON.stringify(url));
            return true;
        });

        webView.setEventListener(ccui.WebView.EventType.ERROR,function (sender, url) {
            cc.log("event ERROR:"+JSON.stringify(url));
            return true;
        });

        // onDidFailLoading = function (sender, str) {
        //     cc.log("OnDidFailLoading event :"+JSON.stringify(str));
        //     return true;
        // };
        //
        // onShouldStartLoading = function (sender, str) {
        //     cc.log("onShouldStartLoading event :"+JSON.stringify(str));
        //     return true;
        // };
        // webView.setOnDidFailLoading(onDidFailLoading);
        // webView.setOnShouldStartLoading(onShouldStartLoading);

        //webview scheme执行cocos代码
        var scheme = "local";
        jsCallBack = function (sender, str) {
            var content = str.replace(scheme+"://", "");
            cc.log("jsCallBack content :"+JSON.stringify(content));
            try{
                eval(content);
            }catch (e){
                cc.log("jsCallBack eval error");
                throw e;
            }
        };

        webView.setJavascriptInterfaceScheme(scheme);
        webView.setOnJSCallback(jsCallBack);
    },


    initAllClickFunc:function()
    {
        // 返回
        this._backBtn.addClickEventListener(function(sender)
        {
            MainController.popLayerFromRunningScene(this);
            //test
            //this._webView.evaluateJS("window.open('local://fdifjdf&fdfdfd')");
        }.bind(this));
        if(isEducationVersion) {
            this._backBtn.setVisible(false);
        }
    }
});

