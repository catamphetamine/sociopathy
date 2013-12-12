api = {}

module.exports = api

Open_tab_activity_timeout = 30 * 60

проверить_уведомления = ->
	for уведомление in db('notifications').find()
		time_offline = Date.now()
		
		session = db('people_sessions').get(пользователь: уведомление.кому)
		if session['когда был здесь']?
			time_offline = Date.now() - session['когда был здесь'].getTime()
		
		send = false
		
		if эфир.есть_ли_с_пользователем(уведомление.кому)
			if time_offline > Open_tab_activity_timeout * 1000
				send = true
		else
			send = true

		if send
			#console.log('Scheduling notification email')
			#console.log(уведомление.письмо)
			почта.письмо_на_отправку(уведомление.письмо)
			db('notifications').remove(уведомление)
		
проверить_уведомления.ticking(1000)