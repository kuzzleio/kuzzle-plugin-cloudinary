--- 
code: false
type: page
order: 300
title: Testing
---

# Testing 

If you want to test this plugin, you can use the [Swagger UI online tool](https://petstore.swagger.io)

1) Run Kuzzle with the plugin installed (See [Installation section](/official-plugins/cloudinary/2/essentials/installation)) **Make sure it is correctly [configured](/official-plugins/cloudinary/2/essentials/installation#configuration) with your Cloudinary credentials**
2) Go on the [Swagger UI online tool](https://petstore.swagger.io)
3) Enter the following link `http://<kuzzle>:<port>/_plugin/cloudinary/openApi` and click `Explore`
4) You have now the details of all available requests, and you can try these out