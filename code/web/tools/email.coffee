nodemailer = require 'nodemailer'

transport = nodemailer.createTransport("SMTP", { host: 'localhost' })

console.log('SMTP Configured')

exports.письмо = (настройки) ->	
	message =
		from: Options.Mail.From #'Sender Name <sender@example.com>'
		to: настройки.кому #'"Receiver Name" <nodemailer@disposebox.com>'
		subject: настройки.тема #'Nodemailer is unicode friendly ✔'
		#headers: { 'X-Laziness-level': 1000 }
		text: настройки.сообщение #'Hello to myself!'
		#html:'<p><b>Hello</b> to myself <img src="cid:note@node"/></p>'+ '<p>Here\'s a nyan cat for you as an embedded attachment:<br/><img src="cid:nyan@node"/></p>'
	
	console.log('Sending Mail')
	transport.sendMail.do(message)
	console.log('Message sent successfully!')

#transport.close(); // close the connection pool