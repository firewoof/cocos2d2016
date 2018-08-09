/**
 * 我的交易（下单列表）
 * Created by Administrator on 2017/2/17.
 */

var TradeListPanel = cc.Node.extend({

    ctor:function(size)
    {
        this._super();
        this.setContentSize(size);

        this._betInfoArray = [];

        this.initTabView();

        this.addListener();
    },

    addListener:function()
    {
        this._productRemovedListener = cc.eventManager.addCustomListener(NOTIFY_PRODUCT_REMOVED, function()
        {
            this.reload();
        }.bind(this))
    },

    initTabView:function()
    {
        var self = this;

        var delegate = cc.Class.extend({
            _tradingHall:undefined,

            ctor: function() {},

            tableCellWillRecycle:function(table, cell){
                var content = cell._content;
                if(content && content.isHighlighted()){
                    content.setHighlight(false);
                }
            },
            numberOfCellsInTableView:function (table) {
                var number = self._betInfoArray.length;
                return number;
            },
            tableCellTouched:function (table, cell) {
                //cc.log("cell touched at index: " + cell.getIdx());
                var curContent = cell._content;
                if(!curContent || curContent.isHighlighted()) {
                    return;
                }

                if(table._highlightCell && table._highlightCell._content)
                {
                    table._highlightCell._content.setHighlight(false);
                }

                var betInfo = curContent.getBetInfo();
                if(betInfo){
                    curContent.setHighlight();
                    table._highlightCell = cell;
                    //记录 被选择的betInfo
                    TradingHallLayer.instance.setBeSelectedBetInfo(betInfo);

                    cc.eventManager.dispatchCustomEvent(NOTIFY_SHOW_BET_HISTORY, betInfo);
                }
            },

            tableCellSizeForIndex:function (table, idx) {
                return cc.size(276, 82);
            },

            tableCellAtIndex:function (table, idx) {
                //cc.log("idx::", idx);
                var cell = table.dequeueCell();
                var info = self._betInfoArray[idx];
                try{
                    if (cell == null) {
                        cell = new cc.TableViewCell();

                        var content = new TradeResultCell(info);
                        cell.addChild(content);
                        content.setPosition(centerInner(cell));
                        cell._content = content;

                    }
                    else
                    {
                        cell._content.setHighlight(false);
                        cell._content.refresh(info);
                        var beSelectedBetInfo = TradingHallLayer.instance.getBeSelectedBetInfo();
                        if(info && beSelectedBetInfo && info.getId && info.getId() == beSelectedBetInfo.getId()){
                            cell._content.setHighlight(true);
                        }
                        //重用的时候 tabView子项的cleanup会被执行,这里需要重新添加一次监听
                        if(!cell._content._perOneSecondListener)
                        {
                            cell._content.addListener();
                        }
                    }

                }catch (e)
                {
                    cc.log(e.stack);
                    testSeverLog("我的交易::"+e.name + ": " + e.message);
                    //throw e
                }

                return cell;
            }
        });

        var delegate = new delegate();
        delegate._tradingHall = TradingHallLayer.instance;
        var tableView = new cc.TableView(delegate, cc.size(this.width, this.height));
        tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        tableView.setDelegate(delegate);
        tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);

        this.addChild(tableView);
        tableView.setPos(topInner(this), ANCHOR_TOP);
        this._tableView = tableView;
    },

    reload:function()
    {
        this.setVisible(true);

        var originBetInfoArray = Player.getInstance().getCurDayBetArray();
        if(GB.isSimulateTrade){
            originBetInfoArray = Player.getInstance().getCurDaySmBetArray();
        }
        cc.log("GB.isSimulateTrade::", GB.isSimulateTrade);
        var betInfoArray = originBetInfoArray;
        //24小时之内的订单都显示
        var minTime = cs.getCurSecs() - 24 * 3600;
        //var zeroTime = cs.getZeroSecs();
        //显示的时候剔除不是今天的单
        if(betInfoArray.length > 0) {
            var lastBetInfo = betInfoArray.last();
            //有订单要剔除
            if(lastBetInfo.getBetTime() < minTime )
            {
                betInfoArray = [];
                var len = originBetInfoArray.length;
                for(var i = 0; i < len; i++){
                    var betInfo = originBetInfoArray[i];
                    if(!betInfo){
                        cc.log("i", i);
                        cc.log("originBetInfoArray::", originBetInfoArray.length);
                        G_collectLog("=============xxx===========TradeListPanel异常:: betInfo is undefined, GB.isSimulateTrade::"+ GB.isSimulateTrade );
                        continue;
                    }
                    if(betInfo && betInfo.getBetTime() >= minTime){
                        betInfoArray.push(betInfo);
                    }
                }
            }
        }

        this._betInfoArray = betInfoArray;

        this._tableView.reloadData();
    }
});