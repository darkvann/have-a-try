class FunctionContainer{
    constructor(str) {
        this.value = str;
        let headerLine = str.split('\n')[0].trim();
        let flag = headerLine.search(/\(.*\)/);
        let headwords = headerLine.slice(0,flag).trim().split(/\s+/);
        this.name = headwords[headwords.length-1];
        this.returnType = headwords[headwords.length-2];
        this.modifier = Modifier.toModifier(headwords.slice(0,headwords.length-2).join(' '));
        this.params = headerLine.match(/(?<=\().*(?=\))/g).toString();
    }

    //获取完整函数头
    getHeader(){
        return this.value.split('\n')[0].trim().replace("{",'');
    }

    //获取代码体
    getBody(){
        for (let p=0;p<this.value.length;p++){
            if (this.value[p] === "{"){
                return this.value.slice(p,);
            }
        }
    }

    //获取参数 返回值为整个字符串
    getParamString(){
        return this.params;
    }

    //获取参数列表 返回值为字符串列表
    getParamList(){
        return this.params.split(",");
    }

    //获取函数名
    getName(){
        return this.name;
    }

    //获取返回值类型
    getReturnType(){
        return this.returnType;
    }

    //获取修饰符枚举列表，需要Modifier.getDeclaration()翻译
    getModifier(){
        return this.modifier;
    }

}