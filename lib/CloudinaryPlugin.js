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

const Cloudinary = require('cloudinary').v2,
  openApiSpecification = require('../test/openApiSpec.json');

class CloudinaryPlugin {

  constructor() {
    this.context = null;
  }

  init(config, context) {
    this.context = context;

    this.controllers = {
      assets: {
        search: 'search',
        rename: 'rename',
        destroy: 'destroy',
        transform: 'transform'
      },

      tags: {
        addTag: 'addTag',
        removeTag: 'removeTag',
        removeAllTags: 'removeAllTags',
        replaceTag: 'replaceTag'
      },
      openApi: {
        getSpecification: 'getSpecification'
      }
    };

    this.routes = [
      {
        verb: 'post',
        url: '/assets/search',
        controller: 'assets',
        action: 'search'
      },
      {
        verb: 'post',
        url: '/assets/transform',
        controller: 'assets',
        action: 'transform'
      },
      {
        verb: 'put',
        url: '/assets/:public_id',
        controller: 'assets',
        action: 'rename'
      },
      {
        verb: 'delete',
        url: '/assets/:public_id',
        controller: 'assets',
        action: 'destroy'
      },
      {
        verb: 'post',
        url: '/tags/:tag',
        controller: 'tags',
        action: 'addTag'
      },
      {
        verb: 'put',
        url: '/tags/:tag',
        controller: 'tags',
        action: 'replaceTag'
      },
      {
        verb: 'delete',
        url: '/tags/:tag',
        controller: 'tags',
        action: 'removeTag'
      },
      {
        verb: 'delete',
        url: '/tags/remove_all',
        controller: 'tags',
        action: 'removeAllTags'
      },
      {
        verb: 'get',
        url: '/openApi',
        controller: 'openApi',
        action: 'getSpecification'
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
    const body = request.input.body;
    let cloudRequest = Cloudinary.search;

    if (body.next_cursor) {
      cloudRequest = cloudRequest
        .next_cursor(body.next_cursor);
    } else {
      cloudRequest = cloudRequest.expression(this._getArg(body, 'expression'));
      cloudRequest = body.max_results ? cloudRequest.max_results(body.max_results) : cloudRequest;
      if (body.sort_by) {
        for (const field of body.sort_by) {
          cloudRequest = cloudRequest.sort_by(field[0], field[1]);
        }
      }

      if (body.with_field) {
        for (const field of body.with_field) {
          cloudRequest = cloudRequest.with_field(field);
        }
      }
    }

    return cloudRequest.execute();
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
    return Cloudinary.url(public_id, transform);
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
    const from = this._getArg(request.input.args, 'public_id'),
      to = this._getArg(request.input.args, 'new_public_id');
    try {
      const res = await Cloudinary.uploader.rename(from, to);
      return res;
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
    const file = this._getArg(request.input.args, 'public_id'),
      result = await Cloudinary.uploader.destroy(file);

    // Cloudinary is sending a 200 response with result = 'not found' if the file is not found.
    if (result.result === 'not found') {
      throw new this.context.errors.NotFoundError('Ressource not found');
    }
    return result;
  }

  /**
   * Controller: Tags
   * Action: addTag
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
  async addTag(request) {
    const tag = this._getArg(request.input.args, 'tag'),
      to = this._getArg(request.input.args, 'public_id', true),
      res = await Cloudinary.uploader.add_tag(tag, to);
    this._handleError(to, res.public_ids);
    return res;
  }

  /**
   * Controller: Tags
   * Action: replaceTag
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
  async replaceTag(request) {
    const tag = this._getArg(request.input.args, 'tag'),
      to = this._getArg(request.input.args, 'public_id', true),
      res = await Cloudinary.uploader.replace_tag(tag, to);
    this._handleError(to, res.public_ids);
    return res;
  }

  /**
   * Controller: Tags
   * Action: removeTag
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
  async removeTag(request) {
    const tag = this._getArg(request.input.args, 'tag'),
      to = this._getArg(request.input.args, 'public_id', true),
      res = await Cloudinary.uploader.remove_tag(tag, to);
    this._handleError(to, res.public_ids);
    return res;
  }

  /**
   * Controller: Tags
   * Action: removeAllTags
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
  async removeAllTags(request) {
    const to = this._getArg(request.input.args, 'public_id', true),
      res = await Cloudinary.uploader.remove_all_tags(to);
    this._handleError(to, res.public_ids);
    return res;
  }

  /**
   * Controller: openApi
   * Action: getSpecification
   *
   * Return the openApiSpec.json file to allow testing via SwaggerUI
   *
   * @param {Request} request
   */
  async getSpecification(request) {
    request.response.raw = true;
    request.response.headers['Content-Type'] = 'application/json';

    return JSON.stringify(openApiSpecification, null, 2);
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
      return array && !(source[name] instanceof Array) ? [source[name]] : source[name];
    }
    throw new this.context.errors.BadRequestError(`You must provide ${name} to your request`);
  }

  /** This function takes the update's result and throws an error if needed.
   * It's used since Cloudinary API is returning 200-status response to a tag-update request, even when a ressource is not found.
   *
   * @param {[String]} givenPublicIds
   * @param {[String]} resultPublicIds
   */
  _handleError(givenPublicIds, resultPublicIds) {
    if (givenPublicIds.length !== resultPublicIds.length) {
      const notFoundIDS = givenPublicIds.filter((item) => resultPublicIds.indexOf(item));
      throw new this.context.errors.PartialError(
        'Some ressources haven\'t been updated',
        notFoundIDS.map(id => ({ message: 'not found', public_id: id }))
      );
    }
  }
}

module.exports = CloudinaryPlugin;