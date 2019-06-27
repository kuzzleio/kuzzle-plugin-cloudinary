const
  RequestMock = require('./request.mock'),
  KuzzleErrors = require('kuzzle-common-objects').errors,
  sinon = require('sinon');

class ContextMock {
  constructor() {
    this.accessors = {
      sdk: {
        document: {
          createOrReplace: sinon.stub().resolves(),
          create: sinon.stub().resolves(),
          update: sinon.stub().resolves(),
          search: sinon.stub().resolves(),
          get: sinon.stub().resolves(),
          delete: sinon.stub().resolves()
        },
        index: {
          create: sinon.stub().resolves(),
          list: sinon.stub().resolves(),
          exists: sinon.stub().resolves()
        },
        collection: {
          create: sinon.stub().resolves(),
          updateSpecifications: sinon.stub().resolves()
        },
        ms: {
          get: sinon.stub().resolves(),
          set: sinon.stub().resolves(),
          incr: sinon.stub().resolves()
        },
        security: {
          getProfile: sinon.stub().resolves(),
          createProfile: sinon.stub().resolves(),
          updateUser: sinon.stub().resolves(),
          searchUsers: sinon.stub().resolves(),
          updateCredentials: sinon.stub().resolves()
        },
        query: sinon.stub().resolves()
      },
      execute: sinon.stub().resolves()
    };

    this.errors = KuzzleErrors;

    this.constructors = {
      Request: RequestMock
    };

    this.log = {
      error: sinon.stub(),
      info: sinon.stub(),
      warn: sinon.stub()
    };

    this.secrets = {
      cloudinary: {
        'APIKey': 'an api key',
        'APISecret': 'a very important secret',
        'cloudName': 'my cloud'
      }
    };
  }
}

module.exports = ContextMock;