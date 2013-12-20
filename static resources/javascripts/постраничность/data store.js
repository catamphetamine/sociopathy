var Page_data_store = new Class
({
	query: {},
	
	modes:
	{
		обычный:
		{
			create: $.noop,
			destroy: $.noop
		}
	},
	
	режим: function(режим, settings)
	{
		Object.for_each(settings, (function(key, value)
		{
			this.modes[режим] = this.modes[режим] || {}
			this.modes[режим][key] = value
			
			if (key === 'destroy')
				this.destroy_modes_when_switching = true
		})
		.bind(this))
	},
	
	create_mode: function(mode, data)
	{
		if (!data)
		{
			data = mode
			mode = null
		}
		
		if (!mode)
			mode = Режим.текущий()
			
		if (this.modes[mode])
		{
			if (this.modes[mode].create)
				this.modes[mode].create.bind(this)(data)
				
			if (this.modes[mode].context_menus)
				this.modes[mode].context_menus()
				
			return
		}
		
		return this.modes.обычный.create.bind(this)(data)
	},
	
	destroy_mode: function(options)
	{
		var mode = options.mode
	
		if (!mode)
			mode = Режим.текущий()
			
		if (!this.modes[mode])
			mode = 'обычный'
			
		if (this.modes[mode].destroy)
			this.modes[mode].destroy.bind(this)(options)
	},

	reset_changes: function()
	{
		page.reload()
	},
	
	collect_edited: function() { return {} },
	
	draft_persistence: false,
	
	unmodified_data: {},
	
	initialize_store: function(возврат)
	{
		if (!page.save)
			return возврат()
		
		this.enabled = true
		
		var data_store = this
					
		if (this.collect_initial_data)
			this.collect_initial_data(this.unmodified_data)
			
		this.edited_data = this.unmodified_data
	
		//this.destroy_mode({})
		this.create_mode(this.unmodified_data)
		
		Режим.при_переходе({ в: 'правка' }, function(info)
		{
		})
		
		Режим.при_переходе({ из: 'правка' }, function(info)
		{
			data_store.edited_data = data_store.collect_edited()
		})
		
		Режим.при_переходе(function(info)
		{
			if (!data_store.destroy_modes_when_switching)
				return

			var scroll = $(window).scrollTop()
			data_store.destroy_mode({ mode: info.из })
			
			$(document).on_page_once('режим', function(event, режим)
			{
				data_store.create_mode(info.в, data_store.edited_data)
				прокрутчик.scroll_to(scroll)
			})
		})
		
		Режим.activate_edit_actions({ on_save: this.save_changes.bind(this),
		on_discard: function()
		{
			data_store.edited_data = data_store.unmodified_data
			
			if (!Режим.правка_ли())
			{
				data_store.destroy_mode({})
				data_store.create_mode(data_store.unmodified_data)
			}
				
			data_store.reset_changes()
			
			if (page.discard)
				page.discard()
		}})
		
		$(document).on_page('режим_изменения_сохранены', function()
		{
			data_store.unmodified_data = data_store.edited_data
		})
		
		if (this.draft_persistence)
			this.load_draft(function(черновик)
			{
				if (черновик)
				{
					data_store.edited_data = черновик
					//data_store.populate_draft(черновик)
					Режим.правка()
				}
					
				return возврат()
			})
		else
			return возврат()
	},
	
	save_changes: function()
	{
		if (Режим.правка_ли())
			this.edited_data = this.collect_edited()
		
		page.unsaved_changes = false
	
		page.save(this.edited_data)
	},
	
	new_data_loaded: function(updater)
	{
		updater(this.unmodified_data)
		
		if (this.edited_data)
			updater(this.edited_data)
	},
	
	load_draft: function(возврат)
	{
		var data_store = this
		
		if (!this.что)
			return возврат()
		
		page.Ajax.get('/сеть/черновик', Object.x_over_y(data_store.query, { что: this.что }))
		.ok(function(data)
		{
			возврат(data.черновик)
		})
		.ошибка(function()
		{
			error('Не удалось проверить черновик')
			возврат()
		})
	},
	
	save_draft: function(возврат)
	{
		var data_store = this
		
		if (!this.что)
			return возврат()
		
		page.Ajax.put('/сеть/черновик', Object.x_over_y(data_store.query, { что: this.что }))
		.ok(function(data)
		{
			возврат()
		})
		.ошибка(function()
		{
			error('Не удалось сохранить черновик')
			возврат()
		})
	}
})