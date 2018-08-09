/**
 * Created by Administrator on 2016/5/6.
 */
var MainController = cc.Class.extend({
    _isOpenAudio:true,
    _isOpenMusic:true,
    _gameStartTime:0,
    _fixedTime:0,       //时间修正值
    _lastFixTime:0,     //上次进行修正的时间戳

    ctor: function() {
        //gettimeofdayCocos2d
        this._gameStartTime = new Date().getTime();//这个开始时间到时候 后续只需要跟服务器对一次即可
        this._fixedTime = 0;
    },

    getGameStartTime:function() {
        return this._gameStartTime;
    },

    getFixedTime:function()
    {
      return this._fixedTime;
    },

    getLastFixTime:function()
    {
        return this._lastFixTime;
    },

    setLastFixTime:function(secs)
    {
        this._lastFixTime = secs;
    }
});

MainController.prototype.isOpenAudio = function()
{
    return this._isOpenAudio;
};

MainController.prototype.setOpenAudio = function(b)
{
    this._isOpenAudio = b;
};

MainController.prototype.isOpenMusic = function()
{
    return this._isOpenMusic;
};

//单例
MainController.instance = null;
MainController.getInstance = function() {
    if(!MainController.instance){
        MainController.instance = new MainController();
    }
    return MainController.instance;
};

/**
 * pushLayerToScene 当layer有onAppear和onDisappear方法时，会在合适的时候回调之
 * @param {*|cc.Layer} layer
 * @param {cc.Scene} scene
 * @param {boolean} [isDoAni]
 */
MainController.pushLayerToScene = function(layer, scene, isDoAni) {
    cc.log("---MainController.pushLayerToScene");
    var disappearLayer = null;
    var appearLayer = null;

    //MainController.getInstance()._showMaskLayer();

    // 找最顶端的Layer
    scene.sortAllChildren();

    //若当前层是全屏不透明layer 则隐藏底部的全屏layer(减少绘制)
    cc.log("layer.isFullScreenOpaque : "+layer._isFullScreenOpaque);
    cc.log("layer._layerName::", layer._layerName);
    if(layer._isFullScreenOpaque == true){
        for (var children = scene.getChildren(), i = children.length; i > 0; --i) {
            var child = children[i - 1];
            //隐藏上一个全屏layer
            if (child instanceof cc.Layer && child._isFullScreenOpaque == true) {
                cc.log("隐藏下一层全屏layer, layerName: "+child._layerName);
                child.setVisible(false);
                break;
            }
        }
    }


    for (var children = scene.getChildren(), i = children.length; i > 0; --i) {
        var child = children[i - 1];
        if (child instanceof cc.Layer) {
            disappearLayer = child;
            break;
        }
    }

    scene.addChild(layer);

    if (isDoAni || layer instanceof PopLayer) {
        layer.stopAllActions();
        layer.setScale(1,0);
        layer.runAction(cc.scaleTo(POP_ANIMATION_TIME,1,1).easing(cc.easeBackOut()));
    }
    // 找最顶端的Layer
    scene.sortAllChildren();

    var layerName = layer["_layerName"];
    if(layerName){
        cc.eventManager.dispatchCustomEvent(NOTIFY_LAYER_OPEN, layerName);
    }

    //检查一次界面类型的助手消息
    //cs.customEventManager.dispatchEvent(ASST_INFO_EVENT, {type:AsstInfo.TYPE_OPEN_LAYER});

    //MainController.getInstance()._showMaskLayer();
};

/**
 * pushLayerToRunningScene 当RunningScene为null时，返回false
 * @param {cc.LayerColor|cc.Layer|*} layer
 * @param {boolean} [isDoAni]
 * @returns {boolean}
 */
MainController.pushLayerToRunningScene = function(layer, isDoAni) {
    var scene = cc.director.getRunningScene();
    if (scene && layer) {
        MainController.pushLayerToScene(layer, scene, isDoAni);
        return true;
    }
    return false;
};

/**
 * popLayerFromScene
 * @param {*|cc.Layer|*} layer
 * @param {cc.Scene} scene
 */
MainController.popLayerFromScene = function(layer, scene) {
    var disappearLayer = null;
    var appearLayer = null;

    // 找最顶端的Layer
    scene.sortAllChildren();
    for (var children = scene.getChildren(), i = children.length; i > 0; --i) {
        var child = children[i - 1];
        if (child instanceof cc.Layer) {
            disappearLayer = child;
            break;
        }
    }

    scene.removeChild(layer, true);

    //若当前层是全屏不透明layer则显示下一个全屏layer
    if(layer._isFullScreenOpaque == true){
        for (var children = scene.getChildren(), i = children.length; i > 0; --i) {
            var child = children[i - 1];
            if (child instanceof cc.Layer && child._isFullScreenOpaque == true) {
                cc.log("显示全屏下一层全屏layer, layerName: "+child._layerName);
                child.setVisible(true);
                break;
            }
        }
    }


    scene.sortAllChildren();

    //隐藏助手对话框
    //AsstLayer.getInstance().hideBubble();

    var layerName = layer["_layerName"];
    if(layerName){
        cc.eventManager.dispatchCustomEvent(NOTIFY_LAYER_CLOSE, layerName);
    }
};

