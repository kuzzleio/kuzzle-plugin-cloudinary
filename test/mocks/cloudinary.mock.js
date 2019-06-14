const sinon = require('sinon');

const cloudinary_fake_response = {
  'total_count': 1,
  'time': 269,
  'resources': [
    {
      'public_id': 'sample',
      'folder': '',
      'filename': 'sample',
      'format': 'jpg',
      'version': 1559724354,
      'resource_type': 'image',
      'type': 'upload',
      'created_at': '2019-06-05T08:45:54+00:00',
      'uploaded_at': '2019-06-05T08:45:54+00:00',
      'bytes': 109669,
      'backup_bytes': 0,
      'width': 864,
      'height': 576,
      'aspect_ratio': 1.5,
      'pixels': 497664,
      'url': 'http://res.cloudinary.com/dzuzk38yo/image/upload/v1559724354/sample.jpg',
      'secure_url': 'https://res.cloudinary.com/dzuzk38yo/image/upload/v1559724354/sample.jpg',
      'status': 'active',
      'access_mode': 'public',
      'access_control': null,
      'etag': '3e297c2d8da6cb1310727332e862ece4'
    }
  ],
  'rate_limit_allowed': 500,
  'rate_limit_reset_at': '2019-06-07T13:00:00.000Z',
  'rate_limit_remaining': 491
};

class CloudinaryMock {
  constructor(config) {
    this.config = config;
    this.v2 = {
      config: sinon.spy(),
      search: {
        expression: sinon.stub().callsFake(() => {
          return {
            execute: () => {
              return new Promise(
                (resolve) => {
                  resolve(cloudinary_fake_response);
                }
              );
            }
          };
        })
      },
      url: sinon.stub().returns({result: 'a link'}),
      uploader: {
        upload: sinon.stub(),
        rename: sinon.stub(),
        destroy: sinon.stub().returns({result: ''}),
        add_tag: sinon.stub().returns({public_ids: ['id1','id2']}),
        remove_tag: sinon.stub().returns({public_ids: ['id1','id2']}),
        remove_all_tags: sinon.stub().returns({public_ids: ['id1','id2']}),
        replace_tag: sinon.stub().returns({public_ids: ['id1','id2']})
      }
    };
  }
}

module.exports = CloudinaryMock;