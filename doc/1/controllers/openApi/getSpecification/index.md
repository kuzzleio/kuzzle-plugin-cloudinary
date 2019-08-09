--- 
code: true
type: page
title: getSpecification
--- 

# getSpecification

Returns an [OpenApi Specification](https://swagger.io/specification/) object to use in the [SwaggerUI app](https://swagger.io/tools/swagger-ui). 
Used to test the plugin. See [Testing section](/official-plugins/cloudinary/1/essentials/testing)

--- 

## Query Syntax 

### HTTP 

```http
URL: http://kuzzle:7512/_plugin/cloudinary/openApi/getSpecification
Method: GET
```

### Other protocols 

```js
{
  "controller": "cloudinary/openApi",
  "action": "getSpecification",
}
```
---

## Arguments 

None

---

## Response 

```js
{
 "openapi": "3.0.1",
    "info": {
      "title": "Kuzzle plugin : Cloudinary",
    ...
    }
  ...
}
```

## Possible Errors 

- [Common errors](/core/1/api/essentials/errors#common-errors)