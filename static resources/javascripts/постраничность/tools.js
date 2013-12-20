Page.implement
({
	get: function(selector)
	{
		return this.content.find(selector)
	},
	
	query: function(selector, variable)
	{
		this.queries.push({ variable: variable, selector: selector })
	},
	
	context_menu: function(element, options)
	{
		var menu = new Context_menu(element, options)
		this.context_menus.add(menu)
		return menu
	},
	
	dialog_window: function(element, options)
	{
		var window = element.dialog_window(options)
		this.dialog_windows.add(window)
		return window
	},
	
	register_dialog_window: function(dialog_window)
	{
		this.dialog_windows.add(dialog_window)
	},
	
	watched_elements: [],
	
	watch: function(element)
	{
		if (element instanceof jQuery)
			element = element.node()
	
		if (this.watched_elements.has(element))
			return
		
		this.watched_elements.add(element)
		
		прокрутчик.watch(element)
	},
	
	unwatch: function(element)
	{
		if (element instanceof jQuery)
			element = element.node()
	
		this.watched_elements.remove(element)
		
		прокрутчик.unwatch(element)
	},
	
	on: function(element, event, action, options)
	{
		if (typeof element === 'string')
		{
			options = action
			action = event
			event = element
			
			element = $(document)
		}
		
		options = options || {}
		
		var namespace
		
		if (!event.contains('.'))
		{
			namespace = 'page_' + this.id + '_' + $.unique_namespace()
			event += '.' + namespace
		}
		
		var info = { element: element, event: event, options: options }
			
		this.event_handlers.add(info)
		element.on(event, action)
		
		return (function()
		{
			if (!this.event_handlers.has(info))
				return
				
			this.event_handlers.remove(info)
			
			element.unbind(event)
			
			if (namespace)
				$.free_namespace(namespace)
		})
		.bind(this)
	},
	
	ticking: function(action, interval)
	{
		if (this.ticking_actions.has(action))
			return console.log('action already ticking')
		
		this.ticking_actions.push(action.ticking(interval))
	},
	
	track: function(key, value, collector)
	{
		this.tracked[key] = value
		
		this.tracked_collectors[key] = collector
		
		/*
		if (!this.tracked[key])
			this.tracked[key] = []
			
		if (value instanceof Array)
		{
			value.for_each(function(this)
			{
				this.tracked[key].push(value)
			})
		}
		else
			this.tracked[key].push(value)
		*/
	},
	
	пользователь_в_сети: function(пользователь)
	{
	},
	
	пользователь_вышел: function(пользователь)
	{
	},
	
	по_нажатию: function(действие)
	{
		var id = Клавиши.по_нажатию(действие)
		this.по_нажатию_ids.push(id)
		return id
	},
	
	убрать_по_нажатию: function(id)
	{
		this.по_нажатию_ids.remove(id)
		Клавиши.убрать_по_нажатию(id)
	},
	
	очередь_подсказок: [],
	
	показывать_подсказки: true,
	
	показать_следующую_подсказку: function()
	{
		if (!this.показывать_подсказки)
			return
		
		if (this.показанная_подсказка)
			return
		
		if (this.очередь_подсказок.is_empty())
			return
		
		var подсказка = this.очередь_подсказок.shift()
		
		this.показанная_подсказка = подсказка
		
		var страница = this
		
		function next()
		{
			страница.показанная_подсказка = null
			страница.показать_следующую_подсказку()
		}
		
		var result = Подсказка(подсказка.id, подсказка.text, { on_vanish: next })
		
		if (!result)
			next()
	},
	
	подсказка: function(id, text)
	{
		if (!this.очередь_подсказок.filter(function(подсказка) { return подсказка.id === id }).is_empty())
			return
	
		this.очередь_подсказок.add({ id: id, text: text })
		this.показать_следующую_подсказку()
	}
})

$.fn.on_page = function(event, action, options)
{
	if (!page)
		throw 'Page hasn\'t been initialized yet'
	
	return page.on(this, event, action, options)
}

$.fn.on_page_once = function(event, action, options)
{
	var cancel
	
	var new_action = function(event, data)
	{
		action(event, data)
		cancel()
	}
	
	cancel = this.on_page(event, new_action, options)
}