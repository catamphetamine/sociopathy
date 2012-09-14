(function()
{
	page.query('#talk', 'talk')
	Режим.пообещать('правка')
	
	var messages
	
	page.load = function()
	{
		messages = Interactive_messages
		({
			data_source:
			{
				url: '/приложение/сеть/беседа/сообщения',
				parameters: { _id: page.data.беседа._id, id: page.data.беседа.id }
			},
			on_first_time_data: function(data)
			{
				//console.log(data)
				title(data.название)
				
				page.data.беседа._id = data._id
				page.talk.attr('_id', data._id)
				
				breadcrumbs
				([
					{ title: 'Беседы', link: '/сеть/беседы' },
					{ title: data.название, link: '/сеть/беседы/' + page.data.беседа.id }
				])
			},
			more_link: $('.messages_framework > .older > a'),
			container: page.talk,
			//show_editor: true,
			edit_path: 'беседы',
			on_load: talk_loaded,
			on_message_bottom_appears: function(_id)
			{
				Новости.прочитано({ беседа: page.data.беседа._id, сообщение: _id })
			},
			before_output: function(message)
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
				path: '/беседа',
				away_aware_elements:
				[
					'.talk > li[author="{id}"] .author'
				]
			}
		})
		
		messages.load()
	}
		
	function talk_loaded()
	{
		$(document).trigger('page_initialized')
	}
})()