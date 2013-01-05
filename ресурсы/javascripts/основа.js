var head = document.getElementsByTagName('head')[0]
var body = document.getElementsByTagName('body')[0]

// insert scripts

var initial_scripts =
[
	'jquery/jquery',
//	'jquery/jquery.tmpl'
]

var scripts =
[
	{jquery:
	[
		'jquery.tmpl',
		'jquery.disable.text.select',
		'jquery.extension',
		'jquery.cookie',
		'jquery.color',
		'jquery.animate-shadow',
		'jquery.tools',
		'jquery-full-house',
		'jquery.easing.min.1.3',
		'jquery.i18n',
		'jquery.glow',
		'jquery.color.min',
		'jquery.mousewheel',
		'jquery.hoverattribute',
		'jquery.text-shadow',
		'jquery.background.position.x.y',
		'jquery-ui', // Draggable
	]},
	
	{mootools:
	[
		'mootools-core-1.4.5-full-nocompat',
		'mootools-more-1.4.0.1',
	]},
	
	'язык',
	'date',
	
	'uri',
	
	'страница',
	'снасти',
	
	'dom tools',
	'клавиши',
	'прокрутка',
	
	'общее',
	
	'проверка обозревателя',
	
	'движение',
	
	'dynamic page content',
	
	'надоснова',
	
	/*
	{'на страницах':
	[
		'загрузка страницы'
	]},
	*/
	
	{облик:
	[
		'form',
		'conditional',
		'scroll navigation',
		
		{окошко:
		[
			 'simple value dialog window'
		]},
			
		'плавающее навершие',
		
		'загрузка, ждите',
		
		'уведомления',
		
		'навершие',
		
		'shaker',
		
		'validation',
		
		{писарь:
		[
			'editor',
			'time machine',
			'selection',
			'caret'
		]},
			
		{окошко:
		[
			'окошко',
			'z indexer',
			'initializer'
		]},
			
		{кнопки:
		[
			'кнопка',
			'text button',
			'text button skins',
			'image button',
			'image chooser'
		]},
			
		{'наглядный писарь':
		[
			'наглядный писарь',
			'клавиши',
			'снасти'
		]},
			
		{slider:
		[
			'slider',
			'form_slider'
		]},
			
		'сколько уже',
		
		'всплывающее меню',
		
		'подсказки',
		
		'формулы',

		'окошко входа'
	]},
	
	'здесь или не здесь',
	
	'youtube',
	'vimeo',
	
	'wiki processor',
	
	'socket.io',
	
	'focus',
	
	'messages',
	'interactive messages',
	
	'data loader',
	'either way loading',
	
	'uploader',
	
	'эфир',
	'новости',
	
	//'tinycon',
	'window notification',
	
	'режимы'
]

var all_scripts = scripts

function insert_scripts(scripts, path)
{
	if (typeof scripts === 'undefined')
	{
		return insert_scripts(all_scripts, '/javascripts')
	}
	
	if (scripts.length === 0)
	{
		if (all_scripts.length !== 0)
			return insert_scripts()
		
		// к этому времени jQuery уже подгружен
		$(document).trigger('scripts_loaded')
		return
	}
	
	var script = scripts[0]
		
	if (typeof script === 'string')
	{
		scripts.shift()
		return insert_script(path + '/' + script, function() { insert_scripts(scripts, path) })
	}
		
	if (typeof script === 'object')
	{
		var directory
		for (var key in script)
			directory = key
			
		if (!directory || script[directory].length === 0)
		{
			scripts.shift()
			return insert_scripts(scripts, path)
		}
		
		return insert_scripts(script[directory], path + '/' + directory)
	}
}

// insert styles

var styles =
[
	'общее',
	'messages',
	
	{кнопки:
	[
		'generic',
		'minor',
		'caution'
	]},
		
	'уведомления',
	
	'окошко',
	
	{'наглядный писарь':
	[
		'наглядный писарь',
		'sociopathy',
	]},
	
	'навершие',
	'user icon.less',
	
	'slider',
	
	'окошко входа',
	
	'личная карточка',
	
	'поле поиска',
	
	'simple value dialog window',
	
	'audio player'
]

function insert_style(path)
{
	if (path.indexOf('/') !== 0)
		path = '/облик/' + path
	
	var has_extension = false
	if (path.lastIndexOf('.less') === path.length - '.less'.length)
		has_extension = true
	else if (path.lastIndexOf('.css') === path.length - '.css'.length)
		has_extension = true
		
	path = has_extension ? path : path + '.css'
		
	var link = document.createElement('link')
	link.rel = 'stylesheet/less'
	link.href = add_version(path)
	
	head.appendChild(link)
}

function insert_styles(styles, path)
{
	styles.forEach(function(style)
	{
		if (typeof style === 'string')
		{
			return insert_style(path + '/' + style)
		}
			
		if (typeof style === 'object')
			for (var directory in style)
				insert_styles(style[directory], path + '/' + directory)
	})
}

body.classList.add('loading')

function append_all_children(from, to)
{
	while (from.childNodes.length > 0)
	{
		to.appendChild(from.firstChild)
	}
}

function extra_markup(what, where, callback)
{
	$.ajax
	({
		url: add_version('/страницы/кусочки/' + what + '.html'),
		dataType: 'text',
		success: function(html)
		{
			where.append(html)
			
			callback()
		},
		error: function()
		{
			if (window.onerror)
				window.onerror()
			else
				alert('Ошибка на странице')
	
			console.error('Extra markup not loaded')
		}
	})
		
	/*
	// doesn't execute javascripts in html
	ajax
	({
		url: add_version('/страницы/кусочки/основа (extra markup).html'),
		dataType: 'html',
		success: function(xml)
		{
			// <html>
			xml = xml.firstChild
			
			var head_content = xml.getElementsByTagName('head')[0]
			var body_content = xml.getElementsByTagName('body')[0]
			
			append_all_children(head_content, head)
			append_all_children(body_content, body)
			
			callback()
		},
		error: function()
		{
			if (window.onerror)
				window.onerror()
			else
				alert('Ошибка на странице')
				
			console.error('основа (extra markup).html not loaded')
		}
	})
	*/
}

//if (!window.development_mode)
//	options.cache = true

function insert_initial_scripts(callback)
{
	if (initial_scripts.length === 0)
		return callback()
	
	var script = initial_scripts.shift()
	insert_script('/javascripts/' + script, function() { insert_initial_scripts(callback) })
}

insert_initial_scripts(function()
{
	extra_markup('основа (head)', $('head'), function()
	{
		extra_markup('основа (body)', $('body'), function()
		{
			insert_styles(styles, '/облик')
			insert_scripts()
		})
	})
})