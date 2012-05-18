(function()
{
	title('Картинки. ' + page.data.адресное_имя)
	
	Режим.пообещать('правка')
	Режим.пообещать('действия')
	
	page.load = function()
	{
		var conditional = initialize_conditional($('.main_conditional'))
		
		breadcrumbs
		([
			{ title: page.data.адресное_имя, link: '/люди/' + page.data.адресное_имя },
			{ title: 'Картинки', link: '/люди/' + page.data.адресное_имя + '/картинки' }
		],
		function()
		{
			new Data_templater
			({
				template_url: '/страницы/кусочки/альбом с картинками в списке альбомов.html',
				container: $('#albums'),
				postprocess_element: function(item)
				{
					return $('<li/>').append(item)
				},
				conditional: conditional
			},
			new  Data_loader
			({
				url: '/приложение/человек/картинки/альбомы',
				parameters: { 'адресное имя': page.data.адресное_имя },
				before_done: albums_loaded,
				get_data: function(data) { return data.альбомы }
			}))
		
			$(window).on_page('resize.albums', center_albums_list)
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
		
		$(document).trigger('page_initialized')
	}
})()