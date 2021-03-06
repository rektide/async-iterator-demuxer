import Defer from "p-defer"

/**
* Create multiple asyncIterators from a single asyncIterator.
*/
export class AsyncIteratorDemuxer{
	constructor( source){
		this.source= source
		Object.defineProperties( this, {
			_next: {
				value: Defer(),
				writable: true
			},
			_done: {
				value: Defer(),
				writable: true
			}
		})
	}
	/**
	* Read from the source, passing through values.
	* @private
	*/
	async *[Symbol.asyncIterator](){
		if( this[Symbol.asyncIterator]=== this._copy){
			// original function called, but iteration was already begun
			// return a new copy
			return yield* this._copy()
		}
		// from now on, anyone iterating gets a copy
		this[Symbol.asyncIterator]= this._copy

		var
		  iterator= this.source,
		  done= false,
		  value
		if( typeof iterator=== "function"){
			// an asyncc generator was passed in
			iterator= iterator()
		}
		if( !iterator.next&& iterator[Symbol.asyncIterator]){
			// an iterable was passed in
			iterator= iterator[Symbol.asyncIterator]()
		}
		try{
			while( !done){
				var
				  cur= this._next,
				  next= await iterator.next()
				value= next.value
				done= next.done

				if( !done){
					// prepare _next
					this._next= Defer()

					// tell everyone about this new value
					cur.resolve( value)
					// including whomever is running us. =]
					yield value
				}
			}
			this._next= null
		}catch(ex){
			this._next.reject( ex)
			this._next= null
			throw ex
		}
		this._done.resolve( value)
		return value
	}
	/**
	* Duplicate output from the reader on this unique generator
	* @private
	*/
	async * _copy(){
		if( this._next=== null){
			// done -- repeat the done value
			return await this._done
		}
		while( true){
			if( this._next){
				yield await this._next.promise
			}else{
				return await this._done.promise
			}
		}
	}
}
export default AsyncIteratorDemuxer
