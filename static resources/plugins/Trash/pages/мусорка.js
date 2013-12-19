(function()
{
	title(text('pages.trash.title'))

	page.query('.trash', 'trash')
	
	page.data_loader = new Scroll_loader
	({
		url: '/приложение/сеть/мусорка',
		batch_size: 10,
		data: function(data)
		{
			data.trash.for_each(function()
			{
				parse_date(this, 'когда_выброшено')
				this.когда_примерно_выброшено = неточное_время(this.когда_выброшено, { blank_if_just_now: true })
				
				var data = {}
				
				Object.for_each(this.данные, function(key, value)
				{
					data[key] = value
				})
				
				this.содержимое = JSON.stringify(data, null, '\t')
			})
			
			return data.trash
		},
		before_done_more: function() { ajaxify_internal_links(page.trash) },
		done: page.content_ready,
		hidden: true
	})
	
	page.preload = function(finish)
	{
		page.data_loader.preload(finish)
	}
	
	page.load = function()
	{
		page.подсказка('мусорка', 'Это общая мусорка. Все общие удалённые данные попадают сюда. Если данные были удалени по ошибке, их можно отсюда восстановить')
	
		page.data_loader.initialize_scrolling()
		
		new Data_templater
		({
			template: 'содержимое мусорки',
			to: page.trash,
			table: true,
			postprocess_item: function(data)
			{
				var item = this
				
				var menu = page.context_menu(this,
				{
					items:
					[
						{
							title: 'Восстановить',
							action: function()
							{
								page.Ajax.post('/сеть/мусорка/восстановить',
								{
									_id: data._id
								})
								.ok(function()
								{
									return info('Восстановление из корзины пока не сделано')
									
									item.shrink_upwards(function()
									{
										item.remove()
									})
								})
							}
						}
					]
				})
			},
			loader: page.data_loader
		})
		.show()
	}
	
	page.data_loader.options.before_done = function(содержимое)
	{
		if (содержимое.пусто())
		{
			page.get('.empty').show()
		}
		else
		{
			page.get('.trash').show()
			page.get('.trash').find('th').disableTextSelect()
		}
	}
})()