function initialize_page()
{
	Режим.подсказка('Здесь вы можете посмотреть список участников нашей сети. Список подгружается по мере того, как вы прокручиваете его вниз.')

	$('#content').disableTextSelect()
	
	new Data_templater
	({
		url: '/приложение/люди',
		batch_size: 8,
		list: function (data) { return data.люди },
		template_url: '/лекала/личная карточка.html',
		item_container: $('#id_cards'),
		postprocess_item_element: function(element)
		{
			return $('<li/>').append(element)
		},
		conditional: $('#people_list_block[type=conditional]'),
		loader: Batch_loader
	})
}