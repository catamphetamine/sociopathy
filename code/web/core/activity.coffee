Activity = {}
	
Activity.monitor = (_id, когда_был_здесь) ->
	user_id = _id + ''

	if not когда_был_здесь?
		когда_был_здесь = new Date()

	activity =
		когда_был_здесь: когда_был_здесь
		
		detected: ->
			@когда_был_здесь = new Date()
		
		update_and_reschedule: ->
			@update()
			@schedule_next_update()
		
		update: ->
			if @когда_был_здесь_в_последний_раз == @когда_был_здесь
				return
				
			когда_был_здесь = @когда_был_здесь
			@когда_был_здесь_в_последний_раз = @когда_был_здесь
			
			# { w: 0 } = write concern "off"
			db('people_sessions').update({ пользователь: _id }, { $set: { 'когда был здесь': когда_был_здесь }}, { w: 0 }) #, online: yes
		
			check_for_expiration = ->
				fiber ->
					#console.log('check_for_expiration: ' + db('people')._.find_one(_id).имя)
					
					session = db('people_sessions')._.find_one({ пользователь: _id })
		
					когда_был_здесь_в_последний_раз = session['когда был здесь']
		
					if когда_был_здесь_в_последний_раз?
						if когда_был_здесь_в_последний_раз.getTime() == когда_был_здесь.getTime()
							#console.log(db('people')._.find_one(_id).имя + ' is offline')
							эфир.offline(_id)
							#notifier.offline(_id)
									
			if @expiration_check?
				clearTimeout(@expiration_check)
	
			@expiration_check = check_for_expiration.delay(Options.User.Activity.Online_timeout)
		
		schedule_next_update: ->
			@update_and_reschedule.bind(@).delay(Options.User.Activity.Update_interval)
	
	Activity[user_id] = activity
		
	activity.update_and_reschedule()

fiber ->
	for session in db('people_sessions')._.find()
		if session['когда был здесь']?
			Activity.monitor(session.пользователь, session['когда был здесь'])
		
module.exports = Activity