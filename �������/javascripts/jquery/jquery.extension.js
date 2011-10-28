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
		this.show()
		return this.animate({ top: 0 }, duration)
	}

	this.stop_animation()

	if (this.parent().css('overflow') !== 'hidden')
	{
		var container = $('<div/>')
		container.css({ overflow: 'hidden' })
		this.wrap(container)
	}
	
	var top = parseFloat(this.css('top'))
	var margin_bottom = parseFloat(this.css('margin-bottom'))
	var height = this.outerHeight(true) + top
	
	if (top === 0)
	{
		this.css({ top: -height + 'px' })
		this.css({ 'margin-bottom': (margin_bottom - height) + 'px' })
	}
	
	this.show()
	
	return this.animate
	(
		{
			top: 0,
			'margin-bottom': (margin_bottom - top) + 'px'
		},
		duration
	)
}

$.fn.move_out_upwards = function(duration)
{
	if (this.css('position') !== 'relative')
	{
		var height = this.outerHeight(true)
		return this.css({ top: -height + 'px' })
	}
	
	var margin_bottom = parseFloat(this.css('margin-bottom'))
	var height = this.outerHeight(true)
	
	return this.css
	({
		top: -height + 'px',
		'margin-bottom': (margin_bottom - height) + 'px'
	})
}

$.fn.slide_out_upwards = function(duration)
{
	if (this.css('position') !== 'relative')
	{
		this.stop_animation()
		this.show()
		return this.animate({ top: -this.outerHeight(true) + 'px' }, duration, (function() { this.hide() }).bind(this))
	}

	this.stop_animation()
	
	if (this.parent().css('overflow') !== 'hidden')
	{
		var container = $('<div/>')
		container.css({ overflow: 'hidden' })
		this.wrap(container)
	}
	
	var top = parseFloat(this.css('top')) // < 0
	var margin_bottom = parseFloat(this.css('margin-bottom'))
	var height = this.outerHeight(true) - top
	
	return this.animate
	(
		{
			top: -height + 'px',
			'margin-bottom': (margin_bottom - (height + top)) + 'px'
		},
		duration
	)
}

$.fn.slide_in_from_bottom = function(duration)
{
	this.stop_animation()
	this.show()
	return this.animate({ bottom: 0 }, duration)
}

$.fn.move_out_downwards = function(duration)
{
	return this.css({ bottom: -this.outerHeight(true) + 'px' })
}

$.fn.slide_out_downwards = function(duration)
{
	this.stop_animation()
	return this.animate
	(
		{
			bottom: -this.outerHeight(true) + 'px'
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

$.fn.outer_html = function()
{
	return $('<div/>').append(this.eq(0).clone()).html()
}