/**
 * Created by 玲英 on 2016/11/30.
 */
var HistoryBetPanel = cc.Node.extend({

    ctor:function(size)
    {
        this._super();
        this.setContentSize(size);

        this._betInfo = null;
        this._formulas = {};
        this._vertices = new Array(300);    //绘制的点不会超过这个数
        this._maxSampleNum = 320;

        this.initUI();
    },

    initUI:function()
    {
        var size = this.getContentSize();
        //底部详情
        var rootNode = ccs.load(res.BetDetail_json).node;
        rootNode.setContentSize(size.width, rootNode.height);
        ccui.helper.doLayout(rootNode);
        this.addChild(rootNode);

        //底部投注详情
        var betDetailPanel = this._betDetailPanel = ccui.helper.seekWidgetByName(rootNode, "betDetailPanel");
        this._betAmountValueText = ccui.helper.seekWidgetByName(rootNode, "betAmountValueText");
        this._earnValueText = ccui.helper.seekWidgetByName(rootNode, "earnValueText");
        this._betPriceValueText = ccui.helper.seekWidgetByName(rootNode, "betPriceValueText");
        this._betTimeValueText = ccui.helper.seekWidgetByName(rootNode, "betTimeValueText");
        this._oddsValueText = ccui.helper.seekWidgetByName(rootNode, "oddsValueText");
        this._settlePriceValueText = ccui.helper.seekWidgetByName(rootNode, "settlePriceValueText");
        this._typeValueText = ccui.helper.seekWidgetByName(rootNode, "typeValueText");
        this._directionValueText = ccui.helper.seekWidgetByName(rootNode, "directionValueText");
        this._betAmountValueText = ccui.helper.seekWidgetByName(rootNode, "betAmountValueText");
        this._settleTimeTitleText = ccui.helper.seekWidgetByName(rootNode, "settleTimeTitleText");
        this._settleTimeValueText = ccui.helper.seekWidgetByName(rootNode, "settleTimeValueText");

        var kLinePanel = this._kLinePanel = new cc.Node();
        this.addChild(kLinePanel);
        kLinePanel.setContentSize(size.width, size.height - rootNode.height);
        kLinePanel.setPos(leftTopInner(this), ANCHOR_LEFT_TOP);

        //drawNode
        var drawNode = this._drawNode = new cc.DrawNode();
        kLinePanel.addChild(drawNode);

        var settlePointView = this._settlePointView = new cc.Sprite("#icon_history_end.png");
        kLinePanel.addChild(settlePointView, 2);

        this._scaleYValueTexts = [];
        this._scaleYDrawNodes = [];
        //y轴个刻度线数值和虚线
        for(var i = 0; i < 4; i++)
        {
            var posY = size.height * (i+1) * 0.2;
            var scaleValueText = new ccui.Text("00", FONT_ARIAL_BOLD, 22);
            kLinePanel.addChild(scaleValueText);
            scaleValueText.setColor(cc.color(117, 120, 135));
            scaleValueText.setAnchorPoint(ANCHOR_RIGHT);
            scaleValueText.setPosition(cc.p(size.width - 5, posY));
            this._scaleYValueTexts.push(scaleValueText);

            var dottedLine = new cc.Sprite("common_the_dotted_line.png");
            dottedLine.setOpacity(205);
            dottedLine.setAnchorPoint(ANCHOR_RIGHT);
            kLinePanel.addChild(dottedLine);
            dottedLine.setPositionX((size.width - 100));
            dottedLine.setPositionY(posY);
            this._scaleYDrawNodes.push(dottedLine);
        }

        //最多n条线 以纹理来画
        var maxSegmentNum = this._maxSampleNum - 1;
        var srcName = "line.png";
        var lineArray = this._lineArray = [];
        for(var i = 0; i < maxSegmentNum; i++){
            var line = new cc.Sprite(srcName);
            //line.getTexture().setAntiAliasTexParameters();
            kLinePanel.addChild(line);
            line.setVisible(false);
            line.setAnchorPoint(ANCHOR_LEFT);
            lineArray.push(line);
        }

        //订单面板
        var betViewPanel = this._betViewPanel = new cc.Node();
        kLinePanel.addChild(betViewPanel);

        var touchLinePanel = this._touchLinePanel = new cc.Node();
        touchLinePanel.setContentSize(kLinePanel.getContentSize());
        kLinePanel.addChild(touchLinePanel);

        //觸碰線
        if (!this._topTouchLine) {
            var touchLine = this._topTouchLine = this.createTouchPanel(true);//this.createDottedLine(cs.RED);
            touchLinePanel.addChild(touchLine);
            touchLine.setPos(rightInner(touchLinePanel), ANCHOR_RIGHT);
        }
        this._topTouchLine.setPositionY(-1000);

        if (!this._bottomTouchLine) {
            var touchLine = this._bottomTouchLine = this.createTouchPanel(false);//this.createDottedLine(cs.GREEN);
            touchLinePanel.addChild(touchLine);
            touchLine.setPos(rightInner(touchLinePanel), ANCHOR_RIGHT);
            //touchLine.setPosition(rightInner(touchLinePanel));
        }
        this._bottomTouchLine.setPositionY(-1000);

        ////箭头
        //var betArrow = this._betArrow = new cc.Sprite("#animation_common_history.png");
        //this.addChild(betArrow);
        //betArrow.setAnchorPoint(ANCHOR_LEFT_BOTTOM);
        //betArrow.runAction(new cc.RepeatForever(new cc.Sequence(
        //    new cc.FadeIn(0.35),
        //    new cc.FadeOut(0.35)
        //)));
    },

    /**
     * 刷新y轴的刻度线
     * @param {Number} precise(最小精度的小数位数)
     */
    refreshYScales:function(precise)
    {
        var size = this._kLinePanel.getContentSize();
        for(var i = 0; i < this._scaleYDrawNodes.length; i++)
        {
            var text = this._scaleYValueTexts[i];
            var drawNode = this._scaleYDrawNodes[i];
            var posY = 0.2 * (i + 1) * size.height;
            //刻度对应的YValue值
            var scaleYValue = this._formulas.getYValueByPos(posY).toFixedCs(precise);
            text.setString(scaleYValue);
            //posY代表的刻度也需要适当调整,确保刻度精确对应整数个精度值
            posY = this._formulas.getYPosByValue(scaleYValue);
            drawNode.setPositionY(posY);
            text.setPositionY(posY);
        }
    },

    refreshByBetInfo:function(betInfo)
    {
        this._betInfo = betInfo;

        //重置设置
        this.reset();

        if(betInfo.isSettled()){
            //显示k线
            this.showLineChart();

            //详情
            this._betDetailPanel.setVisible(true);
            this.refreshBetDetail(betInfo);
        }
    },

    /**
     * 刷新静态线
     */
    showLineChart:function()
    {
        var betInfo = this._betInfo;
        var productId = betInfo.getProductId();
        var lineData = Player.getInstance().getLineDataById(productId);
        var productInfo = Player.getInstance().getProductById(productId);
        var betTime = betInfo.getBetTime();
        //var betTime = betInfo.getTradeBeginTime();
        var settleTime = betInfo.getTradeSettleTime();
        var settleGap = Math.max(settleTime - betTime, 60);
        //
        //往前挪动半个结算段
        var startTime = Math.ceil(betTime - settleGap * 0.5);
        var endTime = Math.ceil(betTime + settleGap + settleGap * 0.5);

        cc.log("订单历史 startTime：", TimeHelper.formatSecs(startTime), TimeHelper.formatSecs(endTime));



        var afterCallBack = this.showSettledOrder.bind(this);

        lineData.paddingWithStride(startTime, endTime, 1, [], afterCallBack);

        //TODO 这里暂时用strde = 1 往后考虑到触碰结算的间隔不可预知，需要用步长来采集
    },

    /**
     * 显示未结算的
     */
    showUnSettledOrder:function()
    {
        var betInfo = this._betInfo;

        //

    },

    refresh:function(formalus)
    {
        var curProductInfo = Player.getInstance().getCurProductInfo();
        var betInfo = this._betInfo;
        //var betArrow = this._betArrow;
        if(!betInfo || curProductInfo.getId() != betInfo.getProductId()){
            //cc.log("betInfo is null");
            //betArrow.setVisible(false);
            return;
        }

        //已经结算
        //var curSecs = cs.getCurSecs();
        //var settleTime = betInfo.getTradeSettleTime();
        //if(betInfo.isSettled() || (settleTime > 0 && settleTime < curSecs))
        //{
        //    betArrow.setVisible(false);
        //    return;
        //}

        var betRelativeData = Player.getInstance().getCurLineData().getDataByTime(betInfo.getBetTime());
        if(!betRelativeData){
            return;
        }

        //betArrow.setVisible(true);

        var posX = formalus.getXPosByValue(betRelativeData.getXValue());
        var posY = formalus.getYPosByValue(betRelativeData.getYValue());

        var pos = cc.p(posX, posY);
        //cc.log("betArrow::", JSON.stringify(pos));

        ////调整
        //pos.y = pos.y + 13;
        //pos.x = pos.x + 7;
        ////将箭头指向下单点
        //betArrow.setPosition(this.limitPos(pos));
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
        return pos;
    },

    /**
     *
     */
    showSettledOrder:function(){
        var betInfo = this._betInfo;
        if(!betInfo){
            return;
        }

        //显示结算结果
        this._kLinePanel.setVisible(true);

        var productId = betInfo.getProductId();
        var lineData = Player.getInstance().getLineDataById(productId);
        var betTime = betInfo.getTradeBeginTime();
        var settleTime = betInfo.getTradeSettleTime();
        var settleGap = Math.max(settleTime - betTime, 60);

        //往前挪动半个结算段
        var startTime = Math.ceil(betTime - settleGap * 0.5);
        var endTime = Math.ceil(betTime + settleGap + settleGap * 0.5);
        var timeScale = endTime - startTime;

        var startIndex = lineData.getIndexByTime(startTime);
        var endIndex = lineData.getIndexByTime(endTime);
        var stride = Math.ceil((endTime - startTime)/ this._maxSampleNum);
        cc.log("history stride::", stride);

        if(startIndex >= endIndex)
            return;

        var importantTimeArray = [];
        var args = {};
        args["lineData"] = lineData;
        args["startIndex"] = startIndex;
        args["endIndex"] = endIndex;                      //
        args["stride"] = stride;
        args["timeScale"] = timeScale;
        args["importantTimeArray"] = importantTimeArray;

        //投注点不可忽略
        importantTimeArray.push(betTime);
        if(betInfo.isSettled()){
            importantTimeArray.push(betInfo.getTradeSettleTime());
        }

        //刷新K线
        this.refreshLineChart(args);

        ////将下单点放上去
        var betView = new BetView(betInfo);
        this._betViewPanel.addChild(betView);

        //是否触碰式期权订单
        var isTouchOption = betInfo.isTouchOption();

        //结算连线
        if(!isTouchOption){
            var lineWidth = (betInfo.getTradeSettleTime() - betInfo.getTradeBeginTime()) / timeScale * this.width;
            var color = betInfo.isBullish() ? cs.RED : cs.GREEN;
            var horizontalLine = new cc.LayerColor(color);
            horizontalLine.setContentSize(lineWidth, 2);
            betView.addChild(horizontalLine, -1);
            horizontalLine.setPos(centerInner(betView), ANCHOR_LEFT);
        }

        var betPrice = betInfo.getBetQuotePrice();
        var settlePrice = betInfo.getSettleQuotePrice();
        cc.log("订单历史，下单时间::", TimeHelper.formatSecs(betTime));
        cc.log("订单历史，下单行情价位::", betPrice);
        var pos = cc.p(this._formulas.getXPosByValue(betTime), this._formulas.getYPosByValue(betPrice));

        cc.log("betView pos::", JSON.stringify(pos));
        cc.log("betInfo.isTouchOption:: ", betInfo.isTouchOption());
        betView.setPosition(pos);

        //把结算点也显示出来
        var settleLine = this.generateSettleLine();
        if(betInfo.isTouchOption()){
            settleLine.setVisible(false);
        }else{
            settleLine.setVisible(true);
            settleLine.refreshWithBetInfo(betInfo, this._formulas.getXPosByValue(settleTime));
        }

        cc.log("settleLine.isVisible: ", settleLine.isVisible());
        //var settleData = lineData.getDataByTime(betInfo.getTradeSettleTime());   //结算点的行情
        //if(settleData) {
        //    var settlePos = cc.p(this._formulas.getXPosByValue(settleData.getXValue()), this._formulas.getYPosByValue(settleData.getYValue()));
        //    this._settlePointView.setPosition(settlePos);
        //    cc.log("订单历史，结算行情价位::", settleData.getYValue());
        //}
        if(betInfo.isSettled()){
            var settlePos = cc.p(this._formulas.getXPosByValue(settleTime), this._formulas.getYPosByValue(settlePrice));
            this._settlePointView.setPosition(settlePos);
        }

        //显示下单详情
        var betTip = new BetTip(betInfo, Player.getInstance().getNickName());
        this._betViewPanel.addChild(betTip, 999);
        betTip.setPosition(betView.getPosition());
        betTip.setPositionYAdd(13);

        //显示下方订单详情
        this.refreshBetDetail(betInfo);

        //显示触碰线
        this.showTouchLine(betInfo);

        cc.log("下单历史表达时间段::", TimeHelper.formatSecs(startTime), TimeHelper.formatSecs(endTime));
    },

    /**
     * 刷新顶部提示
     */
    refreshBetDetail:function(betInfo) {
        var productInfo = Player.getInstance().getProductById(betInfo.getProductId());
        var precise = productInfo.getPrecise();
        cc.log("productInfo.getName()::", productInfo.getName());

        this._betAmountValueText.setString(MONEY_SIGN + betInfo.getBetAmount());
        this._earnValueText.setString(MONEY_SIGN + betInfo.getEarnAmount());
        this._betPriceValueText.setString(betInfo.getBetQuotePrice().toFixedCs(precise));
        this._betTimeValueText.setString(TimeHelper.formatSecs(betInfo.getBetTime(), "HH:mm:ss"));
        this._oddsValueText.setString((100 * betInfo.getOdds()).toFixedCs(0) + "%");
        this._settlePriceValueText.setString(betInfo.getSettleQuotePrice().toFixedCs(precise));
        this._typeValueText.setString(productInfo.getName());
        this._directionValueText.setString(betInfo.isBullish() ? LocalString.getString("BULLISH") : LocalString.getString("BEARISH"));

        if(betInfo.isSettled()){
            this._settleTimeValueText.setString(TimeHelper.formatSecs(betInfo.getTradeSettleTime(), "HH:mm:ss"));
        }else{
            this._settleTimeValueText.setString("--:--:--");
        }
    },

    /**
     * 根据下单 生成结算线（包括时钟）
     * @param {*}  [bgPanel]
     */
    generateSettleLine:function()
    {
        if(this._settlementLine)
            return this._settlementLine;

        //交易结算点
        var settlementView = new cc.Sprite("#icon_common_end.png");
        //时针分针
        var secondHandSprite = new cc.Sprite("#icon_common_end_1.png");
        secondHandSprite.setAnchorPoint(ANCHOR_LEFT);
        settlementView.addChild(secondHandSprite);
        secondHandSprite.setPosition(centerInner(settlementView));

        //结算红线
        var verticalLine = new cc.LayerColor(cs.RED, 2, this.height - this._betDetailPanel.height - settlementView.height - 30);
        //verticalLine.setScaleY(880 / verticalLine.height);
        //settlementLine.setColor(cs.RED);
        settlementView.addChild(verticalLine, -1);
        verticalLine.setPos(topInner(settlementView), ANCHOR_BOTTOM);
        verticalLine.setPositionYAdd(-10);

        //结算时间
        var settleText = new ccui.Text(" ", FONT_ARIAL_BOLD, 22);
        settleText.setColor(cc.color(225, 210, 49));

        var settlementPanel  = this._settlementLine = UICommon.createPanelAlignWidgetsWithPadding(5, cc.UI_ALIGNMENT_VERTICAL_CENTER, settlementView, settleText);

        //add到哪个面板上
        this.addChild(settlementPanel);


        settlementPanel.setAnchorPoint(ANCHOR_BOTTOM);

        //尽量跟x轴刻度统一高度
        settlementPanel.setPositionYAdd(150);
        settlementPanel.setPositionX(-1000);

        //附带引用
        settlementPanel._settleText = settleText;

        //betInfo xPos都可能为空，当只需要刷curSecs时
        settlementPanel.refreshWithBetInfo = function(betInfo, xPos, curSecs, isShowLine)
        {
            var betInfo = this._betInfo = betInfo || this._betInfo;
            if(xPos)
                this.setPositionX(xPos);
            var counterStr = "";
            //判断显示倒计时 还是 结算时间
            if(betInfo) {
                if(curSecs != undefined)
                {
                    var counter = betInfo.getTradeSettleTime() - curSecs;
                    counterStr = counter <= 0 ? "结算中.." : counter + "s";
                }else{
                    counterStr = TimeHelper.formatSecs(betInfo.getTradeSettleTime(), "HH:mm:ss");
                }
            }
            this._settleText.setString(counterStr);
            verticalLine.setVisible(true);
            if(isShowLine == false){
                verticalLine.setVisible(false);
            }
        };

        return settlementPanel
    },

    reset:function()
    {
        var drawNode = this._drawNode;
        if(drawNode){
            drawNode.removeFromParent();
            this._drawNode = null;
        }
        var drawNode = this._drawNode = new cc.DrawNode();
        this._kLinePanel.addChild(drawNode, -1);
        this._kLinePanel.setVisible(false);
        this._betDetailPanel.setVisible(false);
        //this._betArrow.setVisible(false);

        if(this._settlementLine) this._settlementLine.setVisible(false);

        //订单面板清理
        this._betViewPanel.removeAllChildren();
        //復位觸碰線
        this._topTouchLine.setPositionY(-1000);
        this._bottomTouchLine.setPositionY(-1000);
    },

    /**
     * 刷新走势线
     * 谨记这里的原则，所有参数不跟tradeStageInfo相关，保持绘制的独立性 不耦合
     */
    refreshLineChart:function(args)
    {
        var lineData = args["lineData"];                      //数据队列
        var startIndex = args["startIndex"];
        var endIndex = args["endIndex"];                        //
        var stride = args["stride"];                            //采集步长
        var timeScale = args["timeScale"];                      //当前画布x轴方向数据[start-end]所表达的总时间尺度
        var importantTimeArray = args["importantTimeArray"];    //重要的时间点(这些点的绘制不容忽略)
        var contentSize = args["contentSize"];
        args["formulas"] = this._formulas;
        args["contentSize"] = this._kLinePanel.getContentSize();
        args["vertices"] = this._vertices;

        var fillColor = cc.color(100, 114, 140, 70);
        var drawNode = this._drawNode;

        //得到绘制数据
        DrawLineHelper.getDrawLineData(args);
        var vertices = args["vertices"];
        var verticesCount = args["verticesCount"];

        ////记住画的最后一个点
        this._lastDrawPoint = vertices[verticesCount - 1];

        var poygonY = 0;   //k线填充，底部需要留适当空白 note：最新版不留了,设为0
        var color = cc.color(0, 0, 0, 0);
        var fourVertices = new Array(4);
        //polygon填充， 拆分n个四边形
        for(var i = 1; i < verticesCount; i++)
        {
            var secondPoint = vertices[i - 1];
            var thirdPoint = vertices[i];
            if(!secondPoint.y || !thirdPoint.y)
                return;
            fourVertices[0] = cc.p(secondPoint.x, poygonY);
            fourVertices[1] = secondPoint;
            fourVertices[2] = cc.p(thirdPoint.x, thirdPoint.y);
            fourVertices[3] = cc.p(thirdPoint.x, poygonY);

            drawNode.drawPoly(fourVertices, fillColor, 1, color);
        }

        //外框线
        var lineArray = this._lineArray;
        var len = lineArray.length;
        for(var i = 0; i < len; i++) {
            var fromPos = vertices[i];
            var toPos = vertices[i+1];
            var line = lineArray[i];
            //if((i+2) > verticesCount || !fromPos || !toPos)
            //{
            //    line.setVisible(false);
            //}
            line.setVisible(false);
            if((i+1) < verticesCount && fromPos && toPos){
                line.setVisible(true);
                line.lineTo(fromPos, toPos);
            }
        }


        //y轴刻度
        this.refreshYScales(lineData.getProductInfo().getPrecise());
    },

    /**
     * 显示止盈止损线
     */
    showTouchLine:function(betInfo) {
        this._topTouchLine.setPositionY(-1000);
        this._bottomTouchLine.setPositionY(-1000);
        if(betInfo.getOptionType() != ProductInfo.OPTION_TYPE_TOUCH){
            return;
        }

        //位置
        var betPrice = betInfo.getBetQuotePrice();
        var touchOffset = betInfo.getTouchOffset();
        var profitOnlyPrice = betPrice + touchOffset;
        var stopLossPrice = betPrice - touchOffset;

        cc.log("betPrice::", betPrice);
        cc.log("touchOffset::", touchOffset);

        var profitOnlyPosY = this._formulas.getYPosByValue(profitOnlyPrice);
        var stopLossPosY = this._formulas.getYPosByValue(stopLossPrice);

        cc.log("profitOnlyPosY::", profitOnlyPosY);
        cc.log("stopLossPosY::", stopLossPosY);

        this._topTouchLine.setPositionY(this.limitPosY(profitOnlyPosY));
        this._bottomTouchLine.setPositionY(this.limitPosY(stopLossPosY));
        if(betInfo.isBullish()){
            this._topTouchLine.setIsProfitOnly(true);
            this._bottomTouchLine.setIsProfitOnly(false);
        }else{
            this._topTouchLine.setIsProfitOnly(false);
            this._bottomTouchLine.setIsProfitOnly(true);
        }
    },

    limitPosY:function(posY)
    {
        //防止线超出屏幕
        var gap = 15;
        if(posY > (this._kLinePanel.height - gap)){
            posY = this._kLinePanel.height - gap;
        }
        if(posY < gap){
            posY = gap;
        }
        return posY;
    },

    createTouchPanel:function(isBullish)
    {
        var bgSrc = "common_target_profit_bg.png";
        var name = LocalString.getString("TOUCH_PROFIT_ONLY");   //止盈
        var solidLineSrc = "common_the_line_red.png";
        if(!isBullish){
            solidLineSrc = "common_the_line_green.png";
            bgSrc = "common_stop_bg.png";
            name = LocalString.getString("TOUCH_STOP_LOSS");     //止损
        }

        var nameLabel = new cc.LabelTTF(name, FONT_ARIAL_BOLD, 24);

        //看涨触碰cursorPanel
        var panelSize = cc.size(78, 43);
        var cursorPanel = cc.Node();
        cursorPanel.setContentSize(panelSize);
        cursorPanel.setAnchorPoint(ANCHOR_RIGHT);

        //实线
        var solidLine = new cc.Sprite(solidLineSrc);
        cursorPanel.addChild(solidLine);
        solidLine.setPos(rightInner(cursorPanel), ANCHOR_RIGHT);

        //
        var bgSprite = new cc.Scale9Sprite(bgSrc);
        bgSprite.setInsetRight(5);
        bgSprite.setInsetLeft(25);
        bgSprite.setInsetBottom(0);
        bgSprite.setInsetTop(0);
        bgSprite.setContentSize(panelSize);

        bgSprite.addChild(nameLabel);
        nameLabel.setPos(centerInner(bgSprite));
        nameLabel.setPositionXAdd(8);

        cursorPanel.addChild(bgSprite);
        bgSprite.setPos(rightInner(cursorPanel), ANCHOR_RIGHT);

        //显示成虚线
        cursorPanel.showSolidLine = function(isShow)
        {
            isShow = isShow == undefined ? true : false;
            bgSprite.setVisible(isShow);
            //实心线
            if (isShow)
            {
                solidLine.setVisible(true);
                //dottedLine.setVisible(false);
            }
            else
            {
                solidLine.setVisible(false);
                //dottedLine.setVisible(true);
            }
        }.bind(this);

        //止盈
        cursorPanel.setIsProfitOnly = function(isProfitOnly)
        {
            if(isProfitOnly)
                nameLabel.setString(LocalString.getString("TOUCH_PROFIT_ONLY"));
            else
                nameLabel.setString(LocalString.getString("TOUCH_STOP_LOSS"));
        }.bind(this);

        return cursorPanel;
    }
});