var chai = require('chai'),
	should = chai.should,
	expect = chai.expect,
	Promise = require('bluebird'),
	request = require('superagent-promise')(require('superagent'), Promise),
	chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised)
var base_url = process.env.URL;//'http://localhost:8000/';//process.env.URL;//'http://todobacke-elasticl-195uzltps026i-1470655479.us-west-2.elb.amazonaws.com/';//'http://localhost:8000/';
var url = process.env.URL+"todos" || 'http://localhost:8000/todos';
var url_crear_expediente = base_url+'crear-expediente/';
var url_crear_opinion = base_url+'crear-opinion/';
var url_crear_dictamen = base_url+'crear-dictamen/';
var url_crear_providencia = base_url+'emitir-providencia/';
var ulr_crear_estado = base_url+'crear-estado/'

var randomN = Math.floor(Math.random() * 10000) + 1;
var expediente_usar;


/*describe('Cross Origin Rquests', function(){
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

});*/
/*
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

	after(function(){
		return del(url);
	});

});
*/
describe ('Crear expediente', function(){
	var result_expediente;
	var result_expediente_bad;
	var result_estado;
	var result_estado2;

	before(function(){
		/*var file = require('fs');
		file.writeFile("/tmp/mytext.txt", "Hey there!", function(err) {
		    if(err) {
		        return console.log(err);
		    }
		    //console.log("The file was saved!");
		});*/
		result_estado = post(ulr_crear_estado,{'gerencia':'Gerencia Juridica', 'estado': 'Pendiente'})
		result_estado2 = post(ulr_crear_estado,{'gerencia':'Gerencia Juridica', 'estado': 'Aceptado'})
		result_expediente = post(url_crear_expediente,{'numero':1,'key':'llavePruebaExpedienteTest'+String(randomN),'estado': 1,
                                			  'solicitante': 1/*,
                                				'documentos':{'nombre':'test','archivo':file}*/});
	});

	it('should return a 201 CREATED response', function(){
		return assert(result_estado, "status").to.equal(201);
	});

	it('should return a 201 CREATED response', function(){
		return assert(result_estado2, "status").to.equal(201);
	});

	it('should return a 201 CREATED response', function(){
		return assert(result_expediente, "status").to.equal(201);
	});

	it('should create the expediente', function(){
		var item = result_expediente.then(function(res){
			expediente_usar = String(res.body['numero_instancia']);
			return get(base_url+"expediente/"+String(res.body['numero_instancia']));
		});
		return assert(item, "body.key").that.equals('llavePruebaExpedienteTest'+String(randomN));
	});

	it('should update the expediente', function(){
		result_expediente_actualizado = update(base_url+"actualizar-expediente/"+expediente_usar+"/",'PUT',{'estado':2});
		return assert(result_expediente_actualizado, "status").to.equal(200);
	});

});

describe ('Crear opinion', function(){
	var result_opinion;

	before(function(){
		result_opinion = post(url_crear_opinion,{'expediente': parseInt(expediente_usar),
																						 'asesor': 1,
																					   'descripcion': 'Test de descripcion '+String(randomN)});

	});


	it('should return a 201 CREATED response', function(){
		return assert(result_opinion, "status").to.equal(201);
	});

	it('should create the opinion', function(){
		var item = result_opinion.then(function(res){
			return get(base_url+"opinion/"+String(expediente_usar));
		});
		return assert(item, "body.descripcion").that.equals('Test de descripcion '+String(randomN));
	});

});

describe ('Crear dictamen', function(){
	var result_dictamen;

	before(function(){
		result_dictamen = post(url_crear_dictamen,{'expediente': parseInt(expediente_usar),
																						 'asesor': 1,
																					   'descripcion': 'Test de descripcion '+String(randomN),
																					 	 'campo_procuraduria': 'Procuradoria test '+String(randomN)});

	});


	it('should return a 201 CREATED response', function(){
		return assert(result_dictamen, "status").to.equal(201);
	});

	it('should create the opinion', function(){
		var item = result_dictamen.then(function(res){
			return get(base_url+"dictamen/"+String(expediente_usar));
		});
		return assert(item, "body.descripcion").that.equals('Test de descripcion '+String(randomN));
	});

});

describe ('Emitir Providencia', function(){
	var result_providencia;

	before(function(){
		result_providencia = post(url_crear_providencia,{'gerencia_destino': 1,
																										 'expediente': parseInt(expediente_usar),
																						 				 'asunto': 'Asunto '+String(randomN),
																					   		 		 'descripcion': 'Test de descripcion '+String(randomN)});

	});

	it('should return a 201 CREATED response', function(){
		return assert(result_providencia, "status").to.equal(201);
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
