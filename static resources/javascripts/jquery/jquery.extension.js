// old ajax uploader
(function()
{
	function initialize_ajax_upload()
	{
		function create_frame(options)
		{
			var frame = $('<iframe/>')
			frame.attr('src', 'javascript:false')
			frame.attr('id', 'ajax_upload_frame_' + new Date().getTime())
			frame.attr('name', frame.attr('id'))
			frame.hide()
			
			return frame
		}
		
		function create_form(file_chooser, options)
		{
			var form = $('<form/>')
			
			/*
			if (options.data)
				for (var i in options.data)
					$('<input type="hidden" name="' + options.data[i].name + '" value="' + options.data[i].value + '" />').appendTo(form)
			*/
					
			var cloned_file_chooser = file_chooser.clone()
			
			cloned_file_chooser.attr('name', 'ajax_uploaded_image_' + new Date().getTime())
			cloned_file_chooser.appendTo(form)
			
			//console.log(cloned_file_chooser[0].files[0])
			
			form.hide()
			
			var url = options.url
			if (options.data)
			{
				var parameter = options.data
			
				if (url.indexOf('?') >= 0)
					url += '&'
				else
					url += '?'
					
				url += encodeURIComponent(parameter.name) + '=' + encodeURIComponent(parameter.value)
			}
			
			form.attr('action', url)
			form.attr('method', 'post')
			
			//if (form[0].encoding)
			//	form.attr('encoding', 'multipart/form-data')
			//else
			form.attr('enctype', 'multipart/form-data')
				
			return form
		}
		
		// $(window).on('beforeunload', function(event){})
		
		function get_response(frame)
		{
			frame = frame[0]
			var document = frame.contentDocument ? frame.contentDocument: frame.contentWindow.document
			
			try
			{
				return document.body.innerHTML
			}
			catch (error)
			{
				return '{}'
			}
		}
		
		$.fn.ajax_upload = function(options)
		{
			var file_chooser = $(this)
			
			if (!file_chooser.is('input[type=file]'))
				return alert('Couldn\'t call .ajax_upload() on not a file input')
		
			options = $.extend({}, options)
			
			var frame = create_frame(options)
			frame.appendTo('body')
			
			var form = create_form(file_chooser, options)
			form.attr('target', frame.attr('id'))
			form.appendTo('body')
			
			//alert(frame.outer_html())
			frame.on('load.ajax_upload', function()
			{
				var response = get_response(frame)
				
				if (response.ошибка)
					return options.error(response.ошибка)
				
				options.success(JSON.parse(response))
				
				setTimeout(function()
				{
					frame.remove()
				},
				1)
			})
			
			form.submit()
			//form.remove()
		}
	}
	
	initialize_ajax_upload()
})()

$.fn.slide_in_from_top = function(duration, easing, callback)
{
	if (duration)
		duration *= 1000
	
	if (typeof easing === 'function')
		callback = easing

	this.stop_animation()
			
	switch (this.css('position'))
	{
		case 'absolute':
		case 'fixed':
			this.show()
			return this.animate({ top: 0 }, duration)

		case 'relative':
			if (this.parent().css('overflow') !== 'hidden')
				throw 'Container\'s css overflow must be "hidden"'
			
			var top = parseFloat(this.css('top'))

			if (top > 0)
				throw 'top must be <= 0'
				
			if (top === 0)
				this.move_out_upwards()

			var margin_bottom = parseFloat(this.css('margin-bottom'))
			var height = this.outerHeight(true) + top			
			
			this.show()
			
			return this.animate
			({
				top: 0,
				'margin-bottom': (margin_bottom - top) + 'px'
			},
			duration,
			easing,
			callback)
			
		default:
			throw 'Unsupported css position: ' + this.css('position') + ', for element ' + this.outer_html()
	}
}

