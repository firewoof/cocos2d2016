/**
 * Created by 玲英 on 2016/8/4.
 */

var ProductEditLayer = BaseLayer.extend({
    _curTid:undefined,   //当前产品类别

    ctor:function()
    {
        this._super("ProductEditLayer");
        //this.setOpacity(170);

        ////禁止穿透并收起下拉列表
        //var blockPanel = this._blockPanel = new ccui.Layout();
        //blockPanel.setContentSize(cc.winSize);
        //this.addChild(blockPanel);
        //blockPanel.setTouchEnabled(true);

        //测试数据
        //this.testData();

        this._selectedCellArray = [];
        //默认tid(产品类型)
        this._curTid = null;

        //UI
        this.initUI();

        //点击事件
        this.initAllClickFunc();

        //this.reload();

        //监听
        this.addListener();
    },

    cleanup:function(){
        //同步给服务器(暂时不需要了)
        //this.doUpdateRequest();
        this.removeAllCustomListeners();

        ProductEditLayer.instance = null;

        this._super();
    },

    onEnter:function(){
        this._super();
        if(this.isShowing()){
            cc.log("productEdit 进场relaod");
            this.reload();
        }
    },

    onExit:function()
    {
        this._super();
    },

    addListener:function()
    {
        this._productSeletedChangedListener = cc.eventManager.addCustomListener(NOTIFY_PRODUCT_SELECT_CHANGE, function(event)
        {
            cc.log("NOTIFY_PRODUCT_SELECT_CHANGE close product Editor");
            var productId = event.getUserData();
            MainController.popLayerFromRunningScene(this);
        }.bind(this));

        this._perOneSecondListener = cc.eventManager.addCustomListener(NOTIFY_PER_ONE_SECOND, function()
        {
            var curSecs = cs.getCurSecs();
            //每n秒刷新一次时间
            if(this.isShowing() && curSecs % 60 == 0)
            {
                //ui也刷新一次
                this.reload();
            }
        }.bind(this));

        //产品更新
        this._productInfoUpdateListener = cc.eventManager.addCustomListener(NOTIFY_PRODUCT_INFO_UPDATE, function()
        {
            this.reload();
        }.bind(this));
    },

    initUI:function()
    {
        var layer  = ccs.loadWithVisibleSize(res.ProductEdit_json).node;
        //加入到当前layer中。
        this.addChild(layer);

        var titlePanel = this._titlePanel = ccui.helper.seekWidgetByName(layer, "titlePanel");
        var closeBtn = this._closeBtn = ccui.helper.seekWidgetByName(layer, "closeBtn");
        var timeText = this._timeText = ccui.helper.seekWidgetByName(layer, "timeText");
        var titleText = this._titleText = ccui.helper.seekWidgetByName(layer, "titleText");
        titleText.setString(LocalString.getString("PRODUCT_EDIT_TITLE"));

        var contentPanel = this._contentPanel = new ccui.Layout();
        //contentPanel.setBackGroundColorEx(cc.RED);
        contentPanel.setContentSize(cc.winSize.width, cc.winSize.height - titlePanel.height);
        this.addChild(contentPanel);
    },

    initAllClickFunc:function()
    {
        //callBack
        this._closeBtn.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            MainController.popLayerFromRunningScene(this);
        }.bind(this));
    },

    /**
     *
     */
    reload:function()
    {
        cc.log("productEdit relaod");
        var date = new Date();
        cc.log("date.getTimezoneOffset():: "+date.getTimezoneOffset());
        //if((date.getTimezoneOffset()/60 ) != -8){
        //    this._timeText.setString(LocalString.getString("ZONE_BEI_JING") +TimeHelper.formatSecs(cs.getServerZoneTime(), "HH:mm"));
        //}else{
            this._timeText.setString(TimeHelper.formatSecs(cs.getCurSecs(), "HH:mm"));
        //}
        this._contentPanel.removeAllChildren();
        var typeObjArray  = Player.getInstance().getProductTypeArray();
        var modePanelArray = [];
        var lineNum = 0;
        //cc.log("tupeObjArray::", JSON.stringify(typeObjArray));

        //将产品类型放进数组中进行排版
        for(var i = 0; i < typeObjArray.length; i++){
            var typeObj = typeObjArray[i];
            var tempModelPanel = this.createModePanelByType(typeObj.optionType, typeObj.name);
            if(tempModelPanel){
                //除第一列产品种类，后续都应加黑线
                if(modePanelArray.length != 0){
                    var line = new cc.LayerColor(cc.color(143,162,176), tempModelPanel.width, 1.5);
                    modePanelArray.push(line);
                    lineNum++;
                }
                modePanelArray.push(tempModelPanel);
            }

        }

        //只有一种玩法的时候 标题隐藏
        if(typeObjArray.length == 1){
            modePanelArray[0]._titleText.setVisible(false);
        }

        //排列产品种类之间的上下间距
        var panel = UICommon.createPanelAlignWidgetsWithPadding(20, cc.UI_ALIGNMENT_VERTICAL_LEFT, modePanelArray);

        //若产品种类列表超过2个，将其放进scrollView中进行排列
        if(panel.height > (cc.winSize.height - this._titlePanel.height - 100)){
            var scrollView =  UICommon.createScrollViewWithContentPanel(panel,cc.size(panel.width + 200, cc.winSize.height - this._titlePanel.height - 20));
            scrollView.setScrollBarPositionFromCornerForVertical(cc.p(50,0));
            panel.setPos(topInner(scrollView),ANCHOR_TOP);

            this._contentPanel.addChild(scrollView);
            scrollView.setPos(topInner(this._contentPanel),ANCHOR_TOP);
        }else{
            this._contentPanel.addChild(panel);
            panel.setPos(cc.p(this._contentPanel.width/2,this._contentPanel.height - 20),ANCHOR_TOP);
        }
    },

    /**
     * 根据产品类型创建不同的玩法面板
     * @param {Number} type
     * @param {String} titleStr
     * @returns {*}
     */
    createModePanelByType:function(type, titleStr)
    {
        var productArray = Player.getInstance().getProductArray();
        var productCellArray = [];
        for(var i = 0; i < productArray.length; i++)
        {
            var productInfo = productArray[i];
            if(productInfo.getOptionType() == type && !productInfo.isRemoved())
            {
                var productCell = new ProductTabCell(productInfo);
                //productCell.setBackGroundColorEx(cc.GREEN);
                productCellArray.push(productCell);

            }
        }

        if(productCellArray.length == 0){
            return;
        }

        var titleText = new cc.LabelTTF(titleStr, FONT_ARIAL_BOLD, 24);
        titleText.setColor(cc.color(143, 162, 170));

        var content = UICommon.arrangeAsMatrixByColumn(ccui.Layout, productCellArray, 4, cc.size(50, 0));

        //垂直组合标题和内容
        var panel = UICommon.createPanelAlignWidgetsWithPadding(1, cc.UI_ALIGNMENT_VERTICAL_LEFT, titleText, content);
        panel._titleText = titleText;

        return panel;
    },
    //
    //show:function(isShow)
    //{
    //    if(isShow){
    //        this._isShowing = true;
    //        this.setVisible(true);
    //    }else{
    //        this._isShowing = false;
    //        this.setVisible(false);
    //    }
    //},

    isShowing:function()
    {
        return this.getParent() != undefined;
    },

    /**
     * 进入可编辑状态
     * @param isEditEnabled
     */
    setEditEnabled:function(isEditEnabled)
    {
        var isEditEnabled = isEditEnabled == false ? false : true;
        for(var i = 0; i <  this._selectedCellArray.length; i++)
        {
            this._selectedCellArray[i].setDeleteBtnVisible(isEditEnabled);
        }
    }
});

ProductEditLayer.getInstance = function()
{
    var layer =  ProductEditLayer.instance;
    if(layer == undefined){
        layer = ProductEditLayer.instance = new ProductEditLayer();
        layer.retain();
    }
    //if(!layer.getParent()){
    //    MainController.pushLayerToRunningScene(this)
    //}
    return layer;
};