package tools;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.github.javaparser.ast.Modifier;
import com.github.javaparser.ast.PackageDeclaration;
import com.github.javaparser.ast.body.*;
import com.github.javaparser.ast.type.ClassOrInterfaceType;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ClassVisitor extends VoidVisitorAdapter<JSONObject> {
    @Override
    public void visit(ClassOrInterfaceDeclaration n, JSONObject arg) {
        JSONArray innerClasses = new JSONArray();
        if (n.isInnerClass()){
            arg.put("isInnerClass",true);
            JSONObject innerClass = new JSONObject();
            JSONArray modifiers = new JSONArray();
            for (Modifier modifier:n.getModifiers()){
                modifiers.add(modifier.toString());
            }
            innerClass.put("modifier",modifiers);
            innerClass.put("name",n.getName().getIdentifier());
            for (BodyDeclaration b:n.getMembers()){
                innerClass.put("body",b.toString());
            }
            innerClasses.add(innerClass);
            innerClasses.addAll(arg.getJSONArray("innerClasses"));
            arg.put("innerClasses",innerClasses);
        }else {
            arg.put("isInnerClass",false);
            arg.put("innerClasses",innerClasses);
            arg.put("className",n.getName().getIdentifier());
            StringBuilder s= new StringBuilder();
            for (Modifier mo:n.getModifiers()){
                s.append(" "+mo.getKeyword().asString());
            }
            if (n.isInterface())s.append(" abstract interface");
            arg.put("modifiers", s.toString());
            StringBuilder s2 = new StringBuilder();
            for (ClassOrInterfaceType ct:n.getExtendedTypes()){
                s2.append(ct.getName().getIdentifier());
            }
            arg.put("extends",s2);
            JSONArray itf = new JSONArray();
            for (ClassOrInterfaceType in:n.getImplementedTypes()){
                itf.add(in.getName().getIdentifier());
            }
            arg.put("interface",itf);
            JSONArray constructors = new JSONArray();
            for (ConstructorDeclaration cd:n.getConstructors()){
                JSONObject constr = new JSONObject();
                constr.put("constrName",cd.getName().getIdentifier());
                constr.put("body",cd.getBody().toString());
                constr.put("constrDeclaration",cd.getDeclarationAsString());
                StringBuilder s3 = new StringBuilder();
                for (Modifier md:cd.getModifiers()){
                    s3.append(" "+md.getKeyword().asString());
                }
                constr.put("constrModifier",s3);
                JSONArray cParams = new JSONArray();
                List<String> tpl = new ArrayList<>();
                for (Parameter p:cd.getParameters()){
                    JSONObject cParam = new JSONObject();
                    cParam.put("name",p.getName().getIdentifier());
                    cParam.put("type",p.getType().asString());
                    tpl.add(p.getType().asString());
                    cParams.add(cParam);
                }
                constr.put("detailedParams",cParams);
                constr.put("constrParams",tpl.toArray());
                constructors.add(constr);
            }
            arg.put("constructors",constructors);
            JSONObject cField = new JSONObject();
            if (n.getMembers()!=null){
                JSONArray variables = new JSONArray();
                for (BodyDeclaration member :n.getMembers()){
//                    System.out.println(member.isFieldDeclaration()?member:"");
                    if (member.isFieldDeclaration()){
                        variables.add(member.toString());
                    }
                    cField.put("variables",variables);
//                    try {
//                        FieldDeclaration field = (FieldDeclaration) member;
//                        for (VariableDeclarator v:field.getVariables()){
//                            JSONObject variable = new JSONObject();
//                            variable.put("name",v.getName().getIdentifier());
//                            if (v.getInitializer().isPresent())
//                                variable.put("initV",v.getInitializer().get().toString());
//                            variable.put("type",v.getType().asString());
//                            variables.add(variable);
//                        }
//                        cField.put("variables",variables);
//                    }catch (ClassCastException e){
//                        //
//                    }
                }
            }
            arg.put("field",cField);
        }

        super.visit(n, arg);
    }

}
