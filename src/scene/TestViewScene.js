/**
 * Created by Administrator on 16-05-06.
 */
var TestViewScene = cc.Scene.extend({
    _layout: null,
    _scrollView: null,
    _scrollBar: null,

    _properties: [
        {
            name:"进入游戏",
            callback: function() {
                ProxyClientLoginer.startup();
                return null;
            }
        },
        {
            name:"自定义连接服务器",
            callback: function() {
                return TestViewScene.csServerAddr();
            }
        },
        {
            name:"脚本测试",
            callback: function() {
                /*
                cc.loader.loadJson(jsb.fileUtils.getWritablePath()+"TestGame.json",function(err,jsonData){
                    try{
                        if(!err){
                            //MainController.getInstance()._player = new BPPlayer();
                            //MainController.getInstance()._gameData = new GameData();
                            //MainController.getInstance().getPlayer().initFromJson(jsonData);
                            //MainController.getInstance().getGameData().initFromJson(jsonData);
                            //var officerInfo = MainController.getInstance().getPlayer().getOfficerByOfficerId(20003);
                            //layer = new OfficerCultivateManagerLayer(officerInfo);
                        }else{
                            cc.log(err);
                        }

                    }catch(e){
                        cc.log(e.stack);
                    }
                }.bind(this));

                return null;*/
                var layer = new CashOutLayer();
                return layer;
            }
        },
        {
            name:"控制台一键生成getSet方法",
            callback: function() {
                var isCreateSetFunc = true;     //是否同时生成set方法
                var doNotOverride = true;       //不覆盖已有的getSet方法(即如果已有方法了，就不生成了)
                return TestViewScene.testCreateGetSetLog("ClientLogModel", isCreateSetFunc, doNotOverride);
            }
        },
        {
            name:"常规的Alert",

            callback: function() {
                return TestViewScene.testAlert();
            }
        },
        {
            name:"自动消失的Alert",
            callback: function() {
                return TestViewScene.testAutoDisappearAlert();
            }
        },
        {
            name:"粒子效果",
            callback: function() {
                return TestViewScene.testParticle();
            }
        },
        {
            name:"ccTableView测试",
            callback: function() {
                return TestViewScene.listViewTest();
            }
        },
        {
            name:"uiString测试",
            callback: function() {
                return TestViewScene.uiStringTest();
            }
        },

    ],

    ctor: function () {
        this._super();

        //加载纹理
        cc.spriteFrameCache.addSpriteFrames("res/arts/ui_general.plist");
        //var layer = new MainViewLayer();  // 使得MainController.clientRect取到正确的值

        var layout = new ccui.Layout();
        var height = 0;
        for (var j = this._properties.length, cnt = j; j > 0; --j) {
            var button = new ccui.Button();
            var str = j.toFixed(0) + ". " + this._properties[j - 1].name;
            button.setTitleText(str);
            button.setTitleFontName("Arial-BoldMT");
            button.setTitleFontSize(50);
            button.setContentSize(cc.size((new cc.LabelTTF(str, "Arial-BoldMT", 50)).getContentSize().width, 50));
            button.setTag(j - 1);

            button.addTouchEventListener(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    var ret = this._properties[sender.getTag()].callback(sender);
                    if (ret != undefined && ret != null) {
                        if (ret instanceof cc.Layer) {

                            // 移走中间的各case入口
                            if (this._layout != null) {
                                this.removeChild(this._layout);
                                this._layout = null;
                            } else {
                                this.removeChild(this._scrollView);
                                this.removeChild(this._scrollBar);
                                this._scrollView = null;
                                this._scrollBar = null;
                            }
                            MainController.pushLayerToRunningScene(ret);
                        } else if (ret instanceof cc.Scene) {
                            cc.director.runScene(ret);
                        }
                    }
                }
            }.bind(this), this);

            layout.addChild(button);
            button.setPositionX(cc.winSize.width * 0.5);
            button.setPositionY(cc.winSize.height * 0.08 * (cnt - j) + 30);
            height += cc.winSize.height * 0.08;
        }

        layout.setContentSize(cc.size(cc.winSize.width, height));
        if (height <= cc.winSize.height * 0.8) {
            this.addChild(layout);
            layout.setAnchorPoint(cc.p(0.5, 0.5));
            layout.setPosition(cc.pCenter(cc.winSize));
            this._layout = layout;
        } else {
            var scrollView = new ccui.ScrollView();
            scrollView.setDirection(ccui.ScrollView.DIR_VERTICAL);
            scrollView.setBounceEnabled(true);
            scrollView.setContentSize(cc.size(cc.winSize.width, cc.winSize.height * 0.8));
            scrollView.setInnerContainerSize(cc.size(cc.winSize.width, height));

            scrollView.addChild(layout);
            this.addChild(scrollView);
            scrollView.setAnchorPoint(cc.p(0.5, 0.5));
            scrollView.setPosition(cc.pCenter(cc.winSize));

            //var scrollBar = new ccui.ScrollBar();
            //scrollBar.setScrollDir(ccui.ScrollBar.DIR_VERTICAL);
            //scrollBar.setHideThumbIfScrollingStopped(false);
            //scrollBar.setViewContentLength(scrollView.getContentSize().height, scrollView.getInnerContainerSize().height);
            //scrollBar.setPosition(cc.p(cc.winSize.width - 10, cc.winSize.height * 0.5));
            //scrollView.getParent().addChild(scrollBar);
            //scrollBar.refreshOffset(scrollView.getInnerContainer().getPositionY());
            //scrollBar.setColor(cc.color(255, 255, 255));

            scrollView.addEventListener(function(sender, event) {
                switch (event) {
                    case ccui.ScrollView.EVENT_SCROLLING:
                    case ccui.ScrollView.EVENT_BOUNCE_TOP:
                    case ccui.ScrollView.EVENT_BOUNCE_BOTTOM:
                        scrollBar.refreshOffset(scrollView.getInnerContainer().getPositionY());
                        break;
                }
            }, this);
            this._scrollView = scrollView;
           // this._scrollBar = scrollBar;
        }

        // 重置按钮
        var closeButton = new ccui.Layout(); //
        closeButton.setBackGroundColorEx(cc.RED);
        closeButton.setContentSize(190, 72);
        //closeButton.setTitleText("重置");
        //closeButton.setTitleColor(cc.RED);
        closeButton.setTouchEnabled(true);
        closeButton.addClickEventListener(function(){
            cc.director.runScene(new TestViewScene());
        });

        var titleLabel = cc.LabelTTF("返回", "Arial-BoldMT", 34);
        closeButton.addChild(titleLabel);
        titleLabel.setPos(cc.pCenter(closeButton.getContentSize()));

        this.addChild(closeButton, 999);
        closeButton.setPosition(500, 400);
        closeButton.setPos(cc.pRightTop(cc.winSize), ANCHOR_RIGHT_TOP);
    }
});

