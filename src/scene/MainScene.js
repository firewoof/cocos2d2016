/**
 * Created by Administrator on 2016/5/6.
 */
var MainScene = cc.Scene.extend({
    _mainLayer                      : undefined,

    ctor: function () {
        this._super();
        MainScene.instance = this;
        this._gameHideTime = 0;

        //初始化助手控制器
        //AsstController.getInstance();

        this.initUI();

        //listeners
        this.addListener();
    },

    removeMainLayer:function()
    {
        if(this._mainLayer){
            this._mainLayer.removeFromParent();
            this._mainLayer = null;
        }
    },

    addListener:function()
    {
        // 刷新用户账户信息
        this._refreshAccountDetailListener = cc.eventManager.addCustomListener(NOTIFY_REFRESH_ACCOUNT_DETAIL, function(event){
            new HttpRequest("accountDetail", {}, function(data){
                Player.getInstance().initFromJson(data);
            });
        }.bind(this));

        // 更新用户基础信息
        this._refreshUserBaseListener = cc.eventManager.addCustomListener(NOTIFY_REFRESH_USER_BASE, function(event){
            new HttpRequest("userUpdate", {auth:event._userData}, function(){
                var data = {base: event._userData};
                Player.getInstance().initFromJson(data);
            });
        }.bind(this));
    },

    initUI:function()
    {
        //初始化主界面
        this.initMainLayer();

        //显示全屏点击效果
        var panel = new GeneralClickEffect();
        this.addChild(panel, 900);

        //win32 F2 restartVM
        if (sys.isNative) {
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyReleased: function(keyCode, event) {
                    if (keyCode == cc.KEY.f2) {
                        cc.sys.restartVM();
                    }
                }}, this);
        }
    },

    initMainLayer:function()
    {
        //打开主界面(某一时刻(比如mainScene被重新replace) 内存可能存在两个主界面，这里强制移除主界面)
        if(TradingHallLayer.instance){
            cc.log("TradingHallLayer.instance 已经存在 先移除");
            TradingHallLayer.instance.removeFromParent();
            TradingHallLayer.instance = null;
        }
        var layer = this._mainLayer = new TradingHallLayer();
        MainController.pushLayerToScene(layer, this, false);
    },

    /**
     * 测试用
     * @param jsonData
     */
    refreshMemoryInfo:function(jsonData)
    {
        var availableMemoryText = this._availableMemoryText;
        if(availableMemoryText == undefined){
            var availableMemoryText = this._availableMemoryText = new ccui.Text("000", FONT_ARIAL_BOLD, 30);
            this.addChild(availableMemoryText, 999999);
            availableMemoryText.setPosition(100, 100);
            availableMemoryText.setColor(cc.RED);
        }
        var availableMemory = jsonData["availableMemory"];
        cc.log("availableMemory::",jsonData["availableMemory"]);
        if(availableMemory)
            this._availableMemoryText.setString("AVABL RAM:" + (availableMemory/1000).toFixed(1) + "M");
    },

    onEnter:function() {
        this._super();
        cc.log("---- MainScene onEnter ------");
    },

    onExit:function() {
        this._super();
        cc.log("---- MainScene onExit ------");
    },

    onEnterTransitionDidFinish: function() {
        cc.audioEngine.stopMusic();
        this._super();
    },

    onExitTransitionDidStart: function() {
        this._super();
       // cc.director.getTextureCache().removeUnusedTextures();
    },

    cleanup: function(){
        this._super();
        cc.log("MainScene:: onCleanup");
        if(MainScene.instance) {
            MainScene.instance = null;
        }
        this.removeAllCustomListeners();
    }
});

MainScene.instance = null;