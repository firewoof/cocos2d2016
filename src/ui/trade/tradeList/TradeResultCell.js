/**
 * 结算列表项
 * Created by 玲英 on 2016/6/24.
 */
var TradeResultCell = ccui.Layout.extend({
    _betInfo:undefined,
    _isStopListenerCounter:3,
    _delaySettleTime:2,

    /**
     * @param {BetInfo} [betInfo]
     */
    ctor:function(betInfo)
    {
        this._super();
        this.setContentSize(cc.size(274, 80));
        this._interval = 0;

        this.MAX_QUERY_TIMES = 3;
        //如果拿不到结算结果,最多请求几次(n次之后，不再查询结果)
        this._isStopListenerCounter = this.MAX_QUERY_TIMES;
        //到点后延迟几秒去查结果
        this._delaySettleTime = 3;  //

        this.initUI();

        //带了行情数据则立即刷一次 包括倒计时
        if(betInfo)
        {
            this.refresh(betInfo);
        }

        this.addListener();
    },

    addListener:function()
    {
        this._perOneSecondListener = cc.eventManager.addCustomListener(NOTIFY_PER_ONE_SECOND, function()
        {
            var curSecs = cs.getCurSecs();
            //还没结算的
            if(!this._betInfo.isSettled() && this._isStopListenerCounter > 0)
            {
                this.refreshChanges();
            }
            ////触碰版(防止漏结算 n 秒请求一次）
            //if(curSecs % 30 == 0 && this._betInfo.isTouchOption() && !this._betInfo.isSettled()) {
            //    this.doRequest();
            //    return;
            //}
        }.bind(this));

        this._orderCountListner =  cc.eventManager.addCustomListener(NOTIFY_ORDER_COUNT, function(event)
        {
            var betInfo = event.getUserData();
            var curBetInfo = this._betInfo;
            if(betInfo.isSimulateTrade() === curBetInfo.isSimulateTrade() && betInfo.getOrderId() == curBetInfo.getOrderId()){
                this.refresh();

                if(this.isHighlighted())
                {
                    this.setHighlight(false);
                }
            }
        }.bind(this));
    },

    cleanup:function()
    {
        //cc.log("clean up TradeResultCell");
        this.removeAllCustomListeners();
        this._perOneSecondListener = null;
        this._super();
    },

    setHighlight:function(isHighLight)
    {
        var isHighlight = isHighLight == undefined ? true : isHighLight;
        this._highlighSprite.setVisible(isHighlight);
    },

    isHighlighted:function()
    {
        return this._highlighSprite.isVisible();
    },

    getBetInfo:function() {
        return this._betInfo;
    },

    initUI:function()
    {
        var loadingBarBgPanel = new cc.Sprite("#icon_counter_1.png");
        this.addChild(loadingBarBgPanel);
        loadingBarBgPanel.setPos(leftInner(this), ANCHOR_LEFT);
        loadingBarBgPanel.setPositionXAdd(4);

        //fan-shaped progress
        var progressSprite = new cc.Sprite("#icon_counter_2.png");
        var progressTimer = this._progressTimer = new cc.ProgressTimer(progressSprite);
        loadingBarBgPanel.addChild(progressTimer);
        progressTimer.setPosition(centerInner(loadingBarBgPanel));
        progressTimer.setType(cc.ProgressTimer.TYPE_RADIAL);
        progressTimer.setPercentage(100);
        progressTimer.setReverseDirection(true);

        //trade end countDown
        var countDownText = this._countDownText = new cc.LabelTTF("", FONT_ARIAL_BOLD, 20);
        countDownText.setColor(cc.BLACK);
        loadingBarBgPanel.addChild(countDownText, 1);
        countDownText.setPos(centerInner(loadingBarBgPanel), ANCHOR_CENTER);

        //赢标志
        var winBgSprite = this._winBgSprite = new cc.Sprite("icon_win.png");
        winBgSprite.setScale(1.05);
        //winBgSprite.getTexture().setAliasTexParameters();
        loadingBarBgPanel.addChild(winBgSprite);
        winBgSprite.setPos(centerOutter(progressTimer));
        winBgSprite.setVisible(false);
        var winText = new ccui.Text(LocalString.getString("RESULT_SIN_WIN"), FONT_ARIAL_BOLD, 24);
        winText.setColor(cc.color(225, 211, 49));
        winBgSprite.addChild(winText);
        winText.setPos(centerInner(winBgSprite));

        //输标志
        var lostBgSprite = this._lostBgSprite = new cc.Sprite("icon_lose.png");
        lostBgSprite.setScale(1.05);
        //lostBgSprite.getTexture().setAliasTexParameters();
        loadingBarBgPanel.addChild(lostBgSprite);
        lostBgSprite.setPos(centerOutter(progressTimer));
        lostBgSprite.setVisible(false);
        var lostText = new cc.LabelTTF(LocalString.getString("RESULT_SIN_LOST"), FONT_ARIAL_BOLD, 24);
        lostText.setColor(cc.WHITE);
        lostBgSprite.addChild(lostText);
        lostText.setPos(centerInner(lostBgSprite));

        //平
        var equalBgSprite = this._equalBgSprite = new cc.Sprite("#icon_lose.png");
        loadingBarBgPanel.addChild(equalBgSprite);
        equalBgSprite.setPos(centerOutter(progressTimer));
        equalBgSprite.setVisible(false);
        var equalText = new ccui.Text(LocalString.getString("RESULT_SIN_EQUAL"), FONT_ARIAL_BOLD, 24);
        equalText.setColor(cc.WHITE);
        equalBgSprite.addChild(equalText);
        equalText.setPos(centerInner(equalBgSprite));

        //type name
        var productNameText = this._productNameText = new cc.LabelTTF("产品/名称", FONT_ARIAL_BOLD, 22);
        productNameText.setAnchorPoint(ANCHOR_LEFT);

        var betTimeText = this._betTimeText = new cc.LabelTTF("00:00:00", FONT_ARIAL_BOLD, 16);
        betTimeText.setAnchorPoint(ANCHOR_LEFT);
        betTimeText.setColor(cc.color(160, 160, 160));

        ////方便查看 加个订单号
        //var orderIdText = this._orderIdText = new ccui.Text("00", FONT_ARIAL_BOLD, 14);
        //orderIdText.setColor(cc.color(160, 160, 160));

        //品种跟时间垂直组合
        var namePanel = UICommon.createPanelAlignWidgetsWithPadding(2, cc.UI_ALIGNMENT_VERTICAL_LEFT, productNameText, betTimeText);
        this.addChild(namePanel);
        namePanel.setPos(rightOutter(loadingBarBgPanel), ANCHOR_LEFT);
        namePanel.setPositionXAdd(5);
        betTimeText.setPositionXAdd(2);

        //看涨
        var estimateMarkCall = this._estimateMarkCall = new cc.Sprite("icon_position_rise.png");
        this.addChild(estimateMarkCall);
        estimateMarkCall.setPos(rightTopOutter(namePanel), ANCHOR_LEFT_TOP);
        estimateMarkCall.setPositionXAdd(5);
        estimateMarkCall.setPositionYAdd(-2);
        estimateMarkCall.setVisible(false);

        //看跌
        var estimateMarkPut = this._estimateMarkPut = new cc.Sprite("icon_position_fall.png");
        this.addChild(estimateMarkPut);
        estimateMarkPut.setPosition(estimateMarkCall.getPosition());
        estimateMarkPut.setVisible(false);

        //预期收益/
        var totalIncomeText = this._totalIncomeText = new cc.LabelTTF("00.00", FONT_ARIAL_BOLD, 22);
        totalIncomeText.setAnchorPoint(1, 0.5);

        ////投注额
        var betAmountText = this._betAmountText = new cc.LabelTTF("00.00", FONT_ARIAL_BOLD, 16);
        betAmountText.setColor(cc.color(160, 160, 160));
        betAmountText.setAnchorPoint(1, 0.5);

        var amountPanel = UICommon.createPanelAlignWidgetsWithPadding(0, cc.UI_ALIGNMENT_VERTICAL_RIGHT, totalIncomeText, betAmountText);
        this.addChild(amountPanel);
        amountPanel.setPos(rightInner(this), ANCHOR_RIGHT);
        amountPanel.setPositionXAdd(-12);

        //高亮外框
        var highlighSprite = this._highlighSprite = new cc.Scale9Sprite("bg_position_pre.png");
        highlighSprite.setContentSize(this.getContentSize());
        this.addChild(highlighSprite);
        highlighSprite.setPos(leftInner(this),ANCHOR_LEFT);
        highlighSprite.setVisible(false);
    },

    doRequest:function()
    {
        //暂时不在订单cell里来做查询了，服务器会优化推送，保证质量（现在我们在打开订单界面时查一次，作为保险）
        //var betInfo = this._betInfo;
        //var curSecs = cs.getCurSecs();
        //var queryGap = 15;
        //if(betInfo._lastQueryTime && betInfo._lastQueryTime > (curSecs - queryGap)){
        //    cc.log("查询请求间隔太短 本次忽略");
        //    return;
        //}
        //betInfo._lastQueryTime = curSecs;
        //var responseCallBack = function(jsonData) {
        //    //
        //    var countList = jsonData["countList"];
        //    if(countList.length == 0)
        //    {
        //        cc.log("========================结算返回为空=停止update====");
        //        this._isStopListenerCounter -= 1;
        //        //cc.eventManager.removeListener(this._perOneSecondListener);
        //        return;
        //    }
        //    var betData = countList[0];
        //    var orderId = betData["orderId"];
        //    if(orderId == betInfo.getOrderId()){
        //        betInfo.initFromJson(betData);
        //        //通知结算
        //        cc.eventManager.dispatchCustomEvent(NOTIFY_ORDER_COUNT, betInfo);
        //
        //        this.refresh();
        //    }
        //}.bind(this);
        //
        //cc.log("我的交易订单项 尝试请求结算::", TimeHelper.formatSecs());
        //HttpManager.requestQueryOrder(responseCallBack, betInfo.isSimulateTrade(), betInfo.getOrderId());
    },

    /**
     * @param {BetInfo} [betInfo]
     * @param {Boolean} 默认刷新UI(方便给tabview用， 而倒计时不需要刷新所有的UI)
     */
    refresh:function(betInfo)
    {
        var oldBetInfo = this._betInfo;
        var betInfo = this._betInfo = betInfo || this._betInfo;
        if(!betInfo)
            return;
        //重置
        if(oldBetInfo != betInfo){
            this._isStopListenerCounter = this.MAX_QUERY_TIMES;
        }

        var zeroSecs = cs.getZeroSecs();
        var betTime = betInfo.getTradeBeginTime();      //下单时间
        var betTimeStr = betTime < zeroSecs ? TimeHelper.formatSecs(betTime, "MM/dd HH:mm:ss") : TimeHelper.formatSecs(betTime, "HH:mm:ss");
        var productInfo = Player.getInstance().getProductById(betInfo.getProductId());
        var betAmount = betInfo.getBetAmount();
        var betAmountStr = betAmount >= 10000 ? (betAmount/10000).toFixedCs(2)+"w" : betAmount.toFixedCs(2);

        this._countDownText.setColor(cc.BLACK);
        this._countDownText.setFontSize(20);
        this._countDownText.setString("--");
        this._productNameText.setString(productInfo.getName());
        this._progressTimer.setPercentage(0);
        this._betAmountText.setString(betAmountStr); //投注额
        this._betTimeText.setString(betTimeStr);
        this.setBackGroundColorEx(cc.color(93, 139, 189));
        this.setBackGroundColorOpacity(55);

        //涨跌
        if(betInfo.isBullish()) {
            this._estimateMarkCall.setVisible(true);
            this._estimateMarkPut.setVisible(false);
        }
        else {
            this._estimateMarkCall.setVisible(false);
            this._estimateMarkPut.setVisible(true);
        }

        //收入
        if(!betInfo.isSettled())
        {
            this._totalIncomeText.setString("未结算");//潜在收入
        }
        else
        {
            var result = betInfo.getResult();
            var earnNum = betInfo.getEarnAmount();  //默认显示盈利额
            if(result == BetInfo.RESULT_TYPE_LOST)  //输了显示0
            {
                earnNum = 0;
            }
            else if(result == BetInfo.RESULT_TYPE_EQUAL)
            {
                earnNum = betInfo.getBetAmount();
            }
            this._totalIncomeText.setString(earnNum.toFixed(2));   //正式收入
        }

        this._winBgSprite.setVisible(false);
        this._lostBgSprite.setVisible(false);
        this._equalBgSprite.setVisible(false);

        //计时器和color
        this.refreshChanges();

        if(this._betInfo.isSettled()){
            this._countDownText.stopAllActions();
            this._countDownText.setOpacity(255);
            this._countDownText.setString("");

            //输赢
            this._countDownText.setFontSize(24);
            if(result === BetInfo.RESULT_TYPE_WIN)
            {
                this._winBgSprite.setVisible(true);
                this.setBackGroundColorEx(cc.color(217, 73, 47));
                this.setBackGroundColorOpacity(110);
            }else if(result === BetInfo.RESULT_TYPE_EQUAL)      //平了
            {
                this._equalBgSprite.setVisible(true);
                this.setBackGroundColorEx(cc.color(93, 139, 189));
                this.setBackGroundColorOpacity(55);
            }else if(result === BetInfo.RESULT_TYPE_LOST)   //输了
            {
                this._lostBgSprite.setVisible(true);
                this.setBackGroundColorEx(cc.color(60, 177, 80));   //绿色
                this.setBackGroundColorOpacity(55);
            }else{
                G_collectLog("订单历史-未知的结算结果 result:", this._betInfo.getResult());
            }
        }
    },

    /**
     *计时器和color
     */
    refreshChanges:function()
    {
        //倒计时
        this.refreshCounter();

        //
        this.changeColorByQuote();
    },

    /**
     *
     */
    changeColorByQuote:function(){
        var betInfo = this._betInfo;
        if(betInfo.getOptionType() == ProductInfo.OPTION_TYPE_TOUCH) {
            return;
        }

        //检查产品行情
        var lineData = Player.getInstance().getLineDataById(betInfo.getProductId());

        if(lineData)
        {
            var latestData = lineData.getLatestData();
            var tempResult = this.getTempResult(latestData);
            if(tempResult == BetInfo.RESULT_TYPE_WIN)
            {
                this.setBackGroundColorEx(cc.color(217, 73, 47));   //红色
                this.setBackGroundColorOpacity(110);
            }
            else if(tempResult == BetInfo.RESULT_TYPE_LOST) {
                this.setBackGroundColorEx(cc.color(60, 177, 80));   //绿色
                this.setBackGroundColorOpacity(55);
            }else {
                this.setBackGroundColorEx(cc.color(93, 139, 189));
                this.setBackGroundColorOpacity(55);
            }
        }
    },

    /**
     * 得到临时结果
     */
     getTempResult:function(latestData) {
        var betInfo = this._betInfo;
        if(betInfo.getBetQuotePrice() == latestData.getYValue())
        {
            return BetInfo.RESULT_TYPE_EQUAL;
        }
        //看涨
        if(betInfo.isBullish()){
            if(latestData.getYValue() > betInfo.getBetQuotePrice())
                return BetInfo.RESULT_TYPE_WIN;
            else
                return BetInfo.RESULT_TYPE_LOST;
        }

        if(!betInfo.isBullish()) {
            if(latestData.getYValue() > betInfo.getBetQuotePrice())
                return BetInfo.RESULT_TYPE_LOST;
            else
                return BetInfo.RESULT_TYPE_WIN;
        }
     },

    /**
     * 刷新倒计时，扇形进度条，以及可能的到点请求
     */
    refreshCounter:function()
    {
        var betInfo = this._betInfo;
        var isSettled = betInfo.isSettled();    //是否结算
        //触碰
        if(betInfo.isTouchOption()) {
            return;
        }

        var betTime = betInfo.getBetTime();
        var resultTime = betInfo.getTradeSettleTime();
        var currentTime = cs.getCurSecs();
        //if(!isSettled && currentTime >= (resultTime + this._delaySettleTime))
        //{
        //    if(!cc.sys.isMobile){
        //        MainController.getInstance().showAutoDisappearAlertByText("订单超时未结算.doRequest orderId::"+betInfo.getOrderId());
        //    }
        //    this.doRequest();
        //    return;
        //}

        if(!isSettled)
        {
            this._countDownText.setFontSize(20);
            this._countDownText.setColor(cc.BLACK);

            //倒计时
            var timePercent = (resultTime - currentTime) / (resultTime - betTime) * 100;
            this._progressTimer.setPercentage(timePercent);

            var countDownMSec = resultTime - currentTime;
            if(countDownMSec > 60 && countDownMSec < 3600)
            {
                this._countDownText.setString((countDownMSec/ 60).toFixed(0) + "m");
            }else if(countDownMSec >= 3600 && countDownMSec < 3600 * 24 ){
                this._countDownText.setString((countDownMSec/ 3600).toFixed(0) + "h");
            }else if(countDownMSec >= 3600 * 24){
                this._countDownText.setString((countDownMSec/ (3600 * 24)).toFixed(0) + "d");
            }
            else
            {
                if(countDownMSec < 0)
                    countDownMSec = 0;
                if(countDownMSec < 10)
                {
                    this._countDownText.setColor(cc.RED);
                    if(countDownMSec == 0)
                    {
                        this._countDownText.setFontSize(20);
                        this._countDownText.setString("•");
                        this._countDownText.runAction(new cc.Sequence(
                            new cc.FadeOut(0.5),
                            new cc.FadeIn(0.5),
                            new cc.CallFunc(function(target){
                               target.setString("••");
                            }),
                            new cc.FadeOut(0.5),
                            new cc.FadeIn(0.5),
                            new cc.CallFunc(function(target){
                                target.setString("•");
                            }),
                            new cc.FadeOut(0.5),
                            new cc.FadeIn(0.5),
                            new cc.CallFunc(function(target){
                                target.setString("••");
                            }),
                            new cc.FadeOut(0.5),
                            new cc.FadeIn(0.5)
                        ));
                    }else{
                        this._countDownText.setFontSize(24);
                        this._countDownText.setString(countDownMSec);
                    }
                }
                else
                {
                    this._countDownText.setString(countDownMSec + "s");
                }
            }

        }
    }
});