$.fn.move_out_upwards = function(duration)
{
	switch (this.css('position'))
	{
		case 'absolute':
		case 'fixed':
			return this.css({ top: -this.outerHeight(true) + 'px' })

		case 'relative':
			var margin_bottom = parseFloat(this.css('margin-bottom'))
			var height = this.outerHeight(true)
			
			return this.css
			({
				top: -height + 'px',
				'margin-bottom': (margin_bottom - height) + 'px'
			})
	
		default:
			throw 'Unsupported css position: ' + this.css('position') + ', for element ' + this.outer_html()
	}
}

$.fn.slide_out_upwards = function(duration)
{
	if (duration)
		duration *= 1000
		
	this.stop_animation()
	
	switch (this.css('position'))
	{
		case 'absolute':
		case 'fixed':
			this.show()
			return this.animate({ top: -this.outerHeight(true) + 'px' }, duration, (function() { this.hide() }).bind(this))

		case 'relative':
			if (this.parent().css('overflow') !== 'hidden')
			{
				var container = $('<div/>')
				container.css({ overflow: 'hidden' })
				this.wrap(container)
			}
			
			var top = parseFloat(this.css('top'))
			
			//if (top < 0)
			//	throw 'top must be >= 0'
			
			// top может быть < 0, если скольжение не дошло до конца и пошло обратно
			
			var margin_bottom = parseFloat(this.css('margin-bottom'))
			// outer hieght includes bottom margin, which is = top
			var height = this.outerHeight(true) - top
			
			return this.animate
			({
				top: -height + 'px',
				'margin-bottom': (margin_bottom - (height + top)) + 'px'
			},
			duration)
	
		default:
			throw 'Unsupported css position: ' + this.css('position') + ', for element ' + this.outer_html()
	}
}

$.fn.slide_in_from_bottom = function(duration, easing, callback)
{
	if (typeof easing === 'function')
		callback = easing

	this.stop_animation()
			
	switch (this.css('position'))
	{
		case 'absolute':
		case 'fixed':
			this.show()
			return this.animate({ bottom: 0 }, duration)
	
		case 'relative':
			if (this.parent().css('overflow') !== 'hidden')
				throw 'Container\'s css overflow must be "hidden"'
			
			var bottom = parseFloat(this.css('bottom'))

			if (bottom > 0)
				throw 'bottom must be <= 0'
				
			if (bottom === 0)
				this.move_out_downwards()

			var margin_top = parseFloat(this.css('margin-top'))
			var height = this.outerHeight(true) + bottom
			
			this.show()
			
			return this.animate
			({
				bottom: 0,
				'margin-top': (margin_top - bottom) + 'px'
			},
			duration,
			easing,
			callback)
			
		default:
			throw 'Unsupported css position: ' + this.css('position') + ', for element ' + this.outer_html()
	}
}

$.fn.move_out_downwards = function(duration)
{
	return this.css({ bottom: -this.outerHeight(true) + 'px' })
}

$.fn.slide_out_downwards = function(duration, callback)
{
	if (typeof duration === 'function')
	{
		callback = duration
		duration = null
	}

	this.stop_animation()
	return this.animate
	({
		bottom: -this.outerHeight(true) + 'px'
	},
	duration,
	function()
	{
		this.hide()
		
		if (callback)
			callback()
	})
}

$.fn.shrink_upwards = function(duration, callback)
{
	if (typeof duration === 'function')
	{
		callback = duration
		duration = 0.5
	}
	
	duration *= 1000
	
	this.stop_animation()
	
	this.css('overflow', 'hidden')
	
	this.animate
	({
		height: 0
	},
	duration,
	function()
	{
		this.hide()
		
		if (callback)
			callback.bind(this)()
	})
}

$.fn.stop_animation = function()
{
	if (this.is(":animated")) 
		this.stop(true /* clear queue */, false /* don't jump to queue end */)
	return this
}

$.fn.stop_animator = function()
{
	if (this.length > 0)
		animator.stop(this)
	return this
}

