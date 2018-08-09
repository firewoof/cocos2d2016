#include "jsb_custom_ccui_auto.hpp"
#include "cocos2d_specifics.hpp"
#include "UIRichTextEx.h"

template<class T>
static bool dummy_constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS_ReportError(cx, "Constructor for the requested class is not available, please refer to the API reference.");
    return false;
}

static bool empty_constructor(JSContext *cx, uint32_t argc, jsval *vp) {
    return false;
}

static bool js_is_native_obj(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    args.rval().setBoolean(true);
    return true;    
}
JSClass  *jsb_cocos2d_ui_RichElementEx_class;
JSObject *jsb_cocos2d_ui_RichElementEx_prototype;

void js_cocos2dx_ui_custom_RichElementEx_finalize(JSFreeOp *fop, JSObject *obj) {
	CCLOGINFO("jsbindings: finalizing JS object %p (RichElementEx)", obj);
}

void js_cocos2dx_ui_custom_RichElementTextEx_finalize(JSFreeOp *fop, JSObject *obj) {
	CCLOGINFO("jsbindings: finalizing JS object %p (RichElementTextEx)", obj);
}

void js_cocos2dx_ui_custom_RichElementImageEx_finalize(JSFreeOp *fop, JSObject *obj) {
	CCLOGINFO("jsbindings: finalizing JS object %p (RichElementImageEx)", obj);
}

void js_cocos2dx_ui_custom_RichElementCustomNodeEx_finalize(JSFreeOp *fop, JSObject *obj) {
	CCLOGINFO("jsbindings: finalizing JS object %p (RichElementCustomNodeEx)", obj);
}

void js_cocos2dx_ui_custom_RichTextEx_finalize(JSFreeOp *fop, JSObject *obj) {
	CCLOGINFO("jsbindings: finalizing JS object %p (RichTextEx)", obj);
}

