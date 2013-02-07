title('Только для своих')

page.needs_initializing = false
	
page.load = function()
{
	var адрес = получить_настройку_запроса('url')

	if (адрес)
	{
		page.get('.url').attr('href', адрес).text(адрес)
		page.data.go_to_after_login = адрес
	}
	
	page.get('.autocomplete').autocomplete()
}