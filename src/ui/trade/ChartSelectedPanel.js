/**
 * Created by Administrator on 2017/2/22.
 */
GB.CHART_TYPE_SOLID = 0;
GB.CHART_TYPE_CANDLE = 1;
var ChartSelectedPanel = cc.Node.extend({
    _maxSelectedItem:5,

    ctor:function(size)
    {
        this._super();

        this.setContentSize(size);

        this._selecteditemIndexesMap = {};
        this._selectedChartType = GB.CHART_TYPE_SOLID;
        this._chartTypeArray = [GB.CHART_TYPE_SOLID, GB.CHART_TYPE_CANDLE];

        this.initUI();

        this.initByConfig();

        this.initChartPanel();
    },

    cleanup:function()
    {
        this._super();

        this.saveConfig();
    },

    initUI:function()
    {
        //创建一个遮罩
        var touchMask = new ccui.Layout();
        this.addChild(touchMask);
        touchMask.setTouchEnabled(true);
        touchMask.setSwallowTouches(false);
        touchMask.setContentSize(this.getContentSize());
        touchMask.addClickEventListener(function(){
            this.hide();
        }.bind(this));

        var ccsObject = ccs.load(res.TradeChartSelect_json);
        var layer = this._rootNode = ccsObject.node;
        this.setContentSize(layer.getContentSize());
        this.addChild(layer);

        //
        var topPanel = this._topPanel = ccui.helper.seekWidgetByName(layer, "topPanel");
        var centerPanel = this._centerPanel = ccui.helper.seekWidgetByName(layer, "centerPanel");
        var bottomPanel = this._bottomPanel = ccui.helper.seekWidgetByName(layer, "bottomPanel");

        var bgScrollPanel = this._bgScrollPanel = ccui.helper.seekWidgetByName(centerPanel, "bgScrollPanel");
    },

    getSelectedChartType:function()
    {
        return this._selectedChartType;
    },

    hide:function()
    {
        var actionNode = this._rootNode;
        if(actionNode.getNumberOfRunningActions() > 0){
            return;
        }
        this._isShowing = false;

        var self = this;
        actionNode.runAction(new cc.Sequence(
            new cc.ScaleTo(0.25, 0, 0),//.easing(cc.easeBackInOut())
            new cc.CallFunc(function(){
                self.setVisible(false);
            })
        ));

        this.saveConfig();
        cc.eventManager.dispatchCustomEvent(NOTIFY_CHART_CLOSE);
        //this._hideBarCheckBox.setSelected(false);
    },

    isSetHide:function()
    {
        //return this._hideBarCheckBox.isSelected();
    },

    show:function()
    {
        var actionNode = this._rootNode;
        if(actionNode.getNumberOfRunningActions() > 0){
            return;
        }
        this._isShowing = true;

        var self = this;
        actionNode.runAction(new cc.Sequence(
            new cc.CallFunc(function(){
                self.setVisible(true);
            }),
            new cc.ScaleTo(0.25, 1, 1)//.easing(cc.easeBackInOut())
        ));
    },

    isShowing:function(){
        return this._isShowing;
    },

    /**
     * 被设为常用的选择项
     * @param chartType
     * @returns {*}
     */
    getSelectedItemIndexesByType:function(chartType)
    {
        return this._selecteditemIndexesMap[chartType]
    },

    getSelectedItems:function()
    {
        var chartType = this._selectedChartType;
        var indexes = this._selecteditemIndexesMap[chartType];
        var toSelectedList = ClientConfig.getInstance().getChartItemTypes(chartType);
        var array = [];
        for(var i = 0; i < indexes.length; i++){
            array.push(toSelectedList[indexes[i]]);
        }
        return array;
    },

    /**
     *
     * @param {Number} index
     * @param {Number} chartType
     */
    getSelectedValue:function(index)
    {
        var chartType = this._selectedChartType;
        //cc.log("chartType::", chartType);
        //cc.log("this._selecteditemIndexesMap[chartType]::", JSON.stringify(this._selecteditemIndexesMap[chartType]));
        var items = ClientConfig.getInstance().getChartItemTypes(chartType);
        var filterIndex = this._selecteditemIndexesMap[chartType][index];
        if(filterIndex == undefined){
            return undefined;
        }
        return items[filterIndex];
    },

    /**
     * 选择的滚动容器
     */
    createScrollView:function(chartType)
    {
        var toSelectedList = ClientConfig.getInstance().getChartItemTypes(chartType);

        var btnArray = [];
        //待选择项
        for(var i = 0; i < toSelectedList.length; i++){
            var value = toSelectedList[i];
            if(value < 60){
                value += "s";
            }else if(value >= 60 && value < 3600){
                value = Math.floor(value/60)+"m";
            }else{
                value = Math.floor(value/3600)+"h";
            }
            var btn = this.createTimeBtn(chartType, i, value);
            btnArray.push(btn);
            var items = this._selecteditemIndexesMap[chartType];
            if(items){
                for(var t = 0; t < items.length; t++){
                    if(items[t] == i){
                        btn.setHighlighted(true);
                        break;
                    }
                }
            }
        }

        var panel = UICommon.createPanelAlignWidgetsWithPadding(13, cc.UI_ALIGNMENT_HORIZONTAL_CENTER, btnArray);
        panel = UICommon.createScrollViewWithContentPanel(panel, this._bgScrollPanel.getContentSize(), ccui.ScrollView.DIR_HORIZONTAL);
        //panel.setScrollBarPositionFromCorner(cc.p(0, -10));
        panel.setScrollBarEnabled(false);
        this._bgScrollPanel.addChild(panel);
        panel.setPos(leftInner(this._bgScrollPanel), ANCHOR_LEFT);

        return panel;
    },

    showScrollView:function(chartType)
    {
        var isCreated = false;
        var children = this._bgScrollPanel.getChildren();
        for(var i = 0; i < children.length; i++){
            var child = children[i];
            child.setVisible(false);
            if(child._chartType == chartType){
                child.setVisible(true);
                isCreated = true;
            }
        }

        if(!isCreated){
            var chartScrollView = this.createScrollView(chartType);
            chartScrollView._chartType = chartType;
        }
    },

    createTimeBtn:function(chartType,index, titleStr)
    {
        var timeBtn = new ccui.Button();
        timeBtn.loadTextureNormal("icon_transparent.png", ccui.Widget.LOCAL_TEXTURE);
        timeBtn.loadTexturePressed("btn_choice_time.png", ccui.Widget.PLIST_TEXTURE);
        timeBtn.setScale9Enabled(true);

        var highlightView = timeBtn._highlightView = new cc.Sprite("#btn_choice_time.png");
        timeBtn.setContentSize(highlightView.width, highlightView.height);

        highlightView.setVisible(false);
        timeBtn.addChild(highlightView);
        highlightView.setPos(centerInner(timeBtn), ANCHOR_CENTER);

        timeBtn.setTitleColor(cc.color(255, 127, 0, 255));
        timeBtn.setTitleText(titleStr);
        timeBtn.setTitleFontSize(28);

        timeBtn.setHighlighted = function(isHighlight)
        {
            timeBtn._isSelected = isHighlight;
            timeBtn._highlightView.setVisible(isHighlight);
            if(isHighlight){
                timeBtn.setTitleColor(cc.color(255, 127, 0, 255));
            }else{
                timeBtn.setTitleColor(cc.color(143, 162, 176, 255));
            }
        };
        timeBtn.setHighlighted(false);

        timeBtn.index = index;
        timeBtn.addClickEventListener(function(sender)
        {
            var timeBtn = sender;
            var index = sender.index;
            if(this.checkChooseValid(chartType, timeBtn._isSelected)){
                var items = this._selecteditemIndexesMap[chartType];
                if(timeBtn._isSelected){
                    var len = Math.max(items.length, this._maxSelectedItem);
                    for(var i = 0; i < len; i++){
                        if(items[i] == index){
                            items.splice(i, 1);
                            timeBtn.setHighlighted(false);
                            break;
                        }
                    }
                }else{
                    timeBtn.setHighlighted(true);
                    items.push(index);
                }
                //做排序
                items.sort(function(a, b){
                    if(a > b)
                        return true;
                    return false;
                });

                cc.eventManager.dispatchCustomEvent(NOTIFY_CHART_ITEM_SELECT_CHANGES);
            }
        }.bind(this));

        return timeBtn;
    },

    /**
     * 检测选择合法性
     */
    checkChooseValid:function(chartType, isSelected)
    {
        //已经高亮的
        if(isSelected){
            return this._selecteditemIndexesMap[chartType].length > 1
        }else{
            return this._selecteditemIndexesMap[chartType].length < this._maxSelectedItem;
        }
    },

    initChartPanel:function()
    {
        var btnNameArray = ["solidChart", "candleChart"];;
        var self = this;
        for(var i = 0; i < btnNameArray.length; i++)
        {
            var chartPanel = ccui.helper.seekWidgetByName(this._topPanel, btnNameArray[i]);
            var selectedImage = chartPanel._seletedImage = ccui.helper.seekWidgetByName(chartPanel, "selectedImage");
            var unselectedImage = chartPanel._unselectedImage = ccui.helper.seekWidgetByName(chartPanel, "unselectedImage");
            chartPanel.setTouchEnabled(true);
            selectedImage.setVisible(false);
            unselectedImage.setVisible(true);

            var tempChartType = this._chartTypeArray[i];
            chartPanel.chartType = tempChartType;
            chartPanel.setEnabled = function(isEnable)
            {
                //上一个选择的
                if(isEnable && self._selectedChart){
                    self._selectedChart._seletedImage.setVisible(!isEnable);
                    self._selectedChart._unselectedImage.setVisible(isEnable);
                }

                if(isEnable){
                    this._seletedImage.setVisible(isEnable);
                    this._unselectedImage.setVisible(!isEnable);
                    self._selectedChart = this;
                    self._selectedChartType = this.chartType;
                }else{
                    this._seletedImage.setVisible(!isEnable);
                    this._unselectedImage.setVisible(isEnable);
                }
            };

            chartPanel.addClickEventListener(function(sender)
            {
                if(this._selectedChartType == sender.chartType)
                    return;
                sender.setEnabled(true);
                this.chartSelected(this._selectedChartType);
            }.bind(this));

            if(this._selectedChartType == tempChartType){
                chartPanel.setEnabled(true);
            }
        }

        this.chartSelected(this._selectedChartType);
    },

    chartSelected:function(chartType)
    {
        this.showScrollView(chartType);
        cc.eventManager.dispatchCustomEvent(NOTIFY_CHART_SELECT_CHANGES, chartType);
    },

    initByConfig:function()
    {
        var chartTypeArray = this._chartTypeArray;
        for(var i = 0; i < chartTypeArray.length; i++){
            var chartType = chartTypeArray[i];
            //本地保存的选择项
            var key = "chartType_" + Player.getInstance().getId() + "_" + chartType;
            var arrayStr = cs.getItem(key);
            if(arrayStr != null){
                this._selecteditemIndexesMap[chartType] = arrayStr.split(",");
            }else{
                this._selecteditemIndexesMap[chartType] = [0,1,2,3,4];
            }
        }
    },

    saveConfig:function()
    {
        //游客或者退出状态下 不做保存
        if(Player.getInstance().isLimited()){
            return;
        }
        var chartTypeArray = this._chartTypeArray;
        for(var i = 0; i < chartTypeArray.length; i++){
            var chartType = chartTypeArray[i];
            //本地保存的选择项
            var key = "chartType_" + Player.getInstance().getId() + "_" + chartType;
            var itemIndexes = this._selecteditemIndexesMap[chartType];
            var saveItem = itemIndexes.join(",");
            cs.setItem(key, saveItem);
        }
    }
});