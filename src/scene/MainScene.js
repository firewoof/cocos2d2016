/**
 * Created by Administrator on 2016/5/6.
 */
var MainScene = cc.Scene.extend({
    _layer                      : null,
    _tutorListener              : null,
    _promptingListener          : null,
    _disconnectListener         : null,
    _officerPropertyListener    : null,
    _disconnectRetryCount       : 0,
    _isRetrying                 : false,
    _alertLayer                 : null,
    _updateInterval             : 1,

    _enhanceStoneTargetTime     : 0,    //强化石的最终时间(= 当前时间 + cd)
    _blackShopTargetTime        : 0,    //神秘商店关闭时间


    ctor: function () {
        this._super();
        MainScene.instance = this;

        this._layer = this._mainViewLayer =  new MainViewLayer();
        MainController.pushLayerToScene(this._layer, this, false);

        //监听引导事件
        this._tutorListener = cc.eventManager.addCustomListener(NOTIFY_TUTOR_NEXT_STEP,function(){
            cc.log("NOTIFY_TUTOR_NEXT_STEP");
            TutorLayer.checkAndExecuteTutorialStep(this);
        }.bind(this));

        this._promptingListener = cc.eventManager.addCustomListener(NOTIFICATION_PROMPTING, function(event) {
            //cc.log("PromoteNode.checkAndExecuteNextPromote");
            PromoteNode.checkAndExecuteNextPromote(this);
//            if (MainController.getLayerByType(PromptingLayer) == null) {
//                var prompting = MainController.currentGameData().getNextForcedPrompting();
//                if (prompting != null) {
//                    var layer = new PromptingLayer(this._promptingPos, prompting);
//                    MainController.pushLayerToRunningScene(layer);
//                }
//            }
        }.bind(this));
        PromoteNode.checkAndExecuteNextPromote(this);

        //监听断线，重新连一次，再次失败则弹出重连提示
        this._disconnectListener = cc.eventManager.addCustomListener("socket_event_disconnect",this.onDisconnect.bind(this));

        //公告
        this._bulletinUpdateListener = cc.eventManager.addCustomListener(NOTIFY_BULLETIN_UPDATE,function(event){
            var context = event.getUserData();
            if(cc.director.getRunningScene() == this){
                MainController.getInstance().showScrollBulletin(context);
            }
        }.bind(this));

        //强化石冷却初始化
        this._enhanceStoneTargetTime = TimeHelper.getCurrentTime() + MainController.currentPlayer().getEnhanceStoneCD() * 1000;

        //强化石冷却计时需要
        this._enhanceStoneCDChangeListener = cc.eventManager.addCustomListener(NOTIFY_ENHANCE_STONE_CD_UPDATE,function(event){
            this._enhanceStoneTargetTime = TimeHelper.getCurrentTime() + MainController.currentPlayer().getEnhanceStoneCD() * 1000;
        }.bind(this));

        TutorInfo.addStepList(TutorInfo.TUTORIAL_DATA);

        return true;
    },

    update:function(dt){
        //确保每秒只调用一次
        this._updateInterval -= dt;
        if(this._updateInterval <= 0){
            this._updateInterval = 1;
            var currentTime = TimeHelper.getCurrentTime();
            var player = MainController.currentPlayer();
            //强化石cd
            if(this._enhanceStoneTargetTime >= currentTime){
                var enhanceStoneCD = parseInt((this._enhanceStoneTargetTime - currentTime)/1000);
                MainController.currentPlayer()._enhanceStoneCD = enhanceStoneCD;
            }else{
                MainController.currentPlayer()._enhanceStoneCD = 0;
            }

            //神秘商店cd(不会通过)
            var blackShopCloseTime = player.getBlackShopCloseTime();
            if(blackShopCloseTime > 0 && blackShopCloseTime <= currentTime && player._isOpenBlackShop == true){
                cc.log("通知神秘商店关闭");
                player._isOpenBlackShop = false;
                cc.eventManager.dispatchCustomEvent(NOTIFY_MYSTERIOUS_SHOP_UPDATE, null);
            }
        }

    },

    onEnter:function() {
        this._super();
        this.scheduleUpdate();
        cc.log("---- MainScene onEnter ------");
        MainController.removeUnusedResource();
    },

    onExit:function() {
        this._super();
        cc.log("---- MainScene onExit ------");

        //释放内存
        BPCommon.freeMemory();
    },

    onEnterTransitionDidFinish: function() {
        cc.log("---- MainScene onEnterTransitionDidFinish ------");
        this._super();
//        this._layer.showTutor(this);
        cc.eventManager.dispatchCustomEvent(NOTIFY_TUTOR_NEXT_STEP);

        //PromoteInfo.pushInfo({"type":10022, "tag":-1, "tipMsg": "你有武将可以装备进阶装备", "openUIId": 1008});
        cc.eventManager.dispatchCustomEvent(NOTIFICATION_PROMPTING);

        cc.audioEngine.stopMusic();
        //判断音乐是否开启
        //MainController.getInstance().openMusic = cc.sys.localStorage.getItem("musicSetting") == "true";

        //cc.audioEngine.playMusic("bgm/main_menu_BGM.mp3",true);
        MainController.playMusic("bgm/main_menu_BGM.mp3");
        cc.audioEngine.setMusicVolume(0.3);

        // 是否需要 选形象／改名字
        if(MainController.currentPlayer().isNeedRoleSelect())
        {
            cc.log("---- 需要 选形象／改名字 ------");
            this.runAction(new cc.Sequence(new cc.DelayTime(0.01), cc.callFunc(function() {
                MainController.showAlertByText(GameLocalString.getLocalString("CAN_SELECT_ROLE_TIPS"), {callback:function(al) {
                    MainController.getInstance().showRoleSelectLayer();
                    MainController.popLayerFromRunningScene(al);
                }.bind(this)});
            }.bind(this))));
        }
    },

    onExitTransitionDidStart: function() {
        this._super();
        sg.AltasImageManager.getShareManager().removeUnuseImage();
        cc.director.getTextureCache().removeUnusedTextures();
        cc.log("---- MainScene onExitTransitionDidStart ------");
//        cc.Scene.prototype.onExitTransitionDidStart.call(this);
    },

    onCleanup: function(){
        this._super();
        cc.log("MainScene:: onCleanup");
        MainScene.instance=null;
//        if(this._tutorListener)             cc.eventManager.removeListener(this._tutorListener );
//        if(this._promptingListener)         cc.eventManager.removeListener(this._promptingListener );
//        if(this._bulletinUpdateListener)    cc.eventManager.removeListener(this._bulletinUpdateListener);
//        if(this._enhanceStoneCDChangeListener)    cc.eventManager.removeListener(this._enhanceStoneCDChangeListener);
        //this.removeDisconnectListener();
        this.removeAlertLayer();
        this.removeAllCustomListeners();
    },

    removeAlertLayer: function(){
        if(this._alertLayer)
        {
            this._alertLayer.removeFromParent();
            this._alertLayer = null;
        }
    },

    removeDisconnectListener:function(){
        if(this._disconnectListener)    cc.eventManager.removeListener(this._disconnectListener );
        this._disconnectListener = null;
    },

    onDisconnect:function(event){

        //if(this._isRetrying){
        //    return;
        //}
        //this._isRetrying=true;
        cc.log("--------------------------disconnect and retry-------------------------- "+ this._disconnectRetryCount);

        this.removeAlertLayer();

        if(this._disconnectRetryCount>0){
            //TODO 弹出确认界面
            this._disconnectRetryCount=0;

            this._alertLayer = MainController.getAlertLayer("世上最遥远的距离就是没网，请在网络良好时重试连接。",{
                callback:this.onDisconnect.bind(this)
                ,zOrder:100
            });
            LoadingLayer.pushLayer();
            LoadingLayer.instance.addChild(this._alertLayer);

            cc.log("--------------------------Alert--------------------------");
            return;
        }
        this._disconnectRetryCount+=1;
        LoadingLayer.removeLayer();
//        if(this._alertLayer){
//            this._alertLayer = null;
//        }
        MainController.getInstance().closeSocketManager();
        LoadingLayer.pushLayer();
        //重连
        MainController.connectToServer(MainController.getInstance().getCurrentAddress(),function(sm){

            //this._isRetrying = false;
            //cc.log("MainScene.onDisconnect.connectToServerCallBack");
            LoadingLayer.popLayer();
            if(!sm){
                return;
            }

            var controller = MainController.getInstance();

            controller.setSocketManager(sm); //必须重新设置一次

            //连接成功后，发送验证
            //cc.log("account"+controller.getCurrentAccount()+"   session="+controller.getCurrentSession());

            controller.sendAndWaitRequest(
                ReconnectRequest.createWithParam(controller.getCurrentAccount(),controller.getCurrentSession(),MainController.getChannel(),controller.getCurrentCuid())
                ,function(){
                    this._disconnectRetryCount=0;
                    MainController.resendRequestCache();
                    MainController.getInstance().startHeartbeat();
                }.bind(this),true);
        }.bind(this));
    }
});

MainScene.instance = null;