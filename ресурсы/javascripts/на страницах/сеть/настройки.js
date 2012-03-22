Режим.пообещать('правка')
Подсказки.подсказка('Здесь вы можете посмотреть и изменить свои настройки. Пока это только личный почтовый ящик.')
	
var email
var No_email_text

function initialize_page()
{
	email = $('#content').find('.email')
	No_email_text = email.text()

	var conditional = $('#main_block[type=conditional]')

	new Data_loader
	({
		url: '/приложение/пользователь/настройки',
		callback: conditional.callback,
		show: show_settings,
	})
	.load()
}

function show_settings(настройки)
{
	if (настройки.почта)
		email.text(настройки.почта)
	
	подготовить_режим_правки()
	
	Режим.activate_edit_actions({ on_save: save_changes })
	Режим.разрешить('правка')
}

function подготовить_режим_правки()
{
	$(document).on('режим.правка', function(event)
	{
		// на будущее
	})
}

function get_email()
{
	var mail = email.text()
	if (mail !== No_email_text)
		return mail
	return
}

function save_changes()
{
	Режим.заморозить_переходы()
	var загрузка = loading_indicator.show()

	Ajax.post('/приложение/пользователь/настройки',
	{
		почта: get_email()
	},
	{
		ошибка: function(ошибка)
		{
			загрузка.hide()
			Режим.разрешить_переходы()
			
			error(ошибка)
		},
		ok: function()
		{
			загрузка.hide()
			Режим.разрешить_переходы()
			Режим.изменения_сохранены()
		}
	})
}
