/**
 * radio
 * Created by 玲英 on 2016/11/27.
 */
var RadioListPanel = cc.Layer.extend({

    ctor:function()
    {
        this._super();
        this._cellContentArray = [];

        //添加一个全屏面板  在列表层以下，用于点击空白出关闭列表
        var blankPanel = this._blankTouchPanel = new ccui.Layout();
        blankPanel.setContentSize(cc.winSize);
        this.addChild(blankPanel);
        blankPanel.setTouchEnabled(true);
        blankPanel.addClickEventListener(function()
        {
            this.close();
        }.bind(this));

        var listPanel = this._listPanel = new ccui.Layout();
        this._listPanel.setAnchorPoint(0, 1);
        this.addChild(listPanel);
    },

    isOpen:function()
    {
        return this._isOpen;
    },

    /**
     * 折叠动画
     */
    close:function()
    {
        if(this._listPanel.getNumberOfRunningActions() > 0)
            return;
        //this.setTouchEnabled(false);
        this._isOpen = false;
        this._blankTouchPanel.setTouchEnabled(false);
        this._listPanel.runAction(new cc.Sequence(
            new cc.ScaleTo(0.25, 1.0, 0).easing(cc.easeBackIn()),
            new cc.CallFunc(function(){
                if(this._closeCallBack)
                    this._closeCallBack();
            }.bind(this))
        ));
    },

    setClose:function()
    {
        this._isOpen = false;
        this._blankTouchPanel.setTouchEnabled(false);
        this._listPanel.setScaleY(0);
    },

    /**
     * 打开后的回调
     * @param callback
     */
    setOpenCallBack:function(callback)
    {
        this._openCallBack = callback;
    },

    /**
     * 关闭后的回调
     * @param callback
     */
    setCloseCallBack:function(callback)
    {
        this._closeCallBack = callback;
    },

    /**
     * 展开动画
     */
    open:function()
    {
        if(this._listPanel.getNumberOfRunningActions() > 0)
            return;
        //switchPanel.setTouchEnabled(true);
        this._isOpen = true;    //是否打开
        this._blankTouchPanel.setTouchEnabled(true);
        this._listPanel.runAction(new cc.Sequence(
            new cc.ScaleTo(0.25, 1.0, 1.0).easing(cc.easeBackOut()),
            new cc.CallFunc(function(){
                if(this._openCallBack)
                    this._openCallBack();
            }.bind(this))
        ));
    },

    addSelectCell:function(cell, selectedCallBack)
    {
        //由上向下添加
        var cellContent = new ccui.Layout();
        cellContent.setContentSize(cell.getContentSize());
        cellContent.addChild(cell);
        cell.setPos(cc.p(0, 0), ANCHOR_LEFT_BOTTOM);

        //列表
        this._listPanel.addChild(cellContent);

        this._cellContentArray.push(cellContent);

        //触摸遮罩
        var touchPanel = new ccui.Layout();
        touchPanel.setContentSize(cellContent.getContentSize());
        touchPanel.setTouchEnabled(true);
        cellContent.addChild(touchPanel);
        cellContent.touchPanel = touchPanel;

        touchPanel.index = this._cellContentArray.length - 1;
        touchPanel.cell = cell;
        touchPanel.selectedCallBack = selectedCallBack;

        touchPanel.addClickEventListener(function(sender){
            if(this.isClickValid(sender.index))
            {
                this.setSelectedIndex(sender.index);
            }
        }.bind(this));

        //每次添加则调整一次排版
        this.doLayout();
    },

    setSelectedIndex:function(index)
    {
        if((this._cellContentArray.length - 1) < index){
            cc.log("..setSelectedIndex..越界..请添加完足够的cell 再设置");
            return;
        }
        if(this._selectedIndex == index) {
            this.doSelected(index, true);
            return;
        }
        //cc.log("setSelectIndex: ", index);
        this.doSelected(index, true);
        this.doSelected(this._selectedIndex, false);
        this._selectedIndex = index;
    },

    doSelected:function(index, isSelected)
    {
        if(index == undefined)
            return;
        var cellContent = this._cellContentArray[index];
        var touchPanel = cellContent.touchPanel;
        touchPanel.selectedCallBack(touchPanel.cell, isSelected, index);
    },

    /**
     * 点击合法判断
     * @param cellContent
     * @returns {boolean}
     */
    isClickValid:function(index)
    {
        //if(this._selectedIndex == index){
        //    return false;
        //}
        if(this.getNumberOfRunningActions() > 0)
            return false;
        return true;
    },

    doLayout:function()
    {
        var heightCount = 0;
        var maxWidth = 0;
        //最后塞的放最底下
        for(var i = this._cellContentArray.length - 1; i >= 0 ; i--) {
        //for(var i = 0; i < this._cellContentArray.length ; i++) {
            var cell = this._cellContentArray[i];
            var cellSize = cell.getContentSize();
            heightCount += cellSize.height;
            if(cellSize.width > maxWidth) maxWidth = cell.width;
            this._listPanel.setContentSize(maxWidth, heightCount);
            cell.setPos(cc.p(0, heightCount), ANCHOR_LEFT_TOP);
        }
    },

    /**
     * 设置列表的位置 以全屏, 默认左上锚点布局
     */
    setListPos:function(pos, virtualAnchor)
    {
        this._listPanel.setPos(pos, virtualAnchor || ANCHOR_LEFT);
    }
});