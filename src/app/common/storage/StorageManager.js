/**
 * 数据缓存管理器
 * Created by lex on 2016/12/06.
 */
var storageItems = {
    UPDATELIST : "IUpdateList"
};
var StorageManager = cc.Class.extend({
    m_inst: null, //实例
    _storage : {},

    ctor : function(){
        for(var key in storageItems){
            this._storage[key] = eval("new " + storageItems[key] + "()");
        }
    },

    updateIData : function(key, data){
        if(this._storage[key]){
            this._storage[key].update(data);
        }
    },

    getIData : function(key){
        return this._storage[key];
    }
});

//获取实例
StorageManager.getInstance = function() {
    if (StorageManager.m_inst == null) {
        StorageManager.m_inst = new StorageManager();
    }
    return StorageManager.m_inst;
};
