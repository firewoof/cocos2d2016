/**
 * Created by Jony on 2016/9/9
 */

var MoneyFlowLayer = cc.Layer.extend({
    _moneyFlowTimeConfig:[],
    _moneyFlowTypeConfig: [],
    _fundsPage:1,
    _isFullScreenOpaque:true,

    ctor:function(index)
    {
        this._super();

        //UI
        this.initUI();

        //var touchPanel = this._touchPanel = new ccui.Layout();
        //touchPanel.setContentSize(cc.winSize);
        //this.addChild(touchPanel);
        //touchPanel.setTouchEnabled(true);

        //点击事件
        this.initAllClickFunc();

        this.initMoneyFlowList();

    },

    cleanup:function(){
        cc.log(" cleanup:function(){");

        this.removeAllCustomListeners();

        this._super();
    },

    initUI:function()
    {
        var layer = ccs.loadWithVisibleSize(res.MoneyFlowLayer_json).node;
        // 加入到当前layer中。
        this.addChild(layer);
        // 按钮
        var titlePanel = this._titlePanel = ccui.helper.seekWidgetByName(layer, "titlePanel");
        // 返回按钮
        var backBtn = this._backBtn = ccui.helper.seekWidgetByName(titlePanel, "backBtn");

        var titleTxt = this._titleTxt = ccui.helper.seekWidgetByName(layer, "titleTxt");
        var moneyPanel = this._moneyPanel = ccui.helper.seekWidgetByName(layer, "moneyPanel");

        var beforeBtn = this._beforeBtn = ccui.helper.seekWidgetByName(moneyPanel, "beforeBtn");
        var afterBtn = this._afterBtn = ccui.helper.seekWidgetByName(moneyPanel, "afterBtn");

        var timeBtn = this._timeBtn = ccui.helper.seekWidgetByName(moneyPanel, "timeBtn");
        var timeBtnTxt = this._timeBtnTxt = ccui.helper.seekWidgetByName(timeBtn, "txt");
        var timeBtnDirectionImage = this._timeBtnDirectionImage = ccui.helper.seekWidgetByName(timeBtn, "directionImage");
        var timePanel = this._timePanel = ccui.helper.seekWidgetByName(moneyPanel, "timePanel");

        var typeBtn = this._typeBtn = ccui.helper.seekWidgetByName(moneyPanel, "typeBtn");
        var typeBtnTxt = this._typeBtnTxt = ccui.helper.seekWidgetByName(typeBtn, "txt");
        var typeBtnDirectionImage = this._typeBtnDirectionImage = ccui.helper.seekWidgetByName(typeBtn, "directionImage");
        var typePanel = this._typePanel = ccui.helper.seekWidgetByName(moneyPanel, "typePanel");

        this._moveY = typeBtn.height - 2;

        var moneyListPanel = this._moneyListPanel = ccui.helper.seekWidgetByName(moneyPanel, "listPanel");
        var moneyTitlePanel = this._moneyTitlePanel = ccui.helper.seekWidgetByName(moneyListPanel, "titlePanel");

        this._moneyFlowScrollview = ccui.helper.seekWidgetByName(moneyListPanel, "panel");

        //页数标题
        var pageTxtPanel = this._pageTxtPanel = ccui.helper.seekWidgetByName(moneyPanel, "pageTxtPanel");
        var curPage = this._curPage = ccui.helper.seekWidgetByName(pageTxtPanel, "curPage");
        var sumPage = this._sumPage = ccui.helper.seekWidgetByName(pageTxtPanel, "sumPage");

        //点击层，点击以后标题筛选层消失
        var clickPanel = this._clickPanel = ccui.helper.seekWidgetByName(moneyPanel, "clickPanel");
        clickPanel.setSwallowTouches(false);

        this._sumPage.setString(1);
        this._curPage.setString(1);
    },

    initAllClickFunc:function()
    {
        ////屏幕点击层
        //this._touchPanel.addClickEventListener(function(sender){
        //    this._timePanel.setVisible(false);
        //    this._typePanel.setVisible(false);
        //})
        //屏幕点击层
        this._clickPanel.addClickEventListener(function(sender){
            if(this._timePanel.isVisible()){
                this._timeBtnDirectionImage.setRotation(0);
                this._timePanel.setVisible(false);
            }
            if(this._typePanel.isVisible()){
                this._typeBtnDirectionImage.setRotation(0);
                this._typePanel.setVisible(false);
            }
        }.bind(this));

        ////点击内部数据时也应该执行屏幕点击层的操作
        //this._moneyFlowScrollview.addClickEventListener(function(sender){
        //    if(this._timePanel.isVisible()){
        //        this._timeBtnDirectionImage.setRotation(0);
        //        this._timePanel.setVisible(false);
        //    }
        //    if(this._typePanel.isVisible()){
        //        this._typeBtnDirectionImage.setRotation(0);
        //        this._typePanel.setVisible(false);
        //    }
        //}.bind(this));

        // 返回
        this._backBtn.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            MainController.popLayerFromRunningScene(this);
        }.bind(this));

        this._timeBtn.addClickEventListener(function(sender)
        {
            this.showTimeTypeSelectedPanel(sender);
        }.bind(this));

        this._typeBtn.addClickEventListener(function(sender)
        {
            this.showTimeTypeSelectedPanel(sender);
        }.bind(this));

        this._beforeBtn.addClickEventListener(function(sender)
        {
            //当前页必须》1才刷新
            var successCallBack = function(data){
                MainController.getInstance().hideLoadingWaitLayer();
                if(data.tableContentList!= undefined){
                    if(data.tableContentList.length > 0 && data.pageIndex == this._fundsPage - 1 && this._fundsPage > 1){
                        this._fundsPage -= 1;
                    }
                    cc.log("当前页数：", this._fundsPage);
                    if(data.pageIndex>=1){
                        this.titleTextSetPos(data.tableContentList, data.tableTitle);
                        this.refershTableContentList(data.tableContentList, data.tableTitle, data.pageIndex, data.pageCount, true);
                    }
                }
            }.bind(this);
            HttpManager.requestFundDetail(successCallBack, this._moneyFlowTime,this._moneyFlowType,this._fundsPage - 1);
            MainController.getInstance().showLoadingWaitLayer();
        }.bind(this));

        this._afterBtn.addClickEventListener(function(sender)
        {
            var successCallBack = function(data){
                MainController.getInstance().hideLoadingWaitLayer();
                if(data.tableContentList != undefined){
                    if(data.tableContentList.length > 0 && this._fundsPage < data.pageCount && data.pageIndex == this._fundsPage + 1){
                        this._fundsPage += 1;
                    }
                    this.titleTextSetPos(data.tableContentList, data.tableTitle);
                    this.refershTableContentList(data.tableContentList, data.tableTitle, data.pageIndex, data.pageCount, true);
                }
            }.bind(this);
            HttpManager.requestFundDetail(successCallBack, this._moneyFlowTime,this._moneyFlowType,this._fundsPage + 1);
            MainController.getInstance().showLoadingWaitLayer();
        }.bind(this));

    },

    // 资金流水页面
    showTimeTypeSelectedPanel: function(sender)
    {
        var panel = (sender == this._timeBtn) ? this._timePanel : this._typePanel;

        var directionImage = (sender == this._timeBtn) ? this._timeBtnDirectionImage : this._typeBtnDirectionImage;
        var visible = panel.isVisible();
        if(!visible)
            {
            directionImage.setRotation(180);
            //panel.runAction(cc.sequence(cc.callFunc(function() {
            //    panel.setVisible(true);
            //    //this.refreshTimeTypeSelectedList(panel);
            //}.bind(this)) , cc.moveBy(0.1,cc.p(0, -this._moveY)) ));
            panel.setVisible(true);
        }
        else
        {
            directionImage.setRotation(0);
            //panel.runAction(cc.sequence(cc.moveBy(0.05,cc.p(0, this._moveY)), cc.callFunc(function() { panel.setVisible(false);} )));
            panel.setVisible(false);
        }
    },
    /*
     * */
    initTimeTypeSelectedList: function(panel, config, clickcallback)
    {
        var array = [];
        for (var i = 0; i < config.length; i++) {
            var cell = new MoneyFlowSelectedCell(config[i], clickcallback);
            array.push(cell);
        }
        var playerPanel = UICommon.createPanelAlignWidgetsWithPadding(0, cc.UI_ALIGNMENT_VERTICAL_CENTER, array);
        if(playerPanel.height > panel.height){
            playerPanel = UICommon.createScrollViewWithContentPanel(playerPanel, cc.size(playerPanel.width, panel.height), ccui.ScrollView.DIR_VERTICAL);
        }

        panel.addChild(playerPanel);
        playerPanel.setPos(cc.p(0, 10), ANCHOR_LEFT_BOTTOM);
    },

    refershTableContentList: function(tableContentList,typeTitle,pageIndex,pageCount,refresh)
    {
        //this._beforeBtn.setGray(this._fundsPage <= 0);
        //this._afterBtn.setGray(tableContentList.length == 0);
        cc.log("pageCount", pageCount);
        cc.log("pageIndex", pageIndex);
        cc.log("this._fundsPage::", this._fundsPage);


        if(tableContentList == undefined){
            this._sumPage.setString(1);
            this._curPage.setString(1);
        }
        else{
            this._sumPage.setString(pageCount);
            this._curPage.setString(pageIndex);
            //this._fundsPage.setString(pageIndex);
        }
        cc.log("_sumPage", this._sumPage.getString());
        cc.log("_curPage", this._curPage.getString());
        this._moneyFlowScrollview.removeAllChildren();
        // TODO
        if(this._fundsPage == 1 && this._curPage.getString() == 1) {
            this._beforeBtn.setColor(cc.color.GRAY);
            this._beforeBtn.setTouchEnabled(false);
        }
        else {
            this._beforeBtn.setColor(cc.color.WHITE);
            this._beforeBtn.setTouchEnabled(true);
        }
        if(pageCount === undefined ||this._fundsPage == pageCount && this._curPage.getString() == pageCount) {
            this._afterBtn.setColor(cc.color.GRAY);
            this._afterBtn.setTouchEnabled(false);
        }
        else {
            this._afterBtn.setColor(cc.color.WHITE);
            this._afterBtn.setTouchEnabled(true);
        }

        if(refresh || tableContentList.length > 0)
        {
            var array = [];
            for (var i = 0; i < tableContentList.length; i++) {
                var cell = new MoneyFlowDataCell(tableContentList[i], typeTitle, this._titlePosArray);
                array.push(cell);
            }

            var playerPanel = UICommon.createPanelAlignWidgetsWithPadding(0, cc.UI_ALIGNMENT_VERTICAL_CENTER, array);
            if(playerPanel.height > this._moneyFlowScrollview.height){
                playerPanel = UICommon.createScrollViewWithContentPanel(playerPanel, cc.size(this._moneyFlowScrollview.width, this._moneyFlowScrollview.height), ccui.ScrollView.DIR_VERTICAL);
                playerPanel.setScrollBarAutoHideEnabled(true);
                playerPanel.setScrollBarAutoHideTime(0);
            }
            this._moneyFlowScrollview.addChild(playerPanel);
            playerPanel.setPos(cc.p(this._moneyFlowScrollview.width * 0.5, this._moneyFlowScrollview.height), ANCHOR_TOP);
        }

    },

    refreshTableTitle: function(tableTitle)
    {
        for(var i = 0;i<tableTitle.length;i++)
        {
            this["_titlePanelTxt"+i].setString(tableTitle[i]);
        }
    },

    initMoneyFlowList: function()
    {
        if(!this._initMoneyFlowList)
        {
            this._fundsPage = 1;

            var successCallBack = function(data){
                cc.log("显示资金流水");

                this._moneyFlowTypeConfig = [];
                for(var k in data.fundsType)
                {
                    this._moneyFlowTypeConfig.push({code:k,txt:data.fundsType[k]});
                }
                this._moneyFlowTimeConfig = [];
                for(var k in data.fundsTime)
                {
                    this._moneyFlowTimeConfig.push({code:k,txt:data.fundsTime[k]});
                }

                this._moneyFlowTime = this._moneyFlowTimeConfig[0].code;
                //this._moneyFlowType = this._moneyFlowTypeConfig[0].code;
                this._moneyFlowType = 100;

                //初始化时间选择项列表
                this.initTimeTypeSelectedList(this._timePanel, this._moneyFlowTimeConfig, this.typeSelected.bind(this));
                //初始化类型选择项列表
                this.initTimeTypeSelectedList(this._typePanel, this._moneyFlowTypeConfig, this.timeSelected.bind(this));

                var self = this;
                //等资金流水页面打开完以后请求数据
                self.runAction(new cc.Sequence(
                        new cc.DelayTime(0.31),
                        new cc.CallFunc(function(){
                            self.selectedRequest();
                        })
                    ));
            }.bind(this);

            HttpManager.requestFundsConfig(successCallBack);
            this._initMoneyFlowList = true;
        }
    },

    typeSelected:function(data)
    {
        this._timeBtnTxt.setString(data.txt);
        this.showTimeTypeSelectedPanel(this._timeBtn);
        if(this._moneyFlowTime == data.code){
            return;
        }
        //this._fundsPage == 0;
        this._timeBtnTxt.setString(data.txt);
        this._moneyFlowTime = data.code;
        this.selectedRequest();
        cc.log("显示aaaaa资金流水");
    },

    /**
    *
    * @param code
    * @param txt
    */
    timeSelected:function(data)
    {
        this.showTimeTypeSelectedPanel(this._typeBtn);
        if(this._moneyFlowType == data.code) return;
        this._typeBtnTxt.setString(data.txt);
        this._moneyFlowType = data.code;

        this.selectedRequest();
        cc.log("显示aaaaa资金流水::", JSON.stringify(data));
    },

    titleTextSetPos: function(tableContentList, typeTitle)
    {
        this._moneyTitlePanel.removeAllChildren();
        var titlePanel =  this._moneyTitlePanel;

        if(!tableContentList || !typeTitle)
        {
            cc.log("tableContentList/typeTitle is null");
            return;
        }

        for(var i = 0; i < typeTitle.length; i++){
            var panel = titlePanel["_panelTitle" + i] = new ccui.Layout();
            titlePanel.addChild(panel);
            panel["_titlePanelTxt" + i] = new cc.LabelTTF(typeTitle[i], FONT_ARIAL_BOLD, 28);
            panel.addChild(panel["_titlePanelTxt" + i]);
        }

        //遍历数据，将每列的最大宽度保存起来
        for(var i = 0; i < tableContentList.length; i++){
            for(var k = 0; k < typeTitle.length; k++){
                var panel = titlePanel["_panelTitle" + k];
                var label = panel["_titlePanelTxt" + k];
                //var label = new cc.LabelTTF(tableContentList[i][k], FONT_ARIAL_BOLD, 28);
                label.setString(tableContentList[i][k]);
                var width = label.width;
                //cc.log("length:", width);

                var kMaxWidth = this["_textLength" + k];
                var fontSize = label.getFontSize();
                if(!kMaxWidth || width > kMaxWidth){
                    if(k == 0 || k == typeTitle.length - 1){
                        if(width < fontSize * 6){
                            width = fontSize * 6; //开头和结尾的标题最小6个字符大小
                        }
                    }
                    this["_textLength" + k] = width;
                }
            }
        };

        //定义最大宽度
        var textLengthSum = this._textLengthSum = 0;

        //将最大宽度保存起来
        for(var k = 0; k < typeTitle.length; k++){
            textLengthSum = this["_textLength" + k] + textLengthSum;
         };

        //cc.log("SumWidth:", textLengthSum);

        //算出每一列的间隔
        var textInterval = (titlePanel.width - textLengthSum)/(typeTitle.length - 1);

        //cc.log("textInterval:", textInterval);

        //定义下一个panel的起始距离
        var panelWidthStart = 0;

        //给每列增加一个panel等会让text更好摆放,并将其加入到titilePanel中,并加入到数组中
        var titlePosArray = this._titlePosArray = [];

        for(var i = 0; i < typeTitle.length; i++){
            var panel = titlePanel["_panelTitle" + i];
            panel.setContentSize(this["_textLength" + i], titlePanel.height);
            panel.setAnchorPoint(1, 0.5);
            if(i != typeTitle.length - 1){
                panel.setPosition(panel.width + textInterval * i + panelWidthStart, titlePanel.height/2);
            }
            else{
                panel.setPosition(panel.width + textInterval * i + panelWidthStart, titlePanel.height/2);
            }
            panelWidthStart =  panel.width +  panelWidthStart;

            //创建每列标题并将其加入到对应的panel中
            var titlePanelText = panel["_titlePanelTxt" + i];
            titlePanelText.setString(typeTitle[i]);
            titlePanelText.setColor(cc.color(21,25,26));
            titlePanelText.setPos(centerInner(panel), ANCHOR_CENTER);
            titlePosArray.push(panel.x - panel.width/2);
            //cc.log("XXXX:",panel.width + textInterval * i + panelWidthStart);
        };
    },

    selectedRequest: function(){
        //初始化页数
        this._fundsPage = 1;

        var successCallBack = function(data){
            MainController.getInstance().hideLoadingWaitLayer();
            cc.log("tableContentList:", JSON.stringify(data));
            this.titleTextSetPos(data.tableContentList, data.tableTitle);
            this.refershTableContentList(data.tableContentList, data.tableTitle, data.pageIndex, data.pageCount, true);
        }.bind(this);
        HttpManager.requestFundDetail(successCallBack, this._moneyFlowTime, this._moneyFlowType);
        MainController.getInstance().showLoadingWaitLayer();

        //new HttpRequest("fundsDetail", req, function(data){
        //    this._fundsPage = 1;
        //    this.titleTextSetPos(data.tableContentList, data.tableTitle);
        //    this.refershTableContentList(data.tableContentList, data.tableTitle, data.pageIndex, data.pageCount, true);
        //}.bind(this));

    }
});


