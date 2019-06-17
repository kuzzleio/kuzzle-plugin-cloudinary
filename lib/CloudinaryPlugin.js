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

  init(config, context) {
    this.context = context;

    this.controllers = {
      searchController: {
        search: 'search'
      },

      uploadController: {
        upload: 'upload',
        rename: 'rename',
        destroy: 'destroy',
        add_tag: 'add_tag',
        remove_tag: 'remove_tag',
        remove_all_tags: 'remove_all_tags',
        replace_tag: 'replace_tag'
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

    this.config = config;

    const { NODE_ENV } = process.env;
    const { cloudName, APIKey, APISecret } = this.context.secrets.cloudinary || {};

    if (!APIKey || !APISecret || !cloudName) {
      if (NODE_ENV !== 'development') {
        throw new this.context.errors.InternalError('Cloudinary Plugin cannot be used without the ApiKey, the ApiSecret and the CloudName of your Cloudinary Account');
      } else {
        this.context.log.error('Cloudinary Plugin cannot be used without the ApiKey, the ApiSecret and the CloudName of your Cloudinary Account.\nUsing this plugin outside of development without those keys will prevent Kuzzle from starting.');
      }
    } else {
      Cloudinary.config({
        cloud_name: cloudName,
        api_key: APIKey,
        api_secret: APISecret
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
    const result = await Cloudinary.search
      .expression(this._getArg(request, 'expression'))
      .execute();
    return result.resources.map(v => v.secure_url);
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
  async upload() {
    throw new this.context.errors.PluginImplementationError('Not yet implemented');
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
    try {
      return await Cloudinary.uploader.rename(from, to);
    } catch (error) {
      if (error.http_code === 404) {
        throw new this.context.errors.NotFoundError(error.message);
      } else {
        throw new this.context.errors.ExternalServiceError(error.message);
      }
    }
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
    const result = await Cloudinary.uploader.destroy(file);

    // Cloudinary is sending a 200 response with result = 'not found' if the file is not found.
    if (result.result === 'not found') {
      throw new this.context.errors.NotFoundError('Ressource not found');
    }
    return result;
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
   * Several public_ids can be given in the public_id arg.  
   * Be careful of white space as Cloudinary allows space in the public_ids
   * 
   * @param {Request} request 
   * 
   * @see https://cloudinary.com/documentation/image_upload_api_reference#tags_method
   */
  async add_tag(request) {
    const tag = this._getArg(request, 'tag'), to = this._getArrayArg(request, 'public_id');
    const res = await Cloudinary.uploader.add_tag(tag, to);
    this._handleError(to, res.public_ids);
    return res;
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
   * Several public_ids can be given in the public_id arg.  
   * Be careful of white space as Cloudinary allows space in the public_ids
   * 
   * @param {Request} request 
   * 
   * @see https://cloudinary.com/documentation/image_upload_api_reference#tags_method
   */
  async remove_tag(request) {
    const tag = this._getArg(request, 'tag'), to = this._getArrayArg(request, 'public_id');
    const res = await Cloudinary.uploader.remove_tag(tag, to);
    this._handleError(to, res.public_ids);
    return res;
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
   * Several public_ids can be given in the public_id arg.
   * Be careful of white space as Cloudinary allows space in the public_ids
   * 
   * @param {Request} request 
   * 
   * @see https://cloudinary.com/documentation/image_upload_api_reference#tags_method
   */
  async remove_all_tags(request) {
    const to = this._getArrayArg(request, 'public_id');
    const res = await Cloudinary.uploader.remove_all_tags(to);
    this._handleError(to, res.public_ids);
    return res;
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
   * Several public_ids can be given in the public_id arg.
   * Be careful of white space as Cloudinary allows space in the public_ids
   * 
   * @param {Request} request 
   * 
   * @see https://cloudinary.com/documentation/image_upload_api_reference#tags_method
   */
  async replace_tag(request) {
    const tag = this._getArg(request, 'tag'), to = this._getArrayArg(request, 'public_id');
    const res = await Cloudinary.uploader.replace_tag(tag, to);
    this._handleError(to, res.public_ids);
    return res;
  }

  /** Extracts the args with the given name from the given request. 
   * If the request does not contains an attribute with the given name, it will throw a bad request error. 
   * 
   * @param {Request} request 
   * @param {String} name 
   */
  _getArg(request, name) {
    if (request.input.args[name]) {
      return request.input.args[name];
    }
    throw new this.context.errors.BadRequestError(`You must provide ${name} to your request`);
  }

  /** Extracts the args with the given name from the given request. 
   * It will throw a bad request error if the request does not contains an attribute with the given name
   * 
   * Also, this function will convert a single string into an array of a single string element. Thus, this function 
   * always return an array. 
   * 
   * @param {Request} request 
   * @param {String} name 
   */
  _getArrayArg(request, name) {
    if (request.input.args[name]) {
      return request.input.args[name] instanceof Array ? request.input.args[name] : [request.input.args[name]];
    }
    throw new this.context.errors.BadRequestError(`You must provide ${name} to your request`);
  }

  /** This function takes the update's result and throws an error if needed.
   * It's used since Cloudinary API is returning 200-status response to a tag-update request, even when a ressource is not found.
   * 
   * @param {[String]} givenPublicIDS 
   * @param {[String]} resultPublicIDS 
   */
  _handleError(givenPublicIDS, resultPublicIDS) {
    if (givenPublicIDS.length !== resultPublicIDS.length) {
      const notFoundIDS = givenPublicIDS.filter((item) => resultPublicIDS.indexOf(item));
      throw new this.context.errors.PartialError(
        'Some ressources haven\'t been updated',
        notFoundIDS.map((item) => { return { message: 'not found', public_id: item }; })
      );
    }
  }
}
module.exports = CloudinaryPlugin;