/**
 * popLayerFromRunningScene 当RunningScene为null时，返回false
 * @param {cc.Layer | *} layer
 * @returns {boolean}
 */
MainController.popLayerFromRunningScene = function(layer) {

    var scene = cc.director.getRunningScene();
    if (scene != null && layer && cc.sys.isObjectValid(layer)) {
        MainController.popLayerFromScene(layer, scene);
        return true;
    }
    return false;
};

/**
* 界面默认展开动画执行过程中，屏蔽所有点击
 * //特别说明：：在频繁打开界面时，这里的动画不知道什么原因不会执行(也没有报错)，暂时驾驭不了，不用这个方法了
* @private
*/
MainController.prototype._showMaskLayer = function(){
    //if(!this._maskLayer){
    //    this._maskLayer = new cc.Layer();
    //    this._maskLayer.setContentSize(cc.winSize);
    //    //this._maskLayer.setBackGroundColorEx(cc.RED);
    //    this._maskLayer.retain();
    //    if(this._maskLayer instanceof ccui.Widget) {
    //        this._maskLayer.setTouchEnabled(false);
    //    }else{
    //        this._maskLayer.setTouchEventEnabled(false);
    //    }
    //
    //    this._maskLayer.setAnchorPoint(0, 0);
    //}
    //if(this._maskLayer && this._maskLayer.getParent()){
    //    cc.log("this._maskLayer.stopAllActions();");
    //    this._maskLayer.stopAllActions();
    //    this._maskLayer.removeFromParent(true);
    //}
    //cc.log("mask add。。111。。");
    ////this._maskLayer.stopAllActions();
    //cc.director.getRunningScene().addChild(this._maskLayer);
    ////this._maskLayer.get
    //cc.log("mask add。。22。。");
    ////特别说明：：在频繁打开界面时，这里的动画不知道什么原因不会执行(也没有报错)，暂时驾驭不了，不用这个方法了
    //this._maskLayer.runAction(new cc.Sequence(
    //    new cc.DelayTime(POP_ANIMATION_TIME),
    //    new cc.CallFunc(function(selfTarget){
    //        cc.log("to remove。。。。");
    //        selfTarget.removeFromParent(true);
    //        cc.log("mask removed。。。。");
    //        //todo 展开完毕,遮罩移除, is there anything else?
    //        cs.customEventManager.dispatchEvent(ASST_INFO_EVENT, {type:AsstInfo.TYPE_OPEN_LAYER});
    //    })
    //))
};

MainController.playBtnSoundEffect = function(sender)
{
    MainController.playEffect("click.mp3");
};

/**
 * @deprecated 废弃 by zouly, please use playBtnSoundEffect instead. there is no need to play button effect in you button callback manually
 * addClickEventListener 默认自带按钮音效 详细请参阅 cocos2dExtend.js 有关于addClickEventListener的重写
 * @param sender
 */
MainController.playButtonSoundEffect = function(sender)
{

    return;
};

/**
 * 播放声音
 * @param str
 * @param {Boolean} [loop]
 * @returns {Number|null}
 */
MainController.playEffect = function(str, loop){
    if(!str){
        return;
    }
    var loop = loop == undefined ? false : loop;
    if(MainController.getInstance().isOpenAudio()){
        var audioId = cc.audioEngine.playEffect("res/sounds/" + str, loop);
        return audioId;
    }
    cc.log("音效没播放");
};

/**
 * @param {string} str
 * @param {JSON|Object} [moreProperties] keys: {string}fontName {float}fontSize {color}color3b {string}title {function(al)}callback {boolean}showCloseButton
 */
MainController.showAlertByText = function(str, moreProperties) {
    var layer = MainController.getAlertLayer(str, moreProperties);
    MainController.pushLayerToRunningScene(layer);
    return layer;

};

/**
 * @param {string} str
 * @param {JSON|Object} [moreProperties] keys: {string}fontName {float}fontSize {color}color3b {string}title {function(al)}callback {boolean}showCloseButton
 */
