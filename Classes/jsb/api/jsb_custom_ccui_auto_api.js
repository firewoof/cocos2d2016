/**
 * @module cocos2dx_ui_custom
 */
var ccui = ccui || {};

/**
 * @class RichElementEx
 */
ccui.RichElementEx = {

/**
 * @method getColor
 * @return {color3b_object}
 */
getColor : function (
)
{
    return cc.Color3B;
},

/**
 * @method getType
 * @return {ccui.RichElementEx::Type}
 */
getType : function (
)
{
    return 0;
},

/**
 * @method setClickCallback
 * @param {function} arg0
 */
setClickCallback : function (
func 
)
{
},

/**
 * @method init
 * @param {int} arg0
 * @param {color3b_object} arg1
 * @param {unsigned char} arg2
 * @return {bool}
 */
init : function (
int, 
color3b, 
char 
)
{
    return false;
},

/**
 * @method getClickCallback
 * @return {function}
 */
getClickCallback : function (
)
{
    //return std::function<void (cocos2d::Ref , cocos2d::Ref )>;
},

/**
 * @method getOpacity
 * @return {unsigned char}
 */
getOpacity : function (
)
{
    return 0;
},

/**
 * @method getTag
 * @return {int}
 */
getTag : function (
)
{
    return 0;
},

/**
 * @method RichElementEx
 * @constructor
 */
RichElementEx : function (
)
{
}

};

/**
 * @class RichElementTextEx
 */
ccui.RichElementTextEx = {

/**
 * @method disableOutline
 */
disableOutline : function (
)
{
},

/**
 * @method getFontSize
 * @return {float}
 */
getFontSize : function (
)
{
    return 0;
},

/**
 * @method enableOutline
 * @param {color3b_object} arg0
 * @param {float} arg1
 */
enableOutline : function (
color3b, 
float 
)
{
},

/**
 * @method disableUnderline
 */
disableUnderline : function (
)
{
},

/**
 * @method getText
 * @return {String}
 */
getText : function (
)
{
    return ;
},

/**
 * @method init
 * @param {int} arg0
 * @param {color3b_object} arg1
 * @param {unsigned char} arg2
 * @param {String} arg3
 * @param {String} arg4
 * @param {float} arg5
 * @return {bool}
 */
init : function (
int, 
color3b, 
char, 
str, 
str, 
float 
)
{
    return false;
},

/**
 * @method enableUnderline
 */
enableUnderline : function (
)
{
},

/**
 * @method getFontName
 * @return {String}
 */
getFontName : function (
)
{
    return ;
},

/**
 * @method create
 * @param {int} arg0
 * @param {color3b_object} arg1
 * @param {unsigned char} arg2
 * @param {String} arg3
 * @param {String} arg4
 * @param {float} arg5
 * @return {ccui.RichElementTextEx}
 */
create : function (
int, 
color3b, 
char, 
str, 
str, 
float 
)
{
    return ccui.RichElementTextEx;
},

/**
 * @method RichElementTextEx
 * @constructor
 */
RichElementTextEx : function (
)
{
}

};

/**
 * @class RichElementImageEx
 */
ccui.RichElementImageEx = {

/**
 * @method setScaleY
 * @param {float} arg0
 */
setScaleY : function (
float 
)
{
},

/**
 * @method setScaleX
 * @param {float} arg0
 */
setScaleX : function (
float 
)
{
},

/**
 * @method setScale
* @param {float|float} float
* @param {float} float
*/
setScale : function(
float,
float 
)
{
},

/**
 * @method init
 * @param {int} arg0
 * @param {color3b_object} arg1
 * @param {unsigned char} arg2
 * @param {String} arg3
 * @param {ccui.RichElementImageEx::TextureType} arg4
 * @return {bool}
 */
init : function (
int, 
color3b, 
char, 
str, 
texturetype 
)
{
    return false;
},

/**
 * @method getFilePath
 * @return {String}
 */
getFilePath : function (
)
{
    return ;
},

/**
 * @method getTextureType
 * @return {ccui.RichElementImageEx::TextureType}
 */
getTextureType : function (
)
{
    return 0;
},

/**
 * @method create
 * @param {int} arg0
 * @param {color3b_object} arg1
 * @param {unsigned char} arg2
 * @param {String} arg3
 * @param {ccui.RichElementImageEx::TextureType} arg4
 * @return {ccui.RichElementImageEx}
 */
create : function (
int, 
color3b, 
char, 
str, 
texturetype 
)
{
    return ccui.RichElementImageEx;
},

/**
 * @method RichElementImageEx
 * @constructor
 */
RichElementImageEx : function (
)
{
}

};

/**
 * @class RichElementCustomNodeEx
 */
ccui.RichElementCustomNodeEx = {

/**
 * @method init
 * @param {int} arg0
 * @param {color3b_object} arg1
 * @param {unsigned char} arg2
 * @param {cc.Node} arg3
 * @return {bool}
 */
init : function (
int, 
color3b, 
char, 
node 
)
{
    return false;
},

/**
 * @method create
 * @param {int} arg0
 * @param {color3b_object} arg1
 * @param {unsigned char} arg2
 * @param {cc.Node} arg3
 * @return {ccui.RichElementCustomNodeEx}
 */
create : function (
int, 
color3b, 
char, 
node 
)
{
    return ccui.RichElementCustomNodeEx;
},

/**
 * @method RichElementCustomNodeEx
 * @constructor
 */
RichElementCustomNodeEx : function (
)
{
}

};

/**
 * @class RichTextEx
 */
ccui.RichTextEx = {

/**
 * @method insertElement
 * @param {ccui.RichElementEx} arg0
 * @param {int} arg1
 */
insertElement : function (
richelementex, 
int 
)
{
},

/**
 * @method getVerticalSpace
 * @return {float}
 */
getVerticalSpace : function (
)
{
    return 0;
},

/**
 * @method getEmptyLineHeight
 * @return {float}
 */
getEmptyLineHeight : function (
)
{
    return 0;
},

/**
 * @method pushBackElement
 * @param {ccui.RichElementEx} arg0
 */
pushBackElement : function (
richelementex 
)
{
},

/**
 * @method getHorizontalAlignment
 * @return {cc.TextHAlignment}
 */
getHorizontalAlignment : function (
)
{
    return 0;
},

/**
 * @method ignoreContentAdaptWithSize
 * @param {bool} arg0
 */
ignoreContentAdaptWithSize : function (
bool 
)
{
},

/**
 * @method setAnchorPoint
 * @param {vec2_object} arg0
 */
setAnchorPoint : function (
vec2 
)
{
},

/**
 * @method setVerticalSpace
 * @param {float} arg0
 */
setVerticalSpace : function (
float 
)
{
},

/**
 * @method setHorizontalAlignment
 * @param {cc.TextHAlignment} arg0
 */
setHorizontalAlignment : function (
texthalignment 
)
{
},

/**
 * @method formatText
 */
formatText : function (
)
{
},

/**
 * @method removeElement
* @param {ccui.RichElementEx|int} richelementex
*/
removeElement : function(
int 
)
{
},

/**
 * @method setEmptyLineHeight
 * @param {float} arg0
 */
setEmptyLineHeight : function (
float 
)
{
},

/**
 * @method create
 * @return {ccui.RichTextEx}
 */
create : function (
)
{
    return ccui.RichTextEx;
},

/**
 * @method RichTextEx
 * @constructor
 */
RichTextEx : function (
)
{
}

};
