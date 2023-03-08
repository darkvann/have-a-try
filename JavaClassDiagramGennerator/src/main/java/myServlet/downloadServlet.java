package myServlet;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

//负责从服务器上将文件下载到客户端
public class downloadServlet extends HttpServlet {

    private static final String RESULT_FILENAME="result.json";
    private static final int MAX_FILESIZE = 1024*1024*10;
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String resultPath = req.getServletContext().getRealPath("./")+RESULT_FILENAME;
        //设置文件MIME类型
        resp.setContentType(getServletContext().getMimeType(RESULT_FILENAME));
        //设置Content-Disposition
        resp.setHeader("Content-Disposition","attachment;filename="+RESULT_FILENAME);

        FileInputStream inputStream = new FileInputStream(resultPath);
        ServletOutputStream outputStream = resp.getOutputStream();
        byte[] data = new byte[MAX_FILESIZE];
        int length;
        while ((length=inputStream.read(data))!=-1){
            outputStream.write(data,0,length);
        }
        inputStream.close();
        outputStream.close();
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        System.out.println("downloadServlet do post");
    }
}
