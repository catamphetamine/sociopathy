var head = document.getElementsByTagName('head')[0]
var body = document.getElementsByTagName('body')[0]

// insert scripts

var initial_scripts =
[
	{ path: 'jquery/jquery' },
	{ path: 'mootools/core' },
	{ path: 'язык' },
	{ path: 'jquery/jquery.cookie' },
	{ path: 'jquery/jquery.extension' },
	{ path: 'hotkeys' },
	{ path: 'пользователь', await: true },
	{ path: 'translator' },
	{ path: 'языки', await: true }
]

var scripts =
[
	{jquery:
	[
		'jquery.tmpl',
		'jquery.disable.text.select',
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
//		'jquery-ui', // Draggable
	]},
	
	{mootools:
	[
		//'mootools-core-1.4.5-full-nocompat',
		'more',
	]},
	
	//'язык',
	'date',
	
	'uri',
	
	'страница',
	
	'dom tools',
	'клавиши',
	'прокрутка',
	
	'общее',
	
	'проверка обозревателя',
	
	'animator',
	
	'подгрузка статики',
	
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
		'autocomplete',
		
		{окошко:
		[
			 'simple value dialog window'
		]},
			
		'плавающее навершие',
		
		'загрузка, ждите',
		
		'уведомления',
		
		'навершие',
		
		//'shaker',
		'thrower',
		
		'dragger',
		'dragger sorter',
		
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
		
		'пошаговое окошко',
		
		'всплывающее меню',
		
		'context menu',
		
		'подсказки',
		
		'наверх',
		
		'формулы',

		'окошко входа',
	
		'unsaved changes'
	]},
	
	'navigation',
	
	'configuration',
	
	'надоснова',
		
	'здесь или не здесь',
	
	'inter tab communication',
	
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
	'picture uploader',
	
	'эфир',
	'новости',
	
	'activity monitor',
	
	//'tinycon',
	'window notification',
	
	'режимы',
	
	'rich content'
]

function script_insertion(all_scripts, root_path, finished)
{
	var insert_scripts = function(scripts, path)
	{
		if (typeof scripts === 'undefined')
		{
			return insert_scripts(all_scripts, root_path)
		}
		
		if (scripts.length === 0)
		{
			if (all_scripts.length !== 0)
				return insert_scripts()
			
			return finished()
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
	
	return insert_scripts
}

var Wiki_processor

var insert_scripts = script_insertion(scripts, '/javascripts', function()
{
	Wiki_processor = window.Wiki_processor

	// к этому времени jQuery уже подгружен
	$(document).trigger('scripts_loaded')
})

// insert styles

var styles =
[
	'общее',
	'messages',
	
	{кнопки:
	[
		'generic',
		'minor',
		'caution',
		'extreme caution',
		'dangerous'
	]},
		
	'уведомления',
	
	'окошко',
	
	{'наглядный писарь':
	[
		'наглядный писарь'
	]},
	
	'навершие',
	
	'slider',
	
	'окошко входа',
	
	'личная карточка',
	
	'поле поиска',
	
	'simple value dialog window',
	
	'audio player',
	
	'either way loading',
	
	'autocomplete'
]

function insert_style(path)
{
	if (path.indexOf('/') !== 0)
		path = '/облик/' + path
	
	console.log('loading style: ' + path)
	
	if (Configuration.Optimize)
	{
		var stylesheet
		
		if (path.indexOf('/plugins/') === 0)
		{
			var id = path.substring('/plugins/'.length)
			id = id.substring(0, id.length - '.css'.length)
			
			console.log('looking for plugin style with id = ' + id)
			
			stylesheet = Optimization.Plugins.Styles[id]
		}
		else
		{
			var id = path.substring('/облик/'.length)
			
			if (id.ends_with('.css'))
				id = id.substring(0, id.length - '.css'.length)
			
			console.log('looking for style with id = ' + id)
			
			stylesheet = Optimization.Styles[id]
		}
		
		if (stylesheet)
		{
			console.log('is cached')
			
			var style = document.createElement('style')
			//style.type = 'text/less'
			style.innerHTML = stylesheet
			
			style.setAttribute('for', add_version(path))
			
			return head.appendChild(style)
		}
	}
	
	console.log('not cached')
	
	if (!path.ends_with('.less') && !path.ends_with('.css'))
		path = path + '.css'
		
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
			$.set_ajax_to_non_caching_mode()
			
			where.append(html)
			
			$.restore_initial_ajax()
			
			callback()
		},
		error: function()
		{
			alert('Ошибка при загрузке страницы')
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

var initial_script_in_progress =
{
	set: function(path)
	{
		this.path = path
	},
	
	finished: function(path)
	{
		if (this.path !== path)
			throw 'Weird error loading initial scripts'
		
		this.path = null
		
		do_insert_initial_scripts()
	}
}

function insert_initial_scripts(callback)
{
	if (initial_scripts.length === 0)
		return callback()
	
	var script = initial_scripts.shift()
	
	if (script.await)
	{
		initial_script_in_progress.set(script.path)
		insert_script('/javascripts/' + script.path)
	}
	else
		insert_script('/javascripts/' + script.path, do_insert_initial_scripts)
}

function do_insert_initial_scripts()
{
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
}

function initialize(next)
{
	data = window.initialization_data
	
	Configuration.Invites = data.invites
	
	Configuration.Core_modules = data.core_modules
	Configuration.Plugins = data.plugins
	
	if (data.host)
		Configuration.Host = data.host
	
	if (data.port)
		Configuration.Port = data.port
	
	Configuration.Locale =
	{
		Default_language: 'en',
		Supported_languages:
		[
			{ id: 'ru', name: 'Русский' },
			{ id: 'en', name: 'English' }
		],
		
		Предпочитаемый_язык: data.язык,
		//Предпочитаемые_языки: data.языки,
		
		Fixed: data.language_is_fixed,
		
		Страна: data.страна || 'US'
	}
	
	next()
}

initialize(do_insert_initial_scripts)
