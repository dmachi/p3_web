define([
	"dijit/form/FilteringSelect","dojo/_base/declare",
	"dojo/store/JsonRest"
], function(
	FilteringSelect, declare, 
	Store
){
	
	return declare([FilteringSelect], {
		apiServiceUrl: window.App.dataAPI,
		promptMessage:'Scientific name of the organism being annotated.',
		missingMessage:'Scientific Name must be provided.',
		placeHolder:'e.g. Bacillus Cereus',
		searchAttr: "taxon_name",
		//query: "?&select(taxon_name)",
		queryExpr: "*${0}*",
		query: {select: "taxon_name,taxon_id"},
		highlightMatch: "all",
		autoComplete: false,
		store: null,
		constructor: function(){
			if (!this.store){
				this.store = new Store({target: this.apiServiceUrl + "/taxonomy/", idProperty: "taxon_id", header: {accept: "application/json"}});
			}
		},
		isValid: function(){
			return (!this.required || this.get('displayedValue') != "");
		}
	});
});