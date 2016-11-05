var chai = require('chai'),
	should = chai.should,
	expect = chai.expect,
	Promise = require('bluebird'),
	request = require('superagent-promise')(require('superagent'), Promise),
	chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised)
var base_url = 'http://localhost:8000/'
var url = process.env.URL || 'http://localhost:8000/todos';
var url_crear_expediente = base_url+'crear-expediente/';


describe('Cross Origin Rquests', function(){
	var result;

	before(function (){
		result = request('OPTIONS', url)
			.set('Origin', 'http://someplace.com')
			.end();


	});

	it('should return the correct CORS headers', function(){
		return assert(result, "header").to.contains.all.keys([
			'access-control-allow-origin',
			'access-control-allow-methods',
			'access-control-allow-headers',

		]);

	});

	it('should allow all origins', function(){
		return assert(result, 'header.access-control-allow-origin').to.equal('*');

	});

});

describe('Create Todo Item', function(){
	var result;

	before(function(){
		result = post(url, {title: 'Walk the dog'});
	});

	it('should return a 201 CREATED response', function(){
		return assert(result, "status").to.equal(201);
	});

	it('should receive a location hyperlink', function(){
		return assert(result, 'header.location').to.match(/^https?:\/\/.+\/todos\/[\d]+$/);
	});

	it('should create the item', function(){
		var item = result.then(function(res){
			return get(res.header['location']);
		});
		return assert(item, "body.title").that.equals('Walk the dog');
	});

	// una para crear expediente
	// verificar regrese 201
	// verificar que tenga el location hyperlink

	// una para crear opinion

	// una para crear dictamen

	after(function(){
		return del(url);
	});

});

describe ('Crear expediente', function(){
	var result_expediente;

	before(function(){
		var file = require('fs');
		file.writeFile("/tmp/mytext.txt", "Hey there!", function(err) {
		    if(err) {
		        return console.log(err);
		    }
		    console.log("The file was saved!");
		});
		result_expediente = post(url_crear_expediente,{'numero':1,'key':'llavePruebaExpedienteTest4','estado': 1,
                                			  'solicitante': 1,
                                				'documentos':{'nombre':'test','archivo':file}});
	});


	it('should return a 201 CREATED response', function(){
		return assert(result_expediente, "status").to.equal(201);
	});

});

/*
Convenience functions
*/

function post(url, data ){

	return request.post(url)
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')
		.send(data)
		.end();
}

function get(url){
	return request.get(url)
		.set('Accept', 'application/json')
		.end();
}

function del(url){
	return request.del(url).end();
}

function update(url, method, data){
	return request(method, url)
	.set('Content-Type', 'application/json')
	.set('Accept', 'application/json')
	.send(data)
	.end();

}

function assert(result, prop){
	return expect(result).to.eventually.have.deep.property(prop)

}