//
//TestViewScene.resetPlayer = function() {
//    MainController.getInstance()._player = new Player();
//};

TestViewScene.uiStringTest = function() {
    var layer = new cc.Layer();

    var layerColor = new cc.LayerColor(cc.color(255, 255, 255, 255));
    layer.addChild(layerColor);

    var str = "<b t=1 u=1>按钮</b>喝酒后将获得<l c=ff0000 >精神高涨</l>效果，战斗金钱奖励增加<l c=ff0000 >80%</l>!<l c=ff0000>每天只能喝酒三次.</l>";//<i n=icon_money s=1.5/>";
    var richTextEx = UIString.scriptToRichTextEx(str, 400, "Arial", 30, cc.BLACK, function(rt, el) {
        cc.log("RichTextEx内部Button");
    });
    UICommon.addBackgroundLayer(richTextEx);
    layer.addChild(richTextEx);
    richTextEx.setPosition(cc.pCenter(cc.winSize));

    return layer;
};

TestViewScene.ccTableViewTest = function() {
    var layer = new cc.Layer();

    var del = cc.Class.extend({
        ctor: function() {

        },

        scrollViewDidScroll:function (view) {
        },
        scrollViewDidZoom:function (view) {
        },

        tableCellTouched:function (table, cell) {
            cc.log("cell touched at index: " + cell.getIdx());
        },

        tableCellSizeForIndex:function (table, idx) {
            return cc.size(150, 150);
        },

        tableCellAtIndex:function (table, idx) {
            cc.log("idx", idx);
            var strValue = idx.toFixed(0);
            var cell = table.dequeueCell();
            var label;
            if (cell == null) {
                cell = new cc.TableViewCell();
                var sprite = new cc.Sprite("#icon_reward_box.png");
                sprite.anchorX = 0;
                sprite.anchorY = 0;
                sprite.x = 0;
                sprite.y = 0;
                cell.addChild(sprite);

                label = new cc.LabelTTF(strValue, FONT_ARIAL_BOLD, 20.0);
                label.x = 0;
                label.y = 0;
                label.anchorX = 0;
                label.anchorY = 0;
                label.tag = 123;
                cell.addChild(label);
            } else {
                label = cell.getChildByTag(123);
                label.setString(strValue);
            }

            return cell;
        },

        numberOfCellsInTableView:function (table) {
            return 25;
        }
    });

    var tableView = null;
//    tableView = new cc.TableView(this, cc.size(600, 60));
//    tableView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
//    tableView.x = 20;
//    tableView.y = cc.winSize.height / 2 - 150;
//    tableView.setDelegate(new del());
//    layer.addChild(tableView);
//    tableView.reloadData();
    var d = new del();

    tableView = new cc.TableView(d, cc.size(200, 500));
    tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
    tableView.x = cc.winSize.width - 350;
    tableView.y = cc.winSize.height / 2 - 150;
    tableView.setDelegate(d);
    tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
    layer.addChild(tableView);
    tableView.reloadData();

    return layer;
};

