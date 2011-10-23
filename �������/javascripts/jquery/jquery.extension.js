/*
$.fn.setCursorPosition = function(position)
{
	console.log(this)
	
	window.getSelection().collapse(this.get(0).firstChild, 1);
	
	return
	
	var range = window.getSelection().getRangeAt(0)
	
	if (!range)
		range = document.createRange();
	
	range.setStart(this.get(0), 1);
	range.setStart(this.get(0), 2);
	range.collapse(true);
	window.getSelection().addRange(range)
//	this.get(0).setSelectionRange(position, position)
	return this
}

function setCursor(node, position)
{
	var node = (typeof node == "string" || node instanceof String) ? document.getElementById(node) : node
	
	if (!node)
	{
		return false
	}
	else if (node.createTextRange)
	{
		var textRange = node.createTextRange()
		textRange.collapse(true)
		textRange.moveEnd(position)
		textRange.moveStart(position)
		textRange.select()
		return true
	}
	else if (node.setSelectionRange)
	{
		node.setSelectionRange(position, position)
		return true
	}
	
	return false
}
*/

$.fn.slide_in_from_top = function(duration)
{
	if (this.css('position') !== 'relative')
	{
		this.stop_animation()
		this.css({ top: -this.outerHeight() + 'px' })
		this.show()
		return this.animate({ top: 0 }, duration)
	}
	
	if (this.is(':animated'))
		return

	var container = $('<div/>')
	container.css({ overflow: 'hidden' })
	this.wrap(container)
	
	var initial_margin_bottom = parseInt(this.css('margin-bottom'))
	
	this.css({ top: -this.outerHeight(true) + 'px' })
	this.css({ 'margin-bottom': (-this.outerHeight(true) + initial_margin_bottom) + 'px' })	
	this.show()
	
	return this.animate
	(
		{
			top: 0,
			'margin-bottom': initial_margin_bottom
		},
		duration,
		(function()
		{
			this.appendTo(container.parent())
			container.remove()
		})
		.bind(this)
	)
}

$.fn.slide_out_upwards = function(duration)
{
	if (this.css('position') !== 'relative')
	{
		this.stop_animation()
		this.css({ top: 0 })
		this.show()
		return this.animate({ top: -this.outerHeight() + 'px' }, duration, (function() { this.hide() }).bind(this))
	}
	
	if (this.is(':animated'))
		return
		
	var container = $('<div/>')
	container.css({ overflow: 'hidden' })
	this.wrap(container)
	
	var initial_margin_bottom = parseInt(this.css('margin-bottom'))

	this.css({ top: 0 })
	
	return this.animate
	(
		{
			top: -this.outerHeight(true) + 'px',
			'margin-bottom': (-this.outerHeight(true) + initial_margin_bottom) + 'px'
		},
		duration,
		(function()
		{
			this.hide()
			this.appendTo(container.parent())
			container.remove()
			this.css('margin-bottom', initial_margin_bottom)
		})
		.bind(this)
	)
}

$.fn.slide_in_from_bottom = function(duration)
{
	this.stop_animation()
	this.css({ bottom: -this.outerHeight() + 'px' })
	this.show()
	return this.animate({ bottom: 0 }, duration)
}

$.fn.slide_out_downwards = function(duration)
{
	this.stop_animation()
	this.css({ bottom: 0 })
	return this.animate
	(
		{
			bottom: -this.outerHeight() + 'px'
		},
		duration,
		function() { this.hide() }
	)
}

$.fn.stop_animation = function()
{
	if (this.is(":animated")) 
		this.stop(true /* clear queue */, false /* don't jump to queue end */)
	return this
}

$.fn.fade_in = function(duration, callback)
{
	animator.jquery.fade_in(this, { duration: duration, callback: callback })
	return this
}

$.fn.fade_out = function(duration, callback)
{
	animator.jquery.fade_out(this, { duration: duration, callback: callback })
	return this
}

$.fn.opaque = function()
{
	return this.css({ opacity: 1 })
}