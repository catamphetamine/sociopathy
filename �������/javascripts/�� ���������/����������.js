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
}
