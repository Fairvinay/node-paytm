const http = require('http');
const https = require('https');
const url = require('url');
const qs = require('querystring');
const StringDecoder = require('string_decoder').StringDecoder;
const store = require('data-store')({ path: process.cwd() + '/foo.json' });

var fs = require('fs');
// var createHTML = require('create-html')
//var htmlencode = require('htmlencode');

const port = 8080;
const checksum_lib = require('./checksum.js');
const forward = require('http-forward')

var PaytmConfig = {
	mid: "bgBkEl45403033186773",
	key: "!AlG9%OnEGCAzlBs",
	website: "mohzenart"
}
var params 						= {};
	params['MID'] 					= PaytmConfig.mid;
	params['WEBSITE']				= PaytmConfig.website;
	params['CHANNEL_ID']			= 'WEB';
	params['INDUSTRY_TYPE_ID']	= 'Retail';
	params['ORDER_ID']			= 'TEST_' + new Date().getTime(); // post.ORDER_ID;
	params['CUST_ID'] 			= 'CUSTOMER_ID'; // post.CUST_ID;
	params['TXN_AMOUNT']			= '1.0' ; // post.TXN_AMOUNT;
	params['CALLBACK_URL']		= 'http://localhost:'+port+'/callback';
	params['EMAIL']				=   'abc@mailinator.com'; //post.EMAIL;
	params['MOBILE_NO']			=  '7777777777'; //post.MOBILE_NO;

	
	 var POST_PARAMS = {};

