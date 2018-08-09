/**
 * 触碰--止盈止损选择控制面板
 * Created by Administrator on 2016/12/3.
 */
var TouchOffsetChoosePanel = BaseTradeControlPanel.extend({

    ctor:function(size)
    {
        this._super();
        this.setContentSize(size);

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

    initUI:function()
    {
        var size = this.getContentSize();
        var rootNode = ccs.load(res.TradeControlTouchOffsetChoose_json).node;
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

        //潜在收益总额
        var potentialIncomePanel = this._potentialIncomePanel = ccui.helper.seekWidgetByName(controlClippingPanel, "potentialIncomePanel");
        var potentialIncomeText = this._potentialIncomeText = ccui.helper.seekWidgetByName(potentialIncomePanel, "potentialIncomeText");
        var productOddsText = this._productOddsText = ccui.helper.seekWidgetByName(potentialIncomePanel, "oddsText");

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

        //触碰选择项
        this.initSelectedPanel();

        //潜在收益
        this.refreshTotalBet();

        //下单按钮状态
        this.checkBetCD();
    },

    /**
     * 刷新潜在收益总额
     */
    refreshTotalBet:function()
    {
        if(this._productInfo){
            var totalPotential = this._betAmount * (this.getCurOdds() + 1);
            //潜在收益
            this._potentialIncomeText.setString(MONEY_SIGN + (totalPotential).toFixed(2));
        }
    },

    getCurOdds:function()
    {
        var odds = this._productInfo.getOddsList()[this._touchOffsetIndex] || 0;
        return parseFloat(odds);
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
        if(changeAmount <= minBet || changeAmount >= maxBet){
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

        var curOdds = this.getCurOdds();
        this._potentialIncomeText.setString(MONEY_SIGN + (this._betAmount * (1 + curOdds)).toFixed(2));
    },

    initSelectedPanel:function()
    {
        var productInfo = Player.getInstance().getCurProductInfo();
        var touchOffsetShowList = productInfo.getTouchOffsetShowList();
        //cc.log("touchOffsetList::", touchOffsetShowList.length);
        for(var i = 0; i < touchOffsetShowList.length; i++)
        {
            var touchOffset = touchOffsetShowList[i];
            var touchOffsetBtn = this["touchOffsetBtn"+i] = ccui.helper.seekWidgetByName(this._betSelectedPanel, "touchOffsetBtn"+i);
            if(touchOffsetBtn){
                touchOffsetBtn.setEnabled(true);
                touchOffsetBtn.setTitleText(touchOffset);
                touchOffsetBtn.index = i;
                var self = this;
                touchOffsetBtn.addClickEventListener(function(sender)
                {
                    self.touchOffsetSelected(sender.index);
                });
            }
        }

        var defaultTouchOffsetIndex = cc.sys.localStorage.getItem("selectedOffsetIndex_"+productInfo.getId());
        if(defaultTouchOffsetIndex == undefined || defaultTouchOffsetIndex == ""){
            defaultTouchOffsetIndex = 0;
        }
        this.touchOffsetSelected(defaultTouchOffsetIndex);
    },

    /**
     * 止盈 止损点选择
     * @param index
     */
    touchOffsetSelected:function(index)
    {
        cc.log("touchOffsetSelect index::", index);
        var productInfo = Player.getInstance().getCurProductInfo();

        //记住
        cs.setItem("selectedOffsetIndex_"+productInfo.getId(), index);

        var newSelectedTouchOffsetBtn = this["touchOffsetBtn"+ index];
        var lastSelectedTouchOffsetBtn = this["touchOffsetBtn"+ this._touchOffsetIndex];

        newSelectedTouchOffsetBtn.setEnabled(false);
        if(lastSelectedTouchOffsetBtn && newSelectedTouchOffsetBtn != lastSelectedTouchOffsetBtn){
            lastSelectedTouchOffsetBtn.setEnabled(true);
        }
        this._touchOffsetIndex = index;

        var curOdds = this.getCurOdds() || "?";
        this._productOddsText.setString(curOdds * 100 + "%");
        this.refreshBetInput();

        //立即刷新下触碰线
        TouchLinePanel.instance.refresh();
    },

    /**
     * 得到当前选择的触碰偏移
     * @returns {*}
     */
    getCurTouchOffset:function()
    {
        var productInfo = Player.getInstance().getCurProductInfo();
        var touchOffsetList = productInfo.getTouchOffsetList();
        //var preciseUnit = Math.pow(10, - this._productInfo.getPrecise());
        var touchOffsetValue = parseFloat(touchOffsetList[this._touchOffsetIndex]);// * preciseUnit;
        return touchOffsetValue;
    },

    getCurTouchOffsetIndex:function()
    {
        return this._touchOffsetIndex;
    }
});
//
//TouchOffsetChoosePanel.getInstance = function(size)
//{
//    var instance = TouchOffsetChoosePanel.instance;
//    if(instance == undefined){
//        instance = TouchOffsetChoosePanel.instance = new TouchOffsetChoosePanel(size);
//        instance.retain();
//    }
//    return instance;
//};