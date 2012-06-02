(function()
{
	title('Журнал. ' + page.data.пользователь_сети.имя)
	
	page.query('#journal', 'journal')
	
	page.load = function()
	{
		var conditional = initialize_conditional($('.main_conditional'), { immediate: true })
		
		new Data_templater
		({
			template_url: '/страницы/кусочки/запись в журнале в списке.html',
			container: page.journal,
			conditional: conditional,
			loader: new  Batch_data_loader_with_infinite_scroll
			({
				url: '/приложение/человек/журнал',
				parameters: { сочинитель: page.data.пользователь_сети['адресное имя'] },
				batch_size: 10,
				scroll_detector: page.get('#scroll_detector'),
				before_done: journal_loaded,
				before_done_more: function() { ajaxify_internal_links(page.journal) },
				get_data: function(data)
				{
					parse_dates(data.журнал, 'время')
					return data.журнал
				}
			})
		})
	}
	
	function journal_loaded()
	{
		$(document).trigger('page_initialized')
		
		if (page.journal.is_empty())
		{
			page.journal.remove()
			page.get('.main_content').find('> .empty').show()
		}
		
	//	Режим.разрешить('правка')
	//	Режим.разрешить('действия')
	}
	
	page.needs_initializing = true
})()