/**
 * Created by Administrator on 2016/5/6.
 */
/**
 * 灰色弹出框
 * Created by ying on 14/11/18.
 */

/**
 * @param {cc.Node, ccui.widget...} content   						弹出窗内容view（不能为空）
 * @param {cc.size} 				[size]  						自定义大小(若为空，则会根据content适当计算出大小)
 * @param {Function(button, event)} [closeButCallBack]  			关闭按钮回调（若为空则用本类回调）
 * @param {bool}					[isShade]						是否需要带遮罩(默认为true带遮罩)
 * @returns {cc.LayerColor}
 */
var PopLayer = cc.LayerColor.extend({

    _titleLabel:null,       //标题
    _closeButton:null,      //关闭按钮
    _contentBgSprite:null,	//九宫格底板
    _contentBgLayer : null,
    //置灰color
    //_coverColor: null,
    _isFullScreen:true,
    _isInit:false,
    _centerContent : null,
    _defaultOpacity: 160,


    /**
     * 继承本类时 请在子类用本方法对内容进行初始化
     * @param content				内容view		      (必输)
     * @param size					自定义内部大小      (可为空，默认为content本身大小 + 适当size(30,20))
     * @param closeBtnCallBack		关闭按钮回调        (可为空，默认为直接关闭本身)
     */
    ctor:function(content, size, closeBtnCallBack){
        this._super();
        this._isInit = true;
        this._isFullScreen = true;
        this._defaultOpacity = 160;
        //this._coverColor = cc.BLACK;

        if(content){
            this.initWithContent(content, size, closeBtnCallBack);
        }

    },

    initWithContent:function(content, size, closeBtnCallBack){
        if(this._isInit === false) {cc.error("请确保继承PopLayer时 ctor调用了this._super()")}


//		//--------------创建基础底板-----------------
        //左 = 右 = 上 = 下
        var padding = 24;
        //标题背景(设计上高度固定)
        var titleBgHeight = 60;

        //我们默认给原来的content增加一个合适的size
        var contentSize = null;
        if(size){
            contentSize = cc.sizeAdd(content.getContentSize(), cc.sizeAdd(cc.size(20,20), size));
        }else{
            contentSize = cc.sizeAdd(content.getContentSize(), cc.size(20,20));
        }
        var popLayerSizeWidth = contentSize.width + padding * 2;
        var popLayerSizeHeight = contentSize.height + padding * 2 + titleBgHeight;

        //得到最终外框的大小
        var popLayerSize = cc.size(popLayerSizeWidth, popLayerSizeHeight);

        this._leftLineSprite = null;
        this._rightLineSprite = null;
        var centerContent  = this._centerContent = cc.BuilderReader.load("ccbi/PopLayer.ccbi", this, popLayerSize);

        //关闭按钮
        var closeButton = this._closeButton = new ccui.Button();
        closeButton.loadTextureNormal("btn_backspace_tp1.png", ccui.Widget.PLIST_TEXTURE);
        var closeBtnCallBack = closeBtnCallBack || function(button, type) {
                if(type != ccui.Widget.TOUCH_ENDED) return;
                MainController.playButtonSoundEffect(button);
                MainController.popLayerFromRunningScene(this);//默认动作
            }.bind(this);
        closeButton.addTouchEventListener(closeBtnCallBack, this);

        //处理内容位置
        var contentBgLayer = this._contentBgLayer;
        contentBgLayer.addChild(content);
        UICommon.setPos(content, cc.p(contentBgLayer.width/2, contentBgLayer.height/2), cc.p(0.5,0.5));

        //添加关闭按钮
        centerContent.addChild(closeButton);
        closeButton.setPosition(centerContent.width - 25, centerContent.height - 25);

        //处理是否遮罩逻辑
        this._handleShader(centerContent);

        //整体内容加入 layer中 并居中
        this.addChild(centerContent);
        UICommon.setPos(centerContent, cc.p(this.width/2, this.height/2), cc.p(0.5,0.5));

        this.setTitleString(LocalString.getString("POP_LAYER_COMMON_TITLE"));
        this._titleLabel.setSkewX(8);
    },

    getCenterLayerForTutor:function(){
        return this._centerContent;
    },

    /**
     * 设置popLayer是否全屏(即是否带遮罩)
     * @param {Boolean} isFullScreen
     */
    setFullScreen:function(isFullScreen){
        var isFullScreen = isFullScreen == undefined ? true : isFullScreen;    //默认全屏
        if(isFullScreen == this._isFullScreen){
            return;
        }
        if(isFullScreen == true){
            this.setContentSize(cc.winSize);
            this._centerContent.setAnchorPoint(0.5, 0.5);
            this._centerContent.setPosition(cc.pCenter(cc.winSize));
            this.setOpacity(this._defaultOpacity);
            this._isFullScreen = true;
        }

        if(isFullScreen == false){
            var contentSize = this._centerContent.getContentSize();
            this.setContentSize(contentSize);
            this._centerContent.setAnchorPoint(0.5, 0.5);
            this._centerContent.setPosition(cc.pCenter(contentSize));
            this.setOpacity(0);
            this._isFullScreen = false;
        }
    },

    /**
     * 隐藏关闭按钮
     * @param visible
     */
    setCloseButtonVisible:function(visible){
        if(!this._closeButton){
            cc.log("closeButton为空，popLayer界面可能未完全初始化")
            return;
        }
        this._closeButton.setVisible(visible);
    },

    /**
     *
     */
    _handleShader:function(bgPanel){
        if(this._isFullScreen){
            //this.setColor(this._coverColor);
            this.setOpacity(this._defaultOpacity);
            this.setTouchEventEnabled(false);
        }else{
            this.setOpacity(0);
            this.setContentSize(bgPanel.getContentSize());
        }

    },


    /**
     * 设置背景图
     * @param ImageName {String}
     */
    setBackGroundImage:function(backGroundImageName){
        var frame = cc.spriteFrameCache.getSpriteFrame(backGroundImageName)
        var size = this._contentBgSprite.getContentSize();
        this._contentBgSprite.setSpriteFrame(frame);
        this._contentBgSprite.setContentSize(size);
    },

    /**
     * 设置标题String
     * @param str {String}
     */
    setTitleString:function(str){
        if(!this._titleLabel){
            cc.log("title为空，popLayer界面可能未完全初始化");
            return;
        }
        if(this._titleLabel instanceof cc.Label){
            this._titleLabel.setString(str);
            this._leftLineSprite.setPositionX(leftOutter(this._titleLabel).x - 25);
            this._rightLineSprite.setPositionX(rightOutter(this._titleLabel).x + 25);
            var titleLineScale = this._contentBgLayer.width * 0.22 / this._leftLineSprite.width;
            this._leftLineSprite.setScaleX(titleLineScale);
            this._rightLineSprite.setScaleX(titleLineScale);
        }

        if(leftOutter(this._leftLineSprite).x < 5){
            var size = cc.size(rightOutter(this._rightLineSprite).x - leftOutter(this._leftLineSprite).x + 20, this._contentBgSprite.height);
            this._contentBgSprite.setContentSize(size);
            this._maskLayer.setContentSize(cc.sizeAdd(size, cc.size(-14, -14)));
        }
    },

    /**
     * 设置标题Label(widget,sprite...都可)
     *  @param node {cc.Node | ccui.Widget}
     */
    setTitle :function(node){
        UICommon.replaceWidget(this._titleLabel, node);
        this._titleLabel = node;
        this._leftLineSprite.setPositionX(leftOutter(this._titleLabel).x - 25);
        this._rightLineSprite.setPositionX(rightOutter(this._titleLabel).x + 25);
        var titleLineScale = this._contentBgLayer.width * 0.22 / this._leftLineSprite.width;
        this._leftLineSprite.setScaleX(titleLineScale);
        this._rightLineSprite.setScaleX(titleLineScale);
    },

    /**
     * 设置标题颜色(品阶的时候需要用到)
     * @param color
     */
    setTitleColor : function(color){
        if(this._titleLabel instanceof cc.Label){
            this._titleLabel.setColor(color);
        }
    },

    /**
     * 关闭按钮回调
     * @param closeCallFunc
     */
    setCloseButtonCallFunc:function(closeCallFunc){
        if(!this._closeButton){
            cc.log("closeButton为空，popLayer界面可能未完全初始化");
            return;
        }
        this._closeButton.addClickEventListener(function(sender) {
            MainController.playButtonSoundEffect(sender);
            closeCallFunc(this);
        }.bind(this), null);
    },

    /**
     * 设置点击 内容以外 区域 也关闭界面
     */
    setTouchCenterContentExternalPopLayer: function(callback)
    {
        var touchEventListener = {
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function(touch, event)
            {
                return !UICommon.isOnTouch(touch, event);
            },

            onTouchEnded: function(touch, event)
            {
                MainController.playButtonSoundEffect(event.getCurrentTarget());
                if(callback){
                    callback();
                }else{
                    MainController.popLayerFromRunningScene(this);//默认动作
                }
            }.bind(this)
        };
        cc.eventManager.addListener(touchEventListener, this._centerContent);
    },

    getTitleBgView: function() {
        return this._titleLabel.getParent();
    },

    getCenterContent:function() {
        return this._centerContent;
    }
});

