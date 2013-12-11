nodemailer = require 'nodemailer'

transport = nodemailer.createTransport('SMTP', { host: 'localhost' })

api = {}

api.письмо_на_отправку = (письмо) ->
	db('mail').insert(письмо)

api.отправить_письмо = (письмо) ->
	message =
		from: Options.Mail.Send.From #'Sender Name <sender@example.com>'
		to: письмо.кому #'"Receiver Name" <nodemailer@disposebox.com>'
		subject: письмо.тема #'Nodemailer is unicode friendly ✔'
		#headers: { 'X-Laziness-level': 1000 }
		text: письмо.сообщение #'Hello to myself!'
		#html:'<p><b>Hello</b> to myself <img src="cid:note@node"/></p>'+ '<p>Here\'s a nyan cat for you as an embedded attachment:<br/><img src="cid:nyan@node"/></p>'
	
	console.log('Sending Mail')
	transport.sendMail.do(message)
	#console.log('Message sent successfully!')

api.письмо = (кому, от_кого, тема, сообщение) ->
	if кому._id?
		кому = кому._id
		
	user = пользовательское.взять.fiberize()(кому, { полностью: yes })
	
	кому = user.имя + ' <' + user.почта + '>'
	
	return { кому: кому, тема: тема, сообщение: сообщение }
	
#transport.close() // close the connection pool

module.exports = api

доставить_письма = ->
	for письмо in db('mail').find()
		try
			api.отправить_письмо(письмо)
			db('mail').remove(письмо)
		catch error
			console.error('Failed to deliver the message')

доставить_письма.ticking(Options.Mail.Send.Frequency * 1000)