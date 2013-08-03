(function()
{	
	title(text('pages.chat.title'))
	
	Режим.пообещать('правка')
	
	var messages
	
	var chat_loaded // on load function
	var chat
		
	page.load = function()
	{
		chat = $('.chat')
		
		messages = Interactive_messages
		({
			info:
			{
				что: 'болталка'
			},
			data_source:
			{
				url: '/приложение/сеть/болталка/сообщения'
			},
			more_link: $('.messages_framework > .older > a'),
			container: chat,
			//show_editor: true,
			edit_path: 'болталка',
			on_load: chat_loaded,
			on_message_bottom_appears: function(_id)
			{
				Новости.прочитано({ болталка: _id })
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
				away_aware_elements:
				[
					'.chat > li[author="{id}"] .author'
				]
			},
			set_up_visual_editor: function(visual_editor)
			{
				/*
				visual_editor.is_submission_key_combination = function(event)
				{
					return Клавиши.is('Enter', event) || Клавиши.is('Ctrl', 'Enter', event)
				}
				*/
			}
		})
		
		messages.load()
	}
	
	page.unload = function()
	{
		messages.unload()
	}
		
	chat_loaded = function()
	{
	}
})()