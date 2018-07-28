/**
 * Created by Administrator on 2016/5/6.
 */

var InitScene = cc.Scene.extend({
    ctor: function ()
    {
        this._super();

        this.setonEnterTransitionDidFinishCallback(function() {
            //todo 可能需要添加的底层初始化
            //sg.BPFlashSprite.setIsPlaySound(true);

            //是否进入测试场景
            if (TO_TEST_CASE)
            {
                cc.director.runScene(new cc.TransitionFade(0.5, new TestViewScene(), cc.BLACK));
            }
            else
            {
                //
                this.connectAndEnterTitleScene();
            }
        }.bind(this));
    },

    connectAndEnterTitleScene: function() {
        cc.log("---- InitScene connectAndEnterTitleScene");
        this.runAction(new cc.Sequence(new cc.DelayTime(0.2), cc.callFunc(function() {
            cc.director.runScene(new cc.TransitionFade(0.5, new TitleScene(), cc.BLACK));
        }.bind(this))));
    },

    cleanup:function(){
        cc.log("======cleanup");
        this._super();
    }
});