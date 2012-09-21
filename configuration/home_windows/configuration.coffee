Upload_server_file_path = 'e:/work/sociopathy/загруженное'

module.exports =
	Upload_server:
		File_path: Upload_server_file_path
		Temporary_file_path: Upload_server_file_path + '/временное'
	ImageMagick:
		Convert:
			Path: 'C:/Program Files/ImageMagick-6.7.9-Q16/convert'