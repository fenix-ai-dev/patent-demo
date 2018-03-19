
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////// VUE ///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var background_list = {};
var claim_update = false;

Vue.prototype.$eventHub = new Vue();
importBoilerplate();

Vue.directive('focus', {
  inserted: function (el, binding, vnode) {
    Vue.nextTick(function() {
      el.focus()
    })
  }
})

Vue.component('claim', {
	template: '#claim-template',
	props: {
		model: Object,
	},
	methods: {
		deleteChild: function(index) {
			console.log('delete child')
			this.model.children.splice(index, 1);
			this.$forceUpdate();
		},
		newFeature: function(event) {
			console.log('new feature');
			this.model.features.push({text:""});
		},
		deleteFeature: function(index) {
			console.log('delete feature');
			if (this.model.features.length > 1)
				this.model.features.splice(index, 1);			
		},
		moveChild: function(from, to) {
			console.log('move child');
			if (this.model.children[from] && this.model.children[to]){
				this.model.children.splice(to, 0, this.model.children.splice(from, 1)[0]);
				this.$refs.children[to].$refs.features[0].$el.focus();
			}
		},
		demoteChild: function(index){
			console.log('demote child');
			if (this.$refs.children[index] && this.$refs.children[index -1]){
				var child = this.model.children[index]
				this.$refs.children[index - 1].addChild(child);
				this.model.children.splice(index, 1);
			}
		},
		promoteChild: function(child_index, grandchild_index){
			console.log('promote grandchild');
			var child = this.$refs.children[child_index];
			var grandchild = child.model.children[grandchild_index];
			if (child && grandchild){
				this.addChild(grandchild);
				child.deleteChild(grandchild_index);
			}
		},
		addChild: function(child) {
			console.log('add child');
			var category = this.model.category || 'process';
			child = child || {features: [{text:""}], children: [], category: category};
			this.model.children.push(child);
			this.$forceUpdate();
		},
	},
	created: function(){
		this.model.children = this.model.children || [];
		this.model.features = this.model.features || [];
		this.model.category = 'process';
	},
})

Vue.component('feature',{
	template: '#feature-template',
	props: {
		model: Object,
	},
	methods:{
		update: function(event){
			//console.log('update text');
			var new_text = this.$el.innerText;
			this.$el.innerText = new_text;
	  		this.model.text = new_text;
	  		this.model.components = [featureComponent(new_text)];
		},
	},
	created: function(){
		this.model.text = this.model.text || '';
		this.model.components = this.model.components || ['application component'];
	},
})

Vue.component('claims', {
	template: '#claims-template',
	props: {
		model: Object,
	},
	methods: {
		deleteChild: function(index){
			console.log('delete independent claim');
			this.$delete(this.model, index);
		},
		addChild: function(child) {
			console.log('add child');
			this.model.push(child);
			this.$forceUpdate();
		},
		newClaim: function(){
			console.log('add new independent claim');
			this.model.push({features: [{text:""}], children: []})
		},
		moveChild: function(from, to) {
			console.log('move indep claim')
			if (this.model[from] && this.model[to]){
				this.model.splice(to, 0, this.model.splice(from, 1)[0]);
				this.$refs.children[to].$refs.features[0].$el.focus();
			}
		},
		demoteChild: function(index){
			console.log('demote indep claim')
			if (this.$refs.children[index] && this.$refs.children[index -1]){
				var child = this.model[index]
				this.$refs.children[index - 1].addChild(child);
				this.model.splice(index, 1);
			}
		},
		promoteChild: function(child_index, grandchild_index){
			console.log('promote grandchild');
			var child = this.$refs.children[child_index];
			var grandchild = child.model.children[grandchild_index];
			if (child && grandchild){
				this.addChild(grandchild);
				child.deleteChild(grandchild_index);
			}
		},
	},
})

Vue.component('info', {
	template: '#info-template',
	props: {
		model: Object,
	},
	methods: {
		update: function(){
			console.log('updating app info');
			this.$forceUpdate();
		},
	},
	created: function(){
		this.$eventHub.$on('update-info', this.update);
		this.$eventHub.$on('add-component', this.addComponent);
	},
})

