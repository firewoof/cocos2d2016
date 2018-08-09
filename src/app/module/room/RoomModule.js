/**
 * Created by Administrator on 2017/2/20.
 */
var RoomModule =  cc.Class.extend({
    m_inst : undefined, //实例
    //_model : undefined,
    _controller : undefined,
    _view : undefined,

    ctor : function() {
        cc.log("module");
        //this._model = new RoomModel();
        this._controller = new RoomController();
        //this._view = new RoomView(this._model, this._controller);
    },

    //showManager : function (roomId) {
    //    this._controller.showManager(roomId);
    //},
    //
    //showCreate : function () {
    //    this._controller.showCreate();
    //},

    showChoose : function () {
        this._controller.showChoose();
    },

    popAllView:function(){
        this._controller.popAllView();
    },

    //showFind : function () {
    //    this._controller.showFind();
    //},
    //
    //showApply: function(){
    //    this._controller.showApply();
    //},
    //
    //showShare: function(){
    //    this._controller.showShare();
    //},

    destroy : function(){
        //if(this._model){
        //    this._model.destroy();
        //    this._model = null;
        //}
        //if(this._view){
        //    this._view.destroy();
        //    this._view = null;
        //}
        if(this._controller){
            this._controller.destroy();
            this._controller = null;
        }
    }
});

//获取实例
RoomModule.getInstance = function() {
    if (RoomModule.m_inst == null) {
        RoomModule.m_inst = new RoomModule();
    }
    return RoomModule.m_inst;
};