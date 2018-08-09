/**
 * 加载中的动画
 * Created by 玲英 on 2016/8/26.
 */

var  LoadingCircle = ccui.Widget.extend({

    ctor:function()
    {
        this._super();
        var bgSprite = new cc.Sprite("#animation_loading_small_gray.png");
        var rotateSprite = this._rotateSprite = new cc.Sprite("#animation_loading_small_blue.png");

        this.setContentSize(bgSprite.getContentSize());
        this.addChild(bgSprite);
        bgSprite.setPos(centerInner(this), ANCHOR_CENTER);

        bgSprite.addChild(rotateSprite);
        rotateSprite.setPos(centerInner(bgSprite), ANCHOR_CENTER);

        //
        this._rotateCounter = 0;

        this.startLoading();
    },

    update:function(dt){
        this._rotateCounter += dt;
        if(this._isAllowLoading && this._rotateCounter > 0.1)
        {
            this.doRotation();
            this._rotateCounter = 0;
        }

    },

    doRotation:function()
    {
        var originRotation = this._rotateSprite.getRotation();
        if(originRotation >= 360)
            originRotation = 0;
        //每次在原来的基础上旋转45度
        this._rotateSprite.setRotation(originRotation + 45);
    },

    /**
     * 启动loading
     */
    startLoading:function()
    {
        this._isAllowLoading = true;
        this.doRotation();
        this.scheduleUpdate();
    }
});
