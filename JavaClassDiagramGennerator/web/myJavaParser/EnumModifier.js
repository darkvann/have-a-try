/*
 * 使用修饰符枚举类的方法
*/
class Modifier{
    static 0 = "public";
    static 1 = "private";
    static 2 = "protected";
    static 3 = "default";
    static 4 = "friendly";
    static 5 = "abstract";
    static 6 = "static";
    static 7 = "final";
    static 8 = "native";
    static 9 = "synchronized";
    static 10 = "volatile";
    static 11 = "transient";

    // 将单个修饰符翻译成枚举,不是枚举就返回-1
    static getModifier(str){
        switch (str) {
            case Modifier["0"]: return 0;
            case Modifier["1"]: return 1;
            case Modifier["2"]: return 2;
            case Modifier["3"]: return 3;
            case Modifier["4"]: return 4;
            case Modifier["5"]: return 5;
            case Modifier["6"]: return 6;
            case Modifier["7"]: return 7;
            case Modifier["8"]: return 8;
            case Modifier["9"]: return 9;
            case Modifier["10"]: return 10;
            case Modifier["11"]: return 11;
            default: return -1;
        }
    }

    // 判断一个单词的字符串是不是修饰符
    static isModifier(str){
        return this.getModifier(str) !== -1;
    }

    // 判断字符串是否为修饰符组合
    static isModifierStr(str){
        str.split(/\s+/).forEach(value => {
            if (!this.isModifier(value)) return false;
        })
        return true;
    }

    // 将一个字符串翻译成枚举/枚举数组,参数不是修饰符字符串返回-1
    static toModifier(str){
        if (!this.isModifierStr(str)) return -1;

        let modifiers = [];
        str.split(/\s+/).forEach(value => {
            modifiers[modifiers.length] = this.getModifier(value);
        })
        return modifiers;
    }

    // nums:int[]
    // 将枚举列表翻译成修饰符字符串返回
    static getDeclaration(nums){
        let str = '';
        nums.forEach((value,index)=>{
            if (str.length===0)str += Modifier[value];
            else str += " "+Modifier[value];
        })
        return str;
    }
}