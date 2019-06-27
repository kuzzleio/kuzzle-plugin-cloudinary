--- 
code: true
type: page
title: rename
--- 

# rename

Renames the specified asset

--- 

## Query Syntax 

### HTTP 

```http
URL: http://kuzzle:7512/_plugin/cloudinary/assets/<public_id>?new_public_id=<new_name>
Method: PUT
```

::: warning
Be aware that Cloudinary allows special characters in the public_id syntax. You may need to encode the public id with escape character 
:::

### Other protocols 

```js
{
  "controller": "cloudinary/assets",
  "action": "rename",

  "public_id": "old_name",
  "new_public_id": "new_name"
}
```
---

## Arguments 

- `public_id`: current [public_id](https://cloudinary.com/documentation/upload_images#public_id_the_image_identifier) of the asset to rename
- `new_public_id`: new [public_id](https://cloudinary.com/documentation/upload_images#public_id_the_image_identifier) of the asset 
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

## Possible Errors 

- [Common errors](/core/1/api/essentials/errors/#common-errors)
- [NotFoundError](/core/1/api/essentials/errors/#specific-errors)