/**
 * Created by Jeff3 on 15-2-9.
 */

var ProgressBar = ccui.Widget.extend({
    _sprite: null,
    _insetLeft: 0,
    _insetRight: 0,
    _originSize: null,
    _percentage: 0,

    ctor: function(imageName) {
        this._super();

        this._sprite = new cc.Scale9Sprite(imageName);
        this.addChild(this._sprite);
        this._sprite.setAnchorPoint(cc.p(0, 0));

        this._originSize = this._sprite.getContentSize();
        this.setContentSize(this._originSize);
    },

    setColor:function(color){
        this._sprite.setColor(color);
    },

    setContentSize: function(size) {
        this._super(size);

        var width = size.width * this._percentage / 100;
        this._sprite.setContentSize(cc.size(width, size.height));
    },

    setPercentage: function(percentage) {
        percentage = isNaN(percentage) ? 0 : percentage;    //防止参数为Nan时导致底层报错
        percentage = Math.max(percentage, 0);
        percentage = Math.min(percentage, 100);
        this._percentage = percentage;

        var size = this.getContentSize();
        var width = size.width * this._percentage / 100;
        this._sprite.setContentSize(cc.size(width, size.height));

        this._sprite.setInsetLeft(Math.min(this._insetLeft, width * 0.5));
        this._sprite.setInsetRight(Math.min(this._insetRight, width * 0.5));
    },

    getPercentage:function(){
        return this._percentage;
    },

    setInsetLeft: function(insetLeft) {
        this._insetLeft = insetLeft;

        var width = this.getContentSize().width * this._percentage / 100;
        this._sprite.setInsetLeft(Math.min(this._insetLeft, width * 0.5));
    },

    setInsetRight: function(insetRight) {
        this._insetRight = insetRight;

        var width = this.getContentSize().width * this._percentage / 100;
        this._sprite.setInsetRight(Math.min(this._insetRight, width * 0.5));
    },

    setInsetTop: function(insetTop) {
        this._sprite.setInsetTop(insetTop);
    },

    setInsetBottom: function(insetBottom) {
        this._sprite.setInsetBottom(insetBottom);
    },

    /**
     *
     * @param {float} [left]
     * @param {float} [right]
     * @param {float} [top]
     * @param {float} [bottom]
     */
    setCapInsets : function(left, top, right, bottom)
    {
        left   = left || 4;
        top    = top  || 4;
        right  = right || left;
        bottom = bottom || top;

        this.setInsetLeft(left);
        this.setInsetRight(right);
        this.setInsetTop(top);
        this.setInsetBottom(bottom);
    }

});

ProgressBar.prototype.setPercent = ProgressBar.prototype.setPercentage;
