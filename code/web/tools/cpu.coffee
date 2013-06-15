disk = require 'fs'
 
CPU_watcher = {}

CPU_watcher.watch = () ->
	if not disk_tools.exists('/proc')
		return console.log 'We are running not on a Linux machine. CPU load won\'t be monitored'

	if @watching?
		return
	
	@watching =
		watch: yes
	
	get_usage = () ->
		data = disk.readFile.await('/proc/' + process.pid + '/stat')
		
		chunks = data.toString().split(' ')
		
		utime = parseInt(chunks[13])
		stime = parseInt(chunks[14])
		
		return utime + stime
		
	measuring_interval = 5 # seconds
	repeat_interval = 1 # seconds
	
	measure = =>
		started_with = get_usage()
		
		finish = ->
			ended_with = get_usage()
			delta = ended_with - started_with
			load_percentage = 100 * (delta / (measuring_interval * 100))
			
			global.CPU_usage = load_percentage
			
		finish.delay(measuring_interval * 1000)
		
		if not @watching.watch
			measure.delay(repeat_interval * 1000)
		
	measure()

CPU_watcher.stop_watching = ->
	if @watching?
		@watching.watch = no
		@watching = null
		
module.exports = CPU_watcher