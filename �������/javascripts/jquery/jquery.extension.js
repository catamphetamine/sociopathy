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
			throw 'Unsupported css position: ' + this.css('position')
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
			throw 'Unsupported css position: ' + this.css('position')
	}
}

$.fn.slide_out_upwards = function(duration)
{
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
			throw 'Unsupported css position: ' + this.css('position')
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
			throw 'Unsupported css position: ' + this.css('position')
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

$.fn.stop_animation = function()
{
	if (this.is(":animated")) 
		this.stop(true /* clear queue */, false /* don't jump to queue end */)
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
	
	options.duration = duration
	options.callback = callback

	animator.jquery.fade_in(this, options)
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
	
	options.duration = duration
	options.callback = callback
	options.hide = true
	
	animator.jquery.fade_out(this, options)
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

$.fn.boundary_html = function()
{
	var outer_html = this.outer_html()
	var inner_html = this.html()
	
	var opening_boundary_stop = outer_html.indexOf(inner_html)
	var closing_boundary_start = opening_boundary_stop + inner_html.length
	
	return { opening: outer_html.substring(0, opening_boundary_stop), closing: outer_html.substring(closing_boundary_start) }
}

$.fn.find_parent = function(filter)
{
	return this.parents(filter).filter(':first')
}

$.fn.search_upwards = function(filter)
{
	if (this.is(filter))
		return this
	
	return this.find_parent(filter)
}

$.fn.exists = function() { return this.length > 0 }

$.style_class_property = function(style_class, property)
{
	return $('<div/>').addClass(style_class).css(property)
}