var навершие = $('#panel_menu')

$('<li><div class="loading"></div><span class="divider"></span></li>').appendTo(навершие)

Object.for_each(Configuration.Plugins, function(key)
{
	if (typeof this.icon === 'object')
		if (this.icon.private)
			add_top_panel_button.bind(this)(this)
})

$(document).on('authenticated', function(event, data)
{
	//if (!first_time_page_loading)
	//	return
	
	if (!data.новости)
		return
	
	if (data.новости.новости)
		Новости.новости(data.новости.новости)
		//panel.new_news({ immediate: true })
	
	if (data.новости.беседы)
		Новости.беседы(data.новости.беседы)
		//panel.new_messages({ immediate: true })
	
	if (data.новости.обсуждения)
		Новости.обсуждения(data.новости.обсуждения)
		//panel.new_discussions({ immediate: true })
		
	if (data.новости.болталка)
		Новости.болталка(data.новости.болталка)
})