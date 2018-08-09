/**
 * Created by Administrator on 2017/2/20.
 */
var RoomModel = cc.Class.extend({
    _roomName: "房间最长七个字",
    _roomIntro: "请输入房间简介",
    _roomIdentity: 1001,                         //创建房间的身份
    _inviteFlag: false,                 //邀请权限，只有房主能设置而且默认是false
    _authFlag: true,                   //申请权限，只有房主和管理员能设置而且默认是true
    _memberDataArray: {},                       //成员数据数组
    _roomId:-1,                                  //房间ID
    _memberNum:1,                               //成员人数
    _memberNumMax:1,                            //成员人数上限
    _monthTradeAmount: 0,                       //交易量
    _hasApply:false,
    _isShowCreateBtn:false,

    ctor:function(jsonData) {
        this._roomIdentity = GB.ROOM_IDENTITY_STRANGER;
        if(jsonData)
            this.initFromJson(jsonData);
    },

    initFromJson:function(jsonData) {
        this._roomIntro = ALCommon.getValueWithKey(jsonData, "intro", this._roomIntro);
        this._roomIdentity = ALCommon.getValueWithKey(jsonData, "role", this._roomIdentity);
        this._inviteFlag = ALCommon.getValueWithKey(jsonData, "inviteFlag",  this._inviteFlag);
        this._authFlag = ALCommon.getValueWithKey(jsonData, "authFlag", this._authFlag);
        this._memberNum = ALCommon.getValueWithKey(jsonData, "memberNum", this._memberNum);
        this._memberNumMax = ALCommon.getValueWithKey(jsonData, "maxNum", this._memberNumMax);
        this._monthTradeAmount = ALCommon.getValueWithKey(jsonData, "monthTradeAmount", this._monthTradeAmount);
        this._hasApply = ALCommon.getValueWithKey(jsonData, "hasApply", this._hasApply);
        this._isShowCreateBtn = ALCommon.getValueWithKey(jsonData, "showCreateButton", this._isShowCreateBtn);

        this._memberDataArray = ALCommon.getArrayWithKey(jsonData, "memberList", this._memberDataArray, SimplePlayer);

        //适应下
        this._roomId = ALCommon.getValueWithKey(jsonData, "id", this._roomId);
        this._roomId = ALCommon.getValueWithKey(jsonData, "roomId", this._roomId);
        this._roomName = ALCommon.getValueWithKey(jsonData, "roomName", this._roomName);
        this._roomName = ALCommon.getValueWithKey(jsonData, "name", this._roomName);
    }
});

RoomModel.prototype.destroy = function(){
    this._roomName = "";
    this._roomIntro = "";
    this._roomIdentity = null;
    this._inviteFlag = null;
    this._authFlag = null;
    this._memberDataArray = null;
    this._roomId = null;
    this._memberNum = null;
    this._memberNumMax = null;
    this._monthTradeAmount = null;
};

RoomModel.prototype.getRoomName = function(){
    return this._roomName;
};

RoomModel.prototype.getName = function(){
    return this._roomName;
};

RoomModel.prototype.getIntro = function(){
    return this._roomIntro;
};

RoomModel.prototype.getRoomIdentity = function(){
    return this._roomIdentity;
};

RoomModel.prototype.getInviteFlag = function(){
    return this._inviteFlag;
};

RoomModel.prototype.hasApply = function(){
    return this._hasApply;
};

RoomModel.prototype.getAuthFlag = function(){
    return this._authFlag;
};

RoomModel.prototype.getRoomMemberDataArray = function(){
    return this._memberDataArray;
};

RoomModel.prototype.getRoomId = function(){
    return this._roomId;
};

RoomModel.prototype.getNum = function(){
    return this._memberNum;
};

RoomModel.prototype.getMaxNum = function(){
    return this._memberNumMax;
};

//set方法
RoomModel.prototype.setRoomName = function(roomName){
    this._roomName = roomName;
};

RoomModel.prototype.setRoomIdentity = function(roomIdentity){
    this._roomIdentity = roomIdentity;
};

RoomModel.prototype.setRoomId = function(roomId){
    this._roomId = roomId;
};

RoomModel.prototype.setMemberNum = function(memberNum){
    this._memberNum = memberNum;
};

RoomModel.prototype.isShowCreateBtn = function(roomId){
    return this._isShowCreateBtn;
};

RoomModel.prototype.setShowCreateBtn= function(value){
    this._isShowCreateBtn = value;
};

/**
 房间选择Cell
 */
var RoomChooseCellModel = cc.Class.extend({
    _simplePlayer:undefined,                             //头像数据
    _roomName: "房间名字七个字",                      //房间名字数据
    _memberNum: "120",                         //当前房间成员数量
    _maxNum: "120",                         //房间成员数量上限
    _monthTradeAmount: "99999999",                        //房间交易量总额
    _intro: "房间简介",                               //房间简介
    _roomId: undefined,                                  //房间ID
    _hasApply: false,                                   //是否显示申请按钮
    _canShare: false,                                   //能否分享
    _isMember: false,                                   //是否是该房间的成员
    _parentNode: undefined,                             //父节点

    ctor:function(jsonData) {
        if(jsonData)
            this.initFromJson(jsonData);
    },

    initFromJson:function(jsonData) {
        this._roomName = ALCommon.getValueWithKey(jsonData, "name", this._roomName);
        this._memberNum = ALCommon.getValueWithKey(jsonData, "memberNum",  this._memberNum);
        this._maxNum = ALCommon.getValueWithKey(jsonData, "maxNum",  this._maxNum);
        this._monthTradeAmount = ALCommon.getValueWithKey(jsonData, "monthTradeAmount", this._monthTradeAmount);
        this._intro = ALCommon.getValueWithKey(jsonData, "intro", this._intro);
        this._roomId = ALCommon.getValueWithKey(jsonData, "id", this._roomId);
        this._hasApply = ALCommon.getValueWithKey(jsonData, "hasApply", this._hasApply);
        this._canShare = ALCommon.getValueWithKey(jsonData, "canShare", this._canShare);
        this._isMember = ALCommon.getValueWithKey(jsonData, "isMember", this._isMember);
        this._simplePlayer = ALCommon.getClassObjectWithKey(jsonData, "owner", this._simplePlayer, SimplePlayer);
    }
})

