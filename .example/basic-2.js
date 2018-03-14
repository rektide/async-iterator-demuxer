import AsyncIteratorDemuxer from "../async-iterator-demuxer.js"

export default function(){
	var demuxed= new AsyncIteratorDemuxer(async function*(){
		console.log("begin")
		yield 6
		yield 9
		return 42
	})
	async function readAll(iter, fn){
		for await(var el of iter){
			console.log(fn(el))
		}
	}
	readAll(demuxed, i=> i)
	readAll(demuxed, i=> 4*i)
}
