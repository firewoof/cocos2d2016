
/**
 * Created by Jony on 2016/12/1.
 */
var MailInfo = cc.Class.extend({
    _id:0,               //邮件id
    _sendTime:"",        //发送时间
    _receiverId: "",     //接收者id
    _type:0,             //邮件类型
    _readed: false,      //是否已读
    _title:"",           //标题
    _titleContent:"",        //一级内容
    _detailContent:"",        //二级内容
    _selected: false,
    _showSelected: false,

   ctor:function(jsonData)
   {
       if(jsonData)
        this.initFromJson(jsonData);
   },

    initFromJson:function(jsonData)
    {
        this._id           = ALCommon.getValueWithKey(jsonData, "id", this._id);
        var sendTime       = ALCommon.getValueWithKey(jsonData, "sendTime", this._sendTime);
        this._sendTime     = TimeHelper.formatMilliSec(sendTime, "yy/MM/dd HH:mm:ss");
        this._receiverId   = ALCommon.getValueWithKey(jsonData, "receiverId", this._receiverId);
        this._type         = ALCommon.getValueWithKey(jsonData, "type", this._type);
        this._readed       = ALCommon.getValueWithKey(jsonData, "readed", this._readed);
        this._title        = ALCommon.getValueWithKey(jsonData, "title", this._title);
        this._titleContent     = ALCommon.getValueWithKey(jsonData, "titleContent", this._titleContent);
        this._detailContent     = ALCommon.getValueWithKey(jsonData, "detailContent", this._detailContent);
    }
});

MailInfo.RECHARGE_SUCCESS  = 3;
MailInfo.RECHARGE_FAIL  = 4;
MailInfo.WITHDRAW_SUCCESS = 5;
MailInfo.WITHDRAW_FAIL = 6;    //

MailInfo.prototype.getId = function()
{
    return this._id;
};

MailInfo.prototype.setId = function(value)
{
    this._id = value;
};

MailInfo.prototype.getSendTime = function()
{
    return this._sendTime;
};

MailInfo.prototype.getReceiverId = function()
{
    return this._receiverId;
};

MailInfo.prototype.getType = function()
{
    return this._type;
};

MailInfo.prototype.setType = function(value)
{
    this._type = value;
};


MailInfo.prototype.getTypeTxt = function()
{
    return this._type;
};

MailInfo.prototype.isReaded = function()
{
    return this._readed;
};

MailInfo.prototype.setReaded = function(b)
{
    this._readed = b;
};

MailInfo.prototype.getTitle = function()
{
    return this._title;
};

MailInfo.prototype.getTitleContent = function()
{
    return this._titleContent;
};

MailInfo.prototype.getDetailContent = function()
{
    return this._detailContent;
};

MailInfo.prototype.setSelected = function(b)
{
    this._selected = b;
};

MailInfo.prototype.isSelected = function()
{
    return this._selected;
};

MailInfo.prototype.setShowSelectedBox = function(b)
{
    this._showSelected = b;
};

MailInfo.prototype.isShowSelectedBox = function()
{
    return this._showSelected;
};





/**
 * Created by Jony on 2016/8/18.
 */
var MailManager = cc.Class.extend({
    _mailArray: [],
    _idArray: [],
    _maxCount: 0, //邮件最大数量

    ctor:function()
    {
        //for(var i=0;i<8;i++)
        //{
        //    var mail = new MailInfo();
        //    mail.setId(7-i);
        //    mail.setType(3);
        //    this._mailArray.push(mail);
        //}
    }
});

/**
 * @returns {MailManager}
 */
MailManager.getInstance = function()
{
    if(!this._instance)
    {
        //cc.log("============new MailManager instance=========================");
        this._instance = new MailManager();
    }
    return this._instance;
};

/**
 * 初始化邮件列表
 */
MailManager.prototype.initFromJson = function(jsonData)
{
    //this._maxCount = jsonData["maxCount"];
    //for(var i=0;i<jsonData.length;i++)
    //{
    //    var mail = new MailInfo(jsonData[i]);
    //    this._mailArray.push(mail);
    //}
};

MailManager.reset = function()
{
    this._instance = null;
};

/**
 * 清理数据
 */
MailManager.prototype.cleanMailData = function()
{
   this._mailArray.length = 0;
   this._idArray.length = 0;
};

/**
 * 插入邮件
 */
MailManager.prototype.add = function(jsonData, type)
{
    //this._mailArray.unshift(new MailInfo(jsonData));
    if(type == "history")
    {
        for(var i=0;i<jsonData.length;i++)
        {
            var mail = new MailInfo(jsonData[i]);
            this._mailArray.push(mail);
        }
    }
    else if(type == "new")
    {
        for(var i = jsonData.length-1; i>=0; i--)
        {
            this._mailArray.unshift(new MailInfo(jsonData[i]));
        }
    }
};

/**
 * 删除邮件列表
 */
MailManager.prototype.delete = function(idArray)
{
    idArray.sort();
    cc.log("idArray: "+ JSON.stringify(idArray))
    var index = 0;
    for(var i = this._mailArray.length-1; i>=0; i--)
    {
        if(this._mailArray[i].getId() == idArray[index])
        {
            cc.log("删除邮件id："+idArray[index])
            this._mailArray.splice(i,1);
            index += 1;
            if(index == idArray.length)
                break;
        }
    }
};

/**
 * 显示邮件列表
 * @returns {Array}
 */
MailManager.prototype.getMailArray = function()
{
    return this._mailArray;
};

/**
 * 显示邮件列表
 * @returns {Array}
 */
MailManager.prototype.getSelectedIdArray = function()
{
    return this._idArray;
};


/**
 * 邮件数量
 * @returns {string}
 */
MailManager.prototype.getMailNum = function()
{
    return this._mailArray.length;
};


