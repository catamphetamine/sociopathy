(function()
{
	title('Новости')
	
	page.query('#news', 'news')
	
	page.load = function()
	{
		var conditional = initialize_conditional($('.main_conditional'), { immediate: true })
		
		new Data_templater
		({
			template_url: '/страницы/кусочки/новость.html',
			container: page.news,
			/*
			postprocess_element: function(item)
			{
				return $('<li/>').append(item)
			},
			*/
			conditional: conditional,
			loader: new  Data_loader
			({
				url: '/приложение/сеть/новости',
				before_done: news_loaded,
				get_data: function(data)
				{
					parse_dates(data.новости, 'когда')
					return data.новости
				}
			})
		})
	}
	
	function news_loaded()
	{
		Youtube.load_pictures(page.news)
		Vimeo.load_pictures(page.news)

		$(document).trigger('page_initialized')
		
	//	Режим.разрешить('правка')
	//	Режим.разрешить('действия')
	}
	
	page.needs_initializing = true
})()