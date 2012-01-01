var chat
var who_is_online_bar_list

var new_messages_smooth_border

var Max_chat_messages = 100

var away_users = {}

var кто_в_болталке = {}
кто_в_болталке[пользователь['адресное имя']] = true

var chat_height
var chat_top_offset

function initialize_page()
{
	new_messages_smooth_border = $('.new_messages_smooth_border')

	Режим.подсказка('Здесь вы можете разговаривать с другими членами сети.')
	Режим.ещё_подсказка('Вверху вы видите список людей, у которых сейчас открыта болталка.')
	Режим.ещё_подсказка('Также, в списке сообщений, пользователи, у которых сейчас открыта болталка, подсвечены зелёным.')

	var send_button = activate_button('.send_message .send')
	.does(function()
	{
		var message = $('.send_message .message').val()
		$('.send_message .message').val('')
		болталка.emit('сообщение', message)
	})
	
	chat = $('.chat')
		
	new Data_templater
	({
		template_url: '/лекала/сообщение в болталке.html',
		item_container: chat,
		conditional: $('#chat_block[type=conditional]'),
		done: chat_loaded,
		postprocess_element: function(item)
		{
			var author = item.find('.author')
			if (is_online(author.attr('author')))
				author.addClass('online')
			return item
		},
		show: function(data, options)
		{
			var item = $.tmpl(options.template_url, data)
			var previous_item = chat.find('> li:last')
			
			if (!previous_item.exists())
				return chat.append(item)
				
			if (previous_item.find('> .author').attr('author') === data.отправитель['адресное имя'])
				return previous_item.find('> .messages ul').append(item.find('> .messages li'))

			chat.append(item)
		}
	},
	new  Batch_loader
	({
		url: '/приложение/болталка/сообщения',
		batch_size: 12,
		get_data: function (data)
		{
			var сообщения = []
			data.сообщения.forEach(function(сообщение)
			{
				сообщения.push(преобразовать_время(сообщение))
			})
		
			return сообщения.reverse()
		}
	}))
}

function adjust_bottom_smooth_border(author)
{
	var border_margin_left = parseInt(author.css('padding-left')) + author.width() + parseInt(author.css('padding-right'))
	new_messages_smooth_border.css({ marginLeft: border_margin_left + 'px' })
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
	var previoius_author = previous.find('> .author')
	var previoius_messages = previous.find('> .messages > ul')
	var same_author = previoius_author.attr('author') === data.отправитель['адресное имя']
		
	var content = $.tmpl('/лекала/сообщение в болталке.html', data)
	
	var this_author = content.find('> .author')
	var this_messages = content.find('> .messages')

	if (away_users[data.отправитель['адресное имя']])
		this_author.addClass('is_away')
	
	if (same_author)
	{
		this_author.children().remove()
		this_messages.css('padding-top', 0)
	}
		
	content.appendTo(chat)

	adjust_bottom_smooth_border(this_author)
	
	var next = function()
	{
		messages_to_add.shift()
		add_message()
	}
	
	var delta_height = content.outerHeight(true)
	
	if ($(window).scrollTop() + $(window).height() < $(document).height())
	{
		chat_height += delta_height
		chat.parent().height(chat_height)
		return next()
	}
	
	var top = parseInt(chat.css('top'))
	var marginBottom = parseInt(chat.css('marginBottom'))

	var delta_height_copy = delta_height
	
	chat.animate
	({
		top: (top - delta_height) + 'px',
		marginBottom: (marginBottom - delta_height) + 'px'
	},
	700,
	'easeInOutQuad',
	function()
	{
		var delta_height = delta_height_copy
		
		// показать то верхнее сообщение, которое уехало
		
		chat_height += delta_height
		chat.parent().height(chat_height)
		chat.css({ top: 0 })
		
		if ($(window).scrollTop() >= chat_top_offset)
			$(window).scrollTop($(window).scrollTop() + delta_height)
		
		// убрать сверху лишние сообщения
		
		var chat_messages = chat.find('> li')
		
		var delta_messages = chat_messages.length - Max_chat_messages
		var i = 0
		while (delta_messages > 0)
		{
			var message = chat_messages.eq(i)
			var delta_height = message.height()

			message.remove()
			
			chat_height -= delta_height
			chat.parent().height(chat_height)
		
			if ($(window).scrollTop() >= chat_top_offset)
				$(window).scrollTop($(window).scrollTop() - delta_height)
			
			delta_messages--
			i++
		}
		
		// вывести снизу следующее новое сообщение
		next()
	})
}

function is_current_user(адресное_имя)
{
	return пользователь['адресное имя'] === адресное_имя
}

function пользователь_в_сети(пользователь)
{
	кто_в_болталке[пользователь['адресное имя']] = true
	
	chat.find('.author[author="' + пользователь['адресное имя'] + '"]').each(function()
	{
		$(this).addClass('online')
	})
	
	внести_пользователя_в_список_вверху(пользователь)
}

function сообщение_в_сообщения(data)
{
	data.сообщения = [data.сообщение]
}

function is_online(адресное_имя)
{
	if (кто_в_болталке[адресное_имя])
		return true
		
	return false
}

