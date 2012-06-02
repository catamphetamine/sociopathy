title('Обсуждения');
	
(function()
{	
	page.query('#discussions', 'discussions')
	
	page.load = function()
	{
		new Data_templater
		({
			template: 'обсуждение в списке обсуждений',
			to: page.discussions,
			loader: new  Batch_data_loader_with_infinite_scroll
			({
				url: '/приложение/сеть/обсуждения',
				batch_size: 10,
				scroll_detector: page.get('#scroll_detector'),
				before_done: discussions_loaded,
				before_done_more: function() { ajaxify_internal_links(page.discussions) },
				data: function(data)
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
		
		if (page.discussions.is_empty())
		{
			page.discussions.remove()
			page.get('.main_content').find('> .empty').show()
		}
		
	//	Режим.разрешить('правка')
	//	Режим.разрешить('действия')
	}
	
	page.needs_initializing = true
})()