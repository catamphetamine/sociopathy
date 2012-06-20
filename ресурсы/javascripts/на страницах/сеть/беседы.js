title('Беседы');
	
(function()
{
	page.query('#talks', 'talks')
	
	page.load = function()
	{
		breadcrumbs
		([
			{ title: 'Беседы', link: '/сеть/беседы' }
		])
					
		new Data_templater
		({
			template: 'беседа в списке бесед',
			to: page.talks,
			loader: new  Batch_data_loader_with_infinite_scroll
			({
				url: '/приложение/сеть/беседы',
				batch_size: 10,
				scroll_detector: page.get('#scroll_detector'),
				before_done: talks_loaded,
				before_done_more: function() { ajaxify_internal_links(page.talks) },
				data: function(data)
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
		
		if (page.talks.is_empty())
		{
			page.talks.remove()
			page.get('.main_content').find('> .empty').show()
		}
		
	//	Режим.разрешить('правка')
	//	Режим.разрешить('действия')
	}
	
	page.needs_initializing = true
})()