(function()
{
	title('Дневник. ' + page.data.пользователь_сети['адресное имя'])
	
	page.query('#diary', 'diary')
	
	page.load = function()
	{
		var conditional = initialize_conditional($('.main_conditional'), { immediate: true })
	
		new Data_templater
		({
			template_url: '/страницы/кусочки/запись в дневнике в списке.html',
			container: page.diary,
			conditional: conditional,
			loader: new  Batch_data_loader_with_infinite_scroll
			({
				url: '/приложение/человек/дневник',
				parameters: { сочинитель: page.data.пользователь_сети['адресное имя'] },
				batch_size: 10,
				scroll_detector: page.get('#scroll_detector'),
				before_done: diary_loaded,
				before_done_more: function() { ajaxify_internal_links(page.diary) },
				get_data: function(data)
				{
					breadcrumbs
					([
						{ title: data.пользователь.имя, link: '/люди/' + page.data.адресное_имя },
						{ title: 'Дневник', link: '/люди/' + page.data.адресное_имя + '/дневник' }
					])
					
					parse_dates(data.дневник, 'время')
					return data.дневник
				}
			})
		})
	}
	
	function diary_loaded()
	{
		$(document).trigger('page_initialized')
		
		if (page.diary.is_empty())
		{
			page.diary.remove()
			page.get('.main_content').find('> .empty').show()
		}
		
	//	Режим.разрешить('правка')
	//	Режим.разрешить('действия')
	}
	
	page.needs_initializing = true
})()