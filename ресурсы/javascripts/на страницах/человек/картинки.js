title('Картинки. ' + адресное_имя)

Режим.пообещать('правка')
Режим.пообещать('действия')

function initialize_page()
{
	new Data_templater
	({
		template_url: '/страницы/кусочки/альбом с картинками в списке альбомов.html',
		item_container: $('#albums'),
		postprocess_element: function(item)
		{
			return $('<li/>').append(item)
		},
		conditional: $('#albums_block[type=conditional]')
	},
	new  Data_loader
	({
		url: '/приложение/человек/альбомы с картинками',
		parameters: { адресное_имя: window.адресное_имя },
		before_done_output: albums_loaded,
		get_data: function(data) { return data.альбомы }
	}))

	$(window).resize(center_albums_list)
	center_albums_list()
}

function categories_loaded()
{
	Режим.разрешить('правка')
}

function center_albums_list()
{
	center_list($('#albums'), { space: $('#content'), item_width: 400, item_margin: 60 })
}

function albums_loaded()
{
	Режим.разрешить('правка')
	Режим.разрешить('действия')
}
