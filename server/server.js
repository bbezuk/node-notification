/*
 * Node process that handles socket.io connections from webserver, listening port is 
 * 8002 which we forward to our forward web proxy in form of ngnix sever
 * 
 * Required libraries are zmq (http://www.zeromq.org/) serving as channel for incoming data from backend, 
 * zmq is fast reliable, and has bindings in bunch of languages, making it ideal for this use.
 * 
 * 
 * We also require socket.io itself, for server portion of system. 
 * Socket io is abstracting websocket-like communication for older browsers not supporting it, and enable-ing use of same API
 */
var context = require('zmq')
var sio = require('socket.io').listen(8002)


/*
 * We are using two sockets to demultiplex incoming communications
 * Broker is collecting all data, it is connected on tcp socket, and subscribed to all "update" messages,
 * it is left up to the underlying systems to generate messages with update header
 * Message has <filter:id:group:status> format, and when broker recieves message, it splits message, and creates new filter
 * So that clients don't get all messages, but only those that of interest
 * For that we use publisher, ipc (in process) socket that every client that connects subscribes to

 */
var broker = context.socket('sub')
var publisher = context.socket('pub')

//We subscribe broker to all update messages on system channel
broker.subscribe("update")

//Callback when message is recieved
//TODO: bad request handling
broker.on('message',function(data){
	var pieces = String(data).split(":")
	var filter = pieces[0]
	var id = pieces[1]
	var group = pieces[2]
	var status = pieces[3]
	publisher.send(id+":"+group+":"+status)
})

//we connect broker to system ip
broker.connect("<protocol:ip:port>")
//we bind publisher internaly
publisher.bind("ipc://update-feed")


//Socket.io callbacks, what to do when new connection is recieved
sio.sockets.on('connection', function (socket) {
	//adapter is new zmq socket that will be created for each client to subscribe to its own id, group
	var adapter = context.socket("sub")
	
	//callback for when client polls
	socket.on('poll', function (data) {
		
		//client sends all id-s he is monitoring, so we can subscribe to them
		var ids = data.checks;
		for(key in ids){
			adapter.subscribe(String(ids[key]))
		}
		
		//when adapter recieves messages, padd the data upstream using socket.emit
		adapter.on('message',function(data){
			socket.volatile.emit('update',String(data))
		})
		adapter.connect("ipc://update-feed")
		
	})
	
	//after client disconnets, we make clean close of adapter
	socket.on('disconnect',function(){
		adapter.close()
	})

})