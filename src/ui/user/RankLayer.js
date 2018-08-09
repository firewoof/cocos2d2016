/**
 * 排行榜
 * Created by Jony on 2016/11/15.
 */
var RankLayer = BaseLayer.extend({

    ctor: function() {
        this._super();

        this.initUI();
        this.initAllButtonClick();
    },

    initUI:function()
    {
        var layer = ccs.loadWithVisibleSize(res.RankLayer_json).node;
        //加入到当前layer中。
        this.addChild(layer);
        //
        var titlePanel = ccui.helper.seekWidgetByName(layer, "titlePanel");
        // 返回按钮
        var backBtn = this._backBtn = ccui.helper.seekWidgetByName(titlePanel, "backBtn");
        //
        var rankPanel = ccui.helper.seekWidgetByName(layer, "rankPanel");
        var weekRankBtn = this._weekRankBtn = ccui.helper.seekWidgetByName(rankPanel, "weekRankBtn");
        this._weekRankBtn.bg = ccui.helper.seekWidgetByName(rankPanel, "weekTag");
        var totalRankBtn = this._totalRankBtn = ccui.helper.seekWidgetByName(rankPanel, "totalRankBtn");
        this._totalRankBtn.bg = ccui.helper.seekWidgetByName(rankPanel, "totalTag");

        this._winListPanel = ccui.helper.seekWidgetByName(rankPanel, "winList");
        this._myselfRankPanel = ccui.helper.seekWidgetByName(rankPanel, "myselfRank");
        this._winListPanel.highH = this._winListPanel.height;
        this._winListPanel.lowH = this._winListPanel.height - this._myselfRankPanel.height;

        this.setRankBtnSelected();

        var refreshFunc = function() {
            this.refreshRankList(this._rankBtn);
        }.bind(this);
        this.schedule(refreshFunc, 15*60);
    },

    initAllButtonClick:function()
    {
        // 返回
        this._backBtn.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            MainController.popLayerFromRunningScene(this);
        }.bind(this));

        this._weekRankBtn.addClickEventListener(function(sender) {
            MainController.playButtonSoundEffect();
            this.setRankBtnSelected(sender);
        }.bind(this));
        this._totalRankBtn.addClickEventListener(function(sender) {
            MainController.playButtonSoundEffect();
            this.setRankBtnSelected(sender);
        }.bind(this));
    },

    /*
     * 按下排行榜按钮
     * */
    setRankBtnSelected: function(btn)
    {
        if(!this._rankBtn) btn = this._weekRankBtn;
        btn.bg.setVisible(true);
        btn.setTitleColor(cc.color.WHITE);
        btn.setEnabled(false);

        this.refreshRankList(btn);
        if(this._rankBtn) {
            this._rankBtn.bg.setVisible(false);
            this._rankBtn.setTitleColor(cc.color(224, 130,31));
            this._rankBtn.setEnabled(true);
        }
        this._rankBtn = btn;
    },
    /*
     * 刷新排行榜用户列表数据
     * */
    refreshRankList: function(btn)
    {
        MainController.getInstance().showLoadingWaitLayer();
        var url = (btn == this._totalRankBtn)?"totalWinList":"weekWinList";
        var sucCallback = function(data) {
            MainController.getInstance().hideLoadingWaitLayer();
            this.showRank(data.list, url);
        }.bind(this);
        HttpManager.sendRequest(url, {}, sucCallback);
    },
    /*
     * 显示排行榜
     * */
    showRank: function(rankListData, url)
    {
        this._winListPanel.removeAllChildren();
        var playerIndex = -1;
        var array = [];
        for (var i = 0; i< rankListData.length; i++)
        {
            if(!Player.getInstance().isGuest() && rankListData[i].base.id == Player.getInstance().getId())
            {
                playerIndex = i;
            }

            var simplePlayer = new SimplePlayer(rankListData[i]);
            var cell = new RankListCell(simplePlayer, i+1, url);
            array.push(cell);
        }

        //用户自己排名
        if(playerIndex>=0)
        {
            this._myselfRankPanel.setVisible(true);
            this._myselfRankPanel.removeAllChildren();
            var cell = new RankListCell(new SimplePlayer(rankListData[playerIndex]), playerIndex+1, url, true);
            this._myselfRankPanel.addChild(cell);
            cell.setPos(cc.p(this._myselfRankPanel.width * 0.5, this._myselfRankPanel.height * 0.5), ANCHOR_CENTER);

            this._winListPanel.height = this._winListPanel.lowH;
        }
        else
        {
            this._myselfRankPanel.setVisible(false);
            this._winListPanel.height = this._winListPanel.highH;
        }

        var playerPanel = UICommon.createPanelAlignWidgetsWithPadding(0, cc.UI_ALIGNMENT_VERTICAL_CENTER, array);
        //if(playerPanel.height > this._winListPanel.height){
            playerPanel = UICommon.createScrollViewWithContentPanel(playerPanel, cc.size(playerPanel.width, this._winListPanel.height), ccui.ScrollView.DIR_VERTICAL);
        //}
        playerPanel.setScrollBarEnabled(false);
        this._winListPanel.addChild(playerPanel);
        playerPanel.setPos(cc.p(this._winListPanel.width * 0.5, this._winListPanel.height), ANCHOR_TOP);
    }
});