$.fn.fade_in = function(duration, options, callback)
{
	if (!options)
	{
		options = {}
	}
	else if (typeof(options) === 'function')
	{
		callback = options
		options = {}
	}
	
	if (this.length < 1)
	{
		if (callback)
			return callback()
		else
			return
	}

	options.duration = duration
	options.callback = callback
	
	//animator.jquery
	animator.fade_in(this, options)
	return this
}

$.fn.fade_out = function(duration, options, callback)
{
	if (!options)
	{
		options = {}
	}
	else if (typeof(options) === 'function')
	{
		callback = options
		options = {}
	}
	
	if (this.length < 1)
	{
		if (callback)
			return callback()
		else
			return
	}

	options.duration = duration
	options.callback = callback
	
	if (typeof options.hide === 'undefined')
		options.hide = true
	
	//animator.jquery
	animator.fade_out(this, options)
	return this
}

$.fn.opaque = function()
{
	return this.css({ opacity: 1 })
}

$.fn.transparent = function()
{
	return this.css({ opacity: 0 })
}

$.fn.outer_html = function()
{
	return $('<div/>').append(this.eq(0).clone()).html()
}

$.fn.boundary_html = function()
{
	var html = $('<div/>').append(this.eq(0).clone().empty()).html()
	
	var opening = html.before('</')
	
	return { opening: opening, closing: html.substring(opening.length) }
	
	/*
	var outer_html = this.outer_html()
	var inner_html = this.html()
	
	var opening_boundary_stop = outer_html.indexOf(inner_html)
	var closing_boundary_start = opening_boundary_stop + inner_html.length
	
	return { opening: outer_html.substring(0, opening_boundary_stop), closing: outer_html.substring(closing_boundary_start) }
	*/
}

$.fn.find_parent = function(filter, boundary)
{
	var nothing = $()
	
	if (!this.exists())
		return nothing
	
	var parent = this.parents(filter).filter(':first')
	if (!parent.exists())
		return nothing
	
	if (parent.find(boundary).exists())
		return nothing
	
	//parent.node() === boundary.node() || 
	
	return parent
}

/*
$.fn.search_upwards = function(filter)
{
	if (this.is(filter))
		return this
	
	return this.find_parent(filter)
}
*/

$.fn.exists = function() { return this.length > 0 }

$.style_class_property = function(style_class, property)
{
	return $('<div/>').addClass(style_class).css(property)
}

$.fn.contains_or_is = function(element)
{
	if (element instanceof jQuery)
		element = element.node()
		
	if (this.node() === element)
		return true
	
	var children = this.children()
		
	var i = 0
	while (i < children.length)
	{
		if ($(children[i]).contains_or_is(element))
			return true
		i++
	}
	
	/*
	if ($(possible_child).parents().index(this) >= 0)
		return true
	*/
	
	return false
}

$.fn.displayed = function()
{
	return $(this).css('display') !== 'none'
}

$.fn.is_visible_on_screen = function(options)
{
	options = options || {}

	var offset = this.offset()
	var height = this.outerHeight()
	var scroll_top = $(window).scrollTop()

	if (offset.top + height < $(window).scrollTop())
		return false

	if (offset.top + (options.fully ? height : 0) > scroll_top + $(window).height())
		return false
	
	var element = document.elementFromPoint(offset.left, offset.top - scroll_top)
	if (!element || !this.contains_or_is(element))
		return false
		
	if (options.fully)
	{
		var amendment = 0
		if ($.browser.mozilla)
			amendment = 1
			
		element = document.elementFromPoint(offset.left, offset.top - scroll_top + height - 1 - amendment)
		if (!element || !this.contains_or_is(element))
			return false
	}
	
	// mb check that element.style.visibility !== 'hidden' && element.style.display !== 'none'
	
	return true
}

// jQuery customization

// finding external links

/*
(function($) 
{
	$.extend($.expr[':'], 
	{
	    external: function(element) 
		{
	        return element.hostname !== window.location.hostname && element.hostname
	    }
	})
	
	$.fn.external = function() 
	{
	    return this.filter(':external')
	}
})(jQuery)
*/

