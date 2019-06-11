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

//TODO = Think about option in requests
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
        add_tag: (req) => this.add_tag(req),
        remove_tag: (req) => this.remove_tag(req),
        remove_all_tags: (req) => this.remove_all_tags(req),
        replace_tag: (req) => this.replace_tag(req),
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
        verb: 'patch',
        url: '/rename/',
        controller: 'uploadController',
        action: 'rename'
      },
      {
        verb: 'delete',
        url: '/destroy/',
        controller: 'uploadController',
        action: 'destroy'
      },
      {
        verb: 'post',
        url: '/add_tag/',
        controller: 'uploadController',
        action: 'add_tag'
      },
      {
        verb: 'delete',
        url: '/remove_tag/',
        controller: 'uploadController',
        action: 'remove_tag'
      },
      {
        verb: 'delete',
        url: '/remove_all_tags/',
        controller: 'uploadController',
        action: 'remove_all_tags'
      },
      {
        verb: 'patch',
        url: '/replace_tag/',
        controller: 'uploadController',
        action: 'replace_tag'
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
    const expr = this._getArg(request, 'expression');
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
    console.log(request);
    
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
        if (error.http_code === 404) {
          throw new this.context.errors.NotFoundError(error.message);
        }
      });
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
    const file = this._getArg(request, 'public_id');
    return await Cloudinary.uploader.destroy(file)
      //
      //
      // TODO Cloudinary Api is sending a 200 OK status when the file is not found. 
      // I wanted to change this into a 404 cause it seems more logical ... Need to find a way to do this 
      //
      //
      // .then(resp => {
      //   if (resp.result == 'not found') {
      //     return new this.context.errors.NotFoundError(error.message);
      //   }
      //   return resp;
      // })
      .catch(error => {
        switch (error.http_code) {
          case 401:
            throw new this.context.errors.UnauthorizedError(error.message);
          case 403:
            throw new this.context.errors.ForbiddenError(error.message);
          case 404:
            throw new this.context.errors.NotFoundError(error.message);
          case 500:
            throw new this.context.errors.ExternalServiceError(error.message);
          default:
            return error;
        }
      });
  }

  /**
   * Controller: upload
   * Action: add_tag
   *  
   * Add the given tag to the given assets 
   * The request must contain a tag and at least a public_id
   * 
   * If one of both is missing, a bad request error is thrown.
   * 
   * Several public_ids can be given but it must be send in a comma-separated string format
   * Be careful of white space as Cloudinary allows space in the public_ids
   * 
   * @param {Request} request 
   * 
   * @see https://cloudinary.com/documentation/image_upload_api_reference#tags_method
   */
  async add_tag(request) {
    const tag = this._getArg(request, 'tag'), to = this._getArg(request, 'public_ids').split(',');
    return await Cloudinary.uploader.add_tag(tag, to);
  }

  /**
   * Controller: upload
   * Action: remove_tag
   *  
   * Remove the given tag to the given assets 
   * The request must contain a tag and at least a public_id
   * 
   * If one of both is missing, a bad request error is thrown.
   * 
   * Several public_ids can be given but it must be send in a comma-separated string format
   * Be careful of white space as Cloudinary allows space in the public_ids
   * 
   * @param {Request} request 
   * 
   * @see https://cloudinary.com/documentation/image_upload_api_reference#tags_method
   */
  async remove_tag(request) {
    const tag = this._getArg(request, 'tag'), to = this._getArg(request, 'public_ids').split(',');
    return await Cloudinary.uploader.remove_tag(tag, to);
  }

  /**
   * Controller: upload
   * Action: remove_all_tags
   *  
   * Remove all tags from the given assets
   * The request must contain at least a public_id
   * 
   * If none is given, a bad request error is thrown.
   * 
   * Several public_ids can be given but it must be send in a comma-separated string format
   * Be careful of white space as Cloudinary allows space in the public_ids
   * 
   * @param {Request} request 
   * 
   * @see https://cloudinary.com/documentation/image_upload_api_reference#tags_method
   */
  async remove_all_tags(request) {
    const to = this._getArg(request, 'public_ids').split(',');
    return await Cloudinary.uploader.remove_all_tags(to);
  }

  /**
   * Controller: upload
   * Action: replace_tags
   *  
   * Replace all the tags of the given assets by the given tag
   * The request must contain a tag and at least a public_id
   * 
   * If one of both is missing, a bad request error is thrown.
   * 
   * Several public_ids can be given but it must be send in a comma-separated string format
   * Be careful of white space as Cloudinary allows space in the public_ids
   * 
   * @param {Request} request 
   * 
   * @see https://cloudinary.com/documentation/image_upload_api_reference#tags_method
   */
  async replace_tag(request) {
    const tag = this._getArg(request, 'tag'), to = this._getArg(request, 'public_ids').split(',');
    return await Cloudinary.uploader.replace_tag(tag, to);
  }

  _getArg(request, name) {
    if (request.input.args[name]) {
      return request.input.args[name];
    }
    throw new this.context.errors.BadRequestError(`You must provide ${name} to your request`);
  }
}
module.exports = CloudinaryPlugin;