MainController.getAlertLayer = function(str, moreProperties) {
    if(typeof PopLayerWithOKButton == "undefined"){
        return null;
    }
    if (moreProperties == undefined) {
        moreProperties = {};
    }

    var fontName = moreProperties["fontName"];
    var fontSize = moreProperties["fontSize"];
    var color3b = moreProperties["color3b"];
    var callback = moreProperties["callback"];
    var showCloseButton = moreProperties["showCloseButton"];
    var zOrder = moreProperties["zOrder"];

    var label = new cc.LabelTTF(str, fontName == undefined ? FONT_ARIAL_BOLD : fontName, fontSize == undefined ? 28 : fontSize);
    label.setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
    if (color3b == undefined) {
        label.setColor(cs.GRAY);
    } else {
        label.setColor(color3b);
    }

    var l = new cc.Layer();
    l.setContentSize(label.getContentSize());
    l.addChild(label);
    label.setPosition(cc.pCenter(l.getContentSize()));
    var addSize = undefined;
    if(label.width < 500){
        addSize = cc.size(500 - label.width, 0);
        cc.log("addSize", JSON.stringify(addSize));
    }
    var layer = new PopLayerWithOKButton(l, addSize, callback);
    if (showCloseButton) {
        layer.setCloseButtonVisible(true);
    }
    //layer.setBackGroundImage("bg_tutorial.png");
    layer.setTitleString(LocalString.getString("SHOW_ALERT_TITLE"));
    if(zOrder){
        layer.setLocalZOrder(zOrder);
    }
    return layer;
};

/**
 * @param {string} str
 * @param {JSON|Object} [moreProperties] keys: {String}fontName {float}fontSize {color}color3b
 */
MainController.showAutoDisappearAlertByText = function(str, moreProperties) {
    if (moreProperties == undefined) {
        moreProperties = {};
    }

    var fontName = moreProperties["fontName"];
    var fontSize = moreProperties["fontSize"];
    var color3b = moreProperties["color3b"];
    var delaySecs = moreProperties["delaySecs"];

    var label = new cc.LabelTTF(str, fontName == undefined ? FONT_ARIAL_BOLD : fontName, fontSize == undefined ? 30 : fontSize);
    label.setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);

    if (color3b != undefined) {
        label.setColor(color3b);
    }
    label.setColor(cc.WHITE);
    //label.enableStroke(cc.BLACK, 2);

    var delaySecs = delaySecs || null;
    if(!cc.isNumber(delaySecs) && label.width > 350){
        delaySecs = label.width/270;
    }

    MainController.showAutoDisappearAlertByNode(label, delaySecs);
};

/**
 * @param {ccui.Widget | cc.Node} node
 * @param {Number} [delaySec]
 */
MainController.showAutoDisappearAlertByNode = function(node, delaySecs) {
    var bgSprite = new cc.Scale9Sprite("bg_common_prompt.png");
    //bgSprite.setInsetLeft(0.01);
    bgSprite.setContentSize(node.width + 20, 60);

    var rootNode = new cc.Node();
    rootNode.addChild(bgSprite);
    rootNode.addChild(node);

    // 让根节点以及其子节点暂停事件响应
//    cc.eventManager.pauseTarget(rootNode, true);

    var scene = cc.director.getRunningScene();
    scene.addChild(rootNode);
    rootNode.setAnchorPoint(cc.p(0.5, 0.5));
    rootNode.setPosition(cc.pCenter(cc.winSize));
    rootNode.setLocalZOrder(1000000);

    if (delaySecs == undefined || delaySecs <= 0) {
        delaySecs = 1.4;
    }

    bgSprite.runAction(new cc.Sequence(new cc.DelayTime(delaySecs), new cc.FadeOut(0.2)));
    node.runAction(new cc.Sequence(new cc.DelayTime(delaySecs), new cc.FadeOut(0.2)));
    scene.runAction(new cc.Sequence(new cc.DelayTime(delaySecs + 0.2), new cc.TargetedAction(rootNode, new cc.RemoveSelf())));
};

/**
 * 获取当前场景最顶层的界面
 * @returns {cc.Layer}
 */
MainController.getTopLayer = function(scene) {
    if(!scene){
        scene = cc.director.getRunningScene();
    }

    for (var children = scene.getChildren(), i = children.length; i > 0; --i) {
        var child = children[i - 1];
        //忽略loading界面
        if(child == LoadingWaitLayer.getInstance()
            || child == this._maskLayer
            || !child.isVisible()){
            continue;
        }
        if (child instanceof cc.Layer) {
            cc.log("loop layerName::", child._layerName);
            return child;
        }
    }

    //if (scene != null) {
    //    for (var children = scene.getChildren(), i = children.length; i > 0; --i) {
    //        var child = children[i - 1];
    //        //忽略loading界面
    //        if(child == this._maskLayer || child == AsstLayer.getInstance()){
    //            continue;
    //        }
    //        if (child instanceof cc.Layer) {
    //            return child;
    //        }
    //    }
    //}
    return null;
};

