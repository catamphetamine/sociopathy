Подсказка('написание сообщения', 'Для того, чтобы написать сообщение, нажмите клавишу <a href=\'/сеть/настройки\'>«Писарь → Показать»</a>');
Подсказка('правка сообщений', 'Вы можете править свои сообщения, перейдя в <a href=\'/помощь/режимы#Режим правки\'>«режим правки»</a>');
Подсказка('добавление в беседу', 'Вы можете добавлять людей в беседу нажатием клавиш <a href=\'/сеть/настройки\'>«Действия → Добавить»</a>');

(function()
{
	page.query('#talk', 'talk')
	Режим.пообещать('правка')
	
	var messages
	
	var unedited_talk_title
	
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
				
				unedited_talk_title = data.название
				
				page.data.создатель_ли = пользователь._id === data.создатель
				if (page.data.создатель_ли)
				{
					page.get('.breadcrumbs > :last').attr('editable', true)
				}
		
				data.участники.for_each(function(участник)
				{
					page.data.участник_ли = пользователь._id === участник
				})
				
				if (page.data.участник_ли)
				{
					Validation.беседа = {}
					Validation.беседа.добавить_пользователя = function(value, callback)
					{
						value = value.trim()
						
						if (!value)
							return callback({ error: 'Укажите имя пользователя' })
							
						var form = this
							
						page.Ajax.get('/приложение/человек/по имени',
						{
							имя: value
						})
						.ok(function(data)
						{
							form.user = data
							callback()
						})
						.ошибка(function(error)
						{
							callback({ error: error })
						})
					}
					
					var add_user_to_talk_window = simple_value_dialog_window
					({
						class: 'add_user_to_talk_window',
						title: 'Добавить пользователя в беседу',
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
					
					$(document).on_page('keydown.add_user_to_the_talk', function(event)
					{
						if (!Клавиши.is(Настройки.Клавиши.Действия.Добавить, event))
							return
						
						add_user_to_talk_window.open()
					})
				}
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
					'#talk > li[author="{id}"] .author'
				]
			},
			save_changes: save_title,
			discard_changes: function() { page.get('.breadcrumbs > :last').text(unedited_talk_title) }
		})
		
		messages.load()
	}
	
	page.unload = function()
	{
		messages.unload()
	}
		
	function talk_loaded()
	{
		$(document).trigger('page_initialized')
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