import com.sun.jersey.api.container.grizzly.GrizzlyWebContainerFactory
import org.glassfish.grizzly.http.server.HttpServer

import javax.ws.rs.core.UriBuilder
import java.io.IOException
import java.net.URI
import java.util.HashMap
import java.util.Map

import java.lang.Integer

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
    def запустить () : com.sun.grizzly.http.SelectorThread =
	{
        val настройки = new HashMap[String, String]()

        настройки.put("com.sun.jersey.config.property.packages", "resources")

        System.out.println("Starting grizzly...")
		
        GrizzlyWebContainerFactory.create(Адрес, настройки)
    }
    
	@throws (classOf[IOException])
    def main (настройки : Array[String]) =
	{
        val server = запустить()
		server.run()//listen()
		
        System.out.println(String.format("Jersey app started with WADL available at "
                + "%sapplication.wadl\nTry out %shelloworld\nHit enter to stop it...",
                Адрес, Адрес))
		
        System.in.read()
        server.stopEndpoint()
    }    
}
