/**
 * 交易大厅--下单区--(触碰式)订单层
 * Created by 玲英 on 2016/10/26.
 */
var TouchSelfBetPanel = cc.Node.extend({

    ctor:function(size)
    {
        this._super();
        this._betArray = [];
        this._betViewArray = [];
        //this.setBackGroundColorEx(cc.RED);
        //this.setBackGroundColorOpacity(80);

        this.initUI();

        this.setContentSize(size);

        this.addListener();
    },

    cleanup:function()
    {
        this.removeAllCustomListeners();
        this._super();
        cc.log("TrendSubSelfBetPanel cleanup");
    },

    initUI:function()
    {
        //箭头
        var betArrow = this._betArrow = new cc.Sprite("#animation_common_history.png");
        this.addChild(betArrow, 2);
        betArrow.setVisible(false);
        betArrow.setAnchorPoint(ANCHOR_LEFT_BOTTOM);
        betArrow.runAction(new cc.RepeatForever(new cc.Sequence(
            new cc.FadeIn(0.35),
            new cc.FadeOut(0.35)
        )));
    },

    addListener:function()
    {
        this._orderCountListner =  cc.eventManager.addCustomListener(NOTIFY_ORDER_COUNT, function(event)
        {
            var betInfo = event.getUserData();
            cc.log("receive NOTIFY_ORDER_COUNT");
            if(ProductInfo.OPTION_TYPE_TOUCH != betInfo.getOptionType()){
                return;
            }
            var curProductInfo = Player.getInstance().getCurProductInfo();
            if(betInfo.isSimulateTrade() === GB.isSimulateTrade && betInfo.getProductId() == curProductInfo.getId()) {
                this.actionResult(betInfo);
            }
        }.bind(this));

        //新添加订单
        this._newBetInfoListner =  cc.eventManager.addCustomListener(NOTIFY_NEW_ORDER, function(event)
        {
            var betInfo = event.getUserData();
            var curProductInfo = Player.getInstance().getCurProductInfo();
            if(ProductInfo.OPTION_TYPE_TOUCH != betInfo.getOptionType()){
                return;
            }
            cc.log("new betInfo::", betInfo.getOrderId());
            if(betInfo.isSimulateTrade() == GB.isSimulateTrade && curProductInfo.getId() == betInfo.getProductId()) {
                var betView = this.addBetInfo(betInfo);
                this.refresh();
                //下单执行动画
                this.showPopTip(betView);
            }
        }.bind(this));

        this._perOneSecondListener = cc.eventManager.addCustomListener(NOTIFY_PER_ONE_SECOND, function()
        {
            var curSecs = cs.getCurSecs();
            var popTipPanel = this._popTipPanel;
            if(popTipPanel && (curSecs - popTipPanel.showTime) > 10)
            {
                //确保popTip能移除 注:这个版本的引擎 偶尔会出现回调不能执行情况 导致popTip一直不消失
                popTipPanel.setVisible(false);
                popTipPanel.setPositionX(-1000);
                popTipPanel.associateBetView = null;
            }
        }.bind(this));

        this._betBeSelectedListener = cc.eventManager.addCustomListener(NOTIFY_BET_BE_SELECTED, function()
        {
            var beSelectedBetInfo = TradingHallLayer.instance.getBeSelectedBetInfo();
            if(beSelectedBetInfo && beSelectedBetInfo.isTouchOption()){
                if(TouchLinePanel.instance.getBetInfo() != beSelectedBetInfo){
                    TouchLinePanel.instance.setBetInfo(beSelectedBetInfo);
                }
            }
        }.bind(this));
    },

    /**
     * 设置公式引用
     * @param formulas
     */
    setFormulas:function(formulas)
    {
        this._formulas = formulas;
    },

    getBetArray:function()
    {
        return this._betArray;
    },

    /**
     * 重置
     */
    reset:function()
    {
        var productInfo = Player.getInstance().getCurProductInfo();
        //产品可能还没预备好
        if(!productInfo){
            return;
        }

        if(!productInfo.isTouchOption()){
            this.setVisible(false);
            return;
        }
        this.setVisible(true);

        //重建所有订单
        this.reBuild();

        //重置本界面时 绑定订单到触碰线
        this.bindTouchLine();
    },

    /**
     * 新增获取头像
     * @returns {T}
     */
    genBetView:function(betInfo)
    {
        var betView = this.getNotUsingBetView();
        if(!betView){
            cc.log("---new BetView touch");
            betView = new BetView();
            this.addChild(betView);
            this._betViewArray.push(betView);
            betView.setTouchEnabled(true);
            betView.addClickEventListener(function(sender){
                cc.log("sender::", sender);
                this.showPopTip(sender);
            }.bind(this));
        }

        if(betView.popTipPanel){
            betView.popTipPanel.removeFromParent();
            betView.popTipPanel = null;
        }

        //重置数据
        betView.refresh(betInfo);
        betView.setVisible(true);
        betView.setPositionX(-200);
        betView._isUsing = true;
        return betView;
    },

    showPopTip:function(betView)
    {
        var betInfo = betView.getBetInfo();
        var popTipPanel = this.createPopTipPanel(betInfo);
        if(!popTipPanel)
            return;

        popTipPanel.associateBetView = betView;
        popTipPanel.setVisible(true);
        this.refreshPopTipPos();

        TouchLinePanel.instance.setBetInfo(betInfo);
        popTipPanel.showTime = cs.getCurSecs();
    },

    /**
     * 刷新小提示框的位置
     */
    refreshPopTipPos:function()
    {
        var popTipPanel = this._popTipPanel;
        if(!popTipPanel || !popTipPanel.associateBetView || !popTipPanel.isVisible()){
            return;
        }
        var betView = popTipPanel.associateBetView;
        if(!betView._isUsing){
            popTipPanel.setVisible(false);
            return;
        }

        popTipPanel.changeDirection(false);
        popTipPanel.setPosition(betView.getPositionX() - 2, betView.getPositionY() + 10);
        if(betView.getPositionX() < popTipPanel.width * 0.5){
            popTipPanel.changeDirection(true);
            popTipPanel.setPositionXAdd(10);
            popTipPanel.setPositionY(betView.getPositionY());
        }
    },

    createPopTipPanel:function(betInfo)
    {
        if(!betInfo)
            return;
        if(this._popTipPanel){
            this._popTipPanel.refresh(betInfo);
            return this._popTipPanel;
        }

        var firstText = new ccui.Text(LocalString.getString("TOUCH_PROFIT_ONLY") + ":" + "00000.00", FONT_ARIAL_BOLD, 20);
        var secondText = new ccui.Text(LocalString.getString("TOUCH_STOP_LOSS")  + ":" + "00000.00", FONT_ARIAL_BOLD, 20);
        firstText.setAnchorPoint(ANCHOR_CENTER);
        secondText.setAnchorPoint(ANCHOR_CENTER);
        firstText.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        secondText.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);

        var bgSrc = "common_popup_small_red_1.png";
        var popSprite = new cc.Scale9Sprite(bgSrc);
        popSprite.setInsetLeft(22);
        popSprite.setInsetRight(22);
        popSprite.setInsetTop(22);
        popSprite.setInsetBottom(33);
        popSprite.setContentSize(300, 66);
        popSprite.setAnchorPoint(ANCHOR_LEFT);
        this.addChild(popSprite, 8);
        var capInsets = popSprite.getCapInsets();

        popSprite.addChild(firstText);
        firstText.setPos(cc.p(popSprite.width * 0.5, popSprite.height * 0.71), ANCHOR_CENTER);

        popSprite.addChild(secondText);
        secondText.setPos(cc.p(popSprite.width * 0.5, popSprite.height * 0.33), ANCHOR_CENTER);

        popSprite.firstText = firstText;
        popSprite.secondText = secondText;

        //设置子孙节点透明度串联
        popSprite.setCascadeOpacityAll();

        popSprite.refresh = function(betInfo){
            betInfo = betInfo || this.betInfo;
            if(!betInfo)
                return;
            var isBullish = betInfo.isBullish();
            var productInfo = Player.getInstance().getProductById(betInfo.getProductId());
            var precise = productInfo.getPrecise();
            var touchOffset = betInfo.getTouchOffset();
            var betPrice = betInfo.getBetQuotePrice();
            var profitOnlyValue = isBullish ? betPrice + touchOffset : betPrice - touchOffset;
            var stopLossValue = isBullish ? betPrice - touchOffset : betPrice + touchOffset;

            var profitOnlyTitle = LocalString.getString("TOUCH_PROFIT_ONLY") + ":";
            var stopLossTitle = LocalString.getString("TOUCH_STOP_LOSS") + ":";
            var firstStr = isBullish ? profitOnlyTitle + profitOnlyValue.toFixedCs(precise) : stopLossTitle + stopLossValue.toFixedCs(precise);
            var secondStr = isBullish ? stopLossTitle + stopLossValue.toFixedCs(precise) : profitOnlyTitle + profitOnlyValue.toFixedCs(precise);

            firstText.setString(firstStr);
            secondText.setString(secondStr);

            var bgSrc = "common_popup_small_red_1.png";
            if(!betInfo.isBullish()){
                bgSrc = "common_popup_small_green_1.png";
            }
            //重设框体
            var frame = cc.spriteFrameCache.getSpriteFrame(bgSrc);
            var newContentSize = cc.size(Math.max(this.firstText.width, this.secondText.width) + 30, this.height);
            this.setSpriteFrame(frame, capInsets);
            this.setContentSize(newContentSize);

            firstText.setPositionX(newContentSize.width * 0.5);
            secondText.setPositionX(newContentSize.width * 0.5);
            this.betInfo = betInfo;
        };

        popSprite.changeDirection = function(isExtremeLeft)
        {
            var betInfo = this.betInfo;
            if(!betInfo){
                return;
            }

            var contentSize = this.getContentSize();
            this.setAnchorPoint(ANCHOR_BOTTOM);
            var bgSrc = "common_popup_small_red_1.png";
            if(!betInfo.isBullish()){
                bgSrc = "common_popup_small_green_1.png";
            }
            if(isExtremeLeft){
                this.setAnchorPoint(ANCHOR_LEFT);
                bgSrc = "common_popup_small_red_2.png";
                if(!betInfo.isBullish()){
                    bgSrc = "common_popup_small_green_2.png";
                }
            }
            var frame = cc.spriteFrameCache.getSpriteFrame(bgSrc);
            this.setSpriteFrame(frame, capInsets);
            this.setContentSize(contentSize);
        };

        popSprite.refresh(betInfo);
        this._popTipPanel = popSprite;

        return popSprite;
    },

    /**
     * 未使用的
     * @returns {*}
     */
    getNotUsingBetView:function()
    {
        var poolArray = this._betViewArray;
        for(var i = 0; i < poolArray.length; i++)
        {
            var temp = poolArray[i];
            if(temp && !temp._isUsing){
                return temp;
            }
        }
    },

    /**
     * 最老的单绑定最老的未结算订单
     */
    bindTouchLine:function()
    {
        TouchLinePanel.instance.reset();
        var oldestOrder = this.getOldestUnOverOrder();
        if(oldestOrder)
            cc.log("bindTouchLine oldestOrder::",oldestOrder.getOrderId());
        //即使为空也设置
        TouchLinePanel.instance.setBetInfo(oldestOrder);
    },

    addBetInfo:function(betInfo)
    {
        var betView = this.genBetView(betInfo);
        this._betArray.push(betInfo);
        return betView;
    },

    /**
     * 重建所有订单view
     */
    reBuild:function()
    {
        //先回收所有订单点
        this._betArray = [];
        var pollArray = this._betViewArray;
        for(var i = 0; i < pollArray.length; i++) {
            var temp = pollArray[i];
            this.cycleBetView(temp);
        }

        //重新加载未结算订单
        var isSimulate = GB.isSimulateTrade;
        var betInfoArray= this.getUnSettledOrders(isSimulate);
        //重建
        for(var i = 0; i < betInfoArray.length; i++)
        {
            this.addBetInfo(betInfoArray[i]);
        }
        cc.log("触碰式未结算订单:: betInfoArray:: ", betInfoArray.length);
    },

    /**
     *
     */
    refresh:function()
    {
        var player = Player.getInstance();
        var lineData = player.getCurLineData();
        var productInfo = lineData.getProductInfo();

        //非触碰式 return
        if(!lineData || productInfo.getOptionType() != ProductInfo.OPTION_TYPE_TOUCH)
        {
            this.setVisible(false);
            return;
        }
        this.setVisible(true);
        this._betArrow.setVisible(false);
        //最老的未结算订单
        var betViewArray = this._betViewArray;
        //var curSecs = cs.getCurSecs();
        for(var i = 0; i < betViewArray.length; i++)
        {
            var betView = betViewArray[i];
            if(!betView._isUsing)
                continue;
            var betInfo = betView.getBetInfo();
            if(!betInfo)
                continue;

            // 如果已经结算了就移除掉
            if(betInfo.isSettled()){
                this.cycleBetView(betView);
                continue;
            }

            var betPrice = betInfo.getBetQuotePrice();
            var xPos = this._formulas.getXPosByValue(betInfo.getBetTime());
            var yPos = this._formulas.getYPosByValue(betPrice);
            if(xPos < 0)
                xPos = 0;
            betView.setPosition(this.limitPos(cc.p(xPos, yPos)));

            //cc.log("touchSelf betView:: ", JSON.stringify(betView.getPosition()));
            var beSelectedBetInfo = TradingHallLayer.instance.getBeSelectedBetInfo();
            if(beSelectedBetInfo){
                if(beSelectedBetInfo == betInfo){
                    this._betArrow.setVisible(true);
                    this._betArrow.setPosition(cc.pAdd(betView.getPosition(), cc.p(13, 7)));
                }
            }
        }

        //popTip 位置
        this.refreshPopTipPos();

    },

    /**
     * 限制订单点的区域 防止超出屏幕
     */
    limitPos:function(pos)
    {
        var minGap = 10;
        if(pos.x < (0+minGap)){
            pos.x = minGap;
        }
        if(pos.y < (0+minGap)){
            pos.y = minGap;
        }
        if(pos.y > (this.height - minGap)){
            pos.y = this.height - minGap;
        }
        return pos;
    },

    /**
     * 得到最老的未过期订单
     */
    getOldestUnOverOrder:function()
    {
        var betArray = this._betArray;
        //var curSecs = cs.getCurSecs();
        for(var i = 0; i < betArray.length; i++) {
            var betInfo = betArray[i];
            if(!betInfo.isSettled()){
                return betInfo;
            }
        }
    },

    /**
     * 拿到还未到达结算的订单
     * @param productId
     * @param isSimulate
     * @returns {Array}
     */
    getUnSettledOrders:function(isSimulate)
    {
        var orders = [];
        var player = Player.getInstance();
        var productInfo = player.getCurProductInfo();
        if(!productInfo){
            return orders;
        }

        var productId = productInfo.getId();
        //var curSecs = cs.getCurSecs();
        var betArray = isSimulate == true ? player.getCurDaySmBetArray() : player.getCurDayBetArray();
        //由于触碰式的结算不能保证顺序结算 这里需要搜索前n条, 暂定前n单
        var searchMax = 100;
        for(var i = 0; i < betArray.length; i++)
        {
            var betInfo = betArray[i];
            if(betInfo.getProductId() == productId){
                if(!betInfo.isSettled()){
                    //player上的订单队列 最新在index=0头部位置 而不是末尾，这里取出来的时候倒过来 保证最新的在末尾
                    orders.unshift(betInfo);
                }

                if(i >= searchMax)
                    break;
            }
        }
        cc.log("getUnSettledOrders orders::", orders.length);
        return orders;
    },

    /**
     * 是否有未结算的单存在
     * @returns {boolean}
     */
    isExistsUsingBetView:function()
    {
        for(var i = 0; i < this._betViewArray.length; i++){
            var betView = this._betViewArray[i];
            if(betView._isUsing){
                return true;
            }
        }
        return false;
    },

    /**
     * 回收
     * @param betAvatar
     */
    cycleBetView:function(betView)
    {
        betView._isUsing = false;
        betView.setVisible(false);
        var betInfo = betView.getBetInfo();
        //从数据队列中移除
        if(betInfo){
            this.removeBet(betInfo.getOrderId());
        }
        //popTip移除关联的betView
        if(this._popTipPanel && this._popTipPanel.associateBetView == betView){
            this._popTipPanel.setVisible(false);
            this._popTipPanel.setPositionX(-1000);
            this._popTipPanel.associateBetView = null;
        }
    },

    /**
     * 移除订单
     * @param orderId
     * @param isDeleteBetView
     */
    removeBet:function(orderId)
    {
        //从缓存中移除
        for(var t = 0; t < this._betArray.length; t++){
            var tempBetInfo = this._betArray[t];
            if(tempBetInfo && tempBetInfo.getOrderId() == orderId)
            {
                this._betArray.splice(t, 1);
                break;
            }

        }
    },

    /**
     * 执行结算动画 盈利了, 亏损了...
     * @param betInfo
     */
    actionResult:function(betInfo) {

        //找到下单点
        var betView = null;
        for(var i = 0; i < this._betViewArray.length; i++){
            var tempBetView = this._betViewArray[i];
            var tempBetInfo = tempBetView.getBetInfo();
            cc.log("tempBetInfo::", tempBetInfo.getOrderId());
            if(betInfo.getOrderId() == tempBetInfo.getOrderId()) {
                betView = tempBetView;
                break;
            }
        }

        if(!betView){
            cc.log("下单点未找到");
            this.removeBet(betInfo.getOrderId());   //确保移除数据
            return;
        }

        //如果本界面被隐藏 就不做动画了
        if(!this.isVisible()){
            return;
        }

        //播放动画的起始位置
        var startPos = betView.getPosAtAncestor(TradingHallLayer.instance, ANCHOR_CENTER);
        //未知原因 有时startPos会=undefined
        if(!startPos){
            return;
        }

        var resultSprite = null;
        var isWin = betInfo.isWin();
        var isEqual = betInfo.isEqual();
        if (isWin)
            resultSprite = new cc.Sprite("#animation_win.png");
        else if (isEqual)
            resultSprite = new cc.Sprite("#animation_equal.png");
        else
            resultSprite = new cc.Sprite("#animation_lost.png");

        if (isWin) {
            resultSprite.setAnchorPoint(ANCHOR_BOTTOM);
            var pos = betView.getPosAtAncestor(TradingHallLayer.instance, ANCHOR_TOP);
            resultSprite.setPosition(pos);
            resultSprite.setPositionYAdd(12);
            //播放 win声音
            MainController.playEffect("result_win.mp3");
        }
        else if (isEqual) {
            resultSprite.setAnchorPoint(ANCHOR_RIGHT);
            var pos = betView.getPosAtAncestor(TradingHallLayer.instance, ANCHOR_LEFT);
            resultSprite.setPosition(pos);
            resultSprite.setPositionYAdd(-12);
            MainController.playEffect("result_win.mp3");
        }
        else {
            resultSprite.setAnchorPoint(ANCHOR_TOP);
            var pos = betView.getPosAtAncestor(TradingHallLayer.instance, ANCHOR_BOTTOM);
            resultSprite.setPosition(pos);
            resultSprite.setPositionYAdd(-12);
            MainController.playEffect("result_lost.mp3");
        }

        resultSprite.setScale(0, 0);
        var originPos = resultSprite.getPosition();
        var moveToPos = cc.p(originPos.x, originPos.y + 15);
        if (!isWin)
            moveToPos = cc.p(originPos.x, originPos.y - 15);

        var countMoney = betInfo.getEarnAmount();
        TradingHallLayer.instance.addAnimationNode(resultSprite);

        cc.log("准备执行 win lost 动画 startPos:", JSON.stringify(startPos));
        resultSprite.runAction(new cc.Sequence(
            new cc.Spawn(
                new cc.ScaleTo(0.25, 1.1, 1.1),
                new cc.MoveTo(0.35, moveToPos)
            ),
            new cc.DelayTime(0.8),
            new cc.FadeOut(0.2),
            new cc.RemoveSelf(),
            new cc.CallFunc(function () {
                    if(countMoney <= 0 || !TradingHallLayer.instance)
                        return;
                    var addCoinText = new ccui.TextAtlas("+"+countMoney, "annimation_number_golden.png", 19, 26, "+");
                    TradingHallLayer.instance.addAnimationNode(addCoinText);
                    try{
                        addCoinText.setPosition(startPos.x, startPos.y + 15);
                        addCoinText.runAction(new cc.Sequence(
                            new cc.MoveTo(0.8, startPos.x, startPos.y + 45),
                            new cc.FadeOut(0.25),
                            new cc.RemoveSelf()
                        ));
                    }catch (e){
                        if(isTestServer){
                            G_collectLog(e.stack);
                            testSeverLog("盈利动画"+e.name + ": " + e.message);
                        }
                    }finally{
                        if(addCoinText && addCoinText.getParent())
                            addCoinText.removeFromParent();
                    }
                }.bind(this)
            )));
    }
});


