(function()
{
	title('Обсуждения')
	
	page.query('#discussions', 'discussions')
	
	page.load = function()
	{
		var conditional = initialize_conditional($('.main_conditional'), { immediate: true })
		
		new Data_templater
		({
			template_url: '/страницы/кусочки/обсуждение.html',
			container: page.discussions,
			conditional: conditional,
			loader: new  Batch_data_loader_with_infinite_scroll
			({
				url: '/приложение/сеть/обсуждения',
				batch_size: 5,
				scroll_detector: content.find('#scroll_detector'),
				before_done: discussions_loaded,
				before_done_more: function() { ajaxify_internal_links(page.discussions) },
				get_data: function(data)
				{
					parse_dates(data.обсуждения, 'создано')
					return data.обсуждения
				}
			})
		})
	}
	
	function discussions_loaded()
	{
		$(document).trigger('page_initialized')
		
	//	Режим.разрешить('правка')
	//	Режим.разрешить('действия')
	}
	
	page.needs_initializing = true
})()