MainController.showConfirmByText = function(str, okCallBack, cancelCallBack, closeCallBack){
    //现在弹出去标题界面的确认
    var label = cc.LabelTTF(str, FONT_ARIAL_BOLD, 28);
    label.setColor(cc.BLACK);
    var confirmLayer = new ConfirmPopLayer(label,cc.size(150, 80), okCallBack, cancelCallBack, closeCallBack);
    MainController.pushLayerToRunningScene(confirmLayer);
    return confirmLayer;
};

MainController.prototype.removeScrollBulletin = function()
{
    if(this.bulletinPanel){
        try{
            this.bulletinPanel.stopAllActions();
            this.bulletinPanel.removeFromParent();  //场景切换可能会导致 this.bulletinPanel js引用没置空
            this.bulletinPanel = null;
        }catch (e){
            this.bulletinPanel = null;
        }
    }
};

/**
 * 显示滚动公告
 */
MainController.prototype.showScrollBulletin = function(strOrView){
    //先移除
    this.removeScrollBulletin();

    //其他场景一律不显示公告
    if(cc.director.getRunningScene() != MainScene.instance){
        return;
    }

    var bulletinPanel = this.bulletinPanel = new cc.Scale9Sprite("common_notice_bg.png");
    bulletinPanel.setInsetLeft(80);
    bulletinPanel.setInsetRight(80);
    bulletinPanel.setContentSize(cc.winSize.width -500, bulletinPanel.height);

    //滚动公告的上移触摸会移除公告
    var jsonListener = {
        event: cc.EventListener.TOUCH_ONE_BY_ONE,
        swallowTouches: true,
        onTouchBegan: function(touch, event){
            var isOnTouch = UICommon.isOnTouch(touch, event);
            if(isOnTouch){
                this.removeScrollBulletin();
            }
            return isOnTouch;
        }.bind(this)
    };
    cc.eventManager.addListener(jsonListener, bulletinPanel);

    bulletinPanel.setAnchorPoint(0.5, 0);
    cc.director.getRunningScene().addChild(bulletinPanel);
    bulletinPanel.setLocalZOrder(100);
    bulletinPanel.setPosition(cc.winSize.width * 0.5, cc.winSize.height);

    var fontSize = 30;

    var panel = null;
    if(typeof strOrView == "string"){
        cc.log("准备显示公告:", strOrView);
        panel = UIString.scriptToRichTextEx(strOrView, undefined, FONT_ARIAL_BOLD, fontSize, cc.WHITE);
    }else{
        panel = strOrView;
    }

    var clipPanel = ccui.Layout();
//    clipPanel.setBackGroundColor(cc.GREEN);
//    clipPanel.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
    clipPanel.setClippingEnabled(true);
    clipPanel.setContentSize(bulletinPanel.width - 60 * 2, 34);
    bulletinPanel.addChild(clipPanel);
    clipPanel.setPos(cc.pCenter(bulletinPanel.getContentSize()), cc.p(0.5, 0.5));

    panel.setAnchorPoint(0, 0.5);
    clipPanel.addChild(panel);
    panel.setPosition(clipPanel.width - 100, clipPanel.height * 0.5);

    bulletinPanel.contentPanel = panel;
    bulletinPanel.clipPanel = clipPanel;

    //从上往下移出来(动画包含动画这里老是会被中断)
    var moveTo = new cc.MoveTo(0.2, bulletinPanel.getPositionX(), cc.winSize.height - bulletinPanel.height);
    bulletinPanel.runAction(new cc.Sequence(moveTo));

    //内部滚动
    var contentPanel = bulletinPanel.contentPanel;
    var rate = 5;//速度控制 每秒滚动几个字
    var moveTo = new cc.MoveTo((cc.winSize.width + panel.width)/(24 * rate), -contentPanel.width, contentPanel.getPositionY());
    cc.log("移动回收前...");
    var endFunc = new cc.CallFunc(function(target){
        cc.log("移动回收-----...");
        var moveTo = new cc.MoveTo(0.2, this.bulletinPanel.getPosition().x, cc.winSize.height);
        var endFunc = new cc.CallFunc(function(target){
            this.removeScrollBulletin();
        }.bind(this));
        this.bulletinPanel.runAction(new cc.Sequence(moveTo, endFunc));
        //this.removeScrollBulletin();
    }.bind(this));
    contentPanel.runAction(new cc.Sequence(moveTo, endFunc));
};


/**
 * 打开产品编辑界面
 */
MainController.prototype.showProductEditLayer = function ()
{
    var layer = ProductEditLayer.getInstance();
    MainController.pushLayerToRunningScene(layer);
};

