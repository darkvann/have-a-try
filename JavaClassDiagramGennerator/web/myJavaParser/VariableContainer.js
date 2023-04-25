class VariableContainer{
    variables = [];

    constructor() {
    }

    //添加一个变量定义语句到容器中
    addVariable(str){
        //对像int a,b;这样的连续定义进行拆分存储
        let reg = /[a-zA-Z0-9]+(,[a-zA-Z0-9]+)+/;
        if (reg.test(str)){
            let names = str.match(reg)[0];
            let definitionExpName = str.replace(names,'');
            names.split(',').forEach(value => {
                this.variables.push(definitionExpName.replace(";",'')+value.trim());
            })
        }else {
            this.variables.push(str.replace(";",''));
        }
    }

    //获取变量列表 返回值为字符串数组，每个元素为完整的变量定义表达式（无;）
    getVariableList(){
        return this.variables;
    }

    //获取简化变量列表(仅类型+变量名）
    getSimplifiedVariableList(){
        return this.variables.map(value => {
            let x = value.split('=')[0].split(' ')
            let modifierNum = 0;
            for (let p=0;p<x.length;p++){
                if (Modifier.isModifier(x[p])){
                    modifierNum++;
                }else {
                    break;
                }
            }
            return x.slice(modifierNum,).join(" ");
        })
    }

}