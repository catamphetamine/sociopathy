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

	options.fields.forEach(function(field, index)
	{
		if (field.description)
		{
			field.label = $('<label/>')
			field.label.attr('for', field.id)
			field.label.html(field.description)
			field.label.appendTo(form)
			
			if (field['in-place label'])
				field.label.addClass('in-place_input_label')
		}
		
		if (field.multiline)
		{
			field.input = $('<textarea/>')
			field.input.addClass('multiline')
		}
		else
		{
			field.input = $('<input/>')
			field.input.addClass('field')
		}
	
		field.input.attr('type', 'text')
		field.input.attr('name', field.id)
		field.input.appendTo(form)

		if (field.validation)
			field.input.attr('validation', field.validation)
	})
	
	var dialog_window = element.dialog_window
	({
		'close on escape': true,
		'on open': function()
		{
			options.fields.forEach(function(field, index)
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
			options.fields.forEach(function(field, index)
			{
				field.input.val('')
			})
		},
		'on cancel': function()
		{
			if (options.on_cancel)
				options.on_cancel.bind(dialog_window)()
		}
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
	
	var cancel = text_button.new(dialog_window.content.find('.buttons .cancel'), { 'prevent double submission': true, physics: 'fast' })
	.does(function()
	{
		dialog_window.cancel()
	}
	.bind(dialog_window))
	
	var validating_form = new Form(form)
	
	var ok = text_button.new(dialog_window.content.find('.buttons .ok'), { 'prevent double submission': true })
	.does(function()
	{
		dialog_window.close()
		
		var data
		
		if (options.fields.length > 1)
		{
			data = {}
			options.fields.forEach(function(field)
			{
				data[field.id] = field.input.val()
			})
		}
		else
			data = options.fields[0].input.val()
			
		options.ok.bind(this)(data)
	}
	.bind(dialog_window))
	.submits(validating_form)
	
	dialog_window.register_controls(validating_form, cancel, ok)
	
	var submit_on_enter = true
	options.fields.forEach(function(field, index)
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
		window: dialog_window
	}
	
	return result
}