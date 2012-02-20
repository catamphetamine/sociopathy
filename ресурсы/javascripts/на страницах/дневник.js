var blog

Подсказки.подсказка('Здесь вы можете почитать дневник этого человека.')

function initialize_page()
{
	blog = $('#blog')

	new Data_templater
	({
		template_url: '/страницы/кусочки/записи дневника.html',
		item_container: blog,
		conditional: $('#blog_block[type=conditional]'),
		done: blog_loaded
	},
	new  Data_loader
	({
		url: '/приложение/дневник',
		parameters: { адресное_имя: window.адресное_имя },
		get_data: function (data) { дневник = data; return data }
	}))
}

function blog_loaded()
{
}