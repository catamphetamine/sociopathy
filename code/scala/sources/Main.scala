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
    def getPort (defaultPort : Integer) : Integer =
	{
        val port : String = System.getProperty("port")
        if (port == null)
			return defaultPort
			
		try
		{
			return Integer.parseInt(port)
		}
		catch
		{
			case error : NumberFormatException => {}
		}
        
		return defaultPort
    }
    
    def getBaseURI () : URI =
	{
        return UriBuilder.fromUri("http://localhost/").port(getPort(9998)).build()
    }

    val BASE_URI : URI = getBaseURI()

	@throws (classOf[IOException])
    def startServer () : com.sun.grizzly.http.SelectorThread =
	{
        val initParams = new HashMap[String, String]()

        initParams.put("com.sun.jersey.config.property.packages", "resources")

        System.out.println("Starting grizzly...")
        return GrizzlyWebContainerFactory.create(BASE_URI, initParams)
    }
    
	@throws (classOf[IOException])
    def main (args : Array[String]) =
	{
        val httpServer = startServer()
		httpServer.run()//listen()
		
        System.out.println(String.format("Jersey app started with WADL available at "
                + "%sapplication.wadl\nTry out %shelloworld\nHit enter to stop it...",
                BASE_URI, BASE_URI))
		
        System.in.read()
        httpServer.stopEndpoint()
    }    
}
