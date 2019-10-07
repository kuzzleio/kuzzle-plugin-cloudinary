--- 
code: true
type: page
title: destroy
--- 

# destroy

Deletes the specified asset

--- 

## Query Syntax 

### HTTP 

```http
URL: http://kuzzle:7512/_plugin/cloudinary/assets/<public_id>
Method: DELETE
```

::: warning
Be aware that Cloudinary allows special characters in the public_id syntax. You may need to encode the public id with escape character
:::

### Other protocols 

```js
{
  "controller": "cloudinary/assets",
  "action": "destroy",
  "public_id": "sample"
}
```
---

## Arguments 

- `public_id`: [public_id](https://cloudinary.com/documentation/upload_images#public_id_the_image_identifier) of the asset to delete

---

## Response 

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

## Possible Errors 

- [Common errors](/core/1/api/essentials/errors#common-errors)
- [NotFoundError](/core/1/api/essentials/errors#specific-errors)