//get方法
RoomChooseCellModel.prototype.getParentNode = function(){
    return this._parentNode;
};
RoomChooseCellModel.prototype.getIsMember = function(){
    return this._isMember;
};
RoomChooseCellModel.prototype.getCanShare = function(){
    return this._canShare;
};
RoomChooseCellModel.prototype.getSimplePlayer = function(){
    //cc.log("RoomChooseCellModel getSimplePlayer ::", this._simplePlayer.getId());
    return this._simplePlayer;
};
RoomChooseCellModel.prototype.getRoomName = function(){
    return this._roomName;
};
RoomChooseCellModel.prototype.getMemberNum = function(){
    return this._memberNum;
};
RoomChooseCellModel.prototype.getMaxNum = function(){
    return this._maxNum;
};
RoomChooseCellModel.prototype.getMonthTradeAmount = function(){
    return this._monthTradeAmount;
};

RoomChooseCellModel.prototype.getIntro = function(){
    return this._intro;
};

RoomChooseCellModel.prototype.setIntro = function(value){
    this._intro = value;
};

RoomChooseCellModel.prototype.getRoomId = function(){
    return this._roomId;
};
RoomChooseCellModel.prototype.getHasApply = function(){
    return this._hasApply;
};

//set方法
RoomChooseCellModel.prototype.setParentNode = function(value){
    this._parentNode = value;
};
RoomChooseCellModel.prototype.setRoomName = function(value){
    this._roomName = value;
};
RoomChooseCellModel.prototype.setMemberNum = function(value){
    this._memberNum = value;
};

RoomChooseCellModel.prototype.setRoomId = function(value){
    this._roomId = value;
};
RoomChooseCellModel.prototype.setHasApply = function(value){
    this._hasApply = value;
};

/**
 * 房间申请数据模块
 */
var RoomApplyCellModel = cc.Class.extend({
    _isApproved:true,                                  //申请是否通过
    _simplePlayer:undefined,                           //头像数据
    _roomName: "申请加入陈老师的房间",                  //房间名称
    _roomId:undefined,                                         //房间ID
    ctor:function(jsonData) {
        if(jsonData)
            this.initFromJson(jsonData);
    },

    initFromJson:function(jsonData) {
        this._roomName = ALCommon.getValueWithKey(jsonData, "roomName", this._roomName);
        this._roomId = ALCommon.getValueWithKey(jsonData, "roomId", this._roomId);
        this._simplePlayer = ALCommon.getClassObjectWithKey(jsonData, "user", this._simplePlayer, SimplePlayer);
        this._isApproved = ALCommon.getValueWithKey(jsonData, "isApproved", this._isApproved);
    }
});

//get方法
RoomApplyCellModel.prototype.getSimplePlayer = function(){
    return this._simplePlayer;
};

RoomApplyCellModel.prototype.getRoomId = function(){
    return this._roomId;
};

RoomApplyCellModel.prototype.getRoomName = function(){
    return this._roomName;
};

RoomApplyCellModel.prototype.getIsApproved = function(){
    return this._isApproved;
};

//set方法
RoomChooseCellModel.prototype.setSimplePlayer = function(simplePlayer){
    this._simplePlayer = simplePlayer;
};
RoomChooseCellModel.prototype.setRoomId = function(roomId){
    this._roomId = roomId;
};
RoomChooseCellModel.prototype.setRoomName = function(roomName){
    this._roomName =roomName
};
RoomChooseCellModel.prototype.setIsApproved = function(isApproved){
    this._isApproved = isApproved;
};

//玩家申请消息反馈模块
var UserApplicantHintCellModel = cc.Class.extend({
    _isApproved:true,                                    //申请是否通过
    _roomName: "陈老师的房间",                            //房间名称
    _roomId:undefined,                                        //房间ID
    ctor:function(jsonData) {
        if(jsonData)
            this.initFromJson(jsonData);
    },

    initFromJson:function(jsonData) {
        this._roomName = ALCommon.getValueWithKey(jsonData, "roomName", this._roomName);
        this._roomId = ALCommon.getValueWithKey(jsonData, "roomId", this._roomId);
        this._isApproved = ALCommon.getValueWithKey(jsonData, "isApproved", this._isApproved);
    }
});

UserApplicantHintCellModel.prototype.getRoomId = function(){
    return this._roomId;
};
UserApplicantHintCellModel.prototype.getRoomName = function(){
    return this._roomName;
};
UserApplicantHintCellModel.prototype.getIsApproved = function(){
    return this._isApproved;
};


UserApplicantHintCellModel.prototype.setRoomId = function(roomId){
    this._roomId = roomId;
};
UserApplicantHintCellModel.prototype.setRoomName = function(roomName){
    this._roomName = roomName
};
UserApplicantHintCellModel.prototype.setIsApproved = function(isApproved){
    this._isApproved = isApproved;
};
