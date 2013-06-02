module.exports =
	Web_server:
		Port: 8080
	Upload_server:
		Port: 8091
		File_url: '/загруженное'
	Memcache:
		Port: 11211
	MongoDB:
		Port: 27017
		Database: 'sociopathy'
	User:
		Session:
			Redis:
				Prefix: 'website_session:'
		Online:
			Timeout: 5 * 60 * 1000
		Picture:
			Generic:
				Size: 120
			Small:
				Size: 48
			Tiny:
				Width: 38
				Height: 38
		Photo:
			Size: 1024
	Library:
		Category:
			Icon:
				Generic:
					Width: 300
					Height: 200
				Tiny:
					Width: 57
					Height: 38
	Books:
		Cover:
			Big:
				Width: 250
				Height: 320
			Small:
				Width: 100
				Height: 150
	Mail:
		Box: 'sobranie.net@gmail.com'
		Smtp:
			Username: 'Собрание <sobranie.net@gmail.com>'
			Host: 'smtp.gmail.com'
			Port: 465 # 587 #
	Invites: yes
	Plugins: ['Library', 'People', 'Help', 'News', 'Chat', 'Talks', 'Discussions', 'Bookshelf', 'Settings', 'Trash', 'Administration', 'Errors', 'Picture albums', 'Video albums'] # 'Diary', 'Journal', 'Books', 'Circles'
	Optimize: no
	Language: 'ru' # possible values: 'ru', 'en'