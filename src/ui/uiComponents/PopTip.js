/**
 * Created by 玲英 on 2016/9/11.
 */
var PopTip = ccui.Widget.extend({
    _gapSize:undefined,

    ctor:function(content, gapSize) {
        this._super();
        this._gapSize = gapSize || cc.size(10 * 2, 10 * 2);

        this.initUI();

        this.refreshByContent(content, gapSize);
    },

    initUI:function() {
        var popSprite = this._popSprite = new cc.Scale9Sprite("common_popup_small_1.png");
        popSprite.setInsetLeft(14);
        popSprite.setInsetRight(14);
        popSprite.setInsetTop(14);
        popSprite.setInsetBottom(14);
        this.addChild(popSprite);

        this.setContentSize(popSprite.getContentSize());

        //箭头
        var arrowSprite = this._arrowSpirte = new cc.Sprite("#common_popup_small_2.png");
        popSprite.addChild(arrowSprite);
        arrowSprite.setAnchorPoint(0.5, 1);
        //暂时处于中间
        arrowSprite.setPosition(this.width * 0.5, 2.3);
    },

    refreshByContent:function(content, gapSize){
        if(!content)
            return;
        var gapSize = this._gapSize = gapSize || this._gapSize;

        if(this._content)
            this._content.removeFromParent();
        this._content = content;
        this._popSprite.setContentSize(cc.sizeAdd(content, gapSize));
        //
        this._popSprite.addChild(content);
        content.setPos(centerInner(this._popSprite));
        //
        this.refresh();
    },

    /**
     * 只调整大小和本体锚点
     */
    refresh:function() {
        var popSprite = this._popSprite;
        var arrowSprite = this._arrowSpirte;
        //箭头处于的百分比位置
        var arrowXPosRate = arrowSprite.getPositionX() / this.width;

        //调整本体大小
        var size = cc.size(popSprite.width, popSprite.height + arrowSprite.height - 3.5);
        this.setContentSize(size);
        //popSprite始终置顶
        popSprite.setPos(leftTopInner(this), ANCHOR_LEFT_TOP);
        //调整arrowXPos
        arrowSprite.setPositionX(arrowXPosRate * size.width);

        //调整本体锚点(这样方便调整大小时，不需要调整箭头的位置)
        this.setAnchorPoint(arrowXPosRate, 0);
    }
});


var BetTip = PopTip.extend({

    ctor:function(betInfo, nickName) {
        this._super();
        var productInfo = Player.getInstance().getProductById(betInfo.getProductId());
        var precise = productInfo.getPrecise();

        var redColor = cc.color(217, 73, 47, 70);
        var grayColor = cc.color(147, 139, 138, 70);
        //昵称
        var nickNameText = new ccui.Text(nickName, FONT_ARIAL_BOLD, 24);
        //下单时间
        var betTimeText = new ccui.Text(TimeHelper.formatSecs(betInfo.getBetTime(), "HH:mm:ss"), FONT_ARIAL_BOLD, 24);
        betTimeText.setColor(grayColor);
        //下单时的行情
        var betQuoteText = new ccui.Text(betInfo.getBetQuotePrice().toFixedCs(precise), FONT_ARIAL_BOLD, 24);
        betQuoteText.setColor(grayColor);
        //下单额
        var betAmountText = new ccui.Text(MONEY_SIGN + betInfo.getBetAmount().toFixed(2), FONT_ARIAL_BOLD, 24);
        betAmountText.setColor(redColor);

        //横向组合底部
        var bottomPanel = UICommon.createPanelAlignWidgetsWithPadding(15, cc.UI_ALIGNMENT_HORIZONTAL_CENTER, betTimeText, betQuoteText, betAmountText);
        //组合昵称
        var content = UICommon.createPanelAlignWidgetsWithPadding(5, cc.UI_ALIGNMENT_VERTICAL_CENTER, nickNameText, bottomPanel);

        //
        this.refreshByContent(content)
    }
});