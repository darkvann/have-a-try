/*
 * 引用容器，存储、取出引用信息
 */
class ReferenceContainer{
    value = [];

    // 添加引用
    addReference(str){
        this.value.push(str);
    }

    // 获取引用（只返回包名）
    getReferences(){
        let out = [];
        this.value.forEach(str => {
            out.push(str.split(/\s+/)[1]);
        })
        return out;
    }

    //获取全部原始数据
    getValue(){
        return this.value;
    }
}