/*
 * Kuzzle, a backend software, self-hostable and ready to use
 * to power modern apps
 *
 * Copyright 2015-2019 Kuzzle
 * mailto: support AT kuzzle.io
 * website: http://kuzzle.io
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const Cloudinary = require('cloudinary').v2;


class CloudinaryPlugin {

  constructor() {
    this.context = null;

    this.config = {
      'cloudName': '',
      'cloudinaryApiKey': '',
      'cloudinaryApiSecret': ''
    };
  }

  init(givenConfig, context) {
    this.context = context;

    this.controllers = {
      searchController: {
        search: (req) => this.search(req)
      },

      uploadController: {
        upload: (req) => this.upload(req),
        rename: (req) => this.rename(req),
        destroy: (req) => this.destroy(req),
        tags: (req) => this.add_tag(req),
      }
    };

    this.routes = [
      {
        verb: 'get',
        url: '/search/:expression',
        controller: 'searchController',
        action: 'search'
      },
      {
        verb: 'post',
        url: '/rename/',
        controller: 'uploadController',
        action: 'rename'
      }
    ];

    this.config = givenConfig;

    const { NODE_ENV } = process.env;
    const missingCredMessage = 'Cloudinary Plugin cannot be used without the ApiKey, the ApiSecret and the CloudName of your Cloudinary Account';

    const { cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret } = this.config;

    //Check if credentials are missing 
    if (!cloudinaryApiKey || !cloudinaryApiSecret || !cloudinaryCloudName) {
      if (NODE_ENV === 'production') {
        throw new this.context.errors.InternalError(missingCredMessage);
      } else {
        //TODO Kuzzle Logger
        this.context.log.error(missingCredMessage);
        console.log(missingCredMessage);
      }
    } else {
      Cloudinary.config({
        cloud_name: cloudinaryCloudName,
        api_key: cloudinaryApiKey,
        api_secret: cloudinaryApiSecret
      });
    }

  }

  /**
   * Controller: search
   * Action: search
   *  
   * Get the list of assets corresponding to the given expression.
   * 
   * If no expression is given, a bad request error is thrown
   * 
   * @param {Request} request 
   * 
   * @see https://cloudinary.com/documentation/search_api
   */
  async search(request) {
    // If no expr is given, then all file url will be returned
    const expr = this._getArg(request,'expression');
    return Cloudinary.search
      .expression(expr)
      .execute()
      .then(results => results.resources.map(v => v.secure_url));
  }

  /**
   * Controller: upload
   * Action: upload
   *  
   * Upload the given asset.
   * The request must contain a public_id for the uploaded asset
   * 
   * If none is given, a bad request error is thrown.
   * 
   * @param {Request} request 
   * 
   * @see https://cloudinary.com/documentation/image_upload_api_reference#upload_method
   */
  async upload(request) {


  }

  /**
   * Controller: upload
   * Action: rename
   *  
   * Rename the asset.
   * The request must contain a public_id for the original path and another public_id for the destination path.
   * 
   * If one of both is missing, a bad request error is thrown.
   * 
   * @param {Request} request 
   * 
   * @see https://cloudinary.com/documentation/image_upload_api_reference#rename_method 
   */
  async rename(request) {
    const from = this._getArg(request, 'from_public_id'), to = this._getArg(request, 'to_public_id');
    return await Cloudinary.uploader.rename(from, to)
      .catch(error => { 
        if(error.http_code == 404){
          throw new this.context.errors.NotFoundError(error.message);
        }
      })
  }


  /**
   * Controller: upload
   * Action: destroy
   *  
   * Destroy the asset.
   * The request must contain a public_id for the path to be deleted.
   * 
   * If none is given, a bad request error is thrown.
   * 
   * @param {Request} request 
   * 
   * @see https://cloudinary.com/documentation/image_upload_api_reference#destroy_method
   */
  async destroy(request) {

  }

  /**
   * Controller: upload
   * Action: add_tag
   *  
   * Add the given tag to the given asset
   * The request must contain a tag and a public_id 
   * 
   * If one of both is missing, a bad request error is thrown.
   * 
   * @param {Request} request 
   * 
   * @see https://cloudinary.com/documentation/image_upload_api_reference#tags_method
   */
  async add_tag(request) {

  }

  _getArg(request, name) {
    if (request.input.args[name]) {
      return request.input.args[name]
    } else {
      throw new this.context.errors.BadRequestError(`You must provide ${name} to your request`);
    }
  }
}
module.exports = CloudinaryPlugin;