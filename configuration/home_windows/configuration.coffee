Upload_server_file_path = 'c:/work/sociopathy/загруженное'

module.exports =
	Upload_server:
		File_path: Upload_server_file_path
		Temporary_file_path: Upload_server_file_path + '/временное'
	ImageMagick:
		Convert:
			Path: 'C:/Program Files (x86)/ImageMagick-6.7.4-Q16/convert'