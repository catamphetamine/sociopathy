package net.sobranie.hash

@GET
@Produces(Array(MediaType.APPLICATION_JSON))
def getItems(
@DefaultValue("0") @QueryParam("start") start: Int,
@DefaultValue("25") @QueryParam("limit") limit:Int,
@DefaultValue("[]") @QueryParam("sort") sort: JSONReceiver[Array[Sort]],
@DefaultValue("[]") @QueryParam("filter") filter: JSONReceiver[Array[Filter]]): RESTRespons