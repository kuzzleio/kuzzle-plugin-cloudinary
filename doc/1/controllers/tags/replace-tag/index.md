--- 
code: true
type: page
title: replaceTag
--- 

# replaceTag

Replaces all tags by the specified tag from the specified asset(s)

--- 

## Query Syntax 

### HTTP 

```http
URL: http://kuzzle:7512/_plugin/cloudinary/tags/<tag>?public_id=<name>
Method: PUT
```

You can put several assets as parameter. Here is an example :
```http
URL: http://kuzzle:7512/_plugin/cloudinary/tags/a_Tag?public_id=sample&public_id=sample2
Method: PUT
```

### Other protocols 

If you want to edit only one asset you can use this query : 
```js
{
  "controller": "cloudinary/tags",
  "action": "replaceTag",

	"public_id" : "sample",
  "tag" : "a_tag"
}
```

If you want to edit several assets you can use this query : 
```js
{
  "controller": "cloudinary/tags",
  "action": "replaceTag",

	"public_id" : [ "sample", "sample2" ],
  "tag": "a_tag"
}
```
---

## Arguments 

- `public_id`: (String or Array of string) [public_id](https://cloudinary.com/documentation/upload_images#public_id_the_image_identifier) of the asset(s) 
- `tag`: Tag to add to the specified asset

---

## Response 

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

If one or several assets haven't been updated, a `206 Partial Error` will be throw with a detail of the error for each asset

## Possible Errors 

- [Common errors](/core/1/api/essentials/errors#common-errors)
- [PartialError](core/1/api/essentials/errors/#specific-errors)
