(function()
{
	title(text('pages.news.title'))
	
	page.query('#news', 'news')
	
	page.data_loader = new  Scroll_loader
	({
		url: '/сеть/новости',
		batch_size: 10,
		done: page.content_ready,
		before_done_more: function() { ajaxify_internal_links(page.news) },
		get_data: function(data)
		{
			parse_dates(data.новости, 'когда')
			
			data.новости.for_each(function()
			{
				this.когда_примерно = неточное_время(this.когда, { blank_if_just_now: true })
			})
			
			return data.новости
		},
		hidden: true
	})
	
	page.load = function()
	{
		//page.data_loader.options.scroll_detector = page.get('#scroll_detector')
		page.data_loader.initialize_scrolling()
		
		new Data_templater
		({
			template: 'новость',
			container: page.news,
			loader: page.data_loader
		})
		.show()
	}
	
	page.preload = function(finish)
	{
		page.data_loader.preload(finish)
	}
	
	page.data_loader.options.before_done = function()
	{
		Youtube.load_pictures(page.news)
		Vimeo.load_pictures(page.news)
		
	//	Режим.разрешить('правка')
	}
})()