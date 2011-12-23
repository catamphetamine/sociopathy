function initialize_page()
{
	Режим.подсказка('Здесь вы можете посмотреть данные об этом члене нашей сети. Если это ваша личная карточка, вы сможете изменить данные в ней, переключившись в режим правки.')
	Режим.добавить_проверку_перехода(function(из, в)
	{
		if (в === 'правка')
		{
			if (пользователь.id !== пользователь_сети._id)
			{
				info('Это не ваши личные данные, и вы не можете их править.')
				return false
			}
		}
			
		return true
	})

	new Data_templater
	({
		template_url: '/лекала/личная карточка.html',
		item_container: $('#id_card'),
		conditional: $('#id_card_block[type=conditional]')
	},
	new  Data_loader
	({
		url: '/приложение/человек',
		parameters: { адресное_имя: путь().match(/люди\/(.+)/)[1] },
		get_data: function (data) { return data }
	}))
	
	$('#content').disableTextSelect()
}