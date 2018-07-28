/**
 * Created by Administrator on 16-05-06.
 */

var ServerSelectionLayer = cc.Layer.extend({
    _layout: null,
    _scrollView: null,
    _scrollBar: null,

    _properties: [
        {
            name:"公网测试端口3",
            address:"42.62.40.227:21003"
        },
        {
            name:"QA 专用",
            address:"42.62.40.227:21004"
        },
    ],

    ctor: function () {
        this._super();

        var layout = new ccui.Layout();
        var height = 0;
        for (var j = this._properties.length, cnt = j; j > 0; --j) {
            var button = new ccui.Button();
            var str = j.toFixed(0) + ". " + this._properties[j - 1].name;
            button.setTitleText(str);
            button.setTitleFontName("Arial-BoldMT");
            button.setTitleFontSize(50);
            button.setScale9Enabled(true);
            button.setContentSize(cc.size((new cc.LabelTTF(str, "Arial-BoldMT", 50)).getContentSize().width, 50));
            button.setTag(j - 1);

            button.addTouchEventListener(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    MainController.frontServerAddressArray = [this._properties[sender.getTag()].address];
                    var scene = new InitScene();
                    scene.setonEnterTransitionDidFinishCallback(function() {
                        scene.connectAndEnterTitleScene();
                    });
                    cc.director.runScene(scene);
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

            //var scrollBar = UICommon.createRelativeScrollBarForScrollView(scrollView);
            //scrollBar.setHideThumbIfScrollingStopped(false);
            //scrollBar.setPosition(cc.p(cc.winSize.width - 10, cc.winSize.height * 0.5));
            //scrollView.getParent().addChild(scrollBar);
            //scrollBar.setColor(cc.color(255, 255, 255));

            this._scrollView = scrollView;
            this._scrollBar = scrollBar;
        }
    }
});

var loadTestGame = function(){
    cc.loader.loadJson(jsb.fileUtils.getWritablePath()+"/TestGame.json",function(err,jsonData){
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
    });
};

var TestViewScene = cc.Scene.extend({
    _layout: null,
    _scrollView: null,
    _scrollBar: null,

    _properties: [
        {
            name:"进入游戏",
            callback: function() {
                TestViewScene.resetPlayer();
                cc.director.runScene(new cc.TransitionFade(0.5, new TitleScene(), cc.BLACK));


                return null;
            }
        },
        {
            name:"脚本测试",
            callback: function() {
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

                return null;
            }
        },


////        {
////            name:"OtherPlayerBriefLayer",
////            callback: function() {
////                return TestViewScene.testOtherPlayerBriefLayer();
////            }
////        },
//        {
//            name:"常规的Alert",
//            callback: function() {
//                return TestViewScene.testAlert();
//            }
//        },
//        {
//            name:"自动消失的Alert",
//            callback: function() {
//                return TestViewScene.testAutoDisappearAlert();
//            }
//        },
//        {
//            name:"带确定按钮的popLayer",
//            callback: function() {
//                return TestViewScene.testPopLayerOKButton();
//            }
//        },
    ],

    ctor: function () {
        this._super();

       // TestViewScene.initPlayer();

        //var layer = new MainViewLayer();  // 使得MainController.clientRect取到正确的值

        var layout = new ccui.Layout();
        var height = 0;
        for (var j = this._properties.length, cnt = j; j > 0; --j) {
            var button = new ccui.Button();
            //button.loadTextureNormal("btn_mopup_time_0.png", ccui.Widget.PLIST_TEXTURE);
            var str = j.toFixed(0) + ". " + this._properties[j - 1].name;
            button.setTitleText(str);
            button.setTitleFontName("Arial-BoldMT");
            button.setTitleFontSize(50);
            //button.setScale9Enabled(true);
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
        var closeButton = new cc.LabelTTF("重置", "Arial-BoldMT", 34);
        closeButton.addTouchEventListenerOneByOne(function(){
            cc.director.runScene(new TestViewScene());
        });

        closeButton.setPosition(cc.pSub(cc.pFromSize(cc.winSize), cc.pCenter(closeButton.getContentSize())));
        UICommon.addBackgroundLayer(closeButton, cc.color(0, 0, 0), 255);
    }
});


TestViewScene.resetPlayer = function() {
    MainController.getInstance()._player = new BPPlayer();
};

TestViewScene.uistringTest = function() {
    var layer = new cc.Layer();

    var layerColor = new cc.LayerColor(cc.color(255, 255, 255, 255));
    layer.addChild(layerColor);

    var str = "<b t=1 u=1>按钮</b>喝酒后将获得<l c=ff0000 >精神高涨</l>效果，战斗金钱奖励增加<l c=ff0000 >80%</l>!<l c=ff0000>\n每天只能喝酒一次.</l>";//<i n=icon_money s=1.5/>";
    var richTextEx = BPUIString.scriptToRichTextEx(str, -1, "Arial", 30, cc.BLACK, function(rt, el) {
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
                var sprite = new cc.Sprite("#icon_item_10001.png");
                sprite.anchorX = 0;
                sprite.anchorY = 0;
                sprite.x = 0;
                sprite.y = 0;
                cell.addChild(sprite);

                var button = new cc.ControlButton(cc.LabelTTF.create("", "Arial", 12),cc.Scale9Sprite.create());
                cc.director.getEventDispatcher().resumeEventListenersForTarget(button);
                var listener = cc.EventListener.create({
                    event: cc.EventListener.TOUCH_ONE_BY_ONE,
                    swallowTouches: false,
                    onTouchBegan: button.onTouchBegan,
                    onTouchMoved: button.onTouchMoved,
                    onTouchEnded: button.onTouchEnded,
                    onTouchCancelled: button.onTouchCancelled
                });
                cc.director.getEventDispatcher().addEventListenerWithSceneGraphPriority(listener,button);

                //button.loadTextureNormal("icon_item_10001.png", ccui.Widget.PLIST_TEXTURE);
                //button.setScale9Enabled(true);
                cell.addChild(button);
                button.setPosition(cc.pAdd(cc.pCenter(button.getContentSize()), cc.p(100, 0)));

                label = new cc.LabelTTF(strValue, "Helvetica", 20.0);
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

TestViewScene.uiTableViewTest = function() {
    var layer = new cc.Layer();

    var tableView = new ccui.TableView();
    tableView.setContentSize(cc.size(350, 500));
    tableView.setDirection(ccui.TableView.DIR_VERTICAL);
    tableView.setNumberOfCellsInTableView(function(table){return 60;});
    tableView.setTableCellSizeForIndex(function(table, idx){return cc.size(350, 150)});
    tableView.setTableCellAtIndex(function(table, idx) {
        var strValue = idx.toFixed(0);
        var cell = table.dequeueCell();
        var label;
        if (cell == null) {
            var CustomTableViewCell = ccui.TableViewCell.extend({_label: null});

            cell = new CustomTableViewCell();
            var sprite = new cc.Sprite("#icon_item_10001.png");
            sprite.anchorX = 0;
            sprite.anchorY = 0;
            sprite.x = 0;
            sprite.y = 0;
            cell.addChild(sprite);

            var button = new ccui.Button();
            button.loadTextureNormal("icon_item_10001.png", ccui.Widget.PLIST_TEXTURE);
            button.setScale9Enabled(true);
            cell.addChild(button);
            button.setPosition(cc.pAdd(cc.pCenter(button.getContentSize()), cc.p(100, 0)));
            button.addTouchEventListener(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    //table.setTouchEnabled(false);
                }
            }, null);

            var cb = cc.ControlButton.createWithSpriteFrameName("icon_item_10001.png");
            cell.addChild(cb);
            cb.setPosition(cc.pAdd(cc.pCenter(cb.getContentSize()), cc.p(200, 0)));

            label = new cc.LabelTTF(strValue, "Helvetica", 30.0);
            label.enableStroke(cc.BLACK, 10);
            label.setAnchorPoint(cc.p(0, 0));
            cell.addChild(label);
            cell._label = label;
        } else {
            label = cell._label;
            label.setString(strValue);
        }

        return cell;
    });


    tableView.setVerticalFillOrder(ccui.TableView.FILL_TOPDOWN);
    layer.addChild(tableView);
    tableView.setAnchorPoint(cc.p(0, 0));
    tableView.setPosition(cc.p(100, cc.winSize.height / 2 - 150));
    tableView.reloadData();

    var scrollBar = UICommon.createRelativeScrollBarForScrollView(tableView);
    scrollBar.setColor(cc.RED);
    layer.addChild(scrollBar);
    scrollBar.setAnchorPoint(cc.p(0, 0));
    scrollBar.setPosition(cc.p(450, cc.winSize.height / 2 - 150));

    tableView.setTouchEnabled(false);

    var button = new ccui.Button();
    button.loadTextureNormal("icon_item_10001.png", ccui.Widget.PLIST_TEXTURE);
    button.setScale9Enabled(true);
    layer.addChild(button);
    button.setPosition(cc.pCenter(button.getContentSize()));
    button.addTouchEventListener(function(sender, type) {
        if (type == ccui.Widget.TOUCH_ENDED) {
            tableView.setInnerContainerOffset(cc.p(0, 0));
        }
    }, null);

    var touchWidget = new ccui.Widget();
    touchWidget.setContentSize(cc.winSize);
    layer.addChild(touchWidget);
    touchWidget.setPosition(cc.pCenter(cc.winSize));
    UICommon.addBackgroundLayer(touchWidget);

    var prevOffset;
    touchWidget.setTouchEnabled(true);
    touchWidget.addTouchEventListener(function(sender, event) {
        switch (event) {
            case ccui.Widget.TOUCH_BEGAN: {
                var pos = sender.getTouchBeganPosition();
                cc.log("getTouchBeganPosition", pos.x, pos.y);
                prevOffset = tableView.getInnerContainerOffset();
                break;
            }
            case ccui.Widget.TOUCH_MOVED: {
                var pos0 = sender.getTouchBeganPosition();
                var pos1 = sender.getTouchMovePosition();
                tableView.setInnerContainerOffset(cc.p(prevOffset.x, prevOffset.y - (pos0.y - pos1.y)));
                break;
            }
            case ccui.Widget.TOUCH_ENDED: {
                var pos = sender.getTouchEndPosition();
                cc.log("getTouchEndPosition", pos.x, pos.y);
                break;
            }
            case ccui.Widget.TOUCH_CANCELED:
                break;
        }
    }, null);

    var s9 = new cc.Scale9Sprite("bar_mainbar_exp_tp1.png");
    layer.addChild(s9);
    s9.setPosition(cc.p(300, 300));
    s9.setContentSize(cc.size(400, 20));
    UICommon.addBackgroundLayer(s9, cc.GREEN);
//    s9.setInsetLeft(0);
//    s9.setInsetRight(0);
//    s9.setInsetTop(1);
//    s9.setInsetBottom(1);

    var pb = new ProgressBar("bar_mainbar_exp_tp1.png");
    pb.setContentSize(cc.size(400, 20));
    layer.addChild(pb);
    pb.setPosition(cc.p(300, 200));
    pb.setPercentage(100);
    pb.setInsetLeft(10);
    pb.setInsetRight(10);
    pb.setInsetTop(1);
    pb.setInsetBottom(1);

    UICommon.addBackgroundLayer(pb, cc.GREEN);
//    UICommon.addBackgroundLayer(pb._sprite, cc.BLUE);
    return layer;
};

TestViewScene.testAlert = function() {
    var layer = new cc.Layer();
    MainController.showAlertByText("常规的Alert");
    return layer;
};

TestViewScene.testAutoDisappearAlert = function() {
    var layer = new cc.Layer();
    MainController.showAutoDisappearAlertByText("自动消失的Alert");
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

TestViewScene.createOfficerView = function()
{
//    var jsonStr = '[{"aniSuperItem": -1, "aniSuper": -1, "star": 1, "skeleton": "M5", "magAtk": 0.0, "isInIll": "\u662f", "hp": 2.0, "phyAtk": 3.0, "howUse": "\u5148\u58f0\u593a\u4eba", "scoreRecover": 0, "country": "\u9b4f\u56fd", "aniVitory": 1, "aniSkin": 10, "cost": 2, "aniAtk2": -1, "posSkills": [], "aniProvocation": 1, "recover": 0.0, "magDef": 0.0, "occupation": "\u6218\u58eb", "phyDef": 1.0, "skillArray": [], "scorePhyAtk": 32, "name": "\u55bd\u55701", "level": 0, "aniAtk3": -1, "atkType": 0, "desc": "\u653b\u654f\u90fd\u4e0d\u9519\uff0c\u4f46\u662f\u751f\u5b58\u80fd\u529b\u5dee\uff0c\u9700\u8981\u4fdd\u62a4\uff1b\u51cf\u653b\u7684\u7279\u6280\u7528\u4e8e\u9650\u5236\u5bf9\u624b\u4e3b\u529b\u8f93\u51fa\u975e\u5e38\u6709\u6548", "scorePhyDef": 20, "officerId": 110221, "weaponType": "\u5355\u624b\u780d", "howGet": "\u5173\u5361\u6389\u843d", "skills": [], "aniWait": 1, "rageRecover": 1.0, "scoreHp": 21, "exp": 0, "elementType": "\u706b", "aniAtk1": -1, "aniInjured": -1}, {"aniSuperItem": -1, "aniSuper": -1, "star": 5, "skeleton": "L2", "magAtk": 0.0, "isInIll": "\u662f", "hp": 5.0, "phyAtk": 8.0, "howUse": "\u5148\u58f0\u593a\u4eba", "scoreRecover": 0, "country": "\u9b4f\u56fd", "aniVitory": 1, "aniSkin": 2, "cost": 2, "aniAtk2": -1, "posSkills": [], "aniProvocation": 1, "recover": 0.0, "magDef": 0.0, "occupation": "\u6218\u58eb", "phyDef": 2.0, "skillArray": [], "scorePhyAtk": 37, "name": "\u8bb8\u8bf8", "level": 0, "aniAtk3": -1, "atkType": 0, "desc": "\u653b\u6377\u90fd\u4e0d\u9519\u7684\u653b\u51fb\u578b\u6b66\u5c06", "scorePhyDef": 29, "officerId": 110222, "weaponType": "\u53cc\u6301\u780d", "howGet": "\u5173\u5361\u6389\u843d", "skills": [], "aniWait": 1, "rageRecover": 1.0, "scoreHp": 31, "exp": 0, "elementType": "\u6728", "aniAtk1": -1, "aniInjured": -1}]';
//    jsonStr = eval("("+ jsonStr +")");
//
//    var array = [];
//    for (var i = 0, cnt = jsonStr.length; i < cnt; i++)
//    {
//        var data = jsonStr[i];
//        var officerInfo = new OfficerInfo();
//        officerInfo.initFromJson(data);
//        array.push(officerInfo);
//    }
//
//    var layer = new OfficerSelectViewController(array, VIEW_TYPE_OFFICER.VIEW_TYPE_OFFICER_SELECTION);
//
//    return layer;
};

TestViewScene.testOfficerAvatarWidget = function() {
    var layer = new cc.Layer();

    var avatar = new OfficerAvatarWidget();
    layer.addChild(avatar);
    avatar.setPosition(cc.p(100, 400));
    UICommon.addBackgroundLayer(avatar);

    avatar = new OfficerAvatarWidget();
    layer.addChild(avatar);
    avatar.setPosition(cc.p(300, 400));
    UICommon.addBackgroundLayer(avatar);

    avatar.setTouchEnabled(true);
    avatar.addTouchEventListener(function(sender, type) {
        if (type == ccui.Widget.TOUCH_ENDED) {
            cc.log("这个也是可以点击的^_^", sender, type);
        }
    }, null);
    return layer;
};


/**
 * 测试popLayerOkButton
 */
TestViewScene.testPopLayerOKButton = function() {

    //ccb变量

   // cc.spriteFrameCache.addSpriteFrames("res/art/ui_survival.plist");

    var layer = new cc.LayerColor();
    layer.setColor(cc.RED);
    layer.setContentSize(cc.size(400, 100));

    var bgLayer = new cc.LayerColor();
    bgLayer.setContentSize(cc.winSize);
    bgLayer.setColor(cc.GREEN);




    //bgLayer = new StageRewardBox();

    //var bgLayer = new PopLayer(bgLayer);

    //bgLayer = new ChapterManagerLayer();
    var system = new cc.ParticleExplosion();
    layer.addChild(system);

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
        if (objProp instanceof Function) {
            continue;
        }

        var keyName = (prop.substr(0, 1) == "_") ? prop.substr(1, 1) + prop.substr(2, prop.length) : prop;
        console.log(cc.formatStr("    this.%s = BPCommon.getValueWithKey(jsonData, \"%s\", this.%s);" , prop, keyName, prop));
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

    console.log("===================开始生成 get 方法=====================");

    var object = null;
    eval(cc.formatStr("object = new %s();", className));

    for (var prop in object) {
        var objProp = object[prop];
        if (objProp instanceof Function) {
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

TestViewScene.testRaffleCardLayer = function() {
    //var jsonData = {"packetInfo": {"0": {"officerInfoArray": [{"scorePhyDef": 0, "skeleton": "L1", "howUse": "\u5148\u58f0\u593a\u4eba", "scoreRecover": 0, "cost": 2, "aniProvocation": 1, "occupation": "\u6218\u58eb", "howGet": "\u62bd\u5361\u83b7\u5f97", "atkType": 0, "aniSuper": -1, "isInIll": "", "baseExp": 240, "aniInjured": -1, "star": 6, "posSkill": [{"description": "\u6218\u6597\u5f00\u59cb\u65f6\uff0c\u4f1a\u5236\u9020\u81ea\u8eab\u9632\u5fa1*0.1\u7684\u62a4\u76fe", "aniId": "", "attackRangeIcon": 0, "hitType": "\u6548\u679c", "cost": 0, "effectList": [{"rangeType": "\u5355\u4f53", "aniId": -1, "countDown": 0, "triggerRate": null, "timeInterval": 0, "targetType": "\u5df1\u65b9", "maxStack": 1, "triggerCondition": "\u5f53\u524d\u884c\u52a8\u56de\u5408=1", "name": "\u706b\u5f20\u98de\u88ab\u52a8\u6548\u679c1", "expreValue": "\u5f53\u524d\u9632\u5fa1*0.1", "type": "\u62a4\u76fe"}], "uid": 20023, "name": "\u706b\u5f20\u98de\u88ab\u52a8", "distanceType": "", "score": 1.2, "attackAniPos": "\u76ee\u6807", "type": "\u88ab\u52a8\u6280"}], "scoreHp": 0, "aniVitory": 1, "aniSkin": 3, "desc": "", "skillArray": [], "elementType": 3, "scorePhyAtk": 0, "name": "\u5f20\u98de", "aniAtk3": -1, "aniAtk2": -1, "aniAtk1": -1, "weaponType": "\u53cc\u624b\u780d", "officerId": 110227, "aniWait": 3, "rageRecover": 1.5, "country": "\u8700\u56fd", "aniSuperItem": -1}, {"scorePhyDef": 0, "skeleton": "M1", "howUse": "\u5148\u58f0\u593a\u4eba", "scoreRecover": 0, "cost": 2, "aniProvocation": 1, "occupation": "\u5f13\u624b", "howGet": "\u62bd\u5361\u83b7\u5f97", "atkType": 0, "aniSuper": -1, "isInIll": "", "baseExp": 240, "aniInjured": -1, "star": 5, "posSkill": [{"description": "3\u8fde\u51fb\u5f00\u59cb\uff0c\u81ea\u8eab\u653b\u51fb\u529b\u589e\u52a010%\uff0c\u6bcf\u589e\u52a01\u8fde\u51fb\uff0c\u653b\u51fb\u529b\u589e\u52a05%\uff0c\u6700\u5927\u589e\u5e4550%\uff0c\u8fde\u51fb\u7ed3\u675f\u540e\u653b\u51fb\u529b\u56de\u590d", "aniId": "", "attackRangeIcon": 0, "hitType": "\u6548\u679c", "cost": 0, "effectList": [{"rangeType": "\u5355\u4f53", "aniId": -1, "countDown": 0, "triggerRate": null, "timeInterval": 0, "targetType": "\u81ea\u8eab", "maxStack": 1, "triggerCondition": "\u8fde\u51fb\u6570>=3", "name": "\u706b\u9ec4\u5fe0\u88ab\u52a8\u6548\u679c1", "expreValue": "0.1+\uff08\u8fde\u51fb\u6570-3\uff09*0.05", "type": "\u6b66\u529b\u589e\u52a0"}], "uid": 20019, "name": "\u706b\u9ec4\u5fe0\u88ab\u52a8", "distanceType": "", "score": 1.2, "attackAniPos": "\u76ee\u6807", "type": "\u88ab\u52a8\u6280"}], "scoreHp": 0, "aniVitory": 1, "aniSkin": 1, "desc": "", "skillArray": [], "elementType": 3, "scorePhyAtk": 0, "name": "\u9ec4\u5fe0", "aniAtk3": -1, "aniAtk2": -1, "aniAtk1": -1, "weaponType": "\u5355\u624b\u8fdc\u7a0b", "officerId": 110226, "aniWait": 1, "rageRecover": 1.5, "country": "\u8700\u56fd", "aniSuperItem": -1}, {"scorePhyDef": 58, "skeleton": "M6", "howUse": "\u5148\u58f0\u593a\u4eba", "scoreRecover": 0, "cost": 6, "aniProvocation": 1, "occupation": "\u76d7\u8d3c", "howGet": "\u62bd\u5361\u83b7\u5f97", "atkType": 0, "aniSuper": -1, "isInIll": "\u662f", "baseExp": 240, "aniInjured": -1, "star": 5, "posSkill": [{"description": "\u6697\u5c5e\u6027\u653b\u51fb\u529b\u589e\u52a010%", "aniId": "", "attackRangeIcon": 0, "hitType": "\u6548\u679c", "cost": 0, "effectList": [{"rangeType": "\u5168\u4f53", "aniId": -1, "countDown": 1, "triggerRate": null, "timeInterval": 0, "targetType": "\u5df1\u65b9", "maxStack": 1, "triggerCondition": "\u76ee\u6807.\u5c5e\u6027==\u6697", "name": "\u6697\u5f20\u90c3\u88ab\u52a8\u6548\u679c1", "expreValue": "\u81ea\u8eab.\u6b66\u529b*0.1", "type": "\u6b66\u529b\u589e\u52a0"}], "uid": 20014, "name": "\u6697\u5f20\u90c3\u88ab\u52a8", "distanceType": "", "score": 1.2, "attackAniPos": "\u76ee\u6807", "type": "\u88ab\u52a8\u6280"}], "scoreHp": 60, "aniVitory": 1, "aniSkin": 6, "desc": "", "skillArray": [], "elementType": 6, "scorePhyAtk": 86, "name": "\u5f20\u90c3", "aniAtk3": -1, "aniAtk2": -1, "aniAtk1": -1, "weaponType": "\u53cc\u6301\u780d", "officerId": 110225, "aniWait": 1, "rageRecover": 1.0, "country": "\u9b4f\u56fd", "aniSuperItem": -1}, {"scorePhyDef": 44, "skeleton": "L1", "howUse": "\u5148\u58f0\u593a\u4eba", "scoreRecover": 0, "cost": 4, "aniProvocation": 1, "occupation": "\u6218\u58eb", "howGet": "VIP\u8d60\u9001", "atkType": 0, "aniSuper": -1, "isInIll": "\u662f", "baseExp": 240, "aniInjured": -1, "star": 6, "posSkill": [{"description": "\u589e\u52a0\u5f53\u524d\u62a4\u76fe\u503c*0.1\u7684\u653b\u51fb\u529b", "aniId": "", "attackRangeIcon": 0, "hitType": "\u6548\u679c", "cost": 0, "effectList": [{"rangeType": "\u5355\u4f53", "aniId": -1, "countDown": 0, "triggerRate": null, "timeInterval": 0, "targetType": "\u81ea\u8eab", "maxStack": 1, "triggerCondition": "", "name": "\u6728\u5173\u7fbd\u88ab\u52a8\u6548\u679c1", "expreValue": "\u5f53\u524d\u62a4\u76fe*0.1", "type": "\u6b66\u529b\u589e\u52a0"}], "uid": 20009, "name": "\u6728\u5173\u7fbd\u88ab\u52a8", "distanceType": "", "score": 1.2, "attackAniPos": "\u76ee\u6807", "type": "\u88ab\u52a8\u6280"}], "scoreHp": 45, "aniVitory": 1, "aniSkin": 1, "desc": "\u9ad8\u653b\u654f\u7684\u5f3a\u529b\u8f93\u51fa\uff0c\u9700\u8981\u961f\u53cb\u4fdd\u62a4", "skillArray": [], "elementType": 1, "scorePhyAtk": 61, "name": "\u5173\u7fbd", "aniAtk3": -1, "aniAtk2": -1, "aniAtk1": -1, "weaponType": "\u53cc\u624b\u780d", "officerId": 110224, "aniWait": 1, "rageRecover": 1.0, "country": "\u8700\u56fd", "aniSuperItem": -1}, {"scorePhyDef": 50, "skeleton": "M2", "howUse": "\u5c5e\u6027\u5747\u8861", "scoreRecover": 0, "cost": 3, "aniProvocation": 1, "occupation": "\u76d7\u8d3c", "howGet": "\u5173\u5361\u6389\u843d", "atkType": 0, "aniSuper": -1, "isInIll": "\u662f", "baseExp": 240, "aniInjured": -1, "star": 6, "posSkill": [{"description": "3\u8fde\u51fb\u540e\uff0c\u6bcf\u589e\u52a01\u8fde\u51fb\uff0c\u8d75\u4e91\u4f1a\u7acb\u523b\u65e0\u6d88\u8017\u8ffd\u52a0\u4e00\u6b21\u653b\u51fb\uff08\u6b64\u653b\u51fb\u4e0d\u4f1a\u5f71\u54cd\u8fde\u51fb\uff09", "aniId": "", "attackRangeIcon": 0, "hitType": "\u6548\u679c", "cost": 0, "effectList": [{"rangeType": "\u5355\u4f53", "aniId": -1, "countDown": 0, "triggerRate": null, "timeInterval": 0, "targetType": "\u81ea\u8eab", "maxStack": 1, "triggerCondition": "\u8fde\u51fb\u6570>3.\u8fde\u51fb\u6570-3", "name": "\u6c34\u8d75\u4e91\u88ab\u52a8\u6548\u679c1", "expreValue": "\u81ea\u8eab\u6b66\u529b*1.0", "type": "\u8fde\u51fb\u8ffd\u51fb"}], "uid": 20005, "name": "\u6c34\u8d75\u4e91\u88ab\u52a8", "distanceType": "", "score": 1.2, "attackAniPos": "\u76ee\u6807", "type": "\u88ab\u52a8\u6280"}], "scoreHp": 51, "aniVitory": 1, "aniSkin": 2, "desc": "\u5747\u8861\u578b\u7684\u6b66\u5c06\uff0c\u4e3b\u8981\u4f9d\u9760\u7279\u6280\u8fdb\u884c\u8f93\u51fa\uff0c\u7279\u6280\u53ef\u6062\u590d\u6012\u6c14\uff0c\u4ece\u800c\u4f7f\u7279\u6280\u65bd\u653e\u66f4\u52a0\u9891\u7e41", "skillArray": [], "elementType": 2, "scorePhyAtk": 39, "name": "\u8d75\u4e91", "aniAtk3": -1, "aniAtk2": -1, "aniAtk1": -1, "weaponType": "\u53cc\u624b\u523a", "officerId": 110223, "aniWait": 2, "rageRecover": 1.0, "country": "\u8700\u56fd", "aniSuperItem": -1}, {"scorePhyDef": 0, "skeleton": "M7", "howUse": "\u5148\u58f0\u593a\u4eba", "scoreRecover": 0, "cost": 2, "aniProvocation": 1, "occupation": "\u6218\u58eb", "howGet": "\u62bd\u5361\u83b7\u5f97", "atkType": 0, "aniSuper": -1, "isInIll": "", "baseExp": 240, "aniInjured": -1, "star": 6, "posSkill": [{"description": "\u4f7f\u4e2d\u6bd2\u7684\u654c\u4eba\u9632\u5fa1\u529b\u964d\u4f4e10%", "aniId": "", "attackRangeIcon": 0, "hitType": "\u6548\u679c", "cost": 0, "effectList": [{"rangeType": "\u5355\u4f53", "aniId": -1, "countDown": 1, "triggerRate": null, "timeInterval": 0, "targetType": "\u654c\u65b9", "maxStack": 1, "triggerCondition": "\u76ee\u6807.\u6548\u679c.\u4e2d\u6bd2>=1", "name": "\u6697\u590f\u4faf\u60c7\u88ab\u52a8\u6548\u679c1", "expreValue": "\u76ee\u6807.\u9632\u5fa1*0.1", "type": "\u9632\u5fa1\u964d\u4f4e"}], "uid": 20027, "name": "\u6697\u590f\u4faf\u60c7\u88ab\u52a8", "distanceType": "", "score": 1.2, "attackAniPos": "\u76ee\u6807", "type": "\u88ab\u52a8\u6280"}], "scoreHp": 0, "aniVitory": 1, "aniSkin": 7, "desc": "", "skillArray": [], "elementType": 6, "scorePhyAtk": 0, "name": "\u590f\u4faf\u60c7", "aniAtk3": -1, "aniAtk2": -1, "aniAtk1": -1, "weaponType": "\u53cc\u624b\u780d", "officerId": 110228, "aniWait": 1, "rageRecover": 1.0, "country": "\u9b4f\u56fd", "aniSuperItem": -1}], "packetType": 0, "minStar": 5, "maxStar": 6, "costCurrency": {"0": 11}, "packetId": 1}, "1": {"officerInfoArray": [{"scorePhyDef": 0, "skeleton": "L2", "howUse": "\u5148\u58f0\u593a\u4eba", "scoreRecover": 0, "cost": 2, "aniProvocation": 2, "occupation": "\u72c2\u6218", "howGet": "\u62bd\u5361\u83b7\u5f97", "atkType": 0, "aniSuper": -1, "isInIll": "", "baseExp": 240, "aniInjured": -1, "star": 6, "posSkill": [{"description": "\u82e5\u653b\u51fb\u5e26\u6709\u6050\u60e7\u7684\u654c\u4eba\uff0c\u989d\u5916\u9020\u6210\u653b\u51fb\u529b*0.1\u7684\u771f\u5b9e\u4f24\u5bb3", "aniId": "", "attackRangeIcon": 0, "hitType": "\u6548\u679c", "cost": 0, "effectList": [{"rangeType": "\u5355\u4f53", "aniId": -1, "countDown": 0, "triggerRate": null, "timeInterval": 0, "targetType": "\u654c\u65b9", "maxStack": 1, "triggerCondition": "\u76ee\u6807.\u6548\u679c.\u6050\u60e7>=1", "name": "\u6697\u5415\u5e03\u88ab\u52a8\u6548\u679c1", "expreValue": "\u81ea\u8eab.\u6b66\u529b*0.1", "type": "\u771f\u5b9e\u4f24\u5bb3"}], "uid": 20030, "name": "\u6697\u5415\u5e03\u88ab\u52a8", "distanceType": "", "score": 1.2, "attackAniPos": "\u76ee\u6807", "type": "\u88ab\u52a8\u6280"}], "scoreHp": 0, "aniVitory": 2, "aniSkin": 4, "desc": "", "skillArray": [], "elementType": 6, "scorePhyAtk": 0, "name": "\u5415\u5e03", "aniAtk3": -1, "aniAtk2": -1, "aniAtk1": -1, "weaponType": "\u53cc\u6301\u780d", "officerId": 110229, "aniWait": 2, "rageRecover": 1.0, "country": "\u7fa4\u96c4", "aniSuperItem": -1}, {"scorePhyDef": 0, "skeleton": "M1", "howUse": "\u5148\u58f0\u593a\u4eba", "scoreRecover": 0, "cost": 2, "aniProvocation": 1, "occupation": "\u6cd5\u5e08", "howGet": "\u62bd\u5361\u83b7\u5f97", "atkType": 0, "aniSuper": -1, "isInIll": "", "baseExp": 240, "aniInjured": -1, "star": 6, "posSkill": [{"description": "\u6280\u80fd\u548c\u5fc5\u6740\u4f1a\u6839\u636e\u654c\u4eba\u7684\u6570\u91cf\u63d0\u5347\u4f24\u5bb3\uff0c\u6bcf\u6709\u4e00\u4e2a\u654c\u4eba\uff0c\u4f24\u5bb3\u589e\u52a05%", "aniId": "", "attackRangeIcon": 0, "hitType": "\u6548\u679c", "cost": 0, "effectList": [{"rangeType": "\u5355\u4f53", "aniId": -1, "countDown": 1, "triggerRate": null, "timeInterval": 0, "targetType": "\u5355\u4f53", "maxStack": 1, "triggerCondition": "", "name": "\u5149\u8bf8\u845b\u4eae\u88ab\u52a8\u6548\u679c1", "expreValue": "\u654c\u65b9.\u51fb\u4e2d\u654c\u4eba\u6570*(\u81ea\u8eab.\u6b66\u529b*0.05)", "type": "\u6b66\u529b\u589e\u52a0"}], "uid": 20040, "name": "\u5149\u8bf8\u845b\u4eae\u88ab\u52a8", "distanceType": "", "score": 1.2, "attackAniPos": "\u76ee\u6807", "type": "\u88ab\u52a8\u6280"}], "scoreHp": 0, "aniVitory": 1, "aniSkin": 4, "desc": "", "skillArray": [], "elementType": 5, "scorePhyAtk": 0, "name": "\u8bf8\u845b\u4eae", "aniAtk3": -1, "aniAtk2": -1, "aniAtk1": -1, "weaponType": "\u5355\u624b\u8fdc\u7a0b", "officerId": 110232, "aniWait": 4, "rageRecover": 1.0, "country": "\u8700\u56fd", "aniSuperItem": -1}, {"scorePhyDef": 0, "skeleton": "M5", "howUse": "\u5148\u58f0\u593a\u4eba", "scoreRecover": 0, "cost": 2, "aniProvocation": 1, "occupation": "\u6218\u58eb", "howGet": "\u62bd\u5361\u83b7\u5f97", "atkType": 0, "aniSuper": -1, "isInIll": "", "baseExp": 240, "aniInjured": -1, "star": 5, "posSkill": [{"description": "\u706b\u5c5e\u6027\u89d2\u8272\u653b\u51fb\u529b\u589e\u52a010%", "aniId": "", "attackRangeIcon": 0, "hitType": "\u6548\u679c", "cost": 0, "effectList": [{"rangeType": "\u5168\u4f53", "aniId": -1, "countDown": 1, "triggerRate": null, "timeInterval": 0, "targetType": "\u5df1\u65b9", "maxStack": 1, "triggerCondition": "\u76ee\u6807.\u5c5e\u6027==\u706b", "name": "\u706b\u5b59\u575a\u88ab\u52a8\u6548\u679c1", "expreValue": "\u81ea\u8eab.\u6b66\u529b*0.1", "type": "\u6b66\u529b\u589e\u52a0"}], "uid": 20034, "name": "\u706b\u5b59\u575a\u88ab\u52a8", "distanceType": "", "score": 1.2, "attackAniPos": "\u76ee\u6807", "type": "\u88ab\u52a8\u6280"}], "scoreHp": 0, "aniVitory": 1, "aniSkin": 5, "desc": "", "skillArray": [], "elementType": 3, "scorePhyAtk": 0, "name": "\u5b59\u575a", "aniAtk3": -1, "aniAtk2": -1, "aniAtk1": -1, "weaponType": "\u5355\u624b\u780d", "officerId": 110230, "aniWait": 1, "rageRecover": 1.5, "country": "\u5434\u56fd", "aniSuperItem": -1}, {"scorePhyDef": 0, "skeleton": "M1", "howUse": "\u5148\u58f0\u593a\u4eba", "scoreRecover": 0, "cost": 2, "aniProvocation": 1, "occupation": "\u7267\u5e08", "howGet": "\u62bd\u5361\u83b7\u5f97", "atkType": 1, "aniSuper": -1, "isInIll": "", "baseExp": 240, "aniInjured": -1, "star": 5, "posSkill": [{"description": "\u6211\u65b9\u6bcf\u6b21\u884c\u52a8\u56de\u590d5%\u7684HP", "aniId": "", "attackRangeIcon": 0, "hitType": "\u6548\u679c", "cost": 0, "effectList": [{"rangeType": "\u5168\u4f53", "aniId": -1, "countDown": 0, "triggerRate": null, "timeInterval": 0, "targetType": "\u5df1\u65b9", "maxStack": 1, "triggerCondition": "", "name": "\u5149\u9ec4\u6708\u82f1\u88ab\u52a8\u6548\u679c1", "expreValue": "\u56de\u590d\u529b*0.05", "type": "\u56de\u590d\u751f\u547d\u503c"}], "uid": 20037, "name": "\u5149\u9ec4\u6708\u82f1\u88ab\u52a8", "distanceType": "", "score": 1.2, "attackAniPos": "\u76ee\u6807", "type": "\u88ab\u52a8\u6280"}], "scoreHp": 0, "aniVitory": 1, "aniSkin": 8, "desc": "", "skillArray": [], "elementType": 5, "scorePhyAtk": 0, "name": "\u9ec4\u6708\u82f1", "aniAtk3": -1, "aniAtk2": -1, "aniAtk1": -1, "weaponType": "\u5355\u624b\u8fdc\u7a0b", "officerId": 110231, "aniWait": 5, "rageRecover": 1.0, "country": "\u8700\u56fd", "aniSuperItem": -1}], "packetType": 1, "minStar": 5, "maxStar": 6, "costCurrency": {"1": 22}, "packetId": 2}, "2": {"officerInfoArray": [{"scorePhyDef": 0, "skeleton": "L1", "howUse": "\u5148\u58f0\u593a\u4eba", "scoreRecover": 0, "cost": 2, "aniProvocation": 1, "occupation": "\u6218\u58eb", "howGet": "\u62bd\u5361\u83b7\u5f97", "atkType": 0, "aniSuper": -1, "isInIll": "", "baseExp": 240, "aniInjured": -1, "star": 6, "posSkill": [{"description": "\u6218\u6597\u5f00\u59cb\u65f6\uff0c\u4f1a\u5236\u9020\u81ea\u8eab\u9632\u5fa1*0.1\u7684\u62a4\u76fe", "aniId": "", "attackRangeIcon": 0, "hitType": "\u6548\u679c", "cost": 0, "effectList": [{"rangeType": "\u5355\u4f53", "aniId": -1, "countDown": 0, "triggerRate": null, "timeInterval": 0, "targetType": "\u5df1\u65b9", "maxStack": 1, "triggerCondition": "\u5f53\u524d\u884c\u52a8\u56de\u5408=1", "name": "\u706b\u5f20\u98de\u88ab\u52a8\u6548\u679c1", "expreValue": "\u5f53\u524d\u9632\u5fa1*0.1", "type": "\u62a4\u76fe"}], "uid": 20023, "name": "\u706b\u5f20\u98de\u88ab\u52a8", "distanceType": "", "score": 1.2, "attackAniPos": "\u76ee\u6807", "type": "\u88ab\u52a8\u6280"}], "scoreHp": 0, "aniVitory": 1, "aniSkin": 3, "desc": "", "skillArray": [], "elementType": 3, "scorePhyAtk": 0, "name": "\u5f20\u98de", "aniAtk3": -1, "aniAtk2": -1, "aniAtk1": -1, "weaponType": "\u53cc\u624b\u780d", "officerId": 110227, "aniWait": 3, "rageRecover": 1.5, "country": "\u8700\u56fd", "aniSuperItem": -1}, {"scorePhyDef": 0, "skeleton": "M1", "howUse": "\u5148\u58f0\u593a\u4eba", "scoreRecover": 0, "cost": 2, "aniProvocation": 1, "occupation": "\u5f13\u624b", "howGet": "\u62bd\u5361\u83b7\u5f97", "atkType": 0, "aniSuper": -1, "isInIll": "", "baseExp": 240, "aniInjured": -1, "star": 5, "posSkill": [{"description": "3\u8fde\u51fb\u5f00\u59cb\uff0c\u81ea\u8eab\u653b\u51fb\u529b\u589e\u52a010%\uff0c\u6bcf\u589e\u52a01\u8fde\u51fb\uff0c\u653b\u51fb\u529b\u589e\u52a05%\uff0c\u6700\u5927\u589e\u5e4550%\uff0c\u8fde\u51fb\u7ed3\u675f\u540e\u653b\u51fb\u529b\u56de\u590d", "aniId": "", "attackRangeIcon": 0, "hitType": "\u6548\u679c", "cost": 0, "effectList": [{"rangeType": "\u5355\u4f53", "aniId": -1, "countDown": 0, "triggerRate": null, "timeInterval": 0, "targetType": "\u81ea\u8eab", "maxStack": 1, "triggerCondition": "\u8fde\u51fb\u6570>=3", "name": "\u706b\u9ec4\u5fe0\u88ab\u52a8\u6548\u679c1", "expreValue": "0.1+\uff08\u8fde\u51fb\u6570-3\uff09*0.05", "type": "\u6b66\u529b\u589e\u52a0"}], "uid": 20019, "name": "\u706b\u9ec4\u5fe0\u88ab\u52a8", "distanceType": "", "score": 1.2, "attackAniPos": "\u76ee\u6807", "type": "\u88ab\u52a8\u6280"}], "scoreHp": 0, "aniVitory": 1, "aniSkin": 1, "desc": "", "skillArray": [], "elementType": 3, "scorePhyAtk": 0, "name": "\u9ec4\u5fe0", "aniAtk3": -1, "aniAtk2": -1, "aniAtk1": -1, "weaponType": "\u5355\u624b\u8fdc\u7a0b", "officerId": 110226, "aniWait": 1, "rageRecover": 1.5, "country": "\u8700\u56fd", "aniSuperItem": -1}, {"scorePhyDef": 0, "skeleton": "M1", "howUse": "\u5148\u58f0\u593a\u4eba", "scoreRecover": 0, "cost": 2, "aniProvocation": 1, "occupation": "\u7267\u5e08", "howGet": "\u62bd\u5361\u83b7\u5f97", "atkType": 1, "aniSuper": -1, "isInIll": "", "baseExp": 240, "aniInjured": -1, "star": 5, "posSkill": [{"description": "\u6211\u65b9\u6bcf\u6b21\u884c\u52a8\u56de\u590d5%\u7684HP", "aniId": "", "attackRangeIcon": 0, "hitType": "\u6548\u679c", "cost": 0, "effectList": [{"rangeType": "\u5168\u4f53", "aniId": -1, "countDown": 0, "triggerRate": null, "timeInterval": 0, "targetType": "\u5df1\u65b9", "maxStack": 1, "triggerCondition": "", "name": "\u5149\u9ec4\u6708\u82f1\u88ab\u52a8\u6548\u679c1", "expreValue": "\u56de\u590d\u529b*0.05", "type": "\u56de\u590d\u751f\u547d\u503c"}], "uid": 20037, "name": "\u5149\u9ec4\u6708\u82f1\u88ab\u52a8", "distanceType": "", "score": 1.2, "attackAniPos": "\u76ee\u6807", "type": "\u88ab\u52a8\u6280"}], "scoreHp": 0, "aniVitory": 1, "aniSkin": 8, "desc": "", "skillArray": [], "elementType": 5, "scorePhyAtk": 0, "name": "\u9ec4\u6708\u82f1", "aniAtk3": -1, "aniAtk2": -1, "aniAtk1": -1, "weaponType": "\u5355\u624b\u8fdc\u7a0b", "officerId": 110231, "aniWait": 5, "rageRecover": 1.0, "country": "\u8700\u56fd", "aniSuperItem": -1}, {"scorePhyDef": 0, "skeleton": "M5", "howUse": "\u5148\u58f0\u593a\u4eba", "scoreRecover": 0, "cost": 2, "aniProvocation": 1, "occupation": "\u6218\u58eb", "howGet": "\u62bd\u5361\u83b7\u5f97", "atkType": 0, "aniSuper": -1, "isInIll": "", "baseExp": 240, "aniInjured": -1, "star": 5, "posSkill": [{"description": "\u706b\u5c5e\u6027\u89d2\u8272\u653b\u51fb\u529b\u589e\u52a010%", "aniId": "", "attackRangeIcon": 0, "hitType": "\u6548\u679c", "cost": 0, "effectList": [{"rangeType": "\u5168\u4f53", "aniId": -1, "countDown": 1, "triggerRate": null, "timeInterval": 0, "targetType": "\u5df1\u65b9", "maxStack": 1, "triggerCondition": "\u76ee\u6807.\u5c5e\u6027==\u706b", "name": "\u706b\u5b59\u575a\u88ab\u52a8\u6548\u679c1", "expreValue": "\u81ea\u8eab.\u6b66\u529b*0.1", "type": "\u6b66\u529b\u589e\u52a0"}], "uid": 20034, "name": "\u706b\u5b59\u575a\u88ab\u52a8", "distanceType": "", "score": 1.2, "attackAniPos": "\u76ee\u6807", "type": "\u88ab\u52a8\u6280"}], "scoreHp": 0, "aniVitory": 1, "aniSkin": 5, "desc": "", "skillArray": [], "elementType": 3, "scorePhyAtk": 0, "name": "\u5b59\u575a", "aniAtk3": -1, "aniAtk2": -1, "aniAtk1": -1, "weaponType": "\u5355\u624b\u780d", "officerId": 110230, "aniWait": 1, "rageRecover": 1.5, "country": "\u5434\u56fd", "aniSuperItem": -1}, {"scorePhyDef": 0, "skeleton": "L2", "howUse": "\u5148\u58f0\u593a\u4eba", "scoreRecover": 0, "cost": 2, "aniProvocation": 2, "occupation": "\u72c2\u6218", "howGet": "\u62bd\u5361\u83b7\u5f97", "atkType": 0, "aniSuper": -1, "isInIll": "", "baseExp": 240, "aniInjured": -1, "star": 6, "posSkill": [{"description": "\u82e5\u653b\u51fb\u5e26\u6709\u6050\u60e7\u7684\u654c\u4eba\uff0c\u989d\u5916\u9020\u6210\u653b\u51fb\u529b*0.1\u7684\u771f\u5b9e\u4f24\u5bb3", "aniId": "", "attackRangeIcon": 0, "hitType": "\u6548\u679c", "cost": 0, "effectList": [{"rangeType": "\u5355\u4f53", "aniId": -1, "countDown": 0, "triggerRate": null, "timeInterval": 0, "targetType": "\u654c\u65b9", "maxStack": 1, "triggerCondition": "\u76ee\u6807.\u6548\u679c.\u6050\u60e7>=1", "name": "\u6697\u5415\u5e03\u88ab\u52a8\u6548\u679c1", "expreValue": "\u81ea\u8eab.\u6b66\u529b*0.1", "type": "\u771f\u5b9e\u4f24\u5bb3"}], "uid": 20030, "name": "\u6697\u5415\u5e03\u88ab\u52a8", "distanceType": "", "score": 1.2, "attackAniPos": "\u76ee\u6807", "type": "\u88ab\u52a8\u6280"}], "scoreHp": 0, "aniVitory": 2, "aniSkin": 4, "desc": "", "skillArray": [], "elementType": 6, "scorePhyAtk": 0, "name": "\u5415\u5e03", "aniAtk3": -1, "aniAtk2": -1, "aniAtk1": -1, "weaponType": "\u53cc\u6301\u780d", "officerId": 110229, "aniWait": 2, "rageRecover": 1.0, "country": "\u7fa4\u96c4", "aniSuperItem": -1}, {"scorePhyDef": 0, "skeleton": "M7", "howUse": "\u5148\u58f0\u593a\u4eba", "scoreRecover": 0, "cost": 2, "aniProvocation": 1, "occupation": "\u6218\u58eb", "howGet": "\u62bd\u5361\u83b7\u5f97", "atkType": 0, "aniSuper": -1, "isInIll": "", "baseExp": 240, "aniInjured": -1, "star": 6, "posSkill": [{"description": "\u4f7f\u4e2d\u6bd2\u7684\u654c\u4eba\u9632\u5fa1\u529b\u964d\u4f4e10%", "aniId": "", "attackRangeIcon": 0, "hitType": "\u6548\u679c", "cost": 0, "effectList": [{"rangeType": "\u5355\u4f53", "aniId": -1, "countDown": 1, "triggerRate": null, "timeInterval": 0, "targetType": "\u654c\u65b9", "maxStack": 1, "triggerCondition": "\u76ee\u6807.\u6548\u679c.\u4e2d\u6bd2>=1", "name": "\u6697\u590f\u4faf\u60c7\u88ab\u52a8\u6548\u679c1", "expreValue": "\u76ee\u6807.\u9632\u5fa1*0.1", "type": "\u9632\u5fa1\u964d\u4f4e"}], "uid": 20027, "name": "\u6697\u590f\u4faf\u60c7\u88ab\u52a8", "distanceType": "", "score": 1.2, "attackAniPos": "\u76ee\u6807", "type": "\u88ab\u52a8\u6280"}], "scoreHp": 0, "aniVitory": 1, "aniSkin": 7, "desc": "", "skillArray": [], "elementType": 6, "scorePhyAtk": 0, "name": "\u590f\u4faf\u60c7", "aniAtk3": -1, "aniAtk2": -1, "aniAtk1": -1, "weaponType": "\u53cc\u624b\u780d", "officerId": 110228, "aniWait": 1, "rageRecover": 1.0, "country": "\u9b4f\u56fd", "aniSuperItem": -1}], "packetType": 2, "minStar": 5, "maxStar": 6, "costCurrency": {"1": 44}, "packetId": 3}, "3": {"officerInfoArray": [{"scorePhyDef": 0, "skeleton": "L1", "howUse": "\u5148\u58f0\u593a\u4eba", "scoreRecover": 0, "cost": 2, "aniProvocation": 1, "occupation": "\u6218\u58eb", "howGet": "\u62bd\u5361\u83b7\u5f97", "atkType": 0, "aniSuper": -1, "isInIll": "", "baseExp": 240, "aniInjured": -1, "star": 6, "posSkill": [{"description": "\u6218\u6597\u5f00\u59cb\u65f6\uff0c\u4f1a\u5236\u9020\u81ea\u8eab\u9632\u5fa1*0.1\u7684\u62a4\u76fe", "aniId": "", "attackRangeIcon": 0, "hitType": "\u6548\u679c", "cost": 0, "effectList": [{"rangeType": "\u5355\u4f53", "aniId": -1, "countDown": 0, "triggerRate": null, "timeInterval": 0, "targetType": "\u5df1\u65b9", "maxStack": 1, "triggerCondition": "\u5f53\u524d\u884c\u52a8\u56de\u5408=1", "name": "\u706b\u5f20\u98de\u88ab\u52a8\u6548\u679c1", "expreValue": "\u5f53\u524d\u9632\u5fa1*0.1", "type": "\u62a4\u76fe"}], "uid": 20023, "name": "\u706b\u5f20\u98de\u88ab\u52a8", "distanceType": "", "score": 1.2, "attackAniPos": "\u76ee\u6807", "type": "\u88ab\u52a8\u6280"}], "scoreHp": 0, "aniVitory": 1, "aniSkin": 3, "desc": "", "skillArray": [], "elementType": 3, "scorePhyAtk": 0, "name": "\u5f20\u98de", "aniAtk3": -1, "aniAtk2": -1, "aniAtk1": -1, "weaponType": "\u53cc\u624b\u780d", "officerId": 110227, "aniWait": 3, "rageRecover": 1.5, "country": "\u8700\u56fd", "aniSuperItem": -1}, {"scorePhyDef": 0, "skeleton": "M1", "howUse": "\u5148\u58f0\u593a\u4eba", "scoreRecover": 0, "cost": 2, "aniProvocation": 1, "occupation": "\u5f13\u624b", "howGet": "\u62bd\u5361\u83b7\u5f97", "atkType": 0, "aniSuper": -1, "isInIll": "", "baseExp": 240, "aniInjured": -1, "star": 5, "posSkill": [{"description": "3\u8fde\u51fb\u5f00\u59cb\uff0c\u81ea\u8eab\u653b\u51fb\u529b\u589e\u52a010%\uff0c\u6bcf\u589e\u52a01\u8fde\u51fb\uff0c\u653b\u51fb\u529b\u589e\u52a05%\uff0c\u6700\u5927\u589e\u5e4550%\uff0c\u8fde\u51fb\u7ed3\u675f\u540e\u653b\u51fb\u529b\u56de\u590d", "aniId": "", "attackRangeIcon": 0, "hitType": "\u6548\u679c", "cost": 0, "effectList": [{"rangeType": "\u5355\u4f53", "aniId": -1, "countDown": 0, "triggerRate": null, "timeInterval": 0, "targetType": "\u81ea\u8eab", "maxStack": 1, "triggerCondition": "\u8fde\u51fb\u6570>=3", "name": "\u706b\u9ec4\u5fe0\u88ab\u52a8\u6548\u679c1", "expreValue": "0.1+\uff08\u8fde\u51fb\u6570-3\uff09*0.05", "type": "\u6b66\u529b\u589e\u52a0"}], "uid": 20019, "name": "\u706b\u9ec4\u5fe0\u88ab\u52a8", "distanceType": "", "score": 1.2, "attackAniPos": "\u76ee\u6807", "type": "\u88ab\u52a8\u6280"}], "scoreHp": 0, "aniVitory": 1, "aniSkin": 1, "desc": "", "skillArray": [], "elementType": 3, "scorePhyAtk": 0, "name": "\u9ec4\u5fe0", "aniAtk3": -1, "aniAtk2": -1, "aniAtk1": -1, "weaponType": "\u5355\u624b\u8fdc\u7a0b", "officerId": 110226, "aniWait": 1, "rageRecover": 1.5, "country": "\u8700\u56fd", "aniSuperItem": -1}, {"scorePhyDef": 0, "skeleton": "M1", "howUse": "\u5148\u58f0\u593a\u4eba", "scoreRecover": 0, "cost": 2, "aniProvocation": 1, "occupation": "\u7267\u5e08", "howGet": "\u62bd\u5361\u83b7\u5f97", "atkType": 1, "aniSuper": -1, "isInIll": "", "baseExp": 240, "aniInjured": -1, "star": 5, "posSkill": [{"description": "\u6211\u65b9\u6bcf\u6b21\u884c\u52a8\u56de\u590d5%\u7684HP", "aniId": "", "attackRangeIcon": 0, "hitType": "\u6548\u679c", "cost": 0, "effectList": [{"rangeType": "\u5168\u4f53", "aniId": -1, "countDown": 0, "triggerRate": null, "timeInterval": 0, "targetType": "\u5df1\u65b9", "maxStack": 1, "triggerCondition": "", "name": "\u5149\u9ec4\u6708\u82f1\u88ab\u52a8\u6548\u679c1", "expreValue": "\u56de\u590d\u529b*0.05", "type": "\u56de\u590d\u751f\u547d\u503c"}], "uid": 20037, "name": "\u5149\u9ec4\u6708\u82f1\u88ab\u52a8", "distanceType": "", "score": 1.2, "attackAniPos": "\u76ee\u6807", "type": "\u88ab\u52a8\u6280"}], "scoreHp": 0, "aniVitory": 1, "aniSkin": 8, "desc": "", "skillArray": [], "elementType": 5, "scorePhyAtk": 0, "name": "\u9ec4\u6708\u82f1", "aniAtk3": -1, "aniAtk2": -1, "aniAtk1": -1, "weaponType": "\u5355\u624b\u8fdc\u7a0b", "officerId": 110231, "aniWait": 5, "rageRecover": 1.0, "country": "\u8700\u56fd", "aniSuperItem": -1}, {"scorePhyDef": 0, "skeleton": "M5", "howUse": "\u5148\u58f0\u593a\u4eba", "scoreRecover": 0, "cost": 2, "aniProvocation": 1, "occupation": "\u6218\u58eb", "howGet": "\u62bd\u5361\u83b7\u5f97", "atkType": 0, "aniSuper": -1, "isInIll": "", "baseExp": 240, "aniInjured": -1, "star": 5, "posSkill": [{"description": "\u706b\u5c5e\u6027\u89d2\u8272\u653b\u51fb\u529b\u589e\u52a010%", "aniId": "", "attackRangeIcon": 0, "hitType": "\u6548\u679c", "cost": 0, "effectList": [{"rangeType": "\u5168\u4f53", "aniId": -1, "countDown": 1, "triggerRate": null, "timeInterval": 0, "targetType": "\u5df1\u65b9", "maxStack": 1, "triggerCondition": "\u76ee\u6807.\u5c5e\u6027==\u706b", "name": "\u706b\u5b59\u575a\u88ab\u52a8\u6548\u679c1", "expreValue": "\u81ea\u8eab.\u6b66\u529b*0.1", "type": "\u6b66\u529b\u589e\u52a0"}], "uid": 20034, "name": "\u706b\u5b59\u575a\u88ab\u52a8", "distanceType": "", "score": 1.2, "attackAniPos": "\u76ee\u6807", "type": "\u88ab\u52a8\u6280"}], "scoreHp": 0, "aniVitory": 1, "aniSkin": 5, "desc": "", "skillArray": [], "elementType": 3, "scorePhyAtk": 0, "name": "\u5b59\u575a", "aniAtk3": -1, "aniAtk2": -1, "aniAtk1": -1, "weaponType": "\u5355\u624b\u780d", "officerId": 110230, "aniWait": 1, "rageRecover": 1.5, "country": "\u5434\u56fd", "aniSuperItem": -1}, {"scorePhyDef": 0, "skeleton": "L2", "howUse": "\u5148\u58f0\u593a\u4eba", "scoreRecover": 0, "cost": 2, "aniProvocation": 2, "occupation": "\u72c2\u6218", "howGet": "\u62bd\u5361\u83b7\u5f97", "atkType": 0, "aniSuper": -1, "isInIll": "", "baseExp": 240, "aniInjured": -1, "star": 6, "posSkill": [{"description": "\u82e5\u653b\u51fb\u5e26\u6709\u6050\u60e7\u7684\u654c\u4eba\uff0c\u989d\u5916\u9020\u6210\u653b\u51fb\u529b*0.1\u7684\u771f\u5b9e\u4f24\u5bb3", "aniId": "", "attackRangeIcon": 0, "hitType": "\u6548\u679c", "cost": 0, "effectList": [{"rangeType": "\u5355\u4f53", "aniId": -1, "countDown": 0, "triggerRate": null, "timeInterval": 0, "targetType": "\u654c\u65b9", "maxStack": 1, "triggerCondition": "\u76ee\u6807.\u6548\u679c.\u6050\u60e7>=1", "name": "\u6697\u5415\u5e03\u88ab\u52a8\u6548\u679c1", "expreValue": "\u81ea\u8eab.\u6b66\u529b*0.1", "type": "\u771f\u5b9e\u4f24\u5bb3"}], "uid": 20030, "name": "\u6697\u5415\u5e03\u88ab\u52a8", "distanceType": "", "score": 1.2, "attackAniPos": "\u76ee\u6807", "type": "\u88ab\u52a8\u6280"}], "scoreHp": 0, "aniVitory": 2, "aniSkin": 4, "desc": "", "skillArray": [], "elementType": 6, "scorePhyAtk": 0, "name": "\u5415\u5e03", "aniAtk3": -1, "aniAtk2": -1, "aniAtk1": -1, "weaponType": "\u53cc\u6301\u780d", "officerId": 110229, "aniWait": 2, "rageRecover": 1.0, "country": "\u7fa4\u96c4", "aniSuperItem": -1}, {"scorePhyDef": 0, "skeleton": "M7", "howUse": "\u5148\u58f0\u593a\u4eba", "scoreRecover": 0, "cost": 2, "aniProvocation": 1, "occupation": "\u6218\u58eb", "howGet": "\u62bd\u5361\u83b7\u5f97", "atkType": 0, "aniSuper": -1, "isInIll": "", "baseExp": 240, "aniInjured": -1, "star": 6, "posSkill": [{"description": "\u4f7f\u4e2d\u6bd2\u7684\u654c\u4eba\u9632\u5fa1\u529b\u964d\u4f4e10%", "aniId": "", "attackRangeIcon": 0, "hitType": "\u6548\u679c", "cost": 0, "effectList": [{"rangeType": "\u5355\u4f53", "aniId": -1, "countDown": 1, "triggerRate": null, "timeInterval": 0, "targetType": "\u654c\u65b9", "maxStack": 1, "triggerCondition": "\u76ee\u6807.\u6548\u679c.\u4e2d\u6bd2>=1", "name": "\u6697\u590f\u4faf\u60c7\u88ab\u52a8\u6548\u679c1", "expreValue": "\u76ee\u6807.\u9632\u5fa1*0.1", "type": "\u9632\u5fa1\u964d\u4f4e"}], "uid": 20027, "name": "\u6697\u590f\u4faf\u60c7\u88ab\u52a8", "distanceType": "", "score": 1.2, "attackAniPos": "\u76ee\u6807", "type": "\u88ab\u52a8\u6280"}], "scoreHp": 0, "aniVitory": 1, "aniSkin": 7, "desc": "", "skillArray": [], "elementType": 6, "scorePhyAtk": 0, "name": "\u590f\u4faf\u60c7", "aniAtk3": -1, "aniAtk2": -1, "aniAtk1": -1, "weaponType": "\u53cc\u624b\u780d", "officerId": 110228, "aniWait": 1, "rageRecover": 1.0, "country": "\u9b4f\u56fd", "aniSuperItem": -1}], "currentTrickNum": 4, "trickNum": 10, "packetType": 3, "minStar": 5, "maxStar": 6, "costCurrency": {"1": 440}, "packetId": 4}}};
    //var packetInfo = jsonData["packetInfo"];

    //return new RaffleCardLayer(packetInfo);

    cc.log("", cc.winSize.width, cc.winSize.height);

    var layer = new cc.Layer();

    if (1) {
        var flash = sg.BPFlashSprite.create("mov_ui_card3_5", 1);
        flash.scheduleUpdate();
        flash.setScale(cc.winSize.width / 742);
        flash.setPosition(cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.5));
        layer.addChild(flash);

        var flash3 = flash;

        var of = new sg.BPFlashSprite("mov_M2_stand_2", -1);
        of.changeAvata(2);
        of.scheduleUpdate();
        flash3.addChild(of);
        of.setPositionY(-200);
        of.setScale(1.5);
    }

    if (0) {
        var flash = sg.BPFlashSprite.create("mov_ui_card2_10", 1);
        flash.scheduleUpdate();
        //flash.setScale(cc.winSize.height / 2052);
        flash.setScale(cc.winSize.height / 1334);
        flash.setPosition(cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.5));
        layer.addChild(flash);
    }

    if (0) {
        var flash = sg.BPFlashSprite.create("mov_ui_card1a", 1);
        flash.scheduleUpdate();
        flash.setScale(cc.winSize.height / 1334);
        flash.setPosition(cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.5));
        layer.addChild(flash);
    }

    return layer;
};

TestViewScene.testAchievementSystemLayer = function() {
    var jsonData = {"quest":{"totalPoints":100,"rewards":[{"status":0,"items":[{"desc":"购买系统专属道具和武将","num":10,"name":"四九勋章","rank":1,"icon":5},{"desc":"购买系统专属道具和武将","num":10,"name":"古惑勋章","rank":2,"icon":6}],"point":100,"rewardId":1,"icon":"a1"}],"points":200,"quests":[{"name":"使用温泉","process":0,"maxTimes":10,"system":7,"pointPer":20,"icon":"a1"},{"name":"ATM提款","process":0,"maxTimes":20,"system":1,"pointPer":10,"icon":"a1"},{"name":"邀请好友","process":0,"maxTimes":3,"system":2,"pointPer":10,"icon":"a1"},{"name":"商店刷新","process":0,"maxTimes":10,"system":3,"pointPer":10,"icon":"a1"},{"name":"精英副本","process":0,"maxTimes":2,"system":4,"pointPer":5,"icon":"a1"},{"name":"抽卡","process":0,"maxTimes":20,"system":5,"pointPer":20,"icon":"a1"},{"name":"竞技场","process":0,"maxTimes":30,"system":6,"pointPer":1,"icon":"a1"}]},"type":20022,"achievement":[{"status":1,"index":1,"questId":10001,"maxProcess":10,"icon":10,"title":"唯我独尊","process":0,"sytem":8,"reward":[{"desc":"购买系统专属道具和武将","num":10,"name":"四九勋章","rank":1,"icon":5},{"desc":"购买系统专属道具和武将","num":10,"name":"古惑勋章","rank":2,"icon":6}],"desc":"用全女阵容无武将死亡通过三英战品布精英副本"},{"status":1,"index":1,"questId":10001,"maxProcess":10,"icon":10,"title":"唯我独尊","process":0,"sytem":8,"reward":[{"desc":"购买系统专属道具和武将","num":10,"name":"四九勋章","rank":1,"icon":5},{"desc":"购买系统专属道具和武将","num":10,"name":"古惑勋章","rank":2,"icon":6}],"desc":"用全女阵容无武将死亡通过三英战品布精英副本"},{"status":1,"index":1,"questId":10001,"maxProcess":10,"icon":10,"title":"唯我独尊","process":0,"sytem":8,"reward":[{"desc":"购买系统专属道具和武将","num":10,"name":"四九勋章","rank":1,"icon":5},{"desc":"购买系统专属道具和武将","num":10,"name":"古惑勋章","rank":2,"icon":6}],"desc":"用全女阵容无武将死亡通过三英战品布精英副本"},{"status":1,"index":1,"questId":10001,"maxProcess":10,"icon":10,"title":"唯我独尊","process":0,"sytem":8,"reward":[{"desc":"购买系统专属道具和武将","num":10,"name":"四九勋章","rank":1,"icon":5},{"desc":"购买系统专属道具和武将","num":10,"name":"古惑勋章","rank":2,"icon":6}],"desc":"用全女阵容无武将死亡通过三英战品布精英副本"},{"status":1,"index":1,"questId":10001,"maxProcess":10,"icon":10,"title":"唯我独尊","process":0,"sytem":8,"reward":[{"desc":"购买系统专属道具和武将","num":10,"name":"四九勋章","rank":1,"icon":5},{"desc":"购买系统专属道具和武将","num":10,"name":"古惑勋章","rank":2,"icon":6}],"desc":"用全女阵容无武将死亡通过三英战品布精英副本"},{"status":1,"index":1,"questId":10001,"maxProcess":10,"icon":10,"title":"唯我独尊","process":0,"sytem":8,"reward":[{"desc":"购买系统专属道具和武将","num":10,"name":"四九勋章","rank":1,"icon":5},{"desc":"购买系统专属道具和武将","num":10,"name":"古惑勋章","rank":2,"icon":6}],"desc":"用全女阵容无武将死亡通过三英战品布精英副本"},{"status":1,"index":1,"questId":10001,"maxProcess":10,"icon":10,"title":"唯我独尊","process":0,"sytem":8,"reward":[{"desc":"购买系统专属道具和武将","num":10,"name":"四九勋章","rank":1,"icon":5},{"desc":"购买系统专属道具和武将","num":10,"name":"古惑勋章","rank":2,"icon":6}],"desc":"用全女阵容无武将死亡通过三英战品布精英副本"},{"status":1,"index":1,"questId":10001,"maxProcess":10,"icon":10,"title":"唯我独尊","process":0,"sytem":8,"reward":[{"desc":"购买系统专属道具和武将","num":10,"name":"四九勋章","rank":1,"icon":5},{"desc":"购买系统专属道具和武将","num":10,"name":"古惑勋章","rank":2,"icon":6}],"desc":"用全女阵容无武将死亡通过三英战品布精英副本"},{"status":1,"index":1,"questId":10001,"maxProcess":10,"icon":10,"title":"唯我独尊","process":0,"sytem":8,"reward":[{"desc":"购买系统专属道具和武将","num":10,"name":"四九勋章","rank":1,"icon":5},{"desc":"购买系统专属道具和武将","num":10,"name":"古惑勋章","rank":2,"icon":6}],"desc":"用全女阵容无武将死亡通过三英战品布精英副本"},{"status":1,"index":1,"questId":10001,"maxProcess":10,"icon":10,"title":"唯我独尊","process":0,"sytem":8,"reward":[{"desc":"购买系统专属道具和武将","num":10,"name":"四九勋章","rank":1,"icon":5},{"desc":"购买系统专属道具和武将","num":10,"name":"古惑勋章","rank":2,"icon":6}],"desc":"用全女阵容无武将死亡通过三英战品布精英副本"},{"status":1,"index":1,"questId":10001,"maxProcess":10,"icon":10,"title":"唯我独尊","process":0,"sytem":8,"reward":[{"desc":"购买系统专属道具和武将","num":10,"name":"四九勋章","rank":1,"icon":5},{"desc":"购买系统专属道具和武将","num":10,"name":"古惑勋章","rank":2,"icon":6}],"desc":"用全女阵容无武将死亡通过三英战品布精英副本"},{"status":1,"index":1,"questId":10001,"maxProcess":10,"icon":10,"title":"唯我独尊","process":0,"sytem":8,"reward":[{"desc":"购买系统专属道具和武将","num":10,"name":"四九勋章","rank":1,"icon":5},{"desc":"购买系统专属道具和武将","num":10,"name":"古惑勋章","rank":2,"icon":6}],"desc":"用全女阵容无武将死亡通过三英战品布精英副本"},{"status":1,"index":1,"questId":10001,"maxProcess":10,"icon":10,"title":"唯我独尊","process":0,"sytem":8,"reward":[{"desc":"购买系统专属道具和武将","num":10,"name":"四九勋章","rank":1,"icon":5},{"desc":"购买系统专属道具和武将","num":10,"name":"古惑勋章","rank":2,"icon":6}],"desc":"用全女阵容无武将死亡通过三英战品布精英副本"},{"status":1,"index":1,"questId":10001,"maxProcess":10,"icon":10,"title":"唯我独尊","process":0,"sytem":8,"reward":[{"desc":"购买系统专属道具和武将","num":10,"name":"四九勋章","rank":1,"icon":5},{"desc":"购买系统专属道具和武将","num":10,"name":"古惑勋章","rank":2,"icon":6}],"desc":"用全女阵容无武将死亡通过三英战品布精英副本"},{"status":1,"index":1,"questId":10001,"maxProcess":10,"icon":10,"title":"唯我独尊","process":0,"sytem":8,"reward":[{"desc":"购买系统专属道具和武将","num":10,"name":"四九勋章","rank":1,"icon":5},{"desc":"购买系统专属道具和武将","num":10,"name":"古惑勋章","rank":2,"icon":6}],"desc":"用全女阵容无武将死亡通过三英战品布精英副本"},{"status":1,"index":1,"questId":10001,"maxProcess":10,"icon":10,"title":"唯我独尊","process":0,"sytem":8,"reward":[{"desc":"购买系统专属道具和武将","num":10,"name":"四九勋章","rank":1,"icon":5},{"desc":"购买系统专属道具和武将","num":10,"name":"古惑勋章","rank":2,"icon":6}],"desc":"用全女阵容无武将死亡通过三英战品布精英副本"}],"tag":1};

    //return new AchievementSystemLayer(jsonData["achievement"], MainController.clientRect);
    return null;
};

TestViewScene.testPromptingLayer = function() {
    var prompting = new PromptingInfo();
    prompting.initFromJson({"tipType": 1, "msg": "\u4e16\u754cboss\u6218\u5373\u5c06\u5f00\u59cb", "isAutoAlert": 1, "weights": 100, "uiId": 201, "deadline": 5});
    return new PromptingLayer(cc.p(cc.winSize.width - 50, 500), prompting);
};

TestViewScene.testOfficerCompound = function(){

    var json_0 = '{"baseExp": 240, "aniSuper": -1, "uid": 10001, "phyAtk": 0, ' +
        '"howUse": "\u5148\u58f0\u593a\u4eba", "scoreRecover": 0,' +
        ' "cost": 2, "totalExp": 240.0, "aniProvocation": 1,' +
        ' "recover": 0, "magDef": 0.0, "skeleton": "M5", ' +
        '"phyDef": 0, "officerId": 110221, "atkType": 0, ' +
        '"scorePhyDef": 20, "scoreHp": 21, ' +
        '"occupation": "\u6218\u58eb", ' +
        '"aniInjured": -1, "posSkills": [], "star": 1, ' +
        '"exp": 0.0, "magAtk": 0.0, "isInIll": "\u662f", ' +
        '"hp": 0, "aniVitory": 1, "aniSkin": 10, ' +
        '"desc": "\u653b\u654f\u90fd\u4e0d\u9519\uff0c\u4f46\u662f\u751f\u5b58\u80fd\u529b\u5dee\uff0c\u9700\u8981\u4fdd\u62a4\uff1b\u51cf\u653b\u7684\u7279\u6280\u7528\u4e8e\u9650\u5236\u5bf9\u624b\u4e3b\u529b\u8f93\u51fa\u975e\u5e38\u6709\u6548", ' +
        '"skillArray": [], "elementType": 3, "scorePhyAtk": 32, ' +
        '"name": "\u55bd\u55701", "level": 0, "aniAtk3": -1, ' +
        '"aniAtk2": -1, "aniAtk1": -1, "enhancedCostMoney": 10, ' +
        '"weaponType": "\u5355\u624b\u780d", ' +
        '"howGet": "\u5173\u5361\u6389\u843d", "skills": [], ' +
        '"aniWait": 1, "rageRecover": 1.0, ' +
        '"country": "\u9b4f\u56fd", "aniSuperItem": -1}';

    json_0 = eval("("+ json_0 +")");

    var officerFragmentInfo = new OfficerFragmentInfo();

    officerFragmentInfo.initFromJson(json_0);
    var winSize = cc.winSize;
    var bgLayer = new cc.LayerColor(cc.color(255,255, 255), winSize.width, winSize.height);

    MainController.pushLayerToRunningScene(bgLayer);
    var compoundlayer = new CompoundInfoLayer(officerFragmentInfo);
        return compoundlayer;
    var testArray = [];
    var json = '[{"baseExp": 240, "aniSuper": -1, "uid": 10001, "phyAtk": 0, "howUse": "\u5148\u58f0\u593a\u4eba", "scoreRecover": 0, "cost": 2, "totalExp": 240.0, "aniProvocation": 1, "recover": 0, "magDef": 0.0, "skeleton": "M5", "phyDef": 0, "officerId": 110221, "atkType": 0, "scorePhyDef": 20, "scoreHp": 21, "occupation": "\u6218\u58eb", "aniInjured": -1, "posSkills": [], "star": 1, "exp": 0.0, "magAtk": 0.0, "isInIll": "\u662f", "hp": 0, "aniVitory": 1, "aniSkin": 10, "desc": "\u653b\u654f\u90fd\u4e0d\u9519\uff0c\u4f46\u662f\u751f\u5b58\u80fd\u529b\u5dee\uff0c\u9700\u8981\u4fdd\u62a4\uff1b\u51cf\u653b\u7684\u7279\u6280\u7528\u4e8e\u9650\u5236\u5bf9\u624b\u4e3b\u529b\u8f93\u51fa\u975e\u5e38\u6709\u6548", "skillArray": [], "elementType": 3, "scorePhyAtk": 32, "name": "\u55bd\u55701", "level": 0, "aniAtk3": -1, "aniAtk2": -1, "aniAtk1": -1, "enhancedCostMoney": 10, "weaponType": "\u5355\u624b\u780d", "howGet": "\u5173\u5361\u6389\u843d", "skills": [], "aniWait": 1, "rageRecover": 1.0, "country": "\u9b4f\u56fd", "aniSuperItem": -1}, {"baseExp": 240, "aniSuper": -1, "uid": 20001, "phyAtk": 0, "howUse": "\u5148\u58f0\u593a\u4eba", "scoreRecover": 0, "cost": 2, "totalExp": 240.0, "aniProvocation": 1, "recover": 0, "magDef": 0.0, "skeleton": "L2", "phyDef": 0, "officerId": 110222, "atkType": 0, "scorePhyDef": 29, "scoreHp": 31, "occupation": "\u6218\u58eb", "aniInjured": -1, "posSkills": [], "star": 5, "exp": 0.0, "magAtk": 0.0, "isInIll": "\u662f", "hp": 0, "aniVitory": 1, "aniSkin": 2, "desc": "\u653b\u6377\u90fd\u4e0d\u9519\u7684\u653b\u51fb\u578b\u6b66\u5c06", "skillArray": [], "elementType": 6, "scorePhyAtk": 37, "name": "\u8bb8\u8bf8", "level": 0, "aniAtk3": -1, "aniAtk2": -1, "aniAtk1": -1, "enhancedCostMoney": 10, "weaponType": "\u53cc\u6301\u780d", "howGet": "\u5173\u5361\u6389\u843d", "skills": [], "aniWait": 1, "rageRecover": 1.0, "country": "\u9b4f\u56fd", "aniSuperItem": -1}]';
    json = eval("("+ json +")");
    for (var i = 0, cnt = json.length; i < cnt; i++)
    {
        var data = json[i];
        var officerInfo = new OfficerFragmentInfo();
        officerInfo.initFromJson(data);
        testArray.push(officerInfo);
    }

    var layer = new OfficerCompoundLayer(testArray);
    return layer;
};

TestViewScene.testOfficerEnhanceLayer = function(){
    var rect = MainController.clientRect;
    cc.log("" + rect.width + "    " + rect.height);

    return cc.Layer();
};

TestViewScene.testEliteChapterLayer = function(){
    var json = '{"chapterDic":{"chapterID":1874,"chapterType":1,"name":"黄巾之乱","chapterIndex":5,"isOpen":false,"leftChallengeNum":5,"stageGroupInfoArray":[{"stageGroupID":1,"isPass":false,"commandLevel":32,"name":"黄天之怒_0","pos":{"x":300,"y":50},"rewardItemArray":[],"stageArray":[{"stageID":5,"actIndex":0,"name":"教堂血战","defficult":0,"needHP":20,"rewardStarNum":1},{"stageID":6,"actIndex":1,"name":"教堂血战_1","defficult":1,"needHP":40,"rewardStarNum":0},{"stageID":7,"actIndex":2,"name":"教堂血战_2","defficult":2,"needHP":60,"rewardStarNum":0}]},{"stageGroupID":1,"isPass":false,"commandLevel":32,"name":"黄天之怒_1","pos":{"x":300,"y":150},"rewardItemArray":[],"stageArray":[{"stageID":5},{"stageID":5},{"stageID":5}]},{"stageGroupID":1,"isPass":false,"commandLevel":32,"name":"黄天之怒_2","pos":{"x":300,"y":250},"rewardItemArray":[],"stageArray":[{"stageID":5},{"stageID":5},{"stageID":5}]}]},"type":13002,"tag":1001}';
    json = eval("("+ json +")");
    var chapterInfo = new ChapterInfo();
    chapterInfo.initFromJson(json["chapterDic"]);
    var layer = new EliteChapterLayer(chapterInfo);
    MainController.pushLayerToRunningScene(layer);
};

TestViewScene.testMainChapterLayer = function(){
    var jsonData = {"tag":10001,"type":10004,"mainChapter":{"1":{"stars":0,"chapterType":0,"name":"黄巾之乱","isOpen":true,"stageArray":[{"rewardItemArray":[{"itemId":100033,"name":"透明胶带","rank":5,"num":1,"icon":36,"desc":"进阶角色材料"},{"itemId":100034,"name":"百变骰子","rank":3,"num":1,"icon":37,"desc":"进阶角色材料"},{"itemId":100035,"name":"穿雨弹","rank":4,"num":1,"icon":38,"desc":"进阶角色材料"},{"itemId":100036,"name":"保命符","rank":0,"num":1,"icon":39,"desc":"进阶角色材料"},{"itemId":100037,"name":"龙头椅","rank":1,"num":1,"icon":40,"desc":"进阶角色材料"},{"itemId":100038,"name":"拳击沙包","rank":1,"num":1,"icon":41,"desc":"进阶角色材料"},{"itemId":100039,"name":"高希雪茄","rank":2,"num":1,"icon":42,"desc":"进阶角色材料"},{"itemId":100040,"name":"幸运彩球","rank":5,"num":1,"icon":43,"desc":"进阶角色材料"},{"itemId":100041,"name":"万能觉醒卡","rank":3,"num":1,"icon":44,"desc":"除了相同的卡牌以外，通用的觉醒材料"},{"itemId":100040,"name":"幸运彩球","rank":5,"num":1,"icon":43,"desc":"进阶角色材料"},{"itemId":100041,"name":"万能觉醒卡","rank":3,"num":1,"icon":44,"desc":"除了相同的卡牌以外，通用的觉醒材料"}],"chapterType":0,"isOpen":true,"stageID":10101,"commandLevel":1,"maxStar":3,"star":0,"imageID":-1,"isPass":false,"name":"黄巾之乱1"},{"rewardItemArray":[{"itemId":100033,"name":"透明胶带","rank":5,"num":1,"icon":36,"desc":"进阶角色材料"},{"itemId":100034,"name":"百变骰子","rank":3,"num":1,"icon":37,"desc":"进阶角色材料"},{"itemId":100035,"name":"穿雨弹","rank":4,"num":1,"icon":38,"desc":"进阶角色材料"},{"itemId":100036,"name":"保命符","rank":0,"num":1,"icon":39,"desc":"进阶角色材料"},{"itemId":100037,"name":"龙头椅","rank":1,"num":1,"icon":40,"desc":"进阶角色材料"},{"itemId":100038,"name":"拳击沙包","rank":1,"num":1,"icon":41,"desc":"进阶角色材料"},{"itemId":100039,"name":"高希雪茄","rank":2,"num":1,"icon":42,"desc":"进阶角色材料"},{"itemId":100040,"name":"幸运彩球","rank":5,"num":1,"icon":43,"desc":"进阶角色材料"},{"itemId":100041,"name":"万能觉醒卡","rank":3,"num":1,"icon":44,"desc":"除了相同的卡牌以外，通用的觉醒材料"},{"itemId":100040,"name":"幸运彩球","rank":5,"num":1,"icon":43,"desc":"进阶角色材料"},{"itemId":100041,"name":"万能觉醒卡","rank":3,"num":1,"icon":44,"desc":"除了相同的卡牌以外，通用的觉醒材料"}],"chapterType":0,"isOpen":false,"stageID":10102,"commandLevel":2,"maxStar":3,"star":0,"imageID":-1,"isPass":false,"name":"黄巾之乱2"},{"rewardItemArray":[{"itemId":100033,"name":"透明胶带","rank":5,"num":1,"icon":36,"desc":"进阶角色材料"},{"itemId":100034,"name":"百变骰子","rank":3,"num":1,"icon":37,"desc":"进阶角色材料"},{"itemId":100035,"name":"穿雨弹","rank":4,"num":1,"icon":38,"desc":"进阶角色材料"},{"itemId":100036,"name":"保命符","rank":0,"num":1,"icon":39,"desc":"进阶角色材料"},{"itemId":100037,"name":"龙头椅","rank":1,"num":1,"icon":40,"desc":"进阶角色材料"},{"itemId":100038,"name":"拳击沙包","rank":1,"num":1,"icon":41,"desc":"进阶角色材料"},{"itemId":100039,"name":"高希雪茄","rank":2,"num":1,"icon":42,"desc":"进阶角色材料"},{"itemId":100040,"name":"幸运彩球","rank":5,"num":1,"icon":43,"desc":"进阶角色材料"},{"itemId":100041,"name":"万能觉醒卡","rank":3,"num":1,"icon":44,"desc":"除了相同的卡牌以外，通用的觉醒材料"},{"itemId":100040,"name":"幸运彩球","rank":5,"num":1,"icon":43,"desc":"进阶角色材料"},{"itemId":100041,"name":"万能觉醒卡","rank":3,"num":1,"icon":44,"desc":"除了相同的卡牌以外，通用的觉醒材料"}],"chapterType":0,"isOpen":false,"stageID":10103,"commandLevel":3,"maxStar":3,"star":0,"imageID":-1,"isPass":false,"name":"黄巾之乱3"},{"rewardItemArray":[{"itemId":100033,"name":"透明胶带","rank":5,"num":1,"icon":36,"desc":"进阶角色材料"},{"itemId":100034,"name":"百变骰子","rank":3,"num":1,"icon":37,"desc":"进阶角色材料"},{"itemId":100035,"name":"穿雨弹","rank":4,"num":1,"icon":38,"desc":"进阶角色材料"},{"itemId":100036,"name":"保命符","rank":0,"num":1,"icon":39,"desc":"进阶角色材料"},{"itemId":100037,"name":"龙头椅","rank":1,"num":1,"icon":40,"desc":"进阶角色材料"},{"itemId":100038,"name":"拳击沙包","rank":1,"num":1,"icon":41,"desc":"进阶角色材料"},{"itemId":100039,"name":"高希雪茄","rank":2,"num":1,"icon":42,"desc":"进阶角色材料"},{"itemId":100040,"name":"幸运彩球","rank":5,"num":1,"icon":43,"desc":"进阶角色材料"},{"itemId":100041,"name":"万能觉醒卡","rank":3,"num":1,"icon":44,"desc":"除了相同的卡牌以外，通用的觉醒材料"},{"itemId":100040,"name":"幸运彩球","rank":5,"num":1,"icon":43,"desc":"进阶角色材料"},{"itemId":100041,"name":"万能觉醒卡","rank":3,"num":1,"icon":44,"desc":"除了相同的卡牌以外，通用的觉醒材料"}],"chapterType":0,"isOpen":false,"stageID":10104,"commandLevel":4,"maxStar":3,"star":0,"imageID":-1,"isPass":false,"name":"黄巾之乱4"},{"rewardItemArray":[{"itemId":100033,"name":"透明胶带","rank":5,"num":1,"icon":36,"desc":"进阶角色材料"},{"itemId":100034,"name":"百变骰子","rank":3,"num":1,"icon":37,"desc":"进阶角色材料"},{"itemId":100035,"name":"穿雨弹","rank":4,"num":1,"icon":38,"desc":"进阶角色材料"},{"itemId":100036,"name":"保命符","rank":0,"num":1,"icon":39,"desc":"进阶角色材料"},{"itemId":100037,"name":"龙头椅","rank":1,"num":1,"icon":40,"desc":"进阶角色材料"},{"itemId":100038,"name":"拳击沙包","rank":1,"num":1,"icon":41,"desc":"进阶角色材料"},{"itemId":100039,"name":"高希雪茄","rank":2,"num":1,"icon":42,"desc":"进阶角色材料"},{"itemId":100040,"name":"幸运彩球","rank":5,"num":1,"icon":43,"desc":"进阶角色材料"},{"itemId":100041,"name":"万能觉醒卡","rank":3,"num":1,"icon":44,"desc":"除了相同的卡牌以外，通用的觉醒材料"},{"itemId":100040,"name":"幸运彩球","rank":5,"num":1,"icon":43,"desc":"进阶角色材料"},{"itemId":100041,"name":"万能觉醒卡","rank":3,"num":1,"icon":44,"desc":"除了相同的卡牌以外，通用的觉醒材料"}],"chapterType":0,"isOpen":false,"stageID":10105,"commandLevel":5,"maxStar":3,"star":0,"imageID":-1,"isPass":false,"name":"黄巾之乱5"},{"rewardItemArray":[{"itemId":100033,"name":"透明胶带","rank":5,"num":1,"icon":36,"desc":"进阶角色材料"},{"itemId":100034,"name":"百变骰子","rank":3,"num":1,"icon":37,"desc":"进阶角色材料"},{"itemId":100035,"name":"穿雨弹","rank":4,"num":1,"icon":38,"desc":"进阶角色材料"},{"itemId":100036,"name":"保命符","rank":0,"num":1,"icon":39,"desc":"进阶角色材料"},{"itemId":100037,"name":"龙头椅","rank":1,"num":1,"icon":40,"desc":"进阶角色材料"},{"itemId":100038,"name":"拳击沙包","rank":1,"num":1,"icon":41,"desc":"进阶角色材料"},{"itemId":100039,"name":"高希雪茄","rank":2,"num":1,"icon":42,"desc":"进阶角色材料"},{"itemId":100040,"name":"幸运彩球","rank":5,"num":1,"icon":43,"desc":"进阶角色材料"},{"itemId":100041,"name":"万能觉醒卡","rank":3,"num":1,"icon":44,"desc":"除了相同的卡牌以外，通用的觉醒材料"},{"itemId":100040,"name":"幸运彩球","rank":5,"num":1,"icon":43,"desc":"进阶角色材料"},{"itemId":100041,"name":"万能觉醒卡","rank":3,"num":1,"icon":44,"desc":"除了相同的卡牌以外，通用的觉醒材料"}],"chapterType":0,"isOpen":false,"stageID":10106,"commandLevel":6,"maxStar":3,"star":0,"imageID":-1,"isPass":false,"name":"黄巾之乱6"},{"rewardItemArray":[{"itemId":100033,"name":"透明胶带","rank":5,"num":1,"icon":36,"desc":"进阶角色材料"},{"itemId":100034,"name":"百变骰子","rank":3,"num":1,"icon":37,"desc":"进阶角色材料"},{"itemId":100035,"name":"穿雨弹","rank":4,"num":1,"icon":38,"desc":"进阶角色材料"},{"itemId":100036,"name":"保命符","rank":0,"num":1,"icon":39,"desc":"进阶角色材料"},{"itemId":100037,"name":"龙头椅","rank":1,"num":1,"icon":40,"desc":"进阶角色材料"},{"itemId":100038,"name":"拳击沙包","rank":1,"num":1,"icon":41,"desc":"进阶角色材料"},{"itemId":100039,"name":"高希雪茄","rank":2,"num":1,"icon":42,"desc":"进阶角色材料"},{"itemId":100040,"name":"幸运彩球","rank":5,"num":1,"icon":43,"desc":"进阶角色材料"},{"itemId":100041,"name":"万能觉醒卡","rank":3,"num":1,"icon":44,"desc":"除了相同的卡牌以外，通用的觉醒材料"},{"itemId":100040,"name":"幸运彩球","rank":5,"num":1,"icon":43,"desc":"进阶角色材料"},{"itemId":100041,"name":"万能觉醒卡","rank":3,"num":1,"icon":44,"desc":"除了相同的卡牌以外，通用的觉醒材料"}],"chapterType":0,"isOpen":false,"stageID":10107,"commandLevel":7,"maxStar":3,"star":0,"imageID":-1,"isPass":false,"name":"黄巾之乱7"},{"rewardItemArray":[{"itemId":100033,"name":"透明胶带","rank":5,"num":1,"icon":36,"desc":"进阶角色材料"},{"itemId":100034,"name":"百变骰子","rank":3,"num":1,"icon":37,"desc":"进阶角色材料"},{"itemId":100035,"name":"穿雨弹","rank":4,"num":1,"icon":38,"desc":"进阶角色材料"},{"itemId":100036,"name":"保命符","rank":0,"num":1,"icon":39,"desc":"进阶角色材料"},{"itemId":100037,"name":"龙头椅","rank":1,"num":1,"icon":40,"desc":"进阶角色材料"},{"itemId":100038,"name":"拳击沙包","rank":1,"num":1,"icon":41,"desc":"进阶角色材料"},{"itemId":100039,"name":"高希雪茄","rank":2,"num":1,"icon":42,"desc":"进阶角色材料"},{"itemId":100040,"name":"幸运彩球","rank":5,"num":1,"icon":43,"desc":"进阶角色材料"},{"itemId":100041,"name":"万能觉醒卡","rank":3,"num":1,"icon":44,"desc":"除了相同的卡牌以外，通用的觉醒材料"},{"itemId":100040,"name":"幸运彩球","rank":5,"num":1,"icon":43,"desc":"进阶角色材料"},{"itemId":100041,"name":"万能觉醒卡","rank":3,"num":1,"icon":44,"desc":"除了相同的卡牌以外，通用的觉醒材料"}],"chapterType":0,"isOpen":false,"stageID":10108,"commandLevel":8,"maxStar":3,"star":0,"imageID":-1,"isPass":false,"name":"黄巾之乱8"},{"rewardItemArray":[{"itemId":100033,"name":"透明胶带","rank":5,"num":1,"icon":36,"desc":"进阶角色材料"},{"itemId":100034,"name":"百变骰子","rank":3,"num":1,"icon":37,"desc":"进阶角色材料"},{"itemId":100035,"name":"穿雨弹","rank":4,"num":1,"icon":38,"desc":"进阶角色材料"},{"itemId":100036,"name":"保命符","rank":0,"num":1,"icon":39,"desc":"进阶角色材料"},{"itemId":100037,"name":"龙头椅","rank":1,"num":1,"icon":40,"desc":"进阶角色材料"},{"itemId":100038,"name":"拳击沙包","rank":1,"num":1,"icon":41,"desc":"进阶角色材料"},{"itemId":100039,"name":"高希雪茄","rank":2,"num":1,"icon":42,"desc":"进阶角色材料"},{"itemId":100040,"name":"幸运彩球","rank":5,"num":1,"icon":43,"desc":"进阶角色材料"},{"itemId":100041,"name":"万能觉醒卡","rank":3,"num":1,"icon":44,"desc":"除了相同的卡牌以外，通用的觉醒材料"},{"itemId":100040,"name":"幸运彩球","rank":5,"num":1,"icon":43,"desc":"进阶角色材料"},{"itemId":100041,"name":"万能觉醒卡","rank":3,"num":1,"icon":44,"desc":"除了相同的卡牌以外，通用的觉醒材料"}],"chapterType":0,"isOpen":false,"stageID":10109,"commandLevel":9,"maxStar":3,"star":0,"imageID":-1,"isPass":false,"name":"黄巾之乱9"},{"rewardItemArray":[{"itemId":100033,"name":"透明胶带","rank":5,"num":1,"icon":36,"desc":"进阶角色材料"},{"itemId":100034,"name":"百变骰子","rank":3,"num":1,"icon":37,"desc":"进阶角色材料"},{"itemId":100035,"name":"穿雨弹","rank":4,"num":1,"icon":38,"desc":"进阶角色材料"},{"itemId":100036,"name":"保命符","rank":0,"num":1,"icon":39,"desc":"进阶角色材料"},{"itemId":100037,"name":"龙头椅","rank":1,"num":1,"icon":40,"desc":"进阶角色材料"},{"itemId":100038,"name":"拳击沙包","rank":1,"num":1,"icon":41,"desc":"进阶角色材料"},{"itemId":100039,"name":"高希雪茄","rank":2,"num":1,"icon":42,"desc":"进阶角色材料"},{"itemId":100040,"name":"幸运彩球","rank":5,"num":1,"icon":43,"desc":"进阶角色材料"},{"itemId":100041,"name":"万能觉醒卡","rank":3,"num":1,"icon":44,"desc":"除了相同的卡牌以外，通用的觉醒材料"},{"itemId":100040,"name":"幸运彩球","rank":5,"num":1,"icon":43,"desc":"进阶角色材料"},{"itemId":100041,"name":"万能觉醒卡","rank":3,"num":1,"icon":44,"desc":"除了相同的卡牌以外，通用的觉醒材料"}],"chapterType":0,"isOpen":false,"stageID":10110,"commandLevel":10,"maxStar":3,"star":0,"imageID":-1,"isPass":false,"name":"黄巾之乱10"}],"chapterID":1,"chapterRewards":[{"status":0,"chapterRewardId":1,"rewardId":1,"items":[{"desc":"购买系统专属道具和武将","num":10,"name":"四九勋章","icon":5},{"desc":"购买系统专属道具和武将","num":10,"name":"古惑勋章","icon":6},{"desc":"购买系统专属道具和武将","num":10,"name":"古惑勋章","icon":6}],"stars":3,"rewardIconID":1},{"status":0,"chapterRewardId":2,"rewardId":2,"items":[{"desc":"购买系统专属道具和武将","num":10,"name":"四九勋章","icon":5},{"desc":"购买系统专属道具和武将","num":10,"name":"古惑勋章","icon":6},{"desc":"购买系统专属道具和武将","num":10,"name":"古惑勋章","icon":6}],"stars":5,"rewardIconID":2}],"maxStar":30,"chapterIndex":0},"2":{"chapterID":2,"name":"桃园结义","isOpen":false,"chapterIndex":1},"3":{"chapterID":3,"name":"赤壁之战","isOpen":false,"chapterIndex":2},"4":{"chapterID":4,"name":"官渡之战","isOpen":false,"chapterIndex":3},"5":{"chapterID":5,"name":"千里走单骑","isOpen":false,"chapterIndex":4},"6":{"chapterID":6,"name":"长坂坡","isOpen":false,"chapterIndex":5},"7":{"chapterID":7,"name":"落凤坡","isOpen":false,"chapterIndex":6},"8":{"chapterID":8,"name":"三顾茅庐","isOpen":false,"chapterIndex":7},"9":{"chapterID":9,"name":"七擒孟获","isOpen":false,"chapterIndex":8},"10":{"chapterID":10,"name":"空城计","isOpen":false,"chapterIndex":9}}};
    var layer = new ChapterMapLayer(jsonData["mainChapter"], PAGE_TYPE_MAINLINE);
    MainController.pushLayerToRunningScene(layer);
};

TestViewScene.testTipLayer = function(){
//    var contentLayer = new cc.Layer();
//    contentLayer.setContentSize(cc.size(400, 300));
//    UICommon.addBackgroundLayer(contentLayer);
//    var layer = new BaseTipLayer(contentLayer);
//    return layer;
};

TestViewScene.testEmbattle = function() {
    return new EmbattleLayer();

    var button = new ccui.Button();
    button.loadTextureNormal("icon_item_10001.png", ccui.Widget.PLIST_TEXTURE);
    button.setScale9Enabled(true);
    this.addChild(button);
    button.setPosition(cc.pCenter(cc.winSize));

    var label = new cc.LabelTTF("HYk1gj字体", FONT_HYK1GJ, 40);
    label.setPosition(cc.p(300, 300));
    this.addChild(label);

    var label = new cc.LabelTTF("AdobeHeitiStd字体", "AdobeHeitiStd.ttf", 40);
    label.setPosition(cc.p(300, 400));
    this.addChild(label);
};

TestViewScene.testSurvialSystem = function(){

    var jsonStr        = {"tag":1,"gotReward":{"currencyReward":{"6":111,"30":222},"gotItems":[{"itemInfo":{"itemId":200003,"name":"体力","rank":1,"num":1,"icon":1,"type":4,"desc":"获得后自动使用增加体力"}}]},"stages":[{"index":1,"stageType":0,"posX":200,"stageId":1,"posY":400,"enemy":{"level":0,"officers":[{"officerInfo":{"needNum":200,"star":5,"name":"怪物1","element":0,"officerId":110223,"icon":16005,"desc":"均衡型的武将，主要依靠特技进行输出，特技可恢复怒气，从而使特技施放更加频繁"},"hp":50,"restHp":1}],"name":"命运的宿敌小笼包君！"},"rewards":{"items":[{"itemId":100033,"name":"透明胶带","rank":5,"num":1,"icon":36,"desc":"进阶角色材料"},{"itemId":100034,"name":"百变骰子","rank":3,"num":1,"icon":37,"desc":"进阶角色材料"},{"itemId":100035,"name":"穿雨弹","rank":4,"num":1,"icon":38,"desc":"进阶角色材料"},{"itemId":100036,"name":"保命符","rank":0,"num":1,"icon":39,"desc":"进阶角色材料"},{"itemId":100037,"name":"龙头椅","rank":1,"num":1,"icon":40,"desc":"进阶角色材料"},{"itemId":100038,"name":"拳击沙包","rank":1,"num":1,"icon":41,"desc":"进阶角色材料"},{"itemId":100039,"name":"高希雪茄","rank":2,"num":1,"icon":42,"desc":"进阶角色材料"},{"itemId":100040,"name":"幸运彩球","rank":5,"num":1,"icon":43,"desc":"进阶角色材料"},{"itemId":100041,"name":"万能觉醒卡","rank":3,"num":1,"icon":44,"desc":"除了相同的卡牌以外，通用的觉醒材料"},{"itemId":100040,"name":"幸运彩球","rank":5,"num":1,"icon":43,"desc":"进阶角色材料"},{"itemId":100041,"name":"万能觉醒卡","rank":3,"num":1,"icon":44,"desc":"除了相同的卡牌以外，通用的觉醒材料"}],"currencyReward":{"3":100,"6":1022,"10":50}},"isPass":false,"icon":1}],"type":20034,"resetNum":10000};
    var rewardCurrency = jsonStr["gotReward"]["currencyReward"];
    var resetNum       = jsonStr["resetNum"];
    var temp           = jsonStr["gotReward"]["gotItems"];
    var rewardItems    = [];
    BPCommon.arrayForEach(temp, function(data){
        var item = new BPItem();
        item.initFromJson(data);
        rewardItems.push(item);
    });

    temp               = jsonStr["stages"];
    var survivalStages  = [];
    BPCommon.arrayForEach(temp, function(data){
        var info = new SurvivalStageInfo();
        info.initFromJson(data);
        survivalStages.push(info);
    });

    return new SurvivalMainLayer(survivalStages, rewardItems, rewardCurrency, resetNum);
};

TestViewScene.testTowerOfBabelLayer = function(){

//    cc.log("服务器列表");
//    var request = RequestGameServerList.createWithoutParam();
//    MainController.getInstance().sendAndWaitRequest(request, function(resp) {
//        if (resp == null || resp.getType() != RESPONSE_GAME_SERVER_LIST) {
//            cc.log("resp == null");
//            return;
//        }
//
//        var jsonData = resp.getJsonData();
//        cc.log("----respData: " + JSON.stringify(jsonData));
//    }, true);
//    return;


    // 滚动条 动画序列滚到指定的百分比
    var bgWidth = 800;
    var bgHeight = 500;
    var array = [];
    var size = cc.size(500, 300);
    var colorArray = new Array(cc.RED, cc.GREEN, cc.BLUE, cc.YELLOW, cc.RED, cc.GREEN, cc.BLUE, cc.YELLOW, cc.BLUE, cc.YELLOW);
    for(var i = 0; i < colorArray.length; i++)
    {
        var color = colorArray[i];
        var layerColor = UICommon.createLayerColor(size, color, 255);
        var label = UICommon.createLabelWithBorder("第 " + i, 30, cc.color(255, 255, 255), cc.color(0, 0, 0), 4);
        layerColor.addChild(label);
        label.setPosition(centerInner(layerColor));
        array.push(layerColor);
    }
    var contentPanel = UICommon.createPanelAlignWidgetsWithPadding(0, cc.UI_ALIGNMENT_VERTICAL_LEFT, array);
//    var scrollView = UICommon.createScrollViewWithContentPanel(contentPanel, cc.size(bgWidth, bgHeight));
    var scrollView = UICommon.createCCScrollViewWithContentPanel(contentPanel, cc.size(bgWidth, bgHeight));
    UICommon.addBackgroundLayer(scrollView, cc.GREEN, 222);

    var contentSize = scrollView.getContentSize();
    var container = scrollView.getContainer();

    var pos = scrollView.getContentOffset();
    cc.log("---1111 pos == " + pos.x + " " + pos.y);
    var offset = scrollView.getViewSize().height - contentSize.height;
//    scrollView.setContentOffsetInDuration(cc.p(pos.x, offset), 0);
    cc.log("---2222 offset == " + offset);
    scrollView.setContentOffset(cc.p(pos.x, offset));
    pos = scrollView.getContentOffset();
    cc.log("---2222 pos == " + pos.x + " " + pos.y);

    var len = container.getChildren().length;
    var actionArray = [];
    var delayTime = 1;
    for(var i = 0; i < len; i++)
    {
        cc.log(cc.formatStr("========== [%d] ==========", i));
        var view = container.getChildren()[i];
        var posY = scrollView.getViewSize().height - (view.getPosition().y + view.getContentSize().height);
        cc.log(cc.formatStr("-----11 y = ", view.getPosition().y));
        cc.log(cc.formatStr("-----11 height = ", view.getContentSize().height));
        cc.log(cc.formatStr("-----11 posY = ", posY));

        if(posY > 0)
        {
            posY = 0;
        }

        var offset = cc.p(pos.x, posY);
        cc.log("---xxxxx  offset == " + offset.x + " " + offset.y);

        actionArray.push(cc.delayTime(delayTime));
        actionArray.push(cc.callFunc(function(){
            this.scrollView.setContentOffsetInDuration(this.offset, 0.2);
        }.bind({"offset":offset, "scrollView":scrollView})));

        if(posY == 0)
        {
            break;
        }
    }

//    actionArray.push(cc.delayTime(delayTime));
//    actionArray.push(cc.callFunc(function(){
//        this.scrollView.setContentOffsetInDuration(-500, 0.5);
//    }.bind({"delayTime":delayTime, "scrollView":scrollView})));
//
//    actionArray.push(cc.delayTime(delayTime));
//    actionArray.push(cc.callFunc(function(){
//        this.scrollView.setContentOffsetInDuration(-400, 0.5);
//    }.bind({"delayTime":delayTime, "scrollView":scrollView})));
//
//    actionArray.push(cc.delayTime(delayTime));
//    actionArray.push(cc.callFunc(function(){
//        this.scrollView.setContentOffsetInDuration(-300, 0.5);
//    }.bind({"delayTime":delayTime, "scrollView":scrollView})));

//    actionArray.push(cc.delayTime(delayTime));
//    actionArray.push(cc.callFunc(function(){
//        this.scrollView.setContentOffsetInDuration(-200, 0.5);
//    }.bind({"delayTime":delayTime, "scrollView":scrollView})));
//
//    actionArray.push(cc.delayTime(delayTime));
//    actionArray.push(cc.callFunc(function(){
//        this.scrollView.setContentOffsetInDuration(-100, 0.5);
//    }.bind({"delayTime":delayTime, "scrollView":scrollView})));
//
//    actionArray.push(cc.delayTime(delayTime));
//    actionArray.push(cc.callFunc(function(){
//        this.scrollView.setContentOffsetInDuration(100, 0.5);
//    }.bind({"delayTime":delayTime, "scrollView":scrollView})));

    cc.log("------ actionArray.length ", actionArray.length);
    scrollView.runAction(cc.sequence(actionArray));

//    contentPanel.setAnchorPoint(cc.p(0, 0));
//    contentPanel.ignoreAnchorPointForPosition(true);

//    var pos = contentPanel.getPosition();
//    cc.log("---1111 pos == " + pos.x + " " + pos.y);
//    pos = scrollView.getAnchorPoint();
//    cc.log("---1111 getAnchorPoint == " + pos.x + " " + pos.y);
//
//    var isbool = scrollView.isIgnoreAnchorPointForPosition();
//    cc.log("------ isbool == " + isbool);
//
//    pos = scrollView.getContentOffset();
//    cc.log("---1111 _innerContainerPos == " + pos.x + " " + pos.y);
//
//    pos = scrollView.getInnerContainer().getPosition();
//    cc.log("---1111 _innerContainerPos == " + pos.x + " " + pos.y);
////    scrollView.scrollToPercentVertical(100, 2, false);
////    var actionArray = [];
////    actionArray.push(cc.delayTime(1));
////    actionArray.push(cc.callFunc(function(){
//////        this.scrollView.scrollToPercentVertical(this.percent, this.time, false);
////        this.scrollView.jumpToPercentVertical(100);
////    }.bind({"percent":percent, "time":time, "scrollView":scrollView})));
//    scrollView.jumpToPercentVertical(10);
//    pos = scrollView.getInnerContainer().getPosition();
//    cc.log("---2222 _innerContainerPos == " + pos.x + " " + pos.y);

    /*
    var maxHeight = scrollView._getInnerHeight();
    var time = 0.1;
    cc.log("-----333 maxHeight = ", maxHeight);
    var len = contentPanel.getChildren().length;
//    var posYArray = [len];
    var actionArray = [];
    var delayTime = 2.5;
    for(var i = 0; i < len; i++)
    {
        var view = contentPanel.getChildren()[i];
        var posY = view.getPosition().y + view.getContentSize().height;
//        cc.log(cc.formatStr("-----11 yy height posY[%d] = ", i, view.getPosition().y, view.getContentSize().height, posY));
        var percent = (maxHeight - posY) / bgHeight * 100;

        if(percent == 0)
        {
            continue;
        }

        cc.log("------111 percent ", percent);

        actionArray.push(cc.delayTime(delayTime));
        actionArray.push(cc.callFunc(function(){
            this.scrollView.scrollToPercentVertical(this.percent, this.time, false);
        }.bind({"percent":percent, "time":time, "scrollView":scrollView})));

        if(percent >= 100)
        {
           break;
        }
    }

    cc.log("------ actionArray.length ", actionArray.length);
    scrollView.runAction(cc.sequence(actionArray));
    */

    var layer = UICommon.createLayerColor(cc.winSize, cc.color(125, 125, 125), 255);
    layer.addChild(scrollView);
    scrollView.setPosition(cc.p(100, 100));

//    var layer = new TowerOfBabelLayer(null);
    return layer;
};

TestViewScene.testPlayerInfoLayer = function(){
//    var layer = cc.BuilderReader.load("ccbi/JadeEnhance", this, cc.winSize, "ccbi");
    var layer = new PlayerInfoLayer(null);
//    var layer = new OfficerAdvancedSuccessLayer(null);
    return layer;
};

TestViewScene.testCombineAdvancedEquipmentLayer = function(){
    var layer = new RoleSelectLayer(null);
//    var layer = new CombineAdvancedEquipmentLayer(null, null, null);
    return layer;
};

TestViewScene.testSignInLayer = function(){
    var layer = new SignInLayer(null);
    return layer;
};

TestViewScene.testActivityLayer = function(){
    var layer = new ActivityLayer(null);
    return layer;
};

TestViewScene.testLoginRewardLayer = function(){
    var layer = new LoginRewardLayer(null);
    return layer;
};

TestViewScene.testChatLayer = function(){

    var info = null;
    for(var i = 0; i < 20; i++)
    {
        info = new ChatMessageInfo();
        info._name = cc.formatStr("%d名字", i);

        if(i == 0)
        {
            info._name = cc.formatStr("%d名字名字名", i);
        }

        if(i == 1)
        {
            info._name = cc.formatStr("%d名字名字", i);
        }

        if(i == 2)
        {
            info._name = cc.formatStr("%d名名字", i);
        }

        info._level = 10 + i;
        info._headIcon = 1001 + i;
//        info._channel = i % 4;
        info._channel = 1;
        info._time = cc.formatStr("- 11:%d", i);
        info._fromPid = i;
        info._msg = cc.formatStr("%d聊天信息聊天信息聊天信息聊天信息本次活动迎来了上百位业界嘉宾和开发者们的参与和互动，现场交流气氛热烈。", i);
        MainController.currentGameData().pushNewChatMsg(info);
    }

    // 私聊对象名单
//    for(var i = 0; i < 1; i++)
//    {
//        info = new ChatPlayerInfo();
//        info._name = cc.formatStr("%d私聊名字", i);
//
//        if(i == 0)
//        {
//            info._name = cc.formatStr("%d私名字名字名", i);
//        }
//
//        if(i == 1)
//        {
//            info._name = cc.formatStr("%d私名字名字", i);
//        }
//
//        if(i == 2)
//        {
//            info._name = cc.formatStr("%d私名名字", i);
//        }
//
//        info._level = 10 + i;
//        info._headIcon = 1001 + i;
//        info._pid = i;
//        MainController.currentGameData().addChatPrivateTarget(info);
//    }

    cc.log("--- _chatPrivateTargetArray.length", MainController.currentGameData()._chatPrivateTargetArray.length);

    var layer = new ChatLayer(CHAT_CHANNEL_WORLD);
    return layer;
};

TestViewScene.testLeaderUpgrade=function(){

    return new PlayerLevelUpLayer({
        "uid": 1850000,
        "level": [
            60,
            61
        ],
        "system": 3,
        "exp": [
            0,
            0.4166666666666667
        ],
        "maxHp": [
            200,
            200
        ],
        "isLeader": true,
        "icon": 1004
    });
};

TestViewScene.testBattleWin=function(){
    loadTestGame();
    return new BattleWinLayer({"rewardPlayerExp": 25,"stages": [{"star": 2,"isPass": true,"stageID": 10101},{"stageID": 10102,"isOpen": true}],"rewardOfficerExp": 25,"rewardItemInfo": [{"stack": 99,"gemsBuy": 9999999999,"desc": "进阶角色材料","moneyBuy": 99999999999,"rank": 2,"type": 7,"num": 10,"pageType": 2,"moneySell": 1000,"icon": 30026,"name": "木头人","itemId": 100024},{"stack": 99,"gemsBuy": 9999999999,"desc": "进阶角色材料","moneyBuy": 99999999999,"rank": 1,"type": 7,"num": 10,"pageType": 2,"moneySell": 1000,"icon": 30026,"name": "飞机","itemId": 100024},{"stack": 99,"gemsBuy": 9999999999,"desc": "进阶角色材料","moneyBuy": 99999999999,"rank": 2,"type": 7,"num": 10,"pageType": 2,"moneySell": 100,"icon": 30024,"name": "自愈绷带","itemId": 100022},{"stack": 99,"gemsBuy": 9999999999,"desc": "进阶角色材料","moneyBuy": 99999999999,"rank": 4,"type": 7,"num": 10,"pageType": 2,"moneySell": 1000,"icon": 30026,"name": "命运钟表","itemId": 100024}],"levelUp": [{"exp": [0,1],"icon": 1002,"level": [0,0],"isLeader": false,"uid": 690210004},{"system": 3,"uid": 160310004,"isLeader": false,"level": [60,61],"exp": [0,0.4166666666666667],"maxHp": [200,200],"icon": 1005},{"exp": [0,0.8333333333333334],"icon": 1004,"level": [0,0],"isLeader": false,"uid": 71610004},{"exp": [0,0.8333333333333334],"icon": 1004,"level": [0,0],"isLeader": false,"uid": 646900004}],"isWin": true,"tag": 6,"chapters": [{"chapterID": 1,"stars": 2,"chapterRewards": [{"status": 0,"rewardId": 3}]}],"rewardMoney": 1000,"type": 20045},3);
};
TestViewScene.testBattleLose=function(){
    return new BattleLoseLayer();
};

TestViewScene.testStageSelectLayer = function(){
    var layer = new StageSelectLayer(null);
    return layer;
};

TestViewScene.testRaidLayer = function(){

//    var layer = new FlashAnimationLayer(null, function() {
//        var layer = new RaidLayer(null);
//        MainController.pushLayerToRunningScene(layer);
//    });

    var layer = new RaidLayer(null);
    return layer;
};

TestViewScene.vipEnlistLayer = function(){

//    var layer = new FlashAnimationLayer(null, function() {
//        var layer = new RaidLayer(null);
//        MainController.pushLayerToRunningScene(layer);
//    });

    // 武将
//    var jsonData = {"ownItemArray":[{"gemsBuy":9999999999,"rank":3,"num":1010000,"pageType":0,"stack":999999999,"desc":"获得后自动使用增加金钱","itemId":200001,"moneySell":0,"moneyBuy":99999999999,"name":"金钱","icon":30049,"type":6},{"gemsBuy":9999999999,"rank":3,"num":104619,"pageType":0,"stack":999999999,"desc":"获得后自动使用增加钻石","itemId":200002,"moneySell":0,"moneyBuy":99999999999,"name":"钻石","icon":30050,"type":13}],"packetUpdateInfo":[{"leftFreeRandomOfficerNum":5,"name":"普通招募","freeInterval":0,"discountRate":90,"costItemArray":[{"gemsBuy":9999999999,"rank":3,"num":10000,"pageType":0,"stack":999999999,"desc":"获得后自动使用增加金钱","itemId":200001,"moneySell":0,"moneyBuy":99999999999,"name":"金钱","icon":30049,"type":6}],"totalFreeRandomOfficerNum":5,"packetId":0},{"leftFreeRandomOfficerNum":1,"name":"上级招募","freeInterval":600,"discountRate":90,"costItemArray":[{"gemsBuy":9999999999,"rank":3,"num":300,"pageType":0,"stack":999999999,"desc":"获得后自动使用增加钻石","itemId":200002,"moneySell":0,"moneyBuy":99999999999,"name":"钻石","icon":30050,"type":13}],"totalFreeRandomOfficerNum":1,"packetId":1}],"type":10021,"resultArray":[{"itemId":190004,"moneySell":0,"gemsBuy":9999999999,"moneyBuy":99999999999,"name":"主角碎片","rank":3,"isChangeToOfficerChip":false,"num":2,"pageType":2,"icon":1004,"type":35,"stack":9999,"desc":"主角碎片，集齐一定数量可招募或者升星主角"},{"itemId":600606,"moneySell":10,"gemsBuy":9999999999,"moneyBuy":99999999999,"name":"祈祷残卷","rank":1,"isChangeToOfficerChip":false,"num":2,"pageType":0,"icon":160506,"type":31,"stack":99,"extraDetailInfo":{"itemId":600606,"moneySell":10,"phyPenetrate":0,"phyDef":0,"name":"祈祷残卷","magAtk":0,"needLevel":0,"magDef":0,"hp":0,"phyAtk":0,"recover":0,"damageReduce":0,"rank":1,"magPenetrate":0,"icon":160506,"type":31,"desc":"进阶角色材料"},"desc":"进阶角色材料"},{"itemId":190001,"moneySell":0,"gemsBuy":9999999999,"moneyBuy":99999999999,"name":"刘备碎片","rank":3,"isChangeToOfficerChip":false,"num":2,"pageType":2,"icon":1001,"type":16,"stack":9999,"extraDetailInfo":{"officerId":20001,"name":"刘备","icon":1001},"desc":"刘备武将碎片，集齐一定数量可招募或者升星该武将"},{"itemId":190001,"moneySell":0,"gemsBuy":9999999999,"moneyBuy":99999999999,"name":"刘备碎片","rank":3,"isChangeToOfficerChip":true,"num":5,"pageType":2,"icon":1001,"type":16,"stack":9999,"extraDetailInfo":{"officerId":20001,"name":"刘备","icon":1001},"desc":"刘备武将碎片，集齐一定数量可招募或者升星该武将"},{"itemId":600304,"moneySell":10,"gemsBuy":9999999999,"moneyBuy":99999999999,"name":"珍藏魂魄","rank":3,"isChangeToOfficerChip":false,"num":2,"pageType":0,"icon":160504,"type":31,"stack":99,"extraDetailInfo":{"itemId":600304,"moneySell":10,"phyPenetrate":0,"phyDef":0,"name":"珍藏魂魄","magAtk":0,"needLevel":0,"magDef":0,"hp":0,"phyAtk":0,"recover":0,"damageReduce":0,"rank":3,"magPenetrate":0,"icon":160504,"type":31,"desc":"进阶角色材料"},"desc":"进阶角色材料"},{"itemId":299013,"moneySell":0,"gemsBuy":9999999999,"moneyBuy":99999999999,"name":"安培晴明","rank":3,"isChangeToOfficerChip":false,"num":0,"pageType":0,"icon":1014,"type":27,"stack":1,"extraDetailInfo":{"star":2,"name":"安培晴明","skills":{"superSkill":{"isInstant":true,"cost":40,"uid":2001301,"aniId":2,"damageType":1,"damageElement":0,"skillType":0,"name":"百鬼夜行","isExistChange":true,"effectFlag":0,"coolCD":2,"changeRank":3,"icon":50082,"startCD":1,"desc":"复活傀儡，若已有傀儡则对敌方全体单位造成伤害。"},"passiveSkillArray":[{"changeRank":0,"uid":2001307,"aniId":2,"damageType":1,"openRank":2,"damageElement":0,"skillType":2,"name":"傀儡守护","isExistChange":false,"isLocked":true,"effectFlag":0,"icon":50081,"desc":"战斗开始时召唤1个傀儡，若傀儡在第一排，敌方的普通攻击只能指定自己为目标。"},{"changeRank":0,"uid":2001308,"aniId":-1,"damageType":1,"openRank":0,"damageElement":0,"skillType":2,"name":"人鬼合一","isExistChange":false,"isLocked":false,"effectFlag":0,"icon":50080,"desc":"傀儡存在时，安培晴明与傀儡一起进行普通攻击，必中且必定造成<l c=D2770A>小浮空</l>，附带<l c=D2770A>中毒</l>。"}],"hitSkill":{"changeRank":0,"uid":2001305,"aniId":1,"damageType":1,"damageElement":0,"skillType":1,"name":"傀儡操控","isExistChange":false,"effectFlag":16,"icon":50021,"desc":"对敌方单体造成<l c=D2770A>中毒</l>。"},"chasSkillArray":[{"changeRank":0,"uid":2001309,"aniId":1,"damageType":1,"openRank":1,"damageElement":2,"skillType":3,"name":"式神追魂","comboFlag":4,"isLocked":true,"effectFlag":1,"isExistChange":false,"icon":50079,"desc":"追打<l c=D2770A>倒地</l>敌人，造成<l c=D2770A>小浮空</l>。"}]},"rank":3,"echo":"dia100.mp3","officerId":20013,"aniId":1014,"needChipNum":30,"elementType":0,"icon":1014},"desc":"安培晴明"},{"itemId":190015,"moneySell":0,"gemsBuy":9999999999,"moneyBuy":99999999999,"name":"铁扇公主碎片","rank":3,"isChangeToOfficerChip":false,"num":1,"pageType":2,"icon":1005,"type":27,"stack":9999,"extraDetailInfo":{"officerId":20014,"name":"铁扇公主","icon":1005},"desc":"铁扇公主武将碎片，集齐一定数量可招募或者升星该武将"},{"itemId":190007,"moneySell":0,"gemsBuy":9999999999,"moneyBuy":99999999999,"name":"孙悟空碎片","rank":3,"isChangeToOfficerChip":true,"num":25,"pageType":2,"icon":1008,"type":16,"stack":9999,"extraDetailInfo":{"officerId":20006,"name":"孙悟空","icon":1008},"desc":"孙悟空碎片，集齐一定数量可招募或者升星该武将"},{"itemId":600207,"moneySell":10,"gemsBuy":9999999999,"moneyBuy":99999999999,"name":"水晶项链","rank":2,"isChangeToOfficerChip":false,"num":2,"pageType":0,"icon":160507,"type":31,"stack":99,"extraDetailInfo":{"itemId":600207,"moneySell":10,"phyPenetrate":0,"phyDef":0,"name":"水晶项链","magAtk":0,"needLevel":0,"magDef":0,"hp":0,"phyAtk":0,"recover":0,"damageReduce":0,"rank":2,"magPenetrate":0,"icon":160507,"type":31,"desc":"进阶角色材料"},"desc":"进阶角色材料"},{"itemId":600714,"moneySell":10,"gemsBuy":9999999999,"moneyBuy":99999999999,"name":"信仰染料","rank":2,"isChangeToOfficerChip":false,"num":2,"pageType":0,"icon":160514,"type":32,"stack":99,"extraDetailInfo":{"itemId":600714,"moneySell":10,"phyPenetrate":0,"phyDef":0,"name":"信仰染料","magAtk":0,"needLevel":0,"magDef":0,"hp":0,"phyAtk":0,"recover":0,"damageReduce":0,"rank":2,"magPenetrate":0,"icon":160514,"type":32,"desc":"进阶角色材料碎片"},"desc":"进阶角色材料碎片"}],"tag":4};
    // 武将转碎片
    var jsonData = {"ownItemArray":[{"gemsBuy":9999999999,"rank":3,"num":1010000,"pageType":0,"stack":999999999,"desc":"获得后自动使用增加金钱","itemId":200001,"moneySell":0,"moneyBuy":99999999999,"name":"金钱","icon":30049,"type":6},{"gemsBuy":9999999999,"rank":3,"num":104619,"pageType":0,"stack":999999999,"desc":"获得后自动使用增加钻石","itemId":200002,"moneySell":0,"moneyBuy":99999999999,"name":"钻石","icon":30050,"type":13}],"packetUpdateInfo":[{"leftFreeRandomOfficerNum":5,"name":"普通招募","freeInterval":0,"discountRate":90,"costItemArray":[{"gemsBuy":9999999999,"rank":3,"num":10000,"pageType":0,"stack":999999999,"desc":"获得后自动使用增加金钱","itemId":200001,"moneySell":0,"moneyBuy":99999999999,"name":"金钱","icon":30049,"type":6}],"totalFreeRandomOfficerNum":5,"packetId":0},{"leftFreeRandomOfficerNum":1,"name":"上级招募","freeInterval":600,"discountRate":90,"costItemArray":[{"gemsBuy":9999999999,"rank":3,"num":300,"pageType":0,"stack":999999999,"desc":"获得后自动使用增加钻石","itemId":200002,"moneySell":0,"moneyBuy":99999999999,"name":"钻石","icon":30050,"type":13}],"totalFreeRandomOfficerNum":1,"packetId":1}],"type":10021,"resultArray":[{"itemId":190004,"moneySell":0,"gemsBuy":9999999999,"moneyBuy":99999999999,"name":"主角碎片","rank":3,"isChangeToOfficerChip":false,"num":2,"pageType":2,"icon":1004,"type":35,"stack":9999,"desc":"主角碎片，集齐一定数量可招募或者升星主角"},{"itemId":600606,"moneySell":10,"gemsBuy":9999999999,"moneyBuy":99999999999,"name":"祈祷残卷","rank":1,"isChangeToOfficerChip":false,"num":2,"pageType":0,"icon":160506,"type":31,"stack":99,"extraDetailInfo":{"itemId":600606,"moneySell":10,"phyPenetrate":0,"phyDef":0,"name":"祈祷残卷","magAtk":0,"needLevel":0,"magDef":0,"hp":0,"phyAtk":0,"recover":0,"damageReduce":0,"rank":1,"magPenetrate":0,"icon":160506,"type":31,"desc":"进阶角色材料"},"desc":"进阶角色材料"},{"itemId":190001,"moneySell":0,"gemsBuy":9999999999,"moneyBuy":99999999999,"name":"刘备碎片","rank":3,"isChangeToOfficerChip":false,"num":2,"pageType":2,"icon":1001,"type":16,"stack":9999,"extraDetailInfo":{"officerId":20001,"name":"刘备","icon":1001},"desc":"刘备武将碎片，集齐一定数量可招募或者升星该武将"},{"itemId":190001,"moneySell":0,"gemsBuy":9999999999,"moneyBuy":99999999999,"name":"刘备碎片","rank":3,"isChangeToOfficerChip":true,"num":5,"pageType":2,"icon":1001,"type":16,"stack":9999,"extraDetailInfo":{"officerId":20001,"name":"刘备","icon":1001},"desc":"刘备武将碎片，集齐一定数量可招募或者升星该武将"},{"itemId":600304,"moneySell":10,"gemsBuy":9999999999,"moneyBuy":99999999999,"name":"珍藏魂魄","rank":3,"isChangeToOfficerChip":false,"num":2,"pageType":0,"icon":160504,"type":31,"stack":99,"extraDetailInfo":{"itemId":600304,"moneySell":10,"phyPenetrate":0,"phyDef":0,"name":"珍藏魂魄","magAtk":0,"needLevel":0,"magDef":0,"hp":0,"phyAtk":0,"recover":0,"damageReduce":0,"rank":3,"magPenetrate":0,"icon":160504,"type":31,"desc":"进阶角色材料"},"desc":"进阶角色材料"},{"itemId":299013,"moneySell":0,"gemsBuy":9999999999,"moneyBuy":99999999999,"name":"安培晴明","rank":3,"isChangeToOfficerChip":true,"changeOfficerChip":33,"num":0,"pageType":0,"icon":1014,"type":27,"stack":1,"extraDetailInfo":{"star":2,"name":"安培晴明","skills":{"superSkill":{"isInstant":true,"cost":40,"uid":2001301,"aniId":2,"damageType":1,"damageElement":0,"skillType":0,"name":"百鬼夜行","isExistChange":true,"effectFlag":0,"coolCD":2,"changeRank":3,"icon":50082,"startCD":1,"desc":"复活傀儡，若已有傀儡则对敌方全体单位造成伤害。"},"passiveSkillArray":[{"changeRank":0,"uid":2001307,"aniId":2,"damageType":1,"openRank":2,"damageElement":0,"skillType":2,"name":"傀儡守护","isExistChange":false,"isLocked":true,"effectFlag":0,"icon":50081,"desc":"战斗开始时召唤1个傀儡，若傀儡在第一排，敌方的普通攻击只能指定自己为目标。"},{"changeRank":0,"uid":2001308,"aniId":-1,"damageType":1,"openRank":0,"damageElement":0,"skillType":2,"name":"人鬼合一","isExistChange":false,"isLocked":false,"effectFlag":0,"icon":50080,"desc":"傀儡存在时，安培晴明与傀儡一起进行普通攻击，必中且必定造成<l c=D2770A>小浮空</l>，附带<l c=D2770A>中毒</l>。"}],"hitSkill":{"changeRank":0,"uid":2001305,"aniId":1,"damageType":1,"damageElement":0,"skillType":1,"name":"傀儡操控","isExistChange":false,"effectFlag":16,"icon":50021,"desc":"对敌方单体造成<l c=D2770A>中毒</l>。"},"chasSkillArray":[{"changeRank":0,"uid":2001309,"aniId":1,"damageType":1,"openRank":1,"damageElement":2,"skillType":3,"name":"式神追魂","comboFlag":4,"isLocked":true,"effectFlag":1,"isExistChange":false,"icon":50079,"desc":"追打<l c=D2770A>倒地</l>敌人，造成<l c=D2770A>小浮空</l>。"}]},"rank":3,"echo":"dia100.mp3","officerId":20013,"aniId":1014,"needChipNum":30,"elementType":0,"icon":1014},"desc":"安培晴明"},{"itemId":190015,"moneySell":0,"gemsBuy":9999999999,"moneyBuy":99999999999,"name":"铁扇公主碎片","rank":3,"isChangeToOfficerChip":false,"num":1,"pageType":2,"icon":1005,"type":27,"stack":9999,"extraDetailInfo":{"officerId":20014,"name":"铁扇公主","icon":1005},"desc":"铁扇公主武将碎片，集齐一定数量可招募或者升星该武将"},{"itemId":190007,"moneySell":0,"gemsBuy":9999999999,"moneyBuy":99999999999,"name":"孙悟空碎片","rank":3,"isChangeToOfficerChip":true,"num":25,"pageType":2,"icon":1008,"type":16,"stack":9999,"extraDetailInfo":{"officerId":20006,"name":"孙悟空","icon":1008},"desc":"孙悟空碎片，集齐一定数量可招募或者升星该武将"},{"itemId":600207,"moneySell":10,"gemsBuy":9999999999,"moneyBuy":99999999999,"name":"水晶项链","rank":2,"isChangeToOfficerChip":false,"num":2,"pageType":0,"icon":160507,"type":31,"stack":99,"extraDetailInfo":{"itemId":600207,"moneySell":10,"phyPenetrate":0,"phyDef":0,"name":"水晶项链","magAtk":0,"needLevel":0,"magDef":0,"hp":0,"phyAtk":0,"recover":0,"damageReduce":0,"rank":2,"magPenetrate":0,"icon":160507,"type":31,"desc":"进阶角色材料"},"desc":"进阶角色材料"},{"itemId":600714,"moneySell":10,"gemsBuy":9999999999,"moneyBuy":99999999999,"name":"信仰染料","rank":2,"isChangeToOfficerChip":false,"num":2,"pageType":0,"icon":160514,"type":32,"stack":99,"extraDetailInfo":{"itemId":600714,"moneySell":10,"phyPenetrate":0,"phyDef":0,"name":"信仰染料","magAtk":0,"needLevel":0,"magDef":0,"hp":0,"phyAtk":0,"recover":0,"damageReduce":0,"rank":2,"magPenetrate":0,"icon":160514,"type":32,"desc":"进阶角色材料碎片"},"desc":"进阶角色材料碎片"}],"tag":4};
    var packetInfoArray = BPCommon.getArrayWithKey(jsonData, "packetUpdateInfo", null, EnlistPacketInfo);
    var layer = new EnlistPacketHeroLayer(jsonData, packetInfoArray[0]);
    return layer;
};


TestViewScene.testMultiLayoutTouch = function(){
    var mainPanel = new cc.Layer();
    mainPanel.setColor(cc.WHITE);
    mainPanel.setContentSize(cc.winSize);

    var num = 30;
    for(var i = 0; i < num; i++){
        var panel = new ccui.Layout();
        panel.setBackGroundColorEx(cc.GRAY);
        panel.setContentSize(cc.winSize);
        panel.setTouchEnabled(true);
        panel.setSwallowTouches(false);
        panel.index = i;
        //panel.addTouchEventListener(TestViewScene.MultiTouchCallBack);

        mainPanel.addChild(panel);
        panel.setpos(cc.pCenter(cc.winSize), cc.p(0.5, 0.5));
    }

    return mainPanel;
};

TestViewScene.MultiTouchCallBack = function(sender, type){
    if(type == ccui.Widget.TOUCH_BEGAN){
        cc.log("begin: "+ sender.index);
    }
    if(type == ccui.Widget.TOUCH_ENDED){
        cc.log("end: "+ sender.index);
    }
}
