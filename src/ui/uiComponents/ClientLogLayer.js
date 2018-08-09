/**
 * Created by Jony on 2016/11/1
 * 客户端日志界面
 */
GB.LOG_TYPE_REQUEST = "Request";
GB.LOG_TYPE_NORMAL = "Normal";
var LogModel = cc.Class.extend({
    _type:0,        //日志类型
    _time:0,        //log time

    //#网络请求相关
    //_urlKey:"",     //请求的接口urlKey
    _content:null,    //
    _requestArgs:undefined,
    _processLogs:undefined,

    ctor:function(){
        this._requestArgs = {};
        this._processLogs = [];
        this._type = GB.LOG_TYPE_NORMAL;

        var logs = DataPool.logs = DataPool.logs || [];
        logs.push(this);
        //缓冲下 每超过50条删一次
        if(logs.length > (MaxCollectNum+50))
        {
            logs.splice(0, 50);
        }
    }
});

LogModel.generateLogFile = function(){
    var logs = DataPool.logs;
    var len = logs.length;
    var strArray = [];
    for(var i = len  - 1; i >= 0; i--){
        strArray.push("--------------------------------------------------------------");
        var logInfo = logs[i];
        var requestArgs = logInfo.getRequestArgs();
        var processLogs = logInfo.getProcessLogs();
        if(processLogs[0]) strArray.push(processLogs[0] + JSON.stringify(requestArgs["sendData"]));
        if(processLogs[1]) strArray.push(processLogs[1]);
        if(processLogs[2]) strArray.push(processLogs[2]);
        if(processLogs[3]) strArray.push(processLogs[3]);
        strArray.push(logInfo.getContent() || "");
    }
    var str = strArray.join("\r\n");

    var fileName = Player.getInstance().getNickName() + "_" + cs.getCurSecs()+".txt";
    cs.writeStringToFile(fileName, str);
    return fileName;
};

LogModel.prototype.getType = function() {
    return this._type;
};

LogModel.prototype.setType = function(type) {
    this._type = type;
};

LogModel.prototype.getRequestArgs = function() {
    return this._requestArgs;
};

LogModel.prototype.setRequestArgs = function(urlKey) {
    this._requestArgs = urlKey;
};

LogModel.prototype.getContent = function() {
    return this._content;
};

LogModel.prototype.setContent = function(content) {
    this._time = cs.getCurSecs();
    this._content = content;
};

LogModel.prototype.pushProcessLog = function(logStr) {
    var timeStr = null;
    if(this._processLogs.length == 0){
        timeStr = TimeHelper.formatSecs(cs.getCurSecs());
    }else{
        timeStr = TimeHelper.formatSecs(cs.getCurSecs(), "HH:mm:ss");
    }
    this._processLogs.push(timeStr + " " +logStr);
};

LogModel.prototype.getProcessLogs = function() {
    return this._processLogs;
};