TestViewScene.listViewTest = function() {
    var layer = new cc.Layer();

    var responseData  = {"list":[{"totalLoseRate":0.8,"orderId":71,"pname":"欧元/美元","pid":100001,"countTime":1470449160,"potentialWin":0.8,"result":2,"tradeTime":1470449108,"money":1,"beginPrice":1.10841,"countMoney":1,"flowStatus":1,"purchargePrice ":1.10841,"direction":0},{"totalLoseRate":0.8,"orderId":70,"pname":"欧元/美元","pid":100001,"countTime":1470449160,"potentialWin":0.8,"result":2,"tradeTime":1470449107,"money":1,"beginPrice":1.10841,"countMoney":1,"flowStatus":1,"purchargePrice ":1.10841,"direction":1},{"totalLoseRate":0.8,"orderId":69,"pname":"欧元/美元","pid":100001,"countTime":1470449160,"potentialWin":0.8,"result":2,"tradeTime":1470449105,"money":1,"beginPrice":1.10841,"countMoney":1,"flowStatus":1,"purchargePrice ":1.10841,"direction":1},{"totalLoseRate":0.8,"orderId":68,"pname":"欧元/美元","pid":100001,"countTime":1470449040,"potentialWin":0.8,"result":2,"tradeTime":1470448932,"money":1,"beginPrice":1.10841,"countMoney":1,"flowStatus":1,"purchargePrice ":1.10841,"direction":1},{"totalLoseRate":0.8,"orderId":67,"pname":"欧元/美元","pid":100001,"countTime":1470448560,"potentialWin":0.8,"result":2,"tradeTime":1470448494,"money":1,"beginPrice":1.10841,"countMoney":1,"flowStatus":1,"purchargePrice ":1.10841,"direction":0},{"totalLoseRate":0.8,"orderId":66,"pname":"欧元/美元","pid":100001,"countTime":1470448440,"potentialWin":0.8,"result":2,"tradeTime":1470448400,"money":1,"beginPrice":1.10841,"countMoney":1,"flowStatus":1,"purchargePrice ":1.10841,"direction":0},{"totalLoseRate":0.8,"orderId":65,"pname":"欧元/美元","pid":100001,"countTime":1470448440,"potentialWin":0.8,"result":2,"tradeTime":1470448397,"money":1,"beginPrice":1.10841,"countMoney":1,"flowStatus":1,"purchargePrice ":1.10841,"direction":0},{"totalLoseRate":0.8,"orderId":64,"pname":"欧元/美元","pid":100001,"countTime":1470448440,"potentialWin":0.8,"result":2,"tradeTime":1470448394,"money":1,"beginPrice":1.10841,"countMoney":1,"flowStatus":1,"purchargePrice ":1.10841,"direction":0},{"totalLoseRate":0.8,"orderId":63,"pname":"欧元/美元","pid":100001,"countTime":1470448440,"potentialWin":0.8,"result":2,"tradeTime":1470448392,"money":1,"beginPrice":1.10841,"countMoney":1,"flowStatus":1,"purchargePrice ":1.10841,"direction":1},{"totalLoseRate":0.8,"orderId":62,"pname":"欧元/美元","pid":100001,"countTime":1470448440,"potentialWin":0.8,"result":2,"tradeTime":1470448377,"money":1,"beginPrice":1.10841,"countMoney":1,"flowStatus":1,"purchargePrice ":1.10841,"direction":1}]};

    var listDataArray = responseData["list"];
    var betInfoArray = [];
    for(var i = 0; i < listDataArray.length; i++)
    {
        var betData = listDataArray[i];
        var betInfo = new BetInfo(betData);
        betInfo.setSimulateTrade(this._isSimulateTrade);
        betInfoArray.push(betInfo);
    }

    var itemModel = new TradeResultCell(betInfoArray[0]);

    //var listView = new ccui.ListView();
    //listView.setDirection(ccui.ScrollView.DIR_VERTICAL);
    //listView.setTouchEnabled(true);
    //listView.setBounceEnabled(true);
    ////listView.setBackGroundImage("home_tab_icon_Withdrawals_normal.png");
    ////listView.setBackGroundImageScale9Enabled(true);
    //listView.setContentSize(cc.size(itemModel.width, itemModel.height * 6));
    //
    ////listView.setItemModel(itemModel);
    //
    //for (var i = 0; i < betInfoArray.length; ++i) {
    //    // add default item
    //    var itemModel = new TradeResultCell(betInfoArray[i]);
    //    itemModel.setTouchEnabled(true);
    //    listView.pushBackCustomItem(itemModel);
    //    // add custom item
    //}
    //listView.setGravity(ccui.ListView.GRAVITY_CENTER_VERTICAL);
    //
    //listView.addEventListener(function (sender, type) {
    //    cc.log("selectedItemEvent");
    //    switch (type) {
    //        case ccui.ListView.EVENT_SELECTED_ITEM:
    //            var listViewEx = sender;
    //            var selectedIndex = listViewEx.getCurSelectedIndex();
    //            cc.log("select child index = " +selectedIndex);
    //            listViewEx.refresh(betInfoArray[selectedIndex]);
    //            break;
    //
    //        default:
    //            break;
    //    }
    //}.bind(this));

    var delegate = cc.Class.extend({
        ctor: function() {

        },

        scrollViewDidScroll:function (view) {
        },
        scrollViewDidZoom:function (view) {
        },

        tableCellTouched:function (table, cell) {
            cc.log("cell touched at index: " + cell.getIdx());
        },

        tableCellSizeForIndex:function (table, idx) {
            return cc.size(270, 80);
        },

        tableCellAtIndex:function (table, idx) {
            cc.log("idx", idx);
            var cell = table.dequeueCell();
            var info = betInfoArray[idx];
            if (cell == null) {
                cell = new cc.TableViewCell();
                var content = new TradeResultCell(info);
                cell.addChild(content);
                cell._content = content;
            } else {
                cell._content.refresh(info);
            }

            return cell;
        },

        numberOfCellsInTableView:function (table) {
            return betInfoArray.length;
        }
    });

    var d = new delegate();

    var modelView = new TradeResultCell(betInfoArray[0]);
    var tableView = new cc.TableView(d, cc.size(modelView.width, modelView.height * 6));
    tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
    tableView.setDelegate(d);
    //tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
    //tableView.reloadData();

    layer.addChild(tableView);
    tableView.setPos(cc.pCenter(cc.winSize));

    return layer;
};