http.createServer(function (req, res) {
     const decoder = new StringDecoder('utf-8');
	let buffer = '';

	res.setHeader("Access-Control-Allow-Origin", "*"); 
	
	switch(req.url){
		
		case "/paytmdone" : 
							 //req.forward = { target: 'http://localhost:4200/thirdparty/paytmtest' }
							 var paytmParams =  
									{
										TXNID: 'erafd',
										ORDERID: 'adfaad',
										TXNDATE : 'sdf',
										name: 'sample' ,
									     uid: Math.floor(Math.random()*(20-3+1)+3) % 10,
										 token: '2323523523DFSWERWERWER'
									}
							 var ord = JSON.stringify(paytmParams);
							 var pathName = url.parse(req.url).pathname;
								console.log("Get PathName" + pathName + ":" + req.url);
							var myidArr = req.url.split("=");
							var myid = myidArr[1];
							var path = 'http://localhost:4200/thirdparty/paytmtest?paytmParams=' +ord ;
								res.writeHead(302, {'Location': path});
								res.end();
							 
							// forward(req, res)
		
		                     /*require('request').post(
								"http://localhost:4200/thirdparty/paytmtest", 
								{form: 
									{
										TXNID: 'erafd',
										ORDERID: 'adfaad'
									}
								},
								function(error, response, body){
									console.log(body);
								}
							);
							*/
							break;
		case "/read":
				console.log('Received request from Iframe ' );
				if(req.method=='POST') {
		            var body='';
		            req.on('data', function (data) {
		                body +=data;
						buffer += decoder.write(data);
		            });
		            req.on('end',function(){
						buffer += decoder.end();
		               var POST =  qs.parse(body);
		               console.log('POST ', POST);
					   console.log(' buffer ' , buffer);
			           // console.log('POST.JsonData: ' , POST.JsonData);
 			           //post = JSON.parse(POST.JsonData);
			       
		            });
				}
				// https://github.com/http-party/node-http-proxy
				checksum_lib.genchecksum(params, PaytmConfig.key, function (err, checksum) {

				var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
				// var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production
				
				var form_fields = "";
				for(var x in params){
					form_fields += "<input type='hidden' name='"+x+"' value='"+params[x]+"' >";
				}
				form_fields += "<input type='hidden' name='CHECKSUMHASH' value='"+checksum+"' >";
				
				const postTransaction = '<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center>'+
				'<form method="post" action="'+txn_url+'"  name="f1">'+form_fields+
				' </form>'+
				//' <div style="display:none"><iframe src=""  id="my_iframe" name="my_iframe"> </iframe> </div>'+
				'<script type="text/javascript">document.f1.submit(); '+
				
				'</script>'+
				' </body></html>';
				const postTransBack = '<script type="text/javascript">  ' +
				'  var test = document.getElementById("test"); '+
				'  var iframe = document.getElementById("my_iframe"); '+
				' var MyIFrameDoc = (iframe.contentWindow || iframe.contentDocument); '+
			    ' if (MyIFrameDoc.document) MyIFrameDoc = MyIFrameDoc.document; ' +
				' MyIFrameDoc.getElementById("mybutton").click(); ' +
				' /* document.theForm.submit(); */ ' +
				' function onMyFrameLoad(fr) { ' +
				//'	alert("myframe is loaded"); '+
				
				'	}; ' +
				' </script>' ;
				var tr  = 'data:text/html;charset=utf-8,';
				// var iframe_contents = iframe.contentDocument.body.innerHTML;
				var valScript = '<html><head></head><body><form method="post" action="http://localhost:8080/payTmRes" name="theForm"> '+
						'	<input type="hidden" name="test" id="test"/> '+
						'</form> '+
						' <div id="myDIV"> </div> <script type="text/javascript">'+
						
						'var iframe = document.createElement("iframe"); '+
							// div tag in which iframe will be added should have id attribute with value myDIV'
					    '	document.getElementById("myDIV").appendChild(iframe); ' +
						'var test = document.getElementById("test"); ' +
							// provide height and width to it
						' iframe.setAttribute("style","height:100%;width:100%;border:0px"); '+
				        ' iframe.src = "' + tr + encodeURI(postTransaction)+ '";'+
						' iframe.onload = function () { '+
						//' alert("myframe is loaded"); '+
						
						// ' alert("test value "+test.value)'+
						'};' +
						' setTimeout( function () { document.theForm.test.value = window.frames[0].document.innerHTML; document.theForm.submit(); } , 1000); ' +
						' </script>  </body></html>'  ;
						
				/*fs.writeFile('placePaytmTransaction.html', postTransaction, function (err) {
						if (err) throw err;
						console.log('Transcation Saved!');
						
					});
				*/
				res.writeHead(200, {'Content-Type': 'text/html' , 'Access-Control-Allow-Origin': '*' });
				res.write(valScript);
				res.end();
				});
				
				
				
				break;
		
		case "/post":
		          var post ='';
				  var body='';
			  if(req.method=='POST') {
		           
		            req.on('data', function (data) {
		                body += data.toString();
		            });
		            req.on('end',function(){
					   console.log('body ' + body);
		               var POST =  JSON.parse(body);
		               console.log('POST ', POST);
					   console.log('POST.EMAIL ', POST.EMAIL);
					   POST_PARAMS = POST;
					   console.log('POST_PARAMS ' + POST_PARAMS.EMAIL);
					//console.log('params.ORDER_ID ' + params.ORDER_ID);
						params.TXN_AMOUNT  = POST_PARAMS.TXN_AMOUNT	
						params.MID			=			POST_PARAMS.MID;
						params.WEBSITE		=				POST_PARAMS.WEBSITE;	
						params.INDUSTRY_TYPE_ID	=					POST_PARAMS.INDUSTRY_TYPE_ID;
						params.CHANNEL_ID		=				POST_PARAMS.CHANNEL_ID;
						params.ORDER_ID			=			POST_PARAMS.ORDER_ID;
						params.CUST_ID			=			POST_PARAMS.CUST_ID;
						params.MOBILE_NO		=				POST_PARAMS.MOBILE_NO;
						params.EMAIL			=			POST_PARAMS.EMAIL;
					//	params.CALLBACK_URL		=				POST_PARAMS.CALLBACK_URL;
					
					 console.log('params.ORDER_ID ' + params.ORDER_ID);
					 
					store.set('PARAMS', params); 
					console.log('params.ORDER_ID ' + params.ORDER_ID);
					console.log('params.ORDER_ID ' + params['ORDER_ID']);
						// store.set('MID', MID); 
					//console.log(store.data);
					const postTransaction = '<div> Your Order ' + params['ORDER_ID'] +'</div>';
						res.writeHead(200, {'Content-Type': 'text/html' , 'Access-Control-Allow-Origin': '*' });
						 res.write(postTransaction);
						 res.end();
					   
			        });
					
					
			  }
              else if(req.method=='GET') {
			        var url_parts = url.parse(req.url,true);
			        console.log(url_parts.query);
   			  }
			 // req.end();
			// res.destroy(); //After one run, uncomment this.
			//var POST_PARAMS =  JSON.parse(body);
			
	
		break;
	
		case "/callback":

			var body = '';
	        
	        req.on('data', function (data) {
	            body += data;
	        });

	        req.on('end', function () {
				var html = "";
				var first_post_data = '';
				var post_data = qs.parse(body);
					
				first_post_data = post_data;
				// received params in callback
				console.log('Callback Response: ', post_data, "\n");
				html += "<b>Callback Response</b><br>";
				for(var x in post_data){
					html += x + " => " + post_data[x] + "<br/>";
				}
				html += "<br/><br/>";


				// verify the checksum
				var checksumhash = post_data.CHECKSUMHASH;
				// delete post_data.CHECKSUMHASH;
				var result = checksum_lib.verifychecksum(post_data, PaytmConfig.key, checksumhash);
				console.log("Checksum Result => ", result, "\n");
				html += "<b>Checksum Result</b> => " + (result? "True" : "False");
				html += "<br/><br/>";



				// Send Server-to-Server request to verify Order Status
				var params = {"MID": PaytmConfig.mid, "ORDERID": post_data.ORDERID};

				checksum_lib.genchecksum(params, PaytmConfig.key, function (err, checksum) {

					params.CHECKSUMHASH = checksum;
					post_data = 'JsonData='+JSON.stringify(params);

					var options = {
						hostname: 'securegw-stage.paytm.in', // for staging
						// hostname: 'securegw.paytm.in', // for production
						port: 443,
						path: '/merchant-status/getTxnStatus',
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded',
							'Content-Length': post_data.length
						}
					};


					// Set up the request
					var response = "";
					var post_req = https.request(options, function(post_res) {
						post_res.on('data', function (chunk) {
							response += chunk;
						});

						post_res.on('end', function(){
							
							console.log('first_post_data  ', first_post_data, "\n");
							console.log('S2S Response: ', response, "\n");
							var _result = '';
							try {
								  _result  = JSON.parse(response)
							  } catch (e) {
								// Oh well, but whatever...
								  _result ='<div> Transaction No:' +first_post_data[TXNID]+' Order No: '+first_post_data[ORDERID]+' Placed </div';
							  }

							html += "<b>Status Check Response</b><br>";
							for(var x in _result){
								html += x + " => " + _result[x] + "<br/>";
							}
							
							 var paytmParams =  
									{
										TXNID: first_post_data['TXNID'],
										ORDERID: first_post_data['ORDERID'],
										TXNDATE : first_post_data['TXNDATE'],
										 name: 'sample' ,
									     uid: Math.floor(Math.random()*(20-3+1)+3) % 10,
										 token: '2323523523DFSWERWERWER'
									}
							 var ord = JSON.stringify(paytmParams);
							 var pathName = url.parse(req.url).pathname;
								console.log("Get PathName" + pathName + ":" + req.url);
							var myidArr = req.url.split("=");
							var myid = myidArr[1];
							var path = 'http://localhost:4200/thirdparty/paytmtest?paytmParams=' +ord ;
								res.writeHead(302, {'Location': path});
								res.end();
							
							
							/*
							require('request').post(
								"localhost:4200/thirdparty/paytmtest", 
								{form: 
									{
										TXNID: first_post_data['TXNID'],
										ORDERID: first_post_data['ORDERID']
									}
								},
								function(error, response, body){
									console.log(body);
								}
							);
							res.writeHead(200, {'Content-Type': 'text/html'});
							res.write(html);
							res.end();
							*/
						});
					});

					// post the data
					post_req.write(post_data);
					post_req.end();
				});
	        });
			
		break;
	}
	

}).listen(port);

