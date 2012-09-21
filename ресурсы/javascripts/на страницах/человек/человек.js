(function()
{
	var id_card
	var online_status
	var the_picture
	var avatar
	var content
	
	Режим.пообещать('правка')
	Подсказки.подсказка('Здесь вы можете посмотреть данные об этом члене нашей сети. Если это ваша личная карточка, вы сможете изменить данные в ней, переключившись в режим правки.')
	
	page.load = function()
	{	
		id_card = $('#id_card')
		content = $('.main_content')
		
		Режим.добавить_проверку_перехода(function(из, в)
		{
			if (в === 'правка')
			{
				if (!page.data.пользователь_сети)
				{
					info('Здесь нечего править')
					return false
				}
				
				if (пользователь._id !== page.data.пользователь_сети._id)
				{
					info('Это не ваши личные данные, и вы не можете их править.')
					return false
				}
			}
		})
	
		var conditional = initialize_conditional($('.main_conditional'), { immediate: true })
		conditional.on_error(function()
		{
			$(document).trigger('page_initialized')
		})
		
		new Data_templater
		({
			template_url: '/страницы/кусочки/личная карточка.html',
			container: id_card,
			conditional: conditional
		},
		new  Data_loader
		({
			url: '/приложение/человек',
			parameters: { адресное_имя: page.data.адресное_имя },
			get_data: function (data)
			{
				parse_date(data, 'когда был здесь')
				page.data.пользователь_сети = data
				data.with_online_status = true
				return data
			},
			before_done: before_id_card_shown,
			done: id_card_loaded
		}))
	}
	
	page.unload = function()
	{
	}
	
	var когда_был_здесь
	var offline = false
	
	function before_id_card_shown()
	{
		title(page.data.пользователь_сети.имя)

		Эфир.следить_за_пользователем(page.data.пользователь_сети)
		
		page.пользователь_в_сети = function(пользователь)
		{
			offline = false
			когда_был_здесь = new Date()
			update_online_status()
		},
		
		page.пользователь_вышел = function(пользователь)
		{
			offline = true
			update_online_status()
		}
		
		var links = $('#links')
		var actions = $('#actions')
		
		links.find('a').each(function()
		{
			var link = $(this)
			if (link.attr('href').starts_with('/люди//'))
				link.attr('href', link.attr('href').replace('//', '/' + page.data.пользователь_сети['адресное имя'] + '/')).removeAttr('dummy')
		})
		
		if (page.data.пользователь_сети['есть ли картинки?'])
			links.find('.pictures').parent().show()
		
		if (page.data.пользователь_сети['есть ли видеозаписи?'])
			links.find('.videos').parent().show()
			
		if (page.data.пользователь_сети['есть ли книги?'])
			links.find('.books').parent().show()
		
		/*
		if (page.data.пользователь_сети['ведёт ли дневник?'])
			links.find('.diary').parent().show()
		
		if (page.data.пользователь_сети['ведёт ли журнал?'])
			links.find('.journal').parent().show()
		*/
		
		links.show()
		
		if (пользователь)
		{
			if (пользователь._id !== page.data.пользователь_сети._id)
			{
				actions.find('.start_conversation').show()
				actions.find('.call').show()
				
				if (page.data.пользователь_сети.в_круге)
					actions.find('.remove_from_circles').show()
				else
					actions.find('.add_to_circles').show()
					
				actions.show()
			}
		}
		else
		{
			//actions.find('.contact_by_email').show()
			actions.show()
		}
	
		avatar = id_card.find('.picture')
		the_picture = avatar.find('.real_picture')
	
		online_status =
		{
			online: id_card.find('.online_status .online'),
			offline: id_card.find('.online_status .offline') 
		}
		
		show_photo()
		show_online_status()
		show_minor_info()
		show_links()
		
		initialize_editables()
		initialize_edit_mode_effects()
		
		Режим.activate_edit_actions({ on_save: save_changes })
		Режим.разрешить('правка')
		
		actions.find('.start_conversation').click(function(event)
		{
			event.preventDefault()
		})
		
		actions.find('.contact_by_email').click(function(event)
		{
			event.preventDefault()
			info('Не сделано')
		})
		
		actions.find('.call').click(function(event)
		{
			event.preventDefault()
		})
		
		actions.find('.add_to_circles').click(function(event)
		{
			event.preventDefault()
			
			page.Ajax.put('/приложение/сеть/круги/состав', { кого: page.data.пользователь_сети._id })
			.ok(function()
			{
				actions.find('.add_to_circles').hide()
				actions.find('.remove_from_circles').show()
			})
		})
		
		actions.find('.remove_from_circles').click(function(event)
		{
			event.preventDefault()
			
			Ajax['delete']('/приложение/сеть/круги/состав', { кого: page.data.пользователь_сети._id })
			.ok(function()
			{
				actions.find('.remove_from_circles').hide()
				actions.find('.add_to_circles').show()
			})
		})
	}
	
	function id_card_loaded()
	{
		$(document).trigger('page_initialized')
	}
	
	function show_photo()
	{
		if (!page.data.пользователь_сети['загружена ли фотография?'])
			return
	
		var image = $('<img/>')
		image.attr('src', '/загруженное/люди/' + page.data.пользователь_сети.имя + '/фотография.jpg')
	
		page.get('> .photo').append(image)
	}
	
	function show_online_status()
	{
		// если сам зашёл на свою страницу
		if (пользователь)
		{
			if (пользователь._id === page.data.пользователь_сети._id)
			{
				$('.online_status .offline').css({ opacity: 0 })
				$('.online_status .online').css({ opacity: 1 })
				return
			}
		}
		
		if (!когда_был_здесь)
			когда_был_здесь = page.data.пользователь_сети['когда был здесь']
			
		if (!когда_был_здесь)
			return
		
		когда_был_здесь = new Date(когда_был_здесь)
	
		id_card.find('.last_action_time')
			.attr('date', когда_был_здесь.getTime())
			.addClass('intelligent_date')
			.text(неточное_время(когда_был_здесь))
		
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
	
		page.ticking(update_online_status, 2 * 1000)
	}
	
	function update_online_status()
	{
		var остылость = (new Date().getTime() - когда_был_здесь.getTime()) / (Configuration.User_is_online_for * 1000)
		
		if (offline)
			остылость = 1
		
		if (остылость >= 1)
		{
			online_status.online.css({ opacity: 0 })
			online_status.offline.css({ opacity: 1 })
			return false
		}
		
		online_status.online.css({ opacity: 1 - остылость })
		online_status.offline.css({ opacity: остылость })
	}
	
	function initialize_edit_mode_effects()
	{
		initialize_body_edit_mode_effects()
	
		//var highlight_color = '#44adcb'
		
		$(document).on_page('режим.правка', function()
		{
			//the_picture.animate({ 'boxShadow': '0 0 20px ' + highlight_color })
		})
	
		$(document).on_page('режим.переход', function(event, из, в)
		{
			if (из === 'правка')
			{
				//the_picture.animate({ 'boxShadow': '0 0 0px' })
			}
		})
	}
	
	function show_links()
	{
		var links_block = page.get('.miscellaneous .links')
		
		if (!page.data.пользователь_сети.ссылки || page.data.пользователь_сети.ссылки.is_empty())
			return links_block.hide()
			
		var list = links_block.find('ul')
		
		page.data.пользователь_сети.ссылки.forEach(function(link)
		{
			list.append($('<li/>').append($('<a/>').attr('href', link).text(human_readable_url(link))))
		})
	}
	
	function human_readable_url(url)
	{
		var host = parseUri(url).host
		
		switch (host)
		{
			case 'vkontakte.ru':
			case 'vk.com':
				return 'ВКонтакте'
				
			case 'youtube.com':
				return 'YouTube'
				
			return host
		}
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
			if (typeof page.data.пользователь_сети[поле] === 'undefined')
				return
				
			var info = $('<div/>')
			info.addClass('info')
			
			var title = $('<dt/>')
			title.text(поле)
			title.appendTo(info)
			
			var value = $('<dd/>')
			value.text(page.data.пользователь_сети[поле])
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
	
		var данные = page.Data_store.collect()
		
		Режим.save_changes_to_server
		({
			continues: true,
			anything_changed: function()
			{
				return true
			},
			
			data: данные.общее,
			
			url: '/приложение/сеть/человек/данные',
			method: 'put',
			
			ok: function(loading)
			{
				//$('.authenticated_user .name').text(данные.общее.имя)
				
				var small_picture = $('.authenticated_user .real_picture')
				small_picture.attr('src', anti_cache_postfix(small_picture.attr('src'))).show()
	
				Режим.save_changes_to_server
				({
					загрузка: loading,
					
					anything_changed: function()
					{
						if (image_file_name)
							return true
					},
					
					data: данные.картинка,
					
					url: '/приложение/сеть/человек/картинка',
					method: 'put',
					
					ok: function()
					{
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
			
		if (пользователь._id !== page.data.пользователь_сети._id)
			return
		
		var uploader = new Uploader($('.upload_new_picture'),
		{
			//url: '/загрузка/человек/сменить картинку',
			//url: '/приложение/человек/сменить картинку',
			url: 'http://' + host + ':' + Configuration.Upload_server_port + '/сеть/человек/картинка',
			parameter: { name: 'user', value: $.cookie('user') },
			success: function(data)
			{
				if (data.ошибка)
					return error(data.ошибка)
				
				image_file_name = data.имя
				the_picture.attr('src', data.адрес).show()
				
				id_card.find('.uploading_picture').hide()
			},
			error: function()
			{
				error("Не удалось загрузить картинку")
				id_card.find('.uploading_picture').hide()
			},
			Ajax: page.Ajax
		})
	
		$(document).on_page('режим.правка', function(event)
		{
			//info('Вы можете сменить картинку (120 на 120), нажав на неё.')
	
			var file_chooser = $('.upload_new_picture')
			
			avatar.on('click.режим_правка', function(event)
			{
				event.preventDefault()
				file_chooser.click()
			})
			
			file_chooser.on('change.режим_правка', function()
			{
				var file = file_chooser[0].files[0]
				
				if (file.size > 5000000)
					return warning('Эта картинка слишком много весит')
	
				if (file.type !== "image/jpeg" && file.type !== "image/png")
					return warning('Можно загружать только картинки форматов Jpeg и Png')
				
				id_card.find('.uploading_picture').show()
				uploader.send()
			})
		})
	}
	
	var editable_info =
	{
		имя: '.personal_info .name a',
		описание: '.personal_info .description',
		откуда: '.info .origin .value'
	}
	
	page.Data_store.collect = function()
	{
		var result =
		{
			общее: {},
			картинка: {}
		}
		
		Object.each(editable_info, function(selector, key)
		{
			result.общее[key] = id_card.find(selector).text()
		})
		
		result.картинка.имя = image_file_name
		
		return result
	}
	
	page.Data_store.populate = function(data)
	{
		Object.each(data.общее, function(value, key)
		{
			id_card.find(editable_info[key]).attr('editable', true).text(value)
		})
	}
	
	page.Data_store.deduce = function()
	{
		var result =
		{
			общее:
			{
				имя: page.data.пользователь_сети.имя,
				описание: page.data.пользователь_сети.описание,
				откуда: page.data.пользователь_сети.откуда,
			},
			картинка: {}
		}
		
		return result
	}

	page.Data_store.что = 'страница пользователя'
	
	page.needs_initializing = true
})()