TestViewScene.testAlert = function() {
    var layer = new cc.Layer();
    layer.setContentSize(cc.winSize);
    ////MainController.showAlertByText("常规的Alert");
    ////var fetchAvatar = new FetchAvatar();
    ////layer.addChild(fetchAvatar);
    ////fetchAvatar.setPos(cc.pCenter(cc.winSize));
    //
    ////var layer = new InvitationCodeLayer();
    //var line = new cc.Sprite("line.png");
    //layer.addChild(line);
    //
    //line.lineTo(cc.p(100, 100), cc.p(100, 300));
    //var generalClickEffect = new GeneralClickEffect();
    //layer.addChild(generalClickEffect);
    //var layer2 = new ccui.Layout();
    //layer2.setContentSize(cc.winSize);
    //layer2.setTouchEnabled(true);
    //layer.addChild(layer2);
    //
    //var lineDown = this._lineDown = new cc.LayerColor(cc.color(143,162,176), 200, 80);
    //layer2.addChild(lineDown);
    //lineDown.setPos(cc.p(layer.width/2,layer.height/2),ANCHOR_CENTER);
    //
    //var animation1 = new cc.MoveTo(3, cc.p(0,0));
    //lineDown.runAction(animation1);
    //
    //layer2.addClickEventListener(function () {
    //    var animation1 = new cc.MoveTo(3, cc.p(500,300));
    //    lineDown.runAction(animation1)
    //}.bind(this));
    //GeneralClickEffect.setPos(centerInner(layer), ANCHOR_CENTER);
    //MainController.pushLayerToRunningScene(layer);
    var menu = new Menu();
    layer.addChild(menu);

    return layer;
};



