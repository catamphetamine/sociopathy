(function()
{
	page.query('#talk', 'talk')
	
	page.load = function()
	{
		title(page.data.беседа.id)
	
		new Data_templater
		({
			template: 'сообщение беседы',
			to: page.talk,
			loader: new  Batch_data_loader_with_infinite_scroll
			({
				url: '/приложение/сеть/беседа',
				parameters: { _id: page.data.беседа._id, id: page.data.беседа.id },
				batch_size: 10,
				scroll_detector: page.get('#scroll_detector'),
				before_done: data_loaded,
				before_done_more: function() { ajaxify_internal_links(page.talk) },
				data: function(data)
				{
					breadcrumbs
					([
						{ title: 'Беседы', link: '/сеть/беседы' },
						{ title: data.название, link: '/сеть/беседы/' + page.data.беседа.id }
					])
					
					parse_dates(data.сообщения, 'когда')
					return data.сообщения
				}
			})
		})
	}
	
	function data_loaded()
	{
		$(document).trigger('page_initialized')
		
		if (page.talk.is_empty())
		{
			page.talk.remove()
			page.get('.main_content').find('> .empty').show()
		}
		
	//	Режим.разрешить('правка')
	//	Режим.разрешить('действия')
	}
	
	page.needs_initializing = true
})()