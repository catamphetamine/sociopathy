var Action_in_context = new Class
({
	initialize: function(action, context)
	{
		this.action = action
		this.action._context_ = context
	},
	
	unregister: function()
	{
		delete this.action._context_
		delete this.action
	},
	
	alive: function()
	{
		if (!this.action)
			return false
		
		return true
	}
})

var Context = new Class
({
	actions: [],
	
	add: function(action)
	{
		var action_in_context = new Action_in_context(action, this)
		this.actions.add(action_in_context)
		return action_in_context
	},
	
	remove: function(action_in_context)
	{
		action_in_context.unregister()
		this.actions.remove(action_in_context)
	},
	
	destroy: function()
	{
		while (!this.actions.is_empty())
		{
			this.actions.shift().unregister()
		}
	}
})

Function.prototype.context = function(context)
{
	if (typeof context === 'function')
		return this.context(context._context_)
	
	var action = this
	
	var action_in_context = context.add(action)
	
	return function()
	{
		if (!action_in_context.alive())
			return
		
		var result = action.apply(this, arguments)
		
		context.remove(action_in_context)
	
		return result
	}
}