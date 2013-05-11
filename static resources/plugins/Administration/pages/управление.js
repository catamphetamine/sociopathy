(function()
{
	title(text('pages.administration.title'))

	page.needs_to_load_content = false
	
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
	}
})()