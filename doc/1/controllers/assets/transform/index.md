--- 
code: true
type: page
title: transform
--- 

# transform

Searches for assets corresponding to the specified expression and options

--- 

## Query Syntax 

### HTTP 

```http
URL: http://kuzzle:7512/_plugin/cloudinary/assets/transform
Method: POST
Body:
```
```js
{
  "public_id" : "sample", 
  "transformation" : {
    "width" : 400,
    "radius" : "100:0:100:100"
  }
}
```

### Other protocols 

```js
{
  "controller": "cloudinary/assets",
  "action": "transform",

	"body": {
    "public_id" : "sample", 
    "transformation" : {
      "width" : 400,
      "radius" : "100:0:100:100"
    }
  }
}
```
---

## Arguments 

- `public_id`: [public_id](https://cloudinary.com/documentation/upload_images#public_id_the_image_identifier) of the asset to transform
- `transformation`: JSON object that describes your transformation. See [Cloudinary documentation](https://cloudinary.com/documentation/image_transformation_reference) for syntax information

---

## Response 

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

## Possible Errors 

- [Common errors](/core/1/api/essentials/errors#common-errors)