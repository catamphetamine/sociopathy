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