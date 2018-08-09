#include "jsb_custom_auto.hpp"
#include "cocos2d_specifics.hpp"
#include "NativeTool.h"
#include "GameFileUtils.h"
#include "NetworkManager.h"
#include "EventGame.h"

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
JSClass  *jsb_NativeTool_class;
JSObject *jsb_NativeTool_prototype;

bool js_custom_NativeTool_generateAESKey(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {

        std::string ret = NativeTool::generateAESKey();
        jsval jsret = JSVAL_NULL;
        jsret = std_string_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_custom_NativeTool_generateAESKey : wrong number of arguments");
    return false;
}

bool js_custom_NativeTool_AESEncryt(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 2) {
        std::string arg0;
        const char* arg1 = nullptr;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        std::string arg1_tmp; ok &= jsval_to_std_string(cx, args.get(1), &arg1_tmp); arg1 = arg1_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_custom_NativeTool_AESEncryt : Error processing arguments");

        std::string ret = NativeTool::AESEncryt(arg0, arg1);
        jsval jsret = JSVAL_NULL;
        jsret = std_string_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_custom_NativeTool_AESEncryt : wrong number of arguments");
    return false;
}

bool js_custom_NativeTool_openPhoto(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        std::function<void (std::basic_string<char>)> arg0;
        do {
		    if(JS_TypeOfValue(cx, args.get(0)) == JSTYPE_FUNCTION)
		    {
		        JS::RootedObject jstarget(cx, args.thisv().toObjectOrNull());
		        std::shared_ptr<JSFunctionWrapper> func(new JSFunctionWrapper(cx, jstarget, args.get(0)));
		        auto lambda = [=](std::basic_string<char> larg0) -> void {
		            JSB_AUTOCOMPARTMENT_WITH_GLOBAL_OBJCET
		            jsval largv[1];
		            largv[0] = std_string_to_jsval(cx, larg0);
		            JS::RootedValue rval(cx);
		            bool succeed = func->invoke(1, &largv[0], &rval);
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
        JSB_PRECONDITION2(ok, cx, false, "js_custom_NativeTool_openPhoto : Error processing arguments");
        NativeTool::openPhoto(arg0);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_custom_NativeTool_openPhoto : wrong number of arguments");
    return false;
}

bool js_custom_NativeTool_getCurMillSecs(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {

        double ret = NativeTool::getCurMillSecs();
        jsval jsret = JSVAL_NULL;
        jsret = DOUBLE_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_custom_NativeTool_getCurMillSecs : wrong number of arguments");
    return false;
}

bool js_custom_NativeTool_downloadImage(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 2) {
        std::string arg0;
        std::function<void (std::basic_string<char> &)> arg1;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        do {
		    if(JS_TypeOfValue(cx, args.get(1)) == JSTYPE_FUNCTION)
		    {
		        JS::RootedObject jstarget(cx, args.thisv().toObjectOrNull());
		        std::shared_ptr<JSFunctionWrapper> func(new JSFunctionWrapper(cx, jstarget, args.get(1)));
		        auto lambda = [=](std::basic_string<char> & larg0) -> void {
		            JSB_AUTOCOMPARTMENT_WITH_GLOBAL_OBJCET
		            jsval largv[1];
		            largv[0] = std_string_to_jsval(cx, larg0);
		            JS::RootedValue rval(cx);
		            bool succeed = func->invoke(1, &largv[0], &rval);
		            if (!succeed && JS_IsExceptionPending(cx)) {
		                JS_ReportPendingException(cx);
		            }
		        };
		        arg1 = lambda;
		    }
		    else
		    {
		        arg1 = nullptr;
		    }
		} while(0)
		;
        JSB_PRECONDITION2(ok, cx, false, "js_custom_NativeTool_downloadImage : Error processing arguments");
        NativeTool::downloadImage(arg0, arg1);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_custom_NativeTool_downloadImage : wrong number of arguments");
    return false;
}

bool js_custom_NativeTool_AESDecryt(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 2) {
        std::string arg0;
        const char* arg1 = nullptr;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        std::string arg1_tmp; ok &= jsval_to_std_string(cx, args.get(1), &arg1_tmp); arg1 = arg1_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_custom_NativeTool_AESDecryt : Error processing arguments");

        std::string ret = NativeTool::AESDecryt(arg0, arg1);
        jsval jsret = JSVAL_NULL;
        jsret = std_string_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_custom_NativeTool_AESDecryt : wrong number of arguments");
    return false;
}

bool js_custom_NativeTool_openCamera(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        std::function<void (std::basic_string<char>)> arg0;
        do {
		    if(JS_TypeOfValue(cx, args.get(0)) == JSTYPE_FUNCTION)
		    {
		        JS::RootedObject jstarget(cx, args.thisv().toObjectOrNull());
		        std::shared_ptr<JSFunctionWrapper> func(new JSFunctionWrapper(cx, jstarget, args.get(0)));
		        auto lambda = [=](std::basic_string<char> larg0) -> void {
		            JSB_AUTOCOMPARTMENT_WITH_GLOBAL_OBJCET
		            jsval largv[1];
		            largv[0] = std_string_to_jsval(cx, larg0);
		            JS::RootedValue rval(cx);
		            bool succeed = func->invoke(1, &largv[0], &rval);
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
        JSB_PRECONDITION2(ok, cx, false, "js_custom_NativeTool_openCamera : Error processing arguments");
        NativeTool::openCamera(arg0);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_custom_NativeTool_openCamera : wrong number of arguments");
    return false;
}

bool js_custom_NativeTool_getClockTick(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {

        double ret = NativeTool::getClockTick();
        jsval jsret = JSVAL_NULL;
        jsret = DOUBLE_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_custom_NativeTool_getClockTick : wrong number of arguments");
    return false;
}

bool js_custom_NativeTool_stringByMD5(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        std::string arg0;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_custom_NativeTool_stringByMD5 : Error processing arguments");

        std::string ret = NativeTool::stringByMD5(arg0);
        jsval jsret = JSVAL_NULL;
        jsret = std_string_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_custom_NativeTool_stringByMD5 : wrong number of arguments");
    return false;
}

bool js_custom_NativeTool_constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    NativeTool* cobj = new (std::nothrow) NativeTool();

    js_type_class_t *typeClass = js_get_type_from_native<NativeTool>(cobj);

    // link the native object with the javascript object
    JS::RootedObject proto(cx, typeClass->proto.ref());
    JS::RootedObject parent(cx, typeClass->parentProto.ref());
    JS::RootedObject jsobj(cx, JS_NewObject(cx, typeClass->jsclass, proto, parent));
    js_proxy_t* p = jsb_new_proxy(cobj, jsobj);
    AddNamedObjectRoot(cx, &p->obj, "NativeTool");
    args.rval().set(OBJECT_TO_JSVAL(jsobj));
    if (JS_HasProperty(cx, jsobj, "_ctor", &ok) && ok)
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(jsobj), "_ctor", args);
    return true;
}


void js_NativeTool_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOGINFO("jsbindings: finalizing JS object %p (NativeTool)", obj);
    js_proxy_t* nproxy;
    js_proxy_t* jsproxy;
    JSContext *cx = ScriptingCore::getInstance()->getGlobalContext();
    JS::RootedObject jsobj(cx, obj);
    jsproxy = jsb_get_js_proxy(jsobj);
    if (jsproxy) {
        NativeTool *nobj = static_cast<NativeTool *>(jsproxy->ptr);
        nproxy = jsb_get_native_proxy(jsproxy->ptr);

        if (nobj) {
            jsb_remove_proxy(nproxy, jsproxy);
            delete nobj;
        }
        else
            jsb_remove_proxy(nullptr, jsproxy);
    }
}
void js_register_custom_NativeTool(JSContext *cx, JS::HandleObject global) {
    jsb_NativeTool_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_NativeTool_class->name = "NativeTool";
    jsb_NativeTool_class->addProperty = JS_PropertyStub;
    jsb_NativeTool_class->delProperty = JS_DeletePropertyStub;
    jsb_NativeTool_class->getProperty = JS_PropertyStub;
    jsb_NativeTool_class->setProperty = JS_StrictPropertyStub;
    jsb_NativeTool_class->enumerate = JS_EnumerateStub;
    jsb_NativeTool_class->resolve = JS_ResolveStub;
    jsb_NativeTool_class->convert = JS_ConvertStub;
    jsb_NativeTool_class->finalize = js_NativeTool_finalize;
    jsb_NativeTool_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("generateAESKey", js_custom_NativeTool_generateAESKey, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("AESEncryt", js_custom_NativeTool_AESEncryt, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("openPhoto", js_custom_NativeTool_openPhoto, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getCurMillSecs", js_custom_NativeTool_getCurMillSecs, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("downloadImage", js_custom_NativeTool_downloadImage, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("AESDecryt", js_custom_NativeTool_AESDecryt, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("openCamera", js_custom_NativeTool_openCamera, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getClockTick", js_custom_NativeTool_getClockTick, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("stringByMD5", js_custom_NativeTool_stringByMD5, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    jsb_NativeTool_prototype = JS_InitClass(
        cx, global,
        JS::NullPtr(),
        jsb_NativeTool_class,
        js_custom_NativeTool_constructor, 0, // constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);

    // add the proto and JSClass to the type->js info hash table
    JS::RootedObject proto(cx, jsb_NativeTool_prototype);
    jsb_register_class<NativeTool>(cx, jsb_NativeTool_class, proto, JS::NullPtr());
}

JSClass  *jsb_GameFileUtils_class;
JSObject *jsb_GameFileUtils_prototype;

bool js_custom_GameFileUtils_getFileListInPath(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 0) {

        std::vector<std::string> ret = GameFileUtils::getFileListInPath();
        jsval jsret = JSVAL_NULL;
        jsret = std_vector_string_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    if (argc == 1) {
        std::string arg0;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_custom_GameFileUtils_getFileListInPath : Error processing arguments");

        std::vector<std::string> ret = GameFileUtils::getFileListInPath(arg0);
        jsval jsret = JSVAL_NULL;
        jsret = std_vector_string_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    if (argc == 2) {
        std::string arg0;
        bool arg1;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        arg1 = JS::ToBoolean(args.get(1));
        JSB_PRECONDITION2(ok, cx, false, "js_custom_GameFileUtils_getFileListInPath : Error processing arguments");

        std::vector<std::string> ret = GameFileUtils::getFileListInPath(arg0, arg1);
        jsval jsret = JSVAL_NULL;
        jsret = std_vector_string_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_custom_GameFileUtils_getFileListInPath : wrong number of arguments");
    return false;
}

bool js_custom_GameFileUtils_getFileList(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 2) {
        std::string arg0;
        std::vector<std::string> arg1;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        ok &= jsval_to_std_vector_string(cx, args.get(1), &arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_custom_GameFileUtils_getFileList : Error processing arguments");

        std::vector<std::string> ret = GameFileUtils::getFileList(arg0, arg1);
        jsval jsret = JSVAL_NULL;
        jsret = std_vector_string_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    if (argc == 3) {
        std::string arg0;
        std::vector<std::string> arg1;
        bool arg2;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        ok &= jsval_to_std_vector_string(cx, args.get(1), &arg1);
        arg2 = JS::ToBoolean(args.get(2));
        JSB_PRECONDITION2(ok, cx, false, "js_custom_GameFileUtils_getFileList : Error processing arguments");

        std::vector<std::string> ret = GameFileUtils::getFileList(arg0, arg1, arg2);
        jsval jsret = JSVAL_NULL;
        jsret = std_vector_string_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_custom_GameFileUtils_getFileList : wrong number of arguments");
    return false;
}

bool js_custom_GameFileUtils_writeStringToFile(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 2) {
        std::string arg0;
        std::string arg1;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        ok &= jsval_to_std_string(cx, args.get(1), &arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_custom_GameFileUtils_writeStringToFile : Error processing arguments");

        int ret = GameFileUtils::writeStringToFile(arg0, arg1);
        jsval jsret = JSVAL_NULL;
        jsret = int32_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    if (argc == 3) {
        std::string arg0;
        std::string arg1;
        std::string arg2;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        ok &= jsval_to_std_string(cx, args.get(1), &arg1);
        ok &= jsval_to_std_string(cx, args.get(2), &arg2);
        JSB_PRECONDITION2(ok, cx, false, "js_custom_GameFileUtils_writeStringToFile : Error processing arguments");

        int ret = GameFileUtils::writeStringToFile(arg0, arg1, arg2);
        jsval jsret = JSVAL_NULL;
        jsret = int32_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_custom_GameFileUtils_writeStringToFile : wrong number of arguments");
    return false;
}

bool js_custom_GameFileUtils_createPath(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        std::string arg0;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_custom_GameFileUtils_createPath : Error processing arguments");

        int ret = GameFileUtils::createPath(arg0);
        jsval jsret = JSVAL_NULL;
        jsret = int32_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_custom_GameFileUtils_createPath : wrong number of arguments");
    return false;
}

bool js_custom_GameFileUtils_writeFile(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 2) {
        std::string arg0;
        cocos2d::Data arg1;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        do {
            if (!args.get(1).isObject()) { ok = false; break; }
            js_proxy_t *jsProxy;
            JS::RootedObject jsobj(cx, args[1].toObjectOrNull());
            uint8_t *bufdata = NULL;
            uint32_t len = 0;

            if (JS_IsArrayBufferObject(jsobj))
            {
                bufdata = JS_GetArrayBufferData(jsobj);
                len = JS_GetArrayBufferByteLength(jsobj);
            }
            else if (JS_IsArrayBufferViewObject(jsobj))
            {
                bufdata = (uint8_t*)JS_GetArrayBufferViewData(jsobj);
                len = JS_GetArrayBufferViewByteLength(jsobj);
            }

            arg1.copy(bufdata, len);
            JSB_PRECONDITION2( &arg1, cx, false, "Invalid Native Object");
        } while (0);
        JSB_PRECONDITION2(ok, cx, false, "js_custom_GameFileUtils_writeFile : Error processing arguments");

        int ret = GameFileUtils::writeFile(arg0, &arg1);
        jsval jsret = JSVAL_NULL;
        jsret = int32_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    if (argc == 3) {
        std::string arg0;
        cocos2d::Data arg1;
        std::string arg2;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        do {
            /*
            if (args.get(1).isNull()) { arg1 = nullptr; break; }
            if (!args.get(1).isObject()) { ok = false; break; }
            js_proxy_t *jsProxy;
            JS::RootedObject tmpObj(cx, args.get(1).toObjectOrNull());
            jsProxy = jsb_get_js_proxy(tmpObj);
            arg1 = (cocos2d::Data*)(jsProxy ? jsProxy->ptr : NULL);
            JSB_PRECONDITION2( arg1, cx, false, "Invalid Native Object");
            */
            if (!args.get(1).isObject()) { ok = false; break; }
            js_proxy_t *jsProxy;
            JS::RootedObject jsobj(cx, args[1].toObjectOrNull());
            uint8_t *bufdata = NULL;
            uint32_t len = 0;

            if (JS_IsArrayBufferObject(jsobj))
            {
                bufdata = JS_GetArrayBufferData(jsobj);
                len = JS_GetArrayBufferByteLength(jsobj);
            }
            else if (JS_IsArrayBufferViewObject(jsobj))
            {
                bufdata = (uint8_t*)JS_GetArrayBufferViewData(jsobj);
                len = JS_GetArrayBufferViewByteLength(jsobj);
            }

            arg1.copy(bufdata, len);
            JSB_PRECONDITION2(&arg1, cx, false, "Invalid Native Object");
        } while (0);
        ok &= jsval_to_std_string(cx, args.get(2), &arg2);
        JSB_PRECONDITION2(ok, cx, false, "js_custom_GameFileUtils_writeFile : Error processing arguments");

        int ret = GameFileUtils::writeFile(arg0, &arg1, arg2);
        jsval jsret = JSVAL_NULL;
        jsret = int32_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_custom_GameFileUtils_writeFile : wrong number of arguments");
    return false;
}

bool js_custom_GameFileUtils_removeAllFiles(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        std::string arg0;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_custom_GameFileUtils_removeAllFiles : Error processing arguments");
        GameFileUtils::removeAllFiles(arg0);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_custom_GameFileUtils_removeAllFiles : wrong number of arguments");
    return false;
}

bool js_custom_GameFileUtils_getFileNameListInPath(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 2) {
        std::string arg0;
        bool arg1;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        arg1 = JS::ToBoolean(args.get(1));
        JSB_PRECONDITION2(ok, cx, false, "js_custom_GameFileUtils_getFileNameListInPath : Error processing arguments");

        std::vector<std::string> ret = GameFileUtils::getFileNameListInPath(arg0, arg1);
        jsval jsret = JSVAL_NULL;
        jsret = std_vector_string_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_custom_GameFileUtils_getFileNameListInPath : wrong number of arguments");
    return false;
}

bool js_custom_GameFileUtils_deleteFile(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        std::string arg0;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_custom_GameFileUtils_deleteFile : Error processing arguments");

        int ret = GameFileUtils::deleteFile(arg0);
        jsval jsret = JSVAL_NULL;
        jsret = int32_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_custom_GameFileUtils_deleteFile : wrong number of arguments");
    return false;
}

bool js_custom_GameFileUtils_getWritablePath(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {

        std::string ret = GameFileUtils::getWritablePath();
        jsval jsret = JSVAL_NULL;
        jsret = std_string_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_custom_GameFileUtils_getWritablePath : wrong number of arguments");
    return false;
}

bool js_custom_GameFileUtils_constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    GameFileUtils* cobj = new (std::nothrow) GameFileUtils();

    js_type_class_t *typeClass = js_get_type_from_native<GameFileUtils>(cobj);

    // link the native object with the javascript object
    JS::RootedObject proto(cx, typeClass->proto.ref());
    JS::RootedObject parent(cx, typeClass->parentProto.ref());
    JS::RootedObject jsobj(cx, JS_NewObject(cx, typeClass->jsclass, proto, parent));
    js_proxy_t* p = jsb_new_proxy(cobj, jsobj);
    AddNamedObjectRoot(cx, &p->obj, "GameFileUtils");
    args.rval().set(OBJECT_TO_JSVAL(jsobj));
    if (JS_HasProperty(cx, jsobj, "_ctor", &ok) && ok)
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(jsobj), "_ctor", args);
    return true;
}


void js_GameFileUtils_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOGINFO("jsbindings: finalizing JS object %p (GameFileUtils)", obj);
    js_proxy_t* nproxy;
    js_proxy_t* jsproxy;
    JSContext *cx = ScriptingCore::getInstance()->getGlobalContext();
    JS::RootedObject jsobj(cx, obj);
    jsproxy = jsb_get_js_proxy(jsobj);
    if (jsproxy) {
        GameFileUtils *nobj = static_cast<GameFileUtils *>(jsproxy->ptr);
        nproxy = jsb_get_native_proxy(jsproxy->ptr);

        if (nobj) {
            jsb_remove_proxy(nproxy, jsproxy);
            delete nobj;
        }
        else
            jsb_remove_proxy(nullptr, jsproxy);
    }
}
void js_register_custom_GameFileUtils(JSContext *cx, JS::HandleObject global) {
    jsb_GameFileUtils_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_GameFileUtils_class->name = "GameFileUtils";
    jsb_GameFileUtils_class->addProperty = JS_PropertyStub;
    jsb_GameFileUtils_class->delProperty = JS_DeletePropertyStub;
    jsb_GameFileUtils_class->getProperty = JS_PropertyStub;
    jsb_GameFileUtils_class->setProperty = JS_StrictPropertyStub;
    jsb_GameFileUtils_class->enumerate = JS_EnumerateStub;
    jsb_GameFileUtils_class->resolve = JS_ResolveStub;
    jsb_GameFileUtils_class->convert = JS_ConvertStub;
    jsb_GameFileUtils_class->finalize = js_GameFileUtils_finalize;
    jsb_GameFileUtils_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("getFileListInPath", js_custom_GameFileUtils_getFileListInPath, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getFileList", js_custom_GameFileUtils_getFileList, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("writeStringToFile", js_custom_GameFileUtils_writeStringToFile, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("createPath", js_custom_GameFileUtils_createPath, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("writeFile", js_custom_GameFileUtils_writeFile, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("removeAllFiles", js_custom_GameFileUtils_removeAllFiles, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getFileNameListInPath", js_custom_GameFileUtils_getFileNameListInPath, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("deleteFile", js_custom_GameFileUtils_deleteFile, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getWritablePath", js_custom_GameFileUtils_getWritablePath, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    jsb_GameFileUtils_prototype = JS_InitClass(
        cx, global,
        JS::NullPtr(),
        jsb_GameFileUtils_class,
        js_custom_GameFileUtils_constructor, 0, // constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);

    // add the proto and JSClass to the type->js info hash table
    JS::RootedObject proto(cx, jsb_GameFileUtils_prototype);
    jsb_register_class<GameFileUtils>(cx, jsb_GameFileUtils_class, proto, JS::NullPtr());
}

JSClass  *jsb_NetworkManager_class;
JSObject *jsb_NetworkManager_prototype;

bool js_custom_NetworkManager_tryConnectToServer(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 2) {
        std::string arg0;
        unsigned short arg1 = 0;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        ok &= jsval_to_ushort(cx, args.get(1), &arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_custom_NetworkManager_tryConnectToServer : Error processing arguments");

        int ret = NetworkManager::tryConnectToServer(arg0, arg1);
        jsval jsret = JSVAL_NULL;
        jsret = int32_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_custom_NetworkManager_tryConnectToServer : wrong number of arguments");
    return false;
}

bool js_custom_NetworkManager_check_heartbeat(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 2) {
        long long arg0 = 0;
        long long arg1 = 0;
        ok &= jsval_to_long_long(cx, args.get(0), &arg0);
        ok &= jsval_to_long_long(cx, args.get(1), &arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_custom_NetworkManager_check_heartbeat : Error processing arguments");
        NetworkManager::check_heartbeat(arg0, arg1);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_custom_NetworkManager_check_heartbeat : wrong number of arguments");
    return false;
}

bool js_custom_NetworkManager_disconnect(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        NetworkManager::disconnect();
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_custom_NetworkManager_disconnect : wrong number of arguments");
    return false;
}

bool js_custom_NetworkManager_setAESKEY(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 2) {
        std::string arg0;
        std::string arg1;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        ok &= jsval_to_std_string(cx, args.get(1), &arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_custom_NetworkManager_setAESKEY : Error processing arguments");
        NetworkManager::setAESKEY(arg0, arg1);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_custom_NetworkManager_setAESKEY : wrong number of arguments");
    return false;
}

bool js_custom_NetworkManager_getRequestData(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        NetworkManager::getRequestData();
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_custom_NetworkManager_getRequestData : wrong number of arguments");
    return false;
}

bool js_custom_NetworkManager_connectToServer(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 2) {
        std::string arg0;
        unsigned short arg1 = 0;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        ok &= jsval_to_ushort(cx, args.get(1), &arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_custom_NetworkManager_connectToServer : Error processing arguments");
        NetworkManager::connectToServer(arg0, arg1);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_custom_NetworkManager_connectToServer : wrong number of arguments");
    return false;
}

bool js_custom_NetworkManager_dispatchAndReleaseAllEvent(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        NetworkManager::dispatchAndReleaseAllEvent();
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_custom_NetworkManager_dispatchAndReleaseAllEvent : wrong number of arguments");
    return false;
}

bool js_custom_NetworkManager_onReceiveData(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        cocos2d::Data* arg0 = nullptr;
        do {
            if (args.get(0).isNull()) { arg0 = nullptr; break; }
            if (!args.get(0).isObject()) { ok = false; break; }
            js_proxy_t *jsProxy;
            JS::RootedObject tmpObj(cx, args.get(0).toObjectOrNull());
            jsProxy = jsb_get_js_proxy(tmpObj);
            arg0 = (cocos2d::Data*)(jsProxy ? jsProxy->ptr : NULL);
            JSB_PRECONDITION2( arg0, cx, false, "Invalid Native Object");
        } while (0);
        JSB_PRECONDITION2(ok, cx, false, "js_custom_NetworkManager_onReceiveData : Error processing arguments");
        NetworkManager::onReceiveData(arg0);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_custom_NetworkManager_onReceiveData : wrong number of arguments");
    return false;
}

bool js_custom_NetworkManager_dispatchEventSafe(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        std::string arg0;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_custom_NetworkManager_dispatchEventSafe : Error processing arguments");
        NetworkManager::dispatchEventSafe(arg0);
        args.rval().setUndefined();
        return true;
    }
    if (argc == 2) {
        std::string arg0;
        std::string arg1;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        ok &= jsval_to_std_string(cx, args.get(1), &arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_custom_NetworkManager_dispatchEventSafe : Error processing arguments");
        NetworkManager::dispatchEventSafe(arg0, arg1);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_custom_NetworkManager_dispatchEventSafe : wrong number of arguments");
    return false;
}

bool js_custom_NetworkManager_changeEncrytKey(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        std::string arg0;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_custom_NetworkManager_changeEncrytKey : Error processing arguments");
        NetworkManager::changeEncrytKey(arg0);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_custom_NetworkManager_changeEncrytKey : wrong number of arguments");
    return false;
}

bool js_custom_NetworkManager_check_keepalived(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 2) {
        long long arg0 = 0;
        long long arg1 = 0;
        ok &= jsval_to_long_long(cx, args.get(0), &arg0);
        ok &= jsval_to_long_long(cx, args.get(1), &arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_custom_NetworkManager_check_keepalived : Error processing arguments");

        bool ret = NetworkManager::check_keepalived(arg0, arg1);
        jsval jsret = JSVAL_NULL;
        jsret = BOOLEAN_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_custom_NetworkManager_check_keepalived : wrong number of arguments");
    return false;
}

bool js_custom_NetworkManager_addRequest(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        std::string arg0;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_custom_NetworkManager_addRequest : Error processing arguments");
        NetworkManager::addRequest(arg0);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_custom_NetworkManager_addRequest : wrong number of arguments");
    return false;
}

bool js_custom_NetworkManager_constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    NetworkManager* cobj = new (std::nothrow) NetworkManager();

    js_type_class_t *typeClass = js_get_type_from_native<NetworkManager>(cobj);

    // link the native object with the javascript object
    JS::RootedObject proto(cx, typeClass->proto.ref());
    JS::RootedObject parent(cx, typeClass->parentProto.ref());
    JS::RootedObject jsobj(cx, JS_NewObject(cx, typeClass->jsclass, proto, parent));
    js_proxy_t* p = jsb_new_proxy(cobj, jsobj);
    AddNamedObjectRoot(cx, &p->obj, "NetworkManager");
    args.rval().set(OBJECT_TO_JSVAL(jsobj));
    if (JS_HasProperty(cx, jsobj, "_ctor", &ok) && ok)
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(jsobj), "_ctor", args);
    return true;
}


void js_NetworkManager_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOGINFO("jsbindings: finalizing JS object %p (NetworkManager)", obj);
    js_proxy_t* nproxy;
    js_proxy_t* jsproxy;
    JSContext *cx = ScriptingCore::getInstance()->getGlobalContext();
    JS::RootedObject jsobj(cx, obj);
    jsproxy = jsb_get_js_proxy(jsobj);
    if (jsproxy) {
        NetworkManager *nobj = static_cast<NetworkManager *>(jsproxy->ptr);
        nproxy = jsb_get_native_proxy(jsproxy->ptr);

        if (nobj) {
            jsb_remove_proxy(nproxy, jsproxy);
            delete nobj;
        }
        else
            jsb_remove_proxy(nullptr, jsproxy);
    }
}
void js_register_custom_NetworkManager(JSContext *cx, JS::HandleObject global) {
    jsb_NetworkManager_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_NetworkManager_class->name = "NetworkManager";
    jsb_NetworkManager_class->addProperty = JS_PropertyStub;
    jsb_NetworkManager_class->delProperty = JS_DeletePropertyStub;
    jsb_NetworkManager_class->getProperty = JS_PropertyStub;
    jsb_NetworkManager_class->setProperty = JS_StrictPropertyStub;
    jsb_NetworkManager_class->enumerate = JS_EnumerateStub;
    jsb_NetworkManager_class->resolve = JS_ResolveStub;
    jsb_NetworkManager_class->convert = JS_ConvertStub;
    jsb_NetworkManager_class->finalize = js_NetworkManager_finalize;
    jsb_NetworkManager_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("tryConnectToServer", js_custom_NetworkManager_tryConnectToServer, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("check_heartbeat", js_custom_NetworkManager_check_heartbeat, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("disconnect", js_custom_NetworkManager_disconnect, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setAESKEY", js_custom_NetworkManager_setAESKEY, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getRequestData", js_custom_NetworkManager_getRequestData, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("connectToServer", js_custom_NetworkManager_connectToServer, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("dispatchAndReleaseAllEvent", js_custom_NetworkManager_dispatchAndReleaseAllEvent, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("onReceiveData", js_custom_NetworkManager_onReceiveData, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("dispatchEventSafe", js_custom_NetworkManager_dispatchEventSafe, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("changeEncrytKey", js_custom_NetworkManager_changeEncrytKey, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("check_keepalived", js_custom_NetworkManager_check_keepalived, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("addRequest", js_custom_NetworkManager_addRequest, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    jsb_NetworkManager_prototype = JS_InitClass(
        cx, global,
        JS::NullPtr(),
        jsb_NetworkManager_class,
        js_custom_NetworkManager_constructor, 0, // constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);

    // add the proto and JSClass to the type->js info hash table
    JS::RootedObject proto(cx, jsb_NetworkManager_prototype);
    jsb_register_class<NetworkManager>(cx, jsb_NetworkManager_class, proto, JS::NullPtr());
}

JSClass  *jsb_EventGame_class;
JSObject *jsb_EventGame_prototype;

bool js_custom_EventGame_getStrData(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EventGame* cobj = (EventGame *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_custom_EventGame_getStrData : Invalid Native Object");
    if (argc == 0) {
        const std::string& ret = cobj->getStrData();
        jsval jsret = JSVAL_NULL;
        jsret = std_string_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_custom_EventGame_getStrData : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_custom_EventGame_setStrData(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EventGame* cobj = (EventGame *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_custom_EventGame_setStrData : Invalid Native Object");
    if (argc == 1) {
        std::string arg0;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_custom_EventGame_setStrData : Error processing arguments");
        cobj->setStrData(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_custom_EventGame_setStrData : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_custom_EventGame_constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    std::string arg0;
    ok &= jsval_to_std_string(cx, args.get(0), &arg0);
    JSB_PRECONDITION2(ok, cx, false, "js_custom_EventGame_constructor : Error processing arguments");
    EventGame* cobj = new (std::nothrow) EventGame(arg0);

    js_type_class_t *typeClass = js_get_type_from_native<EventGame>(cobj);

    // link the native object with the javascript object
    JS::RootedObject jsobj(cx, jsb_ref_create_jsobject(cx, cobj, typeClass, "EventGame"));
    args.rval().set(OBJECT_TO_JSVAL(jsobj));
    if (JS_HasProperty(cx, jsobj, "_ctor", &ok) && ok)
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(jsobj), "_ctor", args);
    return true;
}


extern JSObject *jsb_cocos2d_EventCustom_prototype;

void js_register_custom_EventGame(JSContext *cx, JS::HandleObject global) {
    jsb_EventGame_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_EventGame_class->name = "EventGame";
    jsb_EventGame_class->addProperty = JS_PropertyStub;
    jsb_EventGame_class->delProperty = JS_DeletePropertyStub;
    jsb_EventGame_class->getProperty = JS_PropertyStub;
    jsb_EventGame_class->setProperty = JS_StrictPropertyStub;
    jsb_EventGame_class->enumerate = JS_EnumerateStub;
    jsb_EventGame_class->resolve = JS_ResolveStub;
    jsb_EventGame_class->convert = JS_ConvertStub;
    jsb_EventGame_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("getStrData", js_custom_EventGame_getStrData, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setStrData", js_custom_EventGame_setStrData, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    JSFunctionSpec *st_funcs = NULL;

    JS::RootedObject parent_proto(cx, jsb_cocos2d_EventCustom_prototype);
    jsb_EventGame_prototype = JS_InitClass(
        cx, global,
        parent_proto,
        jsb_EventGame_class,
        js_custom_EventGame_constructor, 0, // constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);

    // add the proto and JSClass to the type->js info hash table
    JS::RootedObject proto(cx, jsb_EventGame_prototype);
    jsb_register_class<EventGame>(cx, jsb_EventGame_class, proto, parent_proto);
}

void register_all_custom(JSContext* cx, JS::HandleObject obj) {
    // Get the ns
    JS::RootedObject ns(cx);
    get_or_create_js_obj(cx, obj, "cs", &ns);

    js_register_custom_NativeTool(cx, ns);
    js_register_custom_GameFileUtils(cx, ns);
    js_register_custom_EventGame(cx, ns);
    js_register_custom_NetworkManager(cx, ns);
}