/**
 * 强制结束游戏
 */
MainController.forceEndGame = function()
{
    cc.log("MainController.forceEndGame 主动调用 强制结束游戏");
    cc.director.end();
};


/**
 * 弹出加载等待动画
 */
MainController.prototype.showLoadingWaitLayer = function(timeout)
{
    LoadingWaitLayer.getInstance().show(timeout);
    //this._loadingWaitLayer = new LoadingWaitLayer();
    //MainController.pushLayerToRunningScene(this._loadingWaitLayer,false);
};

/**
 * 关闭加载等待动画
 */
MainController.prototype.hideLoadingWaitLayer = function()
{
    LoadingWaitLayer.getInstance().hide();
    //this._loadingWaitLayer.setVisible(false);
    //if(this._loadingWaitLayer)
    //{
    //    MainController.popLayerFromRunningScene(this._loadingWaitLayer);
    //    this._loadingWaitLayer = null;
    //}
};

// 打开跳转充值界面
MainController.prototype.showGoToRechargeLayer = function()
{
    if (isEducationVersion) {
        MainController.showAutoDisappearAlertByText("模拟币不足");
    }
    else {
        var str = "<l c=3b4b79>"+ LocalString.getString("GO_RECHARGE_TIP")+ "\n</l>";
        var richTextEx = UIString.scriptToRichTextEx(str, 480, "Arial", 30, cc.BLACK);
        var content = UICommon.createPanelAlignWidgetsWithPadding(46, cc.UI_ALIGNMENT_VERTICAL_CENTER, richTextEx);
        var layer = new ConfirmPopLayer(content,null,function(){
            MainController.popLayerFromRunningScene(layer);
            MainController.getInstance().showRechargeLayer();
        });
        layer.setCloseButtonVisible(false);
        layer.getOkButton().setTitleText(LocalString.getString("GO_RECHARGE_OK"));
        MainController.pushLayerToRunningScene(layer);
    }

};

MainController.prototype.showRechargeLayer = function()
{
    var isOpenRecharge = ClientConfig.getInstance().isOpenRecharge();
    if(!isOpenRecharge){
        MainController.showAlertByText("暂停充值");
        return;
    }

    //充值前是否需要录入实名
    var isReChargeNeedName = ClientConfig.getInstance().isReChargeNeedName();
    var realName = Player.getInstance().getRealName();
    var phone = Player.getInstance().getPhone();
    cc.log("isReChargeNeedName::",isReChargeNeedName);
    cc.log("realName::",realName);
    cc.log("phone::",phone)
    if(isReChargeNeedName && !Player.getInstance().isExistsRealNameAndPhone()){
        MainController.getInstance().showUserAuthentication();
        return;
    }
    //游客
    if(Player.getInstance().isGuest()) {
        cc.eventManager.dispatchCustomEvent(NOTIFY_EXCHANGE_TO_REGISTER);
    }
    else
    {
        var appRechargeType = ClientConfig.getInstance().getAppRechargeType();
        if(appRechargeType == 8) {
            // 曝光币直接跳到对方提供的Web页面支付
            var req = {};
            new HttpRequest("queryChudianyunRechargeHtml", req, function(data){
                var layer = new WebPayLayer(data.html, LocalString.getString("RECHARGE_WEB_TITLE"), "chudianyun.com");
                layer.disableDetector();
                MainController.pushLayerToRunningScene(layer);
            });
        }
        else {
            var layer = new RechargeLayer();
            MainController.pushLayerToRunningScene(layer);
        }
    }
};

/**
 * 下载apk
 * @param url
 */
MainController.prototype.downloadApk = function(url)
{
    // 先清理旧补丁
    var storagePath = jsb.fileUtils.getWritablePath() + "updatez/";
    jsb.fileUtils.removeDirectory(storagePath);

    if (cc.sys.platform == cc.sys.ANDROID) {
        cc.log("ANDROID downloadApk url::", url);
        var layer = new LoadingProgressLayer();
        MainController.pushLayerToRunningScene(layer);
        jsb.reflection.callStaticMethod("com/luogu/custom/JniTool", "downLoadFile", "(Ljava/lang/String;Ljava/lang/String;)V", url, "spinageUpdate.apk");
    }
    else if (cc.sys.platform == cc.sys.IPHONE || cc.sys.platform == cc.sys.IPAD) {
        cc.log("IPHONE version update");
    }
    else {
        cc.log("OTHER version update");
    }
};

/**
 * @param {SocketManager} sm
 */
MainController.prototype.setSocketManager = function(sm) {
    cc.log("----11 setSocketManager");
    this._socketManager = sm;
};

