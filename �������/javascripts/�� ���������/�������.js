function initialize_page()
{
	Режим.подсказка('Здесь вы можете посмотреть данные об этом члене нашей сети. Если это ваша личная карточка, вы сможете изменить данные в ней, переключившись в режим правки.')
	Режим.добавить_проверку_перехода(function(из, в)
	{
		if (!пользователь_сети)
			return false
			
		if (в === 'правка')
		{
			if (пользователь['адресное имя'] !== пользователь_сети['адресное имя'])
			{
				info('Это не ваши личные данные, и вы не можете их править.')
				return false
			}
		}
			
		return true
	})

	new Data_templater
	({
		template_url: '/лекала/личная карточка.html',
		item_container: $('#id_card'),
		conditional: $('#id_card_block[type=conditional]'),
		done: id_card_loaded
	},
	new  Data_loader
	({
		url: '/приложение/человек',
		parameters: { адресное_имя: адресное_имя() },
		get_data: function (data) { пользователь_сети = data; return data }
	}))
	
	$('#content').disableTextSelect()
}

function адресное_имя()
{
	return путь_страницы().match(/люди\/(.+)/)[1]
}

function id_card_loaded()
{
	show_minor_info()
	initialize_editables()
}

function show_minor_info()
{
	дополнительные_данные =
	[
		'время рождения',
		'характер',
		'убеждения',
		'семейное положение'
	]
	
	var container = $('.minor_info')
	var left = container.find('> .left')
	var right = container.find('> .right')
	
	var odd = true
	дополнительные_данные.forEach(function(поле)
	{
		var info = $('<div/>')
		info.addClass('info')
		
		var title = $('<dt/>')
		title.text(поле)
		title.appendTo(info)
		
		var value = $('<dd/>')
		value.text(пользователь_сети[поле])
		value.appendTo(info)
		
		info.appendTo(odd ? left : right)
		
		odd = !odd
	})
}
	
function initialize_editables()
{
	if (!пользователь)
		return
		
	if (пользователь['адресное имя'] !== адресное_имя())
		return
	
	var uploader = new Uploader($('.upload_new_picture')[0],
	{
		//url: '/загрузка/человек/сменить картинку',
		//url: '/приложение/человек/сменить картинку',
		url: 'http://localhost:' + Options.Upload_server_port + '/человек/сменить картинку',
		parameter: { name: 'user', value: $.cookie('user') },
		success: function()
		{
			window.location.reload()
		},
		error: function(xhr)
		{
			//error(ошибка)
		}
	})

	$(document).bind('режим.правка', function(event)
	{
		info('Вы можете сменить картинку (120 на 120), нажав на неё.')

		var file_chooser = $('.upload_new_picture')
		
		$('.real_picture').on('click.режим_правка', function(event)
		{
			event.preventDefault()
			file_chooser.click()
		})
		
		file_chooser.on('change.режим_правка', function()
		{
			uploader.send()
			
			/*
			file_chooser.ajax_upload
			({
				//url: '/приложение/человек/сменить картинку',
				url: 'http://localhost:' + Options.Upload_server_port + '/человек/сменить картинку',
				data: { name: 'user', value: $.cookie('user') },
				success: function(data)
				{
					if (data.ошибка)
						return error(data.ошибка)
				},
				error: function()
				{
					error('Ошибка загрузки картинки')
				}
			})
			*/
		})
	})
}