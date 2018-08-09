/**
 * 登录 view
 */


ClientLoginView = cc.Class.extend({
    ctor : function(model, controller){
        this._model = model;
        this._controller = controller;
        this._view = null;
        this._popup = null;
    }
});

ClientLoginView.prototype.show = function(callBack){
    var loginScene = new cc.Scene();
    cc.director.runScene(loginScene);

    //runScene 要到下一帧才起作用
    setTimeout(function(){
        //背景
        //var bgLayer = new cc.Layer();
        //var bgSprite = new cc.Sprite("bg_register.jpg");
        //bgLayer.addChild(bgSprite);
        //bgSprite.setPos(cc.pCenter(cc.winSize), ANCHOR_CENTER);
        var animationView =  new  LoginAnimationView();
        MainController.pushLayerToRunningScene(animationView);

        callBack();
    }.bind(this));
};

ClientLoginView.prototype.showLoading = function(){
    var loadingLayer = this._view = new LoadingLayer();
    MainController.pushLayerToRunningScene(loadingLayer)
};

ClientLoginView.prototype.showPopup = function(content, callBack){
    var layer = MainController.getAlertLayer(content);
    layer.setMaskTouchEnabled(false);
    layer.setOkButtonCallFunc(callBack);
    MainController.pushLayerToRunningScene(layer);
};

ClientLoginView.prototype.showInvitation = function(){
    var layer = new LoginInvitationView();
    MainController.pushLayerToRunningScene(layer);
};

ClientLoginView.prototype.showLoginType = function(){
    var layer = new LoginTypeLayer();
    MainController.pushLayerToRunningScene(layer);
};

ClientLoginView.prototype.destroy = function(){
    if(this._view){
        this._view.removeFromParent(true);
        this._view = null;
    }
    if(this._popup){
        this._popup.removeFromParent(true);
        this._popup = null;
    }
};

ClientLoginView.prototype.onShowLoadingPercentView = function(value){
    if (this._view) {
        this._view.updateProgress(value);
    }
};