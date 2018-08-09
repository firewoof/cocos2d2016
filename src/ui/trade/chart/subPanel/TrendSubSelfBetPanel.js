/**
 * 交易大厅--下单区--(涨跌式)订单层
 * Created by 玲英 on 2016/11/17.
 */
var TrendSubSelfBetPanel = cc.Node.extend({

    ctor:function(size)
    {
        this._super();
        this._betArray = [];
        this._betViewArray = [];

        this.initUI();

        this.setContentSize(size);

        this.addListener();
    },

    cleanup:function()
    {
        cc.log("TrendSubSelfBetPanel cleanup");
        this.removeAllCustomListeners();
        this._super();
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
            if(ProductInfo.OPTION_TYPE_TOUCH == betInfo.getOptionType())
                return;
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
            if(ProductInfo.OPTION_TYPE_TOUCH == betInfo.getOptionType()) {
                return;
            }
            if(betInfo.isSimulateTrade() == GB.isSimulateTrade && curProductInfo.getId() == betInfo.getProductId()) {
                cc.log("new betInfo::", betInfo.getOrderId());
                //var newBetView = new BetView(betInfo, this._formulas.timeScale);
                //this._betPanel.addChild(newBetView);
                //newBetView.setPositionX(-100);
                //this._betViewArray.push(newBetView);
                //this._betArray.push(betInfo);
                //cc.log("push...");
                this.addBetInfo(betInfo);
            }
        }.bind(this));

        this._perOneSecondListener = cc.eventManager.addCustomListener(NOTIFY_PER_ONE_SECOND, function()
        {
            this.checkSettleStatus();
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

        if(productInfo.getOptionType() != ProductInfo.OPTION_TYPE_NORMAL){
            this.setVisible(false);
            return;
        }
        this.setVisible(true);

        //重建所有订单
        this.reBuild();
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

        cc.log("selfBetPanel reBuild......");
        cc.log("GB.isSimulateTrade::", GB.isSimulateTrade);
        //重新加载未结算订单
        var betInfoArray = this.getUnOverOrders(GB.isSimulateTrade);
        cc.log("涨跌式未结算订单:: betInfoArray:: ", betInfoArray.length);
        //重建
        for(var i = 0; i < betInfoArray.length; i++)
        {
            this.addBetInfo(betInfoArray[i]);
        }
    },

    addBetInfo:function(betInfo)
    {
        this.genBetView(betInfo);
        this._betArray.push(betInfo);
    },

    /**
     * 新增获取头像
     * @returns {T}
     */
    genBetView:function(betInfo)
    {
        var betView = this.getNotUsingBetView();
        if(!betView){
            cc.log("---new BetView normal");
            betView = new BetView();
            this.addChild(betView);
            this._betViewArray.push(betView);
            cc.log("---add betView finished normal");
        }
        //重置数据
        betView.refresh(betInfo);
        betView.setVisible(true);
        betView.setPositionX(-200);
        betView._isUsing = true;
        return betView;
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
     *
     */
    refresh:function()
    {
        var player = Player.getInstance();
        var lineData = player.getCurLineData();
        var productInfo = lineData.getProductInfo();
        if(!lineData)
            return;

        if(productInfo.getOptionType() != ProductInfo.OPTION_TYPE_NORMAL) {
            this.setVisible(false);
            return;
        }
        this.setVisible(true);
        this._betArrow.setVisible(false);

        //最老的未结算订单
        var betViewArray = this._betViewArray;

        for(var i = 0; i < betViewArray.length; i++)
        {
            var betView = betViewArray[i];
            if(!betView._isUsing)
                continue;
            var betInfo = betView.getBetInfo();
            if(!betInfo || betInfo.isSettled())
            {
                this.cycleBetView(betView);
                continue;
            }

            var dataIndex = lineData.getIndexByTime(betInfo.getBetTime());
            var sampleData = lineData.getDataArray()[dataIndex];
            if(sampleData) {
                var xPos = this._formulas.getXPosByValue(sampleData.getXValue());
                var yPos = this._formulas.getYPosByValue(sampleData.getYValue());
                betView.setPosition(this.limitPos(cc.p(xPos, yPos)));
            }else{
                var xPos = 0;
                var yPos = this._formulas.getYPosByValue(betInfo.getBetQuotePrice());
                betView.setPosition(this.limitPos(cc.p(xPos, yPos)));
            }

            if(TradingHallLayer.instance.getBeSelectedBetInfo() == betInfo){
                this._betArrow.setVisible(true);
                this._betArrow.setPosition(cc.pAdd(betView.getPosition(), cc.p(13, 7)));
            }
        }

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
        if(pos.y > (this - minGap)){
            pos.y = this - minGap;
        }
        return pos;
    },

    /**
     * 得到最老的未过期订单
     */
    getOldestUnOverOrder:function()
    {
        var betArray = this._betArray;
        var curSecs = cs.getCurSecs();
        for(var i = 0; i < betArray.length; i++) {
            var betInfo = betArray[i];
            var settleTime = betInfo.getTradeSettleTime();
            if(settleTime > 0 && settleTime >= curSecs){
                return betInfo;
            }
        }
    },

    /**
     * 得到最近将要结算的订单
     */
    getLatestToBeSettledOrder:function()
    {
        var betArray = this._betArray;
        var curSecs = cs.getCurSecs();
        var curBetInfo = null;
        for(var i = 0; i < betArray.length; i++) {
            var betInfo = betArray[i];
            var settleTime = betInfo.getTradeSettleTime();
            if(settleTime > 0 && settleTime >= curSecs){
                if(curBetInfo && settleTime > curBetInfo.getTradeSettleTime()){
                    continue;
                }
                curBetInfo = betInfo;
            }
        }
        return curBetInfo;
    },

    /**
     * 拿到还未到达结算的订单
     * @param productId
     * @param isSimulate
     * @returns {Array}
     */
    getUnOverOrders:function(isSimulate)
    {
        var orders = [];
        var player = Player.getInstance();
        var productInfo = player.getCurProductInfo();
        if(!productInfo){
            cc.log("player.getCurProductInfo is undefined");
            return orders;
        }

        var productId = productInfo.getId();
        var curSecs = cs.getCurSecs();
        var betArray = isSimulate == true ? player.getCurDaySmBetArray() : player.getCurDayBetArray();
        for(var i = 0; i < betArray.length; i++)
        {
            var betInfo = betArray[i];
            if(betInfo.getProductId() == productId){
                var settleTime =  betInfo.getTradeSettleTime();
                if(settleTime > 0 && settleTime > curSecs){
                    //player上的订单队列 最新在index=0头部位置 而不是末尾，这里取出来的时候倒过来 保证最新的在末尾
                    orders.unshift(betInfo);
                }
            }
        }
        return orders;
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
            //cc.log("tempBetInfo::", tempBetInfo.getOrderId());
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

        //回收(不会移除)
        //this.cycleBetView(betView);

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

        TradingHallLayer.instance.addAnimationNode(resultSprite);
        var countMoney = betInfo.getEarnAmount();
        cc.log("准备执行 win lost 动画");
        resultSprite.runAction(new cc.Sequence(
            new cc.Spawn(
                new cc.ScaleTo(0.25, 1.1, 1.1),
                new cc.MoveTo(0.35, moveToPos)
            ),
            new cc.DelayTime(0.8),
            new cc.FadeOut(0.2),
            new cc.RemoveSelf(),
            new cc.CallFunc(function () {
                    if(countMoney > 0){
                        var addCoinText = new ccui.TextAtlas("+"+countMoney, "annimation_number_golden.png", 19, 26, "+");
                        if(TradingHallLayer.instance) {
                            TradingHallLayer.instance.addAnimationNode(addCoinText);
                            addCoinText.setPosition(startPos.x, startPos.y + 15);
                            addCoinText.runAction(new cc.Sequence(
                                new cc.MoveTo(0.8, startPos.x, startPos.y + 45),
                                new cc.FadeOut(0.25),
                                new cc.RemoveSelf()
                            ));
                        }
                    }

                    //从队列缓存里移除掉
                    //this.removeBet(betInfo.getOrderId(), true);
                }.bind(this)
            )));
    },

    /**
     * 检查结算状态(某些情况可能导致推送结算错过了，这里要检查再http请求下来)
     */
    checkSettleStatus:function()
    {
        //一次检查一单
        var betArray = this._betArray;
        if(betArray.length == 0)
            return;

        //请求间隔5秒
        var curSecs = cs.getCurSecs();
        if(curSecs % 5 != 0)
            return;

        for(var i = betArray.length - 1; i >= 0 ; i--) {
            var betInfo = betArray[i];
            var settleTime = betInfo.getTradeSettleTime();
            if(settleTime == 0)
                continue;
            var diff = (curSecs - settleTime);
            if(!betInfo.isSettled() && diff > 5 && diff < 60){
                //一次只检查一单 先
                this.requestResult(betInfo);
                break;
            }
        }
    },

    /**
     * http方式请求结算结果
     * @param betInfo
     */
    requestResult:function(betInfo)
    {
        var productId = betInfo.getProductId();
        var requestData = {
            "auth":{
                "pid": productId,
                "orderIds":betInfo.getOrderId()
            }
        };

        if(betInfo.isRequesting())
        {
            cc.log("上次结算还未返回...return");
            return;
        }

        var responseCallBack = function(jsonData) {
            //
            var countList = jsonData["countList"];
            betInfo.setIsRequesting(false);
            if(countList.length == 0)
            {
                cc.log("========================结算返回为空=====");
                return;
            }
            //这里返回只有一单
            var betData = countList[0];
            betInfo.initFromJson(betData);

            //执行结算动画
            this.actionResult(betInfo);
        }.bind(this);

        //设置
        betInfo.setIsRequesting(true);

        if(isTestServer){
            var productInfo = Player.getInstance().getProductById(productId);
            MainController.showAutoDisappearAlertByText("主动请求结算: pro::"+productInfo.getName()
            + "  下单时间: "+TimeHelper.formatSecs(betInfo.getBetTime(),"HH:mm:ss"));
        }
        cc.log("尝试请求结算::", TimeHelper.formatSecs());
        var urlKey = "tradeQuery";
        if(betInfo.isSimulateTrade())
            urlKey = "tradeTestQuery";
        HttpManager.sendRequest(urlKey, requestData, responseCallBack);
    }
});


