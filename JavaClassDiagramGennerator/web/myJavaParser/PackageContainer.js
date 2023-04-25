/*
 * 包容器，用于保存、取出包信息
 */
class PackageContainer{
    constructor(str) {
        this.value = str.split(/\s+/)[1];
    }

    getPackageName(){
        return this.value.replace(';','');
    }
}