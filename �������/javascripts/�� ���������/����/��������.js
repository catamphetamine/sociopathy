var chat
var who_is_online_bar_list

var new_messages_smooth_border

var Max_chat_messages = 100
var Messages_batch_size = 32

var away_users = {}

var кто_в_болталке = {}
кто_в_болталке[пользователь._id] = true

var chat_top_offset

var is_away = false

var new_message_sound = new Audio("/звуки/new message.ogg")
var alarm_sound = new Audio("/звуки/alarm.ogg")

var compose_message
	
function initialize_page()
{
	new_messages_smooth_border = $('.new_messages_smooth_border')

	Подсказки.подсказка('Здесь вы можете разговаривать с другими членами сети.')
	Подсказки.ещё_подсказка('Вверху вы видите список людей, у которых сейчас открыта болталка.')
	Подсказки.ещё_подсказка('Также, в списке сообщений, пользователи, у которых сейчас открыта болталка, подсвечены зелёным.')
	
	chat = $('.chat')
	var more_link = $('#chat_container').find('.older > a')
	compose_message = $('#compose_message')
	
	var loader = new Batch_loader
	({
		url: '/приложение/болталка/сообщения',
		batch_size: Messages_batch_size,
		get_data: function (data)
		{
			var сообщения = []
			data.сообщения.forEach(function(сообщение)
			{
				сообщения.push(преобразовать_время(сообщение))
			})
		
			return сообщения
		},
		done_more: function()
		{
			if (this.есть_ли_ещё)
				more_link.fadeIn(300)
		},
		finished: function()
		{
			more_link.hide()
		}
	})
	
	function show_more_messages(event)
	{
		event.preventDefault()
		loader.deactivate()
		more_link.fadeOut(300, function()
		{
			loader.load_more()
		})
	}
	
	loader.activate = function() { more_link.on('click', show_more_messages) }
	loader.deactivate = function() { more_link.unbind() }
		
	var conditional = $('#chat_block[type=conditional]')

	получить_шаблон
	({
		 url: '/страницы/кусочки/chat user icon.html',
		 id: 'chat user icon',
		 error: function(error) { conditional.callback(error) }
	},
	function()
	{
		new Data_templater
		({
			template_url: '/страницы/кусочки/сообщение в болталке.html',
			item_container: chat,
			conditional: conditional,
			done: chat_loaded,
			postprocess_element: function(item)
			{
				var author = item.find('.author')
				if (is_online(author.attr('author')))
					author.addClass('online')
				
				item.find('.text').find('a').attr('target', '_blank')
					
				return item
			},
			show: function(data, options)
			{
				data.show_online_status = true
				var item = $.tmpl(options.template_url, data)
				item.find('.popup_menu_container').prependTo(item)
	
				item = options.postprocess_element(item)

				if (away_users[data.отправитель._id])
					item.find('.author').addClass('is_away')
				
				var next_in_time = chat.find('> li:first')
				if (next_in_time.attr('author') === data.отправитель._id)
				{
					next_in_time.find('.author').children().remove()
					next_in_time.find('.message').css('padding-top', 0)
				}
				
				if (data.отправитель._id !== пользователь._id)
					initialize_call_action(item, item.attr('author'), 'of_message_author', function() { return item.find('.author').hasClass('online') })
							
				chat.prepend(item)
			},
			order: 'обратный'
		},
		loader)
	})
}

function initialize_call_action(user_icon, user_id, style_class, condition)
{
	var actions = user_icon.find('.popup_menu_container')

	actions.find('.call').click(function(event)
	{
		event.preventDefault()
		болталка.emit('вызов', user_id)
	})
	
	activate_popup_menu
	({
		activator: user_icon.find('.picture'),
		actions: actions,
		condition: condition,
		style_class: style_class
	})
}

