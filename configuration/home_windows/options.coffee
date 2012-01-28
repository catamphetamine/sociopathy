Upload_server_file_path = 'c:/work/sociopathy/загруженное'

global.Options =
        Web_server:
                Port: 8080
        Upload_server:
                Port: 8090
                File_path: Upload_server_file_path
                File_url: '/загруженное'
                Temporary_file_path: Upload_server_file_path + '/временное'
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
        ImageMagick:
                Convert:
                        Path: 'C:/Program Files (x86)/ImageMagick-6.7.4-Q16/convert'