/**
 * Created by Jony on 2016/9/13.
 */
/*
 * 资金流水筛选cell
 * */
var MoneyFlowSelectedCell = ccui.Layout.extend({
    _data: undefined,
    _clickCallback: undefined,

    ctor:function( data, clickCallback )
    {
        this._super();
        this.setContentSize(cc.size(490,66));
        this._data = data;
        this._clickCallback = clickCallback;

        this.initUI();
    },

    cleanup:function()
    {
        this._super();
    },

    initUI:function( )
    {
        var name = new ccui.Text(this._data.txt, FONT_ARIAL_BOLD, 24);
        name.setTextColor(cs.BLACK);
        this.addChild(name);
        name.setPos(leftInner(this), ANCHOR_LEFT);
        name.setPositionXAdd(40);
        //响应点击面板
        var touchPanel = this._touchPanel = ccui.Layout();
        touchPanel.setContentSize(this.getContentSize());
        this.addChild(touchPanel);
        touchPanel.setTouchEnabled(true);
        touchPanel.addClickEventListener(function() {
            this._clickCallback(this._data);

            //this.setHighlight(true);
        }.bind(this));


        this.setHighlight();

        //var draw = new cc.DrawNode();
        //this.addChild(draw);
        //draw.drawSegment(cc.p(0, 0), cc.p(490, 0), 1, cs.GRAY);
    },

    setHighlight:function(isHighLight)
    {
        if(isHighLight || isHighLight == undefined)
        {
            this.setBackGroundColorEx(cc.color(255, 255, 255));
            this.setBackGroundColorOpacity(0);
        }
        else
        {
            this.setBackGroundColorEx(cc.color(45, 75, 109));
        }
    }
});

