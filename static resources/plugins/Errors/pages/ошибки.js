(function()
{
	title(text('pages.errors.title'))

	page.query('.errors', 'errors')
	
	page.load = function()
	{
		page.подсказка('ошибки', 'Здесь показываются ошибки, которые происходят у всех пользователей сети')
	
		new Data_templater
		({
			template: 'ошибки',
			to: page.errors,
			table: true,
			loader: new Scroll_loader
			({
				url: '/приложение/сеть/ошибки',
				batch_size: 10,
				data: function(data)
				{
					data.ошибки.for_each(function()
					{
						parse_date(this, 'когда')
						this.когда_примерно = неточное_время(this.когда, { blank_if_just_now: true })
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