var url_matchers = []

function url_matcher(matcher)
{
	url_matchers.push(matcher)
}

var Страница =
{
	определить: function(url)
	{
		this.эта(this.выяснить_страницу_по_пути(путь_страницы(url)))
	},
	
	выяснить_страницу_по_пути: function(путь)
	{
		if (!путь)
			return 'обложка'
		
		var страница_человека = false
		
		var better_match = function(url, pattern)
		{
			var matcher = {}
			
			Object.for_each(pattern, function(key, action)
			{
				var path = key
				
				if (key !== '*')
				{
					path = text(key)
					
					if (path.starts_with('/'))
						path = path.substring(1)
				}
					
				matcher[path] = action
			})

			match_url(url, matcher)
		}
		
		better_match(путь,
		{
			'pages.people.url': function(rest)
			{
				better_match(rest,
				{
					'*': function(value, rest)
					{
						страница_человека = true
						
						page_data('пользователь_сети', { id: value })
						
						if (пользователь)
							if (пользователь.id === value)
								page_data('этот_пользователь', true)
					}
				})
			}
		})
			
		var страница
		
		var tools = function(id)
		{
			var result = 
			{
				id: id || '',
				page: function(page)
				{
					if (this.id)
						page = this.id + '/' + page
					
					страница = page
				},
				icon: function(icon)
				{
					if (!icon)
						icon = this.id
					
					page_data('_icon', icon)
				},
				wait: function()
				{
					страница = '_wait_'
					page_data('proceed_manually', true)
					return function()
					{
						page.proceed()
					}
				},
				match: better_match
			}
			
			return result
		}
		
		url_matchers.for_each(function()
		{
			if (!страница)
				this.bind(tools())(путь)
		})
		
		if (страница)
			return страница
		
		if (страница_человека)
			return 'человек'
		
		var new_communication_matcher = {}
		var pattern = text('url.network').substring(1) + '/' + text('url.new communication')
		new_communication_matcher[pattern] = function(rest)
		{
			match_url(rest,
			{
				'*': function(value, rest)
				{
					страница = 'общение'
					page_data('общение', value)
					
					match_url(rest,
					{
						'*': function(value, rest)
						{
							page_data('кому', value)
						}
					})
				}
			})
		}
		
		match_url(путь, new_communication_matcher)
		
		if (страница)
			return страница
		
		better_match(путь,
		{
			'url.login required': function(rest)
			{
				страница = 'требуется вход'
			},
			'url.error': function(rest)
			{
				страница = 'ошибка'
			},
			'url.registration': function(rest)
			{
				страница = 'прописка'
			}
		})
		
		if (страница)
			return страница
		
		return 'страница не найдена'
	},

	переход: function()
	{
		this.страница = null
	},
			
	эта: function()
	{
		if (arguments.length === 0)
			return this.страница
		
		var страница = arguments[arguments.length - 1]
		var путь = arguments[0]
		
		//if (!путь)
		//	путь = страница
			
		this.страница = страница
		this.путь = путь
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