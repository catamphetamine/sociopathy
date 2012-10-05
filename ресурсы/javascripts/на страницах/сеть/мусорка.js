(function()
{
	var main_content
	
	page.query('.trash', 'trash')
	
	page.load = function()
	{
		Подсказка('мусорка', 'Это общая мусорка. Все общие удалённые данные попадают сюда. Если данные были удалени по ошибке, их можно (будет) отсюда восстановить')
	
		main_content = $('.main_content')
		
		new Data_templater
		({
			template: 'содержимое мусорки',
			to: page.trash,
			conditional: initialize_conditional($('.main_conditional'), { immediate: true }),
			loader: new Batch_data_loader_with_infinite_scroll
			({
				url: '/приложение/сеть/мусорка',
				batch_size: 18,
				scroll_detector: page.get('#scroll_detector'),
				data: function(data)
				{
					data.trash.for_each(function()
					{
						parse_date(this, 'когда_выброшено')
						
						var data = {}
						
						Object.for_each(this, function(key, value)
						{
							if (key === '_id')
								return
							
							if (key === 'что')
								return
							
							if (key === 'когда_выброшено')
								return
							
							if (key === 'кто_выбросил')
								return
							
							data[key] = value
						})
						
						this.содержимое = JSON.stringify(data, null, '\t')
					})
					
					return data.trash
				},
				before_done: trash_loaded,
				before_done_more: function() { ajaxify_internal_links(page.trash) },
				done: page.initialized
			})
		})
	}
	
	function trash_loaded(содержимое)
	{
		if (содержимое.пусто())
		{
			main_content.find('.empty').show()
		}
		else
		{
			main_content.find('.trash').show()
			main_content.find('.trash').find('th').disableTextSelect()
		}
	}
})()