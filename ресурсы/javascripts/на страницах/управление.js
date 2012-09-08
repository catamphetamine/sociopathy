(function()
{
	page.load = function()
	{
		//if (!доступна_ли_страница_управления())
		//	return window.location = '/'
		
		if (!пользователь)
		{
			$('#reset_database').show().find('> a').click(function(event)
			{
				event.preventDefault()
				
				page.Ajax.post('/приложение/хранилище/заполнить')
				.ошибка('Не удалось заполнить хранилище')
				.ok('Хранилище заполнено')
			})
		}
		
		if (есть_ли_полномочия('управляющий'))
		{
			$('#update_database').show().find('> a').click(function(event)
			{
				event.preventDefault()
				
				page.Ajax.post('/приложение/управление/хранилище/изменить')
				.ошибка('Не удалось изменить хранилище')
				.ok('Хранилище изменено')
			})
		}
		
		if (есть_ли_полномочия('управляющий') || есть_ли_полномочия('приглашения'))
		{
			$('#get_invite').show().find('> a').click(function(event)
			{
				event.preventDefault()
				
				page.Ajax.post('/приложение/управление/приглашение/выдать')
				.ошибка('Не удалось выдать приглашение')
				.ok(function(data)
				{
					info(data.ключ, { sticky: true })
				})
			})
		}
		
		if (есть_ли_полномочия('управляющий'))
		{
			$('#add_users').show().find('> a').click(function(event)
			{
				event.preventDefault()
				
				page.Ajax.post('/приложение/управление/хранилище/создать_пользователей')
				.ошибка('Не удалось создать пользователей')
				.ok('Пользователи созданы')
			})
		}
	}
})()