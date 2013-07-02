var навершие = $('#panel_menu')

Object.for_each(Configuration.Plugins, function(key)
{
	if (typeof this.icon === 'object')
		if (this.icon.private)
			add_top_panel_button.bind(this)(this)
})