/**
 * 创建一个Ok button layer
 * @param {cc.Node | ccui.Widget}         content 内容view
 * @param {cc.size}         			[] size 自定义大小(可为空,默认为content大小 + 适当size(60,60))
 * @param {function(alert)} 			[] callBack 确定按钮回调(可为空)
 * @returns {cc.Layer}
 * @constructor
 */
var PopLayerWithOKButton = function(content, size, callBack){
    var padding = 25;
    var contentPanel = null;
    var popLayer = null;	//创建弹出框

    var buttonSize = cc.size(180, 80);
    var okButton = UICommon.createCommonButton(buttonSize);//new ccui.Button();
    okButton.setTitleText(LocalString.getString("COMMON_OK"));
    okButton.setTitleFontSize(28);

    //如果定义了内框大小，我们做特殊处理，内容居中， 按钮居下
    if(size){
        var newSize = cc.size(Math.max(okButton.width, content.width + size.width), size.height + content.height + okButton.height + padding * 2);
        contentPanel  = new ccui.Layout();
        contentPanel.setContentSize(newSize);

        contentPanel.addChild(content);
        contentPanel.addChild(okButton);

        var width = contentPanel.getContentSize().width;

        //内容在按钮上方空白处居中
        var contentHeight = okButton.height + padding * 2 + (newSize.height - okButton.height - padding * 2 - 17) * 0.5 ;

        UICommon.setPos(content, cc.p(width/2, contentHeight), cc.p(0.5, 0.5));
        UICommon.setPos(okButton, cc.p(width/2, padding), cc.p(0.5, 0));

        popLayer = new PopLayer(contentPanel, cc.size(-20, -40));
    }else{
        //组合内容和button
        contentPanel = UICommon.createPanelAlignWidgetsWithPadding(padding, cc.UI_ALIGNMENT_VERTICAL_CENTER, content, okButton);
        popLayer = new PopLayer(contentPanel, cc.size(-20, -20));
    }

    //添加按钮回调
    okButton.addClickEventListener(function() {
        if (callBack != undefined) {
            callBack(popLayer);
        } else {
            MainController.popLayerFromRunningScene(popLayer)
        }
    });

    /**
     * 设置okButton回调
     * @param {Function} okCallBack 格式function(retLayer){...}
     */
    popLayer.setOkButtonCallFunc = function(okCallBack){
        okButton.addClickEventListener(function() {
            okCallBack(this);
        }.bind(this));
    };

    popLayer.getOkButton = function(){
        return okButton;
    };

    //默认隐藏关闭按钮
    popLayer.setCloseButtonVisible(false);
    popLayer.setTitleString(LocalString.getString("POP_LAYER_COMMON_TITLE"));

    return popLayer;
};

