/**
 * Created by Administrator on 2016/5/6.
 */

//走测试流程
TO_TEST_CASE = true;
//TO_TEST_CASE = false;

//着色器
var ShaderFileNames = {
    VERTEX_SHADER_DEFAULT: "res/shaderFiles/default.vsh",
    FRAGMENT_SHADER_WHITE: "res/shaderFiles/white.fsh"     //泛白
};

//font
var FONT_ARIAL_BOLD = "Arial-BoldMT";

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

