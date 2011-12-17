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

	var conditional = initialize_conditional($('#id_card_block[type=conditional]'))
	
	$content = $('#content')
	$id_card = $('#id_card')
	
	$content.disableTextSelect()

	Ajax.get('/лекала/личная карточка.html', 
	{
		//cache: false,
		type: 'html',
		error: function()
		{
			conditional.callback('Не удалось загрузить страницу')
		},
		ok: function(template) 
		{
			$.template('личная карточка', template)
			
			$.tmpl('личная карточка', пользователь_сети).appendTo($id_card)
			
			conditional.callback()
		}
	})
}