/**
 * 红包管理
 * Created by 玲英 on 2016/11/30.
 */

var RedPacketPanel = cc.Node.extend({

    ctor:function(rootNode)
    {
        this._super();
        this.setContentSize(rootNode.getContentSize());

        var parent = rootNode.getParent();
        parent.addChild(this);
        this.setPos(rootNode.getPosition(), rootNode.getAnchorPoint());

        //将rootNode移到自己身上
        rootNode.retain();
        rootNode.removeFromParent(false);
        this.addChild(rootNode);
        rootNode.setPos(cc.p(0, 0), ANCHOR_LEFT_BOTTOM);
        rootNode.release();

        //初始化ui
        this.initUI(rootNode);
    },

    initUI:function(rootNode)
    {
        //红包view
        var redPacketView = this._redPacketView = ccui.helper.seekWidgetByName(rootNode, "redPacketView");
        //货币符号
        var redPacketSignText = this._redPacketSignText = ccui.helper.seekWidgetByName(rootNode, "redPacketSignText");
        //红包金额
        var redPacketAmountText = this._redPacketAmountText = ccui.helper.seekWidgetByName(rootNode, "redPacketAmountText");

        //新用户面板
        var newRedPacketProgressPanel = this._newRedPacketProgressPanel = ccui.helper.seekWidgetByName(rootNode, "newRedPacketProgressPanel");
        //红包进度相关
        var redPacketProgressText = this.redPacketProgressText = ccui.helper.seekWidgetByName(newRedPacketProgressPanel, "redPacketProgressText");
        var redPacketProgressTip = this._redPacketProgressTip = ccui.helper.seekWidgetByName(newRedPacketProgressPanel, "redPacketProgressTip");
        var redPacketProgressBar = this._redPacketProgressBar = ccui.helper.seekWidgetByName(newRedPacketProgressPanel, "redPacketProgressBar");

        //老用户面板
        var oldRedPacketProgressPanel = this._oldRedPacketProgressPanel = ccui.helper.seekWidgetByName(rootNode, "oldRedPacketProgressPanel");
        //红包发送相关
        var redPacketTimeText = this._redPacketTimeText = ccui.helper.seekWidgetByName(oldRedPacketProgressPanel, "redPacketTimeText");
        var oldRedPacketTip = this._oldRedPacketTip = ccui.helper.seekWidgetByName(oldRedPacketProgressPanel, "oldRedPacketTip");

        //
        newRedPacketProgressPanel.setPos(rightInner(rootNode), ANCHOR_RIGHT);
        oldRedPacketProgressPanel.setPos(rightInner(rootNode), ANCHOR_RIGHT);
        newRedPacketProgressPanel.setVisible(true);
        oldRedPacketProgressPanel.setVisible(false);
    },

    initAllButtonClick:function()
    {

    },

    /**
     * 刷新
     */
    initWithRedPacketInfo:function()
    {

    }

});