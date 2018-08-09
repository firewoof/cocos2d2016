/**
 * Created by 玲英 on 2016/11/11.
 */
DrawLineHelper = function(){

};

/**
 * 通用--根据行情生成分时图线绘制数据(只关心数据，不做绘制)
 * @param args
 * @returns {boolean}
 */
DrawLineHelper.getDrawLineData = function(args)
{
    var lineData = args["lineData"];                        //行情数据队列
    var startIndex = args["startIndex"];                    //绘制起始点
    var endIndex = args["endIndex"];                        //绘制终点
    var stride = args["stride"];                            //采集步长
    var timeScale = args["timeScale"];                      //当前画布x轴方向数据[start-end]所表达的总时间尺度
    var importantTimeArray = args["importantTimeArray"];    //重要时间点(这些点的绘制采集允许忽略，比如下单点)
    var contentSize = args["contentSize"];                  //k线区画布大小
    var formulas = args["formulas"];                        //k线区的转换公式集合
    var vertices = args["vertices"];                        //顶点池 (存放samplePoint对象)
    var minWaveRange = args["minWaveRange"];                //最小波动范围(用来缩小来回震荡行情的k线幅度表现)

    if(stride != 1)
    {
        //cc.log("stride::", stride);
        //这里设置采集起始点
        startIndex = startIndex + (stride - startIndex % stride);
    }

    if(startIndex < 0)
        startIndex = 0;
    //容错
    if((lineData.getDataLength() - 1) < endIndex){
        endIndex = lineData.getDataLength() - 1;
    }

    var dataArray = lineData.getDataArray();

    //开始计算统计绘制数据
    var heightGap = contentSize.height * 0.38;
    var width = contentSize.width;
    var height = contentSize.height - heightGap;
    var maxOffsetYPos = height * 0.5;   //中心线离两边最大的绘制偏移

    var startXValue = 0;
    var startYValue = 0;
    //先尝试找到一个基准值
    for(var i = startIndex; i <= endIndex; i += stride){
        var data = dataArray[i];
        if(data && data.isUsefull()){
            startXValue = data.getXValue();
            startYValue = data.getYValue();
            break;
        }

    }

    //找出最大值，最小值
    var maxYValue = startYValue;
    var minYValue = startYValue;
    for(var i = startIndex; i <= endIndex; i += stride)
    {
        var data = dataArray[i];
        if(!data || !data.isUsefull()){
            continue;
        }
        var tempYValue = data.getYValue();
        if(tempYValue > maxYValue)
            maxYValue = tempYValue;
        if(tempYValue < minYValue)
            minYValue = tempYValue;
    }

    //找出最大值，最小值 ----遍历不可忽略点
    for(var i = 0; i < importantTimeArray.length; i++)
    {
        var tempIndex = lineData.getIndexByTime(importantTimeArray[i]);
        var data = dataArray[tempIndex];
        if(!data || !data.isUsefull()){
            continue;
        }
        var tempYValue = data.getYValue();
        if(tempYValue > maxYValue)
            maxYValue = tempYValue;
        if(tempYValue < minYValue)
            minYValue = tempYValue;

    }

    //调整幅度
    var waveRange = maxYValue - minYValue;
    if(minWaveRange && minWaveRange > waveRange) {
        var fixedPadding = (minWaveRange - waveRange) * 0.5;
        minYValue -= fixedPadding;
        maxYValue += fixedPadding;
    }

    //中心值
    var centerYValue = minYValue + (maxYValue - minYValue) / 2;

    //为了刻度上不重叠(如果变化太小，不做处理的话刻度会显得不正常，比如直线行情)
    var precise = lineData.getProductInfo().getPrecise();
    var preciseUnit = Math.pow(10, -precise);   //precise 是5位的话， preciseUnit就是0.00001
    var diffYValue = Math.max(Math.abs(centerYValue - minYValue), Math.abs(maxYValue - centerYValue));
    //至少留n个精度
    if(diffYValue <  preciseUnit * 3){
        maxYValue = centerYValue + preciseUnit * 3;
    }

    //这样可以保证第一个数据，绘制时处于中心位置
    var  maxOffsetValue = maxYValue - centerYValue;  //离第一个数据的OffsetValue
    var centerYPos = contentSize.height * 0.5;

    //设置绘制定点
    //var startXValue = dataArray[startIndex].getXValue();
    var xValueLen = timeScale;

    var verticesCount = 0;
    var betLength = importantTimeArray.length;   //下单个数
    var betInsertCount = 0;

    //================生成公式======================
    //值转y轴的计算公式
    formulas.getYPosByValue = function(yValue)
    {
        var offsetPercent  = (yValue - centerYValue) / maxOffsetValue;  //在半屏中偏移比重
        var result = centerYPos + offsetPercent * maxOffsetYPos;
        return result;
    };

    //y坐标转值的计算公式
    formulas.getYValueByPos = function(posY)
    {
        //距离中心偏移比例
        var offsetPercent = (posY - centerYPos) / maxOffsetYPos;
        return  centerYValue + offsetPercent * maxOffsetValue;
    };

    //值转x轴的计算公式
    formulas.getXPosByValue = function(xValue)
    {
        return (xValue - startXValue) / xValueLen * width;
    };

    //x轴转值的计算公式
    formulas.getXValueByPos = function(posX)
    {
        return posX / width * xValueLen + startXValue;
    };

    var drawingEndIndex = endIndex;
    //==============开始遍历所有踩点===========
    for(var i = startIndex; i <= endIndex; i += stride)
    {
        var data = dataArray[i];
        //没有数据则忽略
        if(!data || !data.isUsefull()){
            continue;
        }

        var xPos = (data.getXValue() - startXValue) / xValueLen * width;
        var yOffsetRate  = (data.getYValue() - centerYValue) / maxOffsetValue;  //在半屏中偏移比重
        if(yOffsetRate > 1)
        {
            cc.log("yValue超出预期：：", data.getYValue() );
        }

        var yPos =  centerYPos + yOffsetRate * maxOffsetYPos;

        var point = cc.p(xPos, yPos);
        //需要添加到实际行情点
        var verticesCount = DrawLineHelper.pushVerticesValue(point, vertices, verticesCount);
        //vertices[verticesCount++] = point;

        //将下单的点也加入(防止下单点被采集间隔忽略，导致对应不上趋势图线的位置)
        if(betLength > 0 && betInsertCount < betLength)
        {
            for(var betIdx = betInsertCount; betIdx < betLength; betIdx++)
            {
                var betTime = importantTimeArray[betIdx];
                if((i + stride) <= endIndex && data.getXValue() >= betTime && betTime < dataArray[i + stride].getXValue())
                {
                    var dataXValue = data.getXValue();
                    var dataYValue = data.getYValue();
                    var xPos = (dataXValue - startXValue) / xValueLen * width;
                    var yOffsetRate  = (dataYValue - centerYValue) / maxOffsetValue;  //在半屏中偏移比重
                    var yPos =  centerYPos + yOffsetRate * maxOffsetYPos;
                    var point = cc.p(xPos, yPos);
                    //vertices[verticesCount++] = point;
                    verticesCount = DrawLineHelper.pushVerticesValue(point, vertices, verticesCount);
                    betInsertCount++;
                }
                else
                {
                    break;
                }
            }
        }
        drawingEndIndex = i;
    }

    //超出末尾踩点的 重要点
    for(var i = 0; i < betLength; i++){
        var betTime = importantTimeArray[i];
        var index = lineData.getIndexByTime(betTime);
        if(index && index >  drawingEndIndex)
        {
            var data = dataArray[index];
            if(!data || !data.isUsefull()){
                continue;
            }
            try{
                var point = cc.p(formulas.getXPosByValue(data.getXValue()), formulas.getYPosByValue(data.getYValue()));
                //vertices[verticesCount++] = point;
                verticesCount = DrawLineHelper.pushVerticesValue(point, vertices, verticesCount);
                betInsertCount++;
            }catch (e){
                cc.log("异常:: ", TimeHelper.formatSecs(lineData.getDataArray()[0].getXValue() + index));
                cc.log("betTime::", TimeHelper.formatSecs(betTime));
                cc.log("index::", index);
            }
        }
    }

    //cc.log("verticesCount::", verticesCount);

    //附带到新增
    args["verticesCount"] = verticesCount;

    return args;
};