$.fn.belongs_to = function(parent)
{
	if (!parent)
		throw 'Parent is not specified'
		
	if (this[0] === parent[0])
		return true
		
	return (parent.find(this).length > 0)
}

$.fn.exists = function()
{
	return this.length > 0
}

$.fn.node = function()
{
	return this[0]
}

$.fn.transition_duration = function()
{
	var value = this.css('transition-duration') || this.css('-webkit-transition-duration') || this.css('-moz-transition-duration')
	if (!value)
		return
		
	if (value.ends_with('ms'))
		return parseFloat(value) / 1000
		
	if (value.ends_with('s'))
		return parseFloat(value)
	
	return
}

$.fn.invisible = function()
{
	return this.css({ visibility: 'hidden' })
}

$.fn.visible = function()
{
	return this.css({ visibility: 'visible' })
}

// get current time
/*
var $time = Date.now || function() 
{
	return +new Date
}
*/

// print debug info about object's contents
function object_info(object) 
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

// miscellaneous

function debug(message)
{
	alert(message)
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

$.fn.is_empty = function()
{
	// if it has no child nodes
	if (this.node().childNodes.length === 0)
		return true

	// if the only child is text, and it's empty
	if (this.node().childNodes.length === 1)
		if (Dom_tools.is_text_node(this.node().firstChild))
			return this.node().firstChild.nodeValue.trim() == ''
}

/*
$.fn.escaped_html = function()
{
	return this.text()
}
*/

$.fn.escaped_outer_html = function()
{
	return $("<div/>").text(this.outer_html()).html()
}

function validate_xml(xml)
{
	// code for Mozilla, Firefox, Opera, etc.
	if (document.implementation.createDocument)
	{
		var parser = new DOMParser()
		
		//xml = '<!DOCTYPE P [<!ENTITY nbsp "&#xA0;">]>' + '\n\n' + xml
		
		var xml_document = parser.parseFromString(xml, "text/xml")
		
		if (xml_document.getElementsByTagName("parsererror").length > 0)
		{
			var error = xml_document.getElementsByTagName("parsererror")[0]
			
			//console.log('error:')
			//console.log(error)
			
			var summary = ""
			
			function collect_xml_validation_errors(node)
			{
				if (node.nodeName == "h3")
					return
				
				if (node.nodeName == "#text")
					summary += node.nodeValue + "\n"
				
				var i = 0
				while (i < node.childNodes.length)
				{
					collect_xml_validation_errors(node.childNodes[i])
					i++
				}
			}
			
			collect_xml_validation_errors(error)
			
			throw summary.trim()
		}
		
		return xml_document
	}
}

$.validate_xml = function(xml)
{
	try
	{
		//var document = $.parseXML('<xml>' + xml + '</xml>')
		
		var document = validate_xml('<html>' + xml + '</html>')

		var text_node = Dom_tools.child_text_node(document.firstChild)
		
		if (text_node && text_node.nodeValue.trim())
			return { cause: 'text node in root', explanation: text_node.nodeValue }
			
		return document
	}
	catch (error)
	{
		return { cause: error }
	}
}

$.fn.attributes = function()
{
	var attributes = {}

	if (!this.length)
		return this

	$.each(this[0].attributes, function(index, attr)
	{
		attributes[attr.name] = attr.value
	})

	return attributes
}

$.fn.audio_player = function(action, options)
{
	switch (action)
	{
		case 'url':
			return this.find('.jouele-download').attr('href')
		
		case 'title':
			return this.find('.jouele-name').text()
		
		case 'title_element':
			return this.find('.jouele-name')
		
		case 'is_control':
			return this.find_parent('.jouele-play-control').exists()
		
		case 'link':
			var link = $('<a/>')
			link.addClass('jouele').attr('href', options.url).text(options.title)
			return link
		
		default:
			if (!this.hasClass('audio_player'))
			{
				console.log('Not an audio player:')
				console.log(this)
				throw 'Not an audio player'
			}
			
			this.jouele()
	}
}

$.fn.hidden = function()
{
	if (this.css('display') === 'none')
		return true
	
	return false
}

$.fn.editable = function()
{
	this.attr('contenteditable', true)
}

$.fn.not_editable = function()
{
	this.removeAttr('contenteditable')
}

$.fn.background_url = function()
{
	var image = this.css('background-image')
	if (image === 'none')
		return
	
	if (!image.starts_with('url('))
		return
	
	image = image.substring('url('.length, image.length - ')'.length)
	
	if (image.starts_with('"'))
		return image.substring('"'.length, image.length - '"'.length)
	
	if (image.starts_with('\''))
		return image.substring('\''.length, image.length - '\''.length)
	
	return image
}

$.fn.wrap_with = function(element)
{
	this.wrap(element)
}

$.fn.wrap_over = function(element)
{
	element.wrap(this)
}

$.xml = function(xml)
{
	var result = $($($.parseXML('<xml>' + xml + '</xml>')).find('xml')[0])
	if (result.children().length > 1)
		return result
	
	return $(result.children()[0])
}

$.fn.once_on = function(event, action)
{
	var namespace = Math.random() + '@' + new Date().getTime()
	
	var element = this
	
	if (event.indexOf('.') >= 0)
		throw 'Namespace not allowed'
	
	this.on(event + '.' + namespace, function()
	{
		element.unbind('.' + namespace)
		action()
	})
}

$.fn.insert_after = function(element)
{
	if (element instanceof HTMLElement)
		element = $(element)
	
	element.after(this)
	
	return this
}

$.fn.insert_before = function(element)
{
	if (element instanceof HTMLElement)
		element = $(element)
		
	element.before(this)
	
	return this
}

$.fn.move_by = function(how_much)
{
	this.css('left', (parseInt(this.css('left')) + how_much.left) + 'px')
	this.css('top', (parseInt(this.css('top')) + how_much.top) + 'px')
}

$.fn.move_to = function(coordinates)
{
	this.css('left', coordinates.left + 'px')
	this.css('top', coordinates.top + 'px')
}

$.fn.lies_after = function(that)
{
	var parent = this.parent().node()
	
	var this_index
	var that_index
	
	var i = 0
	while (i < parent.childNodes.length)
	{
		if (parent.childNodes[i] === this.node())
		{
			this_index = i
		}
		else if (parent.childNodes[i] === that.node())
		{
			that_index = i
		}
		
		i++
	}
	
	if (typeof that_index === 'undefined')
		throw 'The passed element doesn\'t have the same parent as this element'
	
	return this_index > that_index
}

$.fn.trim = function()
{
	this.html(this.html().trim())
}

window.event_namespaces = {}

$.unique_namespace = function()
{
	var namespace = (Math.random() + '').substring(2)
	
	if (event_namespaces[namespace])
		return $.unique_namespace()
	
	event_namespaces[namespace] = true
	
	return namespace
}

$.free_namespace = function(namespace)
{
	delete event_namespaces[namespace]
}

function cookie(name, value)
{
	$.cookie(name, value, { path: '/', expires: { toUTCString: function() { 'max-age' } }})
}

$.set_ajax_to_non_caching_mode = function()
{
	 // later you should reset $.ajax to the original.
	$.initial_ajax = $.ajax
	
	$.ajax = function(settings)
	{
		// wrap the old $.ajax so set cache to true...
		settings.cache = true
		$.initial_ajax(settings) // call old $.ajax
	}
}

$.restore_initial_ajax = function()
{
	 // reset $.ajax to the original.
	$.ajax = $.initial_ajax
	$.initial_ajax = null
}

$.compile_template = function(name, data)
{
	if ($.template[name])
		return
	
	$.template(name, data)
}

$.fn.on_event = function(event, action)
{
	var namespace = $.unique_namespace()
	var element = this
	
	element.on(event + '.' + namespace, action)
	
	var result =
	{
		cancel: function()
		{
			element.unbind('.' + namespace)
		}
	}
	
	return result
}