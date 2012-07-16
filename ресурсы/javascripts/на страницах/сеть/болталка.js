(function()
{
	title('Болталка')
	
	var messages
	
	var chat_loaded // on load function
	var chat
		
	page.load = function()
	{
		Подсказки.подсказка('Здесь вы можете разговаривать с другими членами сети.')
		Подсказки.ещё_подсказка('Вверху вы видите список людей, у которых сейчас открыта болталка.')
		Подсказки.ещё_подсказка('Также, в списке сообщений, пользователи, у которых сейчас открыта болталка, подсвечены зелёным.')

		chat = $('.main_content .chat')
		
		messages = Interactive_messages
		({
			data_source:
			{
				url: '/приложение/сеть/болталка/сообщения'
			},
			more_link: $('.messages_framework > .older > a'),
			container: chat,
			show_editor: true,
			on_load: chat_loaded,
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
				path: '/болталка',
				away_aware_elements:
				[
					'.chat > li[author="{id}"] .author'
				]
			}
		})
		
		messages.load()
	}
	
	page.unload = function()
	{
		messages.unload()
	}
		
	chat_loaded = function() //finish_initialization)
	{
		//finish_initialization()
	}
})()