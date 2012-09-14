RegExp.escape = function(string)
{
	var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", 'g')
	return string.replace(specials, "\\$&")
}

String.prototype.replace_all = function(what, with_what)
{
	var regexp = new RegExp(RegExp.escape(what), 'g')
	return this.replace(regexp, with_what)
}

String.prototype.set_character_at = function(index, character)
{
	if (index > this.length - 1)
		return this
		
	return this.substr(0, index) + character + this.substr(index + 1)
}

String.prototype.beautify = function()
{
	var string = this + ''
	
	function replace_quotes(which, string)
	{
		var quote_index = -1
		var found_quote_type
		while ((quote_index = string.indexOf(which, quote_index + 1)) >= 0)
		{
			if (found_quote_type === 'odd')
				found_quote_type = 'even'
			else
				found_quote_type = 'odd'
		
			var beautiful_quote
			if (found_quote_type === 'odd')
				beautiful_quote = '«'
			else
				beautiful_quote = '»'
				
			string = string.set_character_at(quote_index, beautiful_quote)
		}
		
		return string
	}
	
	string = replace_quotes('"', string)
	//string = replace_quotes("'", string)
	
	string = string.replace_all(' - ', ' — ')

	// заменить три точки на троеточие
	string = string.replace(/([^\.]+)\.\.\.([^\.]+)/g, '$1…$2')
	string = string.replace(/^\.\.\.([^\.]+)/g, '…$1')
	string = string.replace(/([^\.]+)\.\.\.$/g, '$1…')
	string = string.replace(/^\.\.\.$/g, '…')
	
	return string
}

String.prototype.count = function(what)
{
	if (typeof(what) === 'string')
	{
		var count = 0
		var index = -1
		while ((index = this.indexOf(what, index + 1)) >= 0)
			count++
		
		return count
	}
	
	if (what.constructor === RegExp)
	{
		var match = this.match(what)
		if (!match)
			return 0
			
		return this.match(what).length
	}
}

String.prototype.matches = function(pattern)
{
	var expression = pattern
	if (expression.constructor !== 'RegExp')
		expression = new RegExp(pattern, 'g')
	
	var match = this.match(expression)
	if (!match)
		return false
		
	return true //this.match(what).length
}

function now()
{
	return new Date()
}

Array.prototype.is_empty = function()
{
	return this.length === 0
}

Array.prototype.пусто = Array.prototype.is_empty

String.prototype.starts_with = function(substring) 
{
	return this.indexOf(substring) === 0
}

String.prototype.ends_with = function(substring) 
{
	var index = this.lastIndexOf(substring)
	return index >= 0 && index === this.length - substring.length
}

String.prototype.chop_on_the_end = function(how_much) 
{
	return this.substring(0, this.length - how_much)
}

String.prototype.trim_trailing_comma = function()
{
	var text = this.trim()
	
	if (text.match(/[^\.]+\.$/))
		text = text.substring(0, text.length - 1)
		
	return text
}

String.prototype.is_multiline = function()
{
	return this.contains('\n')
}

String.prototype.contains = function(what)
{
	return this.indexOf(what) >= 0
}

String.prototype.has = String.prototype.contains

String.prototype.collapse_lines = function()
{
	return this.replace(/\n/g, '')
}

// HTML escaping

String.prototype.escape_html = function() 
{
	return this.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
}

Function.prototype.ticking = function(period, bind, arguments)
{
	var running = true
	var timeout_id
	
	var func = this
	var periodical = function()
	{
		if (func() === false)
			return
		if (running)
			next()
	}
	
	var next = function()
	{
		timeout_id = periodical.delay(period, bind, arguments)
	}
	
	periodical()
	return { stop: function() { clearTimeout(timeout_id); running = false } }
}

Array.prototype.remove = function(element)
{
	var i = 0
	while (i < this.length)
	{
		if (this[i] === element)
		{
			this.splice(i, 1)
			continue
		}
		
		i++
	}
}

Array.prototype.debug = function()
{
	console.log('---')
	
	if (!this.length)
		console.log('< empty >')

	var i = 0
	while (i < this.length)
	{
		console.log(i + ':')
		console.log(this[i])
		
		i++
	}
	
	console.log('---')
}

Array.prototype.last = function()
{
	if (!this.length)
		throw "Array is empty"
		
	return this[this.length - 1]
}

Array.prototype.first = function()
{
	if (!this.length)
		throw "Array is empty"
		
	return this[0]
}

String.prototype.before = function(what)
{
	var index = this.indexOf(what)
	if (index >= 0)
		return this.substring(0, index)
		
	return this
}

String.prototype.after = function(what)
{
	var index = this.indexOf(what)
	if (index >= 0)
		return this.substring(index + what.length)
		
	return this
}

String.prototype.count_occurences = function(substring) 
{   
    return (this.length - this.replace(new RegExp(substring, "g"), '').length) / substring.length
}

String.prototype.underscore = function()
{
	return this.replace(/[\s]+/, "_")
}

/*
String.prototype.starts_with = function(substring) 
{
	return (this.match("^" + substring) == substring)
}

String.prototype.ends_with = function(substring) 
{
	return (this.match(substring + "$") == substring)
}
*/

Array.prototype.for_each = function(action)
{
	Array.prototype.forEach.bind(this)(function(element, index)
	{
		action.bind(element)(element, index)
	})
}

Array.for_each = function(array, action)
{
	var i = 0
	while (i < array.length)
	{
		action.bind(array[i])()
		i++
	}
}

Array.prototype.has = function(element)
{
	return this.indexOf(element) >= 0
}

Object.for_each = function(object, handler)
{
	Object.each(object, function(value, key)
	{
		//if (object.hasOwnProperty(key))
		handler.bind(value)(key, value)
	})
}

Object.пусто = function(object)
{
	var пусто = true
	Object.each(object, function(value, key)
	{
		//if (object.hasOwnProperty(key))
		пусто = false
	})
	
	return пусто
}

Object.key = function(object)
{
	var the_key
	
	Object.for_each(object, function(key)
	{
		the_key = key
	})
	
	return the_key
}

Object.x_over_y = function(source, destination)
{
	if (!source)
		return
	
	$.extend(destination, source)
}

Array.prototype._map = function(action)
{
	var array = []
	this.for_each(function()
	{
		array.push(action.bind(this)())
	})
	return array
}