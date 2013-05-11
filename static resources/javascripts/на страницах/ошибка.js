title('Ошибка')

page.needs_to_load_content = false
	
page.load = function()
{
	var ошибка = получить_настройку_запроса('ошибка')
	var адрес = получить_настройку_запроса('url')

	if (адрес)
	{
		page.get('.url').attr('href', адрес).text(адрес)
	}
}