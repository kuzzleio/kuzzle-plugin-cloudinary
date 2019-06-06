/*
 * Kuzzle, a backend software, self-hostable and ready to use
 * to power modern apps
 *
 * Copyright 2015-2019 Kuzzle
 * mailto: support AT kuzzle.io
 * website: http://kuzzle.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const Cloudinary = require("cloudinary").v2;

class CloudinaryPlugin {

    constructor() {
        this.context = null;

        this.config = {
            "cloudName": "",
            "cloudinaryApiKey": "",
            "cloudinaryApiSecret": ""
        }
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
        }

        this.routes = [
            {
                verb: "get",
                url: "/search/:expression",
                controller: "searchController",
                action: "search"
            },
            {
                verb: "get",
                url: "/search/",
                controller: "searchController",
                action: "search"
            }
        ];

        this.config = givenConfig;

        const { NODE_ENV } = process.env
        const missingCredMessage = "Cloudinary Plugin can't be used without the ApiKey, the ApiSecret and the CloudName of your Cloudinary Account"

        const { cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret } = this.config

        //Check if credentials are missing 
        if (!cloudinaryApiKey || !cloudinaryApiSecret || !cloudinaryCloudName) {
            if (NODE_ENV === "production") {
                throw new this.context.errors.InternalError(missingCredMessage);
            } else {
                //TODO Kuzzle Logger
                console.error(missingCredMessage);
            }
        } else {
            Cloudinary.config({
                cloud_name: cloudinaryCloudName,
                api_key: cloudinaryApiKey,
                api_secret: cloudinaryApiSecret
            })
        }

    }

    /**
     * Controller: search
     * Action: search
     *  
     * Get the list of assets corresponding to the given expression.
     * 
     * If no expression is given, it will return the list of all available assets
     * 
     * @param {Request} request 
     * 
     * @see https://cloudinary.com/documentation/search_api
     */
    async search(request) {
        // If no expr is given, then all file url will be returned
        const expr = (!!request.input.args.expression) ? request.input.args.expression : ""
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
}

module.exports = CloudinaryPlugin;