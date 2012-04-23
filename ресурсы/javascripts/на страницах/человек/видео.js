(function()
{
	title('Видео. ' + page.data.адресное_имя)
	
	Режим.пообещать('правка')
	Режим.пообещать('действия')
	
	page.load = function()
	{
		var conditional = initialize_conditional($('.main_conditional'))
		
		breadcrumbs
		([
			{ title: page.data.адресное_имя, link: '/люди/' + page.data.адресное_имя },
			{ title: 'Видео', link: '/люди/' + page.data.адресное_имя + '/видео' }
		],
		function()
		{
			new Data_templater
			({
				template_url: '/страницы/кусочки/альбом с видео в списке альбомов.html',
				item_container: $('#albums'),
				postprocess_element: function(item)
				{
					return $('<li/>').append(item)
				},
				conditional: conditional
			},
			new  Data_loader
			({
				url: '/приложение/человек/видео/альбомы',
				parameters: { 'адресное имя': page.data.адресное_имя },
				before_done_output: albums_loaded,
				get_data: function(data) { return data.альбомы }
			}))
		
			$(window).on_page('resize.albums', center_albums_list)
			center_albums_list()
		},
		function() { conditional.callback('Не удалось получить данные') })
	}
	
	function center_albums_list()
	{
		center_list($('#albums'), { space: $('#content'), item_width: 706, item_margin: 60 })
	}
	
	function albums_loaded()
	{
		Режим.разрешить('правка')
		Режим.разрешить('действия')
		
		$(document).trigger('page_initialized')
	}
})()