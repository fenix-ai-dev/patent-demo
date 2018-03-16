
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
		select: function(){
			//console.log('select claim');
			this.$eventHub.$emit('unselect-claim');
			var claim = this;
			claim_update = true;
			Vue.nextTick(function(){
				if (claim_update){
					claim.model.selected = true;
					claim.$forceUpdate();
					claim_update = false;
				}
				
			})
		},
		unselect: function(){
			//console.log('unselect claim')
			this.model.selected = false;
			this.$forceUpdate();
		},
	},
	created: function(){
		this.model.children = this.model.children || [];
		this.model.features = this.model.features || [];
		this.model.category = 'process';
		//event handlers
		this.$eventHub.$on('unselect-claim', this.unselect);
	},
	mounted: function () {
		this.$nextTick(function () {
			this.$eventHub.$emit('unselect-claim');
		})
	}
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
		},
		select: function(){
			//console.log('select feature');
			this.$eventHub.$emit('unselect-claim');
			var feature = this;
			Vue.nextTick(function(){
				feature.$emit('select');
				feature.model.selected = true;
			})
		},
		unselect: function(){
			//console.log('unselect feature')				
			this.model.selected = false;
		},
	},
	created: function(){
		this.model.text = this.model.text || '';
		this.model.components = this.model.components || ['component'];
		this.model.selected = false;
		//event handlers
		this.$eventHub.$on('unselect-claim', this.unselect);
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
		flowchart: function(features){
			console.log(features);
			this.$eventHub.$emit('flowchart', features);
		}
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
			app: {info: {}, claims: {}},
		}
	},
	methods: {
		print: function(){
			console.log('get specification');
			getFile(this.app, 'spec');

			console.log('get drawings');
			getFile(this.app, 'draw');
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

function getFile(data, type){
	string_data = JSON.stringify(data).replace(/&/g, 'and')
	request("POST", server_url + type, string_data, function(file_name){
		var download_url = server_url + file_name;
		downloadURL(download_url, file_name);
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

