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
	this.css({ top: -this.outerHeight() + 'px' })
	this.show()
	return this.animate({ top: 0 }, duration)
}

$.fn.slide_out_upwards = function(duration)
{
	this.css({ top: 0 })
	return this.animate({ top: -this.outerHeight() + 'px' }, duration, function() { this.hide() })
}

$.fn.slide_in_from_bottom = function(duration)
{
	this.css({ bottom: -this.outerHeight() + 'px' })
	this.show()
	return this.animate({ bottom: 0 }, duration)
}

$.fn.slide_out_downwards = function(duration)
{
	this.css({ bottom: 0 })
	return this.animate({ bottom: -this.outerHeight() + 'px' }, duration, function() { this.hide() })
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