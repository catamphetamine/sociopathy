(function()
{
	title('Картинки. ' + page.data.адресное_имя)
	
	Режим.пообещать('правка')
	Режим.пообещать('действия')
	
	page.load = function()
	{
		var conditional = initialize_conditional($('.main_conditional'))

		new Data_templater
		({
			template_url: '/страницы/кусочки/альбом с картинками в списке альбомов.html',
			container: $('#albums'),
			postprocess_element: function(item)
			{
				return $('<li/>').append(item)
			},
			callback: function(error)
			{
				if (error)
					return conditional(error)
			}
		},
		new  Data_loader
		({
			url: '/приложение/человек/картинки/альбомы',
			parameters: { 'адресное имя': page.data.адресное_имя },
			before_done: albums_loaded,
			done: page.initialized,
			get_data: function(data)
			{	
				breadcrumbs
				([
					{ title: data.пользователь.имя, link: '/люди/' + page.data.адресное_имя },
					{ title: 'Картинки', link: '/люди/' + page.data.адресное_имя + '/картинки' }
				])
				
				return data.альбомы
			}
		}))
	
		$(window).on_page('resize.albums', center_albums_list)
		center_albums_list()
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
})()