var ClientLogLayer = BaseLayer.extend({
    _lastShowPanel: "",
    _initDataPoolLogPanel: false,
    _initSolidLogPanel: false,

    ctor:function()
    {
        this._super("ClientLogLayer");
        this._logInfoArray = [];

        //UI
        this.initUI();
        //点击事件
        this.initAllClickFunc();

        this.addListener();
    },

    addListener:function(){
        this._fileUpLoadSuccessListener = cc.eventManager.addCustomListener(NOTIFY_UPLOAD_FILE_SUCCESS, function(event) {
            cc.log("NOTIFY_UPLOAD_FILE_SUCCESS receive");
            var userData = event.getUserData();
            var fileName = userData["fileName"];
            var url = userData["url"];
            MainController.showAutoDisappearAlertByText("日志文件上传成功！");
            cc.log("userData::", JSON.stringify(userData));
            MainController.getInstance().hideLoadingWaitLayer();
        }.bind(this));
    },

    initUI:function()
    {
        var layer = ccs.loadWithVisibleSize(res.ClientLogLayer_json).node;
        // 加入到当前layer中。
        this.addChild(layer);
        // 按钮
        var backBtn = this._backBtn = ccui.helper.seekWidgetByName(layer, "backBtn");

        var mainPanel = this._lastShowPanel = this._mainPanel = ccui.helper.seekWidgetByName(layer, "mainPanel");
        var evalJSBtn = this._evalJSBtn = ccui.helper.seekWidgetByName(mainPanel, "evalJSBtn");
        var dataPoolLogBtn = this._dataPoolLogBtn = ccui.helper.seekWidgetByName(mainPanel, "dataPoolLogBtn");
        var solidLogBtn = this._solidLogBtn = ccui.helper.seekWidgetByName(mainPanel, "solidLogBtn");


        var uploadBtn = this._uploadBtn = ccui.helper.seekWidgetByName(layer, "uploadBtn");

        //
        this._logCell = ccui.helper.seekWidgetByName(mainPanel, "logCell");

        var evalJSPanel = this._evalJSPanel = ccui.helper.seekWidgetByName(layer, "evalJSPanel");
        var evalEditBoxBg = ccui.helper.seekWidgetByName(evalJSPanel, "evalEditBoxBg");
        this._evalEditBox = new cc.EditBox(evalEditBoxBg.getContentSize(),new cc.Scale9Sprite("common_window_small.png"));
        evalEditBoxBg.addChild(this._evalEditBox);
        this._evalEditBox.setPosition(centerInner(evalEditBoxBg));
        this._evalEditBox.setFontSize(24);
        //this._evalEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
        this._evalEditBox.setPlaceHolder("请输入JS指令");
        this._evalEditBox.setPlaceholderFontColor(cc.color.GRAY);
        this._evalEditBox.setPlaceholderFontSize(24);
        this._evalEditBox.setDelegate(this);

        var doEvalJSBtn = this._doEvalJSBtn = ccui.helper.seekWidgetByName(evalJSPanel, "evalBtn");
        var resultPanel = ccui.helper.seekWidgetByName(evalJSPanel, "resultPanel");
        var evalResultTxt = this._evalResultTxt = ccui.helper.seekWidgetByName(resultPanel, "result");


        var dataPoolLogPanel = this._dataPoolLogPanel = ccui.helper.seekWidgetByName(layer, "dataPoolLogPanel");
        var solidLogPanel = this._solidLogPanel = ccui.helper.seekWidgetByName(layer, "solidLogPanel");
    },

    initAllClickFunc:function()
    {
        // 返回
        this._backBtn.addClickEventListener(function(sender)
        {
            if(this._lastShowPanel == this._mainPanel)
            {
                MainController.playButtonSoundEffect(sender);
                MainController.popLayerFromRunningScene(this);
            }
            else
            {
                this.showPanel(this._mainPanel);
            }
        }.bind(this));

        this._evalJSBtn.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            this.showPanel(this._evalJSPanel);
        }.bind(this));

        this._dataPoolLogBtn.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            this.showPanel(this._dataPoolLogPanel);
            if(!this._logListPanel){
                this.initDataPoolLogPanel();
            }
            else{
                this._logListPanel.reload();
            }
        }.bind(this));

        this._solidLogBtn.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            this.showPanel(this._solidLogPanel);
            if(!this._initSolidLogPanel)
                this.initSolidLogPanel();
        }.bind(this));

        this._doEvalJSBtn.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            //var str = "DataPool.accessToken";
            //var str = "cc.eventManager.dispatchCustomEvent(NOTIFY_EXCHANGE_TO_REGISTER);";
            var str = this._evalEditBox.getString().trim();
            var out = eval(str);
            if(out)
                this._evalResultTxt.setString(out.toString());
        }.bind(this));

        this._uploadBtn.addClickEventListener(function(sender)
        {
            var confirmLayer = MainController.getAlertLayer("确定上传日志文件吗？");
            MainController.pushLayerToRunningScene(confirmLayer);
            confirmLayer.setOkButtonCallFunc(function(){
                MainController.getInstance().uploadLogFile();
            }.bind(this));
        }.bind(this));
    },

    showPanel: function( panel )
    {
        panel.setVisible(true);
        this._lastShowPanel.setVisible(false);
        this._lastShowPanel = panel;
    },

    initDataPoolLogPanel: function()
    {
        cc.log("this._logCell::",this._logCell);
        var logListPanel = new LogListLayer(this._dataPoolLogPanel.getContentSize(), this._logCell);
        this._dataPoolLogPanel.addChild(logListPanel);
        logListPanel.setPos(cc.p(this._dataPoolLogPanel.width* 0.5, this._dataPoolLogPanel.height), ANCHOR_TOP);
        this._logListPanel = logListPanel;
    },

    initSolidLogPanel: function()
    {
        //读取文件
        cs.readJsonFromFile("solidLog.json", function(solidLogArray){
            var txtArr = [];
            for(var i = 0;i < solidLogArray.length; i++)
            {
                if(i>100) break;
                var data = solidLogArray[i];
                //var txt = new ccui.Text(data["time"] +":"+ data["content"], FONT_ARIAL_BOLD, 12);
                var txt = UIString.scriptToRichTextEx("<l c=ffffff>"+ data["time"] +":"+ data["content"] + "</l>", 1300, "Arial", 16, cc.WHITE);
                txtArr.push(txt);
            }

            var playerPanel = UICommon.createPanelAlignWidgetsWithPadding(8, cc.UI_ALIGNMENT_VERTICAL_CENTER, txtArr);
            var playerPanel = UICommon.createScrollViewWithContentPanel(playerPanel, cc.size(playerPanel.width, this._dataPoolLogPanel.height), ccui.ScrollView.DIR_VERTICAL);

            this._dataPoolLogPanel.addChild(playerPanel);
            playerPanel.setPos(cc.p(this._dataPoolLogPanel.width* 0.5, this._dataPoolLogPanel.height), ANCHOR_TOP);

            this._initSolidLogPanel = true;
        }.bind(this))
    }
});

