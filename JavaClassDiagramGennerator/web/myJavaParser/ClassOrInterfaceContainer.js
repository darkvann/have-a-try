class ClassOrInterfaceContainer{
    extends='';
    implements=[];
    constructor(lines,isInnerClassOrInterface) {
        this.originalText = lines.join('\n');
        this.isInnerClass = isInnerClassOrInterface || false;
        //先判断是类还是接口
        if (ClassOrInterfaceContainer.isClassOrInterfaceHeader(lines[0].trim()) === 1){
            this.isClass = true;
            this.isInterface = false;
        }else {
            this.isClass = false;
            this.isInterface = true;
        }

        //读取类头的修饰符、类名、继承、实现信息
        let headerWords = lines[0].trim().split(/\s+/);
        this.modifier = [];
        for (let p = 0; p < headerWords.length; p++) {
            //修饰符、类名
            if (headerWords[p] === "class" || headerWords[p] === "interface") {
                this.name = headerWords[p + 1].replace('{','');
                for (let k = 0; k < p; k++) {
                    this.modifier.push(Modifier.getModifier(headerWords[k]));
                }
            }
            if (headerWords[p].indexOf("extends") !== -1) {
                if (headerWords[p + 1].indexOf("{") !== -1)
                    this.extends = headerWords[p + 1].slice(0, headerWords[p + 1].indexOf("{"));
                else
                    this.extends = headerWords[p + 1];
            }
            if (headerWords[p] === "implements") {
                for (let k = p + 1; k < headerWords.length; k++) {
                    if (headerWords[k].trim() === "{")
                        break;
                    else if (headerWords[k].indexOf("{") !== -1)
                        this.implements = this.implements.concat(headerWords[k].slice(0, headerWords[k].indexOf("{")).split(','))
                    else
                        this.implements = this.implements.concat(headerWords[k].split(','))
                }
            }
        }

        let fileStr = lines.join("\n");
        let deleteStrings = [];
        //生成类容器(内部类)、接口容器(内部接口)
        this.InnerClassContainers =[];
        for(let p=1;p<lines.length;p++){
            if (ClassOrInterfaceContainer.isClassOrInterfaceHeader(lines[p].trim()) !== -1){
                let startP = fileStr.indexOf(lines[p]);
                let block = Tools.findNextCodeBlock(startP,fileStr)[2]
                deleteStrings.push(block);
                this.InnerClassContainers.push(new ClassOrInterfaceContainer(block.split('\n'),true));
            }
        }
        deleteStrings.forEach(value => {
            fileStr = fileStr.replace(value,'');
        })
        lines = fileStr.split('\n');
        deleteStrings = [];

        if (this.isClass) {
            //生成构造函数容器,一般函数容器
            this.constructorContainers = [];
            this.functionContainers = [];
            //判断构造函数头
            let regForConstructorS = new RegExp(this.name + "\\s*\\(.*\\)"); //不完整形式
            let regForConstructor = new RegExp(this.name + "\\s*\\(.*\\)\\s*{", 'g'); //完整形式
            //判断一般函数头
            let regForFunctions = /\(.*\)/; //初步判断
            let regForFunction = /\(.*\)\s*{/; //完整判断

            for (let p = 0; p < lines.length; p++) {
                //这里需要判断”(){“结构，有的写法会换行写{，需要先判断一半（两种写法相同的部分）再两行拼一起判断，直接拼一起判断也还需要再判断语法
                if (regForConstructorS.test(lines[p]))
                    if (regForConstructor.test([lines[p], lines[p + 1]].join(''))) {
                        let startP = fileStr.indexOf(lines[p]);
                        let blockInfo = Tools.findNextCodeBlock(startP, fileStr);
                        this.constructorContainers.push(new ConstructorContainer(blockInfo[2], this.name));

                        //记录代码块,最后一起从fileStr中删除已处理代码块(后面处理一般函数也一样,方便最后处理变量)
                        deleteStrings.push(blockInfo[2]);
                    }
            }
            deleteStrings.forEach(value => {
                fileStr = fileStr.replace(value, '');
            })

            let noConstructorLines = fileStr.split("\n");
            deleteStrings = [];
            for (let p = 0; p < noConstructorLines.length; p++) {
                //这里需要判断”(){“结构，需要两行一起判断
                if (regForFunctions.test(noConstructorLines[p]))
                    if (regForFunction.test([noConstructorLines[p], noConstructorLines[p + 1]].join(''))) {
                        let startP = fileStr.indexOf(noConstructorLines[p]);
                        let block = Tools.findNextCodeBlock(startP,fileStr);
                        this.functionContainers.push(new FunctionContainer(block[2]));
                        deleteStrings.push(block[2]);
                    }
            }
            deleteStrings.forEach(value => {
                fileStr = fileStr.replace(value,'');
            })
            let justFieldLines = fileStr.split("\n");

            //生成变量容器,它需要一个一个地扫描添加变量，因此要先生成
            this.variableContainer = new VariableContainer();
            //匹配变量定义式（无修饰符）
            let regForVariable = /[a-zA-Z0-9<>\[\]]+\s+[a-zA-Z0-9]+(,[a-zA-Z0-9]+)*(\s*=\s*.*)?;$/;
            for (let p=1;p<justFieldLines.length;p++){
                let definitionWords = justFieldLines[p].trim().split(/\s+/);
                let modifierNum = 0;
                for (let k=0;k<definitionWords.length;k++){
                    //修饰符开头只能是变量定义或者类中的接口函数
                    if (Modifier.isModifier(definitionWords[k])){
                        //标记去除修饰符，然后正则匹配
                        modifierNum+=1;
                    }else {
                        if (regForVariable.test(definitionWords.slice(modifierNum).join(' '))){
                            let target = definitionWords.slice(0,modifierNum);
                            target.push(definitionWords.slice(modifierNum).join(' ').match(regForVariable)[0])
                            this.variableContainer.addVariable(target.join(' '))
                            break;
                        }
                    }

                }
            }

        }else {
            //接口子容器生成
            let fileStr = lines.join("\n");
            let deleteStrings = [];
            //生成接口函数容器
            this.functionContainers = [];
            this.variableContainer = new VariableContainer();
            //匹配函数接口语法
            let regForInterfaceFunction = /[a-zA-Z0-9<>\[\]]+\s+[a-zA-Z0-9]+\s*\(.*\);$/;
            //匹配变脸定义语句
            let regForVariable = /[a-zA-Z0-9<>\[\]]+\s+[a-zA-Z0-9]+(,[a-zA-Z0-9]+)*(\s*=\s*.*)?;$/;
            for (let p=0;p<lines.length;p++){
                let headWords = lines[p].trim().split(/\s+/);
                let modifierNum = 0;
                for (let k=0;k<headWords.length;k++){
                    //虽然接口中修饰符无效，但书写不会造成语法错误，所以还是要进行判断
                    if (Modifier.isModifier(headWords[k])){
                        modifierNum++;
                    }else {
                        if (regForInterfaceFunction.test(headWords.slice(modifierNum,).join(" "))){
                            let x = headWords.slice(0,modifierNum)
                            x.push(headWords.slice(modifierNum,).join(" ").match(regForInterfaceFunction)[0])
                            this.functionContainers.push(new InterfaceFunctionContainer(x.join(" ")))
                            break;
                        }else if (regForVariable.test(headWords.slice(modifierNum,).join(" "))){
                            let target = headWords.slice(0,modifierNum);
                            target.push(headWords.slice(modifierNum).join(' ').match(regForVariable)[0])
                            this.variableContainer.addVariable(target.join(' '))
                            break;
                        }
                    }
                }
            }

        }

    }

    //获取类修饰符,返回值为枚举列表，需要用Modifier.getDeclaration(this.getModifier())获取字符串
    getModifier(){
        return this.modifier;
    }

    //获取类名
    getName(){
        return this.name;
    }

    //获取父类
    getExtends(){
        return this.extends;
    }

    //获取接口列表
    getImplements(){
        return this.implements;
    }

    //获取类代码体
    getBody(){
        return this.originalText.slice(this.originalText.indexOf("{"),).trim();
    }

    //获取构造函数容器对象列表
    getConstructorContainers(){
        if (!this.isClass)return null;
        return this.constructorContainers;
    }

    //获取方法容器对象列表
    getFunctionContainers(){
        return this.functionContainers;
    }

    //获取内部类容器/内部接口容器 对象列表
    getInnerClassOrInterfaceContainers(){
        return this.InnerClassContainers;
    }

    //获取变量容器对象
    getVariableContainer(){
        return this.variableContainer;
    }

    /*
     * 判断一行字符串是不是类头或接口头
     * 返回值： 1 表示类头，2 表示接口头， -1表示非类头或接口头
     */
    static isClassOrInterfaceHeader(str){
        let keys = str.split(/\s+/);
        if (keys.indexOf("class")!==-1){
            return 1;
        }else if (keys.indexOf("interface")!==-1){
            return 2;
        }else {
            return -1;
        }
    }

}