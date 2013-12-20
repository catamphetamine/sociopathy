(function()
{
	title(text('pages.news.title'))
	
	page.query('#news', 'news')
	
	page.load_data
	({
		url: '/сеть/новости',
		batch_size: 10,
		get_data: function(data)
		{
			parse_dates(data.новости, 'когда')
			
			data.новости.for_each(function()
			{
				this.когда_примерно = неточное_время(this.когда, { blank_if_just_now: true })
			})
			
			return data.новости
		}
	})
	
	page.data_template = 'новость'
	page.data_container = 'news'
	
	page.load = function()
	{
	}
	
	page.before_output_data(function()
	{
		Youtube.load_pictures(page.news)
		Vimeo.load_pictures(page.news)
		
	//	Режим.разрешить('правка')
	})
})()