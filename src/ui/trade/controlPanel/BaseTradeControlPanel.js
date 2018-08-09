/**
 * Created by Administrator on 2017/2/23.
 */
var BaseTradeControlPanel = cc.Node.extend({

    ctor: function () {
        this._super();
        //
        this._inputCountInterval = 0;
        this._betAmount = 0;
    },

    cleanup:function()
    {
        this._super();

        this.removeAllCustomListeners();
    },

    addListener:function()
    {
        //持仓更新
        this._positionChangesListener = cc.eventManager.addCustomListener(NOTIFY_POSITION_CHANGES, function(event)
        {
            this.refreshHoldOrders();
        }.bind(this));

        //下单成功
        this._newBetInfoListner =  cc.eventManager.addCustomListener(NOTIFY_NEW_ORDER, function(event)
        {
            //先禁用
            this._betRiseBtn.setGray(true);
            this._betFallBtn.setGray(true);
            this._productInfo._lastBetMilliSecs = cs.getCurTime();
        }.bind(this));

        //刷新登录状态
        this._loginStateListener = cc.eventManager.addCustomListener(NOTIFY_REFRESH_LOGIN_STATE, function(event)
        {
            this.refreshLoginStatus();
        }.bind(this));

        this._showTradeListListener = cc.eventManager.addCustomListener(NOTIFY_SHOW_TRADE_LIST, function()
        {
            var controlPanel = TradingHallLayer.instance.getControlPanel();
            var isDoAni = true;
            if(controlPanel != this){
                isDoAni = false;
            }
            this.showTradeBetListPanel(isDoAni);
        }.bind(this));

        this._showTradeControlListener = cc.eventManager.addCustomListener(NOTIFY_SHOW_TRADE_CONTROL, function()
        {
            var controlPanel = TradingHallLayer.instance.getControlPanel();
            var isDoAni = true;
            if(controlPanel != this){
                isDoAni = false;
            }
            this.showTradeControlPanel(isDoAni);
        }.bind(this));

        //期权下架 强制关闭订单列表
        this._productRemovedListener = cc.eventManager.addCustomListener(NOTIFY_PRODUCT_REMOVED, function()
        {
            this.showTradeControlPanel(true);
        }.bind(this))
    },

    getBetAmount:function()
    {
        return this._betAmount;
    },

    update:function(dt)
    {
        var ignoreTime = 0.25;  //缓冲时间
        this._inputCountInterval += dt;
        if(this._inputCountInterval > 0.04)
        {
            if(this._addBtn._prepareToAddTime)
            {
                var curTime = cs.getCurTime();
                var isDelayEnough = ((curTime - this._addBtn._prepareToAddTime) / 1000 - ignoreTime) > 0;
                if(isDelayEnough)
                    this.calculateInput(this._productInfo.getMinBetAmount(), GB.INPUT_TYPE_ADD_OR_SUB)
            }

            if(this._subBtn._prepareToSubTime)
            {
                var curTime = cs.getCurTime();
                var isDelayEnough = ((curTime - this._subBtn._prepareToSubTime) / 1000 - ignoreTime) > 0;
                if(isDelayEnough)
                    this.calculateInput(-this._productInfo.getMinBetAmount(), GB.INPUT_TYPE_ADD_OR_SUB)
            }
            this._inputCountInterval = 0;
        }

        //下单冷却计算
        if(this._productInfo && this._productInfo._lastBetMilliSecs != undefined)
        {
            var curTime = cs.getCurTime();
            var limitGap = this._productInfo.getOrderGap();
            var diff = (curTime - this._productInfo._lastBetMilliSecs)/1000;
            if(diff > limitGap) {
                this._productInfo._lastBetMilliSecs = undefined;
                this._betRiseBtn.setGray(false);
                this._betFallBtn.setGray(false);
                cc.log(this._productInfo.getName() +"下单 CD重置");
            }
        }
    },

    /**
     * 登录状态改变
     */
    refreshLoginStatus:function()
    {
        this._topUpBtn.setVisible(true);
        this._cashOutBtn.setVisible(true);
        this._loginBtn.setVisible(false);

        cc.log("Player.getInstance().isLimited():: ", Player.getInstance().isLimited());

        if(Player.getInstance().isLimited())
        {
            this._topUpBtn.setVisible(false);
            this._cashOutBtn.setVisible(false);
            this._loginBtn.setVisible(true);
        }

        if(isEducationVersion)
        {
            this._topUpBtn.setVisible(false);
            this._cashOutBtn.setVisible(false);
        }
    },

    /**
     */
    reset:function(oldControlPanel)
    {
        cc.log("HighLowTradeControl reset。。。。");
        this._productInfo = Player.getInstance().getCurProductInfo() ;

        this.refreshByProduct();

        if(oldControlPanel && oldControlPanel.isShowingTradeList && oldControlPanel.isShowingTradeList())
        {
            this.setTradeListVisible(true);
        }

        //订单列表
        var tradeListPanel = TradingHallLayer.instance.getTradeListPanel();
        if(tradeListPanel.getParent()){
            tradeListPanel.retain();
            tradeListPanel.removeFromParent(false);
            this._tradeListBgPanel.addChild(tradeListPanel);
            tradeListPanel.setPos(topInner(this._tradeListBgPanel), ANCHOR_TOP);
            if(this._isShowingTradeList){
                tradeListPanel.setVisible(true);
            }
        }
    },

    isShowingTradeList:function(){
        return this._isShowingTradeList;
    },

    setEnabled:function(isEnabled){

        this.setVisible(isEnabled);

        for(var propName in this)
        {
            var prop = this[propName];
            if(prop && prop instanceof cc.EventListener){
                prop.setEnabled(isEnabled);
            }
        }
        if(isEnabled)
        {
            this.refreshLoginStatus();
            this.scheduleUpdate();
        }else{
            this.unscheduleUpdate();
            //放开需要的监听
            if(this._showTradeListListener) this._showTradeListListener.setEnabled(true);
            if(this._showTradeControlListener) this._showTradeControlListener.setEnabled(true);
            if(this._productInfoUpdateListener) this._productInfoUpdateListener.setEnabled(true);
        }
    },

    /**
     * 初始化按钮的点击事件
     */
    initAllButtonClick:function() {
        this._topUpBtn.addClickEventListener(function (sender) {
            if (!Player.getInstance().getOnline()) {
                MainController.getInstance().showLoginLayer();
            } else {
                MainController.getInstance().showRechargeLayer();
            }
        }.bind(this));
        this._topUpBtn.setClickEffectEnabled(true);

        this._cashOutBtn.addClickEventListener(function (sender) {
            if (!Player.getInstance().getOnline()) {
                MainController.getInstance().showLoginLayer();
            } else {
                MainController.getInstance().showCashOutLayer();
            }
        }.bind(this));
        this._cashOutBtn.setClickEffectEnabled(true);

        this._loginBtn.addClickEventListener(function () {
            MainController.getInstance().showLoginLayer();
        });
        this._loginBtn.setClickEffectEnabled(true);

        //看涨
        this._betRiseBtn.addClickEventListener(function(sender)
        {
            if(Player.getInstance().isLimited()) {
                MainController.getInstance().showLoginLayer();
            }else {
                this.doBet(true);
            }
        }.bind(this));

        //看跌
        this._betFallBtn.addClickEventListener(function(sender)
        {
            if(Player.getInstance().isLimited()) {
                MainController.getInstance().showLoginLayer();
            }else {
                this.doBet(false);
            }
        }.bind(this));

        //查看持仓
        this._tradeControlPanel.originPos = this._tradeControlPanel.getPosition();
        if(!isEducationVersion) {
            this._viewHoldingsBtn.addClickEventListener(function (sender) {
                cc.eventManager.dispatchCustomEvent(NOTIFY_SHOW_TRADE_LIST);
                //查询未结算订单
                HttpManager.requestAllUnSettledOrders(GB.isSimulateTrade);
            }.bind(this));
        }

        //开始交易
        this._beginTradeBtn.addClickEventListener(function(sender)
        {
            cc.eventManager.dispatchCustomEvent(NOTIFY_SHOW_TRADE_CONTROL);
            //准备回到当前k线
            cc.eventManager.dispatchCustomEvent(NOTIFY_SHOW_DYNAMIC_QUOTE);
        }.bind(this));

        this._addBtn.addTouchEventListener(function(sender, eventType)
        {
            var minBet = this._productInfo.getMinBetAmount();
            switch (eventType)
            {
                case ccui.Widget.TOUCH_BEGAN:
                    if(!sender._prepareToAddTime)
                        sender._prepareToAddTime = cs.getCurTime();
                    break;
                case ccui.Widget.TOUCH_ENDED:
                    MainController.playBtnSoundEffect(sender);
                    this.calculateInput(minBet, GB.INPUT_TYPE_ADD_OR_SUB);
                    sender._prepareToAddTime = null;
                    break;
                case ccui.Widget.TOUCH_MOVED:
                    var movPos = sender.getTouchMovePosition();
                    var beganPos = sender.getTouchBeganPosition();
                    var threshold = 40;
                    if(cc.pDistance(movPos, beganPos) > threshold)
                        sender._prepareToAddTime = null;
                    break;
                case ccui.Widget.CANCELLED:
                    sender._prepareToAddTime = null;
                    break;
            }
        }.bind(this));

        //减少基础投注
        this._subBtn.addTouchEventListener(function(sender, eventType)
        {
            var minBet = this._productInfo.getMinBetAmount();
            switch (eventType)
            {
                case ccui.Widget.TOUCH_BEGAN:
                    if(!sender._prepareToSubTime)
                        sender._prepareToSubTime = cs.getCurTime();
                    break;
                case ccui.Widget.TOUCH_ENDED:
                    MainController.playBtnSoundEffect(sender);
                    this.calculateInput(-minBet, GB.INPUT_TYPE_ADD_OR_SUB);
                    sender._prepareToSubTime = null;
                    break;
                case ccui.Widget.TOUCH_MOVED:
                    var movPos = sender.getTouchMovePosition();
                    var beganPos = sender.getTouchBeganPosition();
                    var threshold = 40;
                    if(cc.pDistance(movPos, beganPos) > threshold)
                        sender._prepareToSubTime = null;
                    break;
                case ccui.Widget.CANCELLED:
                    sender._prepareToSubTime = null;
                    break;
            }
        }.bind(this));
    },

    doBet:function(isBullish)
    {
        //无论是否可以下单成功，先禁用virtual秒
        this._betRiseBtn.setGray(true);
        this._betFallBtn.setGray(true);
        var curTime = cs.getCurTime();
        if(!this._productInfo){
            cc.log("产品不存在 下单return");
            return;
        }
        this._productInfo._lastBetMilliSecs = curTime + 0.5 * 1000;

        cc.log("this._betBtn gray");

        var betData = {
            isBullish:isBullish,
            betAmount: this._betAmount,
            duration:this.getSelectedDuration ? this.getSelectedDuration() : undefined,
            touchOffset:this.getCurTouchOffset ? this.getCurTouchOffset() : undefined
        };
        cc.eventManager.dispatchCustomEvent(NOTIFY_DO_BET, betData);
    },

    /**
     * 打开金额输入键盘
     */
    showKeyBoard:function()
    {
        //防止多次点击
        if(this._calculatorPanel.getNumberOfRunningActions() > 0)
            return;
        //如果键盘已经唤出来，再次点击则隐藏
        if(parseInt(this._calculatorPanel.originPos.x) != parseInt(this._calculatorPanel.getPositionX()))
        {
            this.hideKeyBoard();
            return;
        }

        var calculatorShowAction = new cc.Sequence(
            new cc.CallFunc(function(){
                if(this._tradeControlSubPanel) this._tradeControlSubPanel.setVisible(false);
                if(this._betSelectedPanel) this._betSelectedPanel.setVisible(false);
                if(this._potentialIncomePanel) this._potentialIncomePanel.setVisible(false);
                this._lastInputType = undefined;    //每次打开键盘重置
            }.bind(this)),
            new cc.MoveTo(0.3, 0 , this._calculatorPanel.originPos.y).easing(cc.easeOut(0.25))
        );
        this._calculatorPanel.runAction(calculatorShowAction);
    },

    /**
     * 关闭金额输入键盘
     */
    hideKeyBoard:function()
    {
        var calculatorHideAction = new cc.Sequence(
            new cc.MoveTo(0.3, this._calculatorPanel.originPos.x, this._calculatorPanel.originPos.y),
            new cc.CallFunc(function(){
                //确认输入
                this.refreshBetInput(undefined, true);

                if(this._tradeControlSubPanel) this._tradeControlSubPanel.setVisible(true);
                if(this._betSelectedPanel) this._betSelectedPanel.setVisible(true);
                if(this._potentialIncomePanel) this._potentialIncomePanel.setVisible(true);
                //教育版不显示
                if(isEducationVersion){
                    if(this._betSelectedPanel) this._betSelectedPanel.setVisible(false);
                }
                //设置最后一次的投注
                Player.getInstance().setLastBetAmount(this._betAmount);
                cs.setItem("lastBetAmount", this._betAmount);
            }.bind(this))
        );
        this._calculatorPanel.runAction(calculatorHideAction);
    },

    /**
     * 检查下单冷却
     */
    checkBetCD:function()
    {
        var productInfo = this._productInfo;
        var lastBetMilliSecs = productInfo._lastBetMilliSecs;
        if(productInfo && (cs.getCurSecs() - lastBetMilliSecs) < productInfo.getOrderGap()){
            this.setBetEnabled(false, true);
        }else{
            this.setBetEnabled(true, true);
        }
    },

    showTradeList:function() {
        if(TradingHallLayer.instance.getControlPanel() == this){
            TradingHallLayer.instance.getTradeListPanel().reload();
        }
    },

    /**
     * 显示交易投注列表面板
     */
    showTradeBetListPanel:function(isDoAni)
    {
        if(isDoAni || isDoAni == undefined){
            var action = new cc.Sequence(
                new cc.MoveTo(0.2, this._tradeControlPanel.originPos.x, this._tradeControlPanel.originPos.y + this._tradeControlPanel.height)
                ,new cc.CallFunc(function(){
                    this.setTradeListVisible();
                }.bind(this))
            );
            action.easing(cc.easeSineInOut());
            this._tradeControlPanel.runAction(action);
        }else{
            this.setTradeListVisible();
        }
    },

    setTradeListVisible:function(){
        this._tradeControlPanel.setPosition(this._tradeControlPanel.originPos.x, this._tradeControlPanel.originPos.y + this._tradeControlPanel.height);
        this.showTradeList();
        this._isShowingTradeList = true;
    },

    setTradeControlVisible:function()
    {
        this._tradeControlPanel.setPosition(this._tradeControlPanel.originPos);
        this._isShowingTradeList = false;
        TradingHallLayer.instance.setBeSelectedBetInfo(null);
    },

    /**
     * 显示交易控制面板
     */
    showTradeControlPanel:function(isDoAni)
    {
        if(isDoAni || isDoAni == undefined){
            var action = new cc.Sequence(
                new cc.MoveTo(0.2, this._tradeControlPanel.originPos.x, this._tradeControlPanel.originPos.y)
                ,new cc.CallFunc(function(){
                    this.setTradeControlVisible();
                }.bind(this))
            );
            action.easing(cc.easeSineInOut());
            this._tradeControlPanel.runAction(action);
        }else{
            this.setTradeControlVisible();
        }
    },

    /**
     * 刷新持仓数
     */
    refreshHoldOrders:function()
    {
        //持仓订单数
        var productInfo = this._productInfo;
        var maxOrders = productInfo.getMaxUnSettledOrders();

        var num = Player.getInstance().getPositionCount();
        if(GB.isSimulateTrade)
            num = Player.getInstance().getSmPositionCount();
        //this._maxOrders = maxOrders;

        cc.log("num + + maxOrders::", num + "/" + maxOrders);
        //表示没有上限
        if(maxOrders > 0){
            this._holdingNumText.setString(num + "/" + maxOrders);
        }else {
            if (num == 0)
                this._holdingNumText.setString("");
            else
                this._holdingNumText.setString(num);
        }


        this._holdingNumText.setColor(cc.color(255, 255, 0));
        if(maxOrders > 0 && num >= maxOrders)
            this._holdingNumText.setColor(cc.color(217, 73, 47));

    },

    /**
     * 设置下单是否可用
     */
    setBetEnabled:function(isEnable, isForce)
    {
        var productInfo = this._productInfo;
        //没有强制的时候
        if(!isForce){
            var lastBetMiliSecs = productInfo._lastBetMilliSecs;
            var curSecs = cs.getCurSecs();
            //还没到cd return
            if(lastBetMiliSecs && (curSecs - lastBetMiliSecs) < this._productInfo.getOrderGap()){
                return;
            }
        }
        if(isEnable && !productInfo.isOpen()){
            return;
        }
        this._betRiseBtn.setGray(!isEnable);
        this._betFallBtn.setGray(!isEnable);
        if(isEnable){
            this._productInfo._lastBetMilliSecs = null;
        }
    }
});