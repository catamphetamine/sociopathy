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
		Picture:
			Generic:
				Size: 120
			Chat:
				Size: 48
	Mail:
		Box: 'sobranie.net@gmail.com'
		Smtp:
			Username: 'Собрание <sobranie.net@gmail.com>'
			Host: 'smtp.gmail.com'
			Port: 465 # 587 #