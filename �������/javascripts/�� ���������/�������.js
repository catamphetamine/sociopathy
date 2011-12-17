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
	
	join_dialog.bind('open', function()
	{
		Режим.запомнить_помощь('вне_окошка')
		Режим.подсказка('Выберите себе имя в нашей сети. Например, "Иван Петрович Сидоров".')
	})
	
	join_dialog.bind('close', function()
	{
		if (!прописан)
			Режим.подсказка(Режим.возстановить_помощь('вне_окошка'))
	})
	
	join_form_slider.bind('slide_No_2', function()
	{
		Режим.подсказка('Нажмите на картинку, соответствующую вашему полу.')
	})
	
	join_form_slider.bind('slide_No_3', function()
	{
		Режим.подсказка('Разскажите нам, откуда вы. Например: "Москва", "Где-то на границе с Монголией", "Кольский полуостров".')
	})
	
	join_form_slider.bind('slide_No_4', function()
	{
		Режим.подсказка('По этому паролю вы будете входить в нашу сеть. Например: "белый слон жуёт морковь", "кто не спрятался - я не виноват", "у меня везде один пароль".')
	})
	
	join_form_slider.set_container(join_dialog.$element)
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
				control: gender_chooser,
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
	имя: function(имя)
	{
		if (имя.length == 0)
			throw new custom_error('Вам нужно представиться')
	},
	
	пароль: function(пароль)
	{
		if (пароль.length == 0)
			throw new custom_error('Пароль будет нужен для входа')
	}
}

// create gender chooser
function initialize_gender_chooser()
{
	gender_chooser = new image_chooser
	(
		"#join_dialog .gender .chooser",
		{
			target: "#join_dialog .gender input[type=hidden]"
		}
	)
}

function activate_button(selector, options)
{
	var element = $(selector)

	options = options || {}
	options.selector = selector

	return button.physics.classic(new text_button
	(
		element,
		Object.append
		(
			{
				skin: 'sociopathy',
				
				// miscellaneous
				'button type':  element.attr('type'), // || 'generic',
			},
			options
		)
	))	
}

var conditional
function initialize_page()
{
	Режим.подсказка('Это заглавная страница нашей сети. Воспользуйтесь меню слева сверху для перехода в какой-либо раздел сети.')
	
	if (получить_настройку_запроса('приглашение'))
	{
		conditional = initialize_conditional($('#join_button_block[type=conditional]'))
		check_invite(conditional.callback)
	}	
}

function check_invite(callback)
{
	var приглашение = получить_настройку_запроса('приглашение')

	Ajax.get('/приложение/приглашение/проверить', { приглашение: приглашение },
	{
		error: function(message)
		{
			if (message === "Нет такого приглашения в списке")
				Режим.подсказка('Ваше приглашение не найдено в списке. Возможно кто-то уже прописался по нему. Возможно эта ссылка неправильная. Напишите нам об этом, и мы вам поможем.')
			else
				Режим.подсказка('Произошла ошибка в ходе проверки вашего приглашения. Напишите нам об этом, и мы вам поможем.')

			callback(message)
		},
		ok: function(данные)
		{
			if (!данные.приглашение)
				return callback('no invite')
				
			initialize_join_button()

			initialize_join_dialog_buttons()
			initialize_gender_chooser()
			initialize_join_form_slider()
			initialize_join_dialog()
			
			Режим.подсказка('Теперь вы можете прописаться, нажав на кнопку "Присоединиться" внизу страницы.')
			callback()
		}
	})
}

// actions

// submit join request
function join_submission(data)
{
	data.приглашение = получить_настройку_запроса('приглашение')

	loading_indicator.show()
	Ajax.put('/приложение/прописать', data, 
	{ 
		error: function()
		{
			error('Не удалось прописаться')
			Режим.подсказка('Произошла какая-то ошибка. Напишите нам об этом, и мы вам поможем.')
		}, 
		ok: function(данные) 
		{ 
			прописан = true
			Режим.подсказка('Сейчас страница будет перезагружена.')

			loading_indicator.hide()
			join_dialog.close()
		} 
	})
}