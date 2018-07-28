/**
 * Created by Administrator on 2016/5/6.
 */
var MainController = cc.Class.extend({
    ctor: function() {

    }
});


//单例
MainController.instance = null;
MainController.getInstance = function() {
    if(!MainController.instance){
        MainController.instance = new MainController();
    }
    return MainController.instance;
};

/**
 * pushLayerToScene 当layer有onAppear和onDisappear方法时，会在合适的时候回调之
 * @param {*|cc.Layer} layer
 * @param {cc.Scene} scene
 * @param {boolean} [isDoAni]
 */
MainController.pushLayerToScene = function(layer, scene, isDoAni) {
    cc.log("---MainController.pushLayerToScene");
    var disappearLayer = null;
    var appearLayer = null;

    //MainController.getInstance()._showMaskLayer();

    // 找最顶端的Layer
    scene.sortAllChildren();

    //若当前层是全屏不透明layer则底部全屏的layer
    cc.log("layer.isFullScreenOpaque : "+layer.isFullScreenOpaque);
    if(layer.isFullScreenOpaque == true){
        for (var children = scene.getChildren(), i = children.length; i > 0; --i) {
            var child = children[i - 1];
            //隐藏上一个全屏layer
            if (child instanceof cc.Layer && child.isFullScreenOpaque == true) {
                cc.log("隐藏并unscheduleUpdate下一层全屏layer, layerName: "+child.layerName);
                child.runAction(cc.sequence(
                    cc.delayTime(POP_ANIMATION_TIME),
                    cc.callFunc(function(sender){
                        sender.setVisible(false);
                        sender.unscheduleUpdate();
                    })
                ));
                break;
            }
        }
    }


    for (var children = scene.getChildren(), i = children.length; i > 0; --i) {
        var child = children[i - 1];
        if (child instanceof cc.Layer) {
            disappearLayer = child;
            break;
        }
    }

    scene.addChild(layer);

    if (isDoAni || isDoAni == undefined) {
        layer.stopAllActions();
        layer.setScale(1,0);
        layer.runAction(cc.scaleTo(POP_ANIMATION_TIME,1,1).easing(cc.easeBackOut()));
    }
    // 找最顶端的Layer
    scene.sortAllChildren();
    for (var children = scene.getChildren(), i = children.length; i > 0; --i) {
        var child = children[i - 1];
        if (child instanceof cc.Layer) {
            appearLayer = child;
            break;
        }
    }

    if (layer == appearLayer) {  // push的在最顶端
        if (disappearLayer != null) {
            if (disappearLayer.onDisappear) {
                disappearLayer.onDisappear();
            }
        }

        if (layer.onAppear) {
            layer.onAppear();
        }
    }

    MainController.getInstance()._showMaskLayer();
};

/**
 * pushLayerToRunningScene 当RunningScene为null时，返回false
 * @param {cc.LayerColor|cc.Layer|*} layer
 * @param {boolean} [isDoAni]
 * @returns {boolean}
 */
MainController.pushLayerToRunningScene = function(layer, isDoAni) {
    var scene = cc.director.getRunningScene();
    if (scene && layer) {
        MainController.pushLayerToScene(layer, scene, isDoAni);
        return true;
    }
    return false;
};

/**
 * popLayerFromScene 当layer有onAppear和onDisappear方法时，会在合适的时候回调之
 * @param {*|cc.Layer|*} layer
 * @param {cc.Scene} scene
 */
MainController.popLayerFromScene = function(layer, scene) {
    var disappearLayer = null;
    var appearLayer = null;

    // 找最顶端的Layer
    scene.sortAllChildren();
    for (var children = scene.getChildren(), i = children.length; i > 0; --i) {
        var child = children[i - 1];
        if (child instanceof cc.Layer) {
            disappearLayer = child;
            break;
        }
    }

    scene.removeChild(layer, true);

    //若当前层是全屏不透明layer则显示下一个全屏layer
    if(layer.isFullScreenOpaque == true){
        for (var children = scene.getChildren(), i = children.length; i > 0; --i) {
            var child = children[i - 1];
            if (child instanceof cc.Layer && child.isFullScreenOpaque == true) {
                cc.log("显示全屏下一层全屏layer, layerName: "+child.layerName);
                child.setVisible(true);
                child.scheduleUpdate();
                break;
            }
        }
    }

    // 找最顶端的Layer
    scene.sortAllChildren();
    for (var children = scene.getChildren(), i = children.length; i > 0; --i) {
        var child = children[i - 1];
        if (child instanceof cc.Layer) {
            appearLayer = child;
            break;
        }
    }

    if (disappearLayer == layer) {  // pop的在最顶端
        if (layer.onDisappear != undefined && layer.onDisappear != null) {
            layer.onDisappear();
        }

        if (appearLayer != null) {
            if (appearLayer.onAppear != undefined && appearLayer.onAppear != null) {
                appearLayer.onAppear();
            }
        }
    }
};

/**
 * popLayerFromRunningScene 当RunningScene为null时，返回false
 * @param {cc.Layer | *} layer
 * @returns {boolean}
 */
MainController.popLayerFromRunningScene = function(layer) {
    var scene = cc.director.getRunningScene();
    if (scene != null) {
        MainController.popLayerFromScene(layer, scene);
        return true;
    }
    return false;
};

/**
 * 界面默认展开动画执行过程中，屏蔽所有点击
 * @private
 */
MainController.prototype._showMaskLayer = function(){
    if(!this._maskLayer){
        this._maskLayer = new cc.Layer();
        this._maskLayer.setContentSize(cc.winSize);
        //this._maskLayer.setBackGroundColorEx(cc.RED);
        this._maskLayer.retain();
        if(this._maskLayer instanceof ccui.Widget){
            this._maskLayer.setTouchEnabled(false);
        }else{
            this._maskLayer.setTouchEventEnabled(false);
        }

        this._maskLayer.setAnchorPoint(0, 0);
    }
    if(this._maskLayer && this._maskLayer.getParent()){
        this._maskLayer.removeFromParent(false);
    }
    cc.director.getRunningScene().addChild(this._maskLayer);
    this._maskLayer.stopAllActions();
    this._maskLayer.runAction(cc.sequence(
        cc.delayTime(POP_ANIMATION_TIME),
        cc.callFunc(function(selfTarget){
            selfTarget.removeFromParent(false);
            //todo 展开完毕,遮罩移除, is there any thing else?
        })
    ))
};

MainController.playButtonSoundEffect = function(sender)
{
    MainController.playEffect("res/sounds/bo.wav");
};