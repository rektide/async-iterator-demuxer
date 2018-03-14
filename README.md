# async-iterator-demuxer

> Create multiple async iterators of a single async-iterator/iterable.

Allow multiple consumers of a single async iterator instance.

```
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
readAll(demuxed, i=> 3)
// prints: "begin", 6, 24, 9, 36
// note that "begin" is only printed once.
```

# Warning

No effort is made to insure each reader gets consistent results.

The first active reader has special importance. It's reads are signalled to the other readers. This means:
1. the first active reader will definitely get all reads
2. the maximum take rate is governed by the first reader
3. other readers will miss data if they are not iterating as fast as the first reader
4. as a general rule, if you can ask for the next element in less time than the period between events, you should never miss any events.

Alternative implementation strategies for he future might be:
1. advance only after all readers have read the current value
2. buffer some historical set of reads for slower readers
3. optional read-ahead buffering