var messages_to_add = []
function add_message(data)
{
	if (!data)
	{
		if (messages_to_add.is_empty())
			return
			
		data = messages_to_add[0]
	}
	else
	{
		messages_to_add.push(data)
		if (messages_to_add.length > 1)
			return
	}
	
	var previous = chat.find('> li:last')
	var same_author = (previous.attr('author') === data.отправитель._id)
	
	data.show_online_status = true
	var content = $.tmpl('/страницы/кусочки/сообщение в болталке.html', data)
	
	var this_author = content.find('.author')
	var this_message = content.find('.message')

	if (away_users[data.отправитель._id])
		this_author.addClass('is_away')
	
	if (same_author)
	{
		this_author.children().remove()
		this_message.css('padding-top', 0)
	}

	var next = function()
	{
		messages_to_add.shift()
		add_message()
	}
	
	if (data.отправитель._id !== пользователь._id)
		initialize_call_action(content, content.attr('author'), 'of_message_author', function() { return this_author.hasClass('online') })
	
	var сообщений_не_видно = false //$(window).scrollTop() + $(window).height() < chat_top_offset
	var видно_верхнюю_границу_сообщений = $(window).scrollTop() < chat_top_offset
	var не_видно_нижнюю_границу_сообщений = $(window).scrollTop() + $(window).height() < chat_top_offset + chat.height() //_height
	if (сообщений_не_видно || видно_верхнюю_границу_сообщений || не_видно_нижнюю_границу_сообщений)
	{
		content.appendTo(chat)
		return next()
	}
	
	fix_chat_container_height()
	
	content.appendTo(chat)
	
	var delta_height = content.outerHeight(true)
	
	var marginBottom = parseInt(chat.css('marginBottom'))

	var compose_message_window_offset = compose_message.offset().top - $(window).scrollTop()
	
	chat.animate
	({
		top: -delta_height + 'px',
		marginBottom: -delta_height + 'px'
	},
	700,
	'easeInOutQuad',
	function()
	{	
		// показать то верхнее сообщение, которое уехало
		
		chat.css({ top: 0, 'margin-bottom': 0 })
	
		// убрать сверху лишние сообщения
		
		var chat_messages = chat.find('> li')
		
		var delta_messages = chat_messages.length - Max_chat_messages
		var i = 0
		while (delta_messages > 0)
		{
			var message = chat_messages.eq(i)
			var delta_height = message.height()

			message.remove()
			
			delta_messages--
			i++
		}
		
		automatic_chat_container_height()
		
		$(window).scrollTop(compose_message.offset().top - compose_message_window_offset)
		
		// вывести снизу следующее новое сообщение
		next()
	})
}

function пользователь_в_сети(пользователь)
{
	кто_в_болталке[пользователь._id] = true
	
	chat.find('> li[author="' + пользователь._id + '"]').each(function()
	{
		$(this).find('.author').addClass('online')
	})
	
	внести_пользователя_в_список_вверху(пользователь)
}

function is_online(id)
{
	if (кто_в_болталке[id])
		return true
		
	return false
}

function внести_пользователя_в_список_вверху(user, options)
{
	if (who_is_online_bar_list.find('> li[user="' + user._id + '"]').exists())
		return

	var container = $('<li user="' + user._id + '"></li>')
	container.addClass('online')
	
	$.tmpl('chat user icon', { отправитель: user }).appendTo(container)
	
	if (user._id !== пользователь._id)
		initialize_call_action(container, user._id, 'of_online_user')
	
	if (options)
		if (options.куда === 'в начало')
			return container.prependTo(who_is_online_bar_list)
	
	container.css('opacity', '0')
	container.appendTo(who_is_online_bar_list)
	animator.fade_in(container, { duration: 1 }) // in seconds
}

function пользователь_вышел_из_болталки(пользователь)
{
	delete кто_в_болталке[пользователь._id]

	chat.find('> li[author="' + пользователь._id + '"]').each(function()
	{
		$(this).find('.author').removeClass('online')
	})
	
	var icon = who_is_online_bar_list.find('[user="' + пользователь._id + '"]')
	icon.fadeOut(500, function()
	{
		icon.remove()
	})
}

function fix_chat_container_height()
{
	chat.parent().css
	({
		height: chat.height() + 'px',
		overflow: 'hidden'
	})
}

