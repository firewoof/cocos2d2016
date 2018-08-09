/**
 * Created by Administrator on 2017-05-10.
 */

//_idCardFrontUrl:undefined,  //身份证正面url
//    _idCardBackUrl:undefined,   //身份证反面
var RemoteStorage = cc.Class.extend({
    _hasUploadedCard:false,        //是否上传过身份证

    ctor:function(jsonData){
        if(jsonData){
            this.initFromJson(jsonData);
        }
    },

    initFromJson:function(jsonData){
        this._hasUploadedCard    = ALCommon.getValueWithKey(jsonData, "hasUploadedCard", this._hasUploadedCard);
    },

    saveToRemote:function(){
        HttpManager.requestSaveUserConfig(function(){
            cc.log("save success");
        }, this.toJson());
    },

    loadStorage:function(){
        HttpManager.requestLoadUserConfig(function(data){
            if(data["value"].trim().startsWith("{")){
                var data = JSON.parse(data["value"]);
                cc.log("data::", JSON.stringify(data));
                this.initFromJson(data);
            }else{
                cc.log("LoadUserConfig data ignore");
            }
        }.bind(this))
    }
});

RemoteStorage.prototype.hasUploadedCard = function(){
    return this._hasUploadedCard;
};

RemoteStorage.prototype.setHasUploadedCard = function(value){
    this._hasUploadedCard = value;
};

RemoteStorage.prototype.toJson = function(){
    var json = {};
    for(var prop in this){
        var value = this[prop];
        if(value instanceof Function || prop.startsWith("__"))
            continue;
        cc.log("prop::", prop);
        prop = prop.replace("_", "");
        json[prop] = value
    }
    return json;
};

var  remoteStorge = new RemoteStorage();
cc.log("remoteStorge::", JSON.stringify(remoteStorge.toJson()));

RemoteStorage.getInstance = function(){
    if(!RemoteStorage._instance_){
        RemoteStorage._instance_ = new RemoteStorage();
    }
    return RemoteStorage._instance_;
};