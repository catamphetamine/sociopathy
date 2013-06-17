Url_map['user.videos'] = function(user_id) { return link_to('user', user_id) + '/' + text('pages.video albums.url section') }
Url_map['user.videos.album'] = function(user_id, album) { return link_to('user.videos', user_id) + '/' + album }

url_matcher(function(url)
{
	var tools = this
	
	tools.id = 'Video albums'

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
						'pages.video albums.url section': function(rest)
						{
							tools.page('видео')
							
							tools.match(rest,
							{
								'*': function(value, rest)
								{
									page_data('альбом', value)
									page_data('видеозапись', rest)
									
									tools.page('альбом с видео')
								}
							})
						}
					})
				}
			})
		}
	})
})