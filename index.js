var
  esm= require( "@std/esm")( module)
  aid= esm( "./async-iterator-demuxer.js").default,
  basic1= esm( "./.example/basic-1.js").default
  basic2= esm( "./.example/basic-2.js").default

module.exports= aid
module.exports.AsyncIteratorDemuxer= aid
module.exports.example= {
	basic1,
	basic2
}
