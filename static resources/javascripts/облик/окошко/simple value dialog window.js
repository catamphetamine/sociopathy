function simple_value_dialog_window(options)
{
	var element = $("#simple_value_dialog").clone()

	element.removeAttr('id')
	element.attr('id', options.id)
	
	if (options['class'])
		element.addClass(options['class'])
	
	/*
	if (options.id)
		element.attr('id', options.id)
	else
		element.removeAttr('id', options.id)
	*/
		
	element.appendTo('body')
	element.attr('title', options.title)

	var form = element.find('form').eq(0)
	
	if (options.icon === false)
		element.find('> .main_content > .icon').remove()

	var fields = {}
		
	options.fields.forEach(function(field_info, index)
	{
		var field = {}
		Object.for_each(field_info, function(key, value)
		{
			field[key] = value
		})
		
		if (field.description)
		{
			field.label = $('<label/>')
			field.label.attr('for', field.id)
			field.label.text(field.description)
			field.label.appendTo(form)
			
			if (field['in-place label'])
				field.label.addClass('in-place_input_label')
		}
		
		field.append_input = true
			
		if (field.multiline)
		{
			field.input = $('<textarea/>')
			field.input.addClass('multiline')
		}
		else if (field.choice)
		{
			field.input = $('<input/>')
			field.input.attr('type', 'hidden')
		}
		else if (field.autocomplete)
		{
			var autocomplete = $('<div/>')
			field.autocomplete = autocomplete.autocomplete(field.autocomplete)
			autocomplete.appendTo(form)
			
			field.input = autocomplete.find('> input[type="hidden"]')
			field.append_input = false
		}
		else
		{
			field.input = $('<input/>')
			field.input.attr('type', 'text')
			field.input.addClass('field')
		}
	
		field.input.attr('name', field.id)
		
		if (field.append_input)
			field.input.appendTo(form)

		if (field.validation)
			field.input.attr('validation', field.validation)
			
		if (field.postprocess)
			field.postprocess(field.input, form)
			
		fields[field.id] = field
	})
	
	var dialog_window = element.dialog_window
	({
		'close on escape': true,
		'on open': function()
		{
			Object.for_each(fields, function(id, field)
			{
				if (field.label)
					if (field.label.hasClass('in-place_input_label'))
						field.label.css({ 'z-index': 0, opacity: 1 })
			})
					
			if (options.on_open)
				options.on_open.bind(dialog_window)()
		},
		'on close': function()
		{
			Object.for_each(fields, function(id, field)
			{
				field.input.val('')
				
				if (field.autocomplete)
					field.autocomplete.reset()
			})
		},
		'on cancel': function()
		{
			if (options.on_cancel)
				options.on_cancel.bind(dialog_window)()
		},
		maximized: options.maximized
	})
		
	if (options.ok_button_text)
	{
		var label = dialog_window.content.find('.buttons .ok label')
	
		if (typeof options.ok_button_text === 'string')
		{
			label.text(options.ok_button_text)
		}
		else if (typeof options.ok_button_text === 'object')
		{
			var parent = label.parent()
			label.remove()
			
			Object.each(options.ok_button_text, function(text, style_class)
			{
				$('<label/>').addClass(style_class).text(text).appendTo(parent)
			})
		}
	}
	
	var old_cancel = dialog_window.cancel.bind(dialog_window)
	dialog_window.cancel = function(callback)
	{
		old_cancel(function()
		{
			if (options.when_closed)
				options.when_closed.bind(dialog_window)()
				
			if (callback)
				callback()
		})
	}

	var cancel = text_button.new(dialog_window.content.find('.buttons .cancel'), { 'prevent double submission': true, physics: 'fast' })
	.does(dialog_window.cancel)
	
	var validating_form = new Form(form)
	
	var index = 0
	Object.for_each(fields, function(id, field)
	{
		if (field.setter)
			validating_form.inputs[index].setter = field.setter
			
		index++
	})
	
	var ok = text_button.new(dialog_window.content.find('.buttons .ok'), { 'prevent double submission': true })
	.does(function()
	{
		var data
		
		if (Object.getLength(fields) > 1)
		{
			data = {}
			Object.for_each(fields, function(id, field)
			{
				data[field.id] = field.input.val()
			})
		}
		else
			data = Object.value(fields).input.val()

		var close = function(error, callback)
		{
			if (typeof error === 'function')
			{
				callback = error
				error = null
			}
			
			if (error)
				return ok.allow_to_redo()
			
			dialog_window.close((function()
			{
				if (options.when_closed)
					options.when_closed.bind(this)()
					
				if (callback)
					callback()
			})
			.bind(this))
		}
		
		var result = options.ok.bind(this)(data, close)

		if (result !== 'wait')
			close()
	}
	.bind(dialog_window))
	.submits(validating_form, options.before_ok ? options.before_ok.bind(dialog_window) : null)
	
	if (options.no_ok_button)
	{
		button.physics.immediate(ok)
		ok.hide()
	}
	
	dialog_window.register_controls(validating_form, cancel, ok)
	
	var submit_on_enter = true
	Object.for_each(fields, function(id, field)
	{
		if (field.multiline)
			submit_on_enter = false
	})
	
	if (submit_on_enter)
	{
		dialog_window.on_enter = function()
		{
			ok.push()
		}
	}
	else
	{
		dialog_window.on_ctrl_enter = function()
		{
			ok.push()
		}
	}
	
	var result =
	{
		window: dialog_window,
		ok: function() { ok.push() },
		fields: fields
	}
	
	return result
}