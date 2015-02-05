define("p3/widget/WorkspaceBrowser", [
	"dojo/_base/declare","dijit/layout/BorderContainer","dojo/on",
	"dojo/dom-class","dijit/layout/ContentPane","dojo/dom-construct",
	"./WorkspaceExplorerView","dojo/topic","./ItemDetailPanel",
	"./ActionBar","dojo/_base/Deferred"
], function(
	declare, BorderContainer, on,
	domClass,ContentPane,domConstruct,
	WorkspaceExplorerView,Topic,ItemDetailPanel,
	ActionBar,Deferred
){
	return declare([BorderContainer], {
		"baseClass": "WorkspaceBrowser",
		"disabled":false,
		"path": "/",
		gutters: false,
		startup: function(){
			if (this._started) {return;}
			var parts = this.path.split("/").filter(function(x){ return x!=""; })
			var out = ["<span class='wsBreadCrumb'>"];
			var parts = this.path.split("/").filter(function(x){ return x!=""; });
			var len = parts.length;
			var bp = ["workspace"];
			parts.forEach(function(p,idx){
				if (idx == (parts.length-1)){
					out.push(p + "&nbsp;/");
					return;
				}
				out.push("<a class='navigationLink' href='");
				bp.push(p);
				out.push("/" + bp.join("/")+"/")
				out.push("'>" + p + "</a>&nbsp;/&nbsp;");
			})
			out.push("</span>");
			out.push("<span style='float:right;font-size:.75em;'>");
			out.push("<a href class='DialogButton fa fa-upload fa-2x' rel='Upload:" + this.path + "' style='margin:4px;' title='Upload to Folder'></a>");
			out.push("<a href class='DialogButton fa fa-plus-square fa-2x' rel='CreateFolder:" + this.path + "' style='margin:4px;' title='Create Folder' ></a>");
			out.push("</span>");
			this.browserHeader = new ContentPane({className:"BrowserHeader",content: out.join(""), region: "top"});
			this.explorer = new WorkspaceExplorerView({path: this.path, region: "center"});
			this.actionPanel = new ActionBar({splitter:false,region:"right",layoutPriority:2, style:"width:32px;text-align:center;font-size:.75em;"});
			var self=this;

			this.actionPanel.addAction("EditItem","fa fa-info-circle fa-2x", {multiple: false,validTypes:["*"]}, function(selection){
				console.log("Edit Item Action", selection);
				self.itemDetailPanel.set("item",selection[0]);				
				if (self.getChildren().some(function(child){
					return child===self.itemDetailPanel
				})){
					self.removeChild(self.itemDetailPanel);
				}else{
					self.addChild(self.itemDetailPanel);
				}
				
			}, true);


			this.actionPanel.addAction("ViewItem","MultiButton fa fa-eye fa-2x", {
				multiple: false,
				validTypes: ["genome_group"]
			},function(selection){
				console.log("selection: ", selection);
				var sel = selection[0];
				switch (sel.type) {
					case "genome_group":
						Topic.publish("/navigate",{href:"/view/GenomeList"});
						break;
					default:
						console.log("Type isn't setup with a viewer");
				}
			}, true);


			/*
			this.actionPanel.addAction("DownloadItem","fa fa-download fa-2x",{multiple: false,validTypes:["*"]}, function(selection){
				console.log("Download Item Action", selection);
			}, true);
			*/

			this.actionPanel.addAction("UploadItem","fa fa-upload fa-2x", {multiple: false,validTypes:["*"]}, function(selection){
				console.log("Replace Item Action", selection);
				Topic.publish("/openDialog",{type:"UploadReplace",params:{path: selection[0].path}});
			}, true);


			this.actionPanel.addAction("DeleteItem","fa fa-trash fa-2x",{allowMultiTypes:true,multiple: true,validTypes:["*"]}, function(selection){
				var objs = selection.map(function(s){
					console.log('s: ', s, s.data);
					return s.path||s.data.path;
				});

				Deferred.when(window.App.api.workspace("Workspace.delete",[{objects:objs}]), function(results){
					console.log("Delete Object Results: ", results);
					self.refresh();
				});

				console.log("Delete Item Action", selection);
			}, true);



//			this.actionPanel = new ContentPane({content: '<div style="width:40px;height:40px;border:1px solid gray;margin-2px;margin-top:4px;margin-bottom:4px;"></div><div style="width:40px;height:40px;border:1px solid gray;margin-2px;margin-top:4px;margin-bottom:4px;"></div>',region: right, style: "width:44px;background:#efefef;", splitter: false, region: "right"});

//			this.actionPanel = new ContentPane({region: "right",style: "width:44px;background:#efefef;", content: '<div style="width:40px;height:40px;border:1px solid gray;margin-2px;margin-top:4px;margin-bottom:4px;"></div><div style="width:40px;height:40px;border:1px solid gray;margin-2px;margin-top:4px;margin-bottom:4px;"></div>', layoutPriority:2});
			this.detailPanel = new ContentPane({content: "Detail", style:"width:300px", region: "right", splitter: false, layoutPriorty:1});
			this.itemDetailPanel = new ItemDetailPanel({region: "right", style: "width:300px", splitter: false, layoutPriority:1})
			this.itemDetailPanel.startup();
			this.addChild(this.browserHeader);
			this.addChild(this.explorer); 
			this.addChild(this.actionPanel);
//			this.addChild(this.detailPanel);

			var self=this;
			Topic.subscribe("/select", function(selection){

				if (selection.length==0){
					var done=0;
					self.removeChild(self.actionPanel);
					self.getChildren().some(function(child){
						if (child===self.detailPanel){
							self.removeChild(self.detailPanel);
							done++;
						}
						if (child===self.itemDetailPanel){
							self.removeChild(self.itemDetailPanel);
							done++;
						}
						if (done>1) { return true; }	
					});
					return;
				}

				self.actionPanel.set('selection', selection);
				self.addChild(self.actionPanel);
				/*
				if (selection.length==1){
					if (!self.getChildren().some(function(child){
						return child===self.detailPanel
					})){
						self.removeChild(self.detailPanel);
					}

					console.log("Set Item Detail Panel: ", selection[0]);
	
					self.itemDetailPanel.set("item",selection[0]);	

					console.log("itemDetailPanel: ", self.itemDetailPanel);
					self.addChild(self.actionPanel);
					if (!self.getChildren().some(function(child){
						return child===self.itemDetailPanel
					})){
						self.addChild(self.itemDetailPanel);
					}
					
				}else{
					if (!self.getChildren().some(function(child){
						return child===self.itemDetailPanel
					})){
						self.removeChild(self.itemDetailPanel);
					}

					self.addChild(self.actionPanel);
					if (!self.getChildren().some(function(child){
						return child===self.detailPanel
					})){
						self.addChild(self.detailPanel);
					}
	
					self.detailPanel.set("content", selection.length + " Items Selected");
				}
				*/
			});	
			this.inherited(arguments);

		},
		_setPathAttr: function(val){
			console.log("WorkspaceBrowser setPath()", val)
			this.path = val;
			var parts = this.path.split("/").filter(function(x){ return x!=""; });
			var workspace = parts[0] + "/" + parts[1];
			console.log("Publish to ActiveWorkspace:",workspace,val)
			Topic.publish("/ActiveWorkspace",{workspace: workspace, path:val});

			if (this._started){
				var len = parts.length;
				var out = [];
				var bp = ["workspace"];
				parts.forEach(function(p,idx){
					if (idx == (parts.length-1)){
						out.push(p + "&nbsp;/");
						return;
					}
					out.push("<a class='navigationLink' href='");
					bp.push(p);
					out.push("/" + bp.join("/")+"/")
					out.push("'>" + p + "</a>&nbsp;/&nbsp;");
				})
				//out.push("<span>" + parts.join("/") + "</span>");
				out.push("<span style='float:right;font-size:.75em;'>");
				out.push("<a href class='DialogButton fa fa-upload fa-2x' rel='Upload:" + this.path + "' style='margin:4px;' title='Upload to Folder'></a>");
				out.push("<a href class='DialogButton fa fa-plus-square fa-2x' rel='CreateFolder:" + this.path + "' style='margin:4px;' title='Create Folder' ></a>");


				this.browserHeader.set("content", out.join(""));

				console.log("Set Explorer set()", val);
				this.explorer.set("path", val);
			}
		},
		refresh: function(){
			this.explorer.refreshWorkspace()
		},
		getMenuButtons: function(){
			// console.log("Get Menu Buttons");
	  //       if (this.buttons) { return this.buttons; }
	  //       this.buttons = [];
	  //       var b = domConstruct.create("div", {innerHTML:"Add Folder", 'class':'facetMenuIcon plusIcon',title:"Add Document Comment"});
	  //       on(b, "click", function(){
	  //               Topic.publish("/dialog/show","AddComment");
	  //       });
	  //       this.buttons.push(b);
	  		this.buttons=[];
	        return this.buttons;

		}
	});
});