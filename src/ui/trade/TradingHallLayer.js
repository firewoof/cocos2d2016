/**
 * Created by Administrator on 2016/5/10.
 */
var GB = GB || {};

GB.INPUT_TYPE_CUSTOM = 1; //自定义输入
GB.INPUT_TYPE_FIXED = 2;  //固定金额
GB.INPUT_TYPE_ADD_OR_SUB = 3;   //加减
GB.INPUT_TYPE_DEL = 4;   //加减
GB.INPUT_TYPE_MULT = 5;  //x倍增

GB.QuoteFragmentNum = 8;   //
GB.AUTO_DISPLAY_ANIMATION_TAG = 10000;      //自动移除的动画TAG
GB.MAX_CANDLE_DISPLAY = 100;         //最多能显示多少个蜡烛
GB.MIN_CANDLE_DISPLAY = 5;           //最少显示多少个蜡烛

GB.UPDATE_TYPE_NORMAL = 0;
GB.UPDATE_TYPE_CHART_SELECT_CLOSE = 1;      //图表选择关闭
GB.UPDATE_TYPE_FROM_BACK = 2;

var TradingHallLayer = BaseLayer.extend({
    _trendPanel:undefined,   //交易趋势图底板
    _lineData:undefined,
    _productInfo:undefined,
    _isSimulateTrade:false,
    _balance:0,
    _beSelectedBetInfo:undefined,   //持仓区被选择的(查看订单详情的)

   ctor:function(args)
   {
       this._super("TradingHallLayer");
       cc.log("TradingHallLayer. ctor" );
       this.setBlockTouches(false);

       var isSimulateTrade = cs.getItem("isSimulateTrade");
       //正式用户 一律进来首先就是模拟交易
       if(isSimulateTrade == "true" && Player.getInstance().isGuest() && ClientConfig.getInstance().isPracticeEnabled()) {
           this._isSimulateTrade = GB.isSimulateTrade = true;
       }else{
           this._isSimulateTrade = GB.isSimulateTrade = false;
       }

       this._betAmount = 1;
       this._inputCountInterval = 0;
       this._zoomScale = 1.0;

       this._balaceChangesInterval = 0;
       this._fetchAvatarArray = [];
       this._balanceChanges = [];
       this._onlineNum = 0;

       //读取本地缓存行情数据
       //Player.getInstance().readQuoteDataCache();
       //读取本地保存的订单数据
       Player.getInstance().readBetData();

       //
       this.initUI();

       //左侧菜单区
       this.initMenu();

       //k线区
       this.initTrendPanel();

       //世界频道区(公告)
       this.initWorldChannel();

       //时间尺度选择面板
       this.initTimeScaleSelectPanel();

       //房间系统
       this.initRoomPanel();

       //buttons
       this.initAllButtonClick();

       //属性面板
       this.initPropertyPanelTouch();

       //动画面板
       this.initAniPanel();

       //控制面板
       this.initControlPanel();

       //图表选择
       this.initChartSelectedPanel();

       //多点触控面板
       this.initMultiTouchPanel();

       //历史行情面板
       this.initHistoryPanel();

       //测试按钮
       this.initTestButton();

       //listeners
       this.addListener();

       //schedule
       this.scheduleUpdate();

       //this.testAction();
   },

    onEnterTransitionDidFinish:function()
    {
        //刷一次金钱
        cc.eventManager.dispatchCustomEvent(NOTIFY_REFRESH_ACCOUNT_DETAIL);

        //准备请求大厅数据
        this.doRequest();
    },

    doRequest:function()
    {
        //请求交易品
        MainController.getInstance().showLoadingWaitLayer();
        var successCallBack =  function(data){
            MainController.getInstance().hideLoadingWaitLayer();
            //初始化产品数据
            Player.getInstance().initProductList(data);
            if(Player.getInstance().getProductArray().length == 0){
                var logStr = "产品列表为空...";
                testSeverLog(logStr);
                G_collectLog(logStr);
                return;
            }
            //拿到默认产品
            var productInfo = this.getDefaultProduct();
            //放开产品交易前预处理
            this.tradeStart(productInfo);

            //移除所有下架的订单（防止其他地方出错）
            this.removeUselessBets(GB.isSimulateTrade);
            this.removeUselessBets(!GB.isSimulateTrade);

            //开场查一次所有未结算的订单（包括模拟和正式）
            this.requestAllUnSettledOrders(GB.isSimulateTrade);
            this.requestAllUnSettledOrders(!GB.isSimulateTrade);
        }.bind(this);
        HttpManager.requestProductList(successCallBack);
    },

    /**
    * 房间重刷信息
    */
    reloadRoom: function(){
        var roomId = Player.getInstance().getRoomId();
        var productId = Player.getInstance().getCurProductInfo().getId();
        cc.log("Hall roomId::",roomId);
        if((roomId != undefined  || roomId < 0) && isRoomSysEnabled){
            //关闭大厅头像抓取
            this._leftAvatarPanel.setVisible(true);
            this.setStopFetch(true);
            //请求房间返回
            var successCallBack = function(data){
                if(!cc.sys.isMobile){
                    cc.log("roomData:", JSON.stringify(data));
                }
                var roomInfo = Player.getInstance().getRoomInfo();
                roomInfo.initFromJson(data);
                //可能不在房间了 这里会返回空,这个补救很重要(tcp可能已错过慢)
                if(!data["roomId"]){
                    cc.log("房间已不存在...准备显示抓取面板");
                    Player.getInstance().setRoomId(null);
                    cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_STATE_CHANGE);
                }else{
                    this.showRoomAvatar(productId, data);
                }
            }.bind(this);
            HttpManager.requestQueryRoomTradeInfo(successCallBack, productId);
        }else{
            this.showFetchAvatar();
        }
    },

    showOnlinePanel:function(isShow)
    {
        if(isShow){
            this._roomEntryPanel.setVisible(false);
            this._onlinePanel.setVisible(true);
            this._onlinePanel.setPosition(this._roomEntryPanel.getPosition());
        }else{
            this._roomEntryPanel.setVisible(true);
            this._onlinePanel.setVisible(false);
        }
    },

    setStopFetch:function(isStop)
    {
        for(var i = 0; i < this._fetchAvatarArray.length; i++){
            var fetchAvatar = this._fetchAvatarArray[i];
            fetchAvatar.setStop(isStop);
        }
    },

    showRoomAvatar:function(productId, data){
        this._roomEntryPanel.refresh();
        this._leftAvatarPanel.switchProduct(productId, data);
        this._trendChartLayer._fetchPanel.reset();      //抓取面板重置
        this._fetchAvatarPanel.setVisible(false);
        this._leftAvatarPanel.setVisible(true);

        var roomInfo = Player.getInstance().getRoomInfo();
        roomInfo.initFromJson(data);
        roomInfo.setRoomName(data["roomName"]);
        roomInfo.setRoomId(data["roomId"]);
    },

    showFetchAvatar:function()
    {
        this._roomEntryPanel.refresh();
        this._fetchAvatarPanel.setVisible(true);
        this._leftAvatarPanel.setVisible(false);
        //开启大厅头像抓取
        this.setStopFetch(false);
        //抓取面板重置
        this._trendChartLayer._fetchPanel.reset();

        Player.getInstance().setRoomId(null);
        var roomInfo = Player.getInstance().getRoomInfo();
        roomInfo.setRoomId(null);
    },

    /**
     * 移除被下架的订单
     */
    removeUselessBets:function(isSimulateTrade)
    {
        var betArray = Player.getInstance().getCurDayBetArray();
        if(isSimulateTrade){
            betArray = Player.getInstance().getCurDaySmBetArray();
        }

        //map 方便返回时查询
        var isExists = false;
        for(var i = 0; i < betArray.length; i++){
            var betInfo = betArray[i];
            if(!Player.getInstance().getProductById(betInfo.getProductId())){
                isExists = true;
                break;
            }
        }

        if(isExists){
            cc.log("记录存在已下架订单，移除.....");
            var newBetArray = [];
            for(var i = 0; i < betArray.length; i++){
                var betInfo = betArray[i];
                if(!Player.getInstance().getProductById(betInfo.getProductId())){
                    continue;
                }
                newBetArray.push(betInfo);
            }
            if(isSimulateTrade){
                Player.getInstance().setCurDaySmBetArray(newBetArray);
            }else{
                Player.getInstance().setCurDayBetArray(newBetArray);
            }
        }
    },

    //请求一次所有未结算的订单
    requestAllUnSettledOrders:function(isSimulateTrade){
        var unSettledOrders = [];
        var betArray = Player.getInstance().getCurDayBetArray();
        if(isSimulateTrade){
            betArray = Player.getInstance().getCurDaySmBetArray();
        }

        //map 方便返回时查询
        var unSettledMap = {};
        for(var i = 0; i < betArray.length; i++){
            var betInfo = betArray[i];
            if(!betInfo.isSettled()){
                unSettledOrders.push(betInfo);
                unSettledMap[betInfo.getOrderId()] = betInfo;
            }
        }

        var successCallBack = function(jsonData){
            var countList = jsonData["countList"];
            for(var i = 0; i < countList.length; i++){
                var betData = countList[i];
                var orderId = betData["orderId"];
                var betInfo = unSettledMap[orderId];
                if(betInfo){
                    betInfo.initFromJson(betData);
                    //通知结算
                    if(betInfo.isSettled())
                        cc.eventManager.dispatchCustomEvent(NOTIFY_ORDER_COUNT, betInfo);
                }
            }
        };

        if(unSettledOrders.length == 0)
            return;
        cc.log("查询所有未结算订单：", isSimulateTrade);
        HttpManager.requestQueryOrder(successCallBack, isSimulateTrade, unSettledOrders);
    },

    /**
     * 主动查询持仓
     */
    requestPosition:function()
    {
        HttpManager.requestPositionNum();
    },

    /**
     * 主动请求一次产品列表
     */
    requestUpdateProduct:function()
    {
        var successCallBack =  function(data){
            MainController.getInstance().hideLoadingWaitLayer();
            //初始化产品数据
            Player.getInstance().initProductList(data);
        }.bind(this);
        HttpManager.requestProductList(successCallBack);
    },

    /**
     * k线绘制开放前要做到事
     */
    tradeStart:function(productInfo, isForceStart)
    {
        if(!productInfo){
            return
        }
        var curProduct = Player.getInstance().getCurProductInfo();
        if(curProduct != productInfo || isForceStart){
            Player.getInstance().setCurProductId(productInfo.getId());
            this._productInfo = productInfo;

            if(isRoomSysEnabled){
                //设置交易品种
                MainController.getInstance().showLoadingWaitLayer();
                HttpManager.requestSetTradeOption(function(){
                    MainController.getInstance().hideLoadingWaitLayer();
                    cc.log("HttpManager SetTradeOption finish");
                    this.reloadRoom();
                }.bind(this),  productInfo.getId());
            }

            //订阅行情
            SocketRequest.subscribeQuote(productInfo.getId());

            //检查行情队列是否要重置
            Player.getInstance().getLineDataById(productInfo.getId()).checkResetTime();

            cc.log("产品开始切换::", this._productInfo.getName());
        }

        //
        this.refreshByProduct();

        cc.eventManager.dispatchCustomEvent(NOTIFY_PRODUCT_TRADE_START);
    },

    getDefaultProduct:function()
    {
        var lastSelectedProductId = cs.getItem("lastSelectedProductId");    //最近选择的
        var firstFocusedProductId = Player.getInstance().getFocusedProductIdArray()[0]; //关注列表第一个
        var firstProductId = Player.getInstance().getProductArray()[0].getId();         //产品列表第一个
        var defaultProductId = lastSelectedProductId || firstFocusedProductId || firstProductId;

        var productInfo = null;
        var tempProductInfo = Player.getInstance().getProductById(defaultProductId);
        if(tempProductInfo && tempProductInfo.isOpen())
            productInfo = Player.getInstance().getProductById(defaultProductId);

        if(!productInfo) {
            var focusedProductIdArray = Player.getInstance().getFocusedProductIdArray();
            for(var i = 0; i < focusedProductIdArray.length; i++) {
                var tempId = focusedProductIdArray[i];
                var tempProductInfo = Player.getInstance().getProductById(tempId);
                if(tempProductInfo && tempProductInfo.isOpen())
                {
                    productInfo = tempProductInfo;
                    break;
                }
            }
        }

        if(!productInfo)
        {
            //先默认第一个
            productInfo = Player.getInstance().getProductArray()[0];
            var productArray = Player.getInstance().getProductArray();
            for(var i = 0; i < productArray.length; i++) {
                var tempProductInfo = productArray[i];
                if(tempProductInfo.isOpen())
                {
                    productInfo = tempProductInfo;
                    break;
                }
            }
        }

        if(productInfo){
            cc.log("productInfo::" + productInfo.getName() + "  isOpen::" + productInfo.isOpen());
        }

        return productInfo;
    },

    cleanup:function()
    {
        this._super();
        //设置最后一次的投注
        Player.getInstance().setLastBetAmount(this._betAmount);
        cs.setItem("lastSelectedProductId", this._productInfo.getId());
        cs.setItem("lastBetAmount", this._betAmount);
    },

    addListener:function()
    {
        //模拟币
        this._testCoinUpdateListener = cc.eventManager.addCustomListener(NOTIFY_REFRESH_USER_TEST_COIN, function()
        {
            cc.log("NOTIFY_REFRESH_USER_TEST_COIN");
            this.refreshBalance();
        }.bind(this));

        this._balanceUpdateListener = cc.eventManager.addCustomListener(NOTIFY_REFRESH_USER_BALANCE, function()
        {
            cc.log("NOTIFY_REFRESH_USER_BALANCE");
            this.refreshBalance();
        }.bind(this));

        this._onlineNumUpdateListener = cc.eventManager.addCustomListener(NOTIFY_ONLINE_NUM_UPDATE, function(event)
        {
            var userData = event.getUserData();
            var onlineNum = userData["onlineNum"];
            this.refreshOnlineNum(onlineNum);
        }.bind(this));

        //手动切换产品
        this._productSeletedChangedListener = cc.eventManager.addCustomListener(NOTIFY_PRODUCT_SELECT_CHANGE, function(event)
        {
            var productId = event.getUserData();
            var productInfo = Player.getInstance().getProductById(productId) ;
            //强制关闭我的交易
            this._controlPanel.setTradeControlVisible();
            ////切换产品
            if(productInfo && this._productInfo.getId() != productId)
            {
                //重建
                this.tradeStart(productInfo);
                //保存最新打开的产品记录
                cs.setItem("lastSelectedProductId", productInfo.getId());
            }

        }.bind(this));

        //被动切换产品
        this._productSeletedChangedListener = cc.eventManager.addCustomListener(NOTIFY_PRODUCT_CHANGE, function(event)
        {
            var productId = event.getUserData();
            var productInfo = Player.getInstance().getProductById(productId) ;
            ////切换产品
            if(productInfo && this._productInfo.getId() != productId)
            {
                //重建
                this.tradeStart(productInfo);
                //保存最新打开的产品记录
                cs.setItem("lastSelectedProductId", productInfo.getId());
            }

        }.bind(this));

        this._perOneSecondListener = cc.eventManager.addCustomListener(NOTIFY_PER_ONE_SECOND, function()
        {
            var curSecs = cs.getCurSecs();

            //每2秒检查一次顶层自动消失动画
            if(curSecs % 2 == 0)
            {
                var children = this._animationPanel.getChildren();
                for(var i = 0; i < children.length; i++){
                    var child = children[i];
                    if(child && child.getNumberOfRunningActions() == 0){
                        child.removeFromParent();
                        if(isTestServer){
                            testSeverLog("检测到消失动画异常， 移除...");
                        }
                    }
                }
            }

            var productInfo = Player.getInstance().getCurProductInfo();
            if(!productInfo)
                return;
        }.bind(this));

        //订单结算通知，则本地保存一次订单
        this._orderCountListner =  cc.eventManager.addCustomListener(NOTIFY_ORDER_COUNT, function(event)
        {
            Player.getInstance().saveBetData(GB.isSimulateTrade);
        }.bind(this));

        //首次抓满用户监听
        this._fullFetchListener = cc.eventManager.addCustomListener(NOTIFY_FETCH_FULL_PLAYERS, function(event)
        {
            cc.log("receive NOTIFY_FETCH_FULL_PLAYERS");
            var productId = event.getUserData();
            if(productId == Player.getInstance().getCurProductInfo().getId()) {
                cc.log("todo initFetchPanel productId::", productId);
                this.initFetchPanel(true);
            }
        }.bind(this));

        //看涨看跌人数趋势百分比变化
        this._riseFallPercetListener = cc.eventManager.addCustomListener(NOTIFY_RISE_FALL_PERCENT, function(event)
        {
            var userData = event.getUserData();
            var risePercent = userData["risePercent"];
            var productId = userData["productId"];
            if(cc.isNumber(risePercent) && this._productInfo.getId() == productId)
            {
                var previousPercent = this._trendSlideBar.getPercent();
                var isRunAction = Math.abs(previousPercent - risePercent) > 3;
                this._trendSlideBar.setPercent(risePercent, isRunAction);
            }
        }.bind(this));

        //交易模式切换
        this._switchTradeModeListener = cc.eventManager.addCustomListener(NOTIFY_SWITCH_TRADE_MODE, function(event)
        {
            var isSwitchToRealTrade = event.getUserData();
            if(isSwitchToRealTrade){
                this.switchToRealTrade();
            }else{
                this.switchToPractical();
            }
        }.bind(this));


        //刷新登录状态
        this._loginStateListener = cc.eventManager.addCustomListener(NOTIFY_REFRESH_LOGIN_STATE, function(event)
        {
            cc.log("NOTIFY_REFRESH_LOGIN_STATE 刷新登录状态, 当前状态："+Player.getInstance().getOnline().toString());
            //强制回到下单控制面板(==关闭我的订单历史)
            this.showTradeControlPanel();
            //刷新资金面板
            this.refreshPropertyPanel();
            //登录状态发生变更 强制关闭我的交易界面
            this.showTradeControlPanel();
        }.bind(this));

        //退到后台
        this._gameHideListener = cc.eventManager.addCustomListener(NOTIFY_GAME_ON_HIDE, function()
        {
            this._isWaittingShow = true;    //win32总是会执行两次 这里用个变量控制下
            this._gameHideTime = cs.getCurSecs();
            if(this._trendChartLayer)
                this._trendChartLayer.stop(true);   //停止绘制 并清理k线
            cc.log("TradingHallLayer NOTIFY_GAME_ON_HIDE");
        }.bind(this));
        //
        //回到前台
        this._gameShowListener = cc.eventManager.addCustomListener(NOTIFY_GAME_ON_SHOW, function()
        {
            cc.log("TradingHallLayer NOTIFY_GAME_ON_SHOW");
            //立即生成一次时间
            cs._genCurSecs();

            if(this._isWaittingShow)
            {
                //在后台待一小时以上则重启虚拟机，重进游戏
                if(this._gameHideTime && (cs.getCurSecs() - this._gameHideTime)  > 7200){
                    cc.sys.restartVM();
                    return;
                }

                if(this._productInfo && this._productInfo.isOpen()){
                    this.tradeStart(this._productInfo);
                }else{
                    this.tradeStart(this.getDefaultProduct());
                }
                //查一次所有未结算的订单
                this.requestAllUnSettledOrders();

                //查询持仓数(双保险 tcp重连也会查一次)
                this.requestPosition();

                //请求刷新产品信息
                this.requestUpdateProduct();
            }
            this._isWaittingShow = false;
        }.bind(this));

        //图表类型选择监听
        this._chartSelectChangesListener = cc.eventManager.addCustomListener(NOTIFY_CHART_SELECT_CHANGES, function(event)
        {
            this.refreshSelectedChartImage();

            this.refreshTimeScaleSelectPanel();

            //先简单固定显示50根蜡烛
            this.changeTimeScale();
        }.bind(this));

        //图表区间项改变
        this._chartSelectItemChangesListener = cc.eventManager.addCustomListener(NOTIFY_CHART_ITEM_SELECT_CHANGES, function()
        {
            this.refreshTimeScaleSelectPanel();
        }.bind(this));

        //图表关闭
        this._chartSelectHideListener = cc.eventManager.addCustomListener(NOTIFY_CHART_CLOSE, function()
        {
            //可能要刷新
            this.changeTimeScale(undefined, GB.UPDATE_TYPE_CHART_SELECT_CLOSE);
        }.bind(this));

        if(!isEducationVersion){
            //红点
            this._refreshRedDotListener = cc.eventManager.addCustomListener(NOTIFY_RED_DOT, function(event)
            {
                if(Player.getInstance().getRedDotSum()>0){
                    this._redDotImage.setVisible(true);
                }else{
                    this._redDotImage.setVisible(false);
                }
            }.bind(this));
        }

        //tcp认证成功
        this._tcpAuthListener = cc.eventManager.addCustomListener(NOTIFY_TCP_AUTH_SUCCESS, function()
        {
            if(this._trendChartLayer.isStopped()){
                var productInfo = Player.getInstance().getCurProductInfo();
                //tcp重连后强制启动
                this.tradeStart(productInfo, true);
            }
        }.bind(this));

        //断开连接
        this._tcpDisConnectedListener = cc.eventManager.addCustomListener(NOTIFY_TCP_DISCONNECTED, function()
        {
            this._trendChartLayer.stop(true);
        }.bind(this));

        //房间状态改变
        this._roomListener = cc.eventManager.addCustomListener(NOTIFY_ROOM_STATE_CHANGE, function()
        {
            cc.log("房间状态发生改变...");
            this.reloadRoom();

            var roomId  = Player.getInstance().getRoomId();
            if(!roomId){
                this.requestFullFetchPlayer();
            }
        }.bind(this));

        this._roomBasicChangeListener = cc.eventManager.addCustomListener(NOTIFY_ROOM_BASIC_CHANGE, function()
        {
            cc.log("receive NOTIFY_ROOM_BASIC_CHANGE");
            this._roomEntryPanel.refresh();
        }.bind(this));
    },
    
    update:function(dt)
    {
        //金钱
        this._balaceChangesInterval += dt;
        if(this._balaceChangesInterval > 0.07)
        {
            this._balaceChangesInterval = 0;
            if(this._balanceChanges.length > 0)
            {
                //cc.log("this._balanceChanges.last():: ",this._balanceChanges.last());
                this.doBalanceAddAction(this._balanceChanges.pop());
            }
        }
    },

    /**
     * 左侧菜单
     */
    initMenu:function()
    {
        var menuPanel = this._menuPanel = new Menu();
        this.addChild(menuPanel, 99);
        menuPanel.setPos(leftTopInner(this), ANCHOR_LEFT_TOP);
    },

    /**
     * 金钱增加动画
     * @param node
     * @param endPos
     * @param index
     */
    doBalanceAddAction:function(num) {
        var scaleTo1 = new cc.ScaleTo(0.07, 1.16);
        var setFunc = new cc.CallFunc(function(target){
            target.setString(num+LocalString.getString("YUAN"));
            if(isEducationVersion){
                target.setString(num+LocalString.getString("COMMON_TEST_COIN"));
            }
        });
        var scaleTo2 = new cc.ScaleTo(0.15, 1.0);
        this._balanceText.runAction(new cc.Sequence(scaleTo1, setFunc, scaleTo2));
    },

    initUI:function()
    {
        var ccsObject = this._ccsObject = ccs.loadWithVisibleSize(res.TradingHallLayer_json);
        var layer = this._rootNode = ccsObject.node;
        //加入到当前layer中。
        this.addChild(layer);

        //
        var trendPanel = this._trendPanel = ccui.helper.seekWidgetByName(layer, "trendPanel");
        var topPanel = this._topPanel = ccui.helper.seekWidgetByName(layer, "topPanel");
        var timeScaleSelectPanel = this._timeScaleSelectPanel = ccui.helper.seekWidgetByName(layer, "timeScaleSelectPanel");
        var selectedChartImage = this._selectedChartImage = ccui.helper.seekWidgetByName(timeScaleSelectPanel, "selectedChartImage");
        //
        var leftPanel = this._leftPanel = ccui.helper.seekWidgetByName(layer, "leftPanel");
        //
        var closeBtn = this._closeBtn = ccui.helper.seekWidgetByName(leftPanel, "closeBtn");
        var redDotImage = this._redDotImage = ccui.ImageView("icon_prompt_common.png",ccui.Widget.PLIST_TEXTURE);
        closeBtn.addChild(redDotImage);
        redDotImage.setPos(cc.p(107,65),ANCHOR_CENTER);
        redDotImage.setVisible(false);

        var productEditBtn = this._productEditBtn = ccui.helper.seekWidgetByName(topPanel, "productEditBtn");
        var productNameText = this._productNameText =  ccui.helper.seekWidgetByName(productEditBtn, "nameText");

        var onlinePanel = this._onlinePanel = ccui.helper.seekWidgetByName(leftPanel, "onlinePanel");
        //随机示例用户面板
        var samplePlayerPanel = this._samplePlayerPanel = ccui.helper.seekWidgetByName(leftPanel, "samplePlayerPanel");

        //在线人数
        var onlineNumText = this._onlineNumText = ccui.helper.seekWidgetByName(onlinePanel, "onlineNumText");
        //不得已，替换
        var label = new cc.LabelTTF(LocalString.getString("PEOPLE"), FONT_ARIAL_BOLD, 28);
        label.setColor(cc.color(252, 187, 12));
        this._onlineNumText = UICommon.replaceWidget(onlineNumText, label);

        var onlineUnitText = this._onlineUnitText = ccui.helper.seekWidgetByName(onlinePanel, "onlineUnitText");
        //
        var propertyPanel = this._propertyPanel = ccui.helper.seekWidgetByName(layer, "propertyPanel");
        var balanceText = this._balanceText = ccui.helper.seekWidgetByName(propertyPanel, "balanceText");
        var balanceTitle = this._balanceTitle = ccui.helper.seekWidgetByName(propertyPanel,"balanceTitle");
        var offlineText = this._offlineText = ccui.helper.seekWidgetByName(propertyPanel, "offlineText");
        var avatarPanel = this._avatarPanel = ccui.helper.seekWidgetByName(propertyPanel, "avatarPanel");
        var balanceActionPanel = this._balanceActionPanel = ccui.helper.seekWidgetByName(propertyPanel, "balanceActionPanel");
        balanceActionPanel.setVisible(false);
        this._cursorImage = ccui.helper.seekWidgetByName(this._propertyPanel, "cursorImage");
        var modeSelectFoldArrow = this._modeSelectFoldArrow = ccui.helper.seekWidgetByName(propertyPanel, "modeSelectFoldArrow");

        //红包面板
        var redPocketPanelRootNode = ccui.helper.seekWidgetByName(topPanel, "redPacketPanel");
        //红包管理类
        this._redPocketPanel = new RedPacketPanel(redPocketPanelRootNode);

        ////右侧面板
        var rightPanel = this._rightPanel = ccui.helper.seekWidgetByName(layer, "rightPanel");
        rightPanel.setBackGroundColorType(ccui.Layout.BG_COLOR_NONE);
        rightPanel.setContentSize(rightPanel.width,  cc.winSize.height - topPanel.height);

        //调整k线面板大小
        trendPanel.setContentSize(trendPanel.width, cc.winSize.height - topPanel.height - this._timeScaleSelectPanel.height);
        trendPanel.setPositionY(this._timeScaleSelectPanel.height);
        trendPanel.originPos = trendPanel.getPosition();
        //trendPanel.setVisible(false);

        //涨跌条
        var trendSlideBar = this._trendSlideBar = new TrendSlideBar();
        layer.addChild(trendSlideBar);
        trendSlideBar.setPos(leftTopOutter(trendPanel), ANCHOR_LEFT_TOP);

        //编辑器垂直方向的适配需要代码调整
        var roomEntryPanel = this._roomEntryPanel = ccui.helper.seekWidgetByName(this._leftPanel, "roomEntryPanel");
        samplePlayerPanel.setContentSize(samplePlayerPanel.width, bottomOutter(roomEntryPanel).y);

        //放置n个头像占位
        var avatarArray = [];
        for(var i = 0; i < 4; i++)
        {
            var avatar = new FetchAvatar(cc.size(samplePlayerPanel.width, samplePlayerPanel.height/4));
            avatar.setIndex(i);
            avatarArray.push(avatar);
        }
        this._fetchAvatarArray = avatarArray;

        //左侧房间人物面板
        var leftAvatarPanel = this._leftAvatarPanel = new LeftAvatarPanel(samplePlayerPanel.getContentSize());
        leftPanel.addChild(leftAvatarPanel);

        var fetchAvatarPanel  = this._fetchAvatarPanel = UICommon.createPanelAlignWidgetsWithPadding(1, cc.UI_ALIGNMENT_VERTICAL_CENTER, avatarArray);
        samplePlayerPanel.addChild(fetchAvatarPanel);
        fetchAvatarPanel.setPos(cc.p(samplePlayerPanel.width * 0.5, samplePlayerPanel.height * 0.5), ANCHOR_CENTER);

        //默认设置
        this._productNameText.setString("");

        //在线人数
        this.refreshOnlineNum(0);

        //刷新右上角头像资金
        this.refreshPropertyPanel();

        //显示在线人数还是房间入口
        isRoomSysEnabled  ? this.showOnlinePanel(false) : this.showOnlinePanel(true);

        //临时遮盖、
        var maskSprite = new cc.Sprite("banner_1_temporary.png");
        topPanel.addChild(maskSprite);
        maskSprite.setPos(cc.p(closeBtn.width, 0), ANCHOR_LEFT_BOTTOM);
    },

    /**
     * 打开交易休市确认界面
     */
    openRestLayer:function(isShow)
    {
        //防止重复打开
        if(this._restLayer){
            if(isShow){
                var tipStr = this._productInfo.getName() + "已停止交易，是否选择其他可交易品种？";
                this._restLayer._tipsLabel.setString(tipStr);
                this._restLayer.setVisible(true);
            }
            else
                this._restLayer.setVisible(false);
            return;
        }
        //休市确认面板
        var label = new cc.LabelTTF("       该品种已停止交易，是否选择其他品种？      ", FONT_ARIAL_BOLD, 30);
        label.setColor(cs.BLACK);
        var restLayer = this._restLayer = new ConfirmPopLayer(label);
        this.addChild(restLayer, 999);

        restLayer._tipsLabel = label;
        restLayer.setMaskTouchEnabled(false);
        restLayer.setOkButtonCallFunc(function(target){
            target.setVisible(false);
            MainController.getInstance().showProductEditLayer();
        }.bind(this));
        restLayer.setCancelButtonCallFunc(function(target){
            target.setVisible(false);
        });
        if(!isShow)
            restLayer.setVisible(false);
    },

    /**
     * 初始化时间刻度选择面板
     */
    initTimeScaleSelectPanel:function(){
        var timeScaleBtnArray = this._timeScaleBtnArray;
        if(timeScaleBtnArray){
            return;
        }
        timeScaleBtnArray = this._timeScaleBtnArray = [];
        for(var i = 0; i < 5; i++) {
            var btn = ccui.helper.seekWidgetByName(this._timeScaleSelectPanel, "timeScaleButton" + i);
            if (!btn)
                break;
            btn.index = i;
            timeScaleBtnArray.push(btn);

            btn.addClickEventListener(function(sender) {
                var oldScaleIndex = this._timeScaleIndex;
                if(oldScaleIndex == sender){
                    return;
                }

                //cc.log("this._chartSelectedPanel.getSelectedValue(sender.index)::", this._chartSelectedPanel.getSelectedValue(sender.index));
                if(!this._chartSelectedPanel.getSelectedValue(sender.index)){
                    return;
                }

                //if(oldScaleIndex != undefined){
                //    var oldSelectedBtn = this._timeScaleBtnArray[oldScaleIndex];
                //    oldSelectedBtn.setEnabled(true);
                //    oldSelectedBtn.setTitleColor(cs.GRAY);
                //}
                //防错(防止高亮两个)
                for(var t =  0; t < this._timeScaleBtnArray.length; t++){
                    var  tempBtn = this._timeScaleBtnArray[t];
                    if(tempBtn && !tempBtn.isEnabled()){
                        tempBtn.setEnabled(true);
                        tempBtn.setTitleColor(cs.GRAY);
                    }
                }
                //设置
                sender.setEnabled(false);
                sender.setTitleColor(cc.WHITE);
                this._timeScaleIndex = sender.index;

                this.changeTimeScale();

            }.bind(this))
        }

        //默认选第一个
        this._timeScaleIndex = 0;
        //设置
        var defaultBtn = timeScaleBtnArray[this._timeScaleIndex];
        defaultBtn.setEnabled(false);
        defaultBtn.setTitleColor(cc.WHITE);
        this._timeScaleIndex = defaultBtn.index;

        //刻度面板关闭按钮
        this._timeScaleSelectPanel.originPos = this._timeScaleSelectPanel.getPosition();
        var scaleCloseBtn = ccui.helper.seekWidgetByName(this._timeScaleSelectPanel, "scaleCloseBtn");
        var scaleOpenBtn = this._scaleOpenBtn = ccui.helper.seekWidgetByName(this._rootNode, "scaleOpenBtn");
        scaleOpenBtn.setLocalZOrder(99);
        scaleOpenBtn.originPos = scaleOpenBtn.getPosition();

        scaleCloseBtn.addClickEventListener(function(){
            if(this._chartSelectedPanel.isShowing()){
                this._chartSelectedPanel.hide();
            }else{
                this._chartSelectedPanel.show();
            }
        }.bind(this));

        scaleOpenBtn.addClickEventListener(function(){
            this.showTimeScalePanel();
        }.bind(this));

        if(isEducationVersion){
            this._timeScaleSelectPanel.setPositionY(-200);
            scaleOpenBtn.setVisible(false);
            var size = cc.size(this._trendPanel.width, cc.winSize.height - this._topPanel.height);
            this._trendPanel.setContentSize(size);
            this._trendChartLayer.reSize(size);
            this._trendPanel.setPositionY(0);
            //this._worldChannel.setPositionY(this._worldChannel.originPos.y - 25);
        }else {
            ////默认
            //if(ClientConfig.getInstance().getOperateType() == ClientConfig.OPRATE_TYPE_NORMAL){
            //    this.hideTimeScalePanel();
            //}
        }
    },

    refreshTimeScaleSelectPanel:function(){
        var chartType = this.getChartType();
        var selectedItems = this._chartSelectedPanel.getSelectedItems();
        var timeScaleBtnArray = this._timeScaleBtnArray;
        //刷新内容
        //var chartType = chartType || GB.CHART_TYPE_SOLID;
        //var selectItemArray = ClientConfig.getInstance().getChartItemTypes(chartType);
        for(var i = 0; i < timeScaleBtnArray.length; i++)
        {
            var btn = timeScaleBtnArray[i];
            var timeScale = selectedItems[i];
            var titleStr = null;
            if(timeScale){
                if(timeScale < 60){
                    titleStr = timeScale + LocalString.getString("COMMON_SECOND");
                }else if(timeScale >= 60 && timeScale < 3600){
                    titleStr = Math.floor(timeScale/60) + LocalString.getString("COMMON_MINUTE");
                }else{
                    titleStr = Math.floor(timeScale/3600) + LocalString.getString("COMMON_HOUR");
                }
            }else{
                titleStr = "--";
            }
            btn.setTitleText(titleStr);
        }
    },

    /**
     * 打开时间刻度选择面板
     */
    showTimeScalePanel:function()
    {
        if(this._timeScaleSelectPanel.getNumberOfRunningActions() > 0
            || this._scaleOpenBtn.getNumberOfRunningActions() > 0){
            return;
        }
        var originPos = this._timeScaleSelectPanel.originPos;
        this._timeScaleSelectPanel.runAction(new cc.Sequence(
            new cc.DelayTime(0.15),
            new cc.Show(),
            new cc.MoveTo(0.15, originPos.x, originPos.y)//.easing(cc.easeBackOut())
        ));

        this._scaleOpenBtn.runAction(new cc.Sequence(
            new cc.Hide(),
            new cc.MoveTo(0.15, this._scaleOpenBtn.originPos.x, this._scaleOpenBtn.originPos.y),
            new cc.CallFunc(function(){
                var size = cc.size(this._trendPanel.width, cc.winSize.height - this._topPanel.height - this._timeScaleSelectPanel.height);
                this._trendPanel.setContentSize(size);
                this._trendChartLayer.reSize(size);
                this._trendPanel.setPositionY(this._trendPanel.originPos.y);
                this._worldChannel.setPositionY(this._worldChannel.originPos.y - 25);
            }.bind(this))
        ));
    },

    //hideTimeScalePanel:function()
    //{
    //    if(this._timeScaleSelectPanel.getNumberOfRunningActions() > 0
    //    || this._scaleOpenBtn.getNumberOfRunningActions() > 0){
    //        return;
    //    }
    //    var originPos = this._timeScaleSelectPanel.originPos;
    //    //var moveAction =
    //
    //    this._scaleOpenBtn.runAction(new cc.Sequence(
    //        new cc.DelayTime(0.15),
    //        new cc.Show(),
    //        new cc.MoveTo(0.15, this._scaleOpenBtn.originPos.x, this._scaleOpenBtn.originPos.y + 72),//.easing(cc.easeBackOut()),
    //        new cc.CallFunc(function(){
    //            var size = cc.size(this._trendPanel.width, cc.winSize.height - this._topPanel.height);
    //            this._trendPanel.setContentSize(size);
    //            this._trendChartLayer.reSize(size);
    //            this._trendPanel.setPositionY(0);
    //            this._worldChannel.setPositionY(this._worldChannel.originPos.y);
    //        }.bind(this))
    //    ));
    //
    //    this._timeScaleSelectPanel.runAction(new cc.Sequence(
    //        new cc.MoveTo(0.15, originPos.x, originPos.y - 85),
    //        new cc.Hide()
    //        ));
    //},

    /**
     * 改变查看k线的时间尺
     */
    changeTimeScale:function(isZoom, operateType)
    {
        var productInfo = Player.getInstance().getCurProductInfo();
        var chartType = this.getChartType();
        var selectedValue = this._chartSelectedPanel.getSelectedValue(this._timeScaleIndex);
        if(selectedValue == undefined){
            cc.log("选择区间线不存在 重置为0");
            this._timeScaleIndex = 0;
            this._chartSelectedPanel.getSelectedValue(this._timeScaleIndex);
        }
        cc.log("selectedValue::", selectedValue);

        //防止重复刷新 否则在关闭图表选择时会(刷)闪一下 +个operateType （考虑从后台回前台也会调这里）
        if(operateType == GB.UPDATE_TYPE_CHART_SELECT_CLOSE){
            if(!isZoom && this._lastChartType == chartType
                            && this._latestSelectedValue == selectedValue
                            && this._lastProductInfo == productInfo){
                            return;
                        }
        }

        var isOpen = productInfo.isOpen();
        if(!isOpen){
            return;
        }

        this._lastChartType = chartType;
        this._latestSelectedValue = selectedValue;
        this._lastProductInfo = productInfo;

        if(chartType == GB.CHART_TYPE_CANDLE){
            cc.log("蜡烛图模式");
            this._curKlineType = selectedValue;
            //cc.log("before zoomScale::",this._zoomScale);
            //cc.log("isStopped::",self._trendChartLayer.isStopped());
            if(isZoom){
                this.zoomKChart();
            }
            else
            {
                this.showKChart();
            }
        }else{
            if(isZoom){
                this.zoomLineChart();
            }else{
                this.showLineChart();
            }
        }
    },

    zoomKChart:function()
    {
        var self = this;
        var baseCandleNum = 30;
        var candleDuration = this._curKlineType;
        if(!self._trendChartLayer.isStopped()){
            if(this._zoomScale > GB.MAX_CANDLE_DISPLAY/baseCandleNum)
                this._zoomScale = GB.MAX_CANDLE_DISPLAY/baseCandleNum;
            if(this._zoomScale < GB.MIN_CANDLE_DISPLAY/baseCandleNum)
                this._zoomScale = GB.MIN_CANDLE_DISPLAY/baseCandleNum;
            //cc.log("after zoomScale::",this._zoomScale);
            cc.log("缩放");
            //蜡烛数
            var scaleUnits = candleDuration * baseCandleNum * this._zoomScale;
            if(this._trendChartLayer.getTimeScaleUnits() == scaleUnits){
                //cc.log("缩放相同 忽略");
                return;
            }
            this._trendChartLayer.setTimeScaleUnits(scaleUnits);
            this._trendChartLayer.start();
        }
    },

    showKChart:function()
    {
        cc.log("蜡烛图模式");
        this._trendChartLayer.stop(true);
        var self = this;
        var candleDuration = this._curKlineType = this._chartSelectedPanel.getSelectedValue(this._timeScaleIndex);
        var curSecs = cs.getCurSecs();
        var productInfo = Player.getInstance().getCurProductInfo();
        var baseCandleNum = 30;
        var len = candleDuration * GB.MAX_CANDLE_DISPLAY; //查询n根蜡烛
        var endTime = curSecs;
        var startTime = endTime - len;
        var klineData = Player.getInstance().getKlineData(productInfo.getId(), candleDuration);
        var paddingScopes = klineData.getPaddingScopes(startTime, endTime);
        cc.log("paddingScopes::", JSON.stringify(paddingScopes));
        this._zoomScale = baseCandleNum/baseCandleNum;
        this._trendChartLayer.setTimeScaleUnits(candleDuration * baseCandleNum);
        if(paddingScopes.length > 0){
            klineData.setPaddingScopeArray(paddingScopes, function(){
                klineData.paddingLatest();
                self._trendChartLayer.start();
            });
        }else{
            self._trendChartLayer.start();
        }
    },

    zoomLineChart:function()
    {
        ////stride:1,2,4,8,16..，128，256 总共9档，3600*24/maxSampleSum == 192 即192的步长可以覆盖一天
        //var self = this;
        //var baseCandleNum = 30;
        //var candleDuration = this._curKlineType;
        //if(!self._trendChartLayer.isStopped()){
        //    if(this._zoomScale > GB.MAX_CANDLE_DISPLAY/baseCandleNum)
        //        this._zoomScale = GB.MAX_CANDLE_DISPLAY/baseCandleNum;
        //    if(this._zoomScale < GB.MIN_CANDLE_DISPLAY/baseCandleNum)
        //        this._zoomScale = GB.MIN_CANDLE_DISPLAY/baseCandleNum;
        //    //cc.log("after zoomScale::",this._zoomScale);
        //    cc.log("缩放");
        //    //蜡烛数
        //    var scaleUnits = candleDuration * baseCandleNum * this._zoomScale;
        //    if(this._trendChartLayer.getTimeScaleUnits() == scaleUnits){
        //        //cc.log("缩放相同 忽略");
        //        return;
        //    }
        //    this._trendChartLayer.setTimeScaleUnits(scaleUnits);
        //    this._trendChartLayer.start();
        //}
    },

    //旧的 如果按步长采集不能正常用 可以开启这个
    //showLineChart:function()
    //{
    //    cc.log("分时图模式");
    //    this._trendChartLayer.stop(true);
    //    var self = this;
    //    var curSecs = cs.getCurSecs();
    //    var len = this._chartSelectedPanel.getSelectedValue(this._timeScaleIndex);
    //    var endTime = curSecs;
    //    var startTime = endTime - len - 1;
    //    var lineData = Player.getInstance().getCurLineData();
    //    var paddingScopeArray = lineData.getPaddingScopes(startTime, endTime);
    //    this._trendChartLayer.setTimeScaleUnits(len);
    //    if(paddingScopeArray.length > 0){
    //        lineData.setPaddingScopeArray(paddingScopeArray, function(){
    //            //开始绘制
    //            self._trendChartLayer.start();
    //        });
    //    }else{
    //        //开始绘制
    //        self._trendChartLayer.start();
    //    }
    //},

    showLineChart:function()
    {
        cc.log("分时图模式");
        this._trendChartLayer.stop(true);
        var self = this;
        var lineData = Player.getInstance().getCurLineData();
        var curSecs = cs.getCurSecs();
        var len = this._chartSelectedPanel.getSelectedValue(this._timeScaleIndex);
        var latestTime = lineData.getLatestData().getXValue();//行情末端时间

        /**这里不能用直接用curSecs,行情没有那么快，否则会导致切换时间尺度时，频繁请求loading，但是curSecs那一秒其实还没有数据**/
        var endTime = (curSecs - latestTime) > 2 ? curSecs : latestTime;
        var startTime = endTime - len * 2 - 1;
        this._trendChartLayer.setTimeScaleUnits(len);
        var stride = this._trendChartLayer.getStride();
        var dots = this._trendChartLayer.getImportantDots(Player.getInstance().getCurProductInfo(), startTime, stride);

        var successCallBack = function(){
            //开始绘制
            self._trendChartLayer.start();
        };

        lineData.paddingWithStride(startTime, endTime, stride, dots, successCallBack, true);
    },

    getCurKlineType:function()
    {
        return this._curKlineType;
    },

    /**
     * 控制面板
     * @param size
     */
    initControlPanel:function()
    {
        var productInfo = Player.getInstance().getCurProductInfo();
        var operateType = productInfo == undefined ? undefined : productInfo.getOperateType();
        var controlPanel = null;
        var size = this._rightPanel.getContentSize();

        if(operateType == ProductInfo.OPTION_OPERATE_TOUCH_OFFSET_CHOOSE)
        {
            if(this._touchOffsetChoosePanel == undefined){
                this._touchOffsetChoosePanel = new TouchOffsetChoosePanel(size);
            }
            controlPanel = this._touchOffsetChoosePanel;
        }else if(operateType == ProductInfo.OPTION_OPERATE_HIGH_LOWL_FEE){
            if(this._highLowControlFeePanel == undefined){
                this._highLowControlFeePanel = new HighLowListFeePanel(size);
            }
            controlPanel = this._highLowControlFeePanel;
        }else if(operateType == ProductInfo.OPTION_OPERATE_TOUCH_OFFSET_FEE){
            if(this._touchOffsetChooseFeePanel == undefined){
                this._touchOffsetChooseFeePanel = new TouchOffsetChooseFeePanel(size);
            }
            controlPanel = this._touchOffsetChooseFeePanel;
        }else {
            if(this._highLowControlPanel == undefined){
                this._highLowControlPanel = new HighLowListControlPanel(size);
            }
            controlPanel = this._highLowControlPanel;
        }
        //else{
        //    controlPanel = new HighLowListControlPanel(size);
        //}

        if(!controlPanel.getParent()){
            this._rightPanel.addChild(controlPanel);
        }

        var oldControlPanel = this._controlPanel;
        if(productInfo && controlPanel.reset){
            controlPanel.reset(oldControlPanel);
        }

        if(oldControlPanel && controlPanel != oldControlPanel){
            oldControlPanel.setEnabled(false);
            oldControlPanel.setVisible(false);
        }

        this._controlPanel = controlPanel;
        controlPanel.setEnabled(true);
        controlPanel.setVisible(true);

        //
        this.initTradeListPanel();
    },

    /**
     * 交易列表
     */
    initTradeListPanel:function()
    {
        if(this._tradeListPanel && cc.sys.isObjectValid(this._tradeListPanel)){
            return;
        }
        //这里不好算高度..(height - (充值按钮+开始交易按钮+适当间隔))..暂时用固定值
        var size = cc.size(this._rightPanel.width, this._rightPanel.height - (92 + 78 + 6));
        var tradeListPanel = this._tradeListPanel = new TradeListPanel(size);
        tradeListPanel.setAnchorPoint(0.5, 1);
        this._rightPanel.addChild(tradeListPanel);
        tradeListPanel.setVisible(false);
    },

    /**
     * 触碰模式需要
     */
    getCurTouchOffset:function()
    {
        var touchOffset = undefined;
        if(this._controlPanel.getCurTouchOffset){
            touchOffset =  this._controlPanel.getCurTouchOffset();
        }else{
            touchOffset =  this._productInfo.getTouchOffsetList()[0];
        }
        if(touchOffset == undefined){
            cc.log("getCurTouchOffset is null");
        }
        return parseFloat(touchOffset);
    },

    /**
     * 触碰模式需要 触碰的显示值
     */
    getCurTouchOffsetShow:function()
    {
        var index = (this._controlPanel.getCurTouchOffsetIndex && this._controlPanel.getCurTouchOffsetIndex()) || 0;
        var touchOffsetShowList = Player.getInstance().getCurProductInfo().getTouchOffsetShowList();
        return touchOffsetShowList[index];
    },

    /**
     * 世界频道
     */
    initWorldChannel:function()
    {
       var worldChannel = this._worldChannel = new WorldChannel();
        this._trendPanel.addChild(worldChannel, 3);
        //worldChannel.setPos(leftBottomOutter(this._trendPanel), ANCHOR_LEFT_BOTTOM);
        worldChannel.setPositionYAdd(40);
        worldChannel.setPositionXAdd(3);
        worldChannel.originPos = worldChannel.getPosition();
    },

    /**
     * 用户登录/账户状态改变
     */
    refreshPropertyPanel:function()
    {
        if(ClientConfig.getInstance().isPracticeEnabled()){
            this._modeSelectFoldArrow.setVisible(true);
        }
        //
        var avatarSelf = null;
        if(Player.getInstance().isLimited())
        {
            avatarSelf = new CircleAvatar();

            this._balanceTitle.setVisible(false);
            this._balanceText.setVisible(false);
            this._offlineText.setVisible(true);
            this._modeSelectFoldArrow.setVisible(false);
        }
        else
        {
            this._balanceTitle.setVisible(true);
            this._balanceText.setVisible(true);
            this._offlineText.setVisible(false);

            //显示资金 还是模拟币
            if (this._isSimulateTrade) {
                this._balanceTitle.setString(LocalString.getString("COMMON_TEST_COIN"));
            }
            else {
                this._balanceTitle.setString(LocalString.getString("COMMON_FUND"));
            }
            if(isEducationVersion){
                this._balanceTitle.setString(LocalString.getString("COMMON_TEST_COIN"));
            }
            //刷新钱
            this.refreshBalance();

            //自己的头像，等级， 周胜率
            avatarSelf = new CircleAvatar(Player.getInstance());
        }

        this._avatarPanel.removeAllChildren();
        //自己的头像，等级， 周胜率
        //var avatarSelf = new CircleAvatar(playerInfo);
        this._avatarPanel.addChild(avatarSelf);
        avatarSelf.setPos(cc.pCenter(this._avatarPanel.getContentSize()), ANCHOR_CENTER);
        if(Player.getInstance().isGuest()) {
            avatarSelf.setDetailEnabled(false);
        }
    },

    refreshOnlineNum:function(num)
    {
        this._onlineNumText.setString(num == 0 ? "" : num);
        this._onlineUnitText.setString(num == 0 ? "" : LocalString.getString("COMMON_PEOPLE"));
        //位数有变化时
        if(num  || this._onlineNum == 0 || num / this._onlineNum >= 10 || num / this._onlineNum <= 0.1){
            //重新排版
            this._onlineNumText.getParent().arrangeChildrenCenter(2, [this._onlineNumText, this._onlineUnitText]);
        }
        this._onlineNum = num;
    },

    /**
     * 金额设置显示的统一入口
     * @param balance
     */
    setBalance:function(balance)
    {
        cc.log("setBalance::", balance);
        var addAmount = balance - this._balance;
        if(addAmount > 0){
            //生成变化序列
            this._balanceChanges = [];
            var divNum = 6;
            for(var i = 0; i < divNum; i++) {
                var value = balance - addAmount/ divNum * i;
                if(value >= 10 * 10000){
                    value = (value/10000).toFixed(2)+"w";
                }else{
                    value = value.toFixed(2);
                }
                this._balanceChanges.push(value);
            }
            //动画
            this.doBalancePanelAction();
        }else{
            this._balanceText.setString(balance + LocalString.getString("YUAN"));
            if(isEducationVersion){
                this._balanceText.setString(balance + LocalString.getString("COMMON_TEST_COIN"));
            }
        }
        this._balance = balance;
    },

    /**
     * 资金增加时 底部的动画
     */
    doBalancePanelAction:function()
    {
        var balanceActionPanel = this._balanceActionPanel;
        var cursorImage = this._cursorImage;
        balanceActionPanel.setVisible(false);
        cursorImage.setPositionX(50);
        cursorImage.originPos = cursorImage.getPosition();
        balanceActionPanel.runAction(new cc.Sequence(
            new cc.Show(),
            new cc.DelayTime(0.8)
            ,new cc.Hide()
        ));

        cursorImage.runAction(new cc.Sequence(
            new cc.Spawn(
                new cc.MoveTo(0.8, cursorImage.originPos.x + 300, cursorImage.originPos.y)
                ,new cc.FadeTo(0.5, 255)
            )
        ));
    },

    /**
     * 主动刷新金额
     */
    refreshBalance:function()
    {
        if(this._isSimulateTrade)
            this.setBalance(Player.getInstance().getTestCoin().toFixed(2));
        else
            this.setBalance(Player.getInstance().getBalance().toFixed(2));
    },

    /**
     * 产品相关(切换时亦可用)
     */
    refreshByProduct:function() {
        var productInfo = Player.getInstance().getCurProductInfo();

        //投注额设置(确保不大于产品限制)
        this._betAmount = Math.min(productInfo.getMaxBetAmount(), this._betAmount);

        //产品名
        this._productNameText.setString(productInfo.getName());

        //
        this.initControlPanel();

        this.refreshTimeScaleSelectPanel();

        //开启交易
        this._trendChartLayer.reset();

        //休市的话就直接start
        if(!productInfo.isOpen()) {
            this._trendChartLayer.start();
        }
        else
        {
            this.changeTimeScale();
        }

        //尝试抓满用户
        this.requestFullFetchPlayer();
    },

    /**
     * 请求抓满n个用户
     */
    requestFullFetchPlayer:function()
    {
        var roomId = Player.getInstance().getRoomId();
        if(roomId){
            cc.log("已进入房间，不需要抓取");
            return;
        }
        var productInfo = Player.getInstance().getCurProductInfo();
        var maxFetchNum = 4;

        //触碰模式先屏蔽自动抓取模块
        //this.initFetchPanel(false);
        //
        //如果已经有了就不抓历史用户了
        if(productInfo.getFetchLength() > 0) {
            this.initFetchPanel(true);
            return;
        }
        else{
            //先主动刷一遍 否则要等到http返回才能刷
            this.initFetchPanel(false);
            productInfo.requestFullPlayers(maxFetchNum);
        }
    },

    /**
     * 创建k线图层
     */
    initTrendPanel:function()
    {
        var trendPanel = this._trendPanel;
        var trendChartLayer = null;

        //趋势图面板(尽量放到最后)
        if(!this._trendChartLayer )
        {
            trendChartLayer = this._trendChartLayer = new TrendChartFlowModel(this);
            trendPanel.addChild(trendChartLayer);
            trendChartLayer.setPos(centerInner(trendPanel), ANCHOR_CENTER);
        }
    },

    /**
     * 初始化抓取头像面板(跟随产品)
     * @param {Boolean} [isEnableAutoFetch] 是否开启自动抓取
     */
    initFetchPanel:function(isEnableAutoFetch)
    {
        for(var i = 0; i < this._fetchAvatarArray.length; i++)
        {
            var avatarPanel = this._fetchAvatarArray[i];
            avatarPanel.switchProduct(this._productInfo);
            avatarPanel.setAutoFetchEnabled(isEnableAutoFetch);
        }
    },

    /**
     * 初始化所有按钮的点击事件(务必放在InitUI之后执行)
     */
    initAllButtonClick:function()
    {
        //关闭界面
        this._closeBtn.addClickEventListener(function (sender) {
            MainController.playButtonSoundEffect(sender);
            //MainController.popLayerFromRunningScene(this);
            this._menuPanel.doOpenAction();
        }.bind(this));
        this._closeBtn.setClickEffectEnabled(true);

        //期权选择
        this._productEditBtn.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            MainController.getInstance().removeScrollBulletin();
            MainController.getInstance().showProductEditLayer();
        });
    },

    /**
     * 显示交易控制面板
     */
    showTradeControlPanel:function()
    {
        this._controlPanel.showTradeControlPanel();
    },

    getBeSelectedBetInfo:function()
    {
        return this._beSelectedBetInfo;
    },

    getTradeListPanel:function()
    {
        return this._tradeListPanel;
    },

    getControlPanel:function()
    {
        return this._controlPanel;
    },

    setBeSelectedBetInfo:function(beSelectedBetInfo)
    {
        if(beSelectedBetInfo){
            var betProductInfo = Player.getInstance().getProductById(beSelectedBetInfo.getProductId());
            //cc.log("set beSelectedBetInfo::", beSelectedBetInfo.getOrderId());
            cc.log("订单["+betProductInfo.getName()+"]被选中下单时间："+TimeHelper.formatSecs(beSelectedBetInfo.getBetTime()));
        }
        this._beSelectedBetInfo = beSelectedBetInfo;
        var curProductInfo = Player.getInstance().getCurProductInfo();
        if(beSelectedBetInfo && beSelectedBetInfo.isSettled()){
            if(!this._trendChartLayer.isStopped()){
                this._trendChartLayer.stop();
            }
            this._trendChartLayer.setVisible(false);
            this._timeScaleSelectPanel.setVisible(false);
            this._scaleOpenBtn.setVisible(false);
            this._trendPanel.setVisible(false);
            //this._worldChannel.setVisible(false);

            this._historyPanel.refreshByBetInfo(beSelectedBetInfo);
            this._historyPanel.setVisible(true);
        }else{
            this._historyPanel.setVisible(false);
            this._trendChartLayer.setVisible(true);
            this._timeScaleSelectPanel.setVisible(true);
            this._scaleOpenBtn.setVisible(true);
            //this._worldChannel.setVisible(true);
            this._trendPanel.setVisible(true);

            //不同产品要切换(点击历史时)
            if(beSelectedBetInfo && !beSelectedBetInfo.isSettled()
                && beSelectedBetInfo.getProductId() != curProductInfo.getId()){
                this.tradeStart(Player.getInstance().getProductById(beSelectedBetInfo.getProductId()));
            }
            else
            {
                if(this._trendChartLayer.isStopped()){
                    this._trendChartLayer.start();
                }
            }
        }
        //通知(例如：触碰线绑定)
        cc.eventManager.dispatchCustomEvent(NOTIFY_BET_BE_SELECTED);
    },

    createModeCell:function(titleStr)
    {
        var layer = ccs.load(res.TradeModeCell_json).node;
        //
        var checkBox = ccui.helper.seekWidgetByName(layer, "checkBox");
        var titleText = ccui.helper.seekWidgetByName(layer, "titleText");
        var currencyText = ccui.helper.seekWidgetByName(layer, "currencyText");

        checkBox.setSelected(false);
        titleText.setString(titleStr);

        layer._checkBox = checkBox;
        layer._currencyText = currencyText;
        layer._titleText = titleText;

        return layer;
    },

    initPropertyPanelTouch:function()
    {
        this._modeSelectFoldArrow.setVisible(true);
        //配置不允许切换模拟交易
        if(!ClientConfig.getInstance().isPracticeEnabled())
        {
            this._modeSelectFoldArrow.setVisible(false);
        }
        this._propertyPanel.addClickEventListener(function(sender) {
            MainController.playButtonSoundEffect(sender);
            if(Player.getInstance().isGuest() || !Player.getInstance().getOnline()) {
                MainController.getInstance().showLoginLayer();
                return;
            }
            //配置不允许切换模拟交易
            if(!ClientConfig.getInstance().isPracticeEnabled())
                return;
            if(this._modeSelectPanel.isOpen()){
                return;
            }else{
                this._modeSelectPanel.open();
                var testCoin = Player.getInstance().getTestCoin();
                var balance = Player.getInstance().getBalance();
                //
                this._realModeCell._currencyText.setString(MONEY_SIGN + balance.toFixedCs(2));
                this._practicalModeCell._currencyText.setString(MONEY_SIGN + testCoin.toFixedCs(2));
            }
        }.bind(this));
        var radioListPanel = this._modeSelectPanel = new RadioListPanel();

        var realModeCell  = this._realModeCell = this.createModeCell("正式账户");
        var practicalModeCell = this._practicalModeCell = this.createModeCell("模拟账户");

        //真实账户
        radioListPanel.addSelectCell(realModeCell, function(sender, isSelected){
            sender._checkBox.setSelected(isSelected);
            if(isSelected && GB.isSimulateTrade) {
                radioListPanel.close();
                this.switchToRealTrade();
            }
        }.bind(this));

        //模拟账户
        radioListPanel.addSelectCell(practicalModeCell, function(sender, isSelected){
            sender._checkBox.setSelected(isSelected);
            if(isSelected && !GB.isSimulateTrade) {
                radioListPanel.close();
                this.switchToPractical();
            }
        }.bind(this));

        //
        this.addChild(radioListPanel);
        //设置默认值
        if(GB.isSimulateTrade){
            radioListPanel.setSelectedIndex(1);
        }else{
            radioListPanel.setSelectedIndex(0);
        }

        //设置下拉列表的位置
        radioListPanel.setListPos(this._propertyPanel.getPosAtAncestor(this, ANCHOR_LEFT_BOTTOM), ANCHOR_LEFT_TOP);

        //起始关闭
        radioListPanel.close();
    },

    //动画界面
    initAniPanel:function()
    {
        var layer = this._animationPanel = new cc.Layer();
        this.addChild(layer, 8);
    },

    /**
     * 添加自动消失的动画(只做addChild 定时检查移除) 避免由于引擎内部原因，动画会异常中断问题
     * @param animationNode
     */
    addAnimationNode:function(animationNode)
    {
        this._animationPanel.addChild(animationNode);
        return this._animationPanel;
    },

    /**
     * 切换成模拟交易
     */
    switchToPractical:function()
    {
        //切换成模拟账户
        this._balance = 0;
        this._isSimulateTrade = GB.isSimulateTrade = true;
        cs.setItem("isSimulateTrade", "true");
        //刷新资金面板
        this.refreshPropertyPanel();
        //(强制关闭我的订单历史)
        this.showTradeControlPanel();
        //重置k线区自己的订单面板
        this._trendChartLayer._selfBetPanel.reset();
        this._trendChartLayer._touchSelfBetPanel.reset();

        //通知持仓刷新
        cc.eventManager.dispatchCustomEvent(NOTIFY_POSITION_CHANGES);
    },

    /**
     * 切换成正式交易
     */
    switchToRealTrade:function()
    {
        //切换成真实账户
        this._balance = 0;
        this._isSimulateTrade = GB.isSimulateTrade = false;
        cs.setItem("isSimulateTrade", "false");
        //刷新资金面板
        this.refreshPropertyPanel();
        //(强制关闭我的订单历史)
        this.showTradeControlPanel();
        //重置k线区自己的订单面板
        this._trendChartLayer._selfBetPanel.reset();
        this._trendChartLayer._touchSelfBetPanel.reset();

        //通知持仓刷新
        cc.eventManager.dispatchCustomEvent(NOTIFY_POSITION_CHANGES);
    },

    getTouchSelfBetPanel:function()
    {
      return this._trendChartLayer._touchSelfBetPanel;
    },

    /**
     * 设置下单是否可用
     */
    setBetEnabled:function(isEnable)
    {
        this._controlPanel.setBetEnabled(isEnable);
    },

    initChartSelectedPanel:function()
    {
        var chartSelectedPanel = this._chartSelectedPanel = new ChartSelectedPanel(this._trendPanel.getContentSize());
        this.addChild(chartSelectedPanel,9);
        chartSelectedPanel.setPos(leftBottomOutter(this._trendPanel), ANCHOR_LEFT_BOTTOM);
        chartSelectedPanel.originPos = chartSelectedPanel.getPosition();
        chartSelectedPanel.hide();

        this.refreshSelectedChartImage();
    },

    refreshSelectedChartImage:function()
    {
        var selectedChartType = this._chartSelectedPanel.getSelectedChartType();
        var srcName = null;
        switch (selectedChartType){
            case GB.CHART_TYPE_SOLID:
                srcName = "icon_k_line_s.png";
                break;
            default:
                srcName = "icon_k_line_candle_s.png";
        }
        this._selectedChartImage.loadTexture(srcName, ccui.Widget.PLIST_TEXTURE);
    },

    getChartType:function()
    {
        return this._chartSelectedPanel.getSelectedChartType();
    },

    initMultiTouchPanel:function()
    {
        var multiTouchPanel = new cc.Node();
        multiTouchPanel.setContentSize(this._trendPanel.getContentSize());
        this._trendPanel.addChild(multiTouchPanel);
        var localBeganPoint = undefined;
        var localMovePoint = undefined;
        var beginDistance = 0;
        var moveDistance = 0;
        var threshold = 30;
        var self = this;
        var multiTouchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ALL_AT_ONCE,
            onTouchesBegan:function(touches, event){
                //--记录当前触摸点的数量
                var size = touches.length;
                cc.log("multi touch size::", size);
                //
                if (size > 1) {
                    var p1 = touches[0].getLocation();
                    var p2 = touches[1].getLocation();
                    beginDistance = cc.pDistance(p1, p2);
                    localBeganPoint = null;
                }
                else{
                    //--andriod平台多点触摸，触摸点begin是依次传出
                    if(!localBeganPoint){
                        localBeganPoint = touches[0].getLocation();
                        cc.log("localBeganPoint", JSON.stringify(localBeganPoint));
                    }
                    else{
                        beginDistance = cc.pDistance(localBeganPoint, touches[0].getLocation());
                        cc.log("beginDistance", JSON.stringify(beginDistance));
                        localBeganPoint = null;
                    }
                }

            },
            onTouchesMoved: function (touches, event) {
                var size = touches.length;
                if (size > 1) {
                    var p1 = touches[0].getLocation();
                    var p2 = touches[1].getLocation();
                    moveDistance = cc.pDistance(p1, p2);
                    localMovePoint = null;
                    //cc.log("moveDistance", JSON.stringify(moveDistance));
                    var diff = beginDistance - moveDistance;
                    if(diff > threshold){
                        cc.log(threshold+" 执行缩小");
                        beginDistance = moveDistance;
                        self.setZoomScale(-1);
                    }else if(diff < -threshold){
                        cc.log(-threshold+" 执行放大");
                        beginDistance = moveDistance;
                        self.setZoomScale(1);
                    }
                }
            }
        });
        //多点触控 缩放
        cc.eventManager.addListener(multiTouchListener, multiTouchPanel);
    },

    //缩放
    setZoomScale:function(scale)
    {
        if(scale > 0){
          this._zoomScale -= 0.15;
        }else{
          this._zoomScale += 0.15;
        }
        this.changeTimeScale(this._zoomScale);
    },

    //历史行情面板
    initHistoryPanel:function()
    {
        var size = cc.size(this._trendPanel.width, cc.winSize.height - this._topPanel.height);
        var historyPanel = this._historyPanel = new HistoryBetPanel(size);
        this.addChild(historyPanel, 3);
        historyPanel.setPositionX(this._trendPanel.getPositionX());
        historyPanel.setVisible(false);
    },

    //初始化左侧加入房间panel
    initRoomPanel:function() {
        var  roomEntryPanel = this._roomEntryPanel;
        if(isEducationVersion) {
            roomEntryPanel.setVisible(false);
        }

        var roomNameText = ccui.helper.seekWidgetByName(roomEntryPanel, "roomNameText");
        var joinRoomPanel = ccui.helper.seekWidgetByName(roomEntryPanel, "joinRoomPanel");
        var joinRoomText = ccui.helper.seekWidgetByName(roomEntryPanel, "joinRoomText");
        var memberPanel = ccui.helper.seekWidgetByName(roomEntryPanel, "memberPanel");

        //inti visible
        memberPanel.setVisible(false);
        roomNameText.setVisible(false);
        joinRoomPanel.setVisible(false);

        var roomMemberText = cc.LabelTTF("000/000",FONT_ARIAL_BOLD,16);
        roomMemberText.setColor(cc.color(252,187,12));
        memberPanel.addChild(roomMemberText);
        roomMemberText.setPos(cc.p(memberPanel.width/2,memberPanel.height * 0.35),ANCHOR_CENTER);

        roomEntryPanel.refresh = function()
        {
            var roomId = Player.getInstance().getRoomId();
            var roomInfo = Player.getInstance().getRoomInfo();
            cc.log("refresh  roomId::", roomId);
            if(roomId){
                roomMemberText.setString(roomInfo.getNum() + " / " + roomInfo.getMaxNum());
                roomNameText.setString(roomInfo.getRoomName());
                memberPanel.setVisible(true);
                roomNameText.setVisible(true);
                joinRoomPanel.setVisible(false);
            }else{
                memberPanel.setVisible(false);
                roomMemberText.setString("");
                roomNameText.setVisible(false);
                joinRoomPanel.setVisible(true);
            }
        };

        //房间选择
        roomEntryPanel.setTouchEnabled(true);
        roomEntryPanel.addClickEventListener(function(sender){
            if(Player.getInstance().isLimited()){
                MainController.getInstance().showLoginLayer();
            }else{
                MainController.getInstance().showRoomChooseLayer();
            }
        }.bind(this));

        //房间消息提示 (邀请，申请拒绝，申请通过..etc.)
        var applyCell = new RoomApplicantHintGather();
        this.addChild(applyCell);
        applyCell.setPos(cc.p(this._leftPanel.width ,this.height - this._topPanel.height),ANCHOR_LEFT_TOP);
    },

    /**
     * 开发服添加测试按钮
     */
    initTestButton:function()
    {
        //预防误提交
        if(cc.sys.isMobile){
            return;
        }

        //TODO 要测试时注释return就行
        return;

        var button1 = new ccui.Button("btn_fall_n.png","","", ccui.Widget.PLIST_TEXTURE);
        button1.setTitleColor(cc.WHITE);
        button1.setTitleFontSize(28);
        button1.setTitleText("测试按钮1");
        button1.setScale9Enabled(true);
        button1.setContentSize(128, 70);

        var button2 = new ccui.Button("btn_rise_n.png","","", ccui.Widget.PLIST_TEXTURE);
        button2.setTitleColor(cc.WHITE);
        button2.setTitleFontSize(28);
        button2.setTitleText("测试按钮2");
        button2.setScale9Enabled(true);
        button2.setContentSize(128, 70);

        var panel = UICommon.createPanelAlignWidgetsWithPadding(20, cc.UI_ALIGNMENT_HORIZONTAL_CENTER, button1, button2);
        this.addChild(panel);
        panel.setPos(cc.p(this._leftPanel.width + 50, cc.winSize.height), ANCHOR_LEFT_TOP);

        button1.addClickEventListener(function(){
            //TODO
            var data = {"user":{"base":{"nickName":"客户9915","id":844,"headPhoto":""}},"roomId":21,"roomName":"sadasda"};
            cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_JOIN_APPLY_RESULT, data);
        }.bind(this));
        button2.addClickEventListener(function(){
            /*
            var data = {"monthTradeAmount":0,"owner":{},"intro":"","canShare":true,"name":"岛田城","id":68,"memberNum":2,"maxNum":30};
            var model = new RoomChooseCellModel(data);
            var view = new RoomChooseCellView(model,GB.ROOM_TYPE_OTHER);
            this.addChild(view);
            view.setPos(centerInner(this),ANCHOR_CENTER);
            */
            var isReChargeNeedName = ClientConfig.getInstance().isReChargeNeedName();
            //var isFirstCharge = true;
            if(isReChargeNeedName){
                var layer = new UserAuthentication();
                MainController.pushLayerToRunningScene(layer);
            }


            //打开身份证上传界面
            //var layer = new IDCardUpLoadLayer();
            //MainController.pushLayerToRunningScene(layer);

            //TODO
        }.bind(this));
    },

    //TODO 测试动画中断用
    testAction:function(){
        var parent = this._trendChartLayer._selfBetPanel;
        var layer = new cc.LayerColor();
        //layer.setTouchEventEnabled(false);
        layer.setOpacity(120);
        layer.setContentSize(parent.getContentSize());
        parent.addChild(layer, 666);

        layer._isAllowAction = true;
        //动画
        setInterval(function(){
            if(!layer._isAllowAction){
                return;
            }
            for(var i = 0; i < 10; i++){
                var resultSprite = new cc.Sprite("#animation_equal.png");
                var randomPos = cc.p(ALCommon.getRandomFloat(100, parent.width - 100), ALCommon.getRandomFloat(50, parent.height - 50));
                layer.addChild(resultSprite);
                resultSprite.setPosition(randomPos);
                resultSprite.originPos = randomPos;
                resultSprite.runAction(new cc.Sequence(
                    new cc.Spawn(
                        new cc.ScaleTo(0.25, 1.1, 1.1),
                        new cc.MoveTo(0.35, resultSprite.originPos.x+30, resultSprite.originPos.y+30)
                    ),
                    new cc.DelayTime(0.8),
                    //new cc.FadeOut(0.2),
                    new cc.RemoveSelf()
                ))
            }
        });

        var stopButton = new ccui.Layout();
        stopButton.setContentSize(150, 90);
        stopButton.setTouchEnabled(true);
        stopButton.setBackGroundColorEx(cs.GREEN);
        layer.addChild(stopButton);
        stopButton.setPos(rightBottomInner(layer), ANCHOR_RIGHT_BOTTOM);
        stopButton.addClickEventListener(function(){
            layer._isAllowAction = !layer._isAllowAction;
            MainController.showAutoDisappearAlertByText("isAllowAction::"+layer._isAllowAction);
        });
    }
});

