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
  }

  init(config, context) {
    this.context = context;

    this.controllers = {
      assetsController: {
        search: 'search',
        rename: 'rename',
        destroy: 'destroy',
        transform: 'transform'
      },

      tagsController: {
        add_tag: 'add_tag',
        remove_tag: 'remove_tag',
        remove_all_tags: 'remove_all_tags',
        replace_tag: 'replace_tag'
      },
    };

    this.routes = [
      {
        verb: 'get',
        url: '/assets/:expression',
        controller: 'assetsController',
        action: 'search'
      },
      {
        verb: 'get',
        url: '/assets/transform',
        controller: 'assetsController',
        action: 'transform'
      },
      {
        verb: 'put',
        url: '/assets',
        controller: 'assetsController',
        action: 'rename'
      },
      {
        verb: 'delete',
        url: '/assets',
        controller: 'assetsController',
        action: 'destroy'
      },
      {
        verb: 'post',
        url: '/tags',
        controller: 'tagsController',
        action: 'add_tag'
      },
      {
        verb: 'put',
        url: '/tags',
        controller: 'tagsController',
        action: 'replace_tag'
      },
      {
        verb: 'delete',
        url: '/tags',
        controller: 'tagsController',
        action: 'remove_tag'
      },
      {
        verb: 'delete',
        url: '/tags/removeAll',
        controller: 'tagsController',
        action: 'remove_all_tags'
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
   * Controller: Assets
   * Action: search
   *  
   * Get the list of assets corresponding to the given expression.
   * 
   * @param {Request} request 
   * 
   * @see https://cloudinary.com/documentation/search_api
   */
  async search(request) {
    const result = await Cloudinary.search
      .expression(this._getArg(request.input.args, 'expression'))
      .execute();
    return result.resources.map(v => v.secure_url);
  }

  /**
   * Controller: Assets
   * Action: transform
   * 
   * Get the url of the assets after applying the given transformations
   *
   * @see https://cloudinary.com/documentation/image_transformation_reference
   * @param {Request} request 
   */
  async transform(request) {
    const public_id = this._getArg(request.input.body, 'public_id'),
      transform = this._getArg(request.input.body, 'transformation');
    return await Cloudinary.url(public_id, transform);
  }


  /**
   * Controller: Assets
   * Action: rename
   *  
   * Rename the asset.
   * The request must contain two public_id in its body : one for the original path and another one for the destination path.
   * 
   * If one of both is missing, a bad request error is thrown.
   * 
   * @param {Request} request 
   * 
   * @see https://cloudinary.com/documentation/image_upload_api_reference#rename_method 
   */
  async rename(request) {
    const from = this._getArg(request.input.body, 'from_public_id'),
      to = this._getArg(request.input.body, 'to_public_id');
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
   * Controller: Assets
   * Action: destroy
   *  
   * Destroy the asset.
   * The request must contain a public_id in its body for the asset to be deleted.
   * 
   * If none is given, a bad request error is thrown.
   * 
   * @param {Request} request 
   * 
   * @see https://cloudinary.com/documentation/image_upload_api_reference#destroy_method
   */
  async destroy(request) {
    const file = this._getArg(request.input.body, 'public_id'),
      result = await Cloudinary.uploader.destroy(file);

    // Cloudinary is sending a 200 response with result = 'not found' if the file is not found.
    if (result.result === 'not found') {
      throw new this.context.errors.NotFoundError('Ressource not found');
    }
    return result;
  }

  /**
   * Controller: Tags
   * Action: add_tag
   *  
   * Add the given tag to the given assets 
   * The request must contain, in its body, a tag and at least a public_id 
   * 
   * If one of both is missing, a bad request error is thrown.
   * 
   * You can give several public_ids by setting public_id to an array of string 
   * Be careful of white space as Cloudinary allows space in the public_ids
   * 
   * @param {Request} request 
   * 
   * @see https://cloudinary.com/documentation/image_upload_api_reference#tags_method
   */
  async add_tag(request) {
    const tag = this._getArg(request.input.body, 'tag'),
      to = this._getArg(request.input.body, 'public_id', true),
      res = await Cloudinary.uploader.add_tag(tag, to);
    this._handleError(to, res.public_ids);
    return res;
  }

  /**
   * Controller: Tags
   * Action: replace_tags
   *  
   * Replace all the tags of the given assets by the given tag
   * The request must contain a tag and at least a public_id
   * 
   * If one of both is missing, a bad request error is thrown.
   * 
   * You can give several public_ids by setting public_id to an array of string 
   * Be careful of white space as Cloudinary allows space in the public_ids
   * 
   * @param {Request} request 
   * 
   * @see https://cloudinary.com/documentation/image_upload_api_reference#tags_method
   */
  async replace_tag(request) {
    const tag = this._getArg(request.input.body, 'tag'),
      to = this._getArg(request.input.body, 'public_id', true),
      res = await Cloudinary.uploader.replace_tag(tag, to);
    this._handleError(to, res.public_ids);
    return res;
  }

  /**
   * Controller: Tags
   * Action: remove_tag
   *  
   * Remove the given tag to the given assets 
   * The request must contain a tag and at least a public_id
   * 
   * If one of both is missing, a bad request error is thrown.
   *
   * You can give several public_ids by setting public_id to an array of string 
   * Be careful of white space as Cloudinary allows space in the public_ids
   * 
   * @param {Request} request 
   * 
   * @see https://cloudinary.com/documentation/image_upload_api_reference#tags_method
   */
  async remove_tag(request) {
    const tag = this._getArg(request.input.body, 'tag'),
      to = this._getArg(request.input.body, 'public_id', true),
      res = await Cloudinary.uploader.remove_tag(tag, to);
    this._handleError(to, res.public_ids);
    return res;
  }

  /**
   * Controller: Tags
   * Action: remove_all_tags
   *  
   * Remove all tags from the given assets
   * The request must contain at least a public_id
   * 
   * If none is given, a bad request error is thrown.
   * 
   * You can give several public_ids by setting public_id to an array of string 
   * Be careful of white space as Cloudinary allows space in the public_ids
   * 
   * @param {Request} request 
   * 
   * @see https://cloudinary.com/documentation/image_upload_api_reference#tags_method
   */
  async remove_all_tags(request) {
    const to = this._getArg(request.input.body, 'public_id', true),
      res = await Cloudinary.uploader.remove_all_tags(to);
    this._handleError(to, res.public_ids);
    return res;
  }

  /** Extracts the args with the given name from the given request. 
   * If the request does not contains an attribute with the given name, it will throw a bad request error. 
   * 
   * If array attribute is equal to true, the function returns an array containing the needed args
   * 
   * @param {Request} request 
   * @param {String} name 
   */
  _getArg(source, name, array = false) {
    if (source[name]) {
      if (array) {
        return source[name] instanceof Array ? source[name] : [source[name]];
      }
      return source[name];
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
        notFoundIDS.map(id => ({ message: 'not found', public_id: id }))
      );
    }
  }
}
module.exports = CloudinaryPlugin;