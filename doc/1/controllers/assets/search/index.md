--- 
code: true
type: page
title: search
--- 

# search

Searches for assets corresponding to the specified expression and options

--- 

## Query Syntax 

### HTTP 

```http
URL: http://kuzzle:7512/_plugin/cloudinary/assets/search
Method: POST
Body:
```
```js
{
  "expression": "<expression>",
  "max_results": "<number_of_result_max>",
  "next_cursor": "<next-cursor>",
  "with_field": [ "<additional_field_to_include>" ],
  "sort_by": [  ["<field>","<asc | desc>"] 
}
```

### Other protocols 

```js
{
  "controller": "cloudinary/assets",
  "action": "search",

  "body": {
    "expression": "<expression>",
    "max_results": "<number_of_result_max>",
    "next_cursor": "<next-cursor>",
    "with_field": [ "<additional_field_to_include>" ],
    "sort_by": [  ["<field>","<asc | desc>"] ]
  }
}
```
---

## Arguments 

- `expression` : Description of your response. See [Cloudinary documentation](https://cloudinary.com/documentation/search_api#expressions) for syntax information
- `next_cursor` :  When a search request has more results to return than `max_results`, the *next_cursor* value is returned as part of the response. You can then specify this value as the a parameter of the following request to continue your search.
::: warning 
You must provide, at least, either the `expression` or the `next_cursor` field. If both are set, `expression` will be ignored 
:::

### Optional
- `max_results` : Maximum number of assets to return. Default value : `50` 
- `with_field`: Additionnal fields to include in each asset description
- `sort_by` : An array of 2-values-array. First element is the field to sort resources by and the second one is the direction of the sort. 
  

You can find more info [here](https://cloudinary.com/documentation/search_api#parameters)

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
        "access_mode": "<access_mode>"
      }
    ],
    "rate_limit_allowed": "<initial_request_limit>",
    "rate_limit_reset_at": "<date_of_reset>",
    "rate_limit_remaining": "<current_request_limit>"
  }
}
```

For more information on search response, see [Cloudinary documentation](https://cloudinary.com/documentation/search_api#response)

## Possible Errors 

- <a href="/core/1/api/essentials/errors/#common-errors">Common errors</a>