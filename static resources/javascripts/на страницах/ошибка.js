title('Ошибка')

page.load = function()
{
	var ошибка = получить_настройку_запроса('ошибка')
	var адрес = получить_настройку_запроса('url')

	if (адрес)
	{
		console.log(page.content)
		page.get('.url').attr('href', адрес).text(адрес)
	}
}