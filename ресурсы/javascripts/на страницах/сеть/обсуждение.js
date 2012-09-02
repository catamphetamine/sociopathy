(function()
{
	page.query('#discussion', 'discussion')
	Режим.пообещать('правка')
	
	var messages
	
	page.load = function()
	{
		messages = Interactive_messages
		({
			data_source:
			{
				url: '/приложение/сеть/обсуждение/сообщения',
				parameters: { _id: page.data.обсуждение._id, id: page.data.обсуждение.id }
			},
			on_first_time_data: function(data)
			{
				//console.log(data)
				title(data.название)
				
				page.data.обсуждение._id = data._id
				
				page.discussion.attr('_id', data._id)
				
				breadcrumbs
				([
					{ title: 'Обсуждения', link: '/сеть/обсуждения' },
					{ title: data.название, link: '/сеть/обсуждения/' + page.data.обсуждение.id }
				])
			},
			more_link: $('.messages_framework > .older > a'),
			container: page.discussion,
			//show_editor: true,
			edit_path: 'обсуждения',
			on_load: discussion_loaded,
			on_message_bottom_appears: function(_id)
			{
				Новости.прочитано({ обсуждение: page.data.обсуждение._id, сообщение: _id })
			},
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
				path: '/обсуждение',
				away_aware_elements:
				[
					'.discussion > li[author="{id}"] .author'
				]
			}
		})
		
		messages.load()
	}
	
	function discussion_loaded() //finish_initialization)
	{
		$(document).trigger('page_initialized')
	}
})()