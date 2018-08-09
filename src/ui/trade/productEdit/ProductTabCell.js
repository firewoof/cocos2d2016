/**
 * Created by 玲英 on 2016/7/18.
 */

var ProductTabCell =  ccui.Layout.extend({
    _productInfo: undefined,

    /**
     * @param {ProductInfo} productInfo
     */
    ctor:function(productInfo)
    {
        this._super();

        this.setContentSize(cc.size(250, 136));

        this.initUI();

        this.refresh(productInfo);

        this.addListener();
    },

    cleanup:function()
    {
        this._super();
        //this.removeAllCustomListeners();
        this.removePopTip();
    },

    removePopTip:function(){
        if(this._popTip){
            this._popTip.removeFromParent();
            this._popTip = null;
        }
    },

    addListener:function()
    {
        //this._productEditeOnShowListener = cc.eventManager.addCustomListener(NOTIFY_PRODUCT_EDIT_ON_SHOW, function()
        //{
        //    var curProductInfo = Player.getInstance().getCurProductInfo();
        //    if(curProductInfo == this._productInfo){
        //        this._tabCellBtn.setEnabled(false);
        //    }else{
        //        this._tabCellBtn.setEnabled(true);
        //    }
        //}.bind(this));
    },

    initUI:function()
    {
        var tabCellSize = cc.size(250, 91);
        var tabCellBtn = this._tabCellBtn = new ccui.Button();
        tabCellBtn.loadTextureNormal("bg_common_bar.png", ccui.Widget.PLIST_TEXTURE);
        tabCellBtn.loadTexturePressed("btn_input_money_confirm_n.png", ccui.Widget.PLIST_TEXTURE);
        tabCellBtn.loadTextureDisabled("bg_common_bar.png", ccui.Widget.PLIST_TEXTURE);
        tabCellBtn.setScale9Enabled(true);
        tabCellBtn.setContentSize(tabCellSize);
        //tabCellBtn.setTitleColor(cc.BLACK);
        this.addChild(tabCellBtn);
        tabCellBtn.setPos(topInner(this), ANCHOR_TOP);
        tabCellBtn.setPositionYAdd(-15);
        //tabCellBtn.addClickEventListener(function(sender){
        //    MainController.playButtonSoundEffect(sender);
        //    this.clickCallFunc();
        //}.bind(this));

        tabCellBtn.addTouchEventListener(function(sender, type){
            switch (type)
            {
                case ccui.Widget.TOUCH_BEGAN:
                    //测试服显示开放时间段
                    if(isTestServer){
                        var popTip = this._popTip = new PopTip(this.createOpenTimePanel(), cc.size(60, 40));
                        this.addChild(popTip);
                        popTip.setPos(topInner(this), ANCHOR_BOTTOM);
                    }
                    break;
                case ccui.Widget.TOUCH_MOVED:
                    break;
                case ccui.Widget.TOUCH_ENDED:
                    MainController.playBtnSoundEffect(sender);
                    this.removePopTip();
                    this.clickCallFunc();
                    break;
                default :
                    this.removePopTip();
                    break;
            }
        }.bind(this));

        //剔除按钮
        var deleteBtn = this._deleteBtn = new ccui.Button();
        deleteBtn.loadTextureNormal("btn_close_n.png", ccui.Widget.PLIST_TEXTURE);
        deleteBtn.setScale(0.7);
        tabCellBtn.addChild(deleteBtn);
        deleteBtn.setPos(rightTopInner(tabCellBtn), cc.p(0.6, 0.6));
        deleteBtn.setVisible(false);
        deleteBtn.addClickEventListener(function(sender){
            MainController.playButtonSoundEffect(sender);
            this.deleteCallFunc();
        }.bind(this));

        //产品名
        var productNameText = this._productNameText = new ccui.Text("");
        productNameText.setFontSize(30);
        tabCellBtn.addChild(productNameText);
        productNameText.setPosition(cc.pCenter(tabCellSize));
        productNameText.setColor(cc.BLACK);

        //开放时间
        var openTimeText = this._openTimeText = new ccui.Text("");
        openTimeText.setFontSize(24);
        this.addChild(openTimeText);
        openTimeText.setPosition(this.width * 0.5, (this.height - tabCellSize.height) * 0.5 - 12);
        openTimeText.setColor(cc.color(217, 73, 47));
    },

    createOpenTimePanel:function()
    {
        var productInfo = this._productInfo;
        if(!productInfo){
            return;
        }
        var viewArray = [];
        var titleText = new ccui.Text("开放时间段:", FONT_ARIAL_BOLD, 24);
        viewArray.push(titleText);
        var weekSchedule = productInfo.getWeekSchedule();
        var openFormatArray = weekSchedule.getOpenFormatArray();
        for(var i = 0; i < openFormatArray.length; i++){
            var timeStr = openFormatArray[i];
            var timeText = new ccui.Text(timeStr, FONT_ARIAL_BOLD, 24);
            timeText.setColor(cs.GREEN);
            viewArray.push(timeText);
        }

        var panel = UICommon.createPanelAlignWidgetsWithPadding(3, cc.UI_ALIGNMENT_VERTICAL_LEFT, viewArray);
        return panel;
    },

    /**
     * CellBtn点击按钮回调
     */
    clickCallFunc:function()
    {
        var focusedProductIdArray = Player.getInstance().getFocusedProductIdArray();
        var productInfo = this._productInfo;
        //编辑状态(不响应cell点击 只响应删除按钮)
        if(this._deleteBtn.isVisible())
            return;
        cc.log("productInfo:: ", productInfo.getName(), productInfo.isFocused());
        //表示点击关注
        //if(!productInfo.isFocused())
        //{
        //    if(focusedProductIdArray.length < 8) {
        //        productInfo.setFocused(true);
        //        focusedProductIdArray.push(productInfo.getId());
        //        cc.eventManager.dispatchCustomEvent(NOTIFY_ADD_SELECTED_PRODUCT);
        //    }else {
        //        MainController.showAutoDisappearAlertByText(LocalString.getString("PRODUCT_NO_MORE"));
        //    }
        //}
        //else
        {
            if(productInfo.isOpen()) {
                cc.eventManager.dispatchCustomEvent(NOTIFY_PRODUCT_SELECT_CHANGE, productInfo.getId());
            }else {
                MainController.showAutoDisappearAlertByText(LocalString.getString("PRODUCT_NOT_YET"));
            }
        }
    },

    /**
     * 删除按钮点击的回调
     */
    deleteCallFunc:function()
    {
        var focusedProductIdArray = Player.getInstance().getFocusedProductIdArray();
        var productInfo = this._productInfo;
        if(focusedProductIdArray.length > 1) {
            productInfo.setFocused(false);
            //准备移除关注的产品id
            for(var i = 0; i < focusedProductIdArray.length; i++)
            {
                var deleteIndex = focusedProductIdArray[i];
                if(deleteIndex == productInfo.getId())
                {
                    focusedProductIdArray.splice(i, 1);
                    cc.eventManager.dispatchCustomEvent(NOTIFY_REMOVE_SELECTED_PRODUCT);
                    break;
                }
            }
        }else {
            MainController.showAutoDisappearAlertByText(LocalString.getString("PRODUCT_AT_LEAST_ONE"));
        }
    },

    /**
     * 删除按钮的可见与否
     * @param visible
     */
    setDeleteBtnVisible:function(visible)
    {
        var visible = visible == false ? false : true;
        this._deleteBtn.setVisible(visible);
    },

    /**
     * {ProductInfo}
     */
    refresh:function(productInfo)
    {
        this._productNameText.setString(productInfo.getName());
        //未开放
        if(!productInfo.isOpen())
        {
            //UICommon.setGrayRecursive(this._tabCellBtn);    //变灰
            this._tabCellBtn.setEnabled(false);
            this._productNameText.setColor(cc.color(143, 162, 176));
            var nextOpenTimeStr = productInfo.getNextOpenTimeStr();
            if(nextOpenTimeStr != undefined){
                //this._openTimeText.setString(nextOpenTimeStr + LocalString.getString("PRODUCT_OPEN_TIPS"));
                this._openTimeText.setString(nextOpenTimeStr);
            }
        }
        else
        {
            //UICommon.resumeColorRecursive(this._tabCellBtn);    //恢复
            this._tabCellBtn.setEnabled(true);
            this._productNameText.setColor(cc.BLACK);
        }

        //if(productInfo.isFocused())
        //    this._tabCellBtn.setTouchEnabled(false);
        //else
        //    this._tabCellBtn.setTouchEnabled(true);

        this._productInfo = productInfo;
    }
});