MainController.prototype.getSocketManager = function() {
    //cc.log("----11 setSocketManager");
    return this._socketManager;
};

/**
 * 连接服务器
 * @param {function(SocketManager)} callback
 */
MainController.prototype.connectToServer = function() {
    var ip = ClientConfig.getInstance().getTcpAddressIP();
    var port = ClientConfig.getInstance().getTcpPort();
    var idFlag = Player.getInstance().getIdFlag();

    if(!ip || !port || "" == idFlag){
        return;
    }

    var sm = SocketManager.getInstance();
    MainController.getInstance().setSocketManager(sm);
    var index = 0;

    cc.log("Maincontroller 尝试连接到 "+ip+":"+port);

    //连接
    sm.connectToServer(ip, port);

    //连接过程是否需要loading界面
    var isShowLoadingView = true;

    if (isShowLoadingView) {
        MainController.getInstance().showLoadingWaitLayer(60);
    }
};

/**
 * 清理工作
 */
MainController.prototype.clean = function()
{
    //重置玩家对象
    Player.reset();
    //重置socketManager对象
    SocketManager.reset();
    //客户端配置对象
    ClientConfig.reset();
    //重置MailManager对象
    MailManager.reset();
    //重置设备对象
    DeviceInfoManager.reset();
};

/**
 * 登出（注意 这里的登出会彻底退出，数据全清）
 */
MainController.prototype.logout = function()
{
    var cisTrade = cs.getItem("cis_trade");
    var cisUser = cs.getItem("cis_user");
    var tcpIP = cs.getItem("tcpIP");
    var channel = cs.getItem("channel");
    var invitationMapStr = cs.getItem(GB.ST_INVITATION_MAP_STR);

    //尝试强制清理
    cs.removeItem(GB.ST_ACCOUNT);
    cs.removeItem(GB.ST_PASSWORD);
    cs.removeItem(GB.ST_PLATFORM);
    cs.removeItem(GB.ST_SERVER_ADDR);

    //全部清理
    cc.sys.localStorage.clear();

    DataPool = {};
    DataPool.logArr = [];

    //清理存储文件
    var fileArray = cs.GameFileUtils.getFileListInPath("", false);
    for(var i = 0; i < fileArray.length; i++){
        var filePath = fileArray[i];
        //防止删除热更文件
        if(filePath && filePath.indexOf("updatez") < 0 && (filePath.endsWith(".json") || filePath.endsWith(".txt"))){
            cs.GameFileUtils.deleteFile(filePath);
        }
    }

    //清理数据对象 连接等等
    this.clean();

    cs.setItem("cis_trade",cisUser);
    cs.setItem("cis_user",cisTrade);
    cs.setItem("tcpIP",tcpIP);
    cs.setItem("channel",channel);

    if(!GB.isSplitLoginModel){
        cs.setItem(GB.ST_INVITATION_MAP_STR, invitationMapStr);
    }

    cc.director.getRunningScene().runAction(new cc.Sequence(new cc.DelayTime(0.01), cc.callFunc(function() {
        ClientLoginModule.getInstance().startup();
    })));
    
};

MainController.prototype.reLogin = function()
{
    DataPool = {};
    DataPool.logArr = [];

    //清理数据对象 连接等等
    this.clean();

    if(TradingHallLayer.instance){
        TradingHallLayer.instance.removeFromParent();
    }

    cc.director.getRunningScene().runAction(new cc.Sequence(new cc.DelayTime(0.01), cc.callFunc(function() {
        cc.director.runScene(new cc.TransitionFade(0.01, new InitScene(), cc.BLACK));
    })));
};

MainController.prototype.showCashOutLayer = function()
{
    var layer = null;
    if(ClientConfig.getInstance().getHasSetPayPassword()) {
        layer = new PayPasswordVerifyLayer();
    }
    else
    {
        layer = new PayPasswordSetLayer();
    }
    MainController.pushLayerToRunningScene(layer);
};

/**
 * 打开账户界面
 */
MainController.prototype.showAccountLayer = function()
{
    var layer = new AccountLayer();
    MainController.pushLayerToRunningScene(layer);
};

/**
 * 打开排行榜界面
 */
MainController.prototype.showRankLayer = function()
{
    var layer = new RankLayer();
    MainController.pushLayerToRunningScene(layer);
};

/**
 * 打开邮件界面
 */
MainController.prototype.showMailLayer = function()
{
    var layer = new MailLayer();
    MainController.pushLayerToRunningScene(layer);
};

/**
 * 打开设置界面
 */
MainController.prototype.showSettingLayer = function()
{
    var layer = new SetLayer();
    MainController.pushLayerToRunningScene(layer);
};

/**
 * 打开联系客服界面
 */