function automatic_chat_container_height()
{
	chat.parent().css
	({
		height: 'auto',
		overflow: 'visible'
	})
}

function chat_loaded()
{
	//chat_height = chat.height()
	chat_top_offset = chat.offset().top

	//adjust_bottom_smooth_border(chat.find('> li:last > .author'))
	new_messages_smooth_border.css('width', '100%')
	
	//show_testing_messages()

	who_is_online_bar_list = $('.who_is_online')
	$('.who_is_online_bar').floating_top_bar()
	
	connect_to_chat(function()
	{
		$(window).focus(function()
		{
			is_away = false
			dismiss_new_messages_notifications()
			болталка.emit('смотрит')
		})
		
		$(window).blur(function()
		{
			is_away = true
			болталка.emit('не смотрит')
		})
		
		var visual_editor = new Visual_editor('#compose_message > article')
		
		var send_message_timeout

		var can_signal_typing = true
		// html5 input event seems to be unsupported
		visual_editor.editor.on('content_changed.editor', function(event)
		{
			if (!can_signal_typing)
				return
			
			can_signal_typing = false
			var unlocker = function()
			{
				can_signal_typing = true
			}
			unlocker.delay(500)
			
			//if (visual_editor.editor.is_empty())
			//	console.log ('стёр')
			
			болталка.emit('пишет')
		})
		
		visual_editor.on_break = function()
		{
			var node = document.createTextNode(' ')
			visual_editor.editor.content[0].appendChild(node)
			visual_editor.editor.caret.move_to(node)
			
			/*
			var container = visual_editor.editor.caret.native_container()
			if (container === visual_editor.editor.content[0])
				return
				
			container = Dom_tools.uppest_before(container, visual_editor.editor.content[0])
			visual_editor.editor.caret.move_to_the_end(container)
			*/
		}
		
		visual_editor.enter_pressed_in_container = function()
		{
			if (visual_editor.editor.caret.inside('li'))
				return
		
			//alert(visual_editor.editor.content.html())
		
			var message = visual_editor.editor.content.html()
			if (!message.trim())
				return
				
			visual_editor.editor.content.html(editor_initial_html)
			visual_editor.editor.caret.move_to(visual_editor.editor.content[0].firstChild)
			
			болталка.emit('сообщение', message)
		}
		
		visual_editor.tagged_hint(visual_editor.editor.content.find('> p'), 'Вводите сообщение здесь')
		var editor_initial_html = visual_editor.editor.content.html()
		
		visual_editor.initialize_tools_container()
		
		visual_editor.show_tools()
		
		if ($.browser.mozilla)
			visual_editor.editor.content.focus()
		
		$('#compose_message').fadeIn()
		visual_editor.editor.caret.move_to(visual_editor.editor.content.find('> *:first'))
	})
}

var status_classes =
{
	'смотрит': 'is_idle',
	'не смотрит': 'is_away',
	'пишет': 'is_typing',
}

var status_expires_timer

function set_status(id, status, options)
{
	if (status_expires_timer)
	{
		clearTimeout(status_expires_timer)
		status_expires_timer = null
	}
	
	options = options || {}

	if (!status)
		status = 'смотрит'

	var online_bar_element = $('.who_is_online > li[user="' + id + '"]')
	var chat_message_author_element = $('.chat > li[author="' + id + '"] .author')
	
	Object.each(status_classes, function(style_class, a_status)
	{
		if (a_status !== status)
		{
			online_bar_element.removeClass(style_class)
			chat_message_author_element.removeClass(style_class)
		}
		else
		{
			online_bar_element.addClass(style_class)
			chat_message_author_element.addClass(style_class)		
		}
	})
	
	if (options.изтекает)
	{
		status_expires_timer = function()
		{
			set_status(id)
		}
		.delay(options.изтекает)
	}
}

var болталка
// handle reconnect
var first_connection

