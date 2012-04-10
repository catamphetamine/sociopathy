var Страница =
{
	эта: function(страница)
	{
		if (!страница)
			return this.страница
			
		this.страница = страница
	},
	
	is: function(страница)
	{
		return this.страница === страница
	},
	
	matches: function(pattern)
	{
		return this.страница.matches(pattern)
	}
}