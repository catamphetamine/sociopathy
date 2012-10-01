Подсказка('написание сообщения', 'Для того, чтобы написать сообщение, нажмите клавишу <a href=\'/сеть/настройки\'>«Писарь → Показать»</a>');
Подсказка('правка сообщений', 'Вы можете править свои сообщения, перейдя в <a href=\'/помощь/режимы#Режим правки\'>«режим правки»</a>');

(function()
{
	title('Болталка')
	Режим.пообещать('правка')
	
	var messages
	
	var chat_loaded // on load function
	var chat
		
	page.load = function()
	{
		//Подсказки.подсказка('Здесь вы можете разговаривать с другими членами сети.')
		//Подсказки.ещё_подсказка('Вверху вы видите список людей, у которых сейчас открыта болталка.')
		//Подсказки.ещё_подсказка('Также, в списке сообщений, пользователи, у которых сейчас открыта болталка, подсвечены зелёным.')

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