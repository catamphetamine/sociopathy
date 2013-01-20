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
			conditional: conditional,
			loader: new  Batch_data_loader_with_infinite_scroll
			({
				url: '/приложение/сеть/новости',
				batch_size: 10,
				scroll_detector: page.get('#scroll_detector'),
				before_done: news_loaded,
				done: page.initialized,
				before_done_more: function() { ajaxify_internal_links(page.news) },
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
		
	//	Режим.разрешить('правка')
	//	Режим.разрешить('действия')
	}
})()