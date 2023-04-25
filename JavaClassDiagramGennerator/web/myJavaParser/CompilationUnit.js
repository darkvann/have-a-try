class CompilationUnit{
    constructor(file) {
        let fileLines = file.trim().split("\n");
        //引用容器需要多次填入数据，循环外创建
        this.referenceContainer = new ReferenceContainer();
        //一个文件可能写了多个类
        this.classOrInterfaceContainer = [];
        for (let p=0;p<fileLines.length;p++){

            //找到包信息，创建包容器PackageContainer
            if (fileLines[p].trim().split(/\s+/)[0] === "package"){
                this.packageContainer = new PackageContainer(fileLines[p].trim());
            }else

            //找到引用信息，添加到引用容器中
            if (fileLines[p].trim().split(/\s+/)[0] === "import"){
                this.referenceContainer.addReference(fileLines[p].trim());
            }else

            //找到类或接口，添加到类或接口容器中
            if (ClassOrInterfaceContainer.isClassOrInterfaceHeader(fileLines[p].trim())!==-1){
                let startP = fileLines.join('\n').indexOf(fileLines[p]);
                let block = Tools.findNextCodeBlock(startP,fileLines.join('\n'))[2].split("\n");
                this.classOrInterfaceContainer.push(new ClassOrInterfaceContainer(block));
                //跳过当前类防止重读内部类
                p += block.length-1;
            }

        }

    }

    // 获取包容器
    getPackageContainer(){
        return this.packageContainer;
    }

    // 获取引用容器
    getReferenceContainer(){
        return this.referenceContainer;
    }

    //获取类或接口容器
    getClassOrInterfaceContainer(){
        return this.classOrInterfaceContainer;
    }

}