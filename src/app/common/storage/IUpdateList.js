/**
 * 更新列表
 * Created by lex on 2016/12/06.
 */

var IUpdateList = IData.extend({
    ctor : function(jsonData)
    {
        createSetterGetter(this, "updateList", null, true);
        if(jsonData)
           setUpdateList(jsonData);
    },
    update : function(jsonData) {
        setUpdateList(jsonData);
    }
});