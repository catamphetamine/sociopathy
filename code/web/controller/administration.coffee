проверить_управляющего = (ввод, возврат) ->
	new Цепочка(возврат)
		.сделать ->	
			пользовательское.пользователь(ввод, @)
		.сделать (пользователь) ->
			if not пользователь.полномочия || not пользователь.полномочия.has('управляющий')
				return @.error('Вы не Главный Управляющий')
			@.done()

проверить_полномочия = (какие, пользователь) ->
	if not есть_ли_полномочия(какие, пользователь)
		throw "Недостаточно полномочий: " + какие
	
есть_ли_полномочия = (какие, пользователь) ->
	if not пользователь.полномочия?
		return false

	if пользователь.полномочия.has('управляющий')
		return true

	if пользователь.полномочия.has(какие)
		return true
	
	return false
	
http.post '/управление/приглашение/выдать', (ввод, вывод, пользователь) ->
	цепь(вывод)
		.сделать ->
			проверить_полномочия('приглашения', пользователь)
			@.done(пользовательское.приглашение())
			
		.сделать (ключ) ->
			db('invites').save({ ключ: ключ, пользователь: пользователь._id }, @)
			
		.сделать (приглашение) ->
			вывод.send(приглашение)

http.post '/управление/хранилище/изменить', (ввод, вывод, пользователь) ->
	проверить_полномочия('управляющий', пользователь)
	
	человек = null
	второй_человек = null
	
	беседа = null
	обсуждение = null
	
	цепь(вывод)
		.сделать ->
			проверить_управляющего(ввод, @)
	
		.сделать ->	
			db('people').findOne({}, @)
			
		.сделать (man) ->	
			человек = man
			@.done()
	
		.сделать ->	
			db('people').findOne({ имя: 'Анна Каренина' }, @)
	
		.сделать (man) ->	
			второй_человек = man
			@.done()
				


			
		.сделать ->
			db('people').find({}).toArray(@)
			
		.все_вместе (человек) ->
			#db('people_sessions').update({ пользователь: человек._id }, { $set: { новости: { беседы: {}, обсуждения: {}, новости: [] } } }, @)
			db('people_sessions').update({ пользователь: человек._id }, { $set: { последние_прочитанные_сообщения: {} }  }, @)
			
			


		.сделать ->
			вывод.send {}

