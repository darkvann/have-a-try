class Tools{

    /*
     * 从开始位置向下找出下一个代码块
     * 参数：startP 查找开始位置；fileStr 字符串格式的文件串
     * 返回值为[代码块开始位置flagP,代码块结束位置endP,从startP开始到endP被截取的代码块]
     */
    static findNextCodeBlock(startP,fileStr){
        let endP = startP+1;
        let leftCurlyBracketsNum = 0; //遇到左大括号+1，遇到右大括号-1

        let flagP = startP;  //代码块第一个{所在行
        for (let k=startP;k<fileStr.length;k++){
            //先找第一个{
            if (fileStr[k]==="{"){
                leftCurlyBracketsNum += 1;
                flagP = k+1;
                break;
            }
        }
        for (let k=flagP;k<fileStr.length;k++){
            if (fileStr[k] === "{")
                leftCurlyBracketsNum++;
            if (fileStr[k] === "}")
                leftCurlyBracketsNum--;
            if (leftCurlyBracketsNum === 0){
                endP = k;
                break;
            }
        }
        return [flagP-1,endP,fileStr.slice(startP,endP+1)];
    }
}