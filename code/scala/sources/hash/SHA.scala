package hash
 
import java.security.MessageDigest
 
object SHA
{
	@throws (classOf[Exception])
	def hash (value : String) = 
	{
		val digest = MessageDigest.getInstance("SHA-512")
		digest.update(value.getBytes())
		
		//val byteData : Array(Byte) = digest.digest()
		
		digest.digest().foldLeft(new java.lang.StringBuffer())
		{
			(hash, current) =>
				hash.append(Integer.toString((current & 0xff) + 0x100, 16).substring(1))
		}.toString()
	}
}