http.post '/управление/хранилище/создать_пользователей', (ввод, вывод, пользователь) ->
	проверить_полномочия('управляющий', пользователь)
	
	цепь(вывод)
		.сделать ->
			проверить_управляющего(ввод, @)
		.сделать ->
			люди = []
			
			люди.push
				имя: 'Василий Иванович'
				'адресное имя': 'Василий Иванович'
				описание: 'слесарь'
				пол: 'мужской'
				откуда: 'Кемерово'
				пароль: '123'
				почта: '01@ivanov.com'
				'когда пришёл': new Date()
				'время рождения': '22.01.1955'
				характер: 'спокойный'
				убеждения: 'утопист'
				'семейное положение': 'заядлый бабник'
							
			люди.push
				имя: 'Анна Каренина'
				'адресное имя': 'Анна Каренина'
				описание: 'домохозяйка'
				пол: 'женский'
				откуда: 'Российская Империя'
				пароль: '123'
				почта: '011@ivanov.com'
				'когда пришёл': new Date()
				'время рождения': '21.04.1855'
				характер: 'любвеобильный'
				убеждения: 'романтика'
				'семейное положение': 'неразделённая любовь'
				
			люди.push
				имя: 'Джонни Депп'
				'адресное имя': 'Джонни Депп'
				описание: 'пират'
				пол: 'мужской'
				откуда: 'Штаты'
				пароль: '123'
				почта: '02@ivanov.com'
				'когда пришёл': new Date()
				'время рождения': '11.06.1970'
				характер: 'любитель острых ощущений'
				убеждения: 'монархические'
				'семейное положение': 'есть подруга'
				
			люди.push
				имя: 'Владимир Владимирович Путин'
				'адресное имя': 'Владимир Владимирович Путин'
				описание: 'президент'
				пол: 'мужской'
				откуда: 'Горки'
				пароль: '123'
				почта: '03@ivanov.com'
				'когда пришёл': new Date()
				'время рождения': '16.01.1960'
				характер: 'волевой'
				убеждения: 'авторитаризм'
				'семейное положение': 'женат'
				
			люди.push
				имя: 'Дедушка Мороз'
				'адресное имя': 'Дедушка Мороз'
				описание: 'красный нос'
				пол: 'мужской'
				откуда: 'Великий Устюг'
				пароль: '123'
				почта: '04@ivanov.com'
				'когда пришёл': new Date()
				'время рождения': '13.02.1933'
				характер: 'оптимист'
				убеждения: 'самодержавничество'
				'семейное положение': 'гей'
				
			люди.push
				имя: 'Petya Palkin'
				'адресное имя': 'Petya Palkin'
				описание: 'раздолбай'
				пол: 'мужской'
				откуда: 'От верблюда'
				пароль: '123'
				почта: '05@ivanov.com'
				'когда пришёл': new Date()
				'время рождения': '15.06.1988'
				характер: 'маниакально-депрессивный'
				убеждения: 'анархист'
				'семейное положение': 'в поиске пары'
			
			for i in [1..18]
				человек = 
					имя: 'Иванов Иван ' + i
					'адресное имя': 'Иванов Иван ' + i
					описание: 'заведующий'
					пол: 'мужской'
					откуда: 'Москва'
					пароль: '123'
					почта: 'ivan' + i + '@ivanov.com'
					'когда пришёл': new Date()
					'время рождения': '12.09.1990'
					вера: 'христианин'
					убеждения: 'социалист' 
					'семейное положение': 'разведён'
					
				люди.unshift человек
			@ null, люди
		
		.все_вместе (человек) ->
			пользовательское.создать(человек, @)
			
		.сделать ->	
			db('people').find({}).toArray @

		.все_вместе (пользователь) ->	
			db('people_private_keys').save { пользователь: пользователь._id, 'тайный ключ': пользователь._id + new Date().getTime() }, @
			
		.сделать ->
			db('people').выбрать { с: 1, сколько: 2 }, @

		.делать (два_человека) ->
			db('chat').save { отправитель: два_человека[0]._id, сообщение: 'Ицхак (Ицик) Виттенберг родился в Вильно в 1907 году в семье рабочего. Был членом подпольной коммунистической партии в Литве, после присоединения Литвы к СССР руководил профсоюзом. После оккупации Литвы немецкими войсками перешёл на нелегальное положение.', когда: new Date() }, @
				
		.делать (два_человека) ->
			db('chat').save { отправитель: два_человека[0]._id, сообщение: 'Dickinsonia (рус. дикинсония) — одно из наиболее характерных ископаемых животных эдиакарской (вендской) биоты. Как правило, представляет собой двусторонне-симметричное рифлёное овальное тело. Родственные связи организма в настоящее время неизвестны. Большинство исследователей относят дикинсоний к животным, однако существуют мнения, что они являются грибами или относятся к особому не существующему ныне царству живой природы.', когда: new Date() }, @
				
		.делать (два_человека) ->
			db('chat').save { отправитель: два_человека[1]._id, сообщение: 'Овинище — Весьегонск — тупиковая однопутная 42-километровая железнодорожная линия, относящаяся к Октябрьской железной дороге, проходящая по территории Весьегонского района Тверской области (Россия) от путевого поста Овинище II, расположенного на железнодорожной линии Москва — Сонково — Мга — Санкт-Петербург (которая на разных участках называется Савёловским радиусом и Мологским ходом), до тупиковой станции Весьегонск и обеспечивающая связь расположенного на северо-восточной окраине Тверской области города Весьегонска с железнодорожной сетью страны.', когда: new Date() }, @

		.сделать ->
			db('people').find({ имя: { $in: {'Василий Иванович', 'Анна Каренина'}} }).toArray @

		.сделать (два_человека) ->
			сообщения = []
			строки =
			[
				"Меж тем Онегина явленье "
				"У Лариных произвело "
				"На всех большое впечатленье "
				"И всех соседей развлекло. "
				"Пошла догадка за догадкой. "
				"Все стали толковать украдкой, "
				"Шутить, судить не без греха, "
				"Татьяне прочить жениха; "
				"Иные даже утверждали, "
				"Что свадьба слажена совсем, "
				"Но остановлена затем, "
				"Что модных колец не достали. "
				"O свадьбе Ленского давно "
				"У них уж было решено."
				"Татьяна слушала с досадой"
				"Такие сплетни; но тайком"
			]
			
			for i in [1..16]
				сообщение = 
					отправитель: два_человека[i % 2]._id
					сообщение: строки[i - 1]
					когда: new Date()
					
				сообщения.push сообщение
			@ null, сообщения
		
		.все_вместе (сообщение) ->
			db('chat').save сообщение, @
			
		.сделать ->
			вывод.send {}
			
http.post '/хранилище/заполнить', (ввод, вывод) ->
	человек = null
	второй_человек = null
	
	разделы = null
	
	обсуждение = null
	беседа = null
	
	чистое_хранилище = no
	
	цепь(вывод)
		#.сделать ->
			#проверить_управляющего(ввод, @)
			
		.сделать ->
			db('people').count({}, @)
			
		.ошибка (ошибка) ->
			if ошибка.message == 'ns not found'
				чистое_хранилище = yes
				return no
			console.error ошибка
			вывод.send ошибка: ошибка
				
		.сделать ->
			if not чистое_хранилище
				console.error 'Database Drop attempt'
				return вывод.send ошибка: 'Хранилище уже заполнено, и не может быть перезаписано'
			@.done()
		
		# заполнить людей
						
		.сделать ->
			db('people').drop @
		
		.ошибка (ошибка) ->
			if ошибка.message == 'ns not found'
				return no
			console.error ошибка
			вывод.send ошибка: ошибка

