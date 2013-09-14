/* **************************************************************

   Copyright 2013 Zoovy, Inc.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

************************************************************** */

(function($){
	$.fn.shuffle = function() {
		var j;
		for (var i = 0; i < this.length; i++) {
			j = Math.floor(Math.random() * this.length);
			if(i != j){
				$(this[i]).before($(this[j]));
			}
		}
		return this;
	};
})(jQuery);

//    !!! ->   TODO: replace 'username' in the line below with the merchants username.     <- !!!
var tikimaster = function() {
	var r = {

////////////////////////////////////   CALLBACKS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
		callbacks : {
//executed when extension is loaded. should include any validation that needs to occur.
			init : {
				onSuccess : function() {
					var r = false; //return false if extension won't load for some reason (account config, dependencies, etc).
					//app.u.dump("Tikimaser extension loaded");
					app.ext.tikimaster.u.loadFeaturedStoreBanner();
					app.rq.push(['templateFunction', 'homepageTemplate','onCompletes',function(P) {
						var $context = $(app.u.jqSelector('#',P.parentID));
						app.ext.tikimaster.u.showHomepageSlideshow();
						app.ext.tikimaster.u.prepareRootNavCats();
						
						$('.randomList', $context).each(function(){
							app.ext.tikimaster.u.randomizeList($(this)); // randomizes list
							app.ext.tikimaster.u.truncList($(this)); // to leave only 3-4 first items after shuffle
						});
						app.ext.tikimaster.u.loadFeaturedStoreBanner();
						
						// Make prod lists unfoldable on header-tab click
						$('.prodBlock .topRound').unbind().click(function() {
							$el = $(this).parent().parent().find('.prodBlockContent');
							$el.toggleClass('unfolded');
							if($el.hasClass('unfolded')) {
								curHeight = $el.height(),
								autoHeight = $el.css('height', 'auto').height();
								$el.height(curHeight).animate({height: autoHeight}, 800);
								$('html, body').animate({ scrollTop: $(this).offset().top-30 }, 600);
							} else {
								$el.animate({'height':'247px'},800);
							}
						});
					}]);
					
					
					var catTemplates = [
						'categoryTemplate',
						'categoryTemplateShowSubCats',
						'categoryTemplateVideos',
						'categoryTemplateVideosList',
						'categoryTemplateVideosWatch',
						'categoryTemplateAffiliates',
						'categoryTemplateAffiliatesSignUp',
						'categoryTemplateAffiliatesLinkExchange',
						'categoryTemplateAffiliatesContract',
						'categoryTemplateAffiliatesProgramDetails'
					];
					for(var t in catTemplates){
						app.rq.push(['templateFunction', catTemplates[t],'onCompletes',function(P){
							var title = '';
							if(P.navcat && app.data["appPageGet|"+P.navcat] && app.data["appPageGet|"+P.navcat]['%page']) {
								title = app.data["appPageGet|"+P.navcat]['%page'].page_title;
							}
							app.ext.tikimaster.u.setTitle(title);
							app.ext.tikimaster.u.makeDropDownBreadcrumb();
							app.ext.tikimaster.u.loadFeaturedStoreBanner();
						}]);
					}
					app.rq.push(['templateFunction', 'productTemplate','onCompletes',function(P){
						var title = app.data["appProductGet|"+P.pid]['%attribs']['zoovy:prod_name'];
						app.ext.tikimaster.u.setTitle(title);
						app.ext.tikimaster.u.addBreadCrumbToProductPage();
						app.ext.tikimaster.u.makeDropDownBreadcrumb();
						app.ext.tikimaster.u.loadFeaturedStoreBanner();
					}]);
					app.rq.push(['templateFunction', 'companyTemplate','onCompletes',function(P){
						var title = "SportsWorldChicago Help Desk";
						app.ext.tikimaster.u.setTitle(title);
					}]);
					app.rq.push(['templateFunction', 'customerTemplate','onCompletes',function(P){
						var title = "Tikimaster - My account";
						app.ext.tikimaster.u.setTitle(title);
					}]);
					app.rq.push(['templateFunction', 'homepageTemplate','onCompletes',function(P){
						app.ext.tikimaster.u.setTitle();
					}]);
					app.rq.push(['templateFunction', 'pageNotFoundTemplate','onCompletes',function(P){
						app.ext.tikimaster.u.setTitle();
					}]);
					app.rq.push(['templateFunction', 'checkoutTemplate','onCompletes',function(P){
						app.ext.tikimaster.u.setTitle();
					}]);
					app.rq.push(['templateFunction', 'searchTemplate','onCompletes',function(P){
						app.ext.tikimaster.u.setTitle();
					}]);
					
					//if there is any functionality required for this extension to load, put it here. such as a check for async google, the FB object, etc. return false if dependencies are not present. don't check for other extensions.
					r = true;
					return r;
				},
				onError : function() {
					//errors will get reported for this callback as part of the extensions loading.  This is here for extra error handling purposes.
					//you may or may not need it.
					app.u.dump('BEGIN app.ext.tikimaster.callbacks.init.onError');
				}
			},
			startExtension : {
				onSuccess : function() {
					//app.u.dump("Tikimaser extension started");
/*				if(app.ext.store_navcats){
//Dispatches a call to get the productList for the hotItems List
					app.ext.store_navcats.calls.appNavcatDetail.init('$hot_items', {'callback':'populateHotItemsList','extension':'tikimaster', 'parentID':'hotItemList'});
					app.model.dispatchThis();
					
					}
					else {
						setTimeout(function(){app.ext.tikimaster.callbacks.startExtension.onSuccess()},250);
					}*/
				},
				onError : function() { 
					app.u.dump('BEGIN app.ext.tikimaster.callbacks.startExtension.onError');
				}
			},
		}, //callbacks

////////////////////////////////////   ACTIONS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
		a : {
			//actions are functions triggered by a user interaction, such as a click/tap.
			//these are going the way of the do do, in favor of app events. new extensions should have few (if any) actions.
			showDropDown : function ($tag) {
				//app.u.dump('showing');
				//console.log($tag.data('timeoutNoShow'));
				if(!$tag.data('timeoutNoShow') || $tag.data('timeoutNoShow')=== "false") {
					var $dropdown = $(".dropdown", $tag);
					var height = 0;
					$dropdown.show();
					if($dropdown.data('height')){
						height = $dropdown.data('height');
					} else{
						$dropdown.children().each(function(){
							height += $(this).outerHeight();
						});
					}
					height += 25;
					if($tag.data('timeout') && $tag.data('timeout')!== "false"){
						clearTimeout($tag.data('timeout'));
						$tag.data('timeout','false');
						
					}
					$dropdown.stop().animate({"height":height+"px"}, 400);
					return true;
				}
				return false;
			},
			showDropDownClick : function($tag){
				//app.u.dump('showClick');
				if(this.showDropDown($tag)){
					$('.dropdown',$tag).unbind('click');
					$('.dropdown',$tag).click(function(event){event.stopPropagation()});
					$tag.attr('onClick','').unbind('click');
					setTimeout(function(){$('body').click(function(){
						app.ext.cubworld.a.hideDropDownClick($tag);
					});}, 500);
				}
			},
			hideDropDown : function ($tag) {
				//app.u.dump('hiding');
				$(".dropdown", $tag).stop().animate({"height":"0px"}, 400);
				if($tag.data('timeout') && $tag.data('timeout')!== "false"){
					$tag.data('timeout')
					$tag.data('timeout','false');
				}
				$tag.data('timeout',setTimeout(function(){$(".dropdown", $tag).hide();},400));
				return true;
			},
			hideDropDownClick : function($tag){
				//app.u.dump('hideClick');
				if(this.hideDropDown($tag)){
					$tag.click(function(){app.ext.cubworld.a.showDropDownClick($(this));});
					$('body').unbind('click');
				}
			},
			hideDropDownOnSelect : function($tag){
				this.hideDropDown($tag);
				$tag.data('timeoutNoShow', setTimeout(function(){$tag.data('timeoutNoShow', 'false');}, 500));
			},
		}, //Actions

////////////////////////////////////   RENDERFORMATS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
		renderFormats : {
			//renderFormats are what is used to actually output data.
			//on a data-bind, format: is equal to a renderformat. extension: tells the rendering engine where to look for the renderFormat.
			//that way, two render formats named the same (but in different extensions) don't overwrite each other.
			showReviewLink : function($tag, data){
				if(data.value && data.value > 0){
					$tag.hide();
					}
			},
			atcForm : function($tag,data)	{
				$tag.append("<input type='hidden' name='sku' value='"+data.value.pid+"' />");
				if(data.value["%attribs"]["is:user3"]){
					$tag.attr("onSubmit","").unbind("submit");
					$tag.bind('submit', function(){
						var $notice = $('<div><div>'+app.ext.tikimaster.vars.customPrompt+'</div></div>');
						
						var $button = $('<div class="alignRight"><button class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only"><span class="ui-button-text">I agree</span></button></div>');
						$button.bind('click',function(){
							$notice.dialog('close');
							app.ext.myRIA.u.addItemToCart($tag,{'action':'modal'}); 
							return false;
							});
							
						$notice.append($button);
						
						$notice.dialog({'modal':'true','title':'Custom Product Agreement', 'width':400});
						return false;
					});
				}
			},
			truncHTML : function($tag,data){
				// removes all html tags from data.value, then truncates to numCharacters
				// can be useful for truncating prod_desc (mix of wiki/html) - to show in product lists
				var o = data.value.replace(/<.+?>/g,'');
				o = app.u.truncate(o,data.bindData.numCharacters);
				$tag.text(o);
			} //truncHTML
		}, //renderFormats

////////////////////////////////////   UTIL [u]   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
		u : {
			//utilities are typically functions that are exected by an event or action.
			//any functions that are recycled should be here.
			showHomepageSlideshow : function(){
				//app.u.dump("Tikimaser slideshow started");
				
				// homepage slideshow
				if(!$('#slideshowNav').children().length) {
					//$('#slideshowNav').html('');
					//app.u.dump('!!!!!!!!Slideshow init');
					$('#wideSlideshow').unbind().cycle({
						pager:'#slideshowNav',
						fx:'fade',
						speed:'slow',
						timeout: 3500,
					});
				}
			},
			prepareRootNavCats : function(){
				$("#leftNav ul li").unbind()
													 .mouseover(function() { app.ext.tikimaster.a.showDropDown($(this)); })
													 .mouseout(function() { app.ext.tikimaster.a.hideDropDown($(this)); });
				$("#leftNav ul li span").click(function() { showContent('category',{'navcat':$(this).parent().attr('data-catsafeid')}) });
				$("#leftNav ul li > ul li").click(function() { showContent('category',{'navcat':$(this).attr('data-catsafeid')}) });
			},
			makeDropDownBreadcrumb : function(){
				//app.u.dump("Tikimaser makeDropDownBreadcrumb started");
				
				// rootcat '.' has a pretty name 'New UnNamed Category'
				// our api returns it like that. lets fix
				$('.breadcrumb > li:first-child a').html(app.ext.tikimaster.vars.breadcrumbRootName);
				
				// lets add <ul> with subcats to every breadcrumb item
				$('.breadcrumb > li').each(function() {
					var subcats;
					if($(this).attr('data-catsafeid') && app.data['appCategoryDetail|'+$(this).attr('data-catsafeid')]) {
						subcats = app.data['appCategoryDetail|'+$(this).attr('data-catsafeid')]['@subcategoryDetail'];
					}
					
					if(subcats) {
						$(this).addClass('hasSubcats');
						$(this).find('.dropdown').remove();
						$(this).append('<ul class="dropdown displayNone"></ul>');
						var $dropdown = $(this).find('ul.dropdown');
					
						for (var i = 0; i < subcats.length; i++) {
							if(subcats[i].pretty && subcats[i].pretty.search(/^\w/) == 0 && subcats[i].id) {
								$dropdown.append('<li data-catsafeid="'+subcats[i].id+'">'+subcats[i].pretty+'</li>');
							}
						}
					}
				});
				
				// add onclick events to all dropdown menus
				$('.breadcrumb > li ul.dropdown li').click(function() {
					app.ext.tikimaster.a.hideDropDownOnSelect($(this).parent().parent()); 
					return showContent('category',{'navcat':$(this).attr('data-catsafeid')});
				})
				
			},
			addBreadCrumbToProductPage : function() {
				// if we arrived to the product page directly from search
				// there's no breadcrumb at all
				// Jerome asked to add 'Home' dropdown element with root cats
				if(!$('.breadcrumb').children().length) {
					// fetch root cat with subcats details
					var tagObj = {'datapointer' : 'appCategoryDetail|.'};
					app.model.fetchData(tagObj.datapointer);
					var bc_inner = "<li class='pointer' onmouseout='app.ext.tikimaster.a.hideDropDown($(this));' onmouseover='app.ext.tikimaster.a.showDropDown($(this));' data-catsafeid='.'><a onclick=\"return showContent('category',{'navcat':$(this).parent().attr('data-catsafeid')});\" href='#'>Home</a></li>";
					$('.breadcrumb').prepend(bc_inner);
				}
			},
			getPPI : function(){
				
				if(window.devicePixelRatio){
					app.u.dump("devicePixelRatio set: "+window.devicePixelRatio);
					return Math.floor(96*parseFloat(window.devicePixelRatio));
					}
				
				var min=0;
				var max=1000;
				
				while(min != max && min != max-1){
					var target = Math.floor((max+min)/2);
					if(!window.matchMedia('(min-resolution:'+target+'dpi)').matches &&
					   !window.matchMedia('(max-resolution:'+target+'dpi)').matches){
						return -1;
						}
					if(window.matchMedia('(min-resolution:'+target+'dpi)').matches){min = target;}
					if(window.matchMedia('(max-resolution:'+target+'dpi)').matches){max = target};
					app.u.dump(min + ".." + max);
				}
				return min;
			},
			getCSSWidth : function(){
				return screen.availWidth/(this.getPPI()/96)
			},
			setTitle : function(title){
				if(title && typeof title ==="string"){
					//This is what we expect
					}
				else{
					//Go home title.  You are drunk.
					title = "Tiki Bar - Tiki Decor - Tiki Totems - Tiki Masks - Outdoor Tikis - Tiki Wood Signs - Custom Tiki Carvings - Tropical Decor"; 
					}
				
				document.title = title;
			},
			loadFeaturedStoreBanner : function(){
				//app.u.dump("loadFeaturedStoreBanner");
				$.getJSON("_tikimaster_banners.json?_v="+(new Date()).getTime(), function(json){
					//app.ext.tikimaster.vars.homepageBanners = json;
					j = Math.floor(Math.random() * json.length);
					$('.featuredStore').attr('href',json[j].href);
					$('.featuredStore').attr('title',json[j].title);
					$('.featuredStore img').attr('src',json[j].src);
					$('.featuredStore img').attr('alt',json[j].alt);
				}).fail(function(){
					app.u.dump("FEATURED STORE BANNERS FAILED TO LOAD");
				});
			},
			makeBanner : function(bannerJSON, w, h, b){
				var $img = $(app.u.makeImage({
					tag : true,
					w : w,
					h : h,
					b : b,
					name : bannerJSON.src,
					alt : bannerJSON.alt,
					title : bannerJSON.title
					}));
				if(bannerJSON.prodLink){
					$img.addClass('pointer').data('pid', bannerJSON.prodLink).click(function(){
						showContent('product',{'pid':$(this).data('pid')});
						});
					}
				else if(bannerJSON.catLink){
					$img.addClass('pointer').data('navcat', bannerJSON.catLink).click(function(){
						showContent('category',{'navcat':$(this).data('navcat')});
						});
					}
				else if(bannerJSON.searchLink){
					$img.addClass('pointer').data('elasticsearch', bannerJSON.searchLink).click(function(){
						app.u.dump($(this).data('elasticsearch'));
						showContent('search',$(this).data('elasticsearch'));
						});
					}
				else {
					//just a banner!
					}
				return $img;
			},
			startHotItemSlideshow : function(){
				if($('#hotItemSpotlightContainer ul').children().length > 0){
					var $itemList = $('#hotItemSpotlightContainer ul')
					app.ext.tikimaster.u.randomizeList($itemList);
					$itemList.cycle({
						fx:     'fade',
						speed:  'slow',
						timeout: 5500,
						pause : 1
						});
					}
				else {
					setTimeout(function(){
						app.ext.tikimaster.u.startHotItemSlideshow()
						}, 250);
					}
			},
			hideColumnContent : function(){
				if(!$('.thinColumn').hasClass('hiddenColumn')){
					$('.thinColumn').animate({'width':'0'}, 500).addClass('hiddenColumn');
					setTimeout(function(){$('.thinColumn').hide();}, 500);
					$('.wideColumn').animate({'width':'1007'},550);
					}
			},
			showColumnContent : function(content){
				app.u.dump('Showing column content: '+content);
				if($('.thinColumn').hasClass('hiddenColumn')){
					$('.wideColumn').animate({'width':'789'},550);
					$('.thinColumn').show().animate({'width':'215'}, 550).removeClass('hiddenColumn');
					}
				var $colContainer = $('#variableColumn');
				var $prevCol = $('.activeColumn', $colContainer);
				if($prevCol.attr('id') !== content){
					var $nextCol = $('#'+content, $colContainer);
					
					$colContainer.animate({'height':$nextCol.outerHeight()}, 500);
					if($prevCol.length > 0){
						$prevCol.fadeOut(500).removeClass('activeColumn');
					}
					setTimeout(function(){
						if(typeof app.ext.tikimaster.u.columnCompletes[$nextCol.attr('id')] === 'function') {
							app.ext.tikimaster.u.columnCompletes[$nextCol.attr('id')]();
						}
						$nextCol.fadeIn(500).addClass('activeColumn');
					}, 500);
				}
			},
			
			columnCompletes : {
				hotItemList : function(){
					app.ext.tikimaster.u.randomizeList($("#hotItemList .hotLineItemList"));
				}
			},
			randomizeList : function($list){
				$list.children().shuffle();
			},
			truncList : function($list){
				// it looks for 'itemsPerPage3' (itemsPerPage4,5,6,...) css class 
				// assigned to the list, extracts the number of items to leave and truncs
				var num = 4;
				var matches = $list.attr('class').match(/itemsPerPage(\d+)/);
				if(matches && matches[1]) {
					num = matches[1]-1;
					$list.children('li:gt('+num+')').remove();
				}
			}
		}, //u [utilities]

////////////////////////////////////   EVENTS [e]    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
		e : {
			//app-events are added to an element through data-app-event="extensionName|functionName"
			//right now, these are not fully supported, but they will be going forward. 
			//they're used heavily in the admin.html file.
			//while no naming convention is stricly forced, 
			//when adding an event, be sure to do off('click.appEventName') and then on('click.appEventName') to ensure the same event is not double-added if app events were to get run again over the same template.
		}, //e [app Events]
		
////////////////////////////////////   VARS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
		vars : {
			breadcrumbRootName : "Home",
			customPrompt : "I understand it takes 3-14 business days to customize my item. This item is not returnable / exchangeable as it is considered customized. Once this order is placed, no changes or cancellations are permitted.",
			catTemplates : {
				'.affiliates' : 'categoryTemplateAffiliates',
				'.affiliates.1' : 'categoryTemplateAffiliatesSignUp',
				'.affiliates.4' : 'categoryTemplateAffiliatesLinkExchange',
				'.affiliates.contract' : 'categoryTemplateAffiliatesContract',
				'.affiliates.program-details' : 'categoryTemplateAffiliatesProgramDetails',
				'.001' : 'categoryTemplateShowSubCats',
				'.002' : 'categoryTemplateShowSubCats',
				'.002.001' : 'categoryTemplateShowSubCats',
				'.002.03' : 'categoryTemplateShowSubCats',
				'.002.5' : 'categoryTemplateShowSubCats',
				'.003' : 'categoryTemplateShowSubCats',
				'.004' : 'categoryTemplateShowSubCats',
				'.004.4' : 'categoryTemplateShowSubCats',
				'.01' : 'categoryTemplateShowSubCats',
				'.03' : 'categoryTemplateShowSubCats',
				'.04' : 'categoryTemplateShowSubCats',
				'.05' : 'categoryTemplateShowSubCats',
				'.09' : 'categoryTemplateShowSubCats',
				'.1' : 'categoryTemplateShowSubCats',
				'.10' : 'categoryTemplateShowSubCats',
				'.10.art_print_collection' : 'categoryTemplateShowSubCats',
				'.10.hawaii_collection' : 'categoryTemplateShowSubCats',
				'.10.island_collection' : 'categoryTemplateShowSubCats',
				'.10.pop_art_collection' : 'categoryTemplateShowSubCats',
				'.10.traditional_collection' : 'categoryTemplateShowSubCats',
				'.2' : 'categoryTemplateShowSubCats',
				'.2wholesale' : 'categoryTemplateShowSubCats',
				'.8' : 'categoryTemplateShowSubCats',
				'.8.koa___pearls_jewelry' : 'categoryTemplateShowSubCats',
				'.8.koa_bangles' : 'categoryTemplateShowSubCats',
				'.8.koa_bracelets' : 'categoryTemplateShowSubCats',
				'.8.koa_earrings' : 'categoryTemplateShowSubCats',
				'.8.koa_hair_accessories' : 'categoryTemplateShowSubCats',
				'.8.koa_necklaces' : 'categoryTemplateShowSubCats',
				'.8.koa_pendants' : 'categoryTemplateShowSubCats',
				'.9' : 'categoryTemplateShowSubCats',
				'.90' : 'categoryTemplateShowSubCats',
				'._tikioutlet' : 'categoryTemplateShowSubCats',
				'.aloha_hawaii_lei' : 'categoryTemplateShowSubCats',
				'.alohamaster' : 'categoryTemplateShowSubCats',
				'.alohamaster.hula_lamps' : 'categoryTemplateShowSubCats',
				'.americana' : 'categoryTemplateShowSubCats',
				'.bath___body' : 'categoryTemplateShowSubCats',
				'.bath___body.for_the_home' : 'categoryTemplateShowSubCats',
				'.bath___body.island_bath___body' : 'categoryTemplateShowSubCats',
				'.beach_signs' : 'categoryTemplateShowSubCats',
				'.christmas_mania' : 'categoryTemplateShowSubCats',
				'.coastal_decor' : 'categoryTemplateShowSubCats',
				'.coastal_decor.acostal_decor_accents' : 'categoryTemplateShowSubCats',
				'.coastal_decor.bcoastal_wood_signs' : 'categoryTemplateShowSubCats',
				'.coastal_decor.ceramics' : 'categoryTemplateShowSubCats',
				'.coastal_decor.garden___patio' : 'categoryTemplateShowSubCats',
				'.coastal_decor.sea_shells' : 'categoryTemplateShowSubCats',
				'.coastal_decor.wall_decor' : 'categoryTemplateShowSubCats',
				'.custom_carving' : 'categoryTemplateShowSubCats',
				'.design_assistant' : 'categoryTemplateShowSubCats',
				'.duke_kahanamoku' : 'categoryTemplateShowSubCats',
				'.fashion' : 'categoryTemplateShowSubCats',
				'.island_gourmet' : 'categoryTemplateShowSubCats',
				'.koamaster' : 'categoryTemplateShowSubCats',
				'.nautical_signs' : 'categoryTemplateShowSubCats',
				'.pirate_decor' : 'categoryTemplateShowSubCats',
				'.skull_and_bones_decor' : 'categoryTemplateShowSubCats',
				'.surfing_monkey' : 'categoryTemplateShowSubCats',
				'.surfing_monkey.bamboo___thatch' : 'categoryTemplateShowSubCats',
				'.surfing_monkey.hawaiian_gifts' : 'categoryTemplateShowSubCats',
				'.surfing_monkey.masks' : 'categoryTemplateShowSubCats',
				'.surfing_monkey.monkey_koa_paddles' : 'categoryTemplateShowSubCats',
				'.surfing_monkey.monkey_poynesian_art' : 'categoryTemplateShowSubCats',
				'.surfing_monkey.monkey_signs' : 'categoryTemplateShowSubCats',
				'.surfing_monkey.tikis' : 'categoryTemplateShowSubCats',
				'.test' : 'categoryTemplateShowSubCats',
				'.test.another' : 'categoryTemplateShowSubCats',
				'.thatchandbamboo' : 'categoryTemplateShowSubCats',
				'.tiki_topics' : 'categoryTemplateShowSubCats', // many subcats there
				'.tikidiscovery' : 'categoryTemplateShowSubCats',
				'.tikidiscovery.0' : 'categoryTemplateShowSubCats',
				'.tikidiscovery.41' : 'categoryTemplateShowSubCats',
				'.tikidiscovery.43' : 'categoryTemplateShowSubCats',
				'.tikidiscovery.44' : 'categoryTemplateShowSubCats',
				'.tikidiscovery.5' : 'categoryTemplateShowSubCats',
				'.tikidiscovery.americana_decor' : 'categoryTemplateShowSubCats',
				'.tikidiscovery.menu' : 'categoryTemplateShowSubCats',
				'.tikidiscovery.xpirate_decor' : 'categoryTemplateShowSubCats',
				'.tikidiscovery.yskull___bones_decor' : 'categoryTemplateShowSubCats',
				'.tikidiscovery.znautical_decor' : 'categoryTemplateShowSubCats',
				'.tikihomedecor' : 'categoryTemplateShowSubCats',
				'.videos' : 'categoryTemplateVideos',
				'.videos.product_videos' : 'categoryTemplateVideosList',
				'.videos.product_videos.topic_1' : 'categoryTemplateVideos',
				'.videos.product_videos.topic_2' : 'categoryTemplateVideos',
				'.videos.product_videos.topic_3' : 'categoryTemplateVideos',
			}
		} // vars
		
	} //r object.
	return r;
}