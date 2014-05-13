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
var tikimaster = function(_app) {
	var r = {

////////////////////////////////////   CALLBACKS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
		callbacks : {
//executed when extension is loaded. should include any validation that needs to occur.
			init : {
				onSuccess : function() {
					_app.ext.tikimaster.u.loadFeaturedStoreBanner();
					return true;
				},
				onError : function() {
					//errors will get reported for this callback as part of the extensions loading.  This is here for extra error handling purposes.
					//you may or may not need it.
					dump('BEGIN _app.ext.tikimaster.callbacks.init.onError');
				}
			}
		}, //callbacks

////////////////////////////////////   ACTIONS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
		a : {
			//actions are functions triggered by a user interaction, such as a click/tap.
			//these are going the way of the do do, in favor of app events. new extensions should have few (if any) actions.
			showDropDown : function ($tag) {
				//dump('showing');
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
				//dump('showClick');
				if(this.showDropDown($tag)){
					$('.dropdown',$tag).unbind('click');
					$('.dropdown',$tag).click(function(event){event.stopPropagation()});
					$tag.attr('onClick','').unbind('click');
					setTimeout(function(){$('body').click(function(){
						_app.ext.tikimaster.a.hideDropDownClick($tag);
					});}, 500);
				}
			},
			hideDropDown : function ($tag) {
				//dump('hiding');
				$(".dropdown", $tag).stop().animate({"height":"0px"}, 400);
				if($tag.data('timeout') && $tag.data('timeout')!== "false"){
					$tag.data('timeout')
					$tag.data('timeout','false');
				}
				$tag.data('timeout',setTimeout(function(){$(".dropdown", $tag).hide();},400));
				return true;
			},
			hideDropDownClick : function($tag){
				//dump('hideClick');
				if(this.hideDropDown($tag)){
					$tag.click(function(){_app.ext.tikimaster.a.showDropDownClick($(this));});
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
		}, //renderFormats


		tlcFormats : {
			
			striphtml : function(data,thisTLC)	{
				data.globals.binds[data.globals.focusBind] = data.globals.binds[data.globals.focusBind].replace(/(<([^>]+)>)/ig,"");
				return true;
				}
			
			},

////////////////////////////////////   UTIL [u]   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
		u : {
			//utilities are typically functions that are exected by an event or action.
			//any functions that are recycled should be here.

			prepareRootNavCats : function(){
				$("#leftNav ul li").unbind()
					 .mouseover(function() { _app.ext.tikimaster.a.showDropDown($(this)); })
					 .mouseout(function() { _app.ext.tikimaster.a.hideDropDown($(this)); });
				$("#leftNav").on('click','span',function() { document.location.hash = "#!category/"+$(this).parent().attr('data-catsafeid') });
				
				$("#leftNav").on('click',' ul li > ul li',function() {
					document.location.hash = "#!category/"+$(this).attr('data-catsafeid')
					});
				},
			makeDropDownBreadcrumb : function(){
				dump("Tikimaser makeDropDownBreadcrumb started");
				
				// rootcat '.' has a pretty name 'New UnNamed Category'
				// our api returns it like that. lets fix
				$('.breadcrumb > li:first-child a').html(_app.ext.tikimaster.vars.breadcrumbRootName);

				// add onclick events to all dropdown menus
				$('.breadcrumb > li ul.dropdown').on('click','li',function() {
					_app.ext.tikimaster.a.hideDropDownOnSelect($(this).closest("[data-app-role='bcListParent']")); 
					document.location.hash = "#!category/"+$(this).attr('data-catsafeid');
					return false;// showContent('category',{'navcat':$(this).attr('data-catsafeid')});
				})
				
			},
			addBreadCrumbToProductPage : function($context) {
				// if we arrived to the product page directly from search
				// there's no breadcrumb at all
				// Jerome asked to add 'Home' dropdown element with root cats
				$('.breadcrumb',$context).each(function() {
					if(!$(this).children().length) {
				// fetch root cat with subcats details
						var tagObj = {'datapointer' : 'appCategoryDetail|.'};
						_app.model.fetchData(tagObj.datapointer);
						var bc_inner = "<li class='pointer' onmouseout='myApp.ext.tikimaster.a.hideDropDown($(this));' onmouseover='myApp.ext.tikimaster.a.showDropDown($(this));' data-catsafeid='.'><a href='#!home'>Home</a></li>";
						$(this).prepend(bc_inner);
						}
					});
			},
			getPPI : function(){
				
				if(window.devicePixelRatio){
					dump("devicePixelRatio set: "+window.devicePixelRatio);
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
					dump(min + ".." + max);
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
				//dump("loadFeaturedStoreBanner");
				$.getJSON("_tikimaster_banners.json?_v="+(new Date()).getTime(), function(json){
					//_app.ext.tikimaster.vars.homepageBanners = json;
					j = Math.floor(Math.random() * json.length);
					$('.featuredStore').attr('href',json[j].href);
					$('.featuredStore').attr('title',json[j].title);
					$('.featuredStore img').attr('src',json[j].src);
					$('.featuredStore img').attr('alt',json[j].alt);
				}).fail(function(){
					dump("FEATURED STORE BANNERS FAILED TO LOAD");
				});
			},
			makeBanner : function(bannerJSON, w, h, b){
				var $img = $(_app.u.makeImage({
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
						dump($(this).data('elasticsearch'));
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
					_app.ext.tikimaster.u.randomizeList($itemList);
					$itemList.cycle({
						fx:     'fade',
						speed:  'slow',
						timeout: 5500,
						pause : 1
						});
					}
				else {
					setTimeout(function(){
						_app.ext.tikimaster.u.startHotItemSlideshow()
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
				dump('Showing column content: '+content);
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
						if(typeof _app.ext.tikimaster.u.columnCompletes[$nextCol.attr('id')] === 'function') {
							_app.ext.tikimaster.u.columnCompletes[$nextCol.attr('id')]();
						}
						$nextCol.fadeIn(500).addClass('activeColumn');
					}, 500);
				}
			},
			checkoutButtonMouseover : function() {
			  $('.checkoutButtonsContainer > .paymentMethodsIcons').fadeIn();
			},
			checkoutButtonMouseout : function() {
			  $('.checkoutButtonsContainer > .paymentMethodsIcons').fadeOut();
			},
			
			
			columnCompletes : {
				hotItemList : function(){
					_app.ext.tikimaster.u.randomizeList($("#hotItemList .hotLineItemList"));
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
			hideDropDownOnSelect : function($ele,p)	{
				myApp.ext.tikimaster.a.hideDropDownOnSelect($ele.closest("[data-app-role='bcListParent']"));
				}

			
			
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
				'.green__collection' : 'categoryTemplateShowSubCats',
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
				'.videos.product_videos.topic_3' : 'categoryTemplateVideos'
			}
		} // vars
		
	} //r object.
	return r;
}