title('Беседы')
	
(function()
{
	page.query('#talks', 'talks')
	
	page.load = function()
	{
		var conditional = initialize_conditional($('.main_conditional'), { immediate: true })
		
		new Data_templater
		({
			template_url: '/страницы/кусочки/беседа.html',
			container: page.talks,
			conditional: conditional,
			loader: new  Batch_data_loader_with_infinite_scroll
			({
				url: '/приложение/сеть/беседы',
				batch_size: 10,
				scroll_detector: content.find('#scroll_detector'),
				before_done: talks_loaded,
				before_done_more: function() { ajaxify_internal_links(page.talks) },
				get_data: function(data)
				{
					parse_dates(data.беседы, 'создана')
					return data.беседы
				}
			})
		})
	}
	
	function talks_loaded()
	{
		$(document).trigger('page_initialized')
		
	//	Режим.разрешить('правка')
	//	Режим.разрешить('действия')
	}
	
	page.needs_initializing = true
})()