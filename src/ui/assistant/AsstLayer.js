/**
 * Created by 玲英 on 2016/10/3.
 */
var AsstLayer = cc.Layer.extend({
    _isPortraitReverse: false,
    _actRect: undefined,         //头像的活动范围

    ctor: function () {
        this._super();
        this._actRect = cc.rect(0, 0, cc.winSize.width, cc.winSize.height);

        this.initUI();

        this.hideBubble();

        //var str = "<b u=1>客官</b><l c=ff0000 >，你看这样可以吗？</l> <l>累计12把胜利，送飞吻一个，长按下</l> <l c=FFA500 >+</l> <l>或者</l> <l c=FFA500>-</l> <l>按钮来快速调整下单金额吧.</l>";
        //this.setDialogText(str);
    },

    cleanup:function()
    {
        this._instance = null;
    },

    /**
     * 执行消息
     * @param asstInfo
     */
    runMessage:function(asstInfo) {
        if(this._bubblePanel.getNumberOfRunningActions() > 0)
            return;
        cc.log("asstInfo.getDialogue()::", asstInfo.getDialogue());
        //执行前减去一次执行次数
        asstInfo.reduceLimitNum();
        //执行消息
        this.setDialogText(asstInfo.getDialogue());
        //visible
        this.showBubble();
        //delay action
        this._bubblePanel.runAction(new cc.Sequence(
            new cc.DelayTime(5.0),
            new cc.CallFunc(function(){
                this.hideBubble();
            }.bind(this))
        ));
    },

    /**
     * 隐藏对话冒泡
     */
    hideBubble:function()
    {
        this._isShowing = false;
        this._bgMessageBox.setVisible(false);
        this._bubblePanel.setVisible(false);
    },

    showBubble:function()
    {
        this._isShowing = true;
        this._bgMessageBox.setVisible(true);
        this._bubblePanel.setVisible(true);
    },

    /**
     * 设置头像的活动范围
     */
    setActRect: function (rect) {
        this._actRect = rect || this._actRect;
    },

    setDialogText:function(str)
    {
        var bgMessageBox = this._bgMessageBox;
        bgMessageBox.removeAllChildren();
        var richTextEx = null;
        var defaultColor = cc.WHITE;
        cc.log("str.substring(0, 1)::", str.substring(0, 1));
        if(str.substring(0, 1) == "<") {
            richTextEx = UIString.scriptToRichTextEx(str, bgMessageBox.width - 14, FONT_ARIAL_BOLD, 24, defaultColor);
        }else{
            richTextEx = new ccui.Text(str, FONT_ARIAL_BOLD, 24);
            richTextEx.setColor(defaultColor);
            richTextEx.setTextAreaSize(cc.size(bgMessageBox.width - 14, bgMessageBox.height));
        }
        bgMessageBox.addChild(richTextEx);
        richTextEx.setPos(leftTopInner(bgMessageBox), ANCHOR_LEFT_TOP);
        richTextEx.setPositionXAdd(7);
        richTextEx.setPositionYAdd(-7);
    },

    initUI: function () {
        //包括半身像和气泡
        var layer = ccs.loadWithVisibleSize(res.AssistantAvatar_json).node;
        var portraitPanel = this._portraitPanel = ccui.helper.seekWidgetByName(layer, "portraitPanel");
        portraitPanel.setAnchorPoint(ANCHOR_CENTER);

        //头像
        var portrait = this._portrait = ccui.helper.seekWidgetByName(layer, "portrait");
        //气泡
        var bubblePanel = this._bubblePanel = ccui.helper.seekWidgetByName(layer, "bubblePanel");

        //文本框
        var bgMessageBox = this._bgMessageBox = ccui.helper.seekWidgetByName(layer, "bgMessageBox");
        cc.log("bgMessageBox::", bgMessageBox);
        bgMessageBox._rightPos = bgMessageBox.getPosition();
        bgMessageBox._leftPos = cc.p((-bgMessageBox._rightPos.x + portrait.width * 0.5) * 2 + 8, bgMessageBox._rightPos.y);

        //imageView移到当前当前layer上 (仅仅因为ccui.Widget方便添加touch事件)
        portraitPanel.removeFromParent(false);
        this.addChild(portraitPanel);
        portraitPanel.setPos(cc.pCenter(cc.winSize));
        this._portraitSize = this._portrait.getContentSize();

        //头像的点击事件
        portraitPanel.setAnchorPoint(ANCHOR_CENTER);
        portraitPanel.setTouchEnabled(true);
        this._portraitPanel.addTouchEventListener(function (sender, eventType) {
            switch (eventType) {
                case ccui.Widget.TOUCH_BEGAN:
                    this._bubblePanel.setVisible(false);
                    this._bgMessageBox.setVisible(false);
                    break;
                case ccui.Widget.TOUCH_MOVED:
                    var movPos = sender.getTouchMovePosition();
                    this._portraitPanel.setPosition(this.fixPos(movPos));
                    break;
                case ccui.Widget.TOUCH_CANCELED:
                case ccui.Widget.TOUCH_ENDED:
                    MainController.playButtonSoundEffect(sender);
                    if (this._portraitPanel.getPosition().x > cc.winSize.width * 0.5) {
                        this.reversePortrait(true);
                    } else {
                        this.reversePortrait(false);
                    }
                    cc.log("this._isShowing::",this._isShowing);
                    if(this._isShowing) {
                        this._bgMessageBox.setVisible(true);
                        this._bubblePanel.setVisible(true);
                    }
                    break;
            }
        }.bind(this));
    },

    /**
     * 修正位置(保证小蜜边缘不会超出指定的rect)
     * @param pos
     * @param {cc.Rect} [rect] 小蜜的活动范围
     * @param {cc.Size} [portraitSize] 小蜜的人物大小
     * @returns {cc.Point|*}
     */
    fixPos: function (pos, rect, portraitSize) {
        var portraitSize = portraitSize || this._portraitSize;
        var rect = rect || this._actRect;
        //修正后,表示中心点的可移动范围
        var fixedRect = cc.rect(rect.x + portraitSize.width * 0.5, rect.y + portraitSize.height * 0.5, rect.width - portraitSize.width, rect.height - portraitSize.height);
        var minX = cc.rectGetMinX(fixedRect);
        var maxX = cc.rectGetMaxX(fixedRect);
        var minY = cc.rectGetMinY(fixedRect);
        var maxY = cc.rectGetMaxY(fixedRect);
        var fixedPos = cc.p(pos.x, pos.y);
        if (pos.x < minX)
            fixedPos.x = minX;
        if (pos.x > maxX)
            fixedPos.x = maxX;
        if (pos.y < minY)
            fixedPos.y = minY;
        if (pos.y > maxY)
            fixedPos.y = maxY;
        return fixedPos;
    },

    /**
     * 反转头像
     * @param isReverse
     */
    reversePortrait:function(isReverse) {
        var bgMessageBox = this._bgMessageBox;
        cc.log("reversePortrait  bgMessageBox::", bgMessageBox);
        cc.log("reversePortrait  bgMessageBox._leftPos::", JSON.stringify(bgMessageBox._leftPos));
        cc.log("reversePortrait  bgMessageBox._rightPos::", JSON.stringify(bgMessageBox._rightPos));
        if(isReverse == true) {
            this._portrait.setFlippedX(true);
            this._isPortraitReverse = true;
            bgMessageBox.setPosition(bgMessageBox._leftPos);
        }else {
            this._portrait.setFlippedX(false);
            this._isPortraitReverse = false;
            bgMessageBox.setPosition(bgMessageBox._rightPos);
        }
    }
});

/**
 * 助手 view单例
 * @returns {AsstLayer|*}
 */
AsstLayer.getInstance = function()
{
    if(!this._instance && MainScene.instance)
    {
        var asstLayer = this._instance = new AsstLayer();
        MainScene.instance.addChild(asstLayer, 999999);
        asstLayer.setVisible(false);
    }
    return this._instance;
};
