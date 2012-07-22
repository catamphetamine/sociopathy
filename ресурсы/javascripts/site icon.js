/*
Tinycon.setOptions
({
	font: '16px arial',
	colour: '#000000',
	background: 'transparent',
	fallback: false
})

//Tinycon.setSize('•', { x: 7.5, y: 8.5, center: true })

var animating_site_icon = false

function animate_site_icon()
{
	if (animating_site_icon)
		return
		
	animating_site_icon = true
		
	Tinycon.text('•',
	{
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
}

function stop_site_icon_animation()
{
	Tinycon.text('', { callback: function() { animating_site_icon = false } })
}
*/

var site_icon = new (new Class
({
	initialize: function()
	{
		this.element = $('#site_icon')	
	},

	путь: '/картинки/значки/',
	
	set: function(name)
	{
		this.element.remove()
		this.element = $('<link id="site_icon" type="image/x-icon" rel="shortcut icon"/>')
		this.element.attr('href', this.путь + name + '.png')
		this.element.appendTo('head');
	},
	
	animating_site_icon: false,
	
	animate_site_icon: function()
	{
		if (this.animating_site_icon)
			return
			
		this.animating_site_icon = true
		
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
			site_icon.animation_timeout = change_icon.delay(1000)
		}
		
		change_icon()
	},
	
	stop_site_icon_animation: function()
	{
		if (!this.animating_site_icon)
			return
			
		clearTimeout(this.animation_timeout)
		this.animating_site_icon = false
		
		this.set('основной')
	}
}))()