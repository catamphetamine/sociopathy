function set_site_icon(name, extension)
{
	if (extension)
		extension = '.' + extension
	else
		extension = '.png'
		
	$('link[rel$=icon]').remove()
	//$('link[rel$=icon]').replaceWith('')
		
	$('<link type="image/x-icon" rel="shortcut icon"/>')
		.attr('href', this.путь + name + extension)
		.appendTo('head')
}

/*
// icon animation through tinycon.js
Tinycon.setOptions
({
	font: '16px arial',
	colour: '#000000',
	background: 'transparent',
	fallback: false
})

var site_icon = new (new Class
({
	initialize: function()
	{
		this.element = $('link[rel$=icon]')
	},

	путь: '/картинки/значки/',
	
	set: function(name)
	{
		this.element.remove()
		this.element = this.create()
		this.element.attr('href', this.путь + name + '.png')
		this.element.appendTo('head')
	},
	
	create: function()
	{
		return $('<link type="image/x-icon" rel="shortcut icon"/>')
	},
	
	animating: false,
	
	something_new: function()
	{
		if (this.animating)
			return
			
		this.animating = true
		
		//this.set('внимание 1')
		
		var site_icon = this
		
		Tinycon.text('•',
		{
			favicon:
			{
				get: function() { return $('link[rel$=icon]') },
				source: site_icon.путь + 'внимание 1' + '.png',
				create: site_icon.create
			},
			position: { webkit: { x: 7.5, y: 8.5}, gecko: { x: 8.0, y: 8.5}, center: true },
			animate:
			{
				color:
				{
					from: '#000000',
					to: '#ffffff'
				},
				duration: 1000,
				frames: 2
			}
		})
	},
	
	nothing_new: function()
	{
		if (!this.animating)
			return
			
		var site_icon = this
		
		Tinycon.stop_animation_and_do(function()
		{
			site_icon.set('основной')
			site_icon.animating = false
		})
	}
}))()
*/

// icon animation
var Image_sequence_icon = new Class
({
	Binds: ['set'],
	
	initialize: function()
	{
	},

	путь: '/картинки/значки/',
	
	time: 1,
	
	set: set_site_icon,
	
	animating: false,
	
	something_new: function()
	{
		if (this.animating)
			return
			
		this.animating = true
		
		this.set('внимание 1')
		
		var icon_name
		function next_icon()
		{
			if (icon_name === 'внимание 1')
				icon_name = 'внимание 2'
			else
				icon_name = 'внимание 1'
				
			return icon_name
		}
		
		var site_icon = this
		var change_icon = function()
		{
			site_icon.set(next_icon())
			site_icon.animation_timeout = change_icon.delay(site_icon.time * 1000)
		}
		
		change_icon()
	},
	
	nothing_new: function()
	{
		if (!this.animating)
			return
			
		clearTimeout(this.animation_timeout)
		this.animating = false
		
		this.set('основной')
	}
})

// Window title animation, since icon animation crashes Chrome
var Text_and_icon = new Class
({
	Binds: ['set'],
	
	
	initialize: function()
	{
	},

	путь: '/картинки/значки/',
	
	// http://en.wikipedia.org/wiki/Template:Unicode_chart_Dingbats
	//attention_symbol = '•'
	attention_symbol: '✽ ',

	delay: 3000,
	
	set: set_site_icon,
	
	prepend_asterisk: function()
	{
		title(this.attention_symbol + title())
	},
	
	remove_asterisk: function()
	{
		title(title().substring(this.attention_symbol.length))
	},
	
	has_asterisk: function()
	{
		return title().indexOf(this.attention_symbol) === 0
	},
	
	something_new: function(options)
	{
		if (this.animating)
			return
		
		options = options || {}
		
		if (!options.immediate)
		{
			this.delayed = function()
			{
				this.delayed = null
				this.something_new({ immediate: true })
			}
			.bind(this)
			.delay(this.delay)
			return
		}
			
		this.animating = true
		
		this.set('внимание 1')
		
		var site_icon = this
		var change_title = (function()
		{
			if (!this.has_asterisk())
				this.prepend_asterisk()
			else
				this.remove_asterisk()
				
			this.animation_timeout = change_title.delay(1000)
		})
		.bind(this)
		
		change_title()
	},
	
	nothing_new: function()
	{
		if (this.delayed)
		{
			clearTimeout(this.delayed)
			this.delayed = null
			return
		}
		
		if (!this.animating)
			return
			
		clearTimeout(this.animation_timeout)
		this.animation_timeout = null
		this.animating = false
		
		if (this.has_asterisk())
			this.remove_asterisk()
		
		this.set('основной')
	}
})

var Minimalistic_window_notification = new Class
({
	Binds: ['set'],
	
	
	initialize: function()
	{
	},

	путь: '/картинки/значки/',
	
	// http://en.wikipedia.org/wiki/Template:Unicode_chart_Dingbats
	//attention_symbol = '•'
	attention_symbol: '✽ ',

	delay: 0, //3000,
	delayed: [],
	
	prepends_asterisk: false,
	
	set: set_site_icon,
	
	prepend_asterisk: function()
	{
		title(this.attention_symbol + title())
	},
	
	remove_asterisk: function()
	{
		title(title().substring(this.attention_symbol.length))
	},
	
	has_asterisk: function()
	{
		return title().indexOf(this.attention_symbol) === 0
	},
	
	// поскольку при ajax-овых переходах между страницами меняется title,
	// то его постоянно следует проверять на наличие звёздочки
	title_changed: function()
	{
		if (!this.prepends_asterisk)
			return
		
		if (!this.notifying)
			return
		
		if (!this.has_asterisk())
			this.prepend_asterisk()
	},
	
	something_new: function(options)
	{
		if (this.notifying)
			return
		
		options = options || {}
		
		if (!options.immediate)
		{
			var delayed = function()
			{
				this.delayed.remove(delayed)
				this.something_new({ immediate: true })
			}
			.bind(this)
			.delay(this.delay)
			
			this.delayed.push(delayed)
			
			return
		}
			
		this.notifying = true
		
		this.set('красный')
		
		if (this.prepends_asterisk)
			this.prepend_asterisk()
	},
	
	nothing_new: function()
	{
		if (!this.delayed.пусто())
		{
			this.delayed.for_each(function()
			{
				clearTimeout(this)
			})
			
			this.delayed = []
		}
		
		if (!this.notifying)
			return
			
		this.notifying = false
		
		if (this.prepends_asterisk)
			if (this.has_asterisk())
				this.remove_asterisk()
			
		this.set('основной')
	}
})

var window_notification = new Minimalistic_window_notification()
//var window_notification = new Text_and_icon()

// crashes in Chrome
//var window_notification = new Image_sequence_icon()

//site_icon.something_new()
