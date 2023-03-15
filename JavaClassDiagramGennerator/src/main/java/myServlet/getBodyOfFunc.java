package myServlet;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.visitor.VoidVisitor;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import com.github.javaparser.*;
import tools.ClassVisitor;
import tools.MethodVisitor;
import tools.PackageVisitor;

public class getBodyOfFunc extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
//        super.doGet(req, resp);
    }

    private static final String UPLOAD_DIRECTORY = "upload";
    private static final String JSON_FILENAME = "result.json";
    //大小配置
    private static final int MEMORY_THRESHOLD = 1024*1024*3;
    private static final int MAX_FILE_SIZE = 1024*1024*40;
    private static final int MAX_REQUEST_SIZE=1024*1024*50;

    private static String loadPath;
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
//        super.doPost(req, resp);
        resp.setContentType("text/html; charset=UTF-8");
        resp.setCharacterEncoding("UTF-8");

        if (!ServletFileUpload.isMultipartContent(req)){
            System.out.println("not multipart form data");
        }
        //配置上传参数
        DiskFileItemFactory factory = new DiskFileItemFactory();
        //内存临界值，超出部分产生临时文件存储在临时目录
        factory.setSizeThreshold(MEMORY_THRESHOLD);
        //设置临时存储目录
        factory.setRepository(new File(System.getProperty("java.io.tmpdir")));
        ServletFileUpload upload = new ServletFileUpload(factory);
        //设置最大文件上传值
        upload.setFileSizeMax(MAX_FILE_SIZE);
        //设置文件和表单的最大值
        upload.setSizeMax(MAX_REQUEST_SIZE);
        upload.setHeaderEncoding("GBK");

        //创建临时文件夹存储上传的文件
        loadPath = req.getServletContext().getRealPath("./")+UPLOAD_DIRECTORY;
        File loadDir = new File(loadPath);
        if(!loadDir.exists()){
            loadDir.mkdir();
        }

        try {
            @SuppressWarnings("unchecked")
            List<FileItem> formItems = upload.parseRequest(req);

            if(formItems!=null && formItems.size()>0){
                for (FileItem fi:formItems){
                    if (!fi.isFormField()){
                        if(fi.getName()==null || fi.getName().equals("")){
                            continue;
                        }

                        String fileName = new File(fi.getName()).getName();
                        System.out.println(fi.toString());

                        String filePath = loadPath + File.separator + fileName;
                        File store = new File(filePath);
                        //保存到硬盘
                        fi.write(store);

                        req.setCharacterEncoding("UTF-8");
                        req.setAttribute("message","文件上传完成");
                    }
                }
            }
        }catch (Exception e){
            req.setAttribute("message",e.getMessage());
        }

        List<CompilationUnit> compilationUnits = new ArrayList<>();
        getCompilationUnits(loadDir,compilationUnits);
        JSONArray classInfo = new JSONArray();
        getClassInfo(compilationUnits,classInfo);
        System.out.println(classInfo);

        req.setAttribute("classInfo",classInfo.toJSONString());
        req.setAttribute("mode",1);

//        CompilationUnit compilationUnit = StaticJavaParser.parse("class A{}");
//        Optional<ClassOrInterfaceDeclaration> classA = compilationUnit.getClassByName("A");

        req.getRequestDispatcher("/feedback.jsp").forward(req,resp);

        DeleteUploadFile(loadDir);
    }


    //把缓存文件夹里的文件转成CompilationUnit列表
    private void getCompilationUnits(File targetDir,List<CompilationUnit> record){
        if (targetDir.isDirectory()){
            for (File file:targetDir.listFiles()){
                if (file.isDirectory()){
                    getCompilationUnits(file,record);
                }else if (file.isFile() && file.getName().endsWith(".java")){
                    try {
                        record.add(StaticJavaParser.parse(file));
                    }catch (FileNotFoundException e){
                        //
                    }
                }
            }
        }

    }

    //获取类的具体信息
    private void getClassInfo(List<CompilationUnit> compilationUnits,JSONArray result){
        if (compilationUnits.size()!=0){
            for (CompilationUnit c:compilationUnits){
                JSONObject unit = new JSONObject();

                //获取包名
                c.accept(new PackageVisitor(),unit);
                //获取类的基本信息
                c.accept(new ClassVisitor(),unit);
                //获取所有方法信息
                JSONArray methods = new JSONArray();
                List<MethodDeclaration> mds = c.findAll(MethodDeclaration.class);
                mds.forEach(md->{
                    MethodVisitor methodVisitor = new MethodVisitor();
                    methodVisitor.visit(md,methods);
                });
                unit.put("methods",methods);

                result.add(unit);
            }
        }
    }

    //删除临时文件
    private static void DeleteUploadFile(File file){
        if (file.exists() && file.isFile()){
            file.delete();
        }else if (file.exists() && file.isDirectory()){
            for (File f:file.listFiles()){
                DeleteUploadFile(f);
            }
            file.delete();
        }
    }

}