/**
 * 创建一个Ok button layer
 * @param {cc.Node | ccui.Widget}         content 内容view
 * @param {cc.size}         			[] size 自定义大小(可为空,默认为content大小 + 适当size(60,60))
 * @param {cc.Node}[button]
 * @param {function(alert)}[callBack]
 * @returns {*}
 * @constructor
 */
var PopLayerWithOneButton = function(content, size, button, callBack){
    if(!button)
    {
        return new PopLayerWithOKButton(content, size, callBack);
    }

    var padding = 25;
    var contentPanel = null;
    var popLayer = null;	//创建弹出框

    var okButton = button;

    //如果定义了内框大小，我们做特殊处理，内容居中， 按钮居下
    if(size){
        var newSize = cc.size(Math.max(okButton.width, content.width + size.width), size.height + content.height + okButton.height + padding * 2);
        contentPanel  = new ccui.Layout();
        contentPanel.setContentSize(newSize);

        contentPanel.addChild(content);
        contentPanel.addChild(okButton);

        var width = contentPanel.getContentSize().width;

        //内容在按钮上方空白处居中
        var contentHeight = okButton.height + padding * 2 + (newSize.height - okButton.height - padding * 2 - 17) * 0.5 ;

        UICommon.setPos(content, cc.p(width/2, contentHeight), cc.p(0.5, 0.5));
        UICommon.setPos(okButton, cc.p(width/2, padding), cc.p(0.5, 0));

        popLayer = new PopLayer(contentPanel, cc.size(-20, -40));
    }else{
        //组合内容和button
        contentPanel = UICommon.createPanelAlignWidgetsWithPadding(padding, cc.UI_ALIGNMENT_VERTICAL_CENTER, content, okButton);
        popLayer = new PopLayer(contentPanel, cc.size(-20, -20));
    }

    //添加按钮回调
    okButton.addTouchCallBack(function() {
        if (callBack != undefined) {
            callBack(popLayer);
        } else {
            MainController.popLayerFromRunningScene(popLayer)
        }
    });

    /**
     * 设置okButton回调
     * @param {Function} okCallBack 格式function(retLayer){...}
     */
    popLayer.setOkButtonCallFunc = function(okCallBack){
        okButton.addTouchCallBack(function() {
            okCallBack(this);
        }.bind(this));
    };

    popLayer.getOkButton = function(){
        return okButton;
    };

    //默认隐藏关闭按钮
    popLayer.setCloseButtonVisible(false);
    popLayer.setTitleString(LocalString.getString("POP_LAYER_COMMON_TITLE"));

    return popLayer;
};

