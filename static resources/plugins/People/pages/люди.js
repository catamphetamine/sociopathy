title(text('pages.people.title'));
	
(function()
{
	page.query('#id_cards', 'people')
	
	page.load = function()
	{
		page.data.loader = page.either_way_loading
		({
			путь: text('pages.people.url'),
			с_номерами_страниц: true,
			data:
			{
				url: '/приложение/люди',
				name: 'люди',
				latest_first: true,
				batch_size: 18,
				loaded: function(people)
				{
					parse_dates(people, 'время рождения')
				},
				on_first_output: function()
				{
					initialize_search()
					page.content_ready()
				}
			},
			container: page.people,
			template: 'личная карточка',
			страница: page.data.номер_страницы,
			//page: page,
			error: 'Не удалось загрузить список людей',
			progress_bar: true
		})
	}
	
	page.unload = function()
	{
	}
	
	function initialize_search()
	{
		search = page.get('.search').autocomplete
		({
			mininum_query_length: 3,
			search: function(query, callback)
			{
				var ajax = page.Ajax.get('/люди/поиск',
				{
					query: query,
					max: 5
				})
				.ok(function(data)
				{
					callback(data.люди)
				})
										
				var search =
				{
					cancel: function()
					{
						ajax.abort()
					}
				}
				
				return search
			},
			decorate: function(человек)
			{
				if (человек.avatar_version)
				{
					var icon = $('<div/>')
						.addClass('icon')
						.css('background-image', 'url("/загруженное/люди/' + человек.id + '/картинка/крошечная.jpg?version=' + человек.avatar_version + '")')
						.appendTo(this)
				}
				
				$('<div/>')
					.addClass('title')
					.text(человек.имя)
					.appendTo(this)
			},
			value: function(человек)
			{
				return человек._id + ''
			},
			title: function(человек)
			{
				return человек.имя
			},
			choice: function(_id)
			{
				page.data.loader.destroy()
			
				go_to(text('pages.people.url') + '/' + this.id)
			
				/*	
				page.Ajax.get('/человек', { _id: _id }).ok(function(человек)
				{
					var card = $.tmpl('личная карточка', человек)
					
					card = $('<li/>').attr('_id', человек._id).append(card)
					
					page.people.empty().append(card)
					
					ajaxify_internal_links(page.people)
				})
				*/
			},
			nothing_found: function(query)
			{
				info(text('pages.people.not found', { query: query }))
			},
			required: false
		})
		
		;(function()
		{
			search.focus()
		})
		.delay(1)
	}
})()