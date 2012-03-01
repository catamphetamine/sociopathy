/*
var actions = $('.popup_menu_container')

actions.find('.call').click(function(event)
{
	event.preventDefault()
	alert(1)
})

activate_popup_menu
({
	activator: $('.real_picture'),
	actions: actions
})
*/

function activate_popup_menu(options)
{
	options.popup = options.actions
	activate_popup(options)
}

function activate_popup(options)
{
	var left_photo_timer
	var left_popup_timer
		
	var delay = 200
	
	var activator = options.activator
	var popup = options.popup
	var popup_container = options.popup.parent()
	
	if (typeof options.fade_in_duration === 'undefined')
		options.fade_in_duration = 0.3
	
	if (typeof options.fade_out_duration === 'undefined')
		options.fade_out_duration = 0.3
		
	activator.on('mouseenter', function()
	{
		if (options.condition)
			if (!options.condition())
				return
			
		if (left_photo_timer)
		{
			clearTimeout(left_photo_timer)
			left_photo_timer = null
		}
		
		if (left_popup_timer)
		{
			clearTimeout(left_popup_timer)
			left_popup_timer = null
		}
		
		show()
	})
	
	activator.on('mouseleave', function()
	{
		left_photo_timer = function()
		{
			hide()
		}
		.delay(delay)
	})
	
	popup.on('mouseenter', function()
	{
		if (left_photo_timer)
		{
			clearTimeout(left_photo_timer)
			left_photo_timer = null
		}
		
		if (left_popup_timer)
		{
			clearTimeout(left_popup_timer)
			left_popup_timer = null
		}
		
		show()
	})
	
	popup.on('mouseleave', function()
	{
		left_popup_timer = function()
		{
			hide()
		}
		.delay(delay)
	})
	
	var popup_offset =
	{
		left: parseInt(popup.css('left')),
		top: parseInt(popup.css('top'))
	}
	
	if (popup.css('left') !== popup_offset.left + 'px')
		return alert('Invalid popup left css value. Use pixels')
		
	if (popup.css('top') !== popup_offset.top + 'px')
		return alert('Invalid popup top css value. Use pixels')
		
	function show()
	{
		popup.appendTo('body')
		var offset = popup_container.offset()
		
		popup.css
		({
			left: offset.left + popup_offset.left + 'px',
			top: offset.top + popup_offset.top +'px'
		})
		
		if (options.style_class)
			popup.addClass(options.style_class)
			
		popup.fade_in(options.fade_in_duration, { easing: 'easeInQuad' })
	}
	
	function hide()
	{
		popup.fade_out(options.fade_out_duration, function()
		{
			popup.css
			({
				left: 0,
				top: 0
			})
		
			if (options.style_class)
				popup.removeClass(options.style_class)
			
			popup.appendTo(popup_container)
		})
	}
}