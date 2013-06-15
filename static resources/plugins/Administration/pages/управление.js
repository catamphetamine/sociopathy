(function()
{
	title(text('pages.administration.title'))
	
	page.query('.stats > ul', 'stats')
	
	page.load = function()
	{
		//if (!доступна_ли_страница_управления())
		//	return window.location = '/'
		
		/*
		if (!пользователь)
		{
			$('#reset_database').show().find('> a').click(function(event)
			{
				event.preventDefault()
				
				page.Ajax.post('/приложение/хранилище/создать')
				.ошибка('Не удалось создать хранилище')
				.ok('Хранилище создано')
			})
		}
		*/
		
		/*
		if (есть_ли_полномочия('управляющий'))
		{
			$('#update_database').show().find('> a').click(function(event)
			{
				event.preventDefault()
				
				page.Ajax.post('/сеть/управление/хранилище/изменить')
				.ошибка('Не удалось изменить хранилище')
				.ok('Хранилище изменено')
			})
		}
		*/
		
		if (Configuration.Invites && (есть_ли_полномочия('управляющий') || есть_ли_полномочия('приглашения')))
		{
			$('#get_invite').show().find('> a').click(function(event)
			{
				event.preventDefault()
				
				page.Ajax.post('/сеть/управление/приглашение/выдать')
				.ошибка('Не удалось выдать приглашение')
				.ok(function(data)
				{
					var link = host + ':' + port + '/?приглашение=' + data.ключ
					info('<a href=\'http://' + link + '\'>' + link + '</a>', { sticky: true })
				})
			})
		}
		
		/*
		if (есть_ли_полномочия('управляющий'))
		{
			$('#test_data').show().find('> a').click(function(event)
			{
				event.preventDefault()
				
				page.Ajax.post('/сеть/управление/хранилище/заполнить')
				.ошибка('Не удалось заполнить хранилище')
				.ok('Хранилище заполнено')
			})
		}
		*/
		
		var stats_loaded = false
		
		function показать_сводку()
		{
			page.Ajax.get('/сеть/управление/сводка')
			.ok(function(data)
			{
				if (!stats_loaded)
				{
					Object.for_each(data.stats, function(key)
					{
						var title = $('<span/>').addClass('title').text(text('pages.administration.stats.' + key))
						var value = $('<span/>').addClass('value')
						
						var item = $('<li/>').attr('key', key)
						
						title.appendTo(item)
						value.appendTo(item)
						
						item.appendTo(page.stats)
					})
				}
				
				Object.for_each(data.stats, function(key)
				{
					page.stats.find('> [key="' + key + '"] > .value').text(this)
				})
				
				if (!stats_loaded)
				{
					page.content_ready()
					stats_loaded = true
				}
			})
		}
		
		показать_сводку()
		//page.ticking(показать_сводку, 2 * 1000)
	}
})()