(function()
{	
	title(text('pages.chat.title'))
	
	Режим.пообещать('правка')
	
	var messages
	
	var chat_loaded // on load function
	var chat
		
	page.load = function()
	{
		Подсказка('написание сообщения', 'Для того, чтобы написать сообщение, нажмите клавишу <a href=\'/сеть/настройки\'>«Писарь → Показать»</a>');
		//Подсказка('правка сообщений', 'Вы можете править свои сообщения, перейдя в <a href=\'/помощь/режимы#Режим правки\'>«режим правки»</a>');

		chat = $('.chat')
		
		messages = Interactive_messages
		({
			data_source:
			{
				url: '/приложение/сеть/болталка/сообщения'
			},
			more_link: $('.messages_framework > .older > a'),
			container: chat,
			//show_editor: true,
			edit_path: 'болталка',
			on_load: chat_loaded,
			on_first_output: page.content_ready,
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
				path: '/болталка',
				away_aware_elements:
				[
					'.chat > li[author="{id}"] .author'
				]
			},
			set_up_visual_editor: function(visual_editor)
			{
				visual_editor.is_submission_key_combination = function(event)
				{
					return Клавиши.is('Enter', event) || Клавиши.is('Ctrl', 'Enter', event)
				}
				
				/*
				visual_editor.intercept_enter = (function()
				{
					alert(visual_editor.html())
					this.send_message()
				})
				.bind(this)
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