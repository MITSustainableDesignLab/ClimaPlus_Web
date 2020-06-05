
####
###This python script is adjusted for local machine or cloud server. It should not be adited, do not committe changes to git or aws.

def runHost(app):
    #hosting port on AWS EC2
	# app.run(host="0.0.0.0", port=80, debug=True)

    #hosting port on local server
    port = 4000 #the custom port you want
    app.run(host='0.0.0.0', port=port, debug=True)
