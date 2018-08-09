/**
 * Created by Jony on 2016/11/21
 */

var MailLayer = BaseLayer.extend({
    _selectedIdArray: [],
    _mailArray: [],
    _doingReq: false,
    _hasGetAllHistory: false,
    _maxLookIndex: 0,
    _singleGetMailCount: 15, //单次获取邮件数

    ctor:function(index)
    {
        this._super("MailLayer");
        // 索引
        this._mailArray = MailManager.getInstance().getMailArray();
        this._selectedIdArray = MailManager.getInstance().getSelectedIdArray();
        //UI
        this.initUI();
        //点击事件
        this.initAllClickFunc();
        //
        this.addListener();
    },

    //BaseLayer 里有了
    //cleanup:function(){
    //    this.removeAllCustomListeners();
    //    this._super();
    //},

    initUI:function()
    {
        var layer = ccs.loadWithVisibleSize(res.MailLayer_json).node;
        // 加入到当前layer中。
        this.addChild(layer);
        // 按钮
        //
        var titlePanel = ccui.helper.seekWidgetByName(layer, "titlePanel");
        // 返回按钮
        var backBtn = this._backBtn = ccui.helper.seekWidgetByName(titlePanel, "backBtn");

        //
        var mailPanel = this._mailPanel = ccui.helper.seekWidgetByName(layer, "mailPanel");
        var editBtn = this._editBtn = ccui.helper.seekWidgetByName(mailPanel, "editBtn");
        var opPanel = this._opPanel = ccui.helper.seekWidgetByName(mailPanel, "opPanel");
        var allBtn = this._allBtn = ccui.helper.seekWidgetByName(opPanel, "allBtn");
        var delBtn = this._delBtn = ccui.helper.seekWidgetByName(opPanel, "delBtn");
        var cancelBtn = this._cancelBtn = ccui.helper.seekWidgetByName(opPanel, "cancelBtn");

        var mailListPanel = this._mailListPanel = ccui.helper.seekWidgetByName(mailPanel, "listPanel");

        var emptyPanel = this._emptyPanel = ccui.helper.seekWidgetByName(layer, "emptyPanel");

        this.showOpPanel(false);
        //this.refreshShowPanel();
        //this.showOpPanel(false);
        this._editBtn.setVisible(false);

        var contentPanel = this._contentPanel = ccui.helper.seekWidgetByName(layer, "contentPanel");
        var listPanel = ccui.helper.seekWidgetByName(contentPanel, "listPanel");

        var typeTxt = this._contentTypeTxt = ccui.helper.seekWidgetByName(listPanel, "typeTxt");
        var detailContentTxt = this._detailContentTxt = ccui.helper.seekWidgetByName(listPanel, "titleTxt");
        var timeTxt = this._contentTimeTxt = ccui.helper.seekWidgetByName(listPanel, "timeTxt");

        setTimeout(function(){
            this.doMailListReq(0,0);
        }.bind(this), 100);
    },

    addListener:function()
    {
        //this._newMailListener = cc.eventManager.addCustomListener(NOTIFY_NEW_MAIL, function(event)
        //{
        //}.bind(this));
    },

    initAllClickFunc:function()
    {
        // 返回
        this._backBtn.addClickEventListener(function(sender)
        {
            MailManager.getInstance().cleanMailData();

            MainController.playButtonSoundEffect(sender);
            MainController.popLayerFromRunningScene(this);
        }.bind(this));

        // 编辑
        this._editBtn.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            this.showOpPanel(true);

            this.showAllSelectedBtn();
        }.bind(this));

        // 全选
        this._allBtn.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);

            var bHasSelectedAll = this._selectedIdArray.length == (this._maxLookIndex+1);
            this._selectedIdArray.length = 0;
            for(var i = 0;i<=this._maxLookIndex; i++ )
            {
                var cell = this._tableView.cellAtIndex(i);
                if(cell) {
                    cell._content.setSelected(!bHasSelectedAll);
                }
                if(this._mailArray[i])
                {
                    this._mailArray[i].setSelected(!bHasSelectedAll);
                    if(!bHasSelectedAll) {
                        this._selectedIdArray.push(this._mailArray[i].getId());
                    }
                }
            }
        }.bind(this));

        // 删除
        this._delBtn.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            if(this._selectedIdArray.length == 0) {
                MainController.showAutoDisappearAlertByText(LocalString.getString("MAIL_NO_MAIL_SELECTED"));
                return;
            }
            var successCallBack = function(data){
                cc.log("邮件删除成功");
                MailManager.getInstance().delete(this._selectedIdArray);
                this._maxLookIndex -= this._selectedIdArray.length;
                // 剩余邮件少于一屏才自动拉新的历史邮件
                if(this._mailArray.length < 5)
                {
                    var customCallback = function(data)
                    {
                        MailManager.getInstance().add(data, "history");
                        this._tableView.reloadData();

                        if(data.length < this._singleGetMailCount) {
                            this._hasGetAllHistory = true;
                        }
                        this.refreshShowPanel();
                    }.bind(this);
                    if(this._mailArray.length > 0) {
                        this.doMailListReq(1, this._mailArray[this._mailArray.length -1].getId(), customCallback);
                    }
                    else {
                        // 重新开始拉
                        this.doMailListReq(0, 0, customCallback);
                    }
                }
                else
                {
                    var oldOffset = this._tableView.getContentOffset();
                    this._tableView.reloadData();
                    var vec2 = cc.pAdd(oldOffset, cc.p(0, 95 * this._selectedIdArray.length));
                    if(vec2.y > 0) {
                        vec2.y = 0;
                    }
                    this._tableView.setContentOffset(vec2);
                }

                this._selectedIdArray.length = 0;
            }.bind(this);
            HttpManager.sendRequest("mailDelete", {auth:{ids:this._selectedIdArray}}, successCallBack);
        }.bind(this));

        // 取消
        this._cancelBtn.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            this.showOpPanel(false);

            this._selectedIdArray.length = 0;
            for(var i = 0;i<this._mailArray.length; i++ )
            {
                var cell = this._tableView.cellAtIndex(i);
                if(cell) {
                    cell._content.showSelectedBtn(false);
                    cell._content.setSelected(false);
                }
                this._mailArray[i].setShowSelectedBox(false);
                this._mailArray[i].setSelected(false);
            }
        }.bind(this));
    },

    /*
    *  direction（方向：0初始页，1翻页，-1顶部刷新）
    *  mailId ( 边界邮件ID )
    *  customCallback 自定义回调，默认不填
    * */
    doMailListReq: function(direction, mailId, customCallback)
    {
        MainController.getInstance().showLoadingWaitLayer();
        this._doingReq = true;

        var sucCallback = null;
        if(customCallback)
            sucCallback = customCallback;
        else {
            if (direction == 0) {
                sucCallback = this.firstCallback.bind(this);
            }
            else if (direction == 1) {
                sucCallback = this.behindCallback.bind(this);
            } else if (direction == -1) {
                sucCallback = this.frontCallback.bind(this);
            }
        }
        var callback = function(data)
        {
            sucCallback(data);

            // 同步编辑选择框显示（暂时所有都重设一次）
            if(this._opPanel.isVisible())
            {
                this.showAllSelectedBtn();
            }

            MainController.getInstance().hideLoadingWaitLayer();
            this._doingReq = false;
        }.bind(this);
        HttpManager.sendRequest("mailList", {auth:{direction: direction, mailId:mailId, count: this._singleGetMailCount}}, callback, 3);
    },

    // 显示选择框，点击编辑按钮
    showAllSelectedBtn: function()
    {
        for(var i = 0; i<this._mailArray.length; i++)
        {
            var cell = this._tableView.cellAtIndex(i);
            if(cell) {
                cell._content.showSelectedBtn(true);

                if(!this._mailArray[i].isSelected()) {
                    cell._content.setSelected(false);
                }
            }
            this._mailArray[i].setShowSelectedBox(true);
        }
    },

    firstCallback: function(data)
    {
        MailManager.getInstance().add(data, "history");
        if(data.length < this._singleGetMailCount)
        {
            this._hasGetAllHistory = true;
        }
        this.refreshShowPanel();
        this._editBtn.setVisible(this._mailArray.length >0);

        var self = this;
        var delegate = cc.Class.extend({

            ctor: function() {},

            scrollViewDidScroll:function (view) {
                //cc.log("scrollViewDidScroll")
                //cc.log("self._doingReq: " + self._doingReq)
                if(!self._doingReq){
                    if(self._needFrontReq && view.getContentOffset().y == view.minContainerOffset().y)
                    {
                        self._needFrontReq = false;
                        self._needBehindReq = false;

                        self.doMailListReq(-1, self._mailArray[0].getId());
                    }
                    else if(self._needBehindReq && view.getContentOffset().y == view.maxContainerOffset().y)
                    {
                        self._needBehindReq = false;
                        self._needFrontReq = false;
                        self.doMailListReq(1, self._mailArray[self._mailArray.length -1].getId());
                    }
                    else
                    {
                        // 顶部往下滚
                        if(view.getContentOffset().y < view.minContainerOffset().y)
                        {
                            if(Player.getInstance().getRedDotNumByType(GB.MENU_TYPE_MAIL) > 0)
                                self._needFrontReq = true;
                            //self.doMailListReq(-1, self._mailArray[0].getId());
                        }
                        // 底部往上滚
                        else if(!self._hasGetAllHistory && view.getContentOffset().y > view.maxContainerOffset().y)
                        {
                            self._needBehindReq = true;
                            //self.doMailListReq(1, self._mailArray[self._mailArray.length -1].getId());
                        }
                    }
                }
            },
            scrollViewDidZoom:function (view) {},
            tableCellTouched:function (table, cell) {
                cc.log("cell touched at index: " + cell.getIdx());
                cell._content.onTouchCallback(self.showMailContent.bind(self));
            },

            tableCellSizeForIndex:function (table, idx) {
                return cc.size(1138, 95);
            },

            tableCellAtIndex:function (table, idx) {
                //cc.log("idx", idx);
                var cell = table.dequeueCell();
                var info = self._mailArray[idx];
                try{
                    if (cell == null) {
                        cell = new cc.TableViewCell();

                        var content = new MailListCell(info);
                        cell.addChild(content);
                        content.setPosition(centerInner(cell));
                        cell._content = content;
                    }
                    else
                    {
                        cc.log("idx", idx);
                        // 已查看过最大index
                        if(idx > self._maxLookIndex)
                            self._maxLookIndex = idx;
                        cell._content.refresh(info);
                    }
                }catch (e)
                {
                    cc.log(e.stack);
                }

                return cell;
            },

            numberOfCellsInTableView:function (table) {
                return self._mailArray.length;
            }
        });

        var delegate = new delegate();
        var tableView = this._tableView = new cc.TableView(delegate, this._mailListPanel.getContentSize());
        tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        tableView.setDelegate(delegate);
        tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);

        this._mailListPanel.addChild(tableView);
        tableView.setPos(topInner(this._mailListPanel), ANCHOR_TOP);

        // 在首次邮件多时会出现渲染到index=5的情况
        if(this._maxLookIndex > 4)
            this._maxLookIndex = 4;
    },

    behindCallback: function(data)
    {
        if(data.length > 0) {
            MailManager.getInstance().add(data, "history");

            var oldOffset = this._tableView.getContentOffset();
            this._tableView.reloadData();
            // 滚出来一封新历史邮件
            this._tableView.setContentOffset(cc.pSub(oldOffset, cc.p(0, 95 * (data.length - 1))));
            //this._maxLookIndex++;
        }
        if(data.length < this._singleGetMailCount) {
            this._hasGetAllHistory = true;
        }
    },

    frontCallback: function(data) {
        if (data.length > 0) {
            MailManager.getInstance().add(data, "new");
            this._tableView.reloadData();

            this._maxLookIndex += data.length;

            // 清除未读邮件数
            var sucCallback = function () {
                Player.getInstance().setRedDotNumByType(GB.MENU_TYPE_MAIL, 0);
                cc.eventManager.dispatchCustomEvent(NOTIFY_RED_DOT, GB.MENU_TYPE_MAIL);
            }
            HttpManager.requestClearRedDot(sucCallback, GB.MENU_TYPE_MAIL);
        }
    },

    refreshShowPanel: function()
    {
        this._mailPanel.setVisible(this._mailArray.length > 0);
        this._emptyPanel.setVisible(this._mailArray.length == 0);
    },

    showOpPanel: function(visible)
    {
        this._opPanel.setVisible(visible);
        this._editBtn.setVisible(!visible);
    },

    showMailContent: function(mailInfo)
    {
        this._contentPanel.setVisible(true);
        this._mailPanel.setVisible(false);

        this._contentTimeTxt.setString(mailInfo.getSendTime());
        this._contentTypeTxt.setString(mailInfo.getTitle());

        this._detailContentTxt.removeAllChildren();
        //
        var str = mailInfo.getDetailContent();
        var richTextEx = UIString.scriptToRichTextEx("<l>"+ str +"</l>", this._detailContentTxt.width, "Arial", 24, cs.BLACK, function(rt, el) {
            if(mailInfo.getType() == MailInfo.RECHARGE_FAIL || mailInfo.getType() == MailInfo.WITHDRAW_FAIL)
            {
                MainController.getInstance().showCustomerServiceLayer();
            }
        }.bind(this));

        this._detailContentTxt.addChild(richTextEx);
        richTextEx.setPos(topInner(this._detailContentTxt), ANCHOR_TOP);

        this._backBtn.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            this._contentPanel.setVisible(false);
            this._mailPanel.setVisible(true);

            this._backBtn.addClickEventListener(function(sender)
            {
                MailManager.getInstance().cleanMailData();

                MainController.playButtonSoundEffect(sender);
                MainController.popLayerFromRunningScene(this);
            }.bind(this))

        }.bind(this));
    }
});