/*
 * 单条流水cell(已经废弃)
 **/
var MoneyFlowInfoCell = ccui.Layout.extend({
    _fundsInfo:undefined,

    ctor:function(fundsInfo)
    {
        this._super();
        this.setContentSize(cc.size(1244,60));
        this._fundsInfo = fundsInfo;

        this.initUI();

        this.refresh();
    },

    cleanup:function()
    {
        this.removeAllCustomListeners();

        this._super();
    },

    initUI:function( )
    {
        var txtArray = [];
        // 日期
        this._txt0 = txtArray[0] = new ccui.Text("12月15日", FONT_ARIAL_BOLD, 24);
        this.addChild(this._txt0);
        this._txt0.setColor(cs.BLACK);
        //this._txt0.setPositionPercent(cc.p(1/6,0.5));
        this._txt0.setPosition(0.1029*this.width, this.height/2);

        //类型
        this._txt1 = txtArray[1] = new ccui.Text("维护赔偿", FONT_ARIAL_BOLD, 24);
        this.addChild(this._txt1);
        this._txt1.setColor(cs.BLACK);
        this._txt1.setPos(cc.p(0.2910*this.width, this.height/2), ANCHOR_CENTER);

        //资金
        this._txt2 = txtArray[3] = new ccui.Text("-10000", FONT_ARIAL_BOLD, 24);
        this.addChild(this._txt2);
        this._txt2.setPos(cc.p(0.4405*this.width, this.height/2), ANCHOR_CENTER);

        //余额
        this._txt4 = txtArray[5] = new ccui.Text("9999", FONT_ARIAL_BOLD, 24);
        this.addChild(this._txt4);
        this._txt4.setColor(cs.BLACK);
        this._txt4.setPos(cc.p(0.5748*this.width,this.height/2), ANCHOR_CENTER);

        //状态
        this._txt3 = txtArray[4] = new ccui.Text("已审核", FONT_ARIAL_BOLD, 24);
        this.addChild(this._txt3);
        this._txt3.setColor(cs.BLACK);
        this._txt3.setPos(cc.p(0.7186*this.width, this.height/2), ANCHOR_CENTER);

        //详情
        this._txt5 = txtArray[6] = new ccui.Text("已审核", FONT_ARIAL_BOLD, 24);
        this.addChild(this._txt5);
        this._txt5.setColor(cs.BLACK);
        this._txt5.setPos(cc.p(0.8907*this.width, this.height/2), ANCHOR_CENTER);

        var line = new cc.LayerColor(cc.color(255,255,255,255), 1212, 1);
        this.addChild(line);
        line.setPos(cc.p(0,0), ANCHOR_LEFT_BOTTOM);


        //var draw = new cc.DrawNode();
        //this.addChild(draw);
        //draw.drawSegment(cc.p(20, 0), cc.p(1030, 0), 1, cc.color(255, 255, 255, 255));
    },

    refresh:function()
    {
        var _fundsInfo = this._fundsInfo;

        for(var i = 0; i < 6; i++)
        {
            if(i == 2)
            {
                if(_fundsInfo[i] > 0)
                {
                    this["_txt" + i].setString("+"+_fundsInfo[i]);
                    this["_txt" + i].setColor(cs.GREEN);
                }
                else
                {
                    this["_txt" + i].setString(_fundsInfo[i]);
                    this["_txt" + i].setColor(cs.RED);
                }
            }
            else
                this["_txt" + i].setString(_fundsInfo[i]);
        }
    }
});