var application = new Vue({
	el: '#application',
	data: function() {
		return {
			app: {info: {}, claims: []},
		}
	},
	methods: {
		print: function(){
			console.log('get application documents');
			var demo_app = processApp(this.app);
			console.log(demo_app);
			getApp(demo_app);
		},
	},
	created: function() {
		this.$eventHub.$on('load', this.load);
	}
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////// REST //////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function importBoilerplate(){
	var data = JSON.stringify({document: resources, sheet: 'library'});
	request("POST", server_url + 'sheet', data, function(res){
		var background = JSON.parse(res).values;
		if (background){
			background.forEach( (topic, index) => {
				if (index > 0)
					background_list[topic[0]] = topic[1];
			})
		}
	});
}

function importData(doc, sheet, callback){
	var post_data = JSON.stringify({sheet: sheet, document: doc});
	console.log(post_data)
	request("POST", server_url + 'sheet', post_data, function(res){
		var res_data = JSON.parse(res);
		console.log(res_data);
		callback(res_data);
	});
}

function getApp(data){
	getFile(data, 'spec', function(){
		getFile(data, 'draw');
	})
}

function getFile(data, type, callback){
	string_data = JSON.stringify(data).replace(/&/g, 'and')
	request("POST", server_url + type, string_data, function(file_name){
		var download_url = server_url + file_name;
		downloadURL(download_url, file_name);
		if (callback)
			callback();
	});
}

function request(type, url, data, action){
	var xmlhttp = new XMLHttpRequest();
	data = data.replace(/&nbsp;/g, ' ');

	xmlhttp.onreadystatechange = function(){
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200 && action)
				action(xmlhttp.responseText);
		else if (xmlhttp.readyState == 4)
			console.log('error: no response from server');
	}

	xmlhttp.open(type, url, true);
	xmlhttp.send(data);
}

function downloadURL(url, file_name){
	console.log('downloading file: ' + url);
	var download_link = document.createElement("a");
	download_link.href = url.replace('\/public', '');
	download_link.click();
}

