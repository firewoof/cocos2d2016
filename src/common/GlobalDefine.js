/**
 * 全局定义
 * Created by Administrator on 2016/5/6.
 */

//dump系统信息
cc.sys.dump();

//走测试流程
TO_TEST_CASE = false;
if(cc.sys.isMobile)
{
    TO_TEST_CASE = false;
}
else
{
    TO_TEST_CASE = true;
}

//着色器
var ShaderFileNames = {
    VERTEX_SHADER_DEFAULT: "res/shaderFiles/default.vsh"
    ,FRAGMENT_SHADER_WHITE: "res/shaderFiles/white.fsh"      //泛白
    ,FRAGMENT_SHADER_NORMAL: "res/shaderFiles/normal.fsh"    //正常
    ,FRAGMENT_SHADER_GRAY: "res/shaderFiles/gray.fsh"        //灰化
};

//font
//var FONT_ARIAL_BOLD = "Arial-BoldMT";
var FONT_ARIAL_BOLD = "Arial";

//push一个界面做展开动画的时间
var POP_ANIMATION_TIME = 0.3;

var ANCHOR_LEFT_BOTTOM = cc.p(0,0);
var ANCHOR_BOTTOM = cc.p(0.5,0);
var ANCHOR_RIGHT_BOTTOM = cc.p(1,0);
var ANCHOR_LEFT = cc.p(0,0.5);
var ANCHOR_CENTER = cc.p(0.5,0.5);
var ANCHOR_RIGHT = cc.p(1,0.5);
var ANCHOR_LEFT_TOP = cc.p(0,1);
var ANCHOR_TOP = cc.p(0.5,1);
var ANCHOR_RIGHT_TOP = cc.p(1,1);

function leftTopInner(node)    {return cc.p(0,node.getContentSize().height);};
function leftInner(node)       {return cc.p(0,node.getContentSize().height/2);};
function rightTopInner(node)   {return cc.p(node.getContentSize().width, node.getContentSize().height);};
function rightInner(node)          {return cc.p(node.getContentSize().width,node.getContentSize().height/2);};
function topInner(node)        {return cc.p(node.getContentSize().width/2,node.getContentSize().height);};
function leftBottomInner(node) {return cc.p(0,0);};
function rightBottomInner(node)    {return cc.p(node.getContentSize().width,0);};
function bottomInner(node)     {return cc.p(node.getContentSize().width/2,0);};
function centerInner(node)     {return cc.p(node.getContentSize().width/2,node.getContentSize().height/2);};

function leftTopOutter(node)    {var rect=node.getBoundingBox();return cc.p(rect.x,rect.y+rect.height);};
function leftOutter(node)       {var rect=node.getBoundingBox();return cc.p(rect.x,rect.y+rect.height/2);};
function rightTopOutter(node)   {var rect=node.getBoundingBox();return cc.p(rect.x+rect.width,rect.y+rect.height);};
function rightOutter(node)      {var rect=node.getBoundingBox();return cc.p(rect.x+rect.width,rect.y+rect.height/2)};
function topOutter(node)        {var rect=node.getBoundingBox();return cc.p(rect.x+rect.width/2,rect.y+rect.height);};
function leftBottomOutter(node) {var rect=node.getBoundingBox();return cc.p(rect.x,rect.y);};
function rightBottomOutter(node){var rect=node.getBoundingBox();return cc.p(rect.x+rect.width,rect.y);};
function bottomOutter(node)     {var rect=node.getBoundingBox();return cc.p(rect.x+rect.width/2,rect.y);};
function centerOutter(node)     {var rect=node.getBoundingBox();return cc.p(rect.x+rect.width/2,rect.y+rect.height/2);};

function adaptiveSizeWidth(num) {return num * cc.winSize.width / 1334.0};
function adaptiveSizeHeight(num) {return num * cc.winSize.height / 750.0};

//是否是测试服 默认值
var isTestServer = false;

// 教育版本
var isEducationVersion =       false;

// 房间系统
var isRoomSysEnabled = false;
if(buildVersion == BUILDVERSION_DEVELOP){
    isTestServer = true;
    isRoomSysEnabled = true;
}

// 支付配置自定义scheme
var isNeedSetPayScheme = true;

/*
@ DataPool:全局数据池---退出会清空
*/
var DataPool = DataPool || {};
var DP = DataPool;
DataPool.logArr = [];
DataPool.logs = [];

//放一些简单的枚举,变量什么的， 防止污染全局的域--退出不会清空
var GB = GB || {};

//http请求详情日志
var HTTP_LOG_ENABLED = true;

//货币符号
var MONEY_SIGN  = "¥";

// 默认渠道号
var DEFAULT_CHANNEL = "1";   // 全城交易

//以下代码请放在最后
if(isEducationVersion){
    MONEY_SIGN = "";
}

GB.isSplitLoginModel = true;    //分流登录模式
//---------storage 存储-----------
GB.ST_INVITATION_CODE  = "invitationCode";     //邀请码
GB.ST_INVITATION_MAP_STR  = "invitationMapStr";//邀请码map
GB.ST_SERVER_ADDR =  "serverAddr";             //服务器地址
GB.ST_ACCOUNT =  "account";                    //登录账户(phoneNumber/openId)
GB.ST_PASSWORD =  "password";                  //登录密码(由服务器下发)
GB.ST_PLATFORM =  "platform";                  //Phone?手机还是第三方
GB.ST_UUID = "UUID";                           //客户端生成的唯一id
