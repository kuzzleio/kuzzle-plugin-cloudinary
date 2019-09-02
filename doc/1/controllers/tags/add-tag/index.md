--- 
code: true
type: page
title: addTag
--- 

# addTag

Adds a tag to one or several assets 

--- 

## Query Syntax 

### HTTP 

```http
URL: http://kuzzle:7512/_plugin/cloudinary/tags/<tag>
Method: POST
Body: 
```
```js
{
  "public_id" : "sample", 
  "tag" : "<tag_to_add>"
}
```

### Other protocols 

If you want to add a tag to only one asset you can use this query : 
```js
{
  "controller": "cloudinary/tags",
  "action": "addTag",

	"body": { 
    "public_id" : "sample", 
    "tag" : "<tag_to_add>"
  }
}
```

If you want to add a tag to several assets you can use this query : 
```js
{
  "controller": "cloudinary/tags",
  "action": "addTag",

	"public_id" : [ "sample", "sample2" ], 
	"tag" : "<tag_to_add>"
}
```
---

## Arguments 

- `public_id`: (String or Array of string) [public_id](https://cloudinary.com/documentation/upload_images#public_id_the_image_identifier) of the asset 
- `tag`: Tag to add to the specified asset

---

## Response 

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

If one or several assets haven't been updated, a `206 Partial Error` will be throw with a detail of the error for each asset

## Possible Errors 

-  [Common errors](/core/1/api/essentials/errors#common-errors)
-  [PartialError](/core/1/api/essentials/errors#specific-errors)