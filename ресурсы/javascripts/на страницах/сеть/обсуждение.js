(function()
{
	page.query('#discussion', 'discussion')
	
	var messages
	
	page.load = function()
	{
		title(page.data.обсуждение.id)
		
		messages = Interactive_messages
		({
			
			show_editor: false,
			on_load: ,
			connection:
			{
			}
		})
		
		
		messages = Interactive_messages
		({
			data_source:
			{
				url: '/приложение/сеть/обсуждение/сообщения',
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
			show_editor: true,
			on_load: discussion_loaded,
			before_prepend: function(message)
			{
				var author = message.find('.author')
				if (Эфир.кто_в_сети.has(message.attr('author')))
					author.addClass('online')
			},
			on_message_data: function(data)
			{
				Эфир.следить_за_пользователем(data.отправитель)
			},
			connection:
			{
				path: '/обсуждение/' + page.data.обсуждение._id,
				on_reconnection: function() { who_is_online_bar_list.empty() },
				on_connection: function()
				{
					внести_пользователя_в_список_вверху(пользователь, { куда: 'в начало' })
				},
				away_aware_elements:
				[
					'.who_is_online > li[user="{id}"]',
					'.chat > li[author="{id}"] .author'
				],
				on_user_connected: внести_пользователя_в_список_вверху,
				on_user_disconnected: пользователь_вышел_из_болталки
			}
		})
		
		messages.load()
	}
	
	function discussion_loaded()
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