TestViewScene.testAutoDisappearAlert = function() {
    var layer = new cc.LayerColor();
    //layer.setColor(cs.GRAY);
    //MainController.showAutoDisappearAlertByText("自动消失的Alert");

    layer._isAllowAction = true;
    //动画
    setInterval(function(){
        if(!layer._isAllowAction){
            return;
        }
        for(var i = 0; i < 10; i++){
            var resultSprite = new cc.Sprite("#animation_equal.png");
            var randomPos = cc.p(ALCommon.getRandomFloat(100, cc.winSize.width - 100), ALCommon.getRandomFloat(50, cc.winSize.height - 50));
            layer.addChild(resultSprite);
            resultSprite.setPosition(randomPos);
            resultSprite.originPos = randomPos;
            resultSprite.runAction(new cc.Sequence(
                new cc.Spawn(
                    new cc.ScaleTo(0.25, 1.1, 1.1),
                    new cc.MoveTo(0.35, resultSprite.originPos.x+30, resultSprite.originPos.y+30)
                ),
                new cc.DelayTime(0.8),
                new cc.FadeOut(0.2),
                new cc.RemoveSelf()
            ))
        }
    });

    var stopButton = new ccui.Layout();
    stopButton.setContentSize(150, 90);
    stopButton.setTouchEnabled(true);
    stopButton.setBackGroundColorEx(cs.GREEN);
    layer.addChild(stopButton);
    stopButton.setPos(rightBottomInner(layer), ANCHOR_RIGHT_BOTTOM);
    stopButton.addClickEventListener(function(){
        layer._isAllowAction = !layer._isAllowAction;
        MainController.showAutoDisappearAlertByText("isAllowAction::"+layer._isAllowAction);
    });

    return layer;
};

TestViewScene.testRichTextEx = function() {
    var layer = new cc.Layer();
    //layer.addChild(new cc.LayerColor(cc.color(255, 255, 255, 0)));

    var richText = ccui.RichTextEx.create();
    //richText.setEmptyLineHeight(30);
    richText.setVerticalSpace(10);
    richText.setTouchEnabled(true);

    var elemText = ccui.RichElementTextEx.create(0, cc.BLUE, 255, "戳这里有回调", "Arial-BoldMT", 30);
    elemText.setClickCallback(function(rt, el) {
        switch (rt.getHorizontalAlignment()) {
            case cc.TEXT_ALIGNMENT_LEFT: rt.setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER); break;
            case cc.TEXT_ALIGNMENT_CENTER: rt.setHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT); break;
            case cc.TEXT_ALIGNMENT_RIGHT: rt.setHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT); break;
            default: break;
        }
    });
    richText.pushBackElement(elemText);

    elemText = ccui.RichElementTextEx.create(0, cc.YELLOW, 255, "下划线", "Arial", 30);
    elemText.enableUnderline();
    richText.pushBackElement(elemText);

    richText.pushBackElement(ccui.RichElementTextEx.create(0, cc.WHITE, 255, "常规", "Arial-BoldMT", 30));
    richText.pushBackElement(ccui.RichElementNewLineEx.create(0));
    richText.pushBackElement(ccui.RichElementTextEx.create(0, cc.WHITE, 255, "换行", "Arial-BoldMT", 30));
    richText.pushBackElement(ccui.RichElementNewLineEx.create(0));
    richText.pushBackElement(ccui.RichElementNewLineEx.create(0));
    richText.pushBackElement(ccui.RichElementTextEx.create(0, cc.WHITE, 255, "连续换行", "Arial-BoldMT", 30));
    richText.pushBackElement(ccui.RichElementNewLineEx.create(0));
    richText.pushBackElement(ccui.RichElementTextEx.create(0, cc.WHITE, 255, "行", "Arial-BoldMT", 30));
    richText.pushBackElement(ccui.RichElementTextEx.create(0, cc.WHITE, 255, "\n\\n换行", "Arial-BoldMT", 30));
    richText.pushBackElement(ccui.RichElementNewLineEx.create(0));
    richText.pushBackElement(ccui.RichElementTextEx.create(0, cc.WHITE, 255, "图片乱入", "Arial-BoldMT", 30));
    richText.pushBackElement(ccui.RichElementNewLineEx.create(0));
    richText.pushBackElement(ccui.RichElementTextEx.create(0, cc.WHITE, 255, "LOCAL_TEXTURE", "Arial-BoldMT", 30));
    richText.pushBackElement(ccui.RichElementImageEx.create(0, cc.WHITE, 255, "icon_item_10001.png", ccui.RichElementImageEx.PLIST_TEXTURE));
    richText.pushBackElement(ccui.RichElementTextEx.create(0, cc.WHITE, 255, "PLIST_TEXTURE", "Arial-BoldMT", 30));
    richText.pushBackElement(ccui.RichElementImageEx.create(0, cc.WHITE, 255, "icon_crystal.png", ccui.RichElementImageEx.PLIST_TEXTURE));

    richText.pushBackElement(ccui.RichElementTextEx.create(0, cc.WHITE, 255, "缩放", "Arial-BoldMT", 30));

    var elemImage = ccui.RichElementImageEx.create(0, cc.WHITE, 255, "icon_item_10001.png", ccui.RichElementImageEx.PLIST_TEXTURE);
    elemImage.setScale(0.5);
    richText.pushBackElement(elemImage);

    richText.pushBackElement(ccui.RichElementCustomNodeEx.create(0, cc.WHITE, 255, new cc.Sprite("#icon_item_10001.png")));

    richText.formatText();
    layer.addChild(richText);
    richText.setPosition(cc.pCenter(cc.winSize));

    UICommon.addBackgroundLayer(richText, cc.color(255, 0, 0), 128);

    return layer;
};


