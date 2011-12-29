function initialize_page()
{
	Режим.подсказка('Здесь вы можете посмотреть список участников нашей сети. Список подгружается по мере того, как вы прокручиваете его вниз.')

	$('#content').disableTextSelect()
	
	new Data_templater
	({
		template_url: '/лекала/личная карточка.html',
		item_container: $('#id_cards'),
		postprocess_item: function(item)
		{
			return $('<li/>').append(item)
		},
		conditional: $('#people_list_block[type=conditional]')
	},
	new  Batch_loader
	({
		url: '/приложение/люди',
		batch_size: 8,
		get_data: function (data) { return data.люди }
	}))
}