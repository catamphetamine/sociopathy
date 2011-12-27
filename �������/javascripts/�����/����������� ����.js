/*
var actions = $('.actions_container')

actions.find('.change_picture').click(function(event)
{
	event.preventDefault()
	$('.upload_new_picture').click()
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
	var ready = true
	var acting = false
		
	options.activator.on('mouseenter', function()
	{
		if (!ready)
			return
			
		if (left_photo_timer)
		{
			clearTimeout(left_photo_timer)
			left_photo_timer = null
		}
		else if (left_actions_timer)
		{
			clearTimeout(left_actions_timer)
			left_actions_timer = null
		}
		else
		{
			inside()
		}
	})
	
	options.activator.on('mouseleave', function()
	{
		if (!acting)
			return
			
		left_photo_timer = function()
		{
			clearTimeout(left_photo_timer)
			left_photo_timer = null
			
			outside()
		}
		.delay(delay)
	})
	
	options.actions.on('mouseenter', function()
	{
		if (!ready)
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
	})
	
	options.actions.on('mouseleave', function()
	{
		if (!acting)
			return
			
		left_actions_timer = function()
		{
			clearTimeout(left_actions_timer)
			left_actions_timer = null
			
			outside()
		}
		.delay(delay)
	})
	
	function inside()
	{
		acting = true
		options.actions.fade_in(0.3, { easing: 'easeInQuad' })
	}
	
	function outside()
	{
		acting = false
		ready = false
		options.actions.fade_out(0.3, function() { ready = true })
	}
}