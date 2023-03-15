package tools;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.github.javaparser.ast.Modifier;
import com.github.javaparser.ast.NodeList;
import com.github.javaparser.ast.PackageDeclaration;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.body.Parameter;
import com.github.javaparser.ast.type.ClassOrInterfaceType;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;

import java.util.ArrayList;
import java.util.List;


public class MethodVisitor extends VoidVisitorAdapter<JSONArray> {
    @Override
    public void visit(MethodDeclaration n, JSONArray arg) {
        JSONObject method = new JSONObject();
        method.put("MethodName",n.getName().getIdentifier());
        method.put("methodBody",n.getBody().isPresent()?n.getBody().get().toString():"");
        method.put("returnType",n.getTypeAsString());
        method.put("declaration",n.getDeclarationAsString());
        String s= new String();
        for (Modifier mo:n.getModifiers()){
            s=s+" "+mo.getKeyword().asString();
        }
        method.put("modifier",s);
        JSONArray params = new JSONArray();
        List<String> tpl = new ArrayList<>();
        for (Parameter p:n.getParameters()){
            JSONObject param = new JSONObject();
            param.put("paramType",p.getType().asString());
            tpl.add(p.getType().asString());
            param.put("paramName",p.getName().getIdentifier());
            params.add(param);
        }
        method.put("params",tpl.toArray());
        method.put("detailedParams",params);
        arg.add(method);
        super.visit(n, arg);
    }
}
