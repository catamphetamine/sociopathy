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
	var left_photo_timer
	var left_actions_timer
		
	var delay = 200
	
	var activator = options.activator
	var actions = options.actions
	var actions_container = options.actions.parent()
	
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
		
		if (left_actions_timer)
		{
			clearTimeout(left_actions_timer)
			left_actions_timer = null
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
	
	actions.on('mouseenter', function()
	{
		if (left_photo_timer)
		{
			clearTimeout(left_photo_timer)
			left_photo_timer = null
		}
		
		if (left_actions_timer)
		{
			clearTimeout(left_actions_timer)
			left_actions_timer = null
		}
		
		show()
	})
	
	actions.on('mouseleave', function()
	{
		left_actions_timer = function()
		{
			hide()
		}
		.delay(delay)
	})
	
	function show()
	{
		actions.appendTo('body')
		
		var offset = actions_container.offset()
		actions.css
		({
			left: offset.left + 'px',
			top: offset.top + 'px'
		})
		
		if (options.style_class)
			actions.addClass(options.style_class)
			
		actions.fade_in(0.3, { easing: 'easeInQuad' })
	}
	
	function hide()
	{
		actions.fade_out(0.3, function()
		{
			actions.css
			({
				left: 0,
				top: 0
			})
		
			if (options.style_class)
				actions.removeClass(options.style_class)
			
			actions.appendTo(actions_container)
		})
	}
}