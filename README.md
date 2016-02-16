# App-Framework


The App-Framework is an open-source "wrapper" that helps you to transform your web app in a full feature

mobile app that can eventually resides remotely. In few words: 

You can build extended websites that can communicate with your device remotely!

You can also forget to compile and update your app for all mobile platform everytime 

you need to fix/add functionalities  

Thanks to phonegap and web technologies you love.


## How to install

1. download or clone this repo

2. copy ***config.xml.dist*** and paste it with new name: ***config.xml***

3. copy ***/www/conf/conf.def.json*** and paste with new name:  ***/www/conf/conf.json***

4. ***configure config.xml*** following phonegap docs ***and conf.json*** following instructions below

5. you've a ***ready-to-build mobile app***!


***NOTE:*** If you want to compile and run locally, you need to run following script:

`phonegap-install-plugins` ( contains commands to install all required plugins )

and then you need to run:

`phonegap run <platform> --device --verbose`

( to install on your device , overwrite <platform> with android,ios or winphone )


## How it works

The app Framework can be configured to work in 4 different ways ( from most ***remote*** solution to ***local*** one) :


### 1. content-src ( everything remote - discouraged )

You can use :

<content src="http://yoursite.com" />

In your config.xml to load directly your web app without having any local asset
But this approach is discouraged by us, phonegap and app stores since most of the time
they could be not validated.

In this case , however, you need to upload all cordova libraries ( cordova.js and all plugins ) 
inside your remote website to allow it to communicate with device.

### 2. webview ( recommended for advanced solutions )

This approach is similar to content-src method, but allows you to create a sort of
"boot" process where you can show advanced splashscreens in html5, use the app-framework
built-in connection check and many other things.

* You just have to configure conf.json as specified below.

* You still have to load cordova libraries remotely to use device API and 
re-implement/import built-in app-framework functions in your remote app if you need.

### 3. iframe ( recommended for simple, clean and working solutions )

The recommended way is to use an iframe load type instead. It uses a customizable 
built-in communication system between the local cordova app and the remote web app
taking advantage of postMessage cross-origin mechanism.

Pro:

- It allows you to have a persistent local wrapper that can be a fallback "place" in case of
connection lost for example.

- With iframe method you can build phonegap and remote hybrid applications.

- You don't need to load cordova libraries remotely

Cons:

- You can't direct use cordova functions in web app but you need to use our built-in
methods to send cross-origin requests. Anyway you're eventually able to continue to use
cordova functions.


### 4. local

Of course you can fully include your web app inside this wrapper without using the ***url*** config.
In this case, you can continue to use this framework for its built-in functions.



## Conf.json Configuration

Below you can find conf.json specifications

##### appTitle

it's the title of app used internal

##### url
the url of external app

##### urlCrossOrigin
if your app has a specific address for cross origin requests using ajax, then insert it here
Otherwise "url" configuration will be used.

##### skipAjaxCheck
if you want to skip the ajax url check , you can set this conf to true. This check is used to avoid remote loading
if the specified url is not reachable.

##### skipConnCheck
enable/disable connection check and periodic message box that appears if no connection available.

##### customScript
If you want to load external app using some custom logic, then you can add an url to your script here
Otherwise the external app will be loaded automatically if "url" has been set.


##### loadType

The external app can be loaded by this framework in two different ways, and here you can insert following values:
* webview
* iframe


##### iframeTarget

In case iframe loading type has been selected, this is the query selector element where
to load the iframe


##### evalPostMessage
enable/disable evalutation of all strings received by postMessage event. Enabling and combining with ***loadType: iframe*** , you're able to
execute javascript [phonegap] functions directly on device from your remote web-app loaded in iframe.
NOTE: Don't use it with untrusted domains!

