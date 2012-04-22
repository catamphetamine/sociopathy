(function()
{
	/**
	 * Welcome page initialization
	 */
	
	var join_dialog
	var gender_chooser
	var joined_message
	var join_form_slider
	
	var join_dialog_cancel_button
	var join_dialog_next_button
	var join_dialog_done_button
	
	// activate join button
	function initialize_join_button()
	{
		button.physics.classic(new image_button
		(
			"#join_button", 
			{
				action: function() { join_dialog.open() }
			}
		))
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
		
		join_form_slider.on('slide_No_4', function()
		{
			Подсказки.подсказка('По этому паролю вы будете входить в нашу сеть. Например: "белый слон жуёт морковь", "кто не спрятался - я не виноват", "у меня везде один пароль".')
		})
		
		join_form_slider.set_container(join_dialog.content)
		join_form_slider.when_done(function() { join_submission(join_form_slider.data()) })
	}
	
	// create join dialog buttons
	function initialize_join_dialog_buttons()
	{
		join_dialog_cancel_button = activate_button('#join_dialog .buttons .cancel', { 'prevent double submission': true })
		.does(function() { join_dialog.close() })
		
		join_dialog_next_button = activate_button('#join_dialog .buttons .next')
		.does(function() { join_form_slider.next(function() { $('#join_dialog .slider .slide:eq(' + (join_form_slider.slider.index - 1) + ') input:first').focus() }) })
		
		join_dialog_done_button = activate_button('#join_dialog .buttons .done', { 'prevent double submission': true })
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
				пароль:
				{
				}
			}
		})
	}
	
	Validation.прописка =
	{
		имя: function(имя, callback)
		{
			if (!имя)
				return callback({ error: 'Вам нужно представиться' })
				
			callback()
		},
		
		пол: function(пол, callback)
		{
			if (!пол)
				return callback({ error: 'Вам нужно указать свой пол' })
				
			callback()
		},
		
		пароль: function(пароль, callback)
		{
			if (!пароль)
				return callback({ error: 'Пароль будет нужен для входа' })
				
			callback()
		}
	}
	
	// create gender chooser
	function initialize_gender_chooser()
	{
		gender_chooser = new image_chooser
		(
			"#join_dialog .gender .chooser",
			{
				target: "#join_dialog .gender input[type=hidden]",
				on_choise: function()
				{
					join_form_slider.next()
				}
			}
		)
	}
	
	var conditional
	page.load = function()
	{
		Подсказки.подсказка('Это заглавная страница нашей сети. Воспользуйтесь меню слева сверху для перехода в какой-либо раздел сети.')
		
		if (panel.buttons.мусорка)
		{
			panel.buttons.мусорка.element.parent().show()
			panel.buttons.мусорка.tooltip.update_position()
		}
		
		if (получить_настройку_запроса('приглашение'))
		{
			conditional = initialize_conditional($('.join_button_block'))
			check_invite(conditional.callback)
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
				
			initialize_join_button()
	
			initialize_join_dialog_buttons()
			initialize_gender_chooser()
			initialize_join_form_slider()
			initialize_join_dialog()
			
			Подсказки.подсказка('Теперь вы можете прописаться, нажав на кнопку "Присоединиться" внизу страницы.')
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
			прописан = true
			Подсказки.подсказка('Сейчас страница будет перезагружена.')
	
			loading.hide()
			join_dialog.close()
		})
	}
})()