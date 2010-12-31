// jQuery customization

// finding external links

(function($) 
{
	$.extend($.expr[':'], 
	{
	    external: function(element) 
		{
	        return element.hostname !== window.location.hostname && element.hostname
	    }
	})
	
	/*
	$.fn.external = function() 
	{
	    return this.filter(':external')
	}
	*/
}(this.jQuery))

// function binding
$.bind = function(scope, fn /*, variadic arguments to curry */)
{
	var args = Array.prototype.slice.call(arguments, 2)

	return function() 
	{
		return fn.apply(scope, args.concat($.makeArray(arguments)))
	}
}

$.fn.belongs_to = function(parent)
{
    return (this.parents(parent).length > 0)
}

// get jQuery element
function get_element(id_or_element)
{
	if (typeof id_or_element === "string")
		return $("#" + id_or_element)
		
	return id_or_element
}

// print debug info about object's contents
function info(object) 
{
	if ($.isWindow(object))
		return "[window]"
	
	var info = ""
	
	for(property in object)
	{
		info += property + ": " + object[property] + "\n"
	}
	
	return info
}

String.prototype.count_occurences = function(substring) 
{   
    return (this.length - this.replace(new RegExp(substring, "g"), '').length) / substring.length
}

String.prototype.trim = function()
{
	return this.replace(/^[\s\xA0]+/, "").replace(/[\s\xA0]+$/, "")
}

String.prototype.underscore = function()
{
	return this.replace(/[\s]+/, "_")
}

String.prototype.starts_with = function(substring) 
{
	return (this.match("^" + substring) == substring)
}

String.prototype.ends_with = function(substring) 
{
	return (this.match(substring + "$") == substring)
}

// OOP

function extend_static(Child, Parent) 
{
	var Stub = function() { }
	Stub.prototype = Parent.prototype
	Child.prototype = new Stub()
	Child.prototype.constructor = Child
	Child.superclass = Parent.prototype
}

function extend(child, parent)
{
	for (var property in parent)
	{
		child.property = parent.property
	}
}

// miscellaneous

function debug(message)
{
	alert(message)
}

// HTML escaping

String.prototype.escape_html = function() 
{
	return this.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
}

// error

function custom_error(message, details)
{
	this.message = message
	this.details = details
}

// return the value of the attribute, if it exists

function safely_get_attribute(source, name, variable)
{
	var value = source.attr(name)
	
	if (value)
		return value
		
	return variable
}

// set the variable to the value of the source variable, if it exists

function safely_get(source, default_value)
{
	if (source)
		return source

	return default_value
}

// generic

function get_number(variable)
{
	if (typeof variable == "number")
		return variable
}

function get_function(variable)
{
	if (typeof variable == "function")
		return variable
}

// remove an element from array

Array.prototype.remove = function(element) 
{
	var i = 0
    while (i < this.length) 
	{
        if (this[i] === element) 
		{
            this.splice(i, 1)
            return
        }
		
		i++
    }
}