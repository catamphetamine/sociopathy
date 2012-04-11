package resources

import javax.ws.rs._

import javanese.Whirlpool

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
	def whirlpool() : String =
	{
		"Available algorythms: whirlpool"
	}

	@GET 
	@Path("whirlpool/{value}")
	@Produces(Array("text/plain"))
	def whirlpool(@PathParam("value") value : String) : String =
	{
		val whirlpool = new Whirlpool()
		
        val digest = new Array[Byte](Whirlpool.DIGESTBYTES)
		
        whirlpool.NESSIEinit()
        whirlpool.NESSIEadd(value)
        whirlpool.NESSIEfinalize(digest)
		
		Whirlpool.display(digest)
	}
}