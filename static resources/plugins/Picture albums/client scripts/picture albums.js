Url_map['user.pictures'] = function(user_id) { return link_to('user', user_id) + '/' + text('pages.picture albums.url section') }
Url_map['user.pictures.album'] = function(user_id, album) { return link_to('user.pictures', user_id) + '/' + album }

url_matcher(function(url)
{
	var tools = this
	
	tools.id = 'Picture albums'

	tools.match(url,
	{
		'pages.people.url': function(rest)
		{
			tools.match(rest,
			{
				'*': function(value, rest)
				{
					tools.match(rest,
					{
						'pages.picture albums.url section': function(rest)
						{
							tools.page('картинки')
							
							tools.match(rest,
							{
								'*': function(value, rest)
								{
									page_data('альбом', value)
									page_data('картинка', rest)
									
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