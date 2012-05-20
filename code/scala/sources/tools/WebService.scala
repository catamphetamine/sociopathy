package tools

import org.scalatra._

import com.twitter.json.Json

// простая обёртка, склеивающая Scalatra и Json
class WebService extends ScalatraServlet
{
	// возвращаем json из Map'а
	def json(map : Map[Any, Any]) : String =
	{
		contentType = "application/json"
		Json.build(map).toString
	}
	
	// возвращаем json из пар "ключ => значение"
	def json(hash: (Any, Any)*) : String =
	{
		json(Map(hash: _*))
	}
}