/**
 * Created by 玲英 on 2016/11/3.
 */

var LoadingProgressLayer = BaseLayer.extend({

    ctor:function()
    {
        this._super("LoadingProgressLayer");
        this.setOpacity(255);
        this.setColor(cc.color(28, 30, 43));

        this.initUI();

        this._progress = 0;
        //默认1 否则进度条=0会表现很怪异
        this.setProgress(1);

        this._actionDtCounter = 0;
        this._indexCounter = 0;

        this._actionTexts = [
            LocalString.getString("DOWNLOAD_PROGRESS"),
            LocalString.getString("DOWNLOAD_PROGRESS")+".",
            LocalString.getString("DOWNLOAD_PROGRESS")+"..",
            LocalString.getString("DOWNLOAD_PROGRESS")+"..."
        ];

        this.scheduleUpdate();

        this.addListener();
    },

    addListener:function()
    {
        //这个进度通知由android层发送
        this._downloadProgressListener = cc.eventManager.addCustomListener("NOTIFY_DOWN_LOAD_PROGRESS", function(event)
        {
            //cc.log("progress::", event.getUserData());
            var progress = event.getUserData();
            if(progress)
                this.setProgress(progress);
        }.bind(this));
    },

    update:function(dt)
    {
        //loading action dt
        this._actionDtCounter += dt;
        if(this._actionDtCounter > 0.3) {
            this._actionDtCounter = 0;
            var str = this._actionTexts[this._indexCounter];
            this._indexCounter++;
            if(this._indexCounter >= this._actionTexts.length){
                this._indexCounter = 0;
            }
            if(str){
                this._tipsText.setString(str);
            }
        }
    },

    setProgress:function(progress)
    {
        if(progress < this._progress)
            return;
        this._loadingBar.setPercent(progress);
        //if(progress >= 100){
        //    MainController.popLayerFromRunningScene(this);
        //}
        this._percentText.setString(progress);
        this._progressEndPoint.setPositionX(progress / 100 * this._progressEndPoint.getParent().width);
    },

    initUI:function()
    {

        var rootNode = ccs.loadWithVisibleSize(res.DownLoadProgress_json).node;
        //加入到当前layer中。
        this.addChild(rootNode);
        //
        var percentText = this._percentText = ccui.helper.seekWidgetByName(rootNode, "percentText");
        var bgProgressPanel = ccui.helper.seekWidgetByName(rootNode, "bgProgressPanel");
        var tipsText = this._tipsText = ccui.helper.seekWidgetByName(rootNode, "tipsText");

        //机构组织标记
        var bottomMark = new cc.Sprite("#icon_loading_company.png");
        this.addChild(bottomMark);
        bottomMark.setPos(cc.p(this.width * 0.5, 20), ANCHOR_BOTTOM);

        var size = bgProgressPanel.getContentSize();
        var loadingBar = this._loadingBar = new ccui.LoadingBar();
        loadingBar.loadTexture("animation_loading_light_colour.png", ccui.Widget.PLIST_TEXTURE);
        loadingBar.setAnchorPoint(ANCHOR_LEFT);
        loadingBar.setCapInsets(cc.rect(8, 1, 90 - 8 * 2, 6 - 1));
        loadingBar.setScale9Enabled(true);
        loadingBar.setContentSize(size);
        bgProgressPanel.addChild(loadingBar);
        loadingBar.setPos(leftInner(bgProgressPanel), ANCHOR_LEFT);

        var progressEndPoint = this._progressEndPoint = new cc.Sprite("#animation_loading_flash.png");
        loadingBar.addChild(progressEndPoint);
        progressEndPoint.setPos(leftInner(loadingBar), ANCHOR_CENTER);
    }
});