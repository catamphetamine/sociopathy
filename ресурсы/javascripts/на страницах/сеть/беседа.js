(function()
{
	page.query('#talk', 'talk')
	
	Режим.пообещать('правка')
	Режим.пообещать('действия')
	
	var messages
	
	var unedited_talk_title
	
	page.load = function()
	{
		Подсказка('написание сообщения', 'Для того, чтобы написать сообщение, нажмите клавишу <a href=\'/сеть/настройки\'>«Писарь → Показать»</a>');
		Подсказка('правка сообщений', 'Вы можете править свои сообщения, перейдя в <a href=\'/помощь/режимы#Режим правки\'>«режим правки»</a>');
		Подсказка('добавление в беседу', 'Вы можете добавлять людей в беседу, перейдя в <a href=\'/помощь/режимы#Режим действий\'>«режим действий»</a>, или нажав клавиши <a href=\'/сеть/настройки\'>«Действия → Добавить»</a>');
		Подсказка('переименование общения', 'Вы можете переименовать этот разговор, перейдя в <a href=\'/помощь/режимы#Режим правки\'>«режим правки»</a>');

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
				
				unedited_talk_title = data.название
				
				page.data.создатель_ли = пользователь._id === data.создатель
				if (page.data.создатель_ли)
				{
					page.get('.breadcrumbs > :last').attr('editable', true)
				}
		
				data.участники.for_each(function(участник)
				{
					if (пользователь._id === участник)
						page.data.участник_ли = true
				})
				
				if (page.data.участник_ли)
				{
					var add_user_to_talk_window = simple_value_dialog_window
					({
						class: 'add_user_to_talk_window',
						title: 'Добавить пользователя в беседу',
						ok_button_text: 'Добавить',
						fields:
						[{
							id: 'name',
							description: 'Кого добавим',
							validation: 'беседа.добавить_пользователя'
						}],
						ok: function(name)
						{
							var user = add_user_to_talk_window.form.user
							
							page.Ajax.put('/приложение/сеть/беседы/участие',
							{
								беседа: page.data.беседа._id,
								пользователь: user._id
							})
							.ok(function(data)
							{
								if (data.уже_участвует)
									return info(user.имя + ' уже участвует в этой беседе')
								
								info(user.имя + ' добавлен' + (user.пол === 'женский' ? 'а' : '') + ' в эту беседу')
							})
							.ошибка(function(ошибка)
							{
								error(ошибка)
							})
						}
					})
					.window
					
					text_button.new(page.get('.add_to_talk.button')).does(function()
					{
						add_user_to_talk_window.open()
					})
		
					Режим.разрешить('действия')
					
					page.hotkey('Действия.Добавить', function()
					{
						add_user_to_talk_window.open()
					})
				}
				else
				{
					Режим.запретить('действия')
				}
			},
			more_link: $('.messages_framework > .older > a'),
			container: page.talk,
			//show_editor: true,
			edit_path: 'беседы',
			on_load: talk_loaded,
			on_first_output: page.initialized,
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
					'#talk > li[author="{id}"] .author'
				]
			},
			save_changes: save_title,
			discard_changes: function() { page.get('.breadcrumbs > :last').text(unedited_talk_title) }
		})
		
		$(document).on_page('talk_renamed', function(event, data)
		{
			if ($('#talk').attr('_id') === data._id)
			{
				page.get('.breadcrumbs > :last').text(data.как)
				title(data.как)
			}
		})
		
		messages.load()
	}
	
	page.unload = function()
	{
		messages.unload()
	}
		
	function talk_loaded()
	{
	}

	function save_title(loading)
	{
		var edited_talk_title = page.get('.breadcrumbs > :last').text()
				
		Режим.save_changes_to_server
		({
			загрузка: loading,
			
			anything_changed: function()
			{
				if (!page.data.создатель_ли)
					return false
				
				if (unedited_talk_title !== edited_talk_title)
					return true
			},
			
			data:
			{
				_id: page.talk.attr('_id'),
				название: edited_talk_title
			},
			
			url: '/приложение/сеть/беседы/переназвать',
			method: 'post',
			
			ok: function()
			{
				unedited_talk_title = edited_talk_title
			}
		})
	}
})()