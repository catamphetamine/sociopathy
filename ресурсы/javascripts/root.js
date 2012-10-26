// insert scripts

var scripts =
[
	{jquery:
	[
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
	
	{'на страницах':
	[
		'основа'
	]},
	
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
		
	$('<link/>').attr('rel', 'stylesheet/less').attr('href', add_version(path)).appendTo('head')
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

$('body').addClass('loading')

$.xml = function(xml)
{
	var result = $($($.parseXML('<xml>' + xml + '</xml>')).find('xml')[0])
	if (result.children().length > 1)
		return result
	
	return $(result.children()[0])
}

insert_styles(styles, '/облик')
		
$.ajax
({
	url: add_version('/страницы/кусочки/root head.html'),
	dataType: 'text',
	success: function(html)
	{
		$('head').append(html)
	},
	error: function()
	{
		if (window.onerror)
			window.onerror()
		else
			alert('Ошибка на странице')
			
		console.error('Root.html not loaded')
	}
})
	
if (!window.development_mode)
	options.cache = true
	
$.ajax
({
	url: add_version('/страницы/кусочки/root body.html'),
	dataType: 'text',
	success: function(html)
	{
		$('body').append(html)
		
		insert_scripts()
	},
	error: function()
	{
		if (window.onerror)
			window.onerror()
		else
			alert('Ошибка на странице')
			
		console.error('Root.html not loaded')
	}
})