function внести_пользователя_в_список_вверху(пользователь, options)
{
	var container = $('<li user="' + пользователь['адресное имя'] + '"></li>')
	
	var link = $('<a/>')
	link.attr('href', '/люди/' + пользователь['адресное имя'])
	link.css('background-image', 'url("/загруженное/люди/' + пользователь['адресное имя'] + '/картинка/в болталке.jpg")')
	link.attr('title', пользователь.имя)
	link.appendTo(container)
	
	var away = пользователь.пол === 'мужской' ? 'отошёл' : 'отошла'
	link.append('<div class="away">' + away + '</div>')
	
	if (options)
		if (options.куда === 'в начало')
			return who_is_online_bar_list.prepend(container)
	
	container.css('opacity', '0')
	who_is_online_bar_list.append(container)
	animator.fade_in(container, { duration: 1 }) // in seconds
}

function пользователь_вышел_из_болталки(пользователь)
{
	delete кто_в_болталке[пользователь['адресное имя']]

	chat.find('.author[author="' + пользователь['адресное имя'] + '"]').each(function()
	{
		$(this).removeClass('online')
	})
	
	var icon = who_is_online_bar_list.find('[user="' + пользователь['адресное имя'] + '"]')
	icon.fadeOut(500, function()
	{
		icon.remove()
	})
}

function chat_loaded()
{
	chat_height = chat.height()
	chat_top_offset = chat.offset().top
	
	chat.parent().css
	({
		display: 'block',
		height: chat_height + 'px',
		overflow: 'hidden'
	})

	adjust_bottom_smooth_border(chat.find('> li:last > .author'))
	new_messages_smooth_border.css('width', '100%')
	
	//show_testing_messages()

	who_is_online_bar_list = $('.who_is_online')
	$('.who_is_online_bar').floating_top_bar()
	
	connect_to_chat(function()
	{
		//$('.send_message').show()
		
		$(window).focus(function()
		{
			болталка.emit('смотрит')
		})
		
		$(window).blur(function()
		{
			болталка.emit('не смотрит')
		})
	})
}

var болталка

function connect_to_chat(callback)
{
	болталка = io.connect('http://' + Options.Websocket_server + '/болталка', { transports: ['websocket'] })
	
	болталка.on('connect', function()
	{
		болталка.emit('пользователь', пользователь.id)
	})
	
	болталка.on('готов', function()
	{
		внести_пользователя_в_список_вверху(пользователь, { куда: 'в начало' })
		callback()
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
		add_message(преобразовать_время(данные))
	})
	
	болталка.on('смотрит', function(пользователь)
	{
		delete away_users[пользователь['адресное имя']]
		$('.who_is_online > li[user="' + пользователь['адресное имя'] + '"]').removeClass('is_away')
		$('.chat > li > .author[author="' + пользователь['адресное имя'] + '"]').removeClass('is_away')
	})
	
	болталка.on('не смотрит', function(пользователь)
	{
		away_users[пользователь['адресное имя']] = true
		$('.who_is_online > li[user="' + пользователь['адресное имя'] + '"]').addClass('is_away')
		$('.chat > li > .author[author="' + пользователь['адресное имя'] + '"]').addClass('is_away')
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
	сообщение.точное_время = Date.parse(сообщение.время, 'dd.MM.yyyy HH:mm').getTime()
	сообщение.время = неточное_время(сообщение.время)
	сообщение.сейчас = new Date().getTime()
	
	return сообщение
}

$(function()
{	
	update_intelligent_dates.periodical(60 * 1000)
})

function show_testing_messages()
{
	setTimeout(function()
	{
		add_message
		({
			"отправитель": {"имя":"Анна Каренина","адресное имя":"Анна Каренина"},
			сообщения: [преобразовать_время({сообщение: "Меж тем Онегина явленье ","время":"28.12.2011 21:13","_id":"4efb4e3b8dfcc5e42c000036"})]
		})
		
		add_message
		({
			"отправитель": {"имя":"Василий Иванович","адресное имя":"Василий Иванович"},
			сообщения: [преобразовать_время({сообщение: "Меж тем Онегина явленье ","время":"28.12.2011 21:13","_id":"4efb4e3b8dfcc5e42c000036"})]
		})
		
		add_message
		(преобразовать_время({
			"отправитель": {"имя":"Василий Иванович","адресное имя":"Василий Иванович"},
			сообщение: "Меж тем Онегина явленье ","время":"28.12.2011 21:13","_id":"4efb4e3b8dfcc5e42c000036"
		}))
		
		add_message
		({
			"отправитель": {"имя":"Василий Иванович","адресное имя":"Василий Иванович"},
			сообщения: [преобразовать_время({сообщение: "Меж тем Онегина явленье ","время":"28.12.2011 21:13","_id":"4efb4e3b8dfcc5e42c000036"}), преобразовать_время({сообщение: "Меж тем Онегина явленье ","время":"28.12.2011 21:13","_id":"4efb4e3b8dfcc5e42c000036"})]
		})
		
		$('.background').addClass('test')
	},
	3000)
}