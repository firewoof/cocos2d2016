/**
 * Created by Administrator on 2016/5/6.
 */
/**
 * 通用弹出框
 * Created by ying on 14/11/18.
 */

/**
 * @param {cc.Node, ccui.widget...} content   						弹出窗内容view（不能为空）
 * @param {cc.size} 				[size]  						自定义大小(若为空，则会根据content适当计算出大小)
 * @param {Function(button, event)} [closeButCallBack]  			关闭按钮回调（若为空则用本类回调）
 * @param {bool}					[isShade]						是否需要带遮罩(默认为true带遮罩)
 * @returns {cc.LayerColor}
 */
var PopLayer = cc.Layer.extend({

    _titleLabel:undefined,       //标题
    _closeButton:undefined,      //关闭按钮
    //置灰color
    //_coverColor: undefined,
    _isFullScreen:undefined,
    _isInit:false,
    _centerContent : undefined,
    _defaultOpacity: 160,
    _layerName:"PopLayer",


    /**
     * 继承本类时 请在子类用本方法对内容进行初始化
     * @param content				内容view		      (必输)
     * @param paddingAddSize					自定义内部大小      (可为空，默认为content本身大小 + 适当size(30,20))
     * @param closeBtnCallBack		关闭按钮回调        (可为空，默认为直接关闭本身)
     */
    ctor:function(content, paddingAddSize, closeBtnCallBack){
        this._super();
        this._isInit = true;
        this._isFullScreen = undefined;
        this._defaultOpacity = 160;
        //this._coverColor = cc.BLACK;

        if(content){
            this.initWithContent(content, paddingAddSize, closeBtnCallBack);
        }
    },

    initWithContent:function(content, paddingAddSize, closeBtnCallBack){
        if(this._isInit === false) {cc.error("请确保继承PopLayer时 ctor调用了this._super()")}


		//--------------创建基础底板-----------------
        //左 = 右 = 上 = 下
        var padding = 28;
        //标题背景(设计上高度固定)
        var titleBgHeight = 80;

        //我们默认给原来的content增加一个合适的size
        var contentSize = undefined;
        if(paddingAddSize){
            contentSize = cc.sizeAdd(content.getContentSize(), paddingAddSize);
        }else{
            contentSize = content.getContentSize()
        }
        var popLayerSizeWidth = contentSize.width + padding * 2;
        var popLayerSizeHeight = contentSize.height + padding + titleBgHeight;

        //得到最终外框的大小
        var popLayerSize = cc.size(popLayerSizeWidth, popLayerSizeHeight);

        //遮罩
        var mask = this._maskPanel = new ccui.Layout();
        mask.setContentSize(cc.winSize);
        mask.setBackGroundColorEx(cc.BLACK);
        mask.setBackGroundColorOpacity(this._defaultOpacity);
        this.addChild(mask);

        var centerContent  = this._centerContent = new ccui.ImageView("bg_common_bar.png", ccui.Widget.PLIST_TEXTURE);
        centerContent.setScale9Enabled(true);
        //cc.log("popLayerSize", JSON.stringify(popLayerSize));
        centerContent.setContentSize(popLayerSize);//
        this.addChild(centerContent);
        centerContent.setPos(cc.pCenter(cc.winSize), ANCHOR_CENTER);
        centerContent.setTouchEnabled(true);    //中心区域阻隔事件

        //标题底板
        var titleBgPanel = new ccui.Layout();
        //titleBgPanel.setBackGroundColorEx(cc.RED);
        titleBgPanel.setContentSize(popLayerSizeWidth, titleBgHeight);
        centerContent.addChild(titleBgPanel);
        titleBgPanel.setPos(topInner(centerContent), ANCHOR_TOP);

        var titleLabel = this._titleLabel = new cc.LabelTTF("提示", FONT_ARIAL_BOLD, 36);
        titleLabel.setColor(cs.BLACK);
        titleBgPanel.addChild(titleLabel);
        titleLabel.setPos(centerInner(titleBgPanel));

        //关闭按钮
        var closeButton = this._closeButton = new ccui.Button();
        closeButton.loadTextureNormal("btn_close.png", ccui.Widget.PLIST_TEXTURE);
        var closeBtnCallBack = closeBtnCallBack || function(sender) {
                MainController.popLayerFromRunningScene(this);//默认动作
            }.bind(this);
        closeButton.addClickEventListener(closeBtnCallBack);
        closeButton.setVisible(false);

        //
        centerContent.addChild(content);
        content.setPos(cc.p(popLayerSize.width * 0.5, popLayerSize.height - titleBgHeight), ANCHOR_TOP);
        
        //添加关闭按钮
        centerContent.addChild(closeButton);
        closeButton.setPosition(popLayerSize.width - 10, popLayerSize.height - 10);

        //默认灰色遮罩
        this.setFullScreen();

        this.setMaskTouchEnabled(true, function(sender) {
            MainController.playButtonSoundEffect(sender);
            MainController.popLayerFromRunningScene(this);//默认动作
        }.bind(this));
    },

    /**
     * 设置popLayer是否带遮罩
     * @param {Boolean} [isFullScreen]
     */
    setFullScreen:function(isFullScreen){
        var isFullScreen = isFullScreen == undefined ? true : isFullScreen;    //默认全屏
        if(isFullScreen == this._isFullScreen){
            return;
        }
        if(isFullScreen == true) {
            this._maskPanel.setOpacity(this._defaultOpacity);
            this.setMaskTouchEnabled(true);
            this._isFullScreen = true;
        }

        if(isFullScreen == false){
            this._maskPanel.setOpacity(0);
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


    ///**
    // * 设置背景图
    // * @param ImageName {String}
    // */
    //setBackGroundImage:function(backGroundImageName){
    //    var frame = cc.spriteFrameCache.getSpriteFrame(backGroundImageName)
    //    var size = this._contentBgSprite.getContentSize();
    //    this._contentBgSprite.setSpriteFrame(frame);
    //    this._contentBgSprite.setContentSize(size);
    //},

    /**
     * 设置标题String
     * @param str {String}
     */
    setTitleString:function(str){
        //if(!this._titleLabel){
        //    cc.log("title为空，popLayer界面可能未完全初始化");
        //    return;
        //}
        this._titleLabel.setString(str);

        //if(this._titleLabel instanceof cc.Label){
        //    this._titleLabel.setString(str);
            //this._leftLineSprite.setPositionX(leftOutter(this._titleLabel).x - 25);
            //this._rightLineSprite.setPositionX(rightOutter(this._titleLabel).x + 25);
            //var titleLineScale = this._contentBgLayer.width * 0.22 / this._leftLineSprite.width;
            //this._leftLineSprite.setScaleX(titleLineScale);
            //this._rightLineSprite.setScaleX(titleLineScale);
        //}
    },

    /**
     * 设置标题Label(widget,sprite...都可)
     *  @param node {cc.Node | ccui.Widget}
     */
    setTitle :function(node){
        UICommon.replaceWidget(this._titleLabel, node);
        this._titleLabel = node;
        //this._leftLineSprite.setPositionX(leftOutter(this._titleLabel).x - 25);
        //this._rightLineSprite.setPositionX(rightOutter(this._titleLabel).x + 25);
        //var titleLineScale = this._contentBgLayer.width * 0.22 / this._leftLineSprite.width;
        //this._leftLineSprite.setScaleX(titleLineScale);
        //this._rightLineSprite.setScaleX(titleLineScale);
    },

    /**
     * 设置标题颜色(品阶的时候需要用到)
     * @param color
     */
    setTitleColor : function(color){
        //if(this._titleLabel instanceof cc.Label){
            this._titleLabel.setColor(color);
        //}
    },

    /**
     * 关闭按钮回调
     * @param closeCallFunc
     */
    setCloseBtnCallFunc:function(closeCallFunc){
        if(!this._closeButton){
            cc.log("closeButton为空，popLayer界面可能未完全初始化");
            return;
        }
        this._closeButton.addClickEventListener(function(sender) {
            closeCallFunc(this);
            MainController.popLayerFromRunningScene(this);
        }.bind(this));
    },

    /**
     * 是否遮罩也相应点击
     */
    setMaskTouchEnabled: function(isEnabled, callBack)
    {
        var isEnabled = isEnabled == undefined ? true : isEnabled;
        this._maskPanel.setTouchEnabled(isEnabled);

        if(isEnabled && callBack)
        {
            this._maskPanel.addClickEventListener(callBack);
        }
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
var PopLayerWithOKButton = PopLayer.extend({

    ctor:function(content, paddingAddSize, okCallBack){
        this._super();
        if(content){
            this.initWithContent(content, paddingAddSize, okCallBack);
        }
    },

    initWithContent:function(content, paddingAddSize, okCallBack) {
        var padding = 25;

        cc.log("111111");
        var buttonSize = cc.size(180, 80);
        var okButton = this._okButton = new ccui.Button();
        okButton.loadTextureNormal("btn_common_red_n.png", ccui.Widget.PLIST_TEXTURE);
        okButton.setScale9Enabled(true);
        okButton.setContentSize(buttonSize);
        okButton.setTitleFontSize(28);
        okButton.setTitleText(LocalString.getString("COMMON_OK"));

        cc.log("2222");

        var contentPanel = null;
        //如果定义了内框大小，我们做特殊处理，内容居中， 按钮居下
        if(paddingAddSize){
            var newSize = cc.size(Math.max(okButton.width, content.width + paddingAddSize.width), paddingAddSize.height + content.height + okButton.height + padding * 2);
            contentPanel  = new ccui.Layout();
            contentPanel.setContentSize(newSize);

            contentPanel.addChild(content);
            contentPanel.addChild(okButton);

            var width = contentPanel.getContentSize().width;

            //内容在按钮上方空白处居中
            var contentHeight = okButton.height + padding * 2 + (newSize.height - okButton.height - padding * 2 - 17) * 0.5 ;

            content.setPos(cc.p(width/2, contentHeight), cc.p(0.5, 0.5));
            okButton.setPos(cc.p(width/2, padding), cc.p(0.5, 0));

            paddingAddSize = cc.size(-20, -40);
        }else{
            //组合内容和button
            contentPanel = UICommon.createPanelAlignWidgetsWithPadding(padding, cc.UI_ALIGNMENT_VERTICAL_CENTER, content, okButton);
            paddingAddSize = cc.size(-20, -20);
        }

        this._super(contentPanel, paddingAddSize);

        //默认隐藏关闭按钮
        this.setCloseButtonVisible(false);

        //添加按钮回调
        okButton.addClickEventListener(function(sender) {
            if (okCallBack != undefined) {
                okCallBack(this);
            }
            MainController.popLayerFromRunningScene(this);
            //else {
            //    MainController.popLayerFromRunningScene(this)
            //}
        }.bind(this));
    },

    setOkButtonCallFunc:function(okCallBack)
    {
        this._okButton.addClickEventListener(function(sender) {
            okCallBack(this);
            MainController.popLayerFromRunningScene(this);
        }.bind(this));
    },

    getOkButton :function() {
        return this._okButton;
    }

});


/**
 * 创建一个带确定和取消按钮的poplayer
 * @param content           (子内容， 必输)
 * @param addSize              (可为空， 默认为content大小 + 适当size(60,60))
 * @param okCallBack        (可为空)
 * @param cancelCallBack    (可为空)
 * @param closeCallBack     (可为空， 默认关闭弹出窗)
 * @returns {cc.LayerColor}
 * @constructor
 */
var ConfirmPopLayer = PopLayer.extend({
    _okButton:undefined,
    _cancelButton:undefined,
    _layerName:"ConfirmPopLayer",

    ctor:function(content, addSize, okCallBack, cancelCallBack, closeCallBack){
        this._super();
        if(content){
            this.initWithContent(content, addSize, okCallBack, cancelCallBack, closeCallBack);
        }
    },

    initWithContent:function(content, addSize, okCallBack, cancelCallBack, closeCallBack){
        var padding = 0;
        var contentPanel = null;

        var buttonSize = cc.size(250, 80);		//按钮大小

        var okButton = this._okButton =  new ccui.Button();//UICommon.createCommonButton(buttonSize);
        okButton.loadTextureNormal("btn_common_red_n.png", ccui.Widget.PLIST_TEXTURE);
        okButton.setScale9Enabled(true);
        okButton.setContentSize(buttonSize);
        okButton.setTitleFontSize(32);
        okButton.setTitleText(LocalString.getString("COMMON_OK"));

        var cancelButton = this._cancelButton = new ccui.Button();//UICommon.createCommonButton(buttonSize);
        cancelButton.loadTextureNormal("btn_common_grey_n.png", ccui.Widget.PLIST_TEXTURE);
        cancelButton.setScale9Enabled(true);
        cancelButton.setContentSize(buttonSize);
        cancelButton.setTitleFontSize(32);
        cancelButton.setTitleText(LocalString.getString("COMMON_CANCEL"));

        //组合两按钮 间距适当
        var buttonBar = UICommon.createPanelAlignWidgetsWithPadding(adaptiveSizeWidth(80), cc.UI_ALIGNMENT_HORIZONTAL_CENTER, cancelButton, okButton);

        //如果定义了内框大小，我们做特殊处理，内容居中， 按钮居下
        if(addSize && addSize.width != undefined && addSize.height != undefined){
            var newSize = cc.size(Math.max(buttonBar.width, content.width + addSize.width), content.height + addSize.height + buttonBar.height + padding * 2);
            contentPanel  = new ccui.Layout();
            contentPanel.setContentSize(newSize);

            contentPanel.addChild(content);
            contentPanel.addChild(buttonBar);

            var width = contentPanel.getContentSize().width;

            var contentHeight = buttonBar.getContentSize().height + padding * 2 + (newSize.height - buttonBar.getContentSize().height - padding*2) * 0.5 ;

            content.setPos(cc.p(width/2, contentHeight + 50), cc.p(0.5, 0.5));
            buttonBar.setPos(cc.p(width/2, padding * 3), cc.p(0.5, 0));

            this._super(contentPanel, undefined, closeCallBack);
        }else{
            padding = 25;
            //
            contentPanel = UICommon.createPanelAlignWidgetsWithPadding(padding, cc.UI_ALIGNMENT_VERTICAL_CENTER, content, buttonBar);
            //contentPanel.setBackGroundColorEx(cc.RED);
            this._super(contentPanel, undefined, closeCallBack);
        }

        //添加按钮回调
        okButton.addClickEventListener(function(sender) {
            if (okCallBack != undefined) {
                okCallBack(this);
            }
            MainController.popLayerFromRunningScene(this);
            //else {
            //    MainController.popLayerFromRunningScene(this)
            //}
        }.bind(this));

        //取消按钮回调
        cancelButton.addClickEventListener(function(sender) {
            if (cancelCallBack != undefined) {
                cancelCallBack(this);
            }
            MainController.popLayerFromRunningScene(this);
            //else {
            //    MainController.popLayerFromRunningScene(this)
            //}
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
        this._okButton.addClickEventListener(function(sender) {
            okCallBack(this);
            MainController.popLayerFromRunningScene(this);
        }.bind(this));
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
        this._cancelButton.addClickEventListener(function(sender) {
            cancelCallBack(this);
            MainController.popLayerFromRunningScene(this);
        }.bind(this));
    }
});


