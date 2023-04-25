class InterfaceFunctionContainer{
    constructor(str) {
        this.vlaue = str;
    }

    //获取完整的接口函数表达式(无;)
    getHeader(){
        return this.vlaue.replace(';','');
    }

    //获取返回值类型
    getReturnType(){
        let a = this.vlaue.split('(')[0].trim().split(/\s+/);
        return a[a.length-2]
    }

    //获取修饰符列表(接口中的修饰符无用,但书写不会造成语法报错) 返回值为int数组，需要用Modifier.getDeclaration()翻译成字符串
    getModifier(){
        let a = this.vlaue.split('(')[0].trim().split(/\s+/);
        return a.slice(0,a.length-2).map(value => {
            return Modifier.getModifier(value);
        })
    }

    //获取函数名
    getName(){
        let a = this.vlaue.split('(')[0].trim().split(/\s+/);
        return a[a.length-1];
    }

    //获取参数 一个字符串整体
    getParamString(){
        return this.vlaue.match(/(?<=\().*(?=\))/)[0];
    }

    //获取参数列表
    getParamList(){
        return this.getParamString().split(',');
    }
}