/**
 * 测试popLayerOkButton
 */
TestViewScene.testParticle = function() {

    var layer = new cc.LayerColor();
    layer.setColor(cc.RED);
    layer.setContentSize(cc.size(400, 100));

    var bgLayer = new cc.LayerColor();
    bgLayer.setContentSize(cc.winSize);
    bgLayer.setColor(cc.GREEN);

    var system = new cc.ParticleExplosion();
    layer.addChild(system);

    var particleSnow = new cc.ParticleSnow();
    layer.addChild(particleSnow);

    MainController.pushLayerToRunningScene(layer, false);

    return new cc.Layer();
};

/**
 * @param {String} className            类名
 */
TestViewScene.testCreateGetValueLog = function(className) {

    console.log("===================开始生成 initFromJson 方法=====================");

    var object = null;
    eval(cc.formatStr("object = new %s();", className));

    console.log(cc.formatStr("%s.prototype.initFromJson = function(jsonData) {", className));
    for (var prop in object) {
        var objProp = object[prop];
        // 过滤掉函数
        if (objProp instanceof Function  || prop.startsWith("__")) {
            continue;
        }

        var keyName = (prop.substr(0, 1) == "_") ? prop.substr(1, 1) + prop.substr(2, prop.length) : prop;
        console.log(cc.formatStr("    this.%s = ALCommon.getValueWithKey(jsonData, \"%s\", this.%s);" , prop, keyName, prop));
    }
    console.log("};");
};

/**
 *
 * @param {String} className            类名
 * @param {Boolean} [isCreateSetFunc]   是否生成setFunc = true;
 * @param {Boolean} [donotOverride] = false
 */
TestViewScene.testCreateGetSetLog = function(className, isCreateSetFunc, donotOverride) {
    //json解析
    TestViewScene.testCreateGetValueLog(className);
    console.log("===================开始生成 get 方法=====================");

    var object = null;
    eval(cc.formatStr("object = new %s();", className));

    for (var prop in object) {
        var objProp = object[prop];
        //忽略函数和带"__"的变量
        if (objProp instanceof Function || prop.indexOf("__") == 0) {
            continue;
        }

        var name = "";
        var valueName = "";
        if (prop.substr(0, 1) == "_") {
            name = prop.substr(1, 1).toUpperCase() + prop.substr(2, prop.length);
            valueName = prop.substr(1, prop.length);
        } else {
            name = prop.substr(0, 1).toUpperCase() +  prop.substr(1, prop.length);
            valueName = prop;
        }

        var getterName = "get" + name;
        var setterName = "set" + name;

        if (donotOverride != undefined && donotOverride) {
            if ((object[getterName] instanceof Function) || (object[setterName] instanceof Function)) {
                //console.log(getterName + " function or " + setterName +" function is exists ! ignore");
                continue;
            }
        }

        var typeStr = "*";
        switch (typeof(objProp)) {
            case "number": typeStr = "Number"; break;
            case "string": typeStr = "String"; break;
            case "boolean": typeStr = "Boolean"; break;
            case "object":
                if (objProp instanceof Array) typeStr = "Array";
                else typeStr = "*|Object";
                break;
            default: typeStr = "*"; break;
        }
        console.log(cc.formatStr("/**\n * @returns {%s}\n */", typeStr));

        console.log(cc.formatStr("%s.prototype.%s = function() {\n    return this.%s;\n};\n", className, getterName, prop));
        if (isCreateSetFunc == undefined || isCreateSetFunc) {
            console.log(cc.formatStr("/**\n * @param {%s} %s\n */", typeStr, valueName));
            console.log(cc.formatStr("%s.prototype.%s = function(%s) {\n    this.%s = %s;\n};\n", className, setterName, valueName, prop, valueName))
        }
    }
};

