# Since generating markup is processor intensive, it should not be done in node.js
# It should be moved to the scala application, for example
# The code below is a temporary solution

jsdom = require('jsdom').jsdom

scripts = ['mootools/core', 'язык', 'dom tools', 'markup/markup', 'markup/markup syntax', 'markup/markup html syntax', 'youtube', 'vimeo']

scripts = scripts.map((path) -> global.disk_tools.read(client_code_path(path)))

# adds element.classList property
scripts.add(disk_tools.read(__dirname + '/../tools/jsdom/class list.js'))

styles = ['начертания', 'общее', 'markup/markup formatting', 'markup/mobile markup formatting', '../plugins/Library/styles/mobile/заметка']
styles = styles.map((style) -> read_css(style))

options =
	html: '<html><body></body></html>'
	src: scripts
	done: (errors, window) ->
		if errors?
			for error in errors
				console.error(error.message)
				if error.data? && error.data.exception?
					console.error(error.data.exception)	
			return
		
		http.get '/читальня/заметка/разметка', (ввод, вывод) ->
			#markup = '<paragraph>Материальная точка — объект, не имеющий размеров, но обладающий всеми остальными свойствами (массой, зарядом и т.п.).</paragraph><paragraph>Используется в физике <formula display="в строке">(physics)</formula> в качестве <code>упрощённой модели</code> относительно малого объекта (относительно малого в рамках задачи). Например, при расчёте пути, пройденного поездом из Петрограда во Владивосток, можно пренебречь его очертаниями и размерами, поскольку они гораздо меньше протяжённости пути.</paragraph><citation><text>Война - это путь обмана. Поэтому, даже если [ты] способен, показывай противнику свою неспособность. Когда должен ввести в бой свои силы, притворись бездеятельным. Когда [цель] близко, показывай, будто она далеко; когда же она действительн далеко, создавай впечатление, что она близко</text><author>Cунь Цзы, «Искусство Войны»</author></citation><paragraph>Вставим-ка сюда картинку: <picture>http://cdn1.iconfinder.com/data/icons/49handdrawing/128x128/picture.png</picture>, вот так.</paragraph><paragraph><youtube>quYfLkJMN1g</youtube></paragraph><paragraph><vimeo>47387431</vimeo></paragraph><paragraph>Однако <bold>не всегда</bold> можно <italic>пользоваться</italic> материальными<superscript>1</superscript> точками<subscript>2</subscript> для решения задач. Например, при расчёте распределения энергии молекул в <hyperlink at="/%D1%87%D0%B8%D1%82%D0%B0%D0%BB%D1%8C%D0%BD%D1%8F/%D1%85%D0%B8%D0%BC%D0%B8%D1%8F/%D0%B8%D0%BD%D0%B5%D1%80%D1%82%D0%BD%D1%8B%D0%B9%20%D0%B3%D0%B0%D0%B7">инертном газе</hyperlink> можно представить молекулы материальными точками (шариками). Однако для других веществ начинает иметь значение строение молекулы, так как </paragraph><multiline_code>колебание и вращение</multiline_code> самой молекулы начинают запасать в себе значительную энергию.<paragraph></paragraph><header_2>Ссылки</header_2><list><item><hyperlink at="http://ru.wikipedia.org/wiki/%D0%9C%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%B0%D0%BB%D1%8C%D0%BD%D0%B0%D1%8F_%D1%82%D0%BE%D1%87%D0%BA%D0%B0">WikiPedia</hyperlink></item><item><hyperlink at="http://phys.msu.ru/">ФизФак МГУ</hyperlink></item></list>'
			
			_id = db('library_articles').id(ввод.данные._id)
		
			заметка = db('library_articles').get(_id)
					
			if not заметка?
				throw "Заметка не найдена"
			
			markup = заметка.содержимое
			
			syntax = ввод.данные.разметка
			device = ввод.headers['mobile-device']
			
			switch syntax
				when 'html'
					window.device = device
					markup = window.Markup.decorate(markup, { syntax: 'html' })
					#window.close()
					
					html = '<html><head><style>' + styles.join('\n') + '</style></head><body class="markup ' + device + '">' + markup + '</body></html>' 
					
					вывод.set('Content-Type', 'text/html')
					вывод.send(html)
					
				else
					throw "Unknown markup type: #{syntax}"
			
jsdom.env(options)