(function()
{
	var id_card
	var online_status
	var avatar
	var content

	page.query('.photo', 'photo')
	
	Режим.пообещать('правка')

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
	
		// убрать этот conditional потом.
		// для этого нормально обрабатывать ошибку "пользователь не найден"
		var conditional = initialize_conditional($('.main_conditional'), { immediate: true })
		conditional.on_error(function()
		{
			page.initialized()
		})
		
		new Data_templater
		({
			template: 'личная карточка',
			container: id_card,
			conditional: conditional,
			single: true
		},
		new  Data_loader
		({
			url: '/приложение/человек',
			parameters: { адресное_имя: page.data.адресное_имя },
			get_data: function(data)
			{
				if (data['когда был здесь'])
					parse_date(data, 'когда был здесь')
					
				if (data['время рождения'])
					parse_date(data, 'время рождения')

				page.data.пользователь_сети = data
				
				if (page.data.пользователь_сети._id === пользователь._id)
					Подсказка('правка личных данных', 'Вы можете сменить аватар, фотографию, имя, и прочие личные данные, перейдя в <a href=\'/помощь/режимы#Режим правки\'>«режим правки»</a>');
				
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
	
		online_status =
		{
			online: id_card.find('.online_status .online'),
			offline: id_card.find('.online_status .offline') 
		}
		
		show_photo()
		show_online_status()
		show_minor_info()
		//show_links()
		
		initialize_editables()
		initialize_edit_mode_effects()
		
		//Режим.activate_edit_actions({ on_save: save_changes })
		Режим.разрешить('правка')
		
		/*
		actions.find('.start_conversation').click(function(event)
		{
			event.preventDefault()
		})
		*/
		
		var link = actions.find('.start_conversation > a').attr('href')
		actions.find('.start_conversation > a').attr('href', link.replace_all('{_id}', page.data.пользователь_сети._id))
		
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
		page.initialized()
	}
	
	function show_photo()
	{
		if (!page.data.пользователь_сети.photo_version)
		{
			page.photo.hide()
			return
		}
	
		var image = $('<img/>')
		image.attr('src', '/загруженное/люди/' + page.data.пользователь_сети['адресное имя'] + '/фотография.jpg' + '?version=' + page.data.пользователь_сети.photo_version)
	
		page.photo.empty().append(image)
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
		
		Режим.при_переходе({ в: 'правка' }, function()
		{
			if (page.photo.hidden())
				page.photo.show()
				
			page.avatar_uploader.activate()
			page.photo_uploader.activate()
				
			//the_picture.animate({ 'boxShadow': '0 0 20px ' + highlight_color })
		})
	
		$(document).on_page('смена_режима', function(event, из, в)
		{
			if (из === 'правка')
			{
				//the_picture.animate({ 'boxShadow': '0 0 0px' })
			}
		})
	}
	
	/*
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
	*/
	
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
	
	var add_minor_info
	
	function show_minor_info()
	{
		var action = function()
		{
			var info = add_minor_info('Название', 'Описание', { dummy: true })
			info.find('dt').focus()
		}
		
		text_button.new($('.minor_info .add .button')).does(action)
		page.hotkey('Действия.Добавить', 'правка', action)
		
		var container = $('.minor_info')
		var left = container.find('> .left')
		var right = container.find('> .right')
		
		var odd = true
						
		add_minor_info = function(поле, значение, options)
		{
			options = options || {}
			
			var info = $('<div/>')
			info.addClass('info')
			
			var title = $('<dt/>')
			title.text(поле)
			title.appendTo(info)
			
			title.on('keypress', function()
			{
				if (title.text() === 'Название')
					title.text('')
			})
			
			var value = $('<dd/>')
			
			if (значение)
				value.text(значение + '')
				
			value.appendTo(info)
			
			value.on('keypress', function()
			{
				if (value.text() === 'Описание')
					value.text('')
			})
			
			if (options.dummy)
			{
				title.editable()
				value.editable()
			}
			
			info.appendTo(odd ? left : right)
			
			odd = !odd
			
			return info
		}
		
		Режим.при_переходе({ в: 'правка' }, function(event)
		{
			$('.minor_info .info').each(function()
			{
				$(this).find('dt, dd').editable()
			})
		})
			
		$(document).on_page('смена_режима', function(event, из, в)
		{
			if (из === 'правка')
			{
				$('.minor_info .info').each(function()
				{
					$(this).find('dt, dd').not_editable()
				})
			}
		})
	}
	
	var image_file_name
	var photo_file_name
	
	page.save = function(данные)
	{
		Режим.save_changes_to_server
		({
			continues: true,
			anything_changed: function()
			{
				return true
			},
			
			data: Object.x_over_y(данные.общее, { о_себе: данные.о_себе }),
			
			url: '/приложение/сеть/человек/данные',
			method: 'put',
			
			ok: function(loading)
			{
				Режим.save_changes_to_server
				({
					continues: true,
			
					загрузка: loading,
					
					anything_changed: function()
					{
						if (image_file_name)
							return true
					},
					
					data: данные.картинка,
					
					url: '/приложение/сеть/человек/картинка',
					method: 'put',
					
					ok: function(loading)
					{
						image_file_name = null
						
						var small_picture = $('.authenticated_user .real_picture')
						small_picture.attr('src', anti_cache_postfix(small_picture.attr('src'))).show()
			
						Режим.save_changes_to_server
						({
							загрузка: loading,
							
							anything_changed: function()
							{
								if (photo_file_name)
									return true
							},
							
							data: данные.фотография,
							
							url: '/приложение/сеть/человек/фотография',
							method: 'put',
							
							ok: function()
							{
								photo_file_name = null
							}
						})
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
		
		page.avatar_uploader = new Picture_uploader
		({
			namespace: '.режим_правка',
			max_size: 0.5,
			max_size_text: '500 килобайтов',
			url: '/сеть/человек/картинка',
			element: function()
			{
				return id_card.find('.picture')
			},
			ok: function(data, element)
			{
				image_file_name = data.имя
				element.find('.real_picture').attr('src', data.адрес).show()
			},
			error: "Не удалось загрузить картинку"
		})
		
		page.photo_uploader = new Picture_uploader
		({
			namespace: '.режим_правка',
			max_size: 10,
			max_size_text: '10-ти мегабайтов',
			url: '/сеть/человек/фотография',
			element: function()
			{
				return page.photo
			},
			uploading_screen_size: function(element)
			{
				var size =
				{
					width: element.find('> img').width(),
					height: element.find('> img').height()
				}
				
				return size
			},
			ok: function(data, element)
			{
				return function(callback)
				{
					get_image_size(data.адрес, function(size)
					{
						photo_file_name = data.имя
						page.photo.find('> img').attr('src', data.адрес).width(size.width).height(size.height)
						callback()
					})
				}
			},
			error: "Не удалось загрузить фотографию"
		})
	
		Режим.при_переходе({ в: 'правка' }, function(event)
		{
			//info('Вы можете сменить картинку (120 на 120), нажав на неё.')
	
			// avatar
	
			var file_chooser = $('.upload_new_picture')
			
			avatar.on('click.режим_правка', function(event)
			{
				event.preventDefault()
				page.avatar_uploader.choose()
			})
			
			page.photo.find('> img').on('click.режим_правка', function(event)
			{
				event.preventDefault()
				page.photo_uploader.choose()
			})
		})
	}
	
	var editable_info =
	{
		имя: '.personal_info .name a',
		описание: '.personal_info .description',
		откуда: '.info .origin .value'
	}
	
	page.Data_store.collect_edited = function()
	{
		var result =
		{
			общее: {},
			о_себе: {},
			картинка: {},
			фотография: {}
		}
		
		Object.each(editable_info, function(selector, key)
		{
			result.общее[key] = id_card.find(selector).text()
		})
		
		$('.minor_info .info').each(function()
		{
			var key = $(this).find('dt').text().trim()
			var value = $(this).find('dd').text().trim()
			
			if (!key && !value)
				return $(this).remove()
			
			if (key === 'Название' && value === 'Описание')
				return $(this).remove()
			
			result.о_себе[key] = value
		})
		
		result.картинка.имя = image_file_name
		result.фотография.имя = photo_file_name
		
		return result
	}
	
	page.Data_store.режим('обычный',
	{
		create: function(data)
		{
			Object.each(data.общее, function(value, key)
			{
				id_card.find(editable_info[key]).attr('editable', true).text(value)
			})
			
			Object.for_each(data.о_себе, function(поле, значение)
			{
				add_minor_info(поле, значение)
			})
		}
	})
	
	page.Data_store.deduce = function()
	{
		var о_себе = {}
		
		if (page.data.пользователь_сети['о себе'])
		{
			о_себе = page.data.пользователь_сети['о себе']
		}
		
		var result =
		{
			общее:
			{
				имя: page.data.пользователь_сети.имя,
				описание: page.data.пользователь_сети.описание,
				откуда: page.data.пользователь_сети.откуда,
			},
			о_себе: о_себе,
			картинка: {},
			фотография: {}
		}
		
		return result
	}

	//page.Data_store.что = 'страница пользователя'
})()