/*

Mobile Number	77777 77777
Password	Paytm12345
OTP
Doesn’t require 2nd factor authentication

489871


'<script type="text/javascript"> var iframe = document.getElementsByName("my_iframe"); ' +
				' var test = document.getElementByID("my_iframe"); '+
				' test.value = window.frames[0].document.body.innerHTML; '+
				' iframe.onload = function() { '+
				' console.log("myframe is loaded"); '+
				' var resp = window.frames[0].document.body.innerHTML;   '+
				' var xhttp = new XMLHttpRequest(); ' +
				' var params = "ret=eval(resp)"; '+
				' xhttp.onreadystatechange = function() { '+
				 '     if (this.readyState == 4 && this.status == 200) { ' +
				'			document.getElementById("demo").innerHTML = this.responseText; '+
				'	} '+
				' }; ' + 
				' xhttp.open("POST", "http://localhost:8080/payTmRes", true); ' +
				' xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); ' +
				' xhttp.send(params); ' +
				'}; // before setting src '+
				' </script>' ;


*/
/*' var resp = window.frames[0].document.body.innerHTML;   '+
				' var xhttp = new XMLHttpRequest(); ' +
				' var params = "ret=eval(resp)"; '+
				' xhttp.onreadystatechange = function() { '+
				 '     if (this.readyState == 4 && this.status == 200) { ' +
				'			document.getElementById("demo").innerHTML = this.responseText; '+
				'	} '+
				' }; ' + 
				' xhttp.open("POST", "http://localhost:8080/payTmRes", true); ' +
				' xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); ' +
				' xhttp.send(params); ' +
				*/
				
/*
'<script type="text/javascript"> var iframe = document.getElementById("my_iframe"); ' +
				' var test = document.getElementById("test"); '+
				' var MyIFrameDoc = (iframe.contentWindow || iframe.contentDocument); '+
			    ' if (MyIFrameDoc.document) MyIFrameDoc = MyIFrameDoc.document; ' +
				' MyIFrameDoc.getElementById("mybutton").click(); ' +
				' iframe.onload = function () { '+
				' console.log("myframe is loaded"); '+
				' test.value = iframe.innerHTML; '+
				' console.log("test value "+test.value)'+
				' document.theForm.submit(); ' +
				'}; // before setting src '+
				' </script>' ;
				
				*/
				
/*
'<script type="text/javascript">  ' +
				'  var test = document.getElementById("test"); '+
				'  var iframe = document.getElementById("my_iframe"); '+
				' iframe.onload = function () { '+
				' console.log("myframe is loaded"); '+
				' test.value = window.frames[0].document.innerHTML; '+
				' console.log("test value "+test.value)'+
				' document.theForm.submit(); ' +
				'}; // before setting src '+
				' </script>' ;
				
*/
/*
res.write('<html><head></head><body><iframe src="placePaytmTransaction.html" onload="onMyFrameLoad(this);"  id="my_iframe" name="my_iframe"></iframe>'+
						'<p id="demo"></p> '+
						'<form method="post" action="http://localhost:8080/payTmRes" name="theForm"> '+
						'	<input name="test" id="test"/> '+
						'</form>'+postTransBack+'</body></html>');
						*/