function connect_to_chat(callback)
{
	болталка = io.connect('http://' + Options.Websocket_server + '/болталка', { transports: ['websocket'] })
	
	болталка.on('connect', function()
	{
		болталка.emit('пользователь', $.cookie('user'))
	})
	
	болталка.on('готов', function()
	{
		if (!first_connection)
		{
			callback()
			first_connection = false
		}
		else
		{
			who_is_online_bar_list.empty()
		}
		
		внести_пользователя_в_список_вверху(пользователь, { куда: 'в начало' })
	})
	
	болталка.on('online', function(data)
	{
		data.forEach(function(пользователь)
		{
			пользователь_в_сети(пользователь)
		})
	})
	
	болталка.on('user_online', function(пользователь)
	{
		пользователь_в_сети(пользователь)
	})
	
	болталка.on('offline', function(пользователь)
	{
		пользователь_вышел_из_болталки(пользователь)
	})
	
	болталка.on('сообщение', function(данные)
	{
		/*
		if (своё)
			clearTimeout(send_message_timeout)
		*/
		
		if (is_away)
			new_messages_notification()
	
		add_message(преобразовать_время(данные))
	})
	
	болталка.on('смотрит', function(пользователь)
	{
		delete away_users[пользователь._id]
		set_status(пользователь._id, 'смотрит')
	})
	
	болталка.on('не смотрит', function(пользователь)
	{
		away_users[пользователь._id] = true
		set_status(пользователь._id, 'не смотрит')
	})
	
	болталка.on('вызов', function(пользователь)
	{
		alarm_sound.play()
		info('Вас вызывает ' + пользователь.имя)
	})
	
	болталка.on('пишет', function(пользователь)
	{
		set_status(пользователь._id, 'пишет', { изтекает: 1000 })
	})
	
	болталка.on('ошибка', function(ошибка)
	{
		if (ошибка.ошибка === true)
			return error('Ошибка связи с сервером')

		error(ошибка)
	})
}

function преобразовать_время(сообщение)
{
	сообщение.точное_время = new Date(сообщение.время).getTime() //Date.parse(сообщение.время, 'dd.MM.yyyy HH:mm').getTime()
	сообщение.время = неточное_время(сообщение.точное_время)
	сообщение.сейчас = new Date().getTime()
	
	return сообщение
}

$(function()
{	
	update_intelligent_dates.ticking(60 * 1000)
})

function show_testing_messages()
{
	setTimeout(function()
	{
		add_message
		(преобразовать_время({
			"отправитель": {"имя":"Анна Каренина","адресное имя":"Анна Каренина", _id: '2'},
			сообщение: "Меж тем Онегина явленье ","время":"2012-01-07T12:13:33.040Z","_id":"4efb4e3b8dfcc5e42c000036"
		}))
		
		add_message
		(преобразовать_время({
			"отправитель": {"имя":"Василий Иванович","адресное имя":"Василий Иванович", _id: '1'},
			сообщение: "Меж тем Онегина явленье ","время":"2012-01-07T12:13:33.040Z","_id":"4efb4e3b8dfcc5e42c000036"
		}))
		
		add_message
		(преобразовать_время({
			"отправитель": {"имя":"Василий Иванович","адресное имя":"Василий Иванович", _id: '1'},
			сообщение: "Меж тем Онегина явленье ","время":"2012-01-07T12:13:33.040Z","_id":"4efb4e3b8dfcc5e42c000036"
		}))
		
		add_message
		(преобразовать_время({
			"отправитель": {"имя":"Василий Иванович","адресное имя":"Василий Иванович", _id: '1'},
			сообщение: "Меж тем Онегина явленье ","время":"2012-01-07T12:13:33.040Z","_id":"4efb4e3b8dfcc5e42c000036"
		}))
		
		$('.background').addClass('test')
	},
	3000)
}

function new_messages_notification()
{
	if (document.title.indexOf('* ') !== 0)
		document.title = '* ' + document.title
		
	new_message_sound.play()
}

function dismiss_new_messages_notifications()
{
	if (document.title.indexOf('* ') === 0)
		document.title = document.title.substring(2)
}