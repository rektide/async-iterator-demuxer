import AsyncIteratorDemuxer from "../async-iterator-demuxer.js"

function noop(){}

async function readAll(iter, name, fn= noop){
	for await( var el of iter){
		console.log({name, el})
		//await fn()
	}
}

async function read(iter, name){
	iter.next().then(value => console.log({name, value}))
}

async function sleep(n= 600){
	return new Promise(resolve=> setTimeout(resolve, n))
}

export async function basic1(){
	var a1= new AsyncIteratorDemuxer(async function*(){
		yield 6
		yield 9
		yield 42
		yield 121
		yield 451
		yield 401
		yield 404
		yield 7
		yield 5
		yield 3
		return 1
	})
	var iter1= a1[Symbol.asyncIterator]()
	await sleep()
	// interestingly to me, nothing has run yet?
	var iter2= a1[Symbol.asyncIterator]()
	// interestingly to me, iter2 becomes the "leader"
	read(iter2, "2-1")
	read(iter2, "2-2")
	read(iter2, "2-3")
	await sleep()
	// for som reason iter1 runs sometime in here, before 2-4
	await sleep()
	read(iter2, "2-4")
	read(iter2, "2-5")
	readAll(iter1, "1")
	read(iter2, "2-6")
	await sleep()
	read(iter2, "2-7")
}
export default basic1