MainController.prototype.showCustomerServiceLayer = function()
{
    MainController.getInstance().showLoadingWaitLayer();
    var feedbackGetCallBack = function(data) {
        MainController.getInstance().hideLoadingWaitLayer();
        var layer = new UserFeedbackLayer(data);
        MainController.pushLayerToRunningScene(layer);
    }
    HttpManager.sendRequest("feedbackGet",{}, feedbackGetCallBack);
};

/**
 * 打开资金流水界面
 */
MainController.prototype.showMoneyFlowLayer = function()
{
    var layer = new MoneyFlowLayer();
    MainController.pushLayerToRunningScene(layer);
};

/**
 * 打开网络不稳定提示框
 */
MainController.prototype.showNetworkConnectFailLayer = function(strKey)
{
    var titleTxt = new ccui.Text(LocalString.getString("SHOW_ALERT_TITLE"), FONT_ARIAL_BOLD, 32);
    var str = "<l c=15191A>"+ LocalString.getString(strKey)+ "\n \n</l>";
    var richTextEx = UIString.scriptToRichTextEx(str, 460, "Arial", 30, cc.BLACK);
    var content = UICommon.createPanelAlignWidgetsWithPadding(46, cc.UI_ALIGNMENT_VERTICAL_CENTER, titleTxt, richTextEx);

    var layer = new PopLayerWithOKButton(content);
    layer.setCloseButtonVisible(false);
    MainController.pushLayerToRunningScene(layer);
};

/**
 * 登录界面
 */
MainController.prototype.showLoginLayer = function(){
    var layer = new LoginTypeLayer();
    if (isEducationVersion) {
        layer = new LoginLayer();
    }
    MainController.pushLayerToRunningScene(layer);
};

/**
 * 检测邀请码绑定
 */
MainController.prototype.checkInvitationBind = function(callBack)
{
    var phone = DataPool.verifyPhone;
    var openId = DataPool.verifyOpenId;
    //表示第三方登录需要检测邀请码
    if( appStoreName != APPSTORE_UNKWON
        && (phone || openId)
        && ClientConfig.getInstance().isNeedInvitationCode() && !GB.invitationCode)
    {
        var successCallBack = function(data)
        {
            if(!data || data["bind"] == 0){
                //MainController.showAlertByText("还未绑定邀请码,请先输入邀请码");
                InvitationCodeLayer.getInstance().show();
                return;
            }else{
                callBack();
            }
        };
        HttpManager.requestCheckBinding(successCallBack, openId, phone);
    }else{
        callBack();
    }
};

MainController.prototype.showUserDetailLayer = function(uid)
{
    var successCallBack = function(data)
    {
        MainController.getInstance().hideLoadingWaitLayer();
        var player = new Player(data);
        var layer = new UserDetailLayer(player);
        MainController.pushLayerToRunningScene(layer);
        cc.eventManager.dispatchCustomEvent(NOTIFY_USER_DETAIL_OPENED, player);
    };

    var errorCallBack = function()
    {
        MainController.getInstance().hideLoadingWaitLayer();
    };
    MainController.getInstance().showLoadingWaitLayer();
    HttpManager.requestUserDetail(successCallBack, uid, errorCallBack);
};

// 打开用户协议页面
MainController.prototype.showUserAgreementLayer = function(jsonData)
{
    var richTextEx = UIString.scriptToRichTextEx("<l c=15191A>"+ jsonData["agreementContent"] +"</l>", 1100, "Arial", 24, cc.BLACK);
    var corporationTxt = new ccui.Text(jsonData["corporation"], FONT_ARIAL_BOLD, 24);
    corporationTxt.setColor(cs.BLACK);
    var content = UICommon.createPanelAlignWidgetsWithPadding(20, cc.UI_ALIGNMENT_VERTICAL_RIGHT, richTextEx, corporationTxt);
    var scrollview = UICommon.createScrollViewWithContentPanel(content, cc.size(1100, 500), ccui.ScrollView.DIR_VERTICAL);

    var layer = new PopLayerWithOKButton(scrollview);
    layer.setTitleString(jsonData["agreementTitle"]);
    MainController.pushLayerToRunningScene(layer);
};

/**
 * 打开商城界面
 */
MainController.prototype.showShopLayer = function()
{
    //TODO
    var layer = new WebShopLayer("http://www.ppjy168.com:8090/lexuangou/index.htm?uid=2");
    MainController.pushLayerToRunningScene(layer);
};

/**
 * 打开分享界面
 */
MainController.prototype.showShareLayer = function()
{
    var layer = new ShareLayer();
    MainController.pushLayerToRunningScene(layer);
};

/**
 * 房间选择界面
 */
MainController.prototype.showRoomChooseLayer = function()
{
    RoomModule.getInstance().showChoose();
};

