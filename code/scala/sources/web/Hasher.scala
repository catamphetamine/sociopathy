package web

import hash.Whirlpool
import hash.SHA

class Hasher extends tools.WebService 
{
	def path = "/захѣшировать"
	
	get("/")
	{
		"Доступные алгоритмы: Whirlpool, SHA"
	}

	get("/Whirlpool/:what") 
	{
		val что = params("what")
		json("что" -> что, "хѣш" -> Whirlpool.hash(что))
	}

	get("/SHA/:what") 
	{
		val что = params("what")
		json("что" -> что, "хѣш" -> SHA.hash(что))
	}
}