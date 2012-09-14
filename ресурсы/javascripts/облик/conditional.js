function initialize_conditional($this, options)
{
	options = options || {}

	var conditional

	var fade_in_duration = 0.2
	var fade_out_duration = 0.2
	
	if (options.immediate)
	{
		fade_in_duration = 0
		fade_out_duration = 0
	}
	
	var every = $this.children()

	var ok = $this.find('[type=ok]').eq(0)
	
	var error = $this.find('[type=error]').eq(0)
	error.attr('default_message', error.text())
	error.hide()

	var loading = $this.find('[type=loading]').eq(0)
	var loading_more = $this.find('[type=loading_more]').eq(0)
	
	var loading_more_error = $this.find('[type=loading_more_error]').eq(0)

	if (loading_more_error.length === 0)
		loading_more_error = error
	else
		loading_more_error.attr('default_message', loading_more_error.text())
	
	loading.addClass('non_selectable')	
	error.addClass('non_selectable')
	
	loading_more.addClass('non_selectable')	
	loading_more_error.addClass('non_selectable')
	
	loading_more.hide().css('opacity', 0)
	loading_more_error.hide().css('opacity', 0)
	
	var tries = $this.attr('tries') || 1
	
	var callback = function(error, callback)
	{
		if (error)
			return on_error(error, callback)
			
		on_ok(callback)
	}
	
	var hide_every = function()
	{
		every.each(function()
		{
			$(this).hide()
		})
	}
	
	hide_every()
	$this.show()
	loading.fade_in(fade_in_duration)
	
	var switch_elements = function(from, to, callback, options)
	{
		if (options)
		{
			if (options.immediate)
			{
				from.css('opacity', 0).hide()
				to.css('opacity', 1).show()
				return callback()
			}
		}
	
		if (from.exists())
		{
			from.fade_out(fade_out_duration, function()
			{
				to.fade_in(fade_in_duration, callback)
			})
		}
		else
		{
			to.fade_in(fade_in_duration, callback)
		}
	}
	
	var on_ok = function(callback)
	{
		if (conditional.state !== 'loading')
		{
			loading = loading_more
		}
		
		switch_elements(loading, ok, function()
		{
			conditional.state = 'loaded'
			
			if (callback)
				callback()
		},
		{ immediate: true })
	}
	
	var on_error_actions = []
	
	var error_counter = 0
	var on_error = function(message, on_error_callback)
	{
		error_counter++
		
		if (error_counter < tries)
			return action(callback)
				
		if (conditional.state !== 'loading')
		{
			error = loading_more_error
			loading = loading_more
		}
		
		if (message && message != 'Произошла ошибка на сервере')
			//message = error.attr('default_message')
			error.empty().append(ошибка_на_экране(message))
		
		switch_elements(loading, error, function()
		{
			conditional.state = 'error'
			
			on_error_actions.for_each(function()
			{
				this()
			})
			
			if (on_error_callback)
				on_error_callback()
		})
	}
	
	var loading_more_function = function()
	{
		conditional.state = 'loading more'
		loading_more.fade_in(fade_in_duration)
	}
	
	conditional =
	{
		callback: callback,
		state: 'loading',
		loading_more: loading_more_function,
		on_error: function(action)
		{
			on_error_actions.push(action)
		}
	}
	
	return conditional
}