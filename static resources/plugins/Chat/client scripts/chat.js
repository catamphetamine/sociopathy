url_matcher(function(url)
{
	var page_is = this.page
	
	match_url(url,
	{
		'сеть/болталка': function(rest)
		{
			page_is('болталка')
		}
	})
})