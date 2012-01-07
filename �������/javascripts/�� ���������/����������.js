function initialize_page()
{
	$('#initialize').click(function(event)
	{
		event.preventDefault()
		
		Ajax.get('/приложение/хранилище/заполнить', 
		{
			ошибка: 'Не удалось заполнить хранилище',
			ok: 'Хранилище заполнено'
		})
	})
	
	$('#get_invite').click(function(event)
	{
		event.preventDefault()
		
		Ajax.get('/приложение/приглашение/выдать', 
		{
			ошибка: 'Не удалось выдать приглашение',
			ok: function(data)
			{
				info(data.ключ)
			}
		})
	})
}