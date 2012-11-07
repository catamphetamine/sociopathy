Upload_server_file_path = 'd:/work/sociopathy/загруженное'

module.exports =
	Upload_server:
		File_path: Upload_server_file_path
		Temporary_file_path: Upload_server_file_path + '/временное'
	ImageMagick:
		Convert:
			Path: 'c:/Program Files/ImageMagick-6.8.0-Q16/convert'
	Development: yes
	Invites: no