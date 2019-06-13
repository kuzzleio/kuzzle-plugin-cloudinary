<p align="center">
  <img src="https://user-images.githubusercontent.com/32480223/59445914-c0f5f700-8e00-11e9-8335-0b69d4728357.png"/>
</p>

# Kuzzle Plugin : Cloudinary

Cloudinary is cloud-based image and video management platform. It automates the entire image-processing pipeline: from uploads to on-the-fly manipulations to optimization to dynamic delivery with any CDN.

## Usage

You can use several functionnalities of Cloudinary API within Kuzzle with this plugin. 
Here are the existing routes (Note that all of these are preceded by `https://<host>:<port>/_plugin/kuzzle-plugin-cloudinary/`) 

| HTTP Verb |      Route      |
| --------: | :-------------- |
|    GET    |     search      |
|   PATCH   |     rename      |
|  DELETE   |     destroy     |
|   POST    |     add_tag     |
|  DELETE   |   remove_tag    |
|  DELETE   | remove_all_tags |
|   PATCH   |   replace_tag   |


### Search API

#### `search` function
This function searches for assets corresponding to the given expression

You can use the cloudinary **search function** by sending a `GET` HTTP-request to this route : `https://<host>:<port>/_plugin/kuzzle-plugin-cloudinary/search/:expression`

The expression must be a descriptive string of your research. For more informations on the syntax of this string, check the [Cloudinary documentation about Expressions](cloudinary expression doc)

### Upload API 

#### `rename` function 
This function renames the given asset

You can use the cloudinary **rename function** by sending a `PATCH` HTTP-request to this route : `https://<host>:<port>/_plugin/kuzzle-plugin-cloudinary/rename`

| Property         | Type   | Description                                   |
| ---------------- | ------ | --------------------------------------------- |
| `from_public_id` | string | Required: public_id of the file to be renamed |
| `to_public_id`   | string | Required: new public_id of the file           |

#### `destroy` function 
This function deletes the given asset

You can use the cloudinary **destroy function** by sending a `DELETE` HTTP-request to this route : `https://<host>:<port>/_plugin/kuzzle-plugin-cloudinary/destroy`

| Property         | Type   | Description                                   |
| ---------------- | ------ | --------------------------------------------- |
|`public_id`|string|Required: public_id of the file to be deleted|


#### `add_tag` function 
This function adds the given tag to the given assets

You can use the cloudinary **add_tag function** by sending a `POST` HTTP-request to this route : `https://<host>:<port>/_plugin/kuzzle-plugin-cloudinary/add_tag`

| Property         | Type   | Description                                   |
| ---------------- | ------ | --------------------------------------------- |
|`public_ids`|string|Required: a string of several comma-separated public_id <br>*Be aware of whitespace since Cloudinary authorizes whitespace in the public_id syntax*   |
|`tag`|string| Required: the tag to be added |

For more information see the [Cloudinary tags methods][cloudinary tags doc]

#### `remove_tag` function
This function removes the given tag from the given assets 

You can use the cloudinary **remove_tag function** by sending a `DELETE` HTTP-request to this route : `https://<host>:<port>/_plugin/kuzzle-plugin-cloudinary/remove_tag`

| Property         | Type   | Description                                   |
| ---------------- | ------ | --------------------------------------------- |
|`public_ids`|string|Required: a string of several comma-separated public_id <br>*Be aware of whitespace since Cloudinary authorizes whitespace in the public_id syntax*   |
|`tag`|string| Required: the tag to be removed |

For more information see the [Cloudinary tags methods][cloudinary tags doc]

#### `remove_all_tags` function 
This function removes all tags from the given assets

You can use the cloudinary **remove_all_tags function** by sending a `DELETE` HTTP-request to this route : `https://<host>:<port>/_plugin/kuzzle-plugin-cloudinary/remove_all_tags`

| Property         | Type   | Description                                   |
| ---------------- | ------ | --------------------------------------------- |
|`public_ids`|string|Required: a string of several comma-separated public_id <br>*Be aware of whitespace since Cloudinary authorizes whitespace in the public_id syntax*   |

For more information see the [Cloudinary tags methods][cloudinary tags doc]

#### `replace_tag` function 
This function replace all the current tag of the given assets by the given tag

You can use the cloudinary **replace_tag function** by sending a `PATCH` HTTP-request to this route : `https://<host>:<port>/_plugin/kuzzle-plugin-cloudinary/replace_tag`

| Property         | Type   | Description                                   |
| ---------------- | ------ | --------------------------------------------- |
|`public_ids`|string|Required: a string of several comma-separated public_id <br>*Be aware of whitespace since Cloudinary authorizes whitespace in the public_id syntax*   |
|`tag`|string| Required: the tag that will replace all the current tag|

For more information see the [Cloudinary tags methods][cloudinary tags doc]

## Error handling 

All tag methods can throw a `206 PartialError` if at least one ressources had not been updated : This error will contain all the errors encountered during the request. 

## Configuration 

In order to use this plugin, you **need to provide your Cloudinary credentials** in the `.kuzzlerc` configuration file. 

Here is the template of the needed configuration : 
```json 
"plugins": {
  "kuzzle-plugin-cloudinary": {
    "cloudinaryCloudName": "your-cloudinary-cloud-name",
    "cloudinaryApiKey": "your-cloudinary-api-key",
    "cloudinaryApiSecret": "your-cloudinary-api-secret"
  }
}
```

## Installation 

### On your Kuzzle Stack

Clone this repository in your `plugin/available` directory, install all needed modules with `npm install` and then link this directory to your `plugin/enabled` directory. 

```bash 
git clone https://github.com/kuzzleio/kuzzle-plugin-cloudinary.git /path-of-your-kuzzle/plugins/available 
cd /path-of-your-kuzzle/plugins/available/kuzzle-plugin-cloudinary
npm install 
ln -sr ./ ../../plugins/enabled/kuzzle-plugin-cloudinary 
```

[cloudinary tags doc]: https://cloudinary.com/documentation/image_upload_api_reference#tags_method
[cloudinary expression doc]: https://cloudinary.com/documentation/search_api#expressions