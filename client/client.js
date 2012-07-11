var interfaceLock = 0;

// socket.io socket
var socket;

//We are using jQuery to set up all javascrip ton page
$(document).ready(function(){
	//various other dom handling redacted
	
	setupPolling();
});

//client code for socket.io
function setupPolling()
{
	try{
		
		socket.socket.disconnect();
	}
	catch(e){}
	//we connect on same address web page is on, but on different port, that is proxied back tou our node.js server with socket.io
	socket = new io.connect('http://' + window.location.hostname + ':10080', {
		rememberTransport: false,
		'force new connection': true
        });
	//after we connect, we start polling server, and we send all id-s we found on page, so we can monitor them all,
	//Id-s represent data points that we expect can be updated by system
	socket.on('connect', function() {
		socket.emit('poll', { checks: getAllCheckIds() });
	});
	
	//After we get data, we parse data, and call function that will now properly update our website
	//It should be noted that socket.io does not send data itself, but only flag that change is made
	socket.on('update',function(data){
		var temp = String(data).split(":");
		refreshData(temp[0],temp[1],temp[2]);
	});
}

function getAllCheckIds()
{
	var ids = Array();
	$("#checks-table .sort-table > li ,#checks-table-public .sort-table > li").each(function(index,element){		
		var temp = $(this).find("ul:eq(0)").attr("id").split("_")[1];
		ids.push(temp);
	});
	return ids;
}

//After we get notification data point with id and group has been updated, we use ajax call to get data itself
function refreshData(id,group,status)
{
		$.ajax({ type: "POST", 
				url: "<Api url>", 
				data: {id:id,group:1,stats:1},
				cache: false,
				dataType: "json",
				success: function(data){
					if(data.status == "success")
					{
						//functions that process data redacted
					}
				}
		});
	}
}