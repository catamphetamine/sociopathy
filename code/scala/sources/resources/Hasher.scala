package resources

import javax.ws.rs._
import javax.ws.rs.core._

import javanese.Whirlpool
import com.twitter.json.Json

/*
@GET
@Produces(Array(MediaType.APPLICATION_JSON))
def getItems(
	@DefaultValue("0") @QueryParam("start") start: Int,
	@DefaultValue("25") @QueryParam("limit") limit: Int,
	@DefaultValue("[]") @QueryParam("sort") sort: JSONReceiver[Array[Sort]],
	@DefaultValue("[]") @QueryParam("filter") filter: JSONReceiver[Array[Filter]]): RESTResponse = {
	System.out.println "Test"
}
*/

@Path("/hash")
class Hasher
{	
	@GET 
	@Produces(Array("text/plain"))
	def приветствие() : String =
	{
		"Доступные алгоритмы: whirlpool"
	}

	@GET 
	@Path("whirlpool/{что}")
	//@Produces(Array("text/plain"))
	@Produces(Array(MediaType.APPLICATION_JSON))
	def whirlpool(@DefaultValue(Nil) @PathParam("что") что : String) : String =
	{
		//if (value == null)
		//	throw new IllegalArgumentException("Что захешировать?")
	
		Json.build(Map("hash" -> Whirlpool.hash(что))).toString
	}
}