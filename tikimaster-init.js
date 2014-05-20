


myApp.u.showProgress = function(progress)	{
	dump("BEGIN myApp.u.showProgress");
	function showProgress(attempt)	{
		dump(" -> attempt: "+attempt+' and progress.passZeroResourcesLength: '+progress.passZeroResourcesLength+' and progress.passZeroResourcesLoaded: '+progress.passZeroResourcesLoaded);
		if(progress.passZeroResourcesLength == progress.passZeroResourcesLoaded)	{
			//All pass zero resources have loaded.
			//the app will handle hiding the loading screen.
			myApp.u.appInitComplete();
			}
		else if(attempt > 60)	{
			//hhhhmmm.... something must have gone wrong.
			clearTimeout(progress.passZeroTimeout); //end the resource loading timeout.
			$('.appMessaging','#appPreView').anymessage({'message':'Init failed to load all the resources within a reasonable number of attempts.','gMessage':true,'persistent':true});
			}
		else	{
			var percentPerInclude = (100 / progress.passZeroResourcesLength);
			var percentComplete = Math.round(progress.passZeroResourcesLength * percentPerInclude); //used to sum how many includes have successfully loaded.
//			dump(" -> percentPerInclude: "+percentPerInclude+" and percentComplete: "+percentComplete);
			$('#appPreViewProgressBar').val(percentComplete);
			$('#appPreViewProgressText').empty().append(percentComplete+"% Complete");
			attempt++;
			setTimeout(function(){showProgress(attempt);},250);
			}
		}
	showProgress(0)
	}


myApp.rq.push(['script',0,(document.location.protocol == 'file:') ? myApp.vars.testURL+'jsonapi/config.js' : myApp.vars.baseURL+'jsonapi/config.js',function(){
	dump(" -> zglobals has loaded");
//in some cases, such as the zoovy UI, zglobals may not be defined. If that's the case, certain vars, such as jqurl, must be passed in via P in initialize:
//	myApp.u.dump(" ->>>>>>>>>>>>>>>>>>>>>>>>>>>>> zGlobals is an object");
	myApp.vars.username = zGlobals.appSettings.username.toLowerCase(); //used w/ image URL's.
//need to make sure the secureURL ends in a / always. doesn't seem to always come in that way via zGlobals
	myApp.vars.secureURL = zGlobals.appSettings.https_app_url;
	myApp.vars.domain = zGlobals.appSettings.sdomain; //passed in ajax requests.
	myApp.vars.jqurl = (document.location.protocol === 'file:') ? myApp.vars.testURL+'jsonapi/' : '/jsonapi/';
	}]); //The config.js is dynamically generated.
	
myApp.rq.push(['extension',0,'order_create','extensions/checkout/extension.js']);
myApp.rq.push(['extension',0,'cco','extensions/cart_checkout_order.js']);

myApp.rq.push(['extension',0,'store_routing','extensions/store_routing.js']);

myApp.rq.push(['extension',0,'store_prodlist','extensions/store_prodlist.js']);
myApp.rq.push(['extension',0,'store_navcats','extensions/store_navcats.js']);
myApp.rq.push(['extension',0,'store_search','extensions/store_search.js']);
myApp.rq.push(['extension',0,'store_product','extensions/store_product.js']);
myApp.rq.push(['extension',0,'cart_message','extensions/cart_message/extension.js']);
myApp.rq.push(['extension',0,'store_crm','extensions/store_crm.js']);
myApp.rq.push(['extension',0,'quickstart','app-quickstart.js','startMyProgram']);

myApp.rq.push(['extension',0,'tikimaster','tikimaster.js']);
myApp.rq.push(['extension',0,'prodlist_infinite','extensions/prodlist_infinite.js']);

//myApp.rq.push(['extension',0,'entomologist','extensions/entomologist/extension.js']);
//myApp.rq.push(['extension',0,'tools_animation','extensions/tools_animation.js']);

