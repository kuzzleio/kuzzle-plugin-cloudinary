const sinon = require('sinon');

class CloudinaryMock {
  constructor(config) {
    this.config = config;
    this.v2 = {
      config: sinon.spy(),
      search: {
        expression: sinon.stub().returns({
          execute: sinon.stub().returns({ resources: []})
        })
      },
      url: sinon.stub().returns({result: 'a link'}),
      uploader: {
        upload: sinon.stub(),
        rename: sinon.stub(),
        destroy: sinon.stub().returns({result: ''}),
        addTag: sinon.stub().returns({public_ids: ['id1','id2']}),
        removeTag: sinon.stub().returns({public_ids: ['id1','id2']}),
        removeAllTags: sinon.stub().returns({public_ids: ['id1','id2']}),
        replaceTag: sinon.stub().returns({public_ids: ['id1','id2']})
      }
    };
  }
}

module.exports = CloudinaryMock;