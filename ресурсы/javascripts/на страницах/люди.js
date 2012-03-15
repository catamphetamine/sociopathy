title('Люди')

function initialize_page()
{
	Подсказки.подсказка('Здесь вы можете посмотреть список участников нашей сети. Список подгружается по мере того, как вы прокручиваете его вниз.')

	$('#content').disableTextSelect()
	
	new Data_templater
	({
		template_url: '/страницы/кусочки/личная карточка.html',
		item_container: $('#id_cards'),
		postprocess_element: function(item)
		{
			return $('<li/>').append(item)
		},
		conditional: $('#people_list_block[type=conditional]')
	},
	new  Batch_loader_with_infinite_scroll
	({
		url: '/приложение/люди',
		batch_size: 8,
		get_data: function(data) { return data.люди }
	}))
}