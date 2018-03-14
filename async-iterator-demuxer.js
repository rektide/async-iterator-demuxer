import Immediate from "p-immediate"
import Defer from "p-defer"
import ExtensibleAsyncGeneratorFunction from "extensible-function/async-generator.js"

/**
* Create multiple asyncIterators from a single asyncIterator.
*/
export class AsyncIteratorDemuxer extends ExtensibleAsyncGeneratorFunction{
	constructor( source){
		super(this[Symbol.asyncIterator].bind(this))
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
	* Only one copy of this ought be run
	* @private
	*/
	async * _reader(){
		var
		  iterator= this.source[Symbol.asyncIterator](),
		  done= false,
		  value
		try{
			while( !done){
				var
				  cur= this._next
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
	/**
	* Directly iterating this class will spawn a new async-generator
	*/
	async * [Symbol.asyncIterator](){
		return this._next? this._copy(): this._reader()
	}
}
export default AsyncIteratorDemuxer
