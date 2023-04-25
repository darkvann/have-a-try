class ConstructorContainer{
    constructor(str,name) {
        this.value = str;
        this.name = name;
        //解析构造函数头
        let headerWords = str.split('\n')[0].trim().split(/\s+/);
        this.modifiers = [];
        for (let p=0;p<headerWords.length;p++){
            if (headerWords[p].indexOf(name) !== -1){
                for (let k=0;k<p;k++){
                    this.modifiers.push(Modifier.getModifier(headerWords[k]));
                }
                break;
            }
        }
        this.paramType = str.split("\n")[0].trim().match(/(?<=\().*(?=\))/g).toString();
        for (let p=0;p<str.length;p++){
            if (str[p] === "{"){
                this.body = str.slice(p,);
                break;
            }
        }
    }
    //返回函数体
    getBody(){
        return this.body;
    }

    //返回完整的构造函数头
    getHeader(){
        return this.value.split('\n')[0].replace("{",'').trim();
    }

    //返回修饰符 返回值为枚举列表，需要用Modifier.getDeclaration()转化
    getModifier(){
        return this.modifiers;
    }

    //返回构造函数名
    getName(){
        return this.name;
    }

    //返回参数类型，返回值为String
    getParamType(){
        return this.paramType;
    }

    //返回参数列表，返回值为字符串列表
    getParamList(){
        return this.paramType.split(",");
    }
}