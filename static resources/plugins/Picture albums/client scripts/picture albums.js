url_matcher(function(url)
{
	var tools = this
	
	tools.id = 'Picture albums'

	match_url(url,
	{
		'люди': function(rest)
		{
			match_url(rest,
			{
				'*': function(value, rest)
				{
					match_url(rest,
					{
						'картинки': function(rest)
						{
							tools.page('картинки')
							
							match_url(rest,
							{
								'*': function(value, rest)
								{
									page.data.альбом = value
									page.data.картинка = rest
									
									tools.page('альбом с картинками')
								}
							})
						}
					})
				}
			})
		}
	})
})