function clone(object){
	return Object.assign({}, object);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////// DEMO //////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
var articles = ['a', 'the', 'an', 'each','one', 'at', 'another', 'said'];

function gerund(verb) {
	var last = verb.charAt(verb.length - 1).toLowerCase();
	var second_last = verb.charAt(verb.length - 2).toLowerCase();
	var third_last = verb.charAt(verb.length - 3).toLowerCase();

	if (verb.slice(-3).toLowerCase() == 'ing' && verb.length > 4){
	}
	else if (second_last == 'i' && last == 'e') {
		verb = verb.slice(0, -2) + 'ying';
	}
	else if (last == 'e') {
		verb = verb.slice(0, -1) + 'ing';
	}
	else if (vowels.indexOf(third_last) < 0 && vowels.indexOf(last) < 0 && vowels.indexOf(second_last) > -1 && last != 'w' && last != 'x' && last != 'y'){
		verb += last + 'ing';
	}
	else {
		verb += 'ing';
	}

	return verb;
}

function featureComponent(text){
	text = text || '';
	words = text.trim().split(' ');

	if (articles.indexOf(words[0]) > -1)
		return ('application component');
	else
		return gerund(words[0]) + ' component';

}

function processApp(app){
	var demo_app = demo_app_base;
	Object.keys(app.info).forEach(key => {
		if (app.info.key)
			demo_app.info.key = app.info.key
	})

	demo_app.figures = [block_diagram];
	var components = [];

	demo_app.claims = app.claims;
	demo_app.claims.forEach(indep_claim =>{
		var flowchart = {
			"category": "flowchart",
			"description": "a process for {DESCRIPTION}",
			"steps": indep_claim.features,
		}

		indep_claim.features.forEach(feature => {
			feature.components.forEach(component => {
				if (components.indexOf(component) < 0)
					components.push(component);
			})
		})

		demo_app.figures[0].components[0].children[1].children = components.map(component => {return {name: component}});
		demo_app.figures.push(flowchart);
	})

	var app_string = JSON.stringify(demo_app).replace(/{DESCRIPTION}/g, demo_app.info.description);

	return JSON.parse(app_string);
}

var block_diagram = {
	"category": "diagram",
	"description": "a block diagram of a computing device",
	"components": [{
		"name": "computing device",
		"children": [
			{"name": "processor"}, 
			{"name": "application component", "children": []}, 
			{"name": "memory"}
		]
	}],
}

var demo_app_base = {
	"info": {
		"client": "Demo",
		"identifier": "DEMO_001",
		"title": "{title of the invention}",
		"field": "{field of the invention}",
		"description": "{description of the invention}",
		"inventor": "{inventor}",
	},
	"parts": [{
		"sentences": ["A processor may include an intelligent hardware device, (e.g., a general-purpose processing component, a DSP, a CPU, a microcontroller, an ASIC, an FPGA, a programmable logic device, a discrete gate or transistor logic component, a discrete hardware component, or any combination thereof). In some cases, the processor may be configured to operate a memory array using a memory controller. In other cases, a memory controller may be integrated into processor. The processor may be configured to execute computer-readable instructions stored in a memory to perform various functions. In some examples, a processor may include special purpose components for modem processing, baseband processing, digital signal processing, or transmission processing. In some examples, the processor may comprise a system-on-a-chip."],
		"topic": "processor",
		"type": "detail",
		"figure": "1"
	}, {
		"sentences": ["Memory may include RAM, ROM, or a hard disk. The memory may be solid state or a hard disk drive, and may include store computer-readable, computer-executable software including instructions that, when executed, cause a processor to perform various functions described herein. In some cases, the memory may contain, among other things, a BIOS which may control basic hardware or software operation such as the interaction with peripheral components or devices. In some cases, a memory controller may operate memory cells as described herein. In some cases, memory controller may include a row decoder, column decoder, or both. In some cases, memory cells within a memory may store information in the form of a logical state."],
		"topic": "memory",
		"type": "detail",
		"figure": "1"
	}],
	"acronyms": [{
		"abbreviation": "RAM",
		"definition": "random access memory"
	}, {
		"abbreviation": "ROM",
		"definition": "read only memory"
	}, {
		"abbreviation": "ASIC",
		"definition": "application specific integrated circuit"
	}, {
		"abbreviation": "FPGA",
		"definition": "field programmable gate array"
	}],
	"figures": [],
	"configuration": {
		"numbering": "true",
		"indent": "0",
		"font": "Times New Roman",
		"header": " ",
		"footer": "Attorney Docket No. DEMO_001",
		"template": "1YX9yCCXqeqlbgvO6vL2Of_EO0HJGsM4a",
		"transition": "in some cases",
		"conclusion": "in accordance with aspects of the present disclosure",
		"flowchart": "In some examples, these operations may be performed by a processor executing a set of codes to control functional elements of an apparatus. Additionally or alternatively, the processes may be performed using special-purpose hardware. Generally, these operations may be performed according to the methods and processes described in accordance with aspects of the present disclosure. For example, the operations may be composed of various substeps, or may be performed in conjunction with other operations described herein.",
		"process": [{
			"category": "process",
			"type": "method",
			"verb": "gerund"
		}, {
			"category": "process",
			"type": "apparatus",
			"verb": "infinitive",
			"prefix": "",
			"preamble": "An apparatus for {DESCRIPTION}, comprising: a processor and a memory storing instructions and in electronic communication with the processor, the processor being configured to execute the instructions to:",
			"transition": "the processor being further configured to execute the instructions to",
			"summary": "An apparatus for {DESCRIPTION} is described. The apparatus may include a processor, memory in electronic communication with the processor, and instructions stored in the memory. The instructions may be operable to cause the processor to"
		}, {
			"category": "process",
			"type": "non-transitory computer-readable medium",
			"verb": "infinitive",
			"prefix": "",
			"preamble": "A non-transitory computer readable medium storing code for {DESCRIPTION}, the code comprising instructions executable by a processor to:",
			"transition": "the code further comprising instructions executable by the processor to",
			"summary": "A non-transitory computer readable medium storing code for {DESCRIPTION} is described. In some examples, the code comprises instructions executable by a processor to:"
		}, {
			"category": "process",
			"type": "apparatus",
			"verb": "gerund",
			"prefix": "means for"
		}],
		"device": [],
		"drawings": "1jZfm-gyWC1XbyiREGhSvZmG_v8f7JHDH",
		"summary": "long",
	}
}