bool js_cocos2dx_ui_custom_RichElementEx_getColor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichElementEx* cobj = (cocos2d::ui::RichElementEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichElementEx_getColor : Invalid Native Object");
    if (argc == 0) {
        const cocos2d::Color3B& ret = cobj->getColor();
        jsval jsret = JSVAL_NULL;
        jsret = cccolor3b_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichElementEx_getColor : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_ui_custom_RichElementEx_getType(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichElementEx* cobj = (cocos2d::ui::RichElementEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichElementEx_getType : Invalid Native Object");
    if (argc == 0) {
        int ret = (int)cobj->getType();
        jsval jsret = JSVAL_NULL;
        jsret = int32_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichElementEx_getType : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_ui_custom_RichElementEx_setClickCallback(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichElementEx* cobj = (cocos2d::ui::RichElementEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichElementEx_setClickCallback : Invalid Native Object");
    if (argc == 1) {
        std::function<void (cocos2d::Ref *, cocos2d::Ref *)> arg0;
        do {
		    if(JS_TypeOfValue(cx, args.get(0)) == JSTYPE_FUNCTION)
		    {
		        JS::RootedObject jstarget(cx, args.thisv().toObjectOrNull());
		        std::shared_ptr<JSFunctionWrapper> func(new JSFunctionWrapper(cx, jstarget, args.get(0)));
		        auto lambda = [=](cocos2d::Ref* larg0, cocos2d::Ref* larg1) -> void {
		            JSB_AUTOCOMPARTMENT_WITH_GLOBAL_OBJCET
		            jsval largv[2];
		            if (larg0) {
		            largv[0] = OBJECT_TO_JSVAL(js_get_or_create_jsobject<cocos2d::Ref>(cx, (cocos2d::Ref*)larg0));
		        } else {
		            largv[0] = JSVAL_NULL;
		        };
		            if (larg1) {
		            largv[1] = OBJECT_TO_JSVAL(js_get_or_create_jsobject<cocos2d::Ref>(cx, (cocos2d::Ref*)larg1));
		        } else {
		            largv[1] = JSVAL_NULL;
		        };
		            JS::RootedValue rval(cx);
		            bool succeed = func->invoke(2, &largv[0], &rval);
		            if (!succeed && JS_IsExceptionPending(cx)) {
		                JS_ReportPendingException(cx);
		            }
		        };
		        arg0 = lambda;
		    }
		    else
		    {
		        arg0 = nullptr;
		    }
		} while(0)
		;
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_ui_custom_RichElementEx_setClickCallback : Error processing arguments");
        cobj->setClickCallback(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichElementEx_setClickCallback : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_ui_custom_RichElementEx_init(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichElementEx* cobj = (cocos2d::ui::RichElementEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichElementEx_init : Invalid Native Object");
    if (argc == 3) {
        int arg0 = 0;
        cocos2d::Color3B arg1;
        uint16_t arg2;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= jsval_to_cccolor3b(cx, args.get(1), &arg1);
        ok &= jsval_to_uint16(cx, args.get(2), &arg2);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_ui_custom_RichElementEx_init : Error processing arguments");
        bool ret = cobj->init(arg0, arg1, arg2);
        jsval jsret = JSVAL_NULL;
        jsret = BOOLEAN_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichElementEx_init : wrong number of arguments: %d, was expecting %d", argc, 3);
    return false;
}
bool js_cocos2dx_ui_custom_RichElementEx_getClickCallback(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichElementEx* cobj = (cocos2d::ui::RichElementEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichElementEx_getClickCallback : Invalid Native Object");
    if (argc == 0) {
        const std::function<void (cocos2d::Ref *, cocos2d::Ref *)>& ret = cobj->getClickCallback();
        jsval jsret = JSVAL_NULL;
        #pragma warning NO CONVERSION FROM NATIVE FOR std::function;
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichElementEx_getClickCallback : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_ui_custom_RichElementEx_getOpacity(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichElementEx* cobj = (cocos2d::ui::RichElementEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichElementEx_getOpacity : Invalid Native Object");
    if (argc == 0) {
        uint16_t ret = cobj->getOpacity();
        jsval jsret = JSVAL_NULL;
        jsret = uint32_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichElementEx_getOpacity : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_ui_custom_RichElementEx_getTag(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichElementEx* cobj = (cocos2d::ui::RichElementEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichElementEx_getTag : Invalid Native Object");
    if (argc == 0) {
        int ret = cobj->getTag();
        jsval jsret = JSVAL_NULL;
        jsret = int32_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichElementEx_getTag : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_ui_custom_RichElementEx_constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    cocos2d::ui::RichElementEx* cobj = new (std::nothrow) cocos2d::ui::RichElementEx();

    js_type_class_t *typeClass = js_get_type_from_native<cocos2d::ui::RichElementEx>(cobj);

    // link the native object with the javascript object
    JS::RootedObject jsobj(cx, jsb_ref_create_jsobject(cx, cobj, typeClass, "cocos2d::ui::RichElementEx"));
    args.rval().set(OBJECT_TO_JSVAL(jsobj));
    if (JS_HasProperty(cx, jsobj, "_ctor", &ok) && ok)
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(jsobj), "_ctor", args);
    return true;
}
static bool js_cocos2dx_ui_custom_RichElementEx_ctor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    cocos2d::ui::RichElementEx *nobj = new (std::nothrow) cocos2d::ui::RichElementEx();
    auto newproxy = jsb_new_proxy(nobj, obj);
    jsb_ref_init(cx, &newproxy->obj, nobj, "cocos2d::ui::RichElementEx");
    bool isFound = false;
    if (JS_HasProperty(cx, obj, "_ctor", &isFound) && isFound)
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(obj), "_ctor", args);
    args.rval().setUndefined();
    return true;
}


    
void js_register_cocos2dx_ui_custom_RichElementEx(JSContext *cx, JS::HandleObject global) {
    jsb_cocos2d_ui_RichElementEx_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_cocos2d_ui_RichElementEx_class->name = "RichElementEx";
    jsb_cocos2d_ui_RichElementEx_class->addProperty = JS_PropertyStub;
    jsb_cocos2d_ui_RichElementEx_class->delProperty = JS_DeletePropertyStub;
    jsb_cocos2d_ui_RichElementEx_class->getProperty = JS_PropertyStub;
    jsb_cocos2d_ui_RichElementEx_class->setProperty = JS_StrictPropertyStub;
    jsb_cocos2d_ui_RichElementEx_class->enumerate = JS_EnumerateStub;
    jsb_cocos2d_ui_RichElementEx_class->resolve = JS_ResolveStub;
    jsb_cocos2d_ui_RichElementEx_class->convert = JS_ConvertStub;
	jsb_cocos2d_ui_RichElementEx_class->finalize = js_cocos2dx_ui_custom_RichElementEx_finalize;
    jsb_cocos2d_ui_RichElementEx_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("getColor", js_cocos2dx_ui_custom_RichElementEx_getColor, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getType", js_cocos2dx_ui_custom_RichElementEx_getType, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setClickCallback", js_cocos2dx_ui_custom_RichElementEx_setClickCallback, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("init", js_cocos2dx_ui_custom_RichElementEx_init, 3, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getClickCallback", js_cocos2dx_ui_custom_RichElementEx_getClickCallback, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getOpacity", js_cocos2dx_ui_custom_RichElementEx_getOpacity, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getTag", js_cocos2dx_ui_custom_RichElementEx_getTag, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("ctor", js_cocos2dx_ui_custom_RichElementEx_ctor, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    JSFunctionSpec *st_funcs = NULL;

    jsb_cocos2d_ui_RichElementEx_prototype = JS_InitClass(
        cx, global,
        JS::NullPtr(),
        jsb_cocos2d_ui_RichElementEx_class,
        js_cocos2dx_ui_custom_RichElementEx_constructor, 0, // constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);

    // add the proto and JSClass to the type->js info hash table
    JS::RootedObject proto(cx, jsb_cocos2d_ui_RichElementEx_prototype);
    jsb_register_class<cocos2d::ui::RichElementEx>(cx, jsb_cocos2d_ui_RichElementEx_class, proto, JS::NullPtr());
    anonEvaluate(cx, global, "(function () { ccui.RichElementEx.extend = cc.Class.extend; })()");
}

JSClass  *jsb_cocos2d_ui_RichElementTextEx_class;
JSObject *jsb_cocos2d_ui_RichElementTextEx_prototype;

bool js_cocos2dx_ui_custom_RichElementTextEx_disableOutline(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichElementTextEx* cobj = (cocos2d::ui::RichElementTextEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichElementTextEx_disableOutline : Invalid Native Object");
    if (argc == 0) {
        cobj->disableOutline();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichElementTextEx_disableOutline : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_ui_custom_RichElementTextEx_getFontSize(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichElementTextEx* cobj = (cocos2d::ui::RichElementTextEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichElementTextEx_getFontSize : Invalid Native Object");
    if (argc == 0) {
        double ret = cobj->getFontSize();
        jsval jsret = JSVAL_NULL;
        jsret = DOUBLE_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichElementTextEx_getFontSize : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_ui_custom_RichElementTextEx_enableOutline(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichElementTextEx* cobj = (cocos2d::ui::RichElementTextEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichElementTextEx_enableOutline : Invalid Native Object");
    if (argc == 2) {
        cocos2d::Color3B arg0;
        double arg1 = 0;
        ok &= jsval_to_cccolor3b(cx, args.get(0), &arg0);
        ok &= JS::ToNumber( cx, args.get(1), &arg1) && !isnan(arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_ui_custom_RichElementTextEx_enableOutline : Error processing arguments");
        cobj->enableOutline(arg0, arg1);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichElementTextEx_enableOutline : wrong number of arguments: %d, was expecting %d", argc, 2);
    return false;
}
bool js_cocos2dx_ui_custom_RichElementTextEx_disableUnderline(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichElementTextEx* cobj = (cocos2d::ui::RichElementTextEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichElementTextEx_disableUnderline : Invalid Native Object");
    if (argc == 0) {
        cobj->disableUnderline();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichElementTextEx_disableUnderline : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_ui_custom_RichElementTextEx_getText(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichElementTextEx* cobj = (cocos2d::ui::RichElementTextEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichElementTextEx_getText : Invalid Native Object");
    if (argc == 0) {
        const std::string& ret = cobj->getText();
        jsval jsret = JSVAL_NULL;
        jsret = std_string_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichElementTextEx_getText : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_ui_custom_RichElementTextEx_init(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichElementTextEx* cobj = (cocos2d::ui::RichElementTextEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichElementTextEx_init : Invalid Native Object");
    if (argc == 6) {
        int arg0 = 0;
        cocos2d::Color3B arg1;
        uint16_t arg2;
        std::string arg3;
        std::string arg4;
        double arg5 = 0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= jsval_to_cccolor3b(cx, args.get(1), &arg1);
        ok &= jsval_to_uint16(cx, args.get(2), &arg2);
        ok &= jsval_to_std_string(cx, args.get(3), &arg3);
        ok &= jsval_to_std_string(cx, args.get(4), &arg4);
        ok &= JS::ToNumber( cx, args.get(5), &arg5) && !isnan(arg5);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_ui_custom_RichElementTextEx_init : Error processing arguments");
        bool ret = cobj->init(arg0, arg1, arg2, arg3, arg4, arg5);
        jsval jsret = JSVAL_NULL;
        jsret = BOOLEAN_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichElementTextEx_init : wrong number of arguments: %d, was expecting %d", argc, 6);
    return false;
}
bool js_cocos2dx_ui_custom_RichElementTextEx_enableUnderline(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichElementTextEx* cobj = (cocos2d::ui::RichElementTextEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichElementTextEx_enableUnderline : Invalid Native Object");
    if (argc == 0) {
        cobj->enableUnderline();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichElementTextEx_enableUnderline : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_ui_custom_RichElementTextEx_getFontName(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichElementTextEx* cobj = (cocos2d::ui::RichElementTextEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichElementTextEx_getFontName : Invalid Native Object");
    if (argc == 0) {
        const std::string& ret = cobj->getFontName();
        jsval jsret = JSVAL_NULL;
        jsret = std_string_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichElementTextEx_getFontName : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_ui_custom_RichElementTextEx_create(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 6) {
        int arg0 = 0;
        cocos2d::Color3B arg1;
        uint16_t arg2;
        std::string arg3;
        std::string arg4;
        double arg5 = 0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= jsval_to_cccolor3b(cx, args.get(1), &arg1);
        ok &= jsval_to_uint16(cx, args.get(2), &arg2);
        ok &= jsval_to_std_string(cx, args.get(3), &arg3);
        ok &= jsval_to_std_string(cx, args.get(4), &arg4);
        ok &= JS::ToNumber( cx, args.get(5), &arg5) && !isnan(arg5);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_ui_custom_RichElementTextEx_create : Error processing arguments");

        auto ret = cocos2d::ui::RichElementTextEx::create(arg0, arg1, arg2, arg3, arg4, arg5);
        js_type_class_t *typeClass = js_get_type_from_native<cocos2d::ui::RichElementTextEx>(ret);
        JS::RootedObject jsret(cx, jsb_ref_autoreleased_create_jsobject(cx, ret, typeClass, "cocos2d::ui::RichElementTextEx"));
        args.rval().set(OBJECT_TO_JSVAL(jsret));
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichElementTextEx_create : wrong number of arguments");
    return false;
}

bool js_cocos2dx_ui_custom_RichElementTextEx_constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    cocos2d::ui::RichElementTextEx* cobj = new (std::nothrow) cocos2d::ui::RichElementTextEx();

    js_type_class_t *typeClass = js_get_type_from_native<cocos2d::ui::RichElementTextEx>(cobj);

    // link the native object with the javascript object
    JS::RootedObject jsobj(cx, jsb_ref_create_jsobject(cx, cobj, typeClass, "cocos2d::ui::RichElementTextEx"));
    args.rval().set(OBJECT_TO_JSVAL(jsobj));
    if (JS_HasProperty(cx, jsobj, "_ctor", &ok) && ok)
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(jsobj), "_ctor", args);
    return true;
}
static bool js_cocos2dx_ui_custom_RichElementTextEx_ctor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    cocos2d::ui::RichElementTextEx *nobj = new (std::nothrow) cocos2d::ui::RichElementTextEx();
    auto newproxy = jsb_new_proxy(nobj, obj);
    jsb_ref_init(cx, &newproxy->obj, nobj, "cocos2d::ui::RichElementTextEx");
    bool isFound = false;
    if (JS_HasProperty(cx, obj, "_ctor", &isFound) && isFound)
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(obj), "_ctor", args);
    args.rval().setUndefined();
    return true;
}


extern JSObject *jsb_cocos2d_ui_RichElementEx_prototype;

    
void js_register_cocos2dx_ui_custom_RichElementTextEx(JSContext *cx, JS::HandleObject global) {
    jsb_cocos2d_ui_RichElementTextEx_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_cocos2d_ui_RichElementTextEx_class->name = "RichElementTextEx";
    jsb_cocos2d_ui_RichElementTextEx_class->addProperty = JS_PropertyStub;
    jsb_cocos2d_ui_RichElementTextEx_class->delProperty = JS_DeletePropertyStub;
    jsb_cocos2d_ui_RichElementTextEx_class->getProperty = JS_PropertyStub;
    jsb_cocos2d_ui_RichElementTextEx_class->setProperty = JS_StrictPropertyStub;
    jsb_cocos2d_ui_RichElementTextEx_class->enumerate = JS_EnumerateStub;
    jsb_cocos2d_ui_RichElementTextEx_class->resolve = JS_ResolveStub;
    jsb_cocos2d_ui_RichElementTextEx_class->convert = JS_ConvertStub;
	jsb_cocos2d_ui_RichElementTextEx_class->finalize = js_cocos2dx_ui_custom_RichElementTextEx_finalize;
    jsb_cocos2d_ui_RichElementTextEx_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("disableOutline", js_cocos2dx_ui_custom_RichElementTextEx_disableOutline, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getFontSize", js_cocos2dx_ui_custom_RichElementTextEx_getFontSize, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("enableOutline", js_cocos2dx_ui_custom_RichElementTextEx_enableOutline, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("disableUnderline", js_cocos2dx_ui_custom_RichElementTextEx_disableUnderline, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getText", js_cocos2dx_ui_custom_RichElementTextEx_getText, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("init", js_cocos2dx_ui_custom_RichElementTextEx_init, 6, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("enableUnderline", js_cocos2dx_ui_custom_RichElementTextEx_enableUnderline, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getFontName", js_cocos2dx_ui_custom_RichElementTextEx_getFontName, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("ctor", js_cocos2dx_ui_custom_RichElementTextEx_ctor, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("create", js_cocos2dx_ui_custom_RichElementTextEx_create, 6, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    JS::RootedObject parent_proto(cx, jsb_cocos2d_ui_RichElementEx_prototype);
    jsb_cocos2d_ui_RichElementTextEx_prototype = JS_InitClass(
        cx, global,
        parent_proto,
        jsb_cocos2d_ui_RichElementTextEx_class,
        js_cocos2dx_ui_custom_RichElementTextEx_constructor, 0, // constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);

    // add the proto and JSClass to the type->js info hash table
    JS::RootedObject proto(cx, jsb_cocos2d_ui_RichElementTextEx_prototype);
    jsb_register_class<cocos2d::ui::RichElementTextEx>(cx, jsb_cocos2d_ui_RichElementTextEx_class, proto, parent_proto);
    anonEvaluate(cx, global, "(function () { ccui.RichElementTextEx.extend = cc.Class.extend; })()");
}

JSClass  *jsb_cocos2d_ui_RichElementImageEx_class;
JSObject *jsb_cocos2d_ui_RichElementImageEx_prototype;

bool js_cocos2dx_ui_custom_RichElementImageEx_setScaleY(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichElementImageEx* cobj = (cocos2d::ui::RichElementImageEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichElementImageEx_setScaleY : Invalid Native Object");
    if (argc == 1) {
        double arg0 = 0;
        ok &= JS::ToNumber( cx, args.get(0), &arg0) && !isnan(arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_ui_custom_RichElementImageEx_setScaleY : Error processing arguments");
        cobj->setScaleY(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichElementImageEx_setScaleY : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_ui_custom_RichElementImageEx_setScaleX(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichElementImageEx* cobj = (cocos2d::ui::RichElementImageEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichElementImageEx_setScaleX : Invalid Native Object");
    if (argc == 1) {
        double arg0 = 0;
        ok &= JS::ToNumber( cx, args.get(0), &arg0) && !isnan(arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_ui_custom_RichElementImageEx_setScaleX : Error processing arguments");
        cobj->setScaleX(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichElementImageEx_setScaleX : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_ui_custom_RichElementImageEx_setScale(JSContext *cx, uint32_t argc, jsval *vp)
{
    bool ok = true;
    cocos2d::ui::RichElementImageEx* cobj = nullptr;

    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx);
    obj.set(args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cobj = (cocos2d::ui::RichElementImageEx *)(proxy ? proxy->ptr : nullptr);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichElementImageEx_setScale : Invalid Native Object");
    do {
        if (argc == 2) {
            double arg0 = 0;
            ok &= JS::ToNumber( cx, args.get(0), &arg0) && !isnan(arg0);
            if (!ok) { ok = true; break; }
            double arg1 = 0;
            ok &= JS::ToNumber( cx, args.get(1), &arg1) && !isnan(arg1);
            if (!ok) { ok = true; break; }
            cobj->setScale(arg0, arg1);
            args.rval().setUndefined();
            return true;
        }
    } while(0);

    do {
        if (argc == 1) {
            double arg0 = 0;
            ok &= JS::ToNumber( cx, args.get(0), &arg0) && !isnan(arg0);
            if (!ok) { ok = true; break; }
            cobj->setScale(arg0);
            args.rval().setUndefined();
            return true;
        }
    } while(0);

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichElementImageEx_setScale : wrong number of arguments");
    return false;
}
bool js_cocos2dx_ui_custom_RichElementImageEx_init(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichElementImageEx* cobj = (cocos2d::ui::RichElementImageEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichElementImageEx_init : Invalid Native Object");
    if (argc == 5) {
        int arg0 = 0;
        cocos2d::Color3B arg1;
        uint16_t arg2;
        std::string arg3;
        cocos2d::ui::RichElementImageEx::TextureType arg4;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= jsval_to_cccolor3b(cx, args.get(1), &arg1);
        ok &= jsval_to_uint16(cx, args.get(2), &arg2);
        ok &= jsval_to_std_string(cx, args.get(3), &arg3);
        ok &= jsval_to_int32(cx, args.get(4), (int32_t *)&arg4);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_ui_custom_RichElementImageEx_init : Error processing arguments");
        bool ret = cobj->init(arg0, arg1, arg2, arg3, arg4);
        jsval jsret = JSVAL_NULL;
        jsret = BOOLEAN_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichElementImageEx_init : wrong number of arguments: %d, was expecting %d", argc, 5);
    return false;
}
bool js_cocos2dx_ui_custom_RichElementImageEx_getFilePath(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichElementImageEx* cobj = (cocos2d::ui::RichElementImageEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichElementImageEx_getFilePath : Invalid Native Object");
    if (argc == 0) {
        const std::string& ret = cobj->getFilePath();
        jsval jsret = JSVAL_NULL;
        jsret = std_string_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichElementImageEx_getFilePath : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_ui_custom_RichElementImageEx_getTextureType(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichElementImageEx* cobj = (cocos2d::ui::RichElementImageEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichElementImageEx_getTextureType : Invalid Native Object");
    if (argc == 0) {
        int ret = (int)cobj->getTextureType();
        jsval jsret = JSVAL_NULL;
        jsret = int32_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichElementImageEx_getTextureType : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_ui_custom_RichElementImageEx_create(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 5) {
        int arg0 = 0;
        cocos2d::Color3B arg1;
        uint16_t arg2;
        std::string arg3;
        cocos2d::ui::RichElementImageEx::TextureType arg4;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= jsval_to_cccolor3b(cx, args.get(1), &arg1);
        ok &= jsval_to_uint16(cx, args.get(2), &arg2);
        ok &= jsval_to_std_string(cx, args.get(3), &arg3);
        ok &= jsval_to_int32(cx, args.get(4), (int32_t *)&arg4);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_ui_custom_RichElementImageEx_create : Error processing arguments");

        auto ret = cocos2d::ui::RichElementImageEx::create(arg0, arg1, arg2, arg3, arg4);
        js_type_class_t *typeClass = js_get_type_from_native<cocos2d::ui::RichElementImageEx>(ret);
        JS::RootedObject jsret(cx, jsb_ref_autoreleased_create_jsobject(cx, ret, typeClass, "cocos2d::ui::RichElementImageEx"));
        args.rval().set(OBJECT_TO_JSVAL(jsret));
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichElementImageEx_create : wrong number of arguments");
    return false;
}

bool js_cocos2dx_ui_custom_RichElementImageEx_constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    cocos2d::ui::RichElementImageEx* cobj = new (std::nothrow) cocos2d::ui::RichElementImageEx();

    js_type_class_t *typeClass = js_get_type_from_native<cocos2d::ui::RichElementImageEx>(cobj);

    // link the native object with the javascript object
    JS::RootedObject jsobj(cx, jsb_ref_create_jsobject(cx, cobj, typeClass, "cocos2d::ui::RichElementImageEx"));
    args.rval().set(OBJECT_TO_JSVAL(jsobj));
    if (JS_HasProperty(cx, jsobj, "_ctor", &ok) && ok)
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(jsobj), "_ctor", args);
    return true;
}
static bool js_cocos2dx_ui_custom_RichElementImageEx_ctor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    cocos2d::ui::RichElementImageEx *nobj = new (std::nothrow) cocos2d::ui::RichElementImageEx();
    auto newproxy = jsb_new_proxy(nobj, obj);
    jsb_ref_init(cx, &newproxy->obj, nobj, "cocos2d::ui::RichElementImageEx");
    bool isFound = false;
    if (JS_HasProperty(cx, obj, "_ctor", &isFound) && isFound)
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(obj), "_ctor", args);
    args.rval().setUndefined();
    return true;
}


extern JSObject *jsb_cocos2d_ui_RichElementEx_prototype;

    
void js_register_cocos2dx_ui_custom_RichElementImageEx(JSContext *cx, JS::HandleObject global) {
    jsb_cocos2d_ui_RichElementImageEx_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_cocos2d_ui_RichElementImageEx_class->name = "RichElementImageEx";
    jsb_cocos2d_ui_RichElementImageEx_class->addProperty = JS_PropertyStub;
    jsb_cocos2d_ui_RichElementImageEx_class->delProperty = JS_DeletePropertyStub;
    jsb_cocos2d_ui_RichElementImageEx_class->getProperty = JS_PropertyStub;
    jsb_cocos2d_ui_RichElementImageEx_class->setProperty = JS_StrictPropertyStub;
    jsb_cocos2d_ui_RichElementImageEx_class->enumerate = JS_EnumerateStub;
    jsb_cocos2d_ui_RichElementImageEx_class->resolve = JS_ResolveStub;
    jsb_cocos2d_ui_RichElementImageEx_class->convert = JS_ConvertStub;
	jsb_cocos2d_ui_RichElementImageEx_class->finalize = js_cocos2dx_ui_custom_RichElementImageEx_finalize;
    jsb_cocos2d_ui_RichElementImageEx_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("setScaleY", js_cocos2dx_ui_custom_RichElementImageEx_setScaleY, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setScaleX", js_cocos2dx_ui_custom_RichElementImageEx_setScaleX, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setScale", js_cocos2dx_ui_custom_RichElementImageEx_setScale, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("init", js_cocos2dx_ui_custom_RichElementImageEx_init, 5, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getFilePath", js_cocos2dx_ui_custom_RichElementImageEx_getFilePath, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getTextureType", js_cocos2dx_ui_custom_RichElementImageEx_getTextureType, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("ctor", js_cocos2dx_ui_custom_RichElementImageEx_ctor, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("create", js_cocos2dx_ui_custom_RichElementImageEx_create, 5, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    JS::RootedObject parent_proto(cx, jsb_cocos2d_ui_RichElementEx_prototype);
    jsb_cocos2d_ui_RichElementImageEx_prototype = JS_InitClass(
        cx, global,
        parent_proto,
        jsb_cocos2d_ui_RichElementImageEx_class,
        js_cocos2dx_ui_custom_RichElementImageEx_constructor, 0, // constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);

    // add the proto and JSClass to the type->js info hash table
    JS::RootedObject proto(cx, jsb_cocos2d_ui_RichElementImageEx_prototype);
    jsb_register_class<cocos2d::ui::RichElementImageEx>(cx, jsb_cocos2d_ui_RichElementImageEx_class, proto, parent_proto);
    anonEvaluate(cx, global, "(function () { ccui.RichElementImageEx.extend = cc.Class.extend; })()");
}

JSClass  *jsb_cocos2d_ui_RichElementCustomNodeEx_class;
JSObject *jsb_cocos2d_ui_RichElementCustomNodeEx_prototype;

bool js_cocos2dx_ui_custom_RichElementCustomNodeEx_init(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichElementCustomNodeEx* cobj = (cocos2d::ui::RichElementCustomNodeEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichElementCustomNodeEx_init : Invalid Native Object");
    if (argc == 4) {
        int arg0 = 0;
        cocos2d::Color3B arg1;
        uint16_t arg2;
        cocos2d::Node* arg3 = nullptr;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= jsval_to_cccolor3b(cx, args.get(1), &arg1);
        ok &= jsval_to_uint16(cx, args.get(2), &arg2);
        do {
            if (args.get(3).isNull()) { arg3 = nullptr; break; }
            if (!args.get(3).isObject()) { ok = false; break; }
            js_proxy_t *jsProxy;
            JS::RootedObject tmpObj(cx, args.get(3).toObjectOrNull());
            jsProxy = jsb_get_js_proxy(tmpObj);
            arg3 = (cocos2d::Node*)(jsProxy ? jsProxy->ptr : NULL);
            JSB_PRECONDITION2( arg3, cx, false, "Invalid Native Object");
        } while (0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_ui_custom_RichElementCustomNodeEx_init : Error processing arguments");
        bool ret = cobj->init(arg0, arg1, arg2, arg3);
        jsval jsret = JSVAL_NULL;
        jsret = BOOLEAN_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichElementCustomNodeEx_init : wrong number of arguments: %d, was expecting %d", argc, 4);
    return false;
}
bool js_cocos2dx_ui_custom_RichElementCustomNodeEx_create(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 4) {
        int arg0 = 0;
        cocos2d::Color3B arg1;
        uint16_t arg2;
        cocos2d::Node* arg3 = nullptr;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= jsval_to_cccolor3b(cx, args.get(1), &arg1);
        ok &= jsval_to_uint16(cx, args.get(2), &arg2);
        do {
            if (args.get(3).isNull()) { arg3 = nullptr; break; }
            if (!args.get(3).isObject()) { ok = false; break; }
            js_proxy_t *jsProxy;
            JS::RootedObject tmpObj(cx, args.get(3).toObjectOrNull());
            jsProxy = jsb_get_js_proxy(tmpObj);
            arg3 = (cocos2d::Node*)(jsProxy ? jsProxy->ptr : NULL);
            JSB_PRECONDITION2( arg3, cx, false, "Invalid Native Object");
        } while (0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_ui_custom_RichElementCustomNodeEx_create : Error processing arguments");

        auto ret = cocos2d::ui::RichElementCustomNodeEx::create(arg0, arg1, arg2, arg3);
        js_type_class_t *typeClass = js_get_type_from_native<cocos2d::ui::RichElementCustomNodeEx>(ret);
        JS::RootedObject jsret(cx, jsb_ref_autoreleased_create_jsobject(cx, ret, typeClass, "cocos2d::ui::RichElementCustomNodeEx"));
        args.rval().set(OBJECT_TO_JSVAL(jsret));
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichElementCustomNodeEx_create : wrong number of arguments");
    return false;
}

bool js_cocos2dx_ui_custom_RichElementCustomNodeEx_constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    cocos2d::ui::RichElementCustomNodeEx* cobj = new (std::nothrow) cocos2d::ui::RichElementCustomNodeEx();

    js_type_class_t *typeClass = js_get_type_from_native<cocos2d::ui::RichElementCustomNodeEx>(cobj);

    // link the native object with the javascript object
    JS::RootedObject jsobj(cx, jsb_ref_create_jsobject(cx, cobj, typeClass, "cocos2d::ui::RichElementCustomNodeEx"));
    args.rval().set(OBJECT_TO_JSVAL(jsobj));
    if (JS_HasProperty(cx, jsobj, "_ctor", &ok) && ok)
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(jsobj), "_ctor", args);
    return true;
}
static bool js_cocos2dx_ui_custom_RichElementCustomNodeEx_ctor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    cocos2d::ui::RichElementCustomNodeEx *nobj = new (std::nothrow) cocos2d::ui::RichElementCustomNodeEx();
    auto newproxy = jsb_new_proxy(nobj, obj);
    jsb_ref_init(cx, &newproxy->obj, nobj, "cocos2d::ui::RichElementCustomNodeEx");
    bool isFound = false;
    if (JS_HasProperty(cx, obj, "_ctor", &isFound) && isFound)
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(obj), "_ctor", args);
    args.rval().setUndefined();
    return true;
}


extern JSObject *jsb_cocos2d_ui_RichElementEx_prototype;

    
void js_register_cocos2dx_ui_custom_RichElementCustomNodeEx(JSContext *cx, JS::HandleObject global) {
    jsb_cocos2d_ui_RichElementCustomNodeEx_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_cocos2d_ui_RichElementCustomNodeEx_class->name = "RichElementCustomNodeEx";
    jsb_cocos2d_ui_RichElementCustomNodeEx_class->addProperty = JS_PropertyStub;
    jsb_cocos2d_ui_RichElementCustomNodeEx_class->delProperty = JS_DeletePropertyStub;
    jsb_cocos2d_ui_RichElementCustomNodeEx_class->getProperty = JS_PropertyStub;
    jsb_cocos2d_ui_RichElementCustomNodeEx_class->setProperty = JS_StrictPropertyStub;
    jsb_cocos2d_ui_RichElementCustomNodeEx_class->enumerate = JS_EnumerateStub;
    jsb_cocos2d_ui_RichElementCustomNodeEx_class->resolve = JS_ResolveStub;
    jsb_cocos2d_ui_RichElementCustomNodeEx_class->convert = JS_ConvertStub;
	jsb_cocos2d_ui_RichElementCustomNodeEx_class->finalize = js_cocos2dx_ui_custom_RichElementCustomNodeEx_finalize;
    jsb_cocos2d_ui_RichElementCustomNodeEx_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("init", js_cocos2dx_ui_custom_RichElementCustomNodeEx_init, 4, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("ctor", js_cocos2dx_ui_custom_RichElementCustomNodeEx_ctor, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("create", js_cocos2dx_ui_custom_RichElementCustomNodeEx_create, 4, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    JS::RootedObject parent_proto(cx, jsb_cocos2d_ui_RichElementEx_prototype);
    jsb_cocos2d_ui_RichElementCustomNodeEx_prototype = JS_InitClass(
        cx, global,
        parent_proto,
        jsb_cocos2d_ui_RichElementCustomNodeEx_class,
        js_cocos2dx_ui_custom_RichElementCustomNodeEx_constructor, 0, // constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);

    // add the proto and JSClass to the type->js info hash table
    JS::RootedObject proto(cx, jsb_cocos2d_ui_RichElementCustomNodeEx_prototype);
    jsb_register_class<cocos2d::ui::RichElementCustomNodeEx>(cx, jsb_cocos2d_ui_RichElementCustomNodeEx_class, proto, parent_proto);
    anonEvaluate(cx, global, "(function () { ccui.RichElementCustomNodeEx.extend = cc.Class.extend; })()");
}

JSClass  *jsb_cocos2d_ui_RichTextEx_class;
JSObject *jsb_cocos2d_ui_RichTextEx_prototype;

bool js_cocos2dx_ui_custom_RichTextEx_insertElement(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichTextEx* cobj = (cocos2d::ui::RichTextEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichTextEx_insertElement : Invalid Native Object");
    if (argc == 2) {
        cocos2d::ui::RichElementEx* arg0 = nullptr;
        int arg1 = 0;
        do {
            if (args.get(0).isNull()) { arg0 = nullptr; break; }
            if (!args.get(0).isObject()) { ok = false; break; }
            js_proxy_t *jsProxy;
            JS::RootedObject tmpObj(cx, args.get(0).toObjectOrNull());
            jsProxy = jsb_get_js_proxy(tmpObj);
            arg0 = (cocos2d::ui::RichElementEx*)(jsProxy ? jsProxy->ptr : NULL);
            JSB_PRECONDITION2( arg0, cx, false, "Invalid Native Object");
        } while (0);
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_ui_custom_RichTextEx_insertElement : Error processing arguments");
        cobj->insertElement(arg0, arg1);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichTextEx_insertElement : wrong number of arguments: %d, was expecting %d", argc, 2);
    return false;
}
bool js_cocos2dx_ui_custom_RichTextEx_getVerticalSpace(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichTextEx* cobj = (cocos2d::ui::RichTextEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichTextEx_getVerticalSpace : Invalid Native Object");
    if (argc == 0) {
        double ret = cobj->getVerticalSpace();
        jsval jsret = JSVAL_NULL;
        jsret = DOUBLE_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichTextEx_getVerticalSpace : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_ui_custom_RichTextEx_getEmptyLineHeight(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichTextEx* cobj = (cocos2d::ui::RichTextEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichTextEx_getEmptyLineHeight : Invalid Native Object");
    if (argc == 0) {
        double ret = cobj->getEmptyLineHeight();
        jsval jsret = JSVAL_NULL;
        jsret = DOUBLE_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichTextEx_getEmptyLineHeight : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_ui_custom_RichTextEx_pushBackElement(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichTextEx* cobj = (cocos2d::ui::RichTextEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichTextEx_pushBackElement : Invalid Native Object");
    if (argc == 1) {
        cocos2d::ui::RichElementEx* arg0 = nullptr;
        do {
            if (args.get(0).isNull()) { arg0 = nullptr; break; }
            if (!args.get(0).isObject()) { ok = false; break; }
            js_proxy_t *jsProxy;
            JS::RootedObject tmpObj(cx, args.get(0).toObjectOrNull());
            jsProxy = jsb_get_js_proxy(tmpObj);
            arg0 = (cocos2d::ui::RichElementEx*)(jsProxy ? jsProxy->ptr : NULL);
            JSB_PRECONDITION2( arg0, cx, false, "Invalid Native Object");
        } while (0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_ui_custom_RichTextEx_pushBackElement : Error processing arguments");
        cobj->pushBackElement(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichTextEx_pushBackElement : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_ui_custom_RichTextEx_getHorizontalAlignment(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichTextEx* cobj = (cocos2d::ui::RichTextEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichTextEx_getHorizontalAlignment : Invalid Native Object");
    if (argc == 0) {
        int ret = (int)cobj->getHorizontalAlignment();
        jsval jsret = JSVAL_NULL;
        jsret = int32_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichTextEx_getHorizontalAlignment : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_ui_custom_RichTextEx_ignoreContentAdaptWithSize(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichTextEx* cobj = (cocos2d::ui::RichTextEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichTextEx_ignoreContentAdaptWithSize : Invalid Native Object");
    if (argc == 1) {
        bool arg0;
        arg0 = JS::ToBoolean(args.get(0));
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_ui_custom_RichTextEx_ignoreContentAdaptWithSize : Error processing arguments");
        cobj->ignoreContentAdaptWithSize(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichTextEx_ignoreContentAdaptWithSize : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_ui_custom_RichTextEx_setAnchorPoint(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichTextEx* cobj = (cocos2d::ui::RichTextEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichTextEx_setAnchorPoint : Invalid Native Object");
    if (argc == 1) {
        cocos2d::Vec2 arg0;
        ok &= jsval_to_vector2(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_ui_custom_RichTextEx_setAnchorPoint : Error processing arguments");
        cobj->setAnchorPoint(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichTextEx_setAnchorPoint : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_ui_custom_RichTextEx_setVerticalSpace(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichTextEx* cobj = (cocos2d::ui::RichTextEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichTextEx_setVerticalSpace : Invalid Native Object");
    if (argc == 1) {
        double arg0 = 0;
        ok &= JS::ToNumber( cx, args.get(0), &arg0) && !isnan(arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_ui_custom_RichTextEx_setVerticalSpace : Error processing arguments");
        cobj->setVerticalSpace(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichTextEx_setVerticalSpace : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_ui_custom_RichTextEx_setHorizontalAlignment(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichTextEx* cobj = (cocos2d::ui::RichTextEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichTextEx_setHorizontalAlignment : Invalid Native Object");
    if (argc == 1) {
        cocos2d::TextHAlignment arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_ui_custom_RichTextEx_setHorizontalAlignment : Error processing arguments");
        cobj->setHorizontalAlignment(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichTextEx_setHorizontalAlignment : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_ui_custom_RichTextEx_formatText(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichTextEx* cobj = (cocos2d::ui::RichTextEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichTextEx_formatText : Invalid Native Object");
    if (argc == 0) {
        cobj->formatText();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichTextEx_formatText : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_ui_custom_RichTextEx_removeElement(JSContext *cx, uint32_t argc, jsval *vp)
{
    bool ok = true;
    cocos2d::ui::RichTextEx* cobj = nullptr;

    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx);
    obj.set(args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cobj = (cocos2d::ui::RichTextEx *)(proxy ? proxy->ptr : nullptr);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichTextEx_removeElement : Invalid Native Object");
    do {
        if (argc == 1) {
            cocos2d::ui::RichElementEx* arg0 = nullptr;
            do {
                if (args.get(0).isNull()) { arg0 = nullptr; break; }
                if (!args.get(0).isObject()) { ok = false; break; }
                js_proxy_t *jsProxy;
                JS::RootedObject tmpObj(cx, args.get(0).toObjectOrNull());
                jsProxy = jsb_get_js_proxy(tmpObj);
                arg0 = (cocos2d::ui::RichElementEx*)(jsProxy ? jsProxy->ptr : NULL);
                JSB_PRECONDITION2( arg0, cx, false, "Invalid Native Object");
            } while (0);
            if (!ok) { ok = true; break; }
            cobj->removeElement(arg0);
            args.rval().setUndefined();
            return true;
        }
    } while(0);

    do {
        if (argc == 1) {
            int arg0 = 0;
            ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
            if (!ok) { ok = true; break; }
            cobj->removeElement(arg0);
            args.rval().setUndefined();
            return true;
        }
    } while(0);

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichTextEx_removeElement : wrong number of arguments");
    return false;
}
bool js_cocos2dx_ui_custom_RichTextEx_setEmptyLineHeight(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cocos2d::ui::RichTextEx* cobj = (cocos2d::ui::RichTextEx *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_ui_custom_RichTextEx_setEmptyLineHeight : Invalid Native Object");
    if (argc == 1) {
        double arg0 = 0;
        ok &= JS::ToNumber( cx, args.get(0), &arg0) && !isnan(arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_ui_custom_RichTextEx_setEmptyLineHeight : Error processing arguments");
        cobj->setEmptyLineHeight(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichTextEx_setEmptyLineHeight : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_ui_custom_RichTextEx_create(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {

        auto ret = cocos2d::ui::RichTextEx::create();
        js_type_class_t *typeClass = js_get_type_from_native<cocos2d::ui::RichTextEx>(ret);
        JS::RootedObject jsret(cx, jsb_ref_autoreleased_create_jsobject(cx, ret, typeClass, "cocos2d::ui::RichTextEx"));
        args.rval().set(OBJECT_TO_JSVAL(jsret));
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_ui_custom_RichTextEx_create : wrong number of arguments");
    return false;
}

bool js_cocos2dx_ui_custom_RichTextEx_constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    cocos2d::ui::RichTextEx* cobj = new (std::nothrow) cocos2d::ui::RichTextEx();

    js_type_class_t *typeClass = js_get_type_from_native<cocos2d::ui::RichTextEx>(cobj);

    // link the native object with the javascript object
    JS::RootedObject jsobj(cx, jsb_ref_create_jsobject(cx, cobj, typeClass, "cocos2d::ui::RichTextEx"));
    args.rval().set(OBJECT_TO_JSVAL(jsobj));
    if (JS_HasProperty(cx, jsobj, "_ctor", &ok) && ok)
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(jsobj), "_ctor", args);
    return true;
}
static bool js_cocos2dx_ui_custom_RichTextEx_ctor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    cocos2d::ui::RichTextEx *nobj = new (std::nothrow) cocos2d::ui::RichTextEx();
    auto newproxy = jsb_new_proxy(nobj, obj);
    jsb_ref_init(cx, &newproxy->obj, nobj, "cocos2d::ui::RichTextEx");
    bool isFound = false;
    if (JS_HasProperty(cx, obj, "_ctor", &isFound) && isFound)
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(obj), "_ctor", args);
    args.rval().setUndefined();
    return true;
}


extern JSObject *jsb_cocos2d_ui_Widget_prototype;

    
void js_register_cocos2dx_ui_custom_RichTextEx(JSContext *cx, JS::HandleObject global) {
    jsb_cocos2d_ui_RichTextEx_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_cocos2d_ui_RichTextEx_class->name = "RichTextEx";
    jsb_cocos2d_ui_RichTextEx_class->addProperty = JS_PropertyStub;
    jsb_cocos2d_ui_RichTextEx_class->delProperty = JS_DeletePropertyStub;
    jsb_cocos2d_ui_RichTextEx_class->getProperty = JS_PropertyStub;
    jsb_cocos2d_ui_RichTextEx_class->setProperty = JS_StrictPropertyStub;
    jsb_cocos2d_ui_RichTextEx_class->enumerate = JS_EnumerateStub;
    jsb_cocos2d_ui_RichTextEx_class->resolve = JS_ResolveStub;
    jsb_cocos2d_ui_RichTextEx_class->convert = JS_ConvertStub;
	jsb_cocos2d_ui_RichTextEx_class->finalize = js_cocos2dx_ui_custom_RichTextEx_finalize;
    jsb_cocos2d_ui_RichTextEx_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("insertElement", js_cocos2dx_ui_custom_RichTextEx_insertElement, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getVerticalSpace", js_cocos2dx_ui_custom_RichTextEx_getVerticalSpace, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getEmptyLineHeight", js_cocos2dx_ui_custom_RichTextEx_getEmptyLineHeight, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("pushBackElement", js_cocos2dx_ui_custom_RichTextEx_pushBackElement, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getHorizontalAlignment", js_cocos2dx_ui_custom_RichTextEx_getHorizontalAlignment, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("ignoreContentAdaptWithSize", js_cocos2dx_ui_custom_RichTextEx_ignoreContentAdaptWithSize, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setAnchorPoint", js_cocos2dx_ui_custom_RichTextEx_setAnchorPoint, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setVerticalSpace", js_cocos2dx_ui_custom_RichTextEx_setVerticalSpace, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setHorizontalAlignment", js_cocos2dx_ui_custom_RichTextEx_setHorizontalAlignment, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("formatText", js_cocos2dx_ui_custom_RichTextEx_formatText, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("removeElement", js_cocos2dx_ui_custom_RichTextEx_removeElement, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setEmptyLineHeight", js_cocos2dx_ui_custom_RichTextEx_setEmptyLineHeight, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("ctor", js_cocos2dx_ui_custom_RichTextEx_ctor, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("create", js_cocos2dx_ui_custom_RichTextEx_create, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    JS::RootedObject parent_proto(cx, jsb_cocos2d_ui_Widget_prototype);
    jsb_cocos2d_ui_RichTextEx_prototype = JS_InitClass(
        cx, global,
        parent_proto,
        jsb_cocos2d_ui_RichTextEx_class,
        js_cocos2dx_ui_custom_RichTextEx_constructor, 0, // constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);

    // add the proto and JSClass to the type->js info hash table
    JS::RootedObject proto(cx, jsb_cocos2d_ui_RichTextEx_prototype);
    jsb_register_class<cocos2d::ui::RichTextEx>(cx, jsb_cocos2d_ui_RichTextEx_class, proto, parent_proto);
    anonEvaluate(cx, global, "(function () { ccui.RichTextEx.extend = cc.Class.extend; })()");
}

void register_all_cocos2dx_ui_custom(JSContext* cx, JS::HandleObject obj) {
    // Get the ns
    JS::RootedObject ns(cx);
    get_or_create_js_obj(cx, obj, "ccui", &ns);

    js_register_cocos2dx_ui_custom_RichElementEx(cx, ns);
    js_register_cocos2dx_ui_custom_RichElementCustomNodeEx(cx, ns);
    js_register_cocos2dx_ui_custom_RichTextEx(cx, ns);
    js_register_cocos2dx_ui_custom_RichElementTextEx(cx, ns);
    js_register_cocos2dx_ui_custom_RichElementImageEx(cx, ns);
}