/**
 * 强制下线
 */
MainController.prototype.forceOffline = function(message)
{
    var text = new ccui.Text(message, FONT_ARIAL_BOLD, 36);
    text.setColor(cs.BLACK);
    var layer = new PopLayerWithOKButton(text);
    layer.setOkButtonCallFunc(function(){
        MainController.popLayerFromRunningScene(layer);
        //登出
        MainController.getInstance().logout();
    });

    //移除主界面
    if (MainScene.instance)
        MainScene.instance.removeMainLayer();

    layer.setMaskTouchEnabled(false);
    MainController.pushLayerToRunningScene(layer);
};

/**
 * 重新恢复场景
 */
MainController.prototype.recoverSceneData = function()
{
    var curSecs = cs.getCurSecs();
    if(this._lastRecoverTime > 0 && (curSecs - this._lastRecoverTime) < 6){
        cc.log("lastRecoverTime :"+TimeHelper.formatSecs(this._lastRecoverTime, "HH:mm:ss") + "too often...return");
        return;
    }
    this._lastRecoverTime = cs.getCurSecs();

    //=================重新恢复场景======================
    //重新订阅
    var productInfo = Player.getInstance().getCurProductInfo();
    if(productInfo) {
        SocketRequest.subscribeQuote(productInfo.getId());
    }
    //刷新账号信息(主要是为了刷货币)
    cc.eventManager.dispatchCustomEvent(NOTIFY_REFRESH_ACCOUNT_DETAIL);

    //刷新期权列表
    var successCallBack =  function(data){
        Player.getInstance().initProductList(data);
    }.bind(this);
    HttpManager.requestProductList(successCallBack);

    //持仓数
    HttpManager.requestPositionNum(function(){
        cc.eventManager.dispatchCustomEvent(NOTIFY_POSITION_CHANGES);
    });

    //红点列表
    var successCallBack = function(data)
    {
        Player.getInstance().initRedDot(data);
    };
    HttpManager.requestRedDotList(successCallBack);

    //查询所有未结算的订单
    //--模拟单
    HttpManager.requestAllUnSettledOrders(true);
    //---正式单
    if(!Player.getInstance().isGuest()){
        HttpManager.requestAllUnSettledOrders(false);
    }
};

/**
 * 上传日志文件
 */
MainController.prototype.uploadLogFile = function(){
    var curSecs = cs.getCurSecs();
    if(!this._lastUploadLogTime){
        this._lastUploadLogTime = cs.getCurSecs();
    }else{
        if((curSecs - this._lastUploadLogTime) < 30 * 3600){
            return;
        }
    }

    var fileName =  LogModel.generateLogFile();
    setTimeout(function(){
        var endPoint = "https://oss-cn-shenzhen.aliyuncs.com";
        var accessKeyId = "LTAI7WKAo6Wy8Iuq";
        var accessKeySecret = "rFUNC7UfG80nTMKKgJmiYJHvcIav03";
        var bucketName = "ipatch2logs";
        var addr = "http://static.aiweipan.com";
        var dataStr = TimeHelper.formatSecs(undefined, "yyMMdd_HHmm");
        var objectKey = "client/"+appName+"/"+ dataStr + "/"   +fileName;
        var uploadFilePath = jsb.fileUtils.getWritablePath() + fileName;
        if(cc.sys.os == cc.sys.OS_ANDROID)
        {
            //触发上传
            var jsonData = {};
            jsonData.endPoint = endPoint;
            jsonData.accessKeyId = accessKeyId;
            jsonData.accessKeySecret = accessKeySecret;
            jsonData.bucketName = bucketName;
            jsonData.objectKey = objectKey;
            jsonData.uploadFilePath = uploadFilePath;
            //
            jsb.reflection.callStaticMethod("com/luogu/custom/JniTool", "upLoadFile", "(Ljava/lang/String;)V", JSON.stringify(jsonData));
        }
        else if(cc.sys.os == cc.sys.OS_IOS)
        {
            cc.log("AliyunOSSTool ios");
            jsb.reflection.callStaticMethod("AliyunOSSTool", "initOSSClient:::::", accessKeyId, accessKeySecret, endPoint, bucketName, addr);
            jsb.reflection.callStaticMethod("AliyunOSSTool", "uploadObjectAsync::", objectKey, uploadFilePath);

        }
    }, 0.1*1000);
};

/**
 * 用户实名录入
 */
MainController.prototype.showUserAuthentication = function(){
    if(!ClientConfig.getInstance().isReChargeNeedName()){
        cc.log("showUserAuthentication 不需要实名录入");
        return;
    }
    var layer = new UserAuthentication();
    MainController.pushLayerToRunningScene(layer);
};