#		.сделать ->
#			db('people').ensureIndex 'почта', true, @

		.сделать ->
			db('people').ensureIndex 'имя', true, @

		.сделать ->
			db('people').ensureIndex 'адресное имя', true, @

		.сделать ->
			человек =
				имя: 'Дождь со Снегом'
				'адресное имя': 'Дождь со Снегом'
				описание: 'главный архитектор'
				пол: 'мужской'
				откуда: 'Россия'
				пароль: 'change.this'
				почта: 'kuchumovn@gmail.com'
				'когда пришёл': new Date()
				'время рождения': '04.11.1987'
				характер: 'флегматичный'
				убеждения: 'социализм'
				'семейное положение': 'холост'
				ссылки: [ 'http://vkontakte.ru/kuchumovn', 'http://youtube.com/user/kuchumovn' ]
				полномочия: ['управляющий']
				
			второй_человек = человек
				
			пользовательское.создать(человек, @)
			
		# заполнить сессии людей
						
		.сделать ->
			db('people_sessions').drop @
		
		.ошибка (ошибка) ->
			if ошибка.message == 'ns not found'
				return no
			console.error ошибка
			вывод.send ошибка: ошибка

		.сделать ->
			db('people_sessions').ensureIndex 'пользователь', true, @
			
		.сделать ->
			db('people').find({}).toArray @
			
		.все_вместе (человек) ->
			db('people_sessions').save({ пользователь: человек._id, новости: { беседы: {}, обсуждения: {}, новости: {} } })
			
		# заполнить тайные ключи людей
		
		.сделать ->
			db('people_private_keys').drop @
		
		.ошибка (ошибка) ->
			if ошибка.message == 'ns not found'
				return no
			console.error ошибка
			вывод.send ошибка: ошибка

		.сделать ->
			db('people_private_keys').ensureIndex 'пользователь', true, @

		.сделать ->
			db('people_private_keys').ensureIndex 'тайный ключ', true, @

		.сделать ->	
			db('people_private_keys').save { пользователь: человек._id, 'тайный ключ': человек._id + new Date().getTime() + Math.random() }, @
			
		# заполнить приглашения
			
		.сделать ->
			db('invites').drop @
		
		.ошибка (ошибка) ->
			if ошибка.message == 'ns not found'
				return no
			console.error ошибка
			вывод.send ошибка: ошибка
		
		.сделать ->
			db('invites').ensureIndex 'ключ', true, @
			
		# заполнить друзей
		
		.сделать ->
			db('friends').drop @
		
		.ошибка (ошибка) ->
			if ошибка.message == 'ns not found'
				return no
			console.error ошибка
			вывод.send ошибка: ошибка
				
		.сделать ->
			хранилище.createCollection 'friends', @
			
		.сделать ->
			db('friends').ensureIndex 'пользователь', yes, @

		# заполнить книги
		
		.сделать ->
			db('books').drop @
		
		.ошибка (ошибка) ->
			if ошибка.message == 'ns not found'
				return no
			console.error ошибка
			вывод.send ошибка: ошибка
				
		.сделать ->
			хранилище.createCollection 'books', @
			
		.сделать ->
			db('books').ensureIndex('id', yes, @)
			
		.сделать ->
			db('books').ensureIndex([[ 'сочинитель', 1 ], [ 'название', 1 ] ], yes, @)
			
		.сделать ->
			книги = 
			[
				{
					сочинитель: 'Фритьоф Капра',
					название: 'Скрытые связи',
					id: 'Фритьоф Капра «Скрытые связи»',
					файл: 'книга.pdf',
					обложка:
						ширина: 88,
						высота: 140,
						картинка: 'обложка.jpg'
				},
				{
					сочинитель: 'Edward Tufte',
					название: 'Visual Explanations',
					id: 'Edward Tufte «Visual Explanations»',
					ссылка: 'http://rutracker.org/forum/viewtopic.php?t=1488663',
					обложка:
						ширина: 100,
						высота: 126,
						картинка: 'обложка.jpg'
				},
				{
					сочинитель: 'Кон И.С.',
					название: 'Мальчик — отец мужчины',
					id: 'Кон И.С. «Мальчик — отец мужчины»'
				},
				{
					сочинитель: 'Мэтью Макдональд',
					название: 'Научи свой мозг работать',
					id: 'Мэтью Макдональд «Научи свой мозг работать»'
				},
				{
					сочинитель: 'Шишков А.С.',
					название: 'Славяно-русский корнеслов'
					id: 'Шишков А.С. «Славяно-русский корнеслов»'
				},
				{
					сочинитель: 'Нюма-Дени Фюстель де Куланж',
					название: 'Гражданская община древнего мира',
					id: 'Нюма-Дени Фюстель де Куланж «Гражданская община древнего мира»'
				},
				{
					сочинитель: 'Барсенков А.С., Вдовин А.И.',
					название: 'История России. 1917-2004. Учебное пособие для вузов',
					id: 'Барсенков А.С., Вдовин А.И. «История России. 1917-2004. Учебное пособие для вузов»'
				},
				{
					сочинитель: 'Стивен Лаберж',
					название: 'Осознанное сновидение',
					id: 'Стивен Лаберж «Осознанное сновидение»'
				},
				{
					сочинитель: 'Ричард Броуди',
					название: 'Психические вирусы',
					id: 'Ричард Броуди «Психические вирусы»'
				},
				{
					сочинитель: 'Тим Харфорд',
					название: 'Экономист под прикрытием',
					id: 'Тим Харфорд «Экономист под прикрытием»'
				},
				{
					сочинитель: 'Артемий Лебедев',
					название: 'Ководство',
					id: 'Артемий Лебедев «Ководство»'
				},
				{
					сочинитель: 'Джон Гэлбрейт',
					название: 'Новое индустриальное общество',
					id: 'Джон Гэлбрейт «Новое индустриальное общество»'
				},
				{
					сочинитель: 'Станислав Гроф',
					название: 'Области человеческого безсознательного',
					id: 'Станислав Гроф «Области человеческого безсознательного»'
				},
				{
					сочинитель: 'Ян Зодерквист, Александр Бард',
					название: 'Netократия. Новая правящая элита и жизнь после капитализма',
					id: 'Ян Зодерквист, Александр Бард «Netократия. Новая правящая элита и жизнь после капитализма»'
				},
				{
					сочинитель: 'Ильин А.А.',
					название: 'Школа выживания. Как избежать голодной смерти',
					id: 'Ильин А.А. «Школа выживания. Как избежать голодной смерти»'
				},
				{
					сочинитель: 'Нассим Талеб',
					название: 'Чёрный лебедь',
					id: 'Нассим Талеб «Чёрный лебедь»'
				},
				{
					сочинитель: 'Юрий Дроздов',
					название: 'Записки начальника нелегальной разведки',
					id: 'Юрий Дроздов «Записки начальника нелегальной разведки»'
				},
				{
					сочинитель: 'Роберт Чалдини',
					название: 'Психология влияния',
					id: 'Роберт Чалдини «Психология влияния»'
				}
			]
					
			@.done(книги)
			
		.все_вместе (книга) ->
			db('books').save книга, @

		# заполнить круги пользователей
		
		.сделать ->
			db('circles').drop @
		
		.ошибка (ошибка) ->
			if ошибка.message == 'ns not found'
				return no
			console.error ошибка
			вывод.send ошибка: ошибка
				
		.сделать ->
			хранилище.createCollection 'circles', @
			
		.сделать ->
			db('circles').ensureIndex([[ 'пользователь', 1 ], [ 'название', 1 ] ], yes, @)
			
		.сделать ->
			db('circles').save({ пользователь: человек._id, круг: 'Основной', члены: [] }, @)

		# заполнить книги пользователей
		
		.сделать ->
			db('peoples_books').drop @
		
		.ошибка (ошибка) ->
			if ошибка.message == 'ns not found'
				return no
			console.error ошибка
			вывод.send ошибка: ошибка
				
		.сделать ->
			хранилище.createCollection 'peoples_books', @
			
		.сделать ->
			db('peoples_books').ensureIndex('пользователь', yes, @)
			
		.сделать ->
			db('books').find({}).toArray @
			
		.сделать (книги) ->
			db('peoples_books').save({ пользователь: человек._id, книги: книги.map((книга) -> книга._id) }, @)

		# заполнить альбомы картинок
		
		.сделать ->
			db('picture_albums').drop @
		
		.ошибка (ошибка) ->
			if ошибка.message == 'ns not found'
				return no
			console.error ошибка
			вывод.send ошибка: ошибка
				
		.сделать ->
			хранилище.createCollection 'picture_albums', @
			
		.сделать ->
			db('picture_albums').ensureIndex([[ 'пользователь', 1 ], [ 'id', 1 ] ], yes, @)

		# заполнить картинки
		
		.сделать ->
			db('pictures').drop @
		
		.ошибка (ошибка) ->
			if ошибка.message == 'ns not found'
				return no
			console.error ошибка
			вывод.send ошибка: ошибка
				
		.сделать ->
			хранилище.createCollection 'pictures', @
			
		.сделать ->
			db('pictures').ensureIndex([[ 'альбом', 1 ], [ 'id', 1 ] ], yes, @)

		# картинки пользователя
		
		.сделать ->	
			альбом =
				id: 'Реклама'
				название: 'Реклама / Раз / Два / Три'
				описание: 'Разного рода западные рекламные ролики'
				обложка: yes
					
			альбом.пользователь = человек._id
			
			db('picture_albums').save(альбом, @)
		
		.сделать (альбом) ->
			картинки = [
				{ id: 'дети 1', описание: "Looking at the world through children's eyes.", формат: 'jpg' },
				{ id: 'дети 2', описание: "Looking at the world through children's eyes.", формат: 'jpg' },
				{ id: 'дети 3', описание: "Looking at the world through children's eyes.", формат: 'jpg' },
				{ id: 'книги 1', описание: "Anagram bookshop", формат: 'jpg' },
				{ id: 'книги 2', описание: "Anagram bookshop", формат: 'jpg' },
				{ id: 'книги 3', описание: "Anagram bookshop", формат: 'jpg' }
			]
			
			for картинка in картинки
				картинка.альбом = альбом._id
			
			@.done(картинки)
			
		.все_вместе (картинка) ->
			db('pictures').save(картинка, @)
			
		.сделать ->	
			альбом =
				id: 'Портрет'
				название: 'Портрет'
				описание: 'Мои фотки'
				обложка: yes
					
			альбом.пользователь = человек._id
			
			db('picture_albums').save(альбом, @)
		
		.сделать (альбом) ->
			картинки = [
				{ id: 'гермозона', формат: 'jpg' },
				{ id: 'аниме', формат: 'jpg' }
			]
			
			for картинка in картинки
				картинка.альбом = альбом._id
			
			@.done(картинки)
			
		.все_вместе (картинка) ->
			db('pictures').save(картинка, @)
			
		# заполнить альбомы видео
		
		.сделать ->
			db('video_albums').drop @
		
		.ошибка (ошибка) ->
			if ошибка.message == 'ns not found'
				return no
			console.error ошибка
			вывод.send ошибка: ошибка
				
		.сделать ->
			хранилище.createCollection 'video_albums', @
			
		.сделать ->
			db('video_albums').ensureIndex([[ 'пользователь', 1 ], [ 'id', 1 ] ], yes, @)
			
		# заполнить видео
		
		.сделать ->
			db('videos').drop @
		
		.ошибка (ошибка) ->
			if ошибка.message == 'ns not found'
				return no
			console.error ошибка
			вывод.send ошибка: ошибка
				
		.сделать ->
			хранилище.createCollection 'videos', @
			
		.сделать ->
			db('videos').ensureIndex([[ 'альбом', 1 ], [ 'id', 1 ] ], yes, @)

		# видео пользователя
		
		.сделать ->	
			альбом = 
				id: 'Художества'
				название: 'Художества'
				описание: 'Художественные ролики'
				обложка: yes
				
			альбом.пользователь = человек._id
			
			db('video_albums').save(альбом, @)
		
		.сделать (альбом) ->
			видеозаписи = [
				{ источник: 'vimeo.com', id: 'Rabbitoyd', внешний_id: '37391578' },
				{ источник: 'vimeo.com', id: 'Афганистан', внешний_id: '31426899' }
			]
			
			for видеозапись in видеозаписи
				видеозапись.альбом = альбом._id
			
			@.done(видеозаписи)
			
		.все_вместе (видео) ->
			db('videos').save(видео, @)
			
		.сделать ->	
			альбом = 
				id: 'Наркоман Павлик'
				название: 'Наркоман Павлик'
				описание: 'Приключения Павлика и его друга Дэнчика'
				обложка: yes
				
			альбом.пользователь = человек._id
			
			db('video_albums').save(альбом, @)
		
		.сделать (альбом) ->
			видеозаписи = [
				{ источник: 'youtube.com', id: 'Павлик и Дэнчик везут вазу в Самару', описание: 'Павлик и Дэнчик везут вазу в Самару', внешний_id: 'R3g1fkAqolQ' },
				{ источник: 'youtube.com', id: 'Павлик и Дэнчик спалились', описание: 'Павлик и Дэнчик спалились', внешний_id: 'TT7UbfbeSjQ' }
			]
			
			for видеозапись in видеозаписи
				видеозапись.альбом = альбом._id
			
			@.done(видеозаписи)
			
		.все_вместе (видео) ->
			db('videos').save(видео, @)
			
		# заполнить дневники
			
		.сделать ->
			db('diaries').drop @
		
		.ошибка (ошибка) ->
			if ошибка.message == 'ns not found'
				return no
			console.error ошибка
			вывод.send ошибка: ошибка
				
		.сделать ->
			хранилище.createCollection 'diaries', @
			
		.сделать ->
			db('diaries').ensureIndex([[ 'пользователь', 1 ], [ 'id', 1 ] ], yes, @)

		.сделать ->
			db('diaries').ensureIndex 'время', no, @

		.сделать ->
			db('diaries').save { пользователь: человек._id, id: 'Запись в дневнике, 12.05.2012 в 22:45', название: 'Запись в дневнике', запись: 'Судовой журнал или Вахтенный журнал — один из основных судовых документов. В судовом журнале фиксируются: список команды, дата прибытия в порт и отплытия из порта, глубина воды в порту и при выходе в море, скорость, курс, сила ветра во время рейса, фамилии вахтенных экипажа и вахтенных штурманов и их подробный доклад о всех событиях, происшедших за время совершения рейса.', когда: new Date() }, @
			
		.сделать ->
			db('diaries').save { пользователь: человек._id, id: 'И ещё одна, 12.05.2012 в 22:45', название: 'И ещё одна', запись: 'Сегодня ходили туда-то. Видели то-то.', когда: new Date() }, @
			
		# заполнить журналы
			
		.сделать ->
			db('journals').drop @
		
		.ошибка (ошибка) ->
			if ошибка.message == 'ns not found'
				return no
			console.error ошибка
			вывод.send ошибка: ошибка
				
		.сделать ->
			хранилище.createCollection 'journals', @
			
		.сделать ->
			db('journals').ensureIndex([[ 'пользователь', 1 ], [ 'id', 1 ] ], yes, @)

		.сделать ->
			db('journals').ensureIndex 'время', no, @

		.сделать ->
			db('journals').save { пользователь: человек._id, id: 'Автомат Калашникова, 12.05.2012 в 22:45', название: 'Автомат Калашникова', запись: 'АК-12 — российский автомат калибра 5,45 мм, перспективная разработка концерна «Ижмаш»[1]. Этот автомат разрабатывался, чтобы заменить в производстве и, возможно, на вооружении Вооружённых Сил Российской Федерации (ВС России) предыдущие варианты автоматов Калашникова — АК-74 и АК-74М, АК-103 и более ранние АКМ и АКМС.', когда: new Date() }, @

		.сделать ->
			db('journals').save { пользователь: человек._id, id: 'Сталинизм, 12.05.2012 в 22:45', название: 'Сталинизм', запись: 'Сталинский ампир (от фр. empire — «империя» и по аналогии с ампиром) — одно из лидирующих направлений в архитектуре, монументальном и декоративном искусстве СССР с середины 1940-х до середины 1950-х годов. В средствах массовой информации используется как неформальное обозначение всего многообразия сталинской эклектики. Сталинский ампир в декоре помещений — это, в частности, массивная деревянная мебель, лепнина под высокими потолками, резные шкафы, бронзовые светильники и статуэтки.', когда: new Date() }, @
			
		# заполнить разделы читальни
			
		.сделать ->
			db('library_categories').drop @
		
		.ошибка (ошибка) ->
			if ошибка.message == 'ns not found'
				return no
			console.error ошибка
			вывод.send ошибка: ошибка
				
		.сделать ->
			хранилище.createCollection 'library_categories', @
			
		.сделать ->
			db('library_categories').ensureIndex 'название', no, @
			
		.сделать ->
			db('library_categories').ensureIndex 'надраздел', no, @

		.сделать ->
			разделы = []
			for название in [ 'Физика', 'Строительство', 'Механизация', 'Словесность', 'Власть', 'Душеведение', 'Общество', 'Летопись' ]
				разделы.push
					название: название
					
			@.done(разделы)
			
		.все_вместе (раздел) ->
			db('library_categories').save раздел, @
				
		.сделать () ->
			db('library_categories').findOne { название: 'Физика' }, @
			
		.сделать (физика) ->
			электромагнетизм = 
				название: 'Электромагнетизм'
				надраздел: физика._id
				style_classes: 'smaller'
			
			db('library_categories').save электромагнетизм, @

		# пути разделов и заметок
			
		.сделать ->
			db('library_paths').drop @
					
		.ошибка (ошибка) ->
			if ошибка.message == 'ns not found'
				return no
			console.error ошибка
			вывод.send ошибка: ошибка
				
		.сделать ->
			хранилище.createCollection 'library_paths', @

		.сделать ->
			db('library_paths').ensureIndex 'путь', yes, @

		.сделать ->
			db('library_paths').ensureIndex 'раздел', no, @

		.сделать ->
			db('library_paths').ensureIndex 'заметка', no, @
			
		# заполнить пути разделов

		.сделать ->
			db('library_categories').find({ название: { $ne: 'Электромагнетизм' }}).toArray @
			
		.все_вместе (раздел) ->
			db('library_paths').save({ путь: раздел.название, раздел: раздел._id }, @)
		
		.сделать ->
			db('library_categories').findOne({ название: 'Электромагнетизм' }, @)
			
		.сделать (раздел) ->
			db('library_paths').save({ путь: 'Физика/Электромагнетизм', раздел: раздел._id, разделы: [раздел.надраздел] }, @)
	
		# черновики
			
		.сделать ->
			db('drafts').drop @
					
		.ошибка (ошибка) ->
			if ошибка.message == 'ns not found'
				return no
			console.error ошибка
			вывод.send ошибка: ошибка
				
		.сделать ->
			хранилище.createCollection 'drafts', @

		.сделать ->
			db('drafts').ensureIndex 'что', no, @

		.сделать ->
			db('drafts').ensureIndex 'пользователь', yes, @

		# беседы
			
		.сделать ->
			db('talks').drop @
					
		.ошибка (ошибка) ->
			if ошибка.message == 'ns not found'
				return no
			console.error ошибка
			вывод.send ошибка: ошибка
				
		.сделать ->
			хранилище.createCollection 'talks', @

		.сделать ->
			db('talks').ensureIndex 'участники', no, @

		.сделать ->
			db('talks').ensureIndex 'id', yes, @

		.сделать ->
			db('talks').save({ id: 'Привет, 12.05.2012 в 18:00, Дождь со Снегом', название: 'Привет', участники: [человек._id, второй_человек._id], создана: new Date() }, @)
				
		.сделать (talk) ->
			беседа = talk
			db('talks').save({ id: 'Отпуск, 12.05.2012 в 18:00, Дождь со Снегом', название: 'Отпуск', участники: [человек._id, второй_человек._id], создана: new Date() }, @)
				
		# обсуждения
			
		.сделать ->
			db('discussions').drop @
					
		.ошибка (ошибка) ->
			if ошибка.message == 'ns not found'
				return no
			console.error ошибка
			вывод.send ошибка: ошибка
				
		.сделать ->
			хранилище.createCollection 'discussions', @

		.сделать ->
			db('discussions').ensureIndex 'участники', no, @

		.сделать ->
			db('discussions').ensureIndex 'id', yes, @

		.сделать ->
			db('discussions').save({ id: 'Есть ли жизнь на Марсе?, 12.05.2012 в 18:00, Дождь со Снегом', название: 'Есть ли жизнь на Марсе?', участники: [человек._id, второй_человек._id], создано: new Date() }, @)
				
		.сделать (discussion) ->
			обсуждение = discussion
			db('discussions').save({ id: 'Кто играет в Доту?, 12.05.2012 в 18:00, Дождь со Снегом', название: 'Кто играет в Доту?', участники: [человек._id, второй_человек._id], создано: new Date() }, @)
				
		# сообщения
			
		.сделать ->
			db('messages').drop @
					
		.ошибка (ошибка) ->
			if ошибка.message == 'ns not found'
				return no
			console.error ошибка
			вывод.send ошибка: ошибка
				
		.сделать ->
			хранилище.createCollection 'messages', @

		.сделать ->
			db('messages').ensureIndex 'общение', no, @
				
		.сделать ->
			messages =
			[
				{ сообщение: 'Раз два три', отправитель: человек._id },
				{ сообщение: 'Четыре <b>пять</b> шесть', отправитель: второй_человек._id },
				{ сообщение: 'И ещё сообщение', отправитель: человек._id }
			]
			
			@.done(messages)

		.все_вместе (message) ->
			message.когда = new Date()
			message.общение = беседа._id
			db('messages').save(message, @)

		.сделать ->
			messages =
			[
				{ сообщение: 'Есть ли', отправитель: человек._id },
				{ сообщение: 'Никто не знает <b>того</b>', отправитель: второй_человек._id },
				{ сообщение: 'Марсоходы', отправитель: человек._id }
			]
			
			@.done(messages)

		.все_вместе (message) ->
			message.когда = new Date()
			message.общение = обсуждение._id
			db('messages').save(message, @)

		# новости
			
		.сделать ->
			db('news').drop @
					
		.ошибка (ошибка) ->
			if ошибка.message == 'ns not found'
				return no
			console.error ошибка
			вывод.send ошибка: ошибка
				
		.сделать ->
			хранилище.createCollection 'news', @

		.сделать ->
			db('news').ensureIndex 'пользователь', no, @

		.сделать ->
			db('news').ensureIndex 'когда', no, @
				
		.сделать ->
			новости =
			[
				{ что: 'прописка' },
				{ что: 'создание', чего: 'раздела', какого: { _id: '', путь: 'Физика', название: 'Физика' } },
				{ что: 'создание', чего: 'раздела', какого: { _id: '', путь: 'Физика/Электромагнетизм', название: 'Электромагнетизм' }, где: { _id: '', путь: 'Физика', название: 'Физика' } },
				{ что: 'перемещение', чего: 'раздела', какого: { _id: '', путь: 'Физика/Электромагнетизм', название: 'Электромагнетизм' }, откуда: { _id: '', путь: 'Физика', название: 'Физика' }, куда: { _id: '', путь: 'Летопись', название: 'Летопись' } },
				{ что: 'удаление', чего: 'раздела', какого: { _id: '', название: 'Электромагнетизм' }, откуда: { _id: '', путь: 'Физика', название: 'Физика' } },
				{ что: 'создание', чего: 'заметки', какой: { _id: '', путь: 'Физика/Материальная точка', название: 'Материальная точка' }, где: { _id: '', путь: 'Физика', название: 'Физика' } },
				{ что: 'правка', чего: 'заметки', какой: { _id: '', путь: 'Физика/Материальная точка', название: 'Материальная точка' }, правка: { _id: '', id: '12.05.2012 в 18:07, Дождь со Снегом' } },
				{ что: 'перемещение', чего: 'заметки', какой: { _id: '', путь: 'Физика/Материальная точка', название: 'Материальная точка' }, откуда: { _id: '', путь: 'Физика/Электромагнетизм', название: 'Электромагнетизм' }, куда: { _id: '', путь: 'Физика', название: 'Физика' } },
				{ что: 'удаление', чего: 'заметки', какой: { _id: '', путь: 'Физика/Материальная точка', название: 'Материальная точка' }, откуда: { _id: '', путь: 'Физика', название: 'Физика' }  },
				{ что: 'загрузка', чего: 'картинки', какой: { альбом: { id: 'Реклама', название: 'Реклама', _id: '' }, id: 'дети 1', _id: '' } },
				{ что: 'загрузка', чего: 'картинки', какой: { альбом: { id: 'Реклама', название: 'Реклама', _id: '' }, id: 'дети 2', _id: '' } },
				{ что: 'загрузка', чего: 'картинки', какой: { альбом: { id: 'Реклама', название: 'Реклама', _id: '' }, id: 'дети 3', _id: '' } },
				{ что: 'добавление', чего: 'видеозаписи', какой: { альбом: { id: 'Художества', название: 'Художества', _id: '' }, _id: '', id: 'Rabbitoyd', источник: 'vimeo.com', внешний_id: '37391578' } },
				{ что: 'добавление', чего: 'видеозаписи', какой: { альбом: { id: 'Наркоман Павлик', название: 'Наркоман Павлик', _id: '' }, _id: '', id: 'Павлик и Дэнчик везут вазу в Самару', источник: 'youtube.com', описание: 'Павлик и Дэнчик везут вазу в Самару', внешний_id: 'R3g1fkAqolQ' } },
				{ что: 'создание', чего: 'заметки в дневнике', какой: { _id: '', id: 'Запись в дневнике, 12.05.2012 в 22:45', название: 'Запись в дневнике' } },
				{ что: 'создание', чего: 'заметки в журнале', какой: { _id: 'Автомат Калашникова, 12.05.2012 в 22:45', название: 'Автомат Калашникова' } }
			]
			
			@.done(новости)

		.все_вместе (новость) ->
			новость.пользователь = человек._id
			новость.когда = new Date()
			db('news').save(новость, @)

		# системная мусорка
			
		.сделать ->
			db('system_trash').drop @
					
		.ошибка (ошибка) ->
			if ошибка.message == 'ns not found'
				return no
			console.error ошибка
			вывод.send ошибка: ошибка
				
		.сделать ->
			хранилище.createCollection 'system_trash', @

		.сделать ->
			db('system_trash').ensureIndex 'что', no, @

		# мусорка
			
		.сделать ->
			db('trash').drop @
					
		.ошибка (ошибка) ->
			if ошибка.message == 'ns not found'
				return no
			console.error ошибка
			вывод.send ошибка: ошибка
				
		.сделать ->
			хранилище.createCollection 'trash', @

		.сделать ->
			db('trash').ensureIndex 'пользователь', no, @

		.сделать ->
			db('trash').ensureIndex '_id', yes, @

		# заметки
			
		.сделать ->
			db('library_articles').drop @
					
		.ошибка (ошибка) ->
			if ошибка.message == 'ns not found'
				return no
			console.error ошибка
			вывод.send ошибка: ошибка
				
		.сделать ->
			хранилище.createCollection 'library_articles', @

		.сделать ->
			db('library_articles').ensureIndex 'название', no, @

		.сделать ->
			db('library_articles').ensureIndex 'раздел', no, @

		# заметка
			
		.сделать () ->
			db('library_categories').findOne { название: 'Физика' }, @
			
		.сделать (физика) ->
			заметка = "<абзац>Материальная точка — объект, не имеющий размеров, но обладающий всеми остальными свойствами (массой, зарядом и т.п.).</абзац>
		
				<абзац>Используется в физике <формула>(physics)</формула> в качестве <код>упрощённой модели</код> относительно малого объекта (относительно малого в рамках задачи). Например, при расчёте пути, пройденного поездом из Петрограда во Владивосток, можно пренебречь его очертаниями и размерами, поскольку они гораздо меньше протяжённости пути.</абзац>

				<выдержка><текст>Война - это путь обмана. Поэтому, даже если [ты] способен, показывай противнику свою неспособность. Когда должен ввести в бой свои силы, притворись бездеятельным. Когда [цель] близко, показывай, будто она далеко; когда же она действительн далеко, создавай впечатление, что она близко</текст><автор>Cунь Цзы, «Искусство Войны»</автор></выдержка>
				
				<абзац>Вставим-как сюда картинку: <картинка адрес='http://cdn1.iconfinder.com/data/icons/49handdrawing/128x128/picture.png'/>, вот так.</абзац>
				
				<абзац><youtube>quYfLkJMN1g</youtube></абзац>
				
				<абзац><vimeo>47387431</vimeo></абзац>
				
				<абзац>Вставим-как сюда картинку: <картинка адрес='http://cdn1.iconfinder.com/data/icons/49handdrawing/128x128/picture.png'/>, вот так.</абзац>
				
				<абзац>Однако <жирный>не всегда</жирный> можно <курсив>пользоваться</курсив> материальными<сверху>1</сверху> точками<снизу>2</снизу> для решения задач. Например, при расчёте распределения энергии молекул в <a type='hyperlink' href='/читальня/химия/инертный газ'>инертном газе</a> можно представить молекулы материальными точками (шариками). Однако для других веществ начинает иметь значение строение молекулы, так как <многострочный_код>колебание и вращение</многострочный_код> самой молекулы начинают запасать в себе значительную энергию.</абзац>
				
				<заголовок_2>Ссылки</заголовок_2>
		
				<список>
					<пункт><ссылка на='http://ru.wikipedia.org/wiki/Материальная_точка'>WikiPedia</ссылка></пункт>
					<пункт><ссылка на='http://phys.msu.ru/'>ФизФак МГУ</ссылка></пункт>
				</список>"	
			
			заметка = заметка.replace_all('\n', '')
			заметка = заметка.replace_all('\t', '')
			
			материальная_точка = 
				название: 'Материальная точка'
				раздел: физика._id
				содержимое: заметка
			
			db('library_articles').save материальная_точка, @
			
		# заполнить пути заметок

		.сделать ->
			db('library_articles').findOne({}, @)
			
		.сделать (заметка) ->
			db('library_paths').save({ путь: 'Физика/Материальная точка', заметка: заметка._id, разделы: [заметка.раздел] }, @)
				
		# заполнить болталку
			
		.сделать ->
			db('chat').drop @
		
		.ошибка (ошибка) ->
			if ошибка.message == 'ns not found'
				return no
			console.error ошибка
			вывод.send ошибка: ошибка
				
		.сделать ->
			# { capped: true, size: 100 }, 
			хранилище.createCollection 'chat', @
			
		.сделать ->
			db('chat').ensureIndex 'отправитель', no, @
					
		# готово
			
		.сделать ->
			вывод.send {}