//myApp.rq.push(['extension',1,'google_analytics','extensions/partner_google_analytics.js','startExtension']);
//myApp.rq.push(['extension',1,'tools_ab_testing','extensions/tools_ab_testing.js']);
//myApp.rq.push(['extension',0,'partner_addthis','extensions/partner_addthis.js']);
//myApp.rq.push(['extension',1,'resellerratings_survey','extensions/partner_buysafe_guarantee.js','startExtension']); /// !!! needs testing.
//myApp.rq.push(['extension',1,'buysafe_guarantee','extensions/partner_buysafe_guarantee.js','startExtension']);
//myApp.rq.push(['extension',1,'powerReviews_reviews','extensions/partner_powerreviews_reviews.js','startExtension']);
//myApp.rq.push(['extension',0,'magicToolBox_mzp','extensions/partner_magictoolbox_mzp.js','startExtension']); // (not working yet - ticket in to MTB)


myApp.rq.push(['script',0,myApp.vars.baseURL+'resources/jquery.showloading-v1.0.jt.js']); //used pretty early in process..
myApp.rq.push(['script',0,myApp.vars.baseURL+'resources/jquery.ui.anyplugins.js']); //in zero pass because it's essential to rendering and error handling.
myApp.rq.push(['script',0,myApp.vars.baseURL+'resources/tlc.js']); //in zero pass cuz you can't render a page without it..
myApp.rq.push(['css',1,myApp.vars.baseURL+'resources/anyplugins.css']);

myApp.rq.push(['script',0,myApp.vars.baseURL+'resources/jsonpath.0.8.0.js']); //used pretty early in process..

//once peg is loaded, need to retrieve the grammar file. Order is important there. This will validate the file too.
myApp.u.loadScript(myApp.vars.baseURL+'resources/peg-0.8.0.js',function(){
	myApp.model.getGrammar(myApp.vars.baseURL+"resources/pegjs-grammar-20140203.pegjs");
	}); // ### TODO -> callback on RQ.push wasn't getting executed. investigate.





//used for the slideshow on the homepage and product page. $.cycle();
myApp.u.loadScript(myApp.vars.baseURL+'resources/jquery.cycle2.min.js',function(){
	//if these files are not done loading, cycle won't work quite right. so a check is done before executing a slideshow to make sure (with a settimeout to re-execute check).
	myApp.rq.push(['script',0,myApp.vars.baseURL+'resources/jquery.cycle2.swipe.min.js',function(){
		$(document.body).data('swipeLoaded',true); //can't execute a cycle carousel till this is loaded.
		}]);
	myApp.rq.push(['script',0,myApp.vars.baseURL+'resources/jquery.cycle2.carousel.min.js',function(){
		$(document.body).data('carouselLoaded',true); //can't execute a cycle carousel till this is loaded.
		}]); //need to make sure this loads after cycle2 or it barfs.
	});









/*
#### TODO -> disabled for testing purposes. was breaking old IE. needs fixin, working on another IE bug
//Cart Messaging Responses.
myApp.cmr.push(['chat.join',function(message){
	if(message.FROM == 'ADMIN')	{
		var $ui = myApp.ext.quickstart.a.showBuyerCMUI();
		$("[data-app-role='messageInput']",$ui).show();
		$("[data-app-role='messageHistory']",$ui).append("<p class='chat_join'>"+message.FROM+" has joined the chat.<\/p>");
		$('.show4ActiveChat',$ui).show();
		$('.hide4ActiveChat',$ui).hide();
		}
	}]);

//the default behavior for an itemAppend is to open the chat dialog. that's an undesired behavior from the buyer perspective.
myApp.cmr.push(['cart.itemAppend',function(message,$context)	{
	$("[data-app-role='messageHistory']",$context).append("<p class='cart_item_append'>"+message.FROM+" has added item "+message.sku+" to the cart.<\/p>");
	}]);



myApp.cmr.push(['goto',function(message,$context){
	var $history = $("[data-app-role='messageHistory']",$context);
	$P = $("<P>")
		.addClass('chat_post')
		.append("<span class='from'>"+message.FROM+"<\/span> has sent over a "+(message.vars.pageType || "")+" link for you within this store. <span class='lookLikeLink'>Click here<\/span> to view.")
		.on('click',function(){
			showContent(myApp.ext.quickstart.u.whatAmIFor(message.vars),message.vars);
			});
	$history.append($P);
	$history.parent().scrollTop($history.height());
	}]);


//  now add some template functions.

$('#cartTemplate').on('complete.tooltip',function(state,$ele,infoObj){
	$('.checkoutButton',$ele).tooltip({
		content : $('#paymentMethodsIcons4Tooltip').html()
		});
	});
*/

