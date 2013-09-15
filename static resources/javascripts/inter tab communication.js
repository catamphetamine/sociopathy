var Inter_tab_communication = new Class
({
	namespace: 'cross_tab_communication_' + $.unique_namespace(),
	
	initialize: function(key, on_change)
	{
		$(window).bind('storage.' + this.namespace, function(event)
		{
			event = event.originalEvent
			
			if (event.key === key)
				on_change(JSON.parse(event.newValue))
		})
	},
	
	destroy: function()
	{
		$(window).unbind('storage.' + this.namespace)
	}
})

Inter_tab_communication.on = function(key, action)
{
	return new Inter_tab_communication(key, action)
}

Inter_tab_communication.send = function(key, data)
{
	data = data || {}
	
	window.localStorage.setItem(key, JSON.stringify(data))
}