var id_card
var online_status
var the_picture

Режим.пообещать('правка')
Подсказки.подсказка('Здесь вы можете посмотреть данные об этом члене нашей сети. Если это ваша личная карточка, вы сможете изменить данные в ней, переключившись в режим правки.')

function initialize_page()
{	
	id_card = $('#id_card')

	Режим.добавить_проверку_перехода(function(из, в)
	{
		if (в === 'правка')
		{
			if (!пользователь_сети)
			{
				info('Здесь нечего править')
				return false
			}
			
			if (пользователь._id !== пользователь_сети._id)
			{
				info('Это не ваши личные данные, и вы не можете их править.')
				return false
			}
		}
	})

	new Data_templater
	({
		template_url: '/страницы/кусочки/личная карточка.html',
		item_container: id_card,
		conditional: $('#id_card_block[type=conditional]')
	},
	new  Data_loader
	({
		url: '/приложение/человек',
		parameters: { адресное_имя: window.адресное_имя },
		get_data: function (data) { пользователь_сети = data; return data },
		before_done_output: before_id_card_shown,
		done: id_card_loaded
	}))
}

var когда_был_здесь
	
var editable_info =
[
	'.personal_info .name a',
	'.personal_info .description',
	'.info .origin .value'
]

function before_id_card_shown()
{
	title(пользователь_сети.имя)
	
	$('#links').find('a').each(function()
	{
		var link = $(this)
		if (link.attr('href').starts_with('/люди//'))
			link.attr('href', link.attr('href').replace('//', '/' + пользователь_сети['адресное имя'] + '/'))
	})
	
	$('#links').show()
	
	if (пользователь && пользователь._id !== пользователь_сети._id)
	{
		$('#links .common_friends').show()
		$('#actions').show()
	}
}

function id_card_loaded()
{
	the_picture = id_card.find('.real_picture')

	online_status =
	{
		online: id_card.find('.online_status .online'),
		offline: id_card.find('.online_status .offline') 
	}
	
	show_online_status()
	show_minor_info()
	
	initialize_editables()
	initialize_edit_mode_effects()		
	
	id_card.find(editable_info.join(', ')).attr('editable', true)
	
	Режим.activate_edit_actions({ on_save: save_changes })
	Режим.разрешить('правка')
}

var online_status_updater
function show_online_status()
{
	когда_был_здесь = пользователь_сети['когда был здесь']
	if (!когда_был_здесь)
		return
	
	когда_был_здесь = new Date(когда_был_здесь)

	id_card.find('.last_action_time').attr('date', когда_был_здесь.getTime())
	update_intelligent_dates.ticking(60 * 1000)
	
	var maximum_opacity = id_card.find('.was_here').css('opacity')
	
	var online_status = id_card.find('.online_status')
	online_status.on('mouseenter', function()
	{
		id_card.find('.was_here').fade_in(0.3, { maximum_opacity: maximum_opacity, hide: true })
	})
	online_status.on('mouseleave', function()
	{
		id_card.find('.was_here').fade_out(0.3)
	})

	online_status_updater = update_online_status.ticking(2 * 1000)
}

function update_online_status()
{
	var остылость = (new Date().getTime() - когда_был_здесь.getTime()) / (Options.User_is_online_for * 1000)
	if (остылость > 1)
	{
		online_status.online.css({ opacity: 0 })
		online_status.offline.css({ opacity: 1 })
		return online_status_updater.stop()
	}
	
	online_status.online.css({ opacity: 1 - остылость })
	online_status.offline.css({ opacity: остылость })
}

function initialize_edit_mode_effects()
{
	var initial_background_color = $('body').css('background-color')
	
	var background_fade_time = 300
	//var highlight_color = '#44adcb'
	
	$(document).on('режим.правка', function()
	{
		$('body').stop(true, false).animate({ 'background-color': '#afafaf' }, background_fade_time)
		//the_picture.animate({ 'boxShadow': '0 0 20px ' + highlight_color })
	})

	$(document).on('режим.переход', function(event, из, в)
	{
		if (из === 'правка')
		{
			$('body').stop(true, false).animate({ 'background-color': initial_background_color }, background_fade_time)
			//the_picture.animate({ 'boxShadow': '0 0 0px' })
		}
	})
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
		if (typeof пользователь_сети[поле] === 'undefined')
			return
			
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

var image_file_name
function save_changes()
{
	/*
	if (!image_file_name)
	{
		warning('Вы ничего не меняли')
		return this.allow_to_redo()
	}
	*/
	
	Режим.заморозить_переходы()
	var loading = loading_indicator.show()

	Ajax.post('/приложение/человек/сменить данные',
	{
		имя: id_card.find(editable_info[0]).text(),
		описание: id_card.find(editable_info[1]).text(),
		откуда: id_card.find(editable_info[2]).text()
	},
	{
		ошибка: function(ошибка)
		{
			loading.hide()
			Режим.разрешить_переходы()
			
			error(ошибка)
		},
		ok: function()
		{
			if (!image_file_name)
			{
				loading.hide()
				Режим.разрешить_переходы()
				return Режим.изменения_сохранены()
			}
			
			Ajax.post('/приложение/человек/сменить картинку', { имя: image_file_name },
			{
				ошибка: function(ошибка)
				{
					loading.hide()
					Режим.разрешить_переходы()
					
					error(ошибка)
				},
				ok: function()
				{
					loading.hide()
					Режим.разрешить_переходы()
					
					Режим.изменения_сохранены()
					image_file_name = null
				}
			})
		}
	})
}

function initialize_editables()
{
	if (!пользователь)
		return
		
	if (пользователь._id !== пользователь_сети._id)
		return
	
	var uploader = new Uploader($('.upload_new_picture')[0],
	{
		//url: '/загрузка/человек/сменить картинку',
		//url: '/приложение/человек/сменить картинку',
		url: 'http://' + host + ':' + Options.Upload_server_port + '/человек/сменить картинку',
		parameter: { name: 'user', value: $.cookie('user') },
		success: function(data)
		{
			if (data.ошибка)
				return error(data.ошибка)
			
			image_file_name = data.имя
			the_picture.css('background-image', "url('" + data.адрес + "')")
			
			id_card.find('.uploading_picture').hide()
			
			//window.location.reload()
		},
		error: function(xhr)
		{
			error("Не удалось загрузить картинку")
			id_card.find('.uploading_picture').hide()
		}
	})

	$(document).on('режим.правка', function(event)
	{
		//info('Вы можете сменить картинку (120 на 120), нажав на неё.')

		var file_chooser = $('.upload_new_picture')
		
		the_picture.on('click.режим_правка', function(event)
		{
			event.preventDefault()
			file_chooser.click()
		})
		
		file_chooser.on('change.режим_правка', function()
		{
			var file = file_chooser[0].files[0]
			
			if (file.size > 512000)
				return warning('Слишком большой файл. Выберите картинку размером 120 на 120, и не более пятисот килобайтов.')

			if (file.type !== "image/jpeg")
				return warning('Можно загружать только картинки формата JPEG')
			
			id_card.find('.uploading_picture').show()
			uploader.send()
		})
	})
}