$('#productTemplate').on('complete.something',function(state,$ele,infoObj){
	myApp.ext.tikimaster.u.addBreadCrumbToProductPage($ele);
	myApp.ext.tikimaster.u.makeDropDownBreadcrumb();
	myApp.ext.tikimaster.u.loadFeaturedStoreBanner();
	});

$("#homepageTemplate").on('complete.cycle',function(state,$ele,infoObj){
	function execCycle()	{
		if(myApp.u.carouselIsReady())	{$('#wideSlideshow',$ele).cycle();}
		else {setTimeout(execCycle,500);}
		}
	execCycle();
	});

$('#homepageTemplate').on('complete.all',function(state,$ele,infoObj){

	myApp.ext.tikimaster.u.prepareRootNavCats();
	
	$('.randomList', $ele).each(function(){
		myApp.ext.tikimaster.u.randomizeList($(this)); // randomizes list
		myApp.ext.tikimaster.u.truncList($(this)); // to leave only 3-4 first items after shuffle
	});
	myApp.ext.tikimaster.u.loadFeaturedStoreBanner();
	
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
	});
					




//function to ascertain if the secondary files associated w/ cycle are done loading.
myApp.u.carouselIsReady = function()	{
	var r = false;
	if($(document.body).data('swipeLoaded') && $(document.body).data('carouselLoaded'))	{r = true;}
	return r;
	}





//Any code that needs to be executed after the app init has occured can go here.
//will pass in the page info object. (pageType, templateID, pid/navcat/show and more)
myApp.u.appInitComplete = function()	{
	myApp.u.dump("Executing myAppIsLoaded code...");
	
	myApp.ext.order_create.checkoutCompletes.push(function(vars,$checkout){
		dump(" -> begin checkoutCOmpletes code: "); dump(vars);
		
		var cartContentsAsLinks = myApp.ext.cco.u.cartContentsAsLinks(myApp.data[vars.datapointer].order);
		dump(" -> cartContentsAsLinks: "+cartContentsAsLinks);
		
//append this to 
		$("[data-app-role='thirdPartyContainer']",$checkout).append("<h2>What next?</h2><div class='ocm ocmFacebookComment pointer zlink marginBottom checkoutSprite  '></div><div class='ocm ocmTwitterComment pointer zlink marginBottom checkoutSprit ' ></div><div class='ocm ocmContinue pointer zlink marginBottom checkoutSprite'></div>");
		$('.ocmTwitterComment',$checkout).click(function(){
			window.open('http://twitter.com/home?status='+cartContentsAsLinks,'twitter');
			_gaq.push(['_trackEvent','Checkout','User Event','Tweeted about order']);
			});
		//the fb code only works if an appID is set, so don't show banner if not present.				
		if(myApp.u.thisNestedExists("zGlobals.thirdParty.facebook.appId") && typeof FB == 'object')	{
			$('.ocmFacebookComment',$checkout).click(function(){
				myApp.ext.quickstart.thirdParty.fb.postToWall(cartContentsAsLinks);
				_gaq.push(['_trackEvent','Checkout','User Event','FB message about order']);
				});
			}
		else	{$('.ocmFacebookComment').hide()}
		});
	}