/**
 * 新单挑流水cell2017/1/10
 */

var MoneyFlowDataCell = ccui.Layout.extend({
    _fundsInfo: undefined,
    _arrayPos: undefined,
    _typeTitle: undefined,

    ctor: function (fundsInfo, typeTitle, arrayPos) {
        this._super();
        this.setContentSize(cc.size(1244, 60));
        this._fundsInfo = fundsInfo;
        this._arrayPos = arrayPos;
        this._typeTitle = typeTitle;

        this.initUI();

        this.refresh();
    },

    cleanup: function () {
        this.removeAllCustomListeners();

        this._super();
    },

    initUI: function () {
        var txtArray = this._txtArray = [];

        for (var i = 0; i < this._typeTitle.length; i++) {
            var txt = this["_txt" + i] = new ccui.Text("12月15日", FONT_ARIAL_BOLD, 24);
            this.addChild(txt);
            txt.setColor(cs.BLACK);
            if(this._arrayPos){
                txt.setPos(cc.p(this._arrayPos[i], this.height/2), ANCHOR_CENTER);
            }
            txtArray.push(txt);
        }

        var line = new cc.LayerColor(cc.color(255, 255, 255, 255), 1212, 1);
        this.addChild(line);
        line.setPos(cc.p(16, 1), ANCHOR_LEFT_BOTTOM);
    },

    refresh:function()
    {
        var _fundsInfo = this._fundsInfo;

        for(var i = 0; i < this._typeTitle.length; i++)
        {
            var text = this["_txt" + i];
            if(i == 2 || (i==3 && this._typeTitle.length == 6))
            {
                if(!isNaN(_fundsInfo[i]))
                {
                    if(_fundsInfo[i] > 0)
                    {
                        text.setString("+"+_fundsInfo[i]);
                        text.setColor(cs.GREEN);
                    }
                    else
                    {
                        text.setString(_fundsInfo[i]);
                        text.setColor(cs.RED);
                    }
                }
                else
                {
                    text.setString(_fundsInfo[i]);
                }
            }
            else
            {
                text.setString(_fundsInfo[i]);
            }
        }
    }
})


