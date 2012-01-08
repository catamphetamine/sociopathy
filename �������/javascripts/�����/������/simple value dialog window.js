function simple_value_dialog_window(options)
{
	var element = $("#simple_value_dialog").clone()

	element.attr('id', options.id)
	element.appendTo('body')
	element.attr('title', options.title)

	var form = element.find('form').eq(0)

	options.fields.forEach(function(field, index)
	{
		field.label = $('<label/>')
		field.label.attr('for', field.id)
		field.label.text(field.description)
		field.label.appendTo(form)
		
		field.input = $('<input/>')
		field.input.addClass('field')
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
			if (options.on_open)
				options.on_open.bind(dialog_window)()
		},
		'on close': function()
		{
			if (options.on_close)
				options.on_close.bind(dialog_window)()
		}
	})
		
	var cancel = activate_button(dialog_window.$element.find('.buttons .cancel'), { 'prevent double submission': true })
	.does(function()
	{
		dialog_window.close()
	}
	.bind(dialog_window))
	
	var validating_form = new Form(form)
	
	var ok = activate_button(dialog_window.$element.find('.buttons .ok'), { 'prevent double submission': true })
	.does(function()
	{
		dialog_window.close()
		options.ok.bind(this)(options.fields[0].input.val())
	}
	.bind(dialog_window))
	.submits(validating_form)
	
	dialog_window.register_controls(validating_form, cancel, ok)
	
	dialog_window.on_enter = function()
	{
		ok.push()
	}
	
	return dialog_window
}