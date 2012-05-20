Upload_server_file_path = '/Users/kuchumovn/work/sociopathy/загруженное'

module.exports =
	Upload_server:
		File_path: Upload_server_file_path
		Temporary_file_path: Upload_server_file_path + '/временное'
	ImageMagick:
		Convert:
			Path: '/opt/local/bin/convert'