// 单个邮件cell（测试从cocos stdio 生成）
var MailListCell = ccui.Layout.extend({
    _mailInfo:undefined,
    _isSelected: false,

    ctor:function(mailInfo)
    {
        this._super();
        this.setContentSize(cc.size(1138, 95));

        this._mailInfo = mailInfo;

        this.initUI();
        this.initAllClickFunc();

        this.refresh(mailInfo);
    },

    cleanup:function()
    {
        cc.log("clean up MailListCell");
        this.removeAllCustomListeners();

        this._super();
    },

    initUI:function()
    {
        var node = ccs.load(res.MailCell_json).node;
        this.addChild(node);
        node.setPos(centerInner(this));

        var selectCheckBtn = this._selectCheckBtn = ccui.helper.seekWidgetByName(node, "selectCheckBtn");
        this.showSelectedBtn(false);
        var selectedTag = this._selectedTag = ccui.helper.seekWidgetByName(selectCheckBtn, "selected");

        var detailPanel = this._detailPanel = ccui.helper.seekWidgetByName(node, "detailPanel");
        var typeTxt = this._typeTxt = ccui.helper.seekWidgetByName(detailPanel, "typeTxt");
        var titleTxt = this._titleTxt = ccui.helper.seekWidgetByName(detailPanel, "titleTxt");
        var timeTxt = this._timeTxt = ccui.helper.seekWidgetByName(detailPanel, "timeTxt");
    },

    initAllClickFunc:function()
    {
        //
        this._selectCheckBtn.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);

            this.setSelected(!this._isSelected, true);
            //this._isSelected = !this._isSelected;
        }.bind(this));
    },

    setSelected: function(isSelected, refreshSelectedArray)
    {
        //if(this._isSelected == isSelected) return;
        this._isSelected = isSelected;
        this._selectedTag.setVisible(isSelected);

        if(!refreshSelectedArray) refreshSelectedArray = false;
        if(refreshSelectedArray)
        {
            var selectedIdArray = MailManager.getInstance().getSelectedIdArray();
            var id = this._mailInfo.getId();
            if( isSelected )
            {
                //cc.log("选中id："+id)
                selectedIdArray.push(id);
                this._mailInfo.setSelected(true);
            }
            else
            {
                //cc.log("取消选中id："+id)
                for(var i = 0; i<selectedIdArray.length; i++)
                {
                    if(selectedIdArray[i] == id)
                    {
                        this._mailInfo.setSelected(false);
                        selectedIdArray.splice(i,1);
                        break;
                    }
                }
            }
        }
    },

    showSelectedBtn: function(visible)
    {
        this._selectCheckBtn.setVisible(visible);
    },

    onTouchCallback: function(callback)
    {
        MainController.playButtonSoundEffect();
        //
        cc.log("打开邮件： id："+ this._mailInfo.getId() );
        var succCallback = function()
        {
            this._mailInfo.setReaded(true);
            this._typeTxt.setColor(cs.GRAY);

            if(callback)
              callback(this._mailInfo);
        }.bind(this);
        HttpManager.sendRequest("mailRead",{auth:{id:this._mailInfo.getId()}}, succCallback);
    },

    refresh:function(mailInfo)
    {
        var mailInfo = this._mailInfo = mailInfo || this._mailInfo;
        if(!mailInfo)
            return;

        this._timeTxt.setString(mailInfo.getSendTime());
        this._typeTxt.setString(mailInfo.getTitle());
        this._typeTxt.setColor(mailInfo.isReaded() ? cs.GRAY : cs.BLACK);
        //
        var str = mailInfo.getTitleContent();
        this._titleTxt.removeAllChildren();
        var richTextEx = UIString.scriptToRichTextEx("<l>"+ str +"</l>", this._titleTxt.width, "Arial", 24, cs.GRAY, null);
        this._titleTxt.addChild(richTextEx);
        richTextEx.setPos(leftInner(this._titleTxt), ANCHOR_LEFT);

        if(!mailInfo.isShowSelectedBox())
        {
            this._selectCheckBtn.setVisible(false);
        }
        else
        {
            this._selectCheckBtn.setVisible(true);
            this.setSelected(mailInfo.isSelected());
        }
    }
});