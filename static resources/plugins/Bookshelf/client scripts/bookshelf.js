Url_map['user.bookshelf'] = function(user_id) { return link_to('user', user_id) + '/' + text('pages.bookshelf.url section') }

url_matcher(function(url)
{
	var tools = this
	
	tools.id = 'Bookshelf'
	
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
						'pages.bookshelf.url section': function()
						{
							tools.page('книжный шкаф')
						}
					})
				}
			})
		}
	})
})