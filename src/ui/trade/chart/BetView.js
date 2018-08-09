/**
 * Created by Administrator on 2016/12/12.
 */
/**
 * 订单小点
 * @type {Function}
 */
var BetView = ccui.Layout.extend({

    ctor:function(betInfo){
        this._super();

        this.setAnchorPoint(ANCHOR_CENTER);

        this.initUI();

        if(betInfo){
            this.refresh(betInfo);
        }
    },

    /**
     * 下单点view
     * @param betInfo
     * @param {Number} [timeScale]
     * @returns {cc.Node}
     */
    initUI:function()
    {
        //var horizontalLine = new cc.LayerColor();
        //horizontalLine.setContentSize(0, 2);
        //this.addChild(horizontalLine);

        var srcName = "icon_position_rise.png";
        var esSprite = new cc.Sprite(srcName);
        this.addChild(esSprite);
        this.setContentSize(esSprite.getContentSize());
        esSprite.setPos(centerInner(this));

        //连接线起始不显示
        //horizontalLine.setVisible(false);
        this._betInfo = null;
        //this._linkLine = horizontalLine;
        this._esSprite = esSprite;
    },

    getBetInfo:function()
    {
        return this._betInfo;
    },

    /**
     *
     * @param betInfo
     * @param timeScale  特殊参数 需要一条结算线
     * @param width
     */
    refresh:function(betInfo)
    {
        if(!betInfo)
            return;
        this._betInfo = betInfo;

        var srcName = "icon_position_rise.png";
        var isBullish = betInfo.isBullish();
        if (!isBullish)
            srcName = "icon_position_fall.png";

        //var frame = cc.spriteFrameCache.getSpriteFrame(srcName);
        var texture = cc.textureCache.addImage(srcName);
        this._esSprite.setTexture(texture);

        //var linkLine = this._linkLine;
        //var settleGap = betInfo.getTradeSettleTime() - betInfo.getTradeBeginTime();
        //if(width && timeScale && settleGap > 0){
        //    var lineWidth = settleGap / timeScale * width;
        //    linkLine.setContentSize(lineWidth, 2);
        //
        //    var color = isBullish ? cc.color(255, 0, 0, 255) : cc.color(0, 255, 0, 255);
        //    if(linkLine)
        //        linkLine.setColor(color);
        //}
    }
});
