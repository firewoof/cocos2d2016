/**
 * 高低--结算时间下拉选择控制面板
 * Created by Administrator on 2016/12/3.
 */
var HighLowListControlPanel = BaseTradeControlPanel.extend({

    ctor:function(size)
    {
        this._super();

        this.setContentSize(size);;

        //UI
        this.initUI();

        //button click
        this.initAllButtonClick();

        //input keyBoard
        this.initCalculatorButtons();

        //listener
        this.addListener();

        //schedule
        this.scheduleUpdate();
    },

    addListener:function()
    {
        this._super();
        this._tradeStartListener = cc.eventManager.addCustomListener(NOTIFY_PRODUCT_TRADE_START, function()
        {
            this.initSelectedPanel();
        }.bind(this));

        //产品更新
        this._productInfoUpdateListener= cc.eventManager.addCustomListener(NOTIFY_PRODUCT_INFO_UPDATE, function()
        {
            cc.log("receive NOTIFY_PRODUCT_INFO_UPDATE");
            this.initSelectedPanel(true);
        }.bind(this));
    },

    initUI:function()
    {
        var size = this.getContentSize();
        var rootNode = ccs.load(res.TradeControlHighLowList_json).node;
        rootNode.setContentSize(size);
        ccui.helper.doLayout(rootNode);
        this.addChild(rootNode);

        var controlClippingPanel = ccui.helper.seekWidgetByName(rootNode, "controlClippingPanel");
        controlClippingPanel.setClippingEnabled(true);
        var tradeControlPanel = this._tradeControlPanel = ccui.helper.seekWidgetByName(controlClippingPanel, "tradeControlPanel");
        var betPanel = this._betPanel = ccui.helper.seekWidgetByName(controlClippingPanel, "betPanel");
        var tradeControlSubPanel = this._tradeControlSubPanel = ccui.helper.seekWidgetByName(controlClippingPanel, "tradeControlSubPanel");

        //充值提现
        var topUpBtn = this._topUpBtn = ccui.helper.seekWidgetByName(rootNode, "topUpBtn");
        var cashOutBtn = this._cashOutBtn = ccui.helper.seekWidgetByName(rootNode, "cashOutBtn");
        var loginBtn = this._loginBtn = ccui.helper.seekWidgetByName(rootNode, "loginBtn");

        //选择项
        var betSelectedPanel = this._betSelectedPanel = ccui.helper.seekWidgetByName(controlClippingPanel, "betSelectedPanel");
        var settleTimeText = this._settleTimeText = ccui.helper.seekWidgetByName(betSelectedPanel, "settleTimeText");
        var productOddsText = this._productOddsText = ccui.helper.seekWidgetByName(betSelectedPanel, "oddsText");

        //查看持仓按钮
        var viewHoldingsBtn = this._viewHoldingsBtn = ccui.helper.seekWidgetByName(controlClippingPanel, "viewHoldingsBtn");
        var holdingNumText = this._holdingNumText = ccui.helper.seekWidgetByName(viewHoldingsBtn, "holdingNumText");
        var betRiseBtn = this._betRiseBtn = ccui.helper.seekWidgetByName(betPanel, "betRiseBtn");
        var betFallBtn = this._betFallBtn = ccui.helper.seekWidgetByName(betPanel, "betFallBtn");

        //交易列表(即持仓列表面板)
        var tradeResultPanel = this._tradeResultPanel =  ccui.helper.seekWidgetByName(tradeControlPanel, "tradeResultPanel");
        //列表面板
        var tradeListBgPanel = this._tradeListBgPanel =  ccui.helper.seekWidgetByName(tradeResultPanel, "tradeListPanel");
        //开始交易按钮
        var beginTradeBtn = this._beginTradeBtn =  ccui.helper.seekWidgetByName(tradeResultPanel, "beginTradeBtn");
        //适当调整订单列表
        tradeListBgPanel.setContentSize(tradeListBgPanel.width, tradeListBgPanel.getParent().height - beginTradeBtn.height - 10 - 3);

        //计算器面板
        var calculatorPanel = this._calculatorPanel = ccui.helper.seekWidgetByName(controlClippingPanel, "calculatorPanel");
        this._calculatorPanel.originPos = this._calculatorPanel.getPosition();
        //
        var operatePanel = this._operatePanel = ccui.helper.seekWidgetByName(tradeControlPanel, "operatePanel");

        //基础投注增加按钮
        var addBtn = this._addBtn = ccui.helper.seekWidgetByName(operatePanel, "addBtn");
        //基础投注减少按钮
        var subBtn = this._subBtn = ccui.helper.seekWidgetByName(operatePanel, "subBtn");
        //基础投注的输入框
        var baseBetText = this._baseBetText = ccui.helper.seekWidgetByName(operatePanel, "baseBetText");

        //持仓数置空
        this._holdingNumText.setString("");

        //基础最小投注额度
        baseBetText.setString(MONEY_SIGN + this._betAmount);

        //刷登录状态
        this.refreshLoginStatus();
    },


    /**
     * 初始化所有按钮的点击事件
     */
    initAllButtonClick:function() {
        this._super();
    },

    /**
     * init Calculator
     */
    initCalculatorButtons:function()
    {
        for(var i = 0; i < 10; i++){
            var numBtnCs = ccui.helper.seekWidgetByName(this._calculatorPanel, "numBtnCs"+i);
            if(!numBtnCs)
                return;
            numBtnCs.addClickEventListener(function(sender){
                MainController.playButtonSoundEffect(sender);
                this.self.calculateInput(this.index, GB.INPUT_TYPE_CUSTOM)
            }.bind({"self":this, "index":i}));
            numBtnCs.setClickEffectEnabled(true);
        }

        var fixedInputList = ClientConfig.getInstance().getFixedInputList();
        for(var i = 0; i < fixedInputList.length; i++){
            var numBtnFixed = ccui.helper.seekWidgetByName(this._calculatorPanel, "numBtnFix"+i);
            if(numBtnFixed){
                numBtnFixed.input = fixedInputList[i];
                numBtnFixed.setTitleText(numBtnFixed.input);
                numBtnFixed.addClickEventListener(function(sender){
                    MainController.playButtonSoundEffect(sender);
                    this.calculateInput(sender.input, GB.INPUT_TYPE_FIXED)
                }.bind(this));
            }
        }

        var btnOk = ccui.helper.seekWidgetByName(this._calculatorPanel, "btnOk");
        var btnBackspace = ccui.helper.seekWidgetByName(this._calculatorPanel, "btnBackspace");
        //编辑器里 buton不能添加子节点 只好手动加
        var iconDelete = new cc.Sprite("#icon_delete.png");
        btnBackspace.addChild(iconDelete);
        iconDelete.setPos(centerInner(btnBackspace));

        this._operatePanelTag = 10051;
        this._operatePanel.setTag(this._operatePanelTag);
        var betInputTouchPanel = ccui.helper.seekWidgetByName(this._operatePanel, "betInputTouchPanel");
        betInputTouchPanel.setTouchEnabled(true);

        btnBackspace.addClickEventListener(function(sender){ MainController.playButtonSoundEffect(sender); this.calculateInput(undefined, GB.INPUT_TYPE_DEL, true)}.bind(this));

        //input bet amount finished , fold/unfold the calculator
        btnOk.addClickEventListener(function(sender) {
            MainController.playButtonSoundEffect(sender);
            this.hideKeyBoard();
        }.bind(this));

        //to edit bet amount, show calculator
        betInputTouchPanel.addClickEventListener(function(sender) {
            MainController.playButtonSoundEffect(sender);
            this.showKeyBoard();
        }.bind(this));
        betInputTouchPanel.setClickEffectEnabled(true);
    },

    /**
     * 产品相关(切换时亦可用)
     */
    refreshByProduct:function() {
        var productInfo = this._productInfo;

        //投注额设置(确保不大于产品限制)
        this._betAmount = Math.min(productInfo.getMaxBetAmount(), this._betAmount);

        //更新投注显示
        this.refreshBetInput(this._betAmount, true);

        //持仓数
        this.refreshHoldOrders();

        //潜在收益
        this.initSelectedPanel();

        //下单按钮状态
        this.checkBetCD();
    },

    /**
     * 计算器的输入
     * @param input
     * @param isPlusOrSub
     * @param isBackspace
     */
    calculateInput:function(input, inputType)
    {
        if(input == null && inputType != GB.INPUT_TYPE_DEL)
            return;
        cc.log("input:", input);
        cc.log("inputType:", inputType);
        var minBet = this._productInfo.getMinBetAmount();
        var maxBet = this._productInfo.getMaxBetAmount();
        var changeAmount = 0;

        //表示手动输入
        if(inputType == GB.INPUT_TYPE_CUSTOM){
            //上次输入不是自定义 清空
            if(this._lastInputType != GB.INPUT_TYPE_CUSTOM)
                changeAmount = input;
            else
                changeAmount = this._betAmount * 10 + input;

            this.refreshBetInput(changeAmount);
            this._lastInputType = GB.INPUT_TYPE_CUSTOM ;
        }

        if(inputType == GB.INPUT_TYPE_ADD_OR_SUB)
        {
            var changeAmount = this._betAmount + input;
            if(changeAmount < minBet)
                changeAmount = minBet;
            if(changeAmount > maxBet)
                changeAmount = maxBet;
            this.refreshBetInput(changeAmount);
            this._lastInputType = GB.INPUT_TYPE_ADD_OR_SUB ;
        }

        if(inputType == GB.INPUT_TYPE_FIXED)
        {
            ////两次点击固定同一值，直接关闭输入框
            //if(this._lastInputType && this._betAmount == input){
            //    this.hideKeyBoard();
            //}
            var changeAmount = input;
            this.refreshBetInput(changeAmount);
            this._lastInputType = GB.INPUT_TYPE_FIXED ;
        }

        if(inputType == GB.INPUT_TYPE_DEL)
        {
            changeAmount = 0;
            if(this._betAmount < 10)
            {
                changeAmount = 0;
            }
            else
            {
                changeAmount = parseInt(this._betAmount/10);
            }
            this.refreshBetInput(changeAmount);
        }

        if(inputType == GB.INPUT_TYPE_MULT){
            changeAmount = this._betAmount * input;
            this.refreshBetInput(changeAmount);
        }

        this._baseBetText.runAction(new cc.Sequence(
            new cc.ScaleTo(0.15, 1.2, 1.2),
            new cc.ScaleTo(0.15, 1.0, 1.0)
        ));

        //做个预防
        if(changeAmount <= minBet || input >= maxBet){
            this._addBtn._prepareToAddTime = null;
            this._subBtn._prepareToSubTime = null;
        }
    },

    /**
     * 刷新投注额度
     */
    refreshBetInput:function(betAmount, isNeedCheckValid)
    {
        cc.log("betAmount::", betAmount);
        this._betAmount = betAmount == undefined ? this._betAmount : betAmount;
        var minBet = this._productInfo.getMinBetAmount();
        var maxBet = this._productInfo.getMaxBetAmount();

        if(this._betAmount > maxBet)
        {
            this._betAmount = maxBet;
            this._lastInputType = undefined;
        }

        if(this._betAmount < 0)
            this._betAmount = 0;

        if(isNeedCheckValid)
        {
            if(this._betAmount < minBet)
                this._betAmount = minBet;
        }

        if(this._betAmount == 0)
            this._baseBetText.setString("");
        else
            this._baseBetText.setString(MONEY_SIGN + this._betAmount);
    },

    /**
     * 结算选择项
     * @param titleStr
     * @returns {cc.Node|*}
     */
    createSettleSelectedCell:function(time, odds)
    {
        var layer = ccs.load(res.TradeControlSelectedCell_json).node;
        //
        var titleText = ccui.helper.seekWidgetByName(layer, "titleText");
        var oddsText = ccui.helper.seekWidgetByName(layer, "oddsText");

        titleText.setString((time/60).toFixed(0) + LocalString.getString("COMMON_MINUTE"));
        oddsText.setString((odds * 100).toFixed(0) + "%");

        layer._oddsText = oddsText;
        layer._titleText = titleText;

        layer.refresh = function(time, odds)
        {
            titleText.setString((time/60).toFixed(0) + LocalString.getString("COMMON_MINUTE"));
            oddsText.setString((odds * 100).toFixed(0) + "%");
        };

        return layer;
    },

    /**
     * isUpdate 产品更新表示要重建下拉列表
     * @param isUpdate
     */
    initSelectedPanel:function(isUpdate)
    {
        var productInfo = Player.getInstance().getCurProductInfo();
        var defaultIndex = cc.sys.localStorage.getItem("durationIndex_"+productInfo.getId());
        if(!defaultIndex || defaultIndex == ""){
            defaultIndex = 0;
        }
        this.setSettleTimeIndex(defaultIndex);

        if(isUpdate){
            this.initDurationSelectList(true);
        }

        this._betSelectedPanel.addClickEventListener(function()
        {
            this.initDurationSelectList();
        }.bind(this));
        if(isEducationVersion){
            this._betSelectedPanel.setVisible(false);
        }
    },

    initDurationSelectList:function(isUpdate)
    {
        var productInfo = Player.getInstance().getCurProductInfo();
        var isNeedCreate = false;
        if(isUpdate || (this._durationSelectPanel && this._durationSelectPanel._productInfo != productInfo)){
            if(this._durationSelectPanel ){
                this._durationSelectPanel.removeFromParent();
                this._durationSelectPanel = null;
            }
            isNeedCreate = true;
        }
        else if(this._durationSelectPanel == undefined){
            isNeedCreate = true;
        }

        if(isNeedCreate){
            var radioListPanel = this._durationSelectPanel = new RadioListPanel();
            this._durationSelectPanel._productInfo = productInfo;
            cc.log("_durationSelectPanel create");

            var durationList = productInfo.getDurationList();
            var oddsList = productInfo.getOddsList();
            for(var i = 0; i < durationList.length; i++){
                var cell = this.createSettleSelectedCell(durationList[i], oddsList[i]);
                //cell.index = i;
                radioListPanel.addSelectCell(cell, function(sender, isSelected, index){
                    if(isSelected){
                        radioListPanel.close();
                        //结算尺度
                        this.setSettleTimeIndex(index);
                    }
                }.bind(this));
            }

            TradingHallLayer.instance.addChild(radioListPanel);

            //设置下拉列表的位置 (注意::此处要考虑到 右侧面板滑上去的情况 ancestor取this)
            var posX = this._betSelectedPanel.getPosAtAncestor(TradingHallLayer.instance, ANCHOR_LEFT_BOTTOM).x;
            var posY = this._betSelectedPanel.y;
            radioListPanel.setListPos(cc.p(posX, posY), ANCHOR_LEFT_TOP);
            //防止
            radioListPanel.setClose();
        }
        //
        if(!isUpdate){
            this._durationSelectPanel.open();
        }
    },

    setSettleTimeIndex:function(index)
    {
        //if(this._selectedIndex == index)
        //    return;
        this._selectedIndex = index;
        var productInfo = Player.getInstance().getCurProductInfo();
        var durationList = productInfo.getDurationList();
        var oddsList = productInfo.getOddsList();
        var odds = oddsList[index];
        var time = (durationList[index]/60).toFixed(0);
        cc.log("index::", index);
        cc.log("durationList::", JSON.stringify(durationList));
        cc.log("oddsList::", JSON.stringify(oddsList));
        cc.log("odds * 100::", odds * 100);
        cs.setItem("durationIndex_"+productInfo.getId(), index);
        if(odds && time) {
            this._settleTimeText.setString(time + LocalString.getString("COMMON_MINUTE"));
            this._productOddsText.setString((odds * 100).toFixed(0) + "%");
        }else{
            this._settleTimeText.setString("?"+LocalString.getString("COMMON_MINUTE"));
            this._productOddsText.setString("?%");
        }
    },

    getSelectedDuration:function()
    {
        var productInfo = Player.getInstance().getCurProductInfo();
        var durationList = productInfo.getDurationList();
        return durationList[this._selectedIndex];
    }
});

//HighLowListControlPanel.getInstance = function(size)
//{
//    var instance = HighLowListControlPanel.instance;
//    if(instance == undefined){
//        instance = HighLowListControlPanel.instance = new HighLowListControlPanel(size);
//        instance.retain();
//    }
//    return instance;
//};