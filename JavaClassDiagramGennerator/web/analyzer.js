function analyzer(compilationUnitList){
    // console.log(compilationUnitList);
    let classInfoList = [];
    for (let p=0;p < compilationUnitList.length ;p++){
        let compilationUnit = compilationUnitList[p];
        let currentPackage = compilationUnit.getPackageContainer().getPackageName();

        let classOrInterfaceContainers = compilationUnit.getClassOrInterfaceContainer();
        classOrInterfaceContainers.forEach(classOrInterfaceContainer => {
            let classInfo = getClassInfo(classOrInterfaceContainer);
            classInfoList.push(classInfo);
            function getClassInfo(classOrInterfaceContainer){
                let classInfo = {};
                //获取基本信息
                classInfo.package = currentPackage;
                classInfo.isInnerClass = classOrInterfaceContainer.isInnerClass;
                if (!classInfo.isInnerClass)
                    classInfo.className = classOrInterfaceContainer.getName();
                else
                    classInfo.name = classOrInterfaceContainer.getName();
                classInfo.extends = classOrInterfaceContainer.getExtends();
                classInfo.interface = classOrInterfaceContainer.getImplements();
                if (!classInfo.isInnerClass)
                    classInfo.modifiers = Modifier.getDeclaration(classOrInterfaceContainer.getModifier());
                else
                    classInfo.modifier = classOrInterfaceContainer.getModifier().map(value => {return Modifier[value]})
                classInfo.body = classOrInterfaceContainer.getBody();
                //获取内部类或内部接口信息
                let innerClasses = [];
                classOrInterfaceContainer.getInnerClassOrInterfaceContainers().forEach(innerC=>{
                    let innerClassInfo = getClassInfo(innerC);
                    innerClasses.push(innerClassInfo);
                })
                classInfo.innerClasses = innerClasses;

                //类
                if (classOrInterfaceContainer.isClass){
                    //获取构造函数信息
                    let constructors = [];
                    classOrInterfaceContainer.getConstructorContainers().forEach(constr=>{
                        let constructor = {};
                        constructor.constrName = constr.getName();
                        constructor.body =constr.getBody().split("\n").join('\r\n');
                        constructor.constrDeclaration = constr.getHeader();
                        constructor.constrModifier = Modifier.getDeclaration(constr.getModifier());
                        let paramList = constr.getParamList();
                        constructor.constrParams = paramList.map(value => {return value.split(/\s+/)[0]})
                        constructor.detailedParams = paramList.map(value => {return {name:value.split(/\s+/)[1],type:value.split(/\s+/)[0]}})
                        constructors.push(constructor);
                    })
                    classInfo.constructors = constructors;
                    //获取一般函数信息
                    let methods = [];
                    classOrInterfaceContainer.getFunctionContainers().forEach(md=>{
                        let method = {};
                        method.MethodName = md.getName();
                        method.declaration = md.getHeader();
                        method.methodBody =md.getBody().split("\n").join('\r\n');
                        method.modifier = Modifier.getDeclaration(md.getModifier());
                        method.returnType = md.getReturnType();
                        let paramList = md.getParamList();
                        method.params = paramList.map(value => {return value.split(/\s+/)[0]})
                        method.detailedParams = paramList.map(value => {return {paramName:value.split(/\s+/)[1],paramType:value.split(/\s+/)[0]}})
                        methods.push(method);
                    })
                    classInfo.methods = methods;
                    let field = {};
                    field.variables = classOrInterfaceContainer.getVariableContainer().getVariableList().map(value => {return value+";"});
                    classInfo.field = field;
                }else {
                    //接口信息获取
                    classInfo.constructors = [];
                    let methods = [];
                    classOrInterfaceContainer.getFunctionContainers().forEach(md=>{
                        let method = {};
                        method.MethodName = md.getName();
                        method.declaration = md.getHeader();
                        method.methodBody ="";
                        method.modifier = "";
                        method.returnType = md.getReturnType();
                        let paramList = md.getParamList();
                        method.params = paramList.map(value => {return value.split(/\s+/)[0]})
                        method.detailedParams = paramList.map(value => {return {paramName:value.split(/\s+/)[1],paramType:value.split(/\s+/)[0]}})
                        methods.push(method);
                    })
                    classInfo.methods = methods;
                    let field = {};
                    field.variables = classOrInterfaceContainer.getVariableContainer().getVariableList().map(value => {return value+";"});
                    classInfo.field = field;
                }

                return classInfo;
                // classInfoList.push(classInfo)
            }

        })
    }

    return classInfoList;
    // console.log(classInfoList)
}