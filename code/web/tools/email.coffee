mailer = require "mailer"

exports.письмо = (настройки) ->
	options =
		host: Options.Mail.Smtp.Host
		port: Options.Mail.Smtp.Port
		ssl: true
		domain: "gmail.com"
		to: настройки.кому
		from: Options.Mail.Box
		subject: настройки.тема
		body: настройки.сообщение
		#template: "../templates/sample.txt"
		data: настройки.данные
		authentication: "login"
		username: Options.Mail.Smtp.Username
		password: Options.Mail.Smtp.Password
	
	цепь()
		.сделать ->
			mailer.send(options, @)
		#.сделать ->