var LogListLayer = cc.Layer.extend({

    ctor:function(size, templateCell){
        this._super();
        this.setContentSize(size);
        this._templateCell = templateCell;

        this._logInfoArray = [];
        this._logInfoArray = ALCommon.shallowClone(DataPool.logs).reverse();

        this.initTabView();
    },

    reload:function(){
        this._logInfoArray = ALCommon.shallowClone(DataPool.logs).reverse();
        this._tableView.reloadData();
    },

    initTabView:function()
    {
        var self = this;
        var cellSize = cc.size(self.width, self._templateCell.height);
        var delegate = cc.Class.extend({

            ctor: function() {},

            tableCellWillRecycle:function(table, cell){
            },
            numberOfCellsInTableView:function (table) {
                var number = self._logInfoArray.length;
                return number;
            },
            tableCellTouched:function (table, cell) {
            },

            tableCellSizeForIndex:function (table, idx) {
                return cellSize;
            },

            tableCellAtIndex:function (table, idx) {
                //cc.log("idx::", idx);
                var cell = table.dequeueCell();
                var info = self._logInfoArray[idx];
                try{
                    if (cell == null) {
                        cell = new cc.TableViewCell();
                        var content = self.createLogCell();
                        cell.addChild(content);
                        content.setPosition(centerInner(cell));
                        cell._content = content;
                    }
                    cell._content.refresh(info);

                }catch (e)
                {
                    cc.log(e.stack);
                    testSeverLog("logList::"+e.name + ": " + e.message);
                    //throw e
                }

                return cell;
            }
        });

        var delegate = new delegate();
        var tableView = new cc.TableView(delegate, cc.size(this.width, this.height));
        tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        tableView.setDelegate(delegate);
        tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);

        this.addChild(tableView);
        tableView.setPos(topInner(this), ANCHOR_TOP);
        this._tableView = tableView;
    },

    createLogCell:function(){
        var logCell = this._templateCell.clone();
        var logTypeText = logCell._logTypeText = ccui.helper.seekWidgetByName(logCell, "logTypeText");
        var paramsText = logCell._paramsText  = ccui.helper.seekWidgetByName(logCell, "paramsText");
        var processText_0 = logCell._processText_0  = ccui.helper.seekWidgetByName(logCell, "processText_0");
        var processText_1 = logCell._processText_1  = ccui.helper.seekWidgetByName(logCell, "processText_1");
        var processText_2 = logCell._processText_2  = ccui.helper.seekWidgetByName(logCell, "processText_2");
        var contentText = logCell._contentText  = ccui.helper.seekWidgetByName(logCell, "contentText");

        var replaceText = new  cc.LabelTTF("", FONT_ARIAL_BOLD, 22);
        UICommon.replaceWidget(logCell._logTypeText, replaceText);
        logCell._logTypeText =  replaceText;
        logCell._logTypeText.setColor(cs.GREEN);

        var replaceText = new  cc.LabelTTF("", FONT_ARIAL_BOLD, 22);
        UICommon.replaceWidget(logCell._paramsText, replaceText);
        logCell._paramsText =  replaceText;
        logCell._paramsText.setColor(cs.GREEN);

        var replaceText = new  cc.LabelTTF("", FONT_ARIAL_BOLD, 22);
        UICommon.replaceWidget(logCell._processText_0, replaceText);
        logCell._processText_0 =  replaceText;
        //logCell._processText_0.setColor(cs.YELLOW);
        logCell._processText_0.setColor(cs.GREEN);

        var replaceText = new  cc.LabelTTF("", FONT_ARIAL_BOLD, 22);
        UICommon.replaceWidget(logCell._processText_1, replaceText);
        logCell._processText_1 =  replaceText;
        logCell._processText_1.setColor(cs.GREEN);

        var replaceText = new  cc.LabelTTF("", FONT_ARIAL_BOLD, 22);
        UICommon.replaceWidget(logCell._processText_2, replaceText);
        logCell._processText_2 =  replaceText;
        logCell._processText_2.setColor(cs.GREEN);

        var replaceText = new  cc.LabelTTF("", FONT_ARIAL_BOLD, 22);
        var size = logCell._contentText.getContentSize();
        UICommon.replaceWidget(logCell._contentText, replaceText);
        logCell._contentText =  replaceText;
        logCell._contentText.setDimensions(size);
        logCell._contentText.setColor(cs.GRAY);

        logCell.refresh = function(logInfo){
            if(!logInfo){
                return;
            }
            var requestArgs = logInfo.getRequestArgs();
            var processLogs = logInfo.getProcessLogs();
            this._logTypeText.setString(logInfo.getType());
            this._paramsText.setString(processLogs[0] || "");
            this._processText_0.setString(requestArgs["sendData"] ? "params:"+JSON.stringify(requestArgs["sendData"]) : "");
            this._processText_1.setString(processLogs[1] || "");
            this._processText_2.setString(processLogs[2] || "");
            this._contentText.setString(logInfo.getContent());
        };
        return logCell;
    }
});