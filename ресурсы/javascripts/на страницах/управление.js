(function()
{
	page.load = function()
	{
		/*
		panel.buttons.управление.element.parent().show()
		panel.buttons.управление.tooltip.update_position()
		*/
		
		if (!пользователь.управляющий)
			return window.location = '/'
		
		$('#reset_database').click(function(event)
		{
			event.preventDefault()
			
			page.Ajax.post('/приложение/хранилище/заполнить')
			.ошибка('Не удалось заполнить хранилище')
			.ok('Хранилище заполнено')
		})
		
		$('#update_database').click(function(event)
		{
			event.preventDefault()
			
			page.Ajax.post('/приложение/хранилище/изменить')
			.ошибка('Не удалось изменить хранилище')
			.ok('Хранилище изменено')
		})
		
		$('#get_invite').click(function(event)
		{
			event.preventDefault()
			
			page.Ajax.post('/приложение/приглашение/выдать')
			.ошибка('Не удалось выдать приглашение')
			.ok(function(data)
			{
				info(data.ключ)
			})
		})
		
		$('#add_users').click(function(event)
		{
			event.preventDefault()
			
			page.Ajax.post('/приложение/хранилище/создать_пользователей')
			.ошибка('Не удалось создать пользователей')
			.ok('Пользователи созданы')
		})
	}
})()