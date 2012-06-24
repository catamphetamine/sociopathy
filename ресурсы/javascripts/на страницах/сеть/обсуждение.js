(function()
{
	page.query('#discussion', 'discussion')
	
	var messages
	
	page.load = function()
	{
		title(page.data.обсуждение.id)
		
		messages = Interactive_messages
		({
			data_source:
			{
				url: '/приложение/сеть/обсуждение',
				parameters: { _id: page.data.обсуждение._id, id: page.data.обсуждение.id }
			},
			on_first_time_data: function(data)
			{
				breadcrumbs
				([
					{ title: 'Обсуждения', link: '/сеть/обсуждения' },
					{ title: data.название, link: '/сеть/обсуждения/' + page.data.обсуждение.id }
				])
			},
			more_link: $('.messages_framework > .older > a'),
			container: page.discussion,
			scroller: прокрутчик,
			show_editor: false,
			on_load: discussion_loaded,
			connection:
			{
				path: '/обсуждение/' + page.data.обсуждение._id
			}
		})
		
		messages.load()
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