title('Картинки. ' + адресное_имя)

Режим.пообещать('правка')
Режим.пообещать('действия')

function initialize_page()
{
	var conditional = initialize_conditional($('.main_conditional[type=conditional]'))
	
	breadcrumbs
	([
		{ title: адресное_имя, link: '/люди/' + адресное_имя },
		{ title: 'Картинки', link: '/люди/' + адресное_имя + '/картинки' }
	],
	function()
	{
		new Data_templater
		({
			template_url: '/страницы/кусочки/альбом с картинками в списке альбомов.html',
			item_container: $('#albums'),
			postprocess_element: function(item)
			{
				return $('<li/>').append(item)
			},
			conditional: conditional
		},
		new  Data_loader
		({
			url: '/приложение/человек/картинки/альбомы',
			parameters: { адресное_имя: window.адресное_имя },
			before_done_output: albums_loaded,
			get_data: function(data) { return data.альбомы }
		}))
	
		$(window).resize(center_albums_list)
		center_albums_list()
	},
	function() { conditional.callback('Не удалось получить данные') })
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
