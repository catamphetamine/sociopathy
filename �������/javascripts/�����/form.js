var Validation = {}

function Form(element)
{
	this.element = element
	
	this.validate = function()
	{
		if (this.input)
			this.input.validate()
	}
	
	this.reset = function()
	{
		if (this.input)
			this.input.reset()
	}
	
	var input = element.find('input').eq(0)
	if (input.attr('validation'))
		this.input = new (function(element, form)
		{
			this.element = element
		
			this.label = form.element.find('label[for=' + this.element.attr('name') + ']')
			
			this.reset = function()
			{
				// if there is any error message - hide it
				if (this.error_label)
					this.error_label.slide_out()
			}
			
			this.validate = function()
			{
				try
				{
					eval('var validation = Validation.' + this.element.attr('validation'))
					validation(this.element.val())
					// mark field as valid
					this.valid()
				}
				// if there were any errors
				catch (error)
				{
					// if that's not our custom error - throw it further
					if (!(error instanceof custom_error))
						throw error
		
					// if that's our custom error - focus on the field and display the error message
					this.element.focus()
					this.error(error)
					
					error.is_form_validation = true
					throw error
				}
			}
			
			// mark the field as valid
			this.valid = function()
			{
				if (this.error_label)
					this.error_label.slide_out(1000)
			}
			
			// if this field has an error
			this.error = function(error)
			{
				// prepare the error label
				this.label.attr("error", new String(error.message).escape_html())
	
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
					   'on appear': this.label.glow,
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
		(input, this)
}