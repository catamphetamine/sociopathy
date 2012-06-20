(function()
{
	page.query('#discussion', 'discussion')
	
	page.load = function()
	{
		title(page.data.обсуждение.id)
	
		new Data_templater
		({
			template: 'сообщение обсуждения',
			to: page.discussion,
			loader: new  Batch_data_loader_with_infinite_scroll
			({
				url: '/приложение/сеть/обсуждение',
				parameters: { _id: page.data.обсуждение._id, id: page.data.обсуждение.id },
				batch_size: 10,
				scroll_detector: page.get('#scroll_detector'),
				before_done: data_loaded,
				before_done_more: function() { ajaxify_internal_links(page.discussion) },
				data: function(data)
				{
					breadcrumbs
					([
						{ title: 'Обсуждения', link: '/сеть/обсуждения' },
						{ title: data.название, link: '/сеть/обсуждения/' + page.data.обсуждение.id }
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
		
		if (page.discussion.is_empty())
		{
			page.discussion.remove()
			page.get('.main_content').find('> .empty').show()
		}
		
	//	Режим.разрешить('правка')
	//	Режим.разрешить('действия')
	}
	
	page.needs_initializing = true
})()