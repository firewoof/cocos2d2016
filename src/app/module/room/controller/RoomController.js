/**
 * Created by Administrator on 2017/2/20.
 */
var RoomController = cc.Class.extend({

    ctor : function(model){
        this._model = model;
    },

    destroy:function(){

    },

    popAllView:function(){
        MainController.popLayerFromRunningScene(RoomFindView.instance);
        MainController.popLayerFromRunningScene(RoomChooseView.instance);
        MainController.popLayerFromRunningScene(RoomFindView.instance);
        MainController.popLayerFromRunningScene(RoomCreateView.instance);
        MainController.popLayerFromRunningScene(RoomManagementView.instance);
    }
});

RoomController.prototype.showManager = function(roomInfo){
    var layer = new RoomManagementView(this, roomInfo);
    MainController.pushLayerToRunningScene(layer);
};

RoomController.prototype.showCreate = function(){
    var layer = new RoomCreateView(this);
    MainController.pushLayerToRunningScene(layer);
};

RoomController.prototype.showChoose = function(){
    var layer = new RoomChooseView(this);
    MainController.pushLayerToRunningScene(layer);
};

RoomController.prototype.showFind = function(){
    var layer = new RoomFindView(this);
    MainController.pushLayerToRunningScene(layer);
};

RoomController.prototype.showApply = function(){
    var layer = new RoomApplyView(this);
    MainController.pushLayerToRunningScene(layer);
};

RoomController.prototype.showShare = function(roomId){
    if (null == this._shareView) {
        var view = this._shareView = new RoomShareView(this);
        MainController.pushLayerToRunningScene(view);
        view.setLocalZOrder(9);
    }
    this._shareView.show();
    if(roomId){
        this._shareView.setRoomId(roomId);
    }
};