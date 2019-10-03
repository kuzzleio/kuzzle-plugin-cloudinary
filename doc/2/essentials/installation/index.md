---
code: false
type: page
title: Installation
order: 100
---

# Kuzzle Plugin : Cloudinary

Cloudinary is cloud-based image and video management platform. It automates the entire image-processing pipeline: from uploads to on-the-fly manipulations to optimization to dynamic delivery with any CDN.

This plugin will let you use some of Cloudinary API's functions within Kuzzle. 

You can test this plugin with Swagger UI. Find more in the [Usage section](/official-plugins/cloudinary/2/essentials/usage)

## Installation 

Clone this repository in your `plugin/available` directory, install all needed modules with `npm install` and then link this directory to your `plugin/enabled` directory. 

```bash 
git clone https://github.com/kuzzleio/kuzzle-plugin-cloudinary.git /path-of-your-kuzzle/plugins/available cloudinary
cd /path-of-your-kuzzle/plugins/available/cloudinary/
npm install 
ln -sr ./ ../../plugins/enabled/cloudinary 
```

You can now restart Kuzzle and check [http://localhost:7512](http://localhost:7512), you should see the plugin name under the key `serverInfo.kuzzle.plugins.cloudinary`.

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

You can find more about Vault feature on the [Kuzzle documentation](/core/1/guides/essentials/secrets-vault)