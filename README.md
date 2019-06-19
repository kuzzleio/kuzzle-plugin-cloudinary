<p align="center">
  <img src="https://user-images.githubusercontent.com/32480223/59445914-c0f5f700-8e00-11e9-8335-0b69d4728357.png"/>
</p>

# Kuzzle Plugin : Cloudinary

Cloudinary is cloud-based image and video management platform. It automates the entire image-processing pipeline: from uploads to on-the-fly manipulations to optimization to dynamic delivery with any CDN.

This plugin will let you use some of Cloudinary API's functions within Kuzzle. 

***This plugin is available for 1.8.2 and higher version of Kuzzle***

## Usage
 
Here are the existing routes (Note that all of these are preceded by `http://<host>:<port>/_plugin/kuzzle-plugin-cloudinary`) 

| HTTP Verb | Route |Description | 
| :---- | :---- | :---- | 
| GET | [/assets/:expression](#search-function) | Searches for some assets corresponding to the expression | 
| GET | [/assets/transform](#transform-function)  | Returns the url of an asset with some transformation |
| PUT | [/assets](#rename-function)  | Renames an asset |
| DELETE | [/assets](#destroy-function)  | Deletes an asset |
| POST | [/tags](#add_tag-function)  | Adds a tag to one or many assets | 
| PUT | [/tags](#replace_tag-function)  | Replaces all the tags from one or many assets by another tag |
| DELETE | [/tags](#remove_tag-function)  | Deletes a tag from one or many assets | 
| DELETE | [/tags/remove_all](#remove_all_tags-function)  | Deletes all the tags from one or many assets | 

### Assets controller

#### `search` function
This function searches for assets corresponding to the given expression

You can use the cloudinary **search function** by sending a `GET` HTTP-request to this route : `http://<host>:<port>/_plugin/kuzzle-plugin-cloudinary/assets/:expression`

The expression must be a descriptive string of your research. For more informations on the syntax of this string, check the [Cloudinary documentation about Expressions][cloudinary expression doc]

#### `transform` function
This function returns an url to access the given asset with the given transformations

You can use the **transform function** by sending a `GET` HTTP-request to this route : 
`http://<host>:<port>/_plugin/kuzzle-plugin-cloudinary/assets/transform`

The body must contain the following properties : 

| Property         | Type   | Description                                   |
| ---------------- | ------ | --------------------------------------------- |
| `public_id` | string | public_id of the file to be transformed |
| `transformation`   | JSON | a json describing all the transformations you want to apply to the asset. See [Cloudinary transformation guides][cloudinary transformation doc]     |

#### `rename` function 
This function renames the given asset

You can use the cloudinary **rename function** by sending a `PUT` HTTP-request to this route : `http://<host>:<port>/_plugin/kuzzle-plugin-cloudinary/assets`

The body must contain the following properties : 

| Property         | Type   | Description                                   |
| ---------------- | ------ | --------------------------------------------- |
| `from_public_id` | string | public_id of the file to be renamed |
| `to_public_id`   | string | new public_id of the file           |

#### `destroy` function 
This function deletes the given asset

You can use the cloudinary **destroy function** by sending a `DELETE` HTTP-request to this route : `http://<host>:<port>/_plugin/kuzzle-plugin-cloudinary/assets`

The body must contain the following properties : 

| Property         | Type   | Description                                   |
| ---------------- | ------ | --------------------------------------------- |
|`public_id`|string|public_id of the file to be deleted|

### Tags controller

#### `add_tag` function 
This function adds the given tag to the given assets

You can use the cloudinary **add_tag function** by sending a `POST` HTTP-request to this route : `http://<host>:<port>/_plugin/kuzzle-plugin-cloudinary/tags`

The body must contain the following properties : 

| Property         | Type   | Description                                   |
| ---------------- | ------ | --------------------------------------------- |
|`public_id`|string or [string]|the public_id of the asset to be edited. <br> **Can concern many assets if you use an array of strings !** <br>*Be aware of whitespace since Cloudinary authorizes whitespace in the public_id syntax*   |
|`tag`|string| the tag to be added |

For more information see the [Cloudinary tags methods][cloudinary tags doc]

#### `replace_tag` function 
This function replace all the current tag of the given assets by the given tag

You can use the cloudinary **replace_tag function** by sending a `PUT` HTTP-request to this route : `http://<host>:<port>/_plugin/kuzzle-plugin-cloudinary/tags`

The body must contain the following properties : 

| Property         | Type   | Description                                   |
| ---------------- | ------ | --------------------------------------------- |
|`public_id`|string or [string]|the public_id of the asset to be edited. <br> **Can concern many assets if you use an array of strings !** <br>*Be aware of whitespace since Cloudinary authorizes whitespace in the public_id syntax*   |
|`tag`|string| the tag that will replace all the current tag|

For more information see the [Cloudinary tags methods][cloudinary tags doc]

#### `remove_tag` function
This function removes the given tag from the given assets 

You can use the cloudinary **remove_tag function** by sending a `DELETE` HTTP-request to this route : `http://<host>:<port>/_plugin/kuzzle-plugin-cloudinary/tags`

The body must contain the following properties : 

| Property         | Type   | Description                                   |
| ---------------- | ------ | --------------------------------------------- |
|`public_id`|string or [string]|the public_id of the asset to be edited. <br> **Can concern many assets if you use an array of strings !** <br>*Be aware of whitespace since Cloudinary authorizes whitespace in the public_id syntax*   |
|`tag`|string| the tag to be removed |

For more information see the [Cloudinary tags methods][cloudinary tags doc]

#### `remove_all_tags` function 
This function removes all tags from the given assets

You can use the cloudinary **remove_all_tags function** by sending a `DELETE` HTTP-request to this route : `http://<host>:<port>/_plugin/kuzzle-plugin-cloudinary/tags/remove_all`

The body must contain the following properties : 

| Property         | Type   | Description                                   |
| ---------------- | ------ | --------------------------------------------- |
|`public_id`|string or [string]|the public_id of the asset to be edited. <br> **Can concern many assets if you use an array of strings !** <br>*Be aware of whitespace since Cloudinary authorizes whitespace in the public_id syntax*   |

For more information see the [Cloudinary tags methods][cloudinary tags doc]

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
git clone https://github.com/kuzzleio/kuzzle-plugin-cloudinary.git /path-of-your-kuzzle/plugins/available 
cd /path-of-your-kuzzle/plugins/available/kuzzle-plugin-cloudinary
npm install 
ln -sr ./ ../../plugins/enabled/kuzzle-plugin-cloudinary 
```

[cloudinary tags doc]: https://cloudinary.com/documentation/image_upload_api_reference#tags_method
[cloudinary expression doc]: https://cloudinary.com/documentation/search_api#expressions
[cloudinary transformation doc]: https://cloudinary.com/documentation/image_transformation_reference
[kuzzle vault doc]: https://docs.kuzzle.io/core/1/guides/essentials/secrets-vault/