package myServlet;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.tools.*;
import java.io.*;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.List;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.github.javaparser.*;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

import java.lang.reflect.*;
import java.lang.ClassLoader;
import java.lang.reflect.Method;
import java.lang.reflect.InvocationTargetException;
import java.util.*;

@WebServlet("/TestServlet")
public class testServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // super.doGet(req, resp);
        resp.setContentType("text/html;charset=UTF-8");
        req.setCharacterEncoding("UTF-8");
    }

    // 文件存储目录
    private static final String UPLOAD_DIRECTORY = "upload";
    private static final String JSON_FILENAME = "result.json";
    // 大小配置
    private static final int MEMORY_THRESHOLD = 1024 * 1024 * 3;
    private static final int MAX_FILE_SIZE = 1024 * 1024 * 40;
    private static final int MAX_REQUEST_SIZE = 1024 * 1024 * 50;

    private static String loadPath;

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // super.doPost(req, resp);
        // resp.getWriter().write("<h1>Waiting</h1>");
        resp.setContentType("text/html; charset=UTF-8");
        resp.setCharacterEncoding("UTF-8");

        if (!ServletFileUpload.isMultipartContent(req)) {
            System.out.println("not multipart form data");
        }
        // 配置上传参数
        DiskFileItemFactory factory = new DiskFileItemFactory();
        // 内存临界值，超出部分产生临时文件存储在临时目录
        factory.setSizeThreshold(MEMORY_THRESHOLD);
        // 设置临时存储目录
        factory.setRepository(new File(System.getProperty("java.io.tmpdir")));
        ServletFileUpload upload = new ServletFileUpload(factory);
        // 设置最大文件上传值
        upload.setFileSizeMax(MAX_FILE_SIZE);
        // 设置文件和表单的最大值
        upload.setSizeMax(MAX_REQUEST_SIZE);
        upload.setHeaderEncoding("GBK");

        // 创建临时文件夹存储上传的文件
        loadPath = req.getServletContext().getRealPath("./") + UPLOAD_DIRECTORY;
        File loadDir = new File(loadPath);
        if (!loadDir.exists()) {
            loadDir.mkdir();
        }

        try {
            @SuppressWarnings("unchecked")
            List<FileItem> formItems = upload.parseRequest(req);

            if (formItems != null && formItems.size() > 0) {
                for (FileItem fi : formItems) {
                    if (!fi.isFormField()) {
                        if (fi.getName() == null || fi.getName() == "") {
                            continue;
                        }

                        String fileName = new File(fi.getName()).getName();
                        System.out.println(fi.toString());

                        String filePath = loadPath + File.separator + fileName;
                        File store = new File(filePath);
                        System.out.println(filePath);
                        // 保存到硬盘
                        fi.write(store);

                        req.setCharacterEncoding("UTF-8");
                        req.setAttribute("message", "文件上传完成");
                    }
                }
            }
        } catch (Exception e) {
            req.setAttribute("message", e.getMessage());
        }

        // 对文件进行分析
        JSONArray classInfo = AnalyseFile(loadDir);
        // 传回页面
        req.setAttribute("classInfo", classInfo.toJSONString());
        req.setAttribute("mode", 0);
        // 创建result.json
        String jsonPath = req.getServletContext().getRealPath("./") + JSON_FILENAME;
        File resultFile = new File(jsonPath);
        if (resultFile.exists()) {
            resultFile.delete();
        }
        resultFile.createNewFile();
        Writer writer = new OutputStreamWriter(new FileOutputStream(resultFile), "UTF-8");
        writer.write(classInfo.toJSONString());
        writer.flush();
        writer.close();

        req.getRequestDispatcher("/feedback.jsp").forward(req, resp);

        // 删除缓存的文件
        DeleteUploadFile(loadDir);

        // 清除加载到内存中的类

    }

    private static void DeleteUploadFile(File file) {
        if (file.exists() && file.isFile()) {
            file.delete();
        } else if (file.exists() && file.isDirectory()) {
            for (File f : file.listFiles()) {
                DeleteUploadFile(f);
            }
            file.delete();
        }
    }

    private static byte[] classLoadBuffer = new byte[MAX_FILE_SIZE];

    // 将.class文件载入以获得其对象
    private synchronized static Class<?> myloadClass(File file) throws FileNotFoundException, NoSuchMethodException {
        FileInputStream fileInputStream = new FileInputStream(file);
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        // byte[] buffer = new byte[MAX_FILE_SIZE];
        int length;
        try {
            while (true) {
                length = fileInputStream.read(classLoadBuffer);
                if (length == -1) {
                    break;
                }
                byteArrayOutputStream.write(classLoadBuffer, 0, length);
            }
            byte[] data = byteArrayOutputStream.toByteArray();
            Method cDefineClass = ClassLoader.class.getDeclaredMethod("defineClass", String.class, byte[].class,
                    int.class, int.class);
            cDefineClass.setAccessible(true);
            return (Class) cDefineClass.invoke(ClassLoader.getSystemClassLoader(), new Object[] {
                    null, data, 0, data.length
            });
        } catch (IOException | IllegalAccessException | InvocationTargetException e) {
            //
        } finally {
            classLoadBuffer = new byte[MAX_FILE_SIZE];
            try {
                byteArrayOutputStream.close();
            } catch (IOException e) {
                //
            }
            try {
                fileInputStream.close();
            } catch (IOException e) {
                //
            }

        }
        return null;
    }

    private void AppendJavaPath(File[] fileList, List<String> allPath) {
        for (File file : fileList) {
            if (file.isDirectory()) {
                File[] sublist = file.listFiles();
                AppendJavaPath(sublist, allPath);
            } else if (file.isFile()) {
                if (file.getName().substring(file.getName().lastIndexOf(".")).equals(".java")) {
                    String path = file.getPath();
                    allPath.add(path);
                }
            }
        }
    }

    private void JavaToClass(File[] fileList, List<Class> myClassList) throws IOException {
        List<String> allPath = new ArrayList<String>();
        // 将目录中所有.java文件地址传入数组
        AppendJavaPath(fileList, allPath);

        // 编译.java文件
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        DiagnosticCollector diagnostics = new DiagnosticCollector<>();
        StandardJavaFileManager fileManager = compiler.getStandardFileManager(diagnostics, null, null);
        Iterable compilationUnits = fileManager.getJavaFileObjectsFromStrings(allPath);
        Iterable<String> options = Arrays.asList("-d", loadPath);
        JavaCompiler.CompilationTask task = compiler.getTask(null, fileManager, diagnostics, options, null,
                compilationUnits);
        boolean isSuccess = task.call();
        System.out.println((isSuccess) ? "编译成功" : "编译失败");
        for (Object obj : diagnostics.getDiagnostics()) {
            Diagnostic d = (Diagnostic) obj;
            System.out.printf(
                    "Code: %s%n" + "Kind: %s%n" + "Start Position: %s%n" + "End Position: %s%n" + "Source: %s%n"
                            + "Message: %s%n",
                    d.getCode(), d.getKind(), d.getPosition(), d.getStartPosition(), d.getEndPosition(), d.getSource(),
                    d.getMessage(null));
        }

        // 载入.class文件并取得信息
        File newLoadDir = new File(loadPath);
        List<File> reloadFiles = new ArrayList<>();
        AppendClassFile(newLoadDir, myClassList, reloadFiles);
        // 如果载入顺序错误会出现加载失败，此时myLoadClass返回值为null，需调换顺序重新载入
        // 重新载入reloadFiles中所有文件
        Reload(reloadFiles, myClassList);
    }

    private void AppendClassFile(File loadDir, List<Class> myClassList, List<File> reloadFiles) {
        for (File file : loadDir.listFiles()) {
            if (file.isFile()) {
                if (file.getName().substring(file.getName().lastIndexOf(".")).equals(".class")) {
                    try {
                        // 如果载入顺序错误会出现加载失败，此时myLoadClass返回值为null，需调换顺序重新载入
                        Class cl = myloadClass(file);
                        if (cl != null) {
                            myClassList.add(cl);
                        } else {
                            // 载入失败，存进重载数组
                            reloadFiles.add(file);
                        }
                    } catch (FileNotFoundException | NoSuchMethodException e) {
                        //
                    }
                }
            } else if (file.isDirectory()) {
                AppendClassFile(file, myClassList, reloadFiles);
            }
        }
    }

    private void Reload(List<File> reloadFiles, List<Class> myClassList) {
        for (int p = 0; p < reloadFiles.size(); p++) {
            try {
                Class cl = myloadClass(reloadFiles.get(p));
                if (cl != null) {
                    myClassList.add(cl);
                    reloadFiles.remove(p);
                    p--;
                }
            } catch (FileNotFoundException | NoSuchMethodException e) {
                //
            }
            if (p == reloadFiles.size() - 1 && reloadFiles.size() > 0) {
                p = -1;
            }
        }
    }

    private JSONArray AnalyseFile(File loadDir) {

        // 将.java文件编译成.class文件载入JVM获得类的Class对象
        File[] fileList = loadDir.listFiles();
        List<Class> myClassList = new ArrayList<>();
        try {
            JavaToClass(fileList, myClassList);
        } catch (IOException e) {
            //
        }
        // 将信息记录为json文件的格式
        JSONArray myClassInfo = new JSONArray();
        for (Class cl : myClassList) {
            // 控制台输出所有被成功加载的类的Class对象
            System.out.println(cl);
            // 处理信息
            JSONObject unit = new JSONObject();

            JSONArray methods = new JSONArray();
            outCircle: for (Method m : cl.getMethods()) {
                Method[] objectMethods = Object.class.getMethods();
                for (Method n : objectMethods) {
                    if (n.getName().equals(m.getName())) {
                        continue outCircle;
                    }
                }
                JSONObject method = new JSONObject();
                method.put("params", m.getParameterTypes());
                method.put("modifier", Modifier.toString(m.getModifiers()));
                method.put("returnType", m.getReturnType().toString());
                method.put("MethodName", m.getName());
                methods.add(method);
            }
            unit.put("methods", methods);
            JSONArray construtors = new JSONArray();
            for (Constructor constructor : cl.getConstructors()) {
                JSONObject constr = new JSONObject();
                constr.put("constrName", constructor.getName());
                constr.put("constrModifier", Modifier.toString(constructor.getModifiers()));
                constr.put("constrParams", constructor.getParameterTypes());
                construtors.add(constr);
            }
            unit.put("constructors", construtors);
            unit.put("interface", cl.getInterfaces());
            unit.put("extends", (cl.getSuperclass() == null) ? "" : cl.getSuperclass().toString());
            unit.put("modifiers", Modifier.toString(cl.getModifiers()));
            unit.put("className", cl.getName());
            myClassInfo.add(unit);
        }
        System.out.println(myClassInfo.toJSONString());
        return myClassInfo;
    }

}
