exports.messages = (options) ->
	prepare_messages(options)

	prepare_messages_socket(options)

	messages_tool_suite = messages_tools(options)
	
	messages_api(options)
	
	return messages_tool_suite
