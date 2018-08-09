/**
 * Created by Administrator on 2016/12/19.
 */
var FeatureInfo = cc.Class.extend({
    _featureName:"",       //功能名字
    _isEnabled:false,     //功能能否使用
    _menuImageSrc:"",      //功能图标资源
    _id: 0,                //功能ID
    _informationNum: 0,    //功能消息数量
    _associateLayerName:undefined,
    _isOpenClean:false,


   ctor:function(jsonData) {
       if(jsonData)
        this.initFromJson(jsonData);
   },

    initFromJson:function(jsonData) {
        this._featureName = ALCommon.getValueWithKey(jsonData, "featureName", this._featureName);
        this._isEnabled = ALCommon.getValueWithKey(jsonData, "isEnabled", this._isEnabled);
        this._menuImageSrc = ALCommon.getValueWithKey(jsonData, "menuImageSrc", this._menuImageSrc);
        this._id = ALCommon.getValueWithKey(jsonData, "id",  this._id);
        this._informationNum = ALCommon.getValueWithKey(jsonData, "informationNum", this._informationNum);
    }

});

/**
 *
 * @returns {string|FunctionInfo._name}
 */
FeatureInfo.prototype.getFeatureName = function(){
    return this._featureName;
};

/**
 *
 * @returns {boolean|FunctionInfo._isEnabled}
 */
FeatureInfo.prototype.getIsEnabled = function(){
    return this._isEnabled;
};

/**
 *
 * @returns {string|FunctionInfo._menuImageSrc}
 */
FeatureInfo.prototype.getMenuImageSrc = function(){
    return this._menuImageSrc;
};

/**
 *
 * @returns {number}
 */
FeatureInfo.prototype.getFeatureId = function(){
    return this._id;
};

/**
 *
 * @returns {number}
 */
FeatureInfo.prototype.getInformationNum = function(){
    return this._informationNum;
}

/**
 *
 * @param name
 */
FeatureInfo.prototype.setFeatureName = function(name){
    this._featureName = name;
};

/**
 *
 * @param isEnabled
 */
FeatureInfo.prototype.setIsEnabled = function(isEnabled){
    this._isEnabled = isEnabled;
};

/**
 *
 * @param menuImageSrc
 */
FeatureInfo.prototype.setMenuImageSrc = function(menuImageSrc){
    this._menuImageSrc = menuImageSrc;
};

/**
 *
 * @param id
 */
FeatureInfo.prototype.setFeatureId =  function(id){
    this._id = id;
};

/**
 *
 * @param informationNum
 */
FeatureInfo.prototype.setInformationNum =  function(informationNum){
    this._informationNum = informationNum;
};

FeatureInfo.prototype.getAssociateLayerName =  function(){
    return this._associateLayerName;
};

FeatureInfo.prototype.setAssociateLayerName =  function(value){
    this._associateLayerName = value;
};

FeatureInfo.prototype.getOpenClean =  function(){
    return this._isOpenClean;
};

FeatureInfo.prototype.setOpenClean =  function(value){
    this._isOpenClean = value;
};

