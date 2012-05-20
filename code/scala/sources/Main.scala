import org.mortbay.jetty.Server
import org.mortbay.jetty.servlet.{Context, ServletHolder}

import tools._

object Main extends App
{
	// создаём Jetty
	val server = new Server(System.getProperty("port").toInt)
	val root = new Context(server, "/", Context.SESSIONS)
	
	// в каком пакете искать наши Rest веб-сервисы
	val package_name : String = System.getProperty("package")
	
	// каждый класс ScalatraServlet из этого пакета (и подпакетов) "замапить" на свой путь.
	// путь определяется методом "path" этого класса.
	for (handler <- PackageScanner.getClasses(package_name) if classOf[org.scalatra.ScalatraServlet].isAssignableFrom(handler))
	{
		// создаём сервлет из этого класса
		val servlet = handler.newInstance().asInstanceOf[javax.servlet.Servlet]
		
		// на какой путь "замапим" сервлет
		try
		{
			// получаем это из метода path()
			val path = handler.getMethod("path").invoke(servlet).toString
			
			// "мапим" сервлет на этот путь в Jetty
			root.addServlet(new ServletHolder(servlet), path + "/*")
			
			println(handler.getPackage().getName() + "." + handler.getName() + " is mapped to " + path)
		}
		catch 
		{
			// не написан метод path() у сервлета
			case error: NoSuchMethodException => 
				throw new RuntimeException("Method path() not found in class " + handler.getPackage().getName() + "." + handler.getName())
		}
	}
	
	// запускаем Jetty
	server.start()
	server.join()
}