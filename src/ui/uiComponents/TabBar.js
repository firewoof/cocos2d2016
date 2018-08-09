/**
 * tab切换功能控件
 * Created by Administrator on 2016/5/6.
 */
var LAYOUT_HORIZONTAL = 0;
var LAYOUT_VERTICAL = 1;

var TabBar = ccui.Widget.extend({
    _normalArray: null,
    _highlightArray: null,
    _callback: null,
    _highlightIndex: -1,
    _buttonArray: null,
    _gap: 0,
    _mode : 0,

    /**
     * @param {Array} normalNodeArray
     * @param {Array} highlightNodeArray
     * @param {float} [gap]
     * @param {function(TabComposition, Number|unsigned) returns boolean} [callback]
     * @param {layouMode}[mode]
     */
    ctor: function(normalNodeArray, highlightNodeArray, gap, callback, mode) {
        this._super();

        if (mode == undefined)
        {
            this._mode = LAYOUT_HORIZONTAL;
        }
        else
        {
            this._mode = LAYOUT_VERTICAL;
        }

        this._normalArray = [];
        this._highlightArray = [];
        this._callback = callback;

        if (mode == LAYOUT_HORIZONTAL)
        {
            this._initHorizontalWithArray(normalNodeArray, highlightNodeArray, gap);
        }
        else
        {
            this._initWithArray(normalNodeArray, highlightNodeArray);
            if(gap){
                this.setGap(gap);
            }
            this.setHighlightIndex(0);
        }

        this.setAnchorPoint(cc.p(0.0, 0.0));// 默认使用左下锚点

    },

    _initHorizontalWithArray: function(normalNodeArray, highlightNodeArray, gap) {
        this._buttonArray = [];
        var maxSize = {width:0, height:0};
        for (var i = 0, cnt = Math.min(normalNodeArray.length, highlightNodeArray.length); i < cnt; ++i) {
            var normalNode = normalNodeArray[i];
            var highlightNode = highlightNodeArray[i];

            var normalSize = normalNode.getBoundarySize();
            var highlightSize = highlightNode.getBoundarySize();

            var button = new ccui.Button();
            button.setScale9Enabled(true);
            button.setContentSize(normalSize);
            button.addTouchEventListener(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    MainController.playButtonSoundEffect(sender);
                    var idx = this._buttonArray.indexOf(sender, 0);
                    if (idx != undefined && idx >= 0 && idx < this._buttonArray.length) {
                        if (this._callback != null) {
                            var ret = this._callback(this, idx);
                            if (ret == undefined || ret == true) {
                                this.setHighlightIndex(idx);
                            }
                        } else {
                            this.setHighlightIndex(idx);
                        }
                    }
                }
            }.bind(this), null);

            button.addChild(normalNode);
            normalNode.setAnchorPoint(cc.p(0.5, 0.5));
            normalNode.setPosition(cc.pMidpointFromSize(normalSize));
            this._normalArray.push(normalNode);

            button.addChild(highlightNode);
            highlightNode.setAnchorPoint(cc.p(0.5, 0.5));
            highlightNode.setPosition(cc.pMidpointFromSize(normalSize));
            this._highlightArray.push(highlightNode);

            if (i > 0) {  // 先让第一个高亮
                button.setPosition(cc.p(maxSize.width + normalSize.width * 0.5, normalSize.height * 0.5));
                maxSize.width += (normalSize.width);
            } else {
                button.setPosition(cc.p(maxSize.width + highlightSize.width * 0.5, highlightSize.height * 0.5));
                maxSize.width += (highlightSize.width);
            }
            maxSize.height = Math.max(maxSize.height, normalSize.height, highlightSize.height);
            this._buttonArray.push(button);

            this.addChild(button);
        }

        // 调整间距
        var cnt = this._buttonArray.length;
        if (gap != undefined && gap != 0 && cnt > 1) {
            this._gap = gap;
            for (var i = 0; i < cnt; ++i) {
                var button = this._buttonArray[i];
                button.setPositionX(button.getPositionX() + gap * i);
            }
            maxSize.width += gap * (cnt - 1);
        }

        this.setContentSize(maxSize);
        this._setHighlightIndex(0);
    },

    _initWithArray: function(normalNodeArray, highlightNodeArray) {
        this._buttonArray = [];

        for (var i = 0, cnt = Math.min(normalNodeArray.length, highlightNodeArray.length); i < cnt; ++i) {
            var normalNode = normalNodeArray[i];
            var highlightNode = highlightNodeArray[i];

            var normalSize = normalNode.getBoundarySize();

            var button = new ccui.Button();
            button.setScale9Enabled(true);
            button.setContentSize(normalSize);
            button.addTouchEventListener(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    MainController.playButtonSoundEffect(sender);
                    var idx = this._buttonArray.indexOf(sender, 0);
                    if (idx != undefined && idx >= 0 && idx < this._buttonArray.length) {
                        if (this._callback != null) {
                            var ret = this._callback(this, idx);
                            if (ret == undefined || ret) {
                                this.setHighlightIndex(idx);
                            }
                        } else {
                            this.setHighlightIndex(idx);
                        }
                    }
                }
            }.bind(this), null);

            button.addChild(normalNode);
            normalNode.setAnchorPoint(cc.p(0.5, 0.5));
            normalNode.setPosition(cc.pMidpointFromSize(normalSize));
            this._normalArray.push(normalNode);

            button.addChild(highlightNode);
            highlightNode.setAnchorPoint(cc.p(0.5, 0.5));
            highlightNode.setPosition(cc.pMidpointFromSize(normalSize));
            this._highlightArray.push(highlightNode);

            this._buttonArray.push(button);

            this.addChild(button);
        }

    },
    /**
     * @param {Number|unsigned} idx
     * @param {Boolean} [isExeCallBack]
     */
    setHighlightIndex: function(idx, isExeCallBack) {
        this._setHighlightIndex(idx);
        this._layout();
        if(isExeCallBack === true && this._callback instanceof Function){
            this._callback(this, idx);
        }
    },

    getHighlightIndex: function(){
        return this._highlightIndex;
    },

    _setHighlightIndex: function(idx) {
        var oldIdx = this._highlightIndex > 0 ? this._highlightIndex : 0;
        this._buttonArray[oldIdx].setLocalZOrder(1);
        this._buttonArray[idx].setLocalZOrder(9);

        this._highlightIndex = idx;
        for (var i = 0, cnt = this._normalArray.length; i < cnt; ++i) {
            var visible = (idx == i);
            this._normalArray[i].setVisible(!visible);
            this._highlightArray[i].setVisible(visible);
            this._buttonArray[i].setTouchEnabled(!visible);
        }
    },

    _layout: function()
    {
        if (this._mode == LAYOUT_HORIZONTAL)
        {
            this._doLayoutHorizontal();
        }
        else
        {
            this._doLayoutVertical();
        }
    },

    _doLayoutHorizontal:function()
    {
        // 重新布局
        var maxSize = {width:0, height:0};
        var cnt = this._buttonArray.length;
        for (var i = 0; i < cnt; ++i) {
            var normalNode = this._normalArray[i];
            var highlightNode = this._highlightArray[i];

            var normalSize = normalNode.getBoundarySize();
            var highlightSize = highlightNode.getBoundarySize();

            var button = this._buttonArray[i];
            if (i != this._highlightIndex) {
                button.setPosition(cc.p(maxSize.width + normalSize.width * 0.5, normalSize.height * 0.5));
                maxSize.width += (normalSize.width);
            } else {
                button.setPosition(cc.p(maxSize.width + highlightSize.width * 0.5, highlightSize.height * 0.5));
                maxSize.width += (highlightSize.width);
            }
            maxSize.height = Math.max(maxSize.height, normalSize.height, highlightSize.height);
        }

        // 调整间距
        if (this._gap != 0 && cnt > 1) {
            for (var i = 0; i < cnt; ++i) {
                var button = this._buttonArray[i];
                button.setPositionX(button.getPositionX() + this._gap * i);
            }
            maxSize.width += this._gap * (cnt - 1);
        }

        this.setContentSize(maxSize);
    },

    _doLayoutVertical:function()
    {
        // 重新布局
        var maxSize = {width:0, height:0};
        var cnt = this._buttonArray.length;
        for (var i = cnt; i > 0; --i) {
            var normalNode = this._normalArray[i - 1];
            var highlightNode = this._highlightArray[i - 1];

            var normalSize = normalNode.getBoundarySize();
            var highlightSize = highlightNode.getBoundarySize();
            var maxWidth = Math.max(normalSize.width, highlightSize.width);

            var button = this._buttonArray[i - 1];
            if ((i - 1) != this._highlightIndex) {
                if(i == cnt){
                    button.setPosition(cc.p(maxWidth - normalSize.width * (1 - button.getAnchorPoint().x), maxSize.height + normalSize.height * 0.5));
                }else{
                    button.setPosition(cc.p(maxWidth - normalSize.width * (1 - button.getAnchorPoint().x), maxSize.height + normalSize.height * 0.5 + this._gap));
                }
                maxSize.height += (normalSize.height);
            } else {
                if(i == cnt){
                    button.setPosition(cc.p(maxWidth - highlightSize.width * (1 - button.getAnchorPoint().x), maxSize.height + highlightSize.height * 0.5));
                }else{
                    button.setPosition(cc.p(maxWidth - highlightSize.width * (1 - button.getAnchorPoint().x), maxSize.height + highlightSize.height * 0.5 + this._gap));
                }
                maxSize.height += (highlightSize.height);
            }

            if (i < cnt)
            {
                maxSize.height += this._gap;
            }
            maxSize.width = Math.max(maxSize.width, normalSize.width, highlightSize.width);
        }

        this.setContentSize(maxSize);
    },
    /**
     * @param {function(TabComposition, Number|unsigned) returns boolean} callback
     */
    setCallback: function(callback) {
        this._callback = callback;
    },

    /**
     * @param {Number|float} gap
     */
    setGap: function(gap) {
        if (this._gap != gap) {
            this._gap = gap;
            this._layout();
        }
    },

    getTabArray:function(){
        return this._buttonArray;
    },

    getCurIndex : function() {
        return this._highlightIndex;
    }
});