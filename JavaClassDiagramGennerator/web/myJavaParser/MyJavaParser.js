class MyJavaParser{

    /*
     * 将文件转化为抽象语法树，语法树由众多容器构成，每种容器提供自己的提取方法。
     * 参数 file：string 被读成字符串的文件
     * 返回值 CompilationUnit类型的容器
     */
    static parser(file){
        let compilationUnit = new CompilationUnit(file)
        return compilationUnit;
    }
}