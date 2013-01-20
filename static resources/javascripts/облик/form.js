function Form(element)
{
	this.element = element
	this.inputs = []
	
	this.validate = function(ok, error, index)
	{
		error = error || $.noop
		
		var i = 0
		if (index)
			i = index
			
		var this_function = this.validate.bind(this)
			
		if (i < this.inputs.length)
		{
			this.inputs[i].validate(function()
			{
				this_function(ok, error, i + 1)
			},
			function(error_thrown)
			{
				error(error_thrown)
			})
		}
		else
			ok()
	}
	
	this.reset = function()
	{
		this.inputs.forEach(function(input)
		{
			input.reset()
		})
	}
	
	var form = this
	
	element.find('input,select,textarea').each(function()
	{
		var input = $(this)
		var the_input = input
		
		var the_form = form
			
		form.inputs.push(new (function(element, form)
		{
			this.element = element
			this.name = this.element.attr('name')
		
			this.label = form.element.find('label[for=' + this.name + ']')
			
			var input = this
			
			if (this.label.exists())
			{
				if (this.label.hasClass('in-place_input_label'))
				{
					this.label.on('click', function(event)
					{
						input.element.focus()
					})
					
					function hide_label()
					{
						input.label.css({ opacity: 0, 'z-index': -1 })
					}
					
					this.element.on('keypress', function(event)
					{
						if (event.ctrlKey || event.metaKey || event.altKey)
							return
							
						hide_label()
					})
					
					this.element.on('paste', function(event)
					{
						hide_label()
					})
					
					this.element.on('blur', function(event)
					{
						if (!$(this).val())
							input.label.css({ opacity: 1, 'z-index': 0 })
					})
				}
			}
			
			this.reset = function()
			{
				// if there is any error message - hide it
				if (this.error_label)
					this.error_label.slide_out()
					
				this.element.val('')
			}
			
			var form_element = this
			
			this.validate = function(ok_callback, error_callback)
			{
				if (!the_input.attr('validation'))
					return ok_callback()
				
				eval('var validation = Validation.' + element.attr('validation'))
				validation.bind(the_form)(element.val(), function(result)
				{
					if (result && result.error)
					{
						form_element.element.focus()
					
						form_element.error(result.error, input, result)
						
						error.is_form_validation = true
						
						return error_callback(result.error)
					}
					
					if (result)
						element.val(result)
					
					// mark field as valid
					form_element.valid()
					ok_callback()
				})
			}
			
			// mark the field as valid
			this.valid = function()
			{
				if (this.error_label)
					this.error_label.slide_out()
			}
			
			this.error_message = function(text)
			{
				error(text)
			}
			
			// if this field has an error
			this.error = function(message, input, options)
			{
				options = options || {}
				
				if (options.bubble)
				{
					this.valid()
					
					return error(message)
				}
				
				if (!this.label.exists())
					return this.error_message(message)
				
				if (this.label.hasClass('in-place_input_label'))
					return this.error_message(message)
			
				// prepare the error label
				this.label.attr("error", new String(message).escape_html())
			
				// if the error label hasn't been created - create it
				if (!this.error_label)
				{
					this.error_label = this.label.slide_label
					({
					   attribute: "error",
					   tweenInFrom: "bottom",
					   wrapLength: "auto",
					   styles: ['error'],
					   hover: false,
					   //'on appear': this.label.glow,
					   "indention style name": "glowable"
					})
					
					// and show it
					this.error_label.slide_in()
				}
				// else - refresh the label
				else
				{
					this.error_label.refresh()
					
					// and show it again, if it's hidden
					if (this.error_label.hidden())
						this.error_label.slide_in()
				}
			}
		})
		(input, form))
	})
	
	this.field = function(name)
	{
		var i = 0
		while (i < this.inputs.length)
		{
			if (this.inputs[i].name === name)
				return this.inputs[i].element
				
			i++
		}
	}
	
	this.field_setter = function(name)
	{
		var i = 0
		while (i < this.inputs.length)
		{
			if (this.inputs[i].name === name)
				return this.inputs[i].setter
				
			i++
		}
	}
}