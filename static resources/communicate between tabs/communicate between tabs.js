var Communicate_between_tabs = function(key, on_change)
{
	this.initialize = function(key, on_change)
	{
		this.key = key
		
		this.destroy()
		
		$(window).bind('storage.' + key, function(event)
		{
			event = event.originalEvent
			
			if (event.key === key)
				on_change(JSON.parse(event.newValue))
		})
	}
	
	this.destroy = function()
	{
		$(window).unbind('storage.' + this.key)
	}
	
	this.initialize(key, on_change)
}

Communicate_between_tabs.on = function(key, action)
{
	return new Communicate_between_tabs(key, action)
}

Communicate_between_tabs.send = function(key, data)
{
	window.localStorage.setItem(key, JSON.stringify(data))
}