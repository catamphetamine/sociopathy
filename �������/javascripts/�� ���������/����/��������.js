var chat
var who_is_online_bar

var кто_в_болталке = {}
кто_в_болталке[пользователь['адресное имя']] = true

function initialize_page()
{
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
		postprocess_item: function(item)
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
		batch_size: 8,
		get_data: function (data) { return data.сообщения }
	}))
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
	
	var previous = chat.find('li:first')
	var previoius_author = previous.find('> .author')
	var previoius_messages = previous.find('> .messages > ul')
	var same_author = previoius_author.attr('author') === data.отправитель['адресное имя']
		
	var content = $.tmpl('/лекала/сообщение в болталке.html', data)
	content.prependTo(chat)
	
	var delta_height = content.outerHeight(true)
	chat.css
	({
		top: -delta_height,
		marginBottom: -delta_height
	})
	
	chat.slide_in_from_top(700, 'easeInOutQuad', function()
	{
		if (same_author)
			animator.fade_out(previoius_author.children(),
			{
				duration: 0.6,
				callback: function()
				{
					var delta_height = previoius_author.outerHeight(true) - previoius_messages.outerHeight(true)
					if (delta_height > 0)
					{
						var previoius_author_picture = previoius_author.find('.picture')
					
						previoius_author_picture.css('overflow', 'hidden')
						previoius_author_picture.animate
						({
							height: previoius_author_picture.height() - delta_height
						})
						
						previoius_messages.parent().animate
						({
							paddingTop: 0
						})
					}
				}
			})
			
		messages_to_add.shift()
		add_message()
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
		
		/*
		// box shadow plugin doesn't support multiple shadows
		
		var author = $(this)
		if (author.attr('online') == true)
			return
			
		var picture = author.find('.picture')
			
		var dummy = $('<div/>')
		dummy.addClass('online')
		dummy.addClass('author')
		dummy.hide()
		
		var picture_dummy = $('<div/>')
		picture_dummy.addClass('picture')
		picture_dummy.appendTo(dummy)
		
		author.after(dummy)
		
		picture.animate({ 'boxShadow': picture_dummy.css('box-shadow') })
		*/
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
	
	if (options)
		if (options.куда === 'в начало')
			return who_is_online_bar.prepend(container)
	
	container.css('opacity', '0')
	who_is_online_bar.append(container)
	animator.fade_in(container, { duration: 1 }) // in seconds
}

function пользователь_вышел_из_болталки(пользователь)
{
	delete кто_в_болталке[пользователь['адресное имя']]

	chat.find('.author[author="' + пользователь['адресное имя'] + '"]').each(function()
	{
		$(this).removeClass('online')
	})
	
	var icon = who_is_online_bar.find('[user="' + пользователь['адресное имя'] + '"]')
	icon.fadeOut(500, function()
	{
		icon.remove()
	})
}

function chat_loaded()
{
	setTimeout(function()
	{
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
	},
	3000)

	//	update_online_statuses.periodical(1 * 1000)

	who_is_online_bar = $('.who_is_online')
	
	connect_to_chat(function()
	{
		$('.send_message').show()
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
	
	болталка.on('ошибка', function(ошибка)
	{
		if (ошибка.ошибка === true)
			return error('Ошибка связи с сервером')

		error(ошибка)
	})
}

/*
function уплотнить_сообщения(сообщения)
{
	var данные = { сообщения: [] }
	
	var обработанное_сообщение
	сообщения.forEach(function(сообщение)
	{
		if (обработанное_сообщение)
			if (обработанное_сообщение.отправитель['адресное имя'] === сообщение.отправитель['адресное имя'])
				return обработанное_сообщение.сообщения.push(преобразовать_время(сообщение))
		
		обработанное_сообщение =
		{
			отправитель: сообщение.отправитель,
			сообщения: [преобразовать_время(сообщение)]
		}
		данные.сообщения.push(обработанное_сообщение)
	})
	
	console.log(данные.сообщения)
	
	return данные.сообщения
}
*/

function преобразовать_время(сообщение)
{
	сообщение.точное_время = Date.parse(сообщение.время, 'dd.MM.yyyy HH:mm').getTime()
	сообщение.время = неточное_время(сообщение.время)
	сообщение.сейчас = new Date().getTime()
	
	return сообщение
}

/*
function текст_и_время(сообщение)
{
	var данные_сообщения = 
	{
		сообщение: сообщение.сообщение,
		точное_время: сообщение.точное_время,
		время: сообщение.время,
		сейчас: сообщение.сейчас,
	}
	
	return данные_сообщения
}
*/

$(function()
{	
	update_intelligent_dates.periodical(60 * 1000)
})

//
/*
var data =
{
	сообщения:
	[
		{
			отправитель: 'Иван Иванов', сообщение: 'Ицхак (Ицик) Виттенберг родился в Вильно в 1907 году в семье рабочего. Был членом подпольной коммунистической партии в Литве, после присоединения Литвы к СССР руководил профсоюзом. После оккупации Литвы немецкими войсками перешёл на нелегальное положение.', время: '24.10.2011 16:45'
		},
		{
			отправитель: 'Иван Иванов', сообщение: 'Dickinsonia (рус. дикинсония) — одно из наиболее характерных ископаемых животных эдиакарской (вендской) биоты. Как правило, представляет собой двусторонне-симметричное рифлёное овальное тело. Родственные связи организма в настоящее время неизвестны. Большинство исследователей относят дикинсоний к животным, однако существуют мнения, что они являются грибами или относятся к особому не существующему ныне царству живой природы.', время: '24.10.2011 16:46'
		},
		{
			отправитель: 'Василий Петров', сообщение: 'Овинище — Весьегонск — тупиковая однопутная 42-километровая железнодорожная линия, относящаяся к Октябрьской железной дороге, проходящая по территории Весьегонского района Тверской области (Россия) от путевого поста Овинище II, расположенного на железнодорожной линии Москва — Сонково — Мга — Санкт-Петербург (которая на разных участках называется Савёловским радиусом и Мологским ходом), до тупиковой станции Весьегонск и обеспечивающая связь расположенного на северо-восточной окраине Тверской области города Весьегонска с железнодорожной сетью страны.', время: '27.10.2011 10:20'
		}
	]
}
*/

/*
function update_online_statuses()
{
	$('.chat').find('.author[author]').each(function()
	{
		var author = $(this)
		
		var адресное_имя = author.attr('author')
		if (is_current_user(адресное_имя))
			return
		
		if (пользователи_в_сети[адресное_имя])
			author.addClass('online')
		else
			author.removeClass('online')
	})
}
*/