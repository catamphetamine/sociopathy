Upload_server_file_path = '/home/sociopathy/repository/загруженное'

module.exports =
	Upload_server:
		File_path: Upload_server_file_path
		Temporary_file_path: Upload_server_file_path + '/временное'
	ImageMagick:
		Convert:
			Path: '/usr/bin/convert'
	Development: no