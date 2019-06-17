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