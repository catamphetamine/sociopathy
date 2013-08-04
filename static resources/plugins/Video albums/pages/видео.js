(function()
{
	title(text('pages.video albums.title'))
	
	//Режим.пообещать('правка')
	
	page.load = function()
	{
		var conditional = initialize_conditional($('.main_conditional'))
		
		new Data_templater
		({
			template: 'альбом с видео в списке альбомов',
			container: $('#albums'),
			conditional: conditional
		},
		new  Data_loader
		({
			url: '/человек/видео/альбомы',
			parameters: { id: page.data.пользователь_сети.id },
			before_done: albums_loaded,
			done: function()
			{
				page.content_ready()
				center_albums_list()
			},
			get_data: function(data)
			{
				title(text('pages.video albums.title') + '. ' + data.пользователь.имя)
	
				breadcrumbs
				([
					{ title: data.пользователь.имя, link: link_to('user', page.data.пользователь_сети.id) },
					{ title: text('pages.video albums.title'), link: link_to('user.videos', page.data.пользователь_сети.id) }
				])
				
				return data.альбомы
			}
		}))
	
		$(window).on_page('resize.albums', center_albums_list)
	}
	
	function center_albums_list()
	{
		center_list($('#albums'), { space: $('#content'), item_width: 706, side_margin: 60 })
	}
	
	function albums_loaded()
	{
		//Режим.разрешить('правка')
	}
})()