/**
 * 通用--根据行情生成k线绘制数据(只关心数据，不做绘制)
 * @param args
 * @returns {boolean}
 */
DrawLineHelper.getDrawKLineData = function(args)
{
    var klineData = args["klineData"];                        //行情数据队列
    var startTime = args["startTime"];                    //绘制起始点
    var endTime = args["endTime"];                        //绘制终点
    var timeScale = args["timeScale"];                      //当前画布x轴方向数据[start-end]所表达的总时间尺度
    var contentSize = args["contentSize"];                  //k线区画布大小
    var formulas = args["formulas"];                        //k线区的转换公式集合
    var minWaveRange = args["minWaveRange"];                //最小波动范围(用来缩小来回震荡行情的k线幅度表现)

    var dataArray = klineData.getDataArray();

    var startIndex = klineData.getIndexByTime(startTime);
    var endIndex = klineData.getIndexByTime(endTime);

    //开始计算统计绘制数据
    var heightGap = contentSize.height * 0.38;
    var width = contentSize.width;
    var height = contentSize.height - heightGap;
    var maxOffsetYPos = height * 0.5;   //中心线离两边最大的绘制偏移

    //找出最大值，最小值
    var maxYValue = -1;
    var minYValue = 99999999;
    for(var i = startIndex; i <= endIndex; i++)
    {
        var data = dataArray[i];
        if(data == undefined){
            continue;
        }
        var lowValue = data.getLowValue();
        var highValue = data.getHighValue();
        if(lowValue == undefined || highValue == undefined)
            continue;
        if(highValue > maxYValue)
            maxYValue = highValue;
        if(lowValue < minYValue)
            minYValue = lowValue;
    }

    //调整幅度
    var waveRange = maxYValue - minYValue;
    if(minWaveRange && minWaveRange > waveRange) {
        var fixedPadding = (minWaveRange - waveRange) * 0.5;
        minYValue -= fixedPadding;
        maxYValue += fixedPadding;
    }

    //中心值
    var centerYValue = minYValue + (maxYValue - minYValue) / 2;

    //为了刻度上不重叠(如果变化太小，不做处理的话刻度会显得不正常，比如直线行情)
    var precise = klineData.getProductInfo().getPrecise();
    var preciseUnit = Math.pow(10, -precise);   //precise 是5位的话， preciseUnit就是0.00001
    var diffYValue = Math.max(Math.abs(centerYValue - minYValue), Math.abs(maxYValue - centerYValue));
    //至少留n个精度
    if(diffYValue <  preciseUnit * 3){
        maxYValue = centerYValue + preciseUnit * 3;
    }

    //这样可以保证第一个数据，绘制时处于中心位置
    var  maxOffsetValue = maxYValue - centerYValue;  //离第一个数据的OffsetValue
    var centerYPos = contentSize.height * 0.5;

    //设置绘制定点
    var startXValue = startTime;
    var xValueLen = timeScale;

    //================生成公式======================
    //值转y轴的计算公式
    formulas.getYPosByValue = function(yValue)
    {
        var offsetPercent  = (yValue - centerYValue) / maxOffsetValue;  //在半屏中偏移比重
        var result = centerYPos + offsetPercent * maxOffsetYPos;
        return result;
    };

    //y坐标转值的计算公式
    formulas.getYValueByPos = function(posY)
    {
        //距离中心偏移比例
        var offsetPercent = (posY - centerYPos) / maxOffsetYPos;
        return  centerYValue + offsetPercent * maxOffsetValue;
    };

    //值转x轴的计算公式
    formulas.getXPosByValue = function(xValue)
    {
        return (xValue - startXValue) / xValueLen * width;
    };

    //x轴转值的计算公式
    formulas.getXValueByPos = function(posX)
    {
        return posX / width * xValueLen + startXValue;
    };
    return args;
};


/**
 * 添加顶点数据
 * @param point
 */
DrawLineHelper.pushVerticesValue = function(point, vertices ,verticesCount)
{
    var preVert = vertices[verticesCount - 2];
    var preSecVert = vertices[verticesCount - 1];
    //省绘制，如果三个点y轴相同，则直接将第二个点顶替掉
    if(preVert && preSecVert && preVert.y == preSecVert.y && preSecVert.y == point.y){
        preSecVert.x = point.x;
    }else{
        vertices[verticesCount++] = point;
    }

    return verticesCount;
}