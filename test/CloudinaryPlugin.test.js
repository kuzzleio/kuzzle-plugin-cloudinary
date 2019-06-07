const KuzzleErrors = require('kuzzle-common-objects').errors,
    sinon = require('sinon'),
    RequestMock = require('./mocks/request.mock'),
    ContextMock = require('./mocks/context.mock'),
    should = require('should'),
    mockrequire = require('mock-require');
    
const cloudinary_fake_response = {
    "total_count": 1,
    "time": 269,
    "resources": [
      {
        "public_id": "sample",
        "folder": "",
        "filename": "sample",
        "format": "jpg",
        "version": 1559724354,
        "resource_type": "image",
        "type": "upload",
        "created_at": "2019-06-05T08:45:54+00:00",
        "uploaded_at": "2019-06-05T08:45:54+00:00",
        "bytes": 109669,
        "backup_bytes": 0,
        "width": 864,
        "height": 576,
        "aspect_ratio": 1.5,
        "pixels": 497664,
        "url": "http://res.cloudinary.com/dzuzk38yo/image/upload/v1559724354/sample.jpg",
        "secure_url": "https://res.cloudinary.com/dzuzk38yo/image/upload/v1559724354/sample.jpg",
        "status": "active",
        "access_mode": "public",
        "access_control": null,
        "etag": "3e297c2d8da6cb1310727332e862ece4"
      }
    ],
    "rate_limit_allowed": 500,
    "rate_limit_reset_at": "2019-06-07T13:00:00.000Z",
    "rate_limit_remaining": 491
}

class CloudinaryMock {
    constructor(config) {
        this.config = config
    }
}

describe('CloudinaryPlugin', () => {
    let
        cloudinaryPlugin,
        request,
        cloudinaryMock;

    beforeEach(() => {

        //What id should we use when you test
        const config = {
            'cloudinaryCloudName': 'dzuzk38yo',
            'cloudinaryApiKey': '745859141155738',
            'cloudinaryApiSecret': '42KpDVpEcFf0Oyho3gB4_Qg_fi4'
        }
        context = new ContextMock();
        request = new RequestMock();

        cloudinaryMock = {
            v2: {
                config: sinon.spy(),
                search: {
                    expression: sinon.stub().callsFake(() => {
                        return {
                            execute: () => {
                                return new Promise(
                                    (resolve, reject) => { 
                                        resolve(cloudinary_fake_response)
                                    }
                                )
                            }
                        }
                    })
                },
                upload: true,
                rename: true,
                destroy: true,
                add_tag: true,
                remve_tag: true,
                remove_all_tags: true,
                replace_tag: true
            }
        }
        mockrequire('cloudinary', cloudinaryMock);
        CloudinaryPlugin = mockrequire.reRequire('../lib/CloudinaryPlugin');
        cloudinaryPlugin = new CloudinaryPlugin();
        cloudinaryPlugin.init(config, context)
    })

    afterEach(() => {
        mockrequire.stopAll();
    })

    describe('#searchResult', () => {

        it('should get the secure url of the search result', async () => {
            const a = await cloudinaryPlugin.search(request);
            should(a).be.eql(cloudinary_fake_response.resources.map(v => v.secure_url));
        })
    })

})