import com.sun.jersey.api.container.grizzly.GrizzlyWebContainerFactory
import org.glassfish.grizzly.http.server.HttpServer

import javax.ws.rs.core.UriBuilder
import java.io.IOException
import java.net.URI
import java.util.HashMap
import java.util.Map

import java.lang.Integer

import com.sun.jersey.api.container.grizzly2.GrizzlyServerFactory

import com.sun.jersey.api.core._
import java.io._

object Main
{
    def port (default_port : Integer) : Integer =
	{
        val port = System.getProperty("port")
        if (port == null)
			return default_port
			
		try
		{
			return Integer.parseInt(port)
		}
		catch
		{
			case ошибка : NumberFormatException => {}
		}
        
		default_port
    }
    
    def адрес () : URI =
	{
        UriBuilder.fromUri("http://localhost/").port(port(8080)).build()
    }

    val Адрес = адрес()

	@throws (classOf[IOException])
    def запустить () : HttpServer =
	{
        System.out.println("Starting grizzly...")
		
        val настройки = new PackagesResourceConfig("resources")
        GrizzlyServerFactory.createHttpServer(Адрес, настройки)
    }
    
	@throws (classOf[IOException])
    def main (настройки : Array[String]) =
	{
		val server = запустить()
		
		System.in.read()

		server.stop()
    }    
}