/**
 * 创建一个带确定和取消按钮的poplayer
 * @param content           (子内容， 必输)
 * @param size              (可为空， 默认为content大小 + 适当size(60,60))
 * @param okCallBack        (可为空)
 * @param cancelCallBack    (可为空)
 * @param closeCallBack     (可为空， 默认关闭弹出窗)
 * @returns {cc.LayerColor}
 * @constructor
 */
var ConfirmPopLayer = PopLayer.extend({
    _okButton:null,
    _cancelButton:null,

    ctor:function(content, size, okCallBack, cancelCallBack, closeCallBack){
        this._super();
        if(content){
            this.initWithContent(content, size, okCallBack, cancelCallBack, closeCallBack);
        }
    },

    initWithContent:function(content, size, okCallBack, cancelCallBack, closeCallBack){
        var padding = 0;
        var contentPanel = null;

        var buttonSize = cc.size(180, 80);		//按钮大小

        var okButton = this._okButton =  UICommon.createCommonButton(buttonSize);
        okButton.setTitleFontSize(32);
        okButton.setColorRed();
        okButton.setTitleText(LocalString.getString("COMMON_OK"));

        var cancelButton = this._cancelButton = UICommon.createCommonButton(buttonSize);
        cancelButton.setTitleFontSize(32);
        cancelButton.setColorBlue();
        cancelButton.setTitleText(LocalString.getString("COMMON_CANCEL"));

        //组合两按钮 间距适当
        var buttonBar = UICommon.createPanelAlignWidgetsWithPadding(adaptiveSizeWidth(80), cc.UI_ALIGNMENT_HORIZONTAL_CENTER, okButton, cancelButton);

        //如果定义了内框大小，我们做特殊处理，内容居中， 按钮居下
        if(size && size.width != undefined && size.height != undefined){
            var newSize = cc.size(Math.max(buttonBar.width, content.width + size.width), content.height + size.height + buttonBar.height + padding * 2);
            contentPanel  = new ccui.Layout();
            contentPanel.setContentSize(newSize);

            contentPanel.addChild(content);
            contentPanel.addChild(buttonBar);

            var width = contentPanel.getContentSize().width;

            var contentHeight = buttonBar.getContentSize().height + padding * 2 + (newSize.height - buttonBar.getContentSize().height - padding*2) * 0.5 ;

            UICommon.setPos(content, cc.p(width/2, contentHeight), cc.p(0.5, 0.5));
            UICommon.setPos(buttonBar, cc.p(width/2, padding * 3), cc.p(0.5, 0));

            this._super(contentPanel, undefined, closeCallBack);
        }else{
            padding = 25;
            //组合内容和button
            contentPanel = UICommon.createPanelAlignWidgetsWithPadding(padding, cc.UI_ALIGNMENT_VERTICAL_CENTER, content, buttonBar);
            this._super(contentPanel, undefined, closeCallBack);
        }

        //添加按钮回调
        okButton.addTouchCallBack(function() {
            if (okCallBack != undefined) {
                okCallBack(this);
            } else {
                MainController.popLayerFromRunningScene(this)
            }
        }.bind(this));

        //取消按钮回调
        cancelButton.addTouchCallBack(function() {
            if (cancelCallBack != undefined) {
                cancelCallBack(this);
            } else {
                MainController.popLayerFromRunningScene(this)
            }
        }.bind(this));

        this.setTitleString("提示");
    },

    /**
     * @returns {ccui.Button}
     */
    getOkButton:function(){
        return this._okButton;
    },

    /**
     * @returns {ccui.Button}
     */
    getCancelButton:function(){
        return this._cancelButton;
    },

    /**
     * 设置okButton回调
     * @param {Function} okCallBack 格式function(retLayer){...}
     */
    setOkButtonCallFunc:function(okCallBack){
        if(!this._okButton){
            cc.log("okButton为空，界面可能未完全初始化, 请检查...");
            return;
        }
        this._okButton.addTouchCallBack(function() {
            okCallBack(this);
        }.bind(this), null);
    },

    /**
     * 设置cancelButton回调
     * @param {Function} cancelCallBack 格式function(retLayer){...}
     */
    setCancelButtonCallFunc:function(cancelCallBack){
        if(!this._cancelButton){
            cc.log("cancelButton为空，界面可能未完全初始化, 请检查...");
            return;
        }
        this._cancelButton.addTouchCallBack(function() {
            cancelCallBack(this);
        }.bind(this), null);
    }
})


