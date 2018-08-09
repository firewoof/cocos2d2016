/**
 * Created by Administrator on 2017/2/20.
 */

var RoomView = cc.Class.extend({
    ctor:function(model, controller)
    {
        this._model = model;
        this._controller = controller;
        this._view = null;
        this._popup = null;
    }
});


RoomView.prototype.destroy = function(){
    if(this._view){
        MainController.popLayerFromRunningScene(RoomFindView.instance);
        MainController.popLayerFromRunningScene(RoomChooseView.instance);
        MainController.popLayerFromRunningScene(RoomFindView.instance);
        MainController.popLayerFromRunningScene(RoomCreateView.instance);
        MainController.popLayerFromRunningScene(RoomManagementView.instance);
        this._view = null;
    }
    if(this._shareView){
        MainController.popLayerFromRunningScene(this._shareView);
        this._shareView = null;
    }
};

