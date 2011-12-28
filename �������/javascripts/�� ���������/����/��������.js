var chat
var who_is_online

function initialize_page()
{
	Режим.подсказка('Здесь вы можете разговаривать с другими членами сети.')

	var send_button = activate_button('.send_message .send')
	.does(function()
	{
		var message = $('.send_message .message').val()
		$('.send_message .message').val('')
		болталка.emit('сообщение', message)
	})
		
	new Data_templater
	({
		template_url: '/лекала/сообщение в болталке.html',
		item_container: $('.chat'),
		conditional: $('#chat_block[type=conditional]'),
		done: chat_loaded,
		postprocess_item_element: function(item)
		{
			var author = item.find('.author')
			if (is_online(author.attr('author')))
				author.addClass('online')
			return item
		},
	},
	new  Batch_loader
	({
		url: '/приложение/болталка/сообщения',
		batch_size: 8,
		get_data: function (data) { return уплотнить_сообщения(data.сообщения) }
	}))
}

function add_message(data)
{
	var content = $.tmpl('/лекала/сообщение в болталке.html', data)
//	var item = $('<li/>')
//	content.appendTo(item)
	content.prependTo($('.chat'))
}

function is_current_user(адресное_имя)
{
	return пользователь['адресное имя'] === адресное_имя
}

function пользователь_в_сети(пользователь)
{
	chat.find('.author[author="' + пользователь['адресное имя'] + '"]').each(function()
	{
		$(this).addClass('online')
	})
	
	внести_пользователя_в_список_вверху(пользователь)
}

function is_online(адресное_имя)
{
	if (!who_is_online)
		return false
		
	return who_is_online.find('[user="' + пользователь['адресное имя'] + '"]').exists()
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
			return who_is_online.prepend(container)
				
	who_is_online.append(container)
}

function пользователь_вышел_из_болталки(пользователь)
{
	chat.find('.author[author="' + пользователь['адресное имя'] + '"]').each(function()
	{
		$(this).removeClass('online')
	})
	
	who_is_online.find('[user="' + пользователь['адресное имя'] + '"]').remove()
}

function chat_loaded()
{
//	update_online_statuses.periodical(1 * 1000)

	chat = $('.chat')
	who_is_online = $('.who_is_online')
	
	connect_to_chat(function()
	{
		$('.send_message').show()
	})
}

var болталка

//var пользователи_в_сети = {}

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
			//info(пользователь.имя + " в сети")
		})
	})
	
	болталка.on('user_online', function(пользователь)
	{
		пользователь_в_сети(пользователь)
		//info(пользователь.имя + " в сети")
	})
	
	болталка.on('offline', function(пользователь)
	{
		пользователь_вышел_из_болталки(пользователь)
		//info(пользователь.имя + " вышел")
	})
	
	болталка.on('сообщение', function(данные)
	{
		add_message(уплотнить_сообщения([ данные ]))
	})
	
	болталка.on('ошибка', function(ошибка)
	{
		if (ошибка.ошибка === true)
			error('Ошибка связи с сервером')
		else
			error(ошибка)
	})
}

function уплотнить_сообщения(сообщения)
{
	var данные = { сообщения: [] }
	
	var обработанное_сообщение = {}
	сообщения.forEach(function(сообщение)
	{
		if (обработанное_сообщение.отправитель === сообщение.отправитель)
		{
			обработанное_сообщение.сообщения.push(получить_данные_сообщения(сообщение))
			return
		}
		
		обработанное_сообщение =
		{
			отправитель: сообщение.отправитель,
			сообщения: [получить_данные_сообщения(сообщение)]
		}
		данные.сообщения.push(обработанное_сообщение)
	})
	
	return данные.сообщения
}

function получить_данные_сообщения(сообщение)
{
	var данные_сообщения = 
	{
		сообщение: сообщение.сообщение,
		точное_время: Date.parse(сообщение.время, 'dd.MM.yyyy HH:mm').getTime(),
		время: неточное_время(сообщение.время),
		сейчас: new Date().getTime()
	}
	
	return данные_сообщения
}

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