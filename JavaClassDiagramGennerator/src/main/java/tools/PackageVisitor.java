package tools;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.github.javaparser.ast.PackageDeclaration;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;

public class PackageVisitor extends VoidVisitorAdapter<JSONObject> {
    @Override
    public void visit(PackageDeclaration n, JSONObject arg) {
        arg.put("package",n.getNameAsString());
        super.visit(n, arg);
    }
}
