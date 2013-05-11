(function()
{
	title(text('pages.errors.title'))

	page.query('.errors', 'errors')
	
	page.load = function()
	{
		Подсказка('ошибки', 'Здесь показываются ошибки, которые происходят у всех пользователей сети')
	
		new Data_templater
		({
			template: 'ошибки',
			to: page.errors,
			table: true,
			loader: new Batch_data_loader_with_infinite_scroll
			({
				url: '/приложение/сеть/ошибки',
				batch_size: 10,
				data: function(data)
				{
					data.ошибки.for_each(function()
					{
						parse_date(this, 'когда')
					})
					
					return data.ошибки
				},
				before_done: data_loaded,
				before_done_more: function() { ajaxify_internal_links(page.errors) },
				done: page.content_ready
			})
		})
	}
	
	function data_loaded(содержимое)
	{
		if (содержимое.пусто())
		{
			page.get('.empty').show()
		}
		else
		{
			page.get('.errors').show()
			page.get('.errors').find('th').disableTextSelect()
		}
	}
})()