(function()
{
	title(text('pages.main.title'))
	
	/**
	 * Welcome page initialization
	 */

	page.needs_initializing = false
	
	var join_dialog
	var gender_chooser
	var joined_message
	var join_form_slider
	
	var join_dialog_cancel_button
	var join_dialog_next_button
	var join_dialog_done_button
	
	var join_button
	
	// activate join button
	function initialize_join_button()
	{
		join_button = button.physics.classic(new image_button("#join_button").does(function() { join_dialog.open() }))
	}
	
	var прописан = false
	
	// create join dialog
	function initialize_join_dialog()
	{
		join_dialog = $("#join_dialog").dialog_window
		({
			'close on escape': true,
			'on open': function() { $('#join_dialog input:first').focus() }
		})
		
		join_dialog.register_controls
		(
			join_dialog_cancel_button,
			join_dialog_next_button,
			join_dialog_done_button, 
			join_form_slider
		)
		
		join_dialog.on('open', function()
		{
			Подсказки.запомнить('вне_окошка')
			Подсказки.подсказка('Выберите себе имя в нашей сети. Например, "Иван Петрович Сидоров".')
		})
		
		join_dialog.on('close', function()
		{
			if (!прописан)
				Подсказки.подсказка(Подсказки.возстановить('вне_окошка'))
		})
		
		join_form_slider.on('slide_No_2', function()
		{
			Подсказки.подсказка('Нажмите на картинку, соответствующую вашему полу.')
		})
		
		join_form_slider.on('slide_No_3', function()
		{
			Подсказки.подсказка('Разскажите нам, откуда вы. Например: "Москва", "Где-то на границе с Монголией", "Кольский полуостров".')
		})
		
		join_form_slider.on('slide_No_5', function()
		{
			Подсказки.подсказка('По этому паролю вы будете входить в нашу сеть. Например: "белый слон жуёт морковь", "кто не спрятался - я не виноват", "у меня везде один пароль".')
		})
		
		join_form_slider.set_container(join_dialog.content)
		join_form_slider.when_done(function() { join_submission(join_form_slider.data()) })
	}
	
	// create join dialog buttons
	function initialize_join_dialog_buttons()
	{
		join_dialog_cancel_button = text_button.new('#join_dialog .buttons .cancel', { 'prevent double submission': true, physics: 'fast' })
		.does(function() { join_dialog.close() })
		
		join_dialog_next_button = text_button.new('#join_dialog .buttons .next')
		.does(function() { join_form_slider.next() })
		
		join_dialog_done_button = text_button.new('#join_dialog .buttons .done', { 'prevent double submission': true })
		.does(function() { join_form_slider.done() })
	}
	
	// create join dialog slider
	function initialize_join_form_slider()
	{
		join_form_slider = new form_slider
		({
			selector: "#join_dialog .slider",
			buttons:
			{
				next: join_dialog_next_button,
				done: join_dialog_done_button
			},
			fields:
			{
				имя:
				{
				},
				пол:
				{
					control: gender_chooser
				},
				откуда:
				{
				},
				почта:
				{
				},
				пароль:
				{
				}
			}
		})
	}
	
	// create gender chooser
	function initialize_gender_chooser()
	{
		gender_chooser = new image_chooser
		(
			"#join_dialog .gender .chooser",
			{
				target: "#join_dialog .gender input[type=hidden]",
				on_choice: function()
				{
					join_form_slider.next()
				}
			}
		)
	}
		
	function activate_registration()
	{
		initialize_join_button()

		initialize_join_dialog_buttons()
		initialize_gender_chooser()
		initialize_join_form_slider()
		initialize_join_dialog()
		
		Подсказки.подсказка('Теперь вы можете прописаться, нажав на кнопку "Присоединиться" внизу страницы.')
	}
	
	var conditional
	page.load = function()
	{
		Подсказки.подсказка('Это заглавная страница нашей сети. Воспользуйтесь меню слева сверху для перехода в какой-либо раздел сети.')
		
		/*
		if (пользователь)
		{
			panel.buttons.мусорка.element.parent().show()
			//panel.buttons.мусорка.tooltip.update_position()
		}
		*/
		
		if (пользователь)
			return
		
		if (Configuration.Invites)
		{
			if (получить_настройку_запроса('приглашение'))
			{
				conditional = initialize_conditional($('.join_button_block').show())
				
				check_invite(function(error)
				{
					if (error)
						return conditional.callback(error)
					
					conditional.callback(null, function()
					{
						(function() { join_button.push() }).delay(1000)
					})
				})
			}
		}
		else
		{
			$('.join_button_block').children().hide()
			$('.join_button_block > [type=ok]').show()
			$('.join_button_block').show()
			
			activate_registration()
		}
	}
	
	function check_invite(callback)
	{
		var приглашение = получить_настройку_запроса('приглашение')
	
		page.Ajax.get('/приложение/приглашение/проверить', { приглашение: приглашение })
		.ошибка(function(message)
		{
			if (message === "Нет такого приглашения в списке")
				info('Ваше приглашение не найдено в списке. Возможно кто-то уже прописался по нему. Возможно эта ссылка неправильная. Напишите нам об этом, и мы вам поможем.')
			else
				info('Произошла ошибка в ходе проверки вашего приглашения. Напишите нам об этом, и мы вам поможем.')
	
			callback(message)
		})
		.ok(function(данные)
		{
			if (!данные.приглашение)
				return callback('no invite')
				
			activate_registration()
			callback()
		})
	}
	
	// actions
	
	// submit join request
	function join_submission(data)
	{
		data.приглашение = получить_настройку_запроса('приглашение')
	
		var loading = loading_indicator.show()
		page.Ajax.put('/приложение/прописать', data)
		.ошибка(function()
		{
			error('Не удалось прописаться')
			Подсказки.подсказка('Произошла какая-то ошибка. Напишите нам об этом, и мы вам поможем.')
		})
		.ok(function(данные) 
		{ 
			//прописан = true
			//Подсказки.подсказка('Сейчас страница будет перезагружена.')
	
			//loading.hide()
			//join_dialog.close()
			
			войти({ имя: data.имя, пароль: data.пароль, go_to: '/' })
		})
	}
})()