//this will trigger the content to load on app init. so if you push refresh, you don't get a blank page.
//it'll also handle the old 'meta' uri params.
//this will trigger the content to load on app init. so if you push refresh, you don't get a blank page.
//it'll also handle the old 'meta' uri params.
myApp.router.appendInit({
	'type':'function',
	'route': function(v){
		return {'init':true} //returning anything but false triggers a match.
		},
	'callback':function(f,g){
		dump(" -> triggered callback for appendInit");
		g = g || {};
		if(g.uriParams.seoRequest){
			showContent(g.uriParams.pageType, g.uriParams);
			}
		else if(document.location.hash)	{	
			myApp.u.dump('triggering handleHash');
			myApp.router.handleHashChange();
			}
		else	{
			//IE8 didn't like the shortcut to showContent here.
			myApp.ext.quickstart.a.showContent('homepage');
			}
		if(g.uriParams && g.uriParams.meta)	{
			myApp.ext.cco.calls.cartSet.init({'want/refer':infoObj.uriParams.meta,'cartID':myApp.model.fetchCartID()},{},'passive');
			}
		if(g.uriParams && g.uriParams.meta_src)	{
			myApp.ext.cco.calls.cartSet.init({'want/refer_src':infoObj.uriParams.meta_src,'cartID':myApp.model.fetchCartID()},{},'passive');
			}
		}
	});


/*
Now add some routes for the affiliate and video pages.
#!affiliate/... or #!video/... (or category/.affiliate or category/.video) will trigger this handler. 
These are here because those pages require special layouts.
*/


myApp.router.addAlias('customCategoryTemplate',function(routeObj){
	dump(" -----------> GOT TO customCategoryTemplate ALIAS");
	routeObj = routeObj || {};
	routeObj.params = routeObj.params || {};
//for the exact matches, navcat won't be set. we'll need it for showContent tho
	if(!routeObj.params.navcat && routeObj.route.indexOf('category/') === 0)	{
		routeObj.params.navcat = routeObj.route.replace('category/','');
		}
	
	if(routeObj.params && routeObj.params.navcat)	{
		//regularize the navcat.
		if(routeObj.params.navcat.charAt(0) != '.')	{
			routeObj.params.navcat = '.'+routeObj.params.navcat;
			}
		var pageTemplates = {
			'.affiliates' : 'categoryTemplateAffiliates',
			'.affiliates.1' : 'categoryTemplateAffiliatesSignUp',
			'.affiliates.4' : 'categoryTemplateAffiliatesLinkExchange',
			'.affiliates.contract' : 'categoryTemplateAffiliatesContract',
			'.affiliates.program-details' : 'categoryTemplateAffiliatesProgramDetails'
			}
		if(pageTemplates[routeObj.params.navcat])	{
			routeObj.params.templateID = pageTemplates[routeObj.params.navcat];
			}
		}
	//if we get here and navcat still isn't set, showContent will handle the error.
	showContent('category',	routeObj.params);
	});

myApp.router.appendHash({'type':'match','route':'affiliates/{{navcat}}*','callback':'customCategoryTemplate'}); //this'll handle any hard coded links.
//these will handle any links auto-generated, such as breadcrumb or subcat lists.
myApp.router.prependHash({'type':'exact','route':'category/.affiliates','callback':'customCategoryTemplate'});
myApp.router.prependHash({'type':'exact','route':'category/.affiliates.1','callback':'customCategoryTemplate'});
myApp.router.prependHash({'type':'exact','route':'category/.affiliates.4','callback':'customCategoryTemplate'});
myApp.router.prependHash({'type':'exact','route':'category/.affiliates.contract','callback':'customCategoryTemplate'});
myApp.router.prependHash({'type':'exact','route':'category/.affiliates.program-details','callback':'customCategoryTemplate'});


myApp.router.addAlias('videos',function(routeObj){
	routeObj = routeObj || {};
	routeObj.params = routeObj.params || {};
	routeObj.params.templateID = 'categoryTemplateVideos';
	routeObj.params.navcat = routeObj.params.navcat || '.tiki_videos';
	showContent('category',	routeObj.params);
	});
	
myApp.router.appendHash({'type':'match','route':'videos','callback':'videos'}); //this'll handle any hard coded links.
//these will handle any links auto-generated, such as breadcrumb or subcat lists.
myApp.router.prependHash({'type':'exact','route':'category/.tiki_videos','callback':'videos'});


