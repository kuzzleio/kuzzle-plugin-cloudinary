<p align="center">
  <img src="https://user-images.githubusercontent.com/32480223/59445914-c0f5f700-8e00-11e9-8335-0b69d4728357.png"/>
</p>

# Kuzzle Plugin : Cloudinary

Cloudinary is cloud-based image and video management platform. It automates the entire image-processing pipeline: from uploads to on-the-fly manipulations to optimization to dynamic delivery with any CDN.

This plugin will let you use some of Cloudinary API's functions within Kuzzle. 

You can test this plugin with Swagger UI. Find more in the [Testing section](#testing)

***This plugin is available for 1.8.2 and higher version of Kuzzle***

## Usage
 
Here are the existing routes (Note that all of these are preceded by `http://<host>:<port>/_plugin/cloudinary`) 

| HTTP Verb | Route |Description | 
| :---- | :---- | :---- | 
| POST | [/assets/search](#search-function) | Searches for some assets corresponding to an expression | 
| POST | [/assets/transform](#transform-function)  | Returns the url of an asset with some transformation |
| PUT | [/assets/<public_id>](#rename-function)  | Renames an asset |
| DELETE | [/assets/<public_id>](#destroy-function)  | Deletes an asset |
| POST | [/tags/<tag>](#add_tag-function)  | Adds a tag to one or many assets | 
| PUT | [/tags/<tag>](#replace_tag-function)  | Replaces all the tags from one or many assets by another tag |
| DELETE | [/tags/<tag>](#remove_tag-function)  | Deletes a tag from one or many assets | 
| DELETE | [/tags/remove_all](#remove_all_tags-function)  | Deletes all the tags from one or many assets | 

### Assets controller

#### `search` function
This function searches for assets corresponding to the given expression

You can use the cloudinary **search function** by sending a `POST` HTTP-request to this route : `http://<host>:<port>/_plugin/cloudinary/assets/search`

The expression must be a descriptive string of your research. For more informations on the syntax of this string, check the [Cloudinary documentation about Expressions][cloudinary expression doc]

##### Request format 
```js
{
  "controller": "cloudinary/assets",
  "action": "search",

  "expression": "<expression>",
  "max_results": "<number_of_result_max>",
  "next_cursor": "<next-cursor>",
  "with_field": [ "<additional_field_to_include>" ],
  "sort_by": [  ["<field>","<asc | desc>"] ]
}
```

**You must provide, at least, either the `expression` or the `next_cursor` field. If both are set, `expression` will be ignored** 

You can find more info [here](https://cloudinary.com/documentation/search_api#parameters)

##### Response format 

```js
{
  "status": 200,
  "error": null,
  "controller": "cloudinary/assets",
  "action": "destroy",
  "requestId": "<unique request identifier>",
  "result": {
      "total_count": "<number_of_resources>",
      "time": "<request_processing_time>",
      "next_cursor": "<cursor_for_following_request>",
      "resources" : [ 
          {
              "public_id": "<new_public_id>",
              "folder": "<folder>",
              "filename": "<filename>",
              "format": "<format>",
              "resource_type": "<ressource_type>",
              "type": "<type>",
              "created_at": "<creation_date>",
              "bytes": "<size>",
              "backup_bytes": 0,
              "width": "<width>",
              "height": "<height>",
              "aspect_ratio": "<ratio>",
              "pixels": "<number_of_pixels>",
              "url": "<url>",
              "secure_url": "<secure_url>",
              "status": "<status>",
              "access_mode": "<access_mode>",
          }
      ],
      "rate_limit_allowed": "<initial_request_limit>",
      "rate_limit_reset_at": "<date_of_reset>",
      "rate_limit_remaining": "<current_request_limit>"
      
  }
}
```

For more information on search response, see [Cloudinary documentation](https://cloudinary.com/documentation/search_api#response)

#### `transform` function
This function returns an url to access the given asset with the given transformations

You can use the **transform function** by sending a `POST` HTTP-request to this route : 
`http://<host>:<port>/_plugin/cloudinary/assets/transform`

##### Request format 
```js
{
  "controller": "cloudinary/assets",
  "action": "transform",

	"public_id" : "sample", 
	"transformation" : {
		"width" : 400,
		"radius" : "100:0:100:100"
	}
}
```

The request body must contain the following properties : 

| Property         | Type   | Description                                   |
| ---------------- | ------ | --------------------------------------------- |
| `public_id` | string | public_id of the file to be transformed |
| `transformation`   | JSON | a json describing all the transformations you want to apply to the asset. See [Cloudinary transformation guides][cloudinary transformation doc]     |

##### Response format 
```js
{
  "status": 200,
  "error": null,
  "controller": "cloudinary/assets",
  "action": "transform",
  "requestId": "<unique request identifier>",
  "result": "<transformed_asset_url>"
}
```

#### `rename` function 
This function renames the given asset

You can use the cloudinary **rename function** by sending a `PUT` HTTP-request to this route : `http://<host>:<port>/_plugin/cloudinary/assets/<public_id>`

:warning: Be aware that Cloudinary allows special characters in the public_id syntax. You may need to encode the public id with escape character

##### Request format 
```js
{
  "controller": "cloudinary/assets",
  "action": "rename",

  "public_id": "old_name",
  "new_public_id": "new_name"
}
```

The request must contain the following properties : 

| Property         | Type   | Description                                   |
| ---------------- | ------ | --------------------------------------------- |
| `public_id` | string | public_id of the file to be renamed |
| `new_public_id`   | string | new public_id of the file           |

##### Response format 
```js
{
  "status": 200,
  "error": null,
  "controller": "cloudinary/assets",
  "action": "destroy",
  "requestId": "<unique request identifier>",
  "result": {
      "public_id": "<new_public_id>",
      "width": "<width>",
      "height": "<height>",
      "format": "<format>",
      "resource_type": "<ressource_type>",
      "created_at": "<creation_date>",
      "tags": [
          "<tag>"
      ],
      "bytes": "<size>",
      "type": "<type>",
      "placeholder": "<placeholder>",
      "url": "<url>",
      "secure_url": "<secure_url>"
  }
}
```

#### `destroy` function 
This function deletes the given asset

You can use the cloudinary **destroy function** by sending a `DELETE` HTTP-request to this route : `http://<host>:<port>/_plugin/cloudinary/assets/<public_id>`

:warning: Be aware that Cloudinary allows special characters in the public_id syntax. You may need to encode the public id with escape character

##### Request format
```js
{
  "controller": "cloudinary/assets",
  "action": "destroy",
  "public_id": "sample"
}
```

The request must contain the following properties : 

| Property         | Type   | Description                                   |
| ---------------- | ------ | --------------------------------------------- |
|`public_id`|string|public_id of the file to be deleted|


##### Response format 
```js
{
  "status": 200,
  "error": null,
  "controller": "cloudinary/assets",
  "action": "destroy",
  "requestId": "<unique request identifier>",
  "result": {
      "result": "ok"
  }
}
```

### Tags controller

#### `add_tag` function 
This function adds the given tag to the given assets

You can use the cloudinary **add_tag function** by sending a `POST` HTTP-request to this route : `http://<host>:<port>/_plugin/cloudinary/tags/<tag>`

##### Request format
```js
{
  "controller": "cloudinary/tags",
  "action": "addTag",

	"public_id" : [ "sample", "sample2" ], 
	"tag" : "<tag_to_add>"
}
```

The request must contain the following properties : 

| Property         | Type   | Description                                   |
| ---------------- | ------ | --------------------------------------------- |
|`public_id`|string or [string]|the public_id of the asset to be edited. <br> **Can concern many assets if you use an array of strings !** <br>*Be aware of whitespace since Cloudinary authorizes whitespace in the public_id syntax*   |
|`tag`|string| the tag to be added |

For more information see the [Cloudinary tags methods][cloudinary tags doc]

##### Response format 
```js
{
  "status": 200,
  "error": null,
  "controller": "cloudinary/tags",
  "action": "addTag",
  "requestId": "<unique request identifier>",
  "result": {
      "public_ids": [
          "sample",
          "sample2"
      ] 
  }
}
```

#### `replace_tag` function 
This function replace all the current tag of the given assets by the given tag

You can use the cloudinary **replace_tag function** by sending a `PUT` HTTP-request to this route : `http://<host>:<port>/_plugin/cloudinary/tags/<tag>`

##### Request format 
```js
{
  "controller": "cloudinary/tags",
  "action": "replaceTag",

  "public_id" : [ "sample", "sample2" ],
  "tag": "a_tag"
}
```

The request must contain the following properties : 

| Property         | Type   | Description                                   |
| ---------------- | ------ | --------------------------------------------- |
|`public_id`|string or [string]|the public_id of the asset to be edited. <br> **Can concern many assets if you use an array of strings !** <br>*Be aware of whitespace since Cloudinary authorizes whitespace in the public_id syntax*   |
|`tag`|string| the tag that will replace all the current tag|

For more information see the [Cloudinary tags methods][cloudinary tags doc]

##### Response format 
```js
{
    "status": 200,
    "error": null,
    "controller": "cloudinary/tags",
    "action": "replaceTag",
    "requestId": "<unique request identifier>",
    "result": {
        "public_ids": [
            "sample",
            "sample2"
        ] 
    }
}
```

#### `remove_tag` function
This function removes the given tag from the given assets 

You can use the cloudinary **remove_tag function** by sending a `DELETE` HTTP-request to this route : `http://<host>:<port>/_plugin/cloudinary/tags/<tag>`

##### Request format 
```js
{
    "controller": "cloudinary/tags",
    "action": "removeTag",

	"public_id" : [ "sample", "sample2" ],
    "tag": "a_tag"
}
```

The request must contain the following properties : 

| Property         | Type   | Description                                   |
| ---------------- | ------ | --------------------------------------------- |
|`public_id`|string or [string]|the public_id of the asset to be edited. <br> **Can concern many assets if you use an array of strings !** <br>*Be aware of whitespace since Cloudinary authorizes whitespace in the public_id syntax*   |
|`tag`|string| the tag to be removed |

For more information see the [Cloudinary tags methods][cloudinary tags doc]

##### Response format 
```js
{
    "status": 200,
    "error": null,
    "controller": "cloudinary/tags",
    "action": "removeTag",
    "requestId": "<unique request identifier>",
    "result": {
        "public_ids": [
            "sample",
            "sample2"
        ] 
    }
}
```

#### `remove_all_tags` function 
This function removes all tags from the given assets

You can use the cloudinary **remove_all_tags function** by sending a `DELETE` HTTP-request to this route : `http://<host>:<port>/_plugin/cloudinary/tags/remove_all`

##### Request format 
```js
{
    "controller": "cloudinary/tags",
    "action": "removeAllTags",

	"public_id" : [ "sample", "sample2" ] 
}
```

The request must contain the following properties : 

| Property         | Type   | Description                                   |
| ---------------- | ------ | --------------------------------------------- |
|`public_id`|string or [string]|the public_id of the asset to be edited. <br> **Can concern many assets if you use an array of strings !** <br>*Be aware of whitespace since Cloudinary authorizes whitespace in the public_id syntax*   |

For more information see the [Cloudinary tags methods][cloudinary tags doc]

##### Response format 

```js
{
    "status": 200,
    "error": null,
    "controller": "cloudinary/tags",
    "action": "removeAllTags",
    "requestId": "<unique request identifier>",
    "result": {
        "public_ids": [
            "sample",
            "sample2"
        ] 
    }
}
```

## Error handling 

All tag methods can throw a `206 PartialError` if at least one resource has not been updated : This error will contain all the errors encountered during the request. 

## Configuration 

In order to use this plugin, you **need to provide your Cloudinary credentials** in the Vault.

Here is the template of the needed structure :
```json 
{
  "cloudinary": {
    "APIKey":  "your-cloudinary-api-key",
    "APISecret": "your-cloudinary-api-secret",
    "cloudName": "your-cloudinary-cloudname"
  }
}
```

You can find more about Vault feature on the [Kuzzle documentation][kuzzle vault doc]

## Installation 

### On your Kuzzle Stack

Clone this repository in your `plugin/available` directory, install all needed modules with `npm install` and then link this directory to your `plugin/enabled` directory. 

```bash 
git clone https://github.com/kuzzleio/kuzzle-plugin-cloudinary.git /path-of-your-kuzzle/plugins/available cloudinary
cd /path-of-your-kuzzle/plugins/available/cloudinary/
npm install 
ln -sr ./ ../../plugins/enabled/cloudinary 
```
You can now restart Kuzzle and check [http://localhost:7512](http://localhost:7512), you should see the plugin name under the key `serverInfo.kuzzle.plugins.cloudinary`.

## Testing 

If you want to test this plugin, you can use the [Swagger UI online tool](https://petstore.swagger.io)

1) Run Kuzzle with the plugin installed (See [Installation section](#Installation)) **Make sure it is correctly [configured](#Configuration) with your Cloudinary credentials**
2) Go on the [Swagger UI online tool](https://petstore.swagger.io)
3) Enter the following link `https://raw.githubusercontent.com/kuzzleio/kuzzle-plugin-cloudinary/master/test/swagger-spec.yaml` and click `Explore`
4) You have now the details of all available requests, and you can try these out.

[cloudinary tags doc]: https://cloudinary.com/documentation/image_upload_api_reference#tags_method
[cloudinary expression doc]: https://cloudinary.com/documentation/search_api#expressions
[cloudinary transformation doc]: https://cloudinary.com/documentation/image_transformation_reference
[kuzzle vault doc]: https://docs.kuzzle.io/core/1/guides/essentials/secrets-vault/