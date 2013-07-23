==== Google Trusted Store anyCommerce extension README ====

1. Adding GTS code into the app
2. Implementation notes
3. Deep Inside

==== 1. Adding GTS code into the app ====

1. Copy these 4 files into the /extensions project folder
  extensions/partner_google_analytics.js
  extensions/partner_google_analytics_gts_iframe.html
  extensions/partner_google_analytics_gts_iefix.css
  extensions/partner_google_analytics_gts_README.txt

2. Add these lines into index.html (after _gaq.push lines) and set the appropriate ids

// Google Trusted Store Config. Init happens in extensions/partner_google_analytics.js
var gts = gts || [];
gts.push(["id", "GTS_ID_HERE"]); 
gts.push(["google_base_offer_id", "ITEM_GOOGLE_SHOPPING_ID"]); // Some key product ID, related to the homepage - optional
gts.push(["google_base_subaccount_id", "ITEM_GOOGLE_SHOPPING_ACCOUNT_ID"]); // Google Shopping ID - optional
gts.push(["google_base_country", "US"]); // optional
gts.push(["google_base_language", "EN"]); // optional
// END Google Trusted Store Config


3. Check that extension loads in init.js. Make sure the second param is "0" (extension must be fully loaded on the AppPreView stage).

app.rq.push(['extension',0,'google_analytics','extensions/partner_google_analytics.js','startExtension']);


4. Visit GTS admin -> Code -> Test Code and test how it works
https://www.google.com/trustedstores/sell

If you cannot login there, ask your client to add you as a GTS admin first (provide him some Gmail email)
https://www.google.com/trustedstores/sell -> Business Info -> Administrator Emails -> Add

You'll get an invitation email from Google with the confirmation request.

=========================================











==== 2. Implementation notes ====

GTS code was saved into the google analytics extension because of 2 reasons: (1) old broken GTS code was there and (2) Analytics TrackTrans also happens there - so it's good to have the GTS order confirmation code near it (both happen on checoutCompletes)

In a Rich Internet Application (RIA) HTML page loads only once. And HTML DOM initializes only once.
After that any user interaction happens without the page reload - we just make ajax calls to send/fetch the data and then delete/insert html nodes into the existing DOM - using javascript.
So, if we just insert the GTS code google provides us "as is", it will also be initialized only once... But, unfortunately, that's not enough! We need to re-init it when a visitor browses the app or makes a purchase.

To do that, we manually create an iframe (#anycommerce-gts-iframe) and load the GTS code there (see partner_google_analytics_gts_iframe.html) - happily this trick works in most modern browsers (IE8-IE10, FF8-FF22, Safari5+, Chrome). 

If there's a need to re-init GTS - iframe is destroyed, new data is passed to window.gts and/or window.gts_order and the iframe is created again. Bingo! Almost...

Google also loads the badge image / order confirmation popup / gts test-drive toolbar – and unfortunately all this go into the iframe, which sits on top of the main page and isn't transparent to the mouse clicks!
So there's one more step - when GTS is loaded, js pulls out all important divs + styles from the iframe into the main window and makes the iframe invisible (height:0; pointer-events:none)


partner_google_analytics_gts_iefix.css fixes IE8 css and js only loads it into IE8. Remove if you don't need it.

==== 3. Deep inside ====

I was wondering (1) if we can avoid using iframes and (2) if we can have the local version of gts code (reverse-engineered)

The answers are:
1 - Yes, had some success but in Safari 5, FF8, IE8 only. All modern browsers (FF 22, IE10, Chrome) refused to work (google detects duplicate code initialization somehow). And iframe provides much better browser compatibility.

2. No, because the code loads twice. It's better to check the Firebug Network flow, see how it goes:

  1. we set "var gts" and load gtmp_compiled.js first (this file can be local/modified)
  2. it loads gtmp_compiled_WLWEGXvT1ic.js  (this file also can be local/modified)
  3. code on step 2 creates one more iframe with src="googlecommerce.com...." + sends params with GET there + sets cookies + receives a response from google
  4. In this response google pushes "www.googlecommerce.com/trustedstores/gtmp_compiled_WLWEGXvT1ic.js" script link into it's own iframe (src=googlecommerce.com) - and we cannot modify anything about it, because all browsers have the XSS attack protection nowadays (our window and google iframe belong to the different domains)
  5. Overall, we can have the local modified GTS pre-loader js. But Google will fetch the original script on the step4 anyway.
