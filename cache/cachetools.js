var cluster = require('cluster');
var http    = require('http');
var numCPUs = require('os').cpus().length;
var fs = require('fs')
var request  = require("request")

var respectHeaders = false

var RLOCK = {}
var WLOCK = {}
if (cluster.isMaster) {
	// Fork workers.
 	for (var i = 0; i < numCPUs; i++) {
		cluster.fork()
	}

	http.createServer(function(req, res) {
		console.log("Master: " + process.pid)
		console.log(RLOCK)
		RLOCK["master"] = true
		res.end("OK")
	}).listen(8001)

	cluster.on('exit', function(worker, code, signal) {
		console.log('worker ' + worker.process.pid + ' died.')
	})
} else {
	// Workers can share any TCP connection
	// In this case it is an HTTP server
	http.createServer(function(req, res) {
		console.log("----")
		console.log("Process: " + process.pid)
		rq = request("http://localhost:8001/?file=file.txt", 
			function (error, response, body) {
  				if (!error && response.statusCode == 200) {
    				console.log("--") 
    				//res.end("OK2")
					cachetool("http://google.com/", "file.txt", res)
  				}})
	}).listen(8000)
}

function cachetool(url, file, res) {

	console.log(RLOCK)
	function isexpired(stat, file, cb) {
		if (typeof(file) === 'string') {
			fs.readFile(file + ".head", 'utf-8', function (data) {
				isexpired(stat, data, cb)
			})
		} else {
			// Compare dates, return true or false.
			cb(false)
		}
	}

	fs.stat(file, function (err, stats) {
		
		var exist = false
		if (stats) exist = stats.isFile()
		if (!exist) {
			// If file is not in cache, fetch and cache/pipe it.
			console.log("File is not in cache.  Calling fetchandpipe().")
			fetchandpipe([url, file, res])
		} else if (!respectHeaders) {
			// If file is in cache and respectHeaders == false, pipe it.
			console.log("File is in cache and respectHeaders == false.  Calling pipeonly().")
			pipeonly([url, file, res])
		} else {
			isexpired(stats, file, function (expired) {
				// Compare expires headers on disk with stat.
				if (!expired) {
					pipeonly([url, file, res])
				} else {
					head(url, function (headers) {
						// Compare last-modified headers with stat.
						isexpired(stats, headers, function (expired) {
							if (expired) {
								fetchandpipe([url, file, res])
							} else {
								pipeonly([url, file, res])
							}
						})
					})
				}
			})
		}
	})
}

function pipeonly(arr) {
	var file = arr[1]
	var res  = arr[2]
	function done() {
		runlock(file)
	}
	console.log("Piping " + file)
	rlock(arr, function () {
		fs.createReadStream(file).on('end', done).pipe(res)  
	})
}

function fetchandpipe(arr) {
	var url  = arr[0]
	var file = arr[1]
	var res  = arr[2]
	var nd = 0

	function done() {nd = nd+1;if (nd == 2) wunlock(file)}
	
	wlock(arr, function () {
		filews = fs.createWriteStream(file).on('finish', done)
		var ud = request(url)
					.on('response', function(response) {
						console.log("Writing headers")
						fs.writeFile(file + ".head", JSON.stringify(response.headers), done)
					})
		ud.pipe(filews)
		ud.pipe(res)  
	})
}

function initialize(fname) {

}
function wlock(arr, cb) {

	var fname = arr[1]

	if (!WLOCK[fname]) {
		WLOCK[fname] = {}
		WLOCK[fname].N = 0
		WLOCK[fname].checking = false
		WLOCK[fname].queue = []
	}
	if (!RLOCK[fname]) {
		RLOCK[fname] = {}
		RLOCK[fname].N = 0
		RLOCK[fname].checking = false
		RLOCK[fname].queue = []
	}

	if (WLOCK[fname].checking || RLOCK[fname].checking) {
		console.log("Status of file lock is being checked.  Will try again in 10 ms.")
		setTimeout(function() {wlock(arr, cb)}, 10)
		return
	}
	WLOCK[fname].checking = true
	if (WLOCK[fname].N != 0) {
		console.log("File is being written.")
		WLOCK[fname].queue.push(arr)
	} else if (RLOCK[fname].N != 0) {
		console.log("File is being read.")
		RLOCK[fname].queue.push(arr)
	} else {
		console.log("Writing " + fname)
		WLOCK[fname].N = WLOCK[fname].N + 1
		cb()
	}
	WLOCK[fname].checking = false
}

function wunlock(fname) {
	WLOCK[fname].checking = true
	WLOCK[fname].N = WLOCK[fname].N - 1
	if (WLOCK[fname].N == 0) {
		if (WLOCK[fname].queue.length > 0) {
			var job = WLOCK[fname].queue.shift()
		}
	}
	WLOCK[fname].checking = false
}

function runlock(fname) {
	RLOCK[fname].checking = true
	console.log("Read unlocking " + fname)
	RLOCK[fname].N = RLOCK[fname].N - 1
	if (RLOCK[fname].N == 0) {
		var job = RLOCK[fname].queue.shift()
	}
	RLOCK[fname].checking = false
}

function rlock(arr, cb) {
	var fname = arr[1]

	if (!WLOCK[fname]) {
		WLOCK[fname] = {}
		WLOCK[fname].N = 0
		WLOCK[fname].checking = false
		WLOCK[fname].queue = []
	}
	if (!RLOCK[fname]) {
		RLOCK[fname] = {}
		RLOCK[fname].N = 0
		RLOCK[fname].checking = false
		RLOCK[fname].queue = []
	}
	console.log(RLOCK)
	if (RLOCK[fname].checking) {
		console.log("Status of file lock is being checked.  Will try again in 10 ms.")
		setTimeout(function() {rlock(arr, cb)}, 10)
		return
	}
	console.log("Setting RLOCK[fname].checking = false.")
	RLOCK[fname].checking = true
	console.log(RLOCK)

	if (WLOCK[fname].N == 0) {
		console.log("No write locks.")
		console.log("Read locking " + fname)
		RLOCK[fname].N = RLOCK[fname].N + 1
		cb()
	} else {
		console.log("Write lock found. Queuing.")
		RLOCK[fname].queue.push(arr)
	}
	console.log("Setting RLOCK[fname].checking = false.")
	RLOCK[fname].checking = false
	console.log(RLOCK)

}