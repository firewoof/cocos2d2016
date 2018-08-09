/**
 * 交易大厅--下单区--触碰线
 * Created by 玲英 on 2016/11/14.
 */

var TouchLinePanel = cc.Layer.extend({
    _formulas:undefined,

    ctor:function(size)
    {
        this._super();
        this.setContentSize(size);

        this.initUI();

        TouchLinePanel.instance = this;
        this.reset();

        this.addListener();
    },

    addListener:function()
    {
        //关闭订单列表通知
        this._positionChangesListener = cc.eventManager.addCustomListener(NOTIFY_SHOW_DYNAMIC_QUOTE, function(event)
        {
            this.reset();
        }.bind(this));
    },

    cleanup:function()
    {
        this._super();
        TouchLinePanel.instance = null;
        this.removeAllCustomListeners();
    },

    initUI:function()
    {
        var panelSize = cc.size(115, 35);

        //
        //var topDottedLineSrc = "common_the_line_section.png";
        //var bottomDottedLineSrc = "common_the_line_section.png";

        //虚线
        var topDottedLine = this._topDottedLine = this.createDottedPanel(true);//new cc.Sprite(topDottedLineSrc);
        this.addChild(topDottedLine);
        topDottedLine.setPos(rightInner(this), ANCHOR_RIGHT);

        var bottomDottedLine = this._bottomDottedLine = this.createDottedPanel(false);//new cc.Sprite(bottomDottedLineSrc);
        this.addChild(bottomDottedLine);
        bottomDottedLine.setPos(rightInner(this), ANCHOR_RIGHT);

        //看涨触碰cursorPanel
        var cursorPanel = this._bullishCursorPanel = this.createTouchPanel(true);
        cursorPanel.setPositionY(-1000);
        this.addChild(cursorPanel);
        cursorPanel.setPos(rightInner(this), ANCHOR_RIGHT);

        //看跌触碰
        var cursorPanel = this._bearishCursorPanel  = this.createTouchPanel(false);
        this.addChild(cursorPanel);
        cursorPanel.setPos(rightInner(this), ANCHOR_RIGHT);
        cursorPanel.setPositionY(-1000);

        this._profitOnlyPanel = this._bullishCursorPanel;
        this._stopLossPanel = this._bearishCursorPanel;
    },

    /**
     * 虚线
     * @param isTop
     */
    createDottedPanel:function(isTop)
    {
        var bgSprite = new cc.Scale9Sprite("common_current_price_bg.png");
        bgSprite.setInsetRight(11);
        bgSprite.setInsetLeft(25);
        bgSprite.setInsetBottom(0);
        bgSprite.setInsetTop(0);
        bgSprite.setContentSize(60, 43);

        var panel = new ccui.Layout();
        panel.setContentSize(bgSprite.getContentSize());
        panel.setAnchorPoint(ANCHOR_LEFT);
        panel.addChild(bgSprite);
        bgSprite.setPos(centerInner(panel), ANCHOR_CENTER);

        var offsetText = new ccui.Text("", FONT_ARIAL_BOLD, 28);
        offsetText.setAnchorPoint(ANCHOR_CENTER);
        offsetText.setColor(isTop ? cs.RED : cs.GREEN);
        panel.addChild(offsetText);
        offsetText.setPos(centerInner(panel));

        var lineNormal = new cc.Sprite("common_the_line_section.png");
        panel.addChild(lineNormal);
        lineNormal.setAnchorPoint(ANCHOR_RIGHT);
        lineNormal.setPos(leftInner(panel), ANCHOR_RIGHT);

        var srcName = "common_the_dotted_line_green.png";
        if(isTop){
            srcName = "common_the_dotted_line_red.png";
        }
        var lineColor = new cc.Sprite(srcName);
        panel.addChild(lineColor);
        lineColor.setAnchorPoint(ANCHOR_RIGHT);
        lineColor.setPos(leftInner(panel), ANCHOR_RIGHT);
        lineColor.setVisible(false);

        panel._lineNormal = lineNormal;
        panel._lineColor = lineColor;

        panel.refreshTouchOffset = function(offsetValue)
        {
            offsetText.setString(isTop ? "+"+offsetValue : "-"+offsetValue);
        };

        panel.refreshLineColor = function(isNormal)
        {
            this._lineNormal.setVisible(isNormal);
            this._lineColor.setVisible(!isNormal);
        };

        return panel;
    },

    setFormulas:function(formulas)
    {
        this._formulas = formulas;
    },

    setBetInfo:function(betInfo)
    {
        if(!betInfo){
            this.reset();
            return;
        }
        //非触碰式订单 忽略
        if(!betInfo.isTouchOption()){
            return;
        }
        //设置
        this._betInfo = betInfo;

        this._profitOnlyPanel = this._bullishCursorPanel;
        this._stopLossPanel = this._bearishCursorPanel;
        //看跌
        if(betInfo && !betInfo.isBullish()){
            this._profitOnlyPanel = this._bearishCursorPanel;
            this._stopLossPanel = this._bullishCursorPanel;
        }

        this._profitOnlyPanel.setIsProfitOnly(true);
        this._stopLossPanel.setIsProfitOnly(false);

        this._bullishCursorPanel.showSolidLine();
        this._bearishCursorPanel.showSolidLine();

        this.refresh();
    },

    /**
     * 关联的订单
     */
    getBetInfo:function()
    {
        return this._betInfo;
    },

    /**
     * 重置
     */
    reset:function()
    {
        this._betInfo = undefined;

        this._profitOnlyPanel = this._bullishCursorPanel;
        this._stopLossPanel = this._bearishCursorPanel;

        this._bullishCursorPanel.showSolidLine(false);
        this._bearishCursorPanel.showSolidLine(false);
        this._bullishCursorPanel.setPositionY(-1000);
        this._bearishCursorPanel.setPositionY(-1000);

        this._topDottedLine.setPositionY(3000);
        this._bottomDottedLine.setPositionY(-1000);
    },

    refresh:function()
    {
        var formulas = this._formulas;
        var betInfo = this._betInfo;
        //修正触碰线 + (线本身有2像素，多两个像素防止用户错觉)
        var fixGap = 4;

        if(!this.isVisible()){
            return;
        }


        //止损和止盈 触碰范围
        var touchOffset = 0;
        //虚线一直全程显示
        if(TradingHallLayer.instance && formulas && formulas.getYPosByValue){
            touchOffset = TradingHallLayer.instance.getCurTouchOffset();
            var touchOffsetShow = TradingHallLayer.instance.getCurTouchOffsetShow();
            var curPrice = Player.getInstance().getCurLineData().getLatestData().getYValue();
            var topTouchPrice = curPrice + touchOffset;
            var bottomTouchPrice = curPrice - touchOffset;
            var topY = formulas.getYPosByValue(topTouchPrice);
            var bottomY = formulas.getYPosByValue(bottomTouchPrice);

            this._topDottedLine.refreshTouchOffset(touchOffsetShow);
            this._bottomDottedLine.refreshTouchOffset(touchOffsetShow);

            this._topDottedLine.setPositionY(this.limitPosY(topY + fixGap));
            this._bottomDottedLine.setPositionY(this.limitPosY(bottomY - fixGap));

            var touchSelfBetPanel = TradingHallLayer.instance.getTouchSelfBetPanel();
            if(touchSelfBetPanel && touchSelfBetPanel.isExistsUsingBetView()){
                this._topDottedLine.refreshLineColor(true);
                this._bottomDottedLine.refreshLineColor(true);
            }else{
                this._topDottedLine.refreshLineColor(false);
                this._bottomDottedLine.refreshLineColor(false);
            }
        }

        //已结算则重置
        if(betInfo && betInfo.isSettled()){
            this.reset();
            return;
        }
        if(!betInfo || !formulas.getYPosByValue){
            //cc.log("中断.....betInfo::", betInfo);
            return;
        }

        //var productInfo = Player.getInstance().getCurProductInfo();
        var betPrice = betInfo.getBetQuotePrice();
        touchOffset = betInfo.getTouchOffset();
        var profitOnlyPrice = betPrice + touchOffset;
        var stopLossPrice = betPrice - touchOffset;
        //看涨
        if(!betInfo.isBullish())
        {
            profitOnlyPrice = betPrice - touchOffset;
            stopLossPrice = betPrice + touchOffset;
        }


        //cc.log("profitOnlyPrice::", profitOnlyPrice);
        //cc.log("stopLossPrice::", stopLossPrice);

        var profitOnlyPosY = formulas.getYPosByValue(profitOnlyPrice);
        var stopLossPosY = formulas.getYPosByValue(stopLossPrice);

        if(profitOnlyPosY > stopLossPosY){
            profitOnlyPosY += fixGap;
            stopLossPosY -= fixGap;
        }else{
            profitOnlyPosY -= fixGap;
            stopLossPosY += fixGap;
        }

        var profitOnlyPosY  = this.limitPosY(profitOnlyPosY);
        var stopLossPosY  = this.limitPosY(stopLossPosY);

        //cc.log("profitOnlyPosY::", profitOnlyPosY);
        //cc.log("stopLossPosY::", stopLossPosY);

        //止盈
        this._profitOnlyPanel.setPositionY(profitOnlyPosY);
         //止损
        this._stopLossPanel.setPositionY(stopLossPosY);
    },

    limitPosY:function(posY)
    {
        //防止线超出屏幕
        var gap = 15;
        if(posY > (this.height - gap)){
            posY = this.height - gap;
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
        bgSprite.setVisible(false);

        bgSprite.addChild(nameLabel);
        nameLabel.setPos(centerInner(bgSprite));
        nameLabel.setPositionXAdd(8);

        cursorPanel.addChild(bgSprite);
        bgSprite.setPos(rightInner(cursorPanel), ANCHOR_RIGHT);

        //
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

        cursorPanel.setIsProfitOnly = function(isProfitOnly)
        {
            if(isProfitOnly)
                nameLabel.setString(LocalString.getString("TOUCH_PROFIT_ONLY"));
            else
                nameLabel.setString(LocalString.getString("TOUCH_STOP_LOSS"));
        }.bind(this);

        return cursorPanel;

    }
    //
    ///**
    // * 转成虚线
    // * @param drawNode
    // * @param color
    // * @returns {cc.DrawNode}
    // */
    //switchDottedLine:function(drawNode, color)
    //{
    //    drawNode.clear();
    //    var size = this.getContentSize();
    //    //虚线
    //    var segmentLen = 4;
    //    var gap = 6;
    //    var numPoints = Math.floor(size.width / (segmentLen + gap));
    //    var lineWidth = 0.5;
    //    var color = color || cc.color(160, 160, 160, 150);
    //
    //    //cc.log("numPoints:",numPoints);
    //    for(var l = 0, len = numPoints; l < len; l++) {
    //        //cc.log("from:"+ (-l * (segmentLen + gap)) + "  to:"+ (-l * (segmentLen + gap) - segmentLen));
    //        drawNode.drawSegment(cc.p(-l * (segmentLen + gap), 0), cc.p(-l * (segmentLen + gap) - segmentLen, 0), lineWidth, color);
    //    }
    //},
    //
    ///**
    // * 转成实线
    // * @param drawNode
    // * @param color
    // */
    //switchSolidLine:function(drawNode, color)
    //{
    //    drawNode.clear();
    //    var size = this.getContentSize();
    //    var lineWidth = 0.8;
    //    var color = color || cc.color(160, 160, 160, 150);
    //    drawNode.drawSegment(cc.p(0, 0), cc.p(-size.width, 0), lineWidth, color);
    //}
});


TouchLinePanel.instance = undefined;