TestViewScene.csServerAddr = function(){
    var layer = new cc.LayerColor();
    layer.setContentSize(cc.winSize);
    layer.setColor(cc.color(70,30,30));

    //遮罩
    var mask = this._maskEditBox= new ccui.Layout();
    mask.setContentSize(cc.winSize);
    mask.setTouchEnabled(true);
    mask.setBackGroundColorEx(cc.BLACK);
    mask.setBackGroundColorOpacity(170);
    layer.addChild(mask);
    mask.setVisible(false);

    var panelEditBox = layer._panelEditBox = new ccui.Layout();
    panelEditBox.setContentSize(cc.winSize.width,92);
    panelEditBox.setPos(cc.p(3,450),ANCHOR_LEFT_BOTTOM);
    panelEditBox.setVisible(false);
    layer.addChild(panelEditBox,1,10);

    var editBox = layer._editBox = new cc.EditBox(cc.size(1160,92),new cc.Scale9Sprite("icon_recharge_prompt.png"));
    editBox.setName("");
    //editBox.setDelegate(this);
    editBox.setMaxLength(30);
    editBox.setPlaceHolder("");
    editBox.setPlaceholderFont(FONT_ARIAL_BOLD,30);
    editBox.setFont(FONT_ARIAL_BOLD,30);
    editBox.setFontColor(cc.color(21,25,26));
    editBox.setInputFlag(cc.EDITBOX_INPUT_FLAG_SENSITIVE);  //修改为不使用密文
    editBox.setInputMode(cc.EDITBOX_INPUT_MODE_ANY);
    panelEditBox.addChild(editBox,1,10);
    editBox.setPos(cc.p(0,0),ANCHOR_LEFT_BOTTOM);
    editBox.setVisible(true);

    //创建确定按钮
    var btnConfirmEditBox = layer._btnConfirmEditBox = new ccui.ImageView("bg_input_money.png",ccui.Widget.PLIST_TEXTURE);
    btnConfirmEditBox.setScale9Enabled(true);
    btnConfirmEditBox.setCapInsets(cc.rect(20,5,5,5));
    btnConfirmEditBox.setContentSize(cc.size(165,90));
    panelEditBox.addChild(btnConfirmEditBox);
    btnConfirmEditBox.setTouchEnabled(true);
    btnConfirmEditBox.setPos(cc.p(1165,panelEditBox.height/2),ANCHOR_LEFT);
    btnConfirmEditBox.setVisible(true);

    //创建清除按钮
    var btnReset = new ccui.ImageView("bg_input_money.png",ccui.Widget.PLIST_TEXTURE);
    btnReset.setScale9Enabled(true);
    btnReset.setCapInsets(cc.rect(20,5,5,5));
    btnReset.setContentSize(cc.size(200,150));
    layer.addChild(btnReset);
    btnReset.setTouchEnabled(true);
    btnReset.setPos(cc.p(0,layer.height),ANCHOR_LEFT_TOP);

    //创建确定清除的标题
    var text = new ccui.Text("清除数据", FONT_ARIAL_BOLD, 42);
    btnReset.addChild(text);
    text.setPosition(btnReset.width/2, btnReset.height/2);
    text.setColor(cc.color(255,255,255));

    //创建确定按钮的标题
    var text = new ccui.Text("确定", FONT_ARIAL_BOLD, 30);
    btnConfirmEditBox.addChild(text);
    text.setPosition(btnConfirmEditBox.width/2, btnConfirmEditBox.height/2);
    text.setColor(cc.color(255,255,255));

    panelEditBox.setVisible(false);

    var textCisUser = new ccui.Text("cis_user", FONT_ARIAL_BOLD, 48);
    layer.addChild(textCisUser);
    textCisUser.setPosition(layer.width/2, 650);

    var textCisTrade = new ccui.Text("cis_trade", FONT_ARIAL_BOLD, 48);
    layer.addChild(textCisTrade);
    textCisTrade.setPosition(layer.width/2, 550);

    var textCisMisc = new ccui.Text("cis_misc", FONT_ARIAL_BOLD, 48);
    layer.addChild(textCisMisc);
    textCisMisc.setPosition(layer.width/2, 450);

    var textTcpAddressIP = new ccui.Text("tcpIP:", FONT_ARIAL_BOLD, 48);
    layer.addChild(textTcpAddressIP);
    textTcpAddressIP.setPosition(layer.width/2, 350);

    var agentID = new ccui.Text("交易所ID", FONT_ARIAL_BOLD, 48);
    layer.addChild(agentID);
    agentID.setPosition(layer.width/2, 250);

    textCisUser.setString("cis_user:   " + cs.getItem("cis_user"));
    textCisTrade.setString("cis_trade:   " + cs.getItem("cis_trade"));
    textTcpAddressIP.setString("tcpIP:   " + cs.getItem("tcpIP"));
    agentID.setString("交易所ID:   " +  cs.getItem("channel"));
    textCisMisc.setString("cis_misc:   " + (cs.getItem("cis_misc")||""));

    textCisUser.setTouchEnabled(true);
    textCisTrade.setTouchEnabled(true);
    textCisMisc.setTouchEnabled(true);
    textTcpAddressIP.setTouchEnabled(true);
    agentID.setTouchEnabled(true);

    var key = 0;

    textCisUser.addClickEventListener(function(sender)
    {
        MainController.playButtonSoundEffect(sender);
        panelEditBox.setVisible(true);
        mask.setVisible(true);
        editBox.touchDownAction(sender,ccui.Widget.TOUCH_ENDED);
        key = 1;
    }.bind(layer));

    textCisTrade.addClickEventListener(function(sender)
    {
        MainController.playButtonSoundEffect(sender);
        panelEditBox.setVisible(true);
        mask.setVisible(true);
        editBox.touchDownAction(sender,ccui.Widget.TOUCH_ENDED);
        key = 2;
    }.bind(layer));

    textCisMisc.addClickEventListener(function(sender)
    {
        MainController.playButtonSoundEffect(sender);
        panelEditBox.setVisible(true);
        mask.setVisible(true);
        editBox.touchDownAction(sender,ccui.Widget.TOUCH_ENDED);
        key = 5;
    }.bind(layer));

    textTcpAddressIP.addClickEventListener(function(sender)
    {
        MainController.playButtonSoundEffect(sender);
        panelEditBox.setVisible(true);
        mask.setVisible(true);
        editBox.touchDownAction(sender,ccui.Widget.TOUCH_ENDED);
        key = 3;
    }.bind(layer));

    agentID.addClickEventListener(function(sender)
    {
        MainController.playButtonSoundEffect(sender);
        panelEditBox.setVisible(true);
        mask.setVisible(true);
        editBox.touchDownAction(sender,ccui.Widget.TOUCH_ENDED);
        key = 4;
    }.bind(layer));

    mask.addClickEventListener(function(sender)
    {
        MainController.playButtonSoundEffect(sender);
        panelEditBox.setVisible(false);
        mask.setVisible(false);
    }.bind(layer));
    var regexp = function(text){
        var splitArray = text.split(":");
        cc.log("splitArray::", JSON.stringify(splitArray));
        if(!splitArray){
            MainController.showAlertByText(splitArray[0] + ":  IP输入错误");
            return false;
        }

        var IP = splitArray[0];
        var Port = splitArray[1];
        var IPRegexp = /^(1\d{2}|2[0-5][0-5])\.(1\d{2}|2[0-5][0-5])\.([1-9])\.([1-9]\d|[1-9]\d{2}|2[0-5][0-5])$/;
        var valid = IPRegexp.test(IP);
        if(!valid){
            MainController.showAlertByText(splitArray[0] + ":  IP输入错误");
            return false;
        }

        return true;
    };

    btnConfirmEditBox.addClickEventListener(function(sender)
    {
        MainController.playButtonSoundEffect(sender);
        if(key ==1){
            if(regexp(editBox.getString())){
                textCisUser.setString("cis_user:   " + editBox.getString());
                cs.setItem("cis_user",editBox.getString().trim());
                editBox.setString("");
            }
        }else if(key == 2){
            if(regexp(editBox.getString())){
                textCisTrade.setString("cis_trade:   " + editBox.getString());
                cs.setItem("cis_trade",editBox.getString().trim());
                editBox.setString("");
            }
        }
        else if(key == 3){
            if(regexp(editBox.getString())){
                textTcpAddressIP.setString("tcpIP地址:   " + editBox.getString());
                cs.setItem("tcpIP",editBox.getString().trim());
                editBox.setString("");
            }
        }
        else if(key == 4){
            agentID.setString("交易所ID:   " + editBox.getString());
            cs.setItem("channel",editBox.getString().trim());
            editBox.setString("");
        }
        else if(key == 5){
            if(regexp(editBox.getString())){
                textCisMisc.setString("cis_misc:   " + editBox.getString());
                cs.setItem("cis_misc",editBox.getString().trim());
                editBox.setString("");
            }
        }
        panelEditBox.setVisible(false);
        mask.setVisible(false);
    }.bind(layer));

    btnReset.addClickEventListener(function(sender)
    {
        MainController.playButtonSoundEffect(sender);
        cs.removeItem("cis_trade");
        cs.removeItem("cis_user");
        cs.removeItem("cis_misc");
        cs.removeItem("tcpIP");
        cs.removeItem("channel");
        textCisUser.setString("cis_user:   ");
        textCisTrade.setString("cis_trade:   ");
        textCisMisc.setString("cis_misc:   ");
        textTcpAddressIP.setString("tcpIP:   ");

        //交易所ID特殊
        cs.setItem("channel",1);
        agentID.setString("交易所ID:   " +  cs.getItem("channel"))
        //agentID.setString("交易所ID:   " +  cs.getItem("channel"));
        //cs.removeItem("channel",1);
    }.bind(layer));

    return layer;
};