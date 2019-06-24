const sinon = require('sinon'),
  RequestMock = require('./mocks/request.mock'),
  ContextMock = require('./mocks/context.mock'),
  CloudinaryMock = require('./mocks/cloudinary.mock'),
  should = require('should'),
  KuzzleErrors = require('kuzzle-common-objects').errors,
  mockrequire = require('mock-require');

describe('CloudinaryPlugin', () => {
  let
    cloudinaryPlugin,
    request,
    context;
  const cloudinaryMock = new CloudinaryMock();

  beforeEach(() => {
    const config = {};

    context = new ContextMock();
    request = new RequestMock();


    mockrequire('cloudinary', cloudinaryMock);
    const CloudinaryPlugin = mockrequire.reRequire('../lib/index');
    cloudinaryPlugin = new CloudinaryPlugin();
    cloudinaryPlugin.init(config, context);
  });

  afterEach(() => {
    mockrequire.stopAll();
    delete process.env.NODE_ENV;
  });

  describe('#configuration', () => {
    it('should warn user if no secrets is given and if in development env', () => {
      process.env.NODE_ENV = 'development';
      delete context.secrets.cloudinary;

      cloudinaryPlugin.init({}, context);

      return should(context.log.error).be.called();
    });

    it('should throw internal error in production if no secret is given', () => {
      delete context.secrets.cloudinary;

      return should(() => cloudinaryPlugin.init({}, context)).throw();
    });
  });

  describe('#argHelper', () => {
    it('should throw an error if asked arg is not in the request', () => {
      request.init({
        input: {
          args: {
          }
        }
      });

      should(() => cloudinaryPlugin._getArg(request.input.args, 'anArg')).throw();
    });
  });

  describe('#errorHandlingHelper', () => {
    it('should throw a partial error when one of given public_ids isnt updated', () => {
      should(() => cloudinaryPlugin._handleError(['one', 'two'], ['two'])).throw();
    });
  });

  describe('#search', () => {
    beforeEach(() => {
      request.init({
        input: {
          args: {
            expression: 'mySearch'
          }
        }
      });
    });

    it('should fetch the request for an expression', () => {
      sinon.spy(cloudinaryPlugin, '_getArg');

      return cloudinaryPlugin.search(request)
        .then(() => {

          should(cloudinaryPlugin._getArg).be.calledWith(request.input.args, 'expression');
        });
    });

    it('should call cloudinary function', () => {
      cloudinaryPlugin.search(request)
        .then(() => {

          return should(cloudinaryMock.v2.search.expression).be.calledWith('mySearch');
        });
    });
  });

  describe('#transform', () => {
    beforeEach(() => {
      request.init({
        input: {
          body: {
            public_id: 'id1',
            transformation: {
              width: 400
            }
          }
        }
      });
    });

    it('should fetch the input for public id and transformation', () => {
      sinon.spy(cloudinaryPlugin, '_getArg');

      return cloudinaryPlugin.transform(request)
        .then(() => {

          should(cloudinaryPlugin._getArg).be.calledWith(request.input.body, 'public_id');
          should(cloudinaryPlugin._getArg).be.calledWith(request.input.body, 'transformation');
        });


    });

    it('should get cloudinary url', () => {
      return cloudinaryPlugin.transform(request)
        .then(() => {
          should(cloudinaryMock.v2.url).be.calledWith('id1', { width: 400 });
        });
    });
  });

  describe('#rename', () => {
    beforeEach(() => {
      request.init({
        input: {
          body: {
            from_public_id: 'testOld',
            to_public_id: 'testNew'
          }
        }
      });
    });

    it('should fetch the request with two public_ids', () => {
      sinon.spy(cloudinaryPlugin, '_getArg');

      return cloudinaryPlugin.rename(request)
        .then(() => {

          should(cloudinaryPlugin._getArg).be.calledWith(request.input.body, 'from_public_id');
          should(cloudinaryPlugin._getArg).be.calledWith(request.input.body, 'to_public_id');
        });
    });

    it('should rename the file', () => {
      return cloudinaryPlugin.rename(request)
        .then(() => {

          should(cloudinaryMock.v2.uploader.rename).calledWith('testOld', 'testNew');
        });
    });

    it('should throws error when the ressource is not found', () => {
      cloudinaryMock.v2.uploader.rename = sinon.stub().throws({ http_code: 404 });

      should(cloudinaryPlugin.rename(request)).be.rejectedWith(KuzzleErrors.NotFoundError);
    });
  });

  describe('#destroy', () => {
    beforeEach(() => {
      request.init({
        input: {
          body: {
            public_id: 'fileToDelete'
          }
        }
      });
    });

    it('should fetch args for a public_id', () => {
      sinon.spy(cloudinaryPlugin, '_getArg');

      return cloudinaryPlugin.destroy(request)
        .then(() => {

          should(cloudinaryPlugin._getArg).be.calledWith(request.input.body, 'public_id');
        });

    });

    it('should destroy file', () => {
      return cloudinaryPlugin.destroy(request)
        .then(() => {

          should(cloudinaryMock.v2.uploader.destroy).be.calledWith('fileToDelete');
        });
    });

    it('should throw 404 error when ressource is not found', () => {
      cloudinaryMock.v2.uploader.destroy = sinon.stub().returns({ result: 'not found' });

      should(cloudinaryPlugin.destroy(request)).be.rejectedWith(KuzzleErrors.NotFoundError);
    });
  });

  describe('#addTag', () => {
    beforeEach(() => {
      request.init({
        input: {
          body: {
            public_id: ['id1', 'id2'],
            tag: 'tag'
          }
        }
      });
    });

    it('should fetch for several public_ids and a tag', () => {
      sinon.spy(cloudinaryPlugin, '_getArg');

      return cloudinaryPlugin.addTag(request)
        .then(() => {

          should(cloudinaryPlugin._getArg).be.calledWith(request.input.body, 'public_id', true);
          should(cloudinaryPlugin._getArg).be.calledWith(request.input.body, 'tag');
        });
    });

    it('should call cloudinary addTag function & error handler', () => {
      sinon.spy(cloudinaryPlugin, '_handleError');

      return cloudinaryPlugin.addTag(request)
        .then(() => {

          should(cloudinaryMock.v2.uploader.addTag).be.calledWith('tag', ['id1', 'id2']);
          should(cloudinaryPlugin._handleError).be.called();
        });
    });
  });

  describe('#replaceTag', () => {
    beforeEach(() => {
      request.init({
        input: {
          body: {
            public_id: ['id1', 'id2'],
            tag: 'tag'
          }
        }
      });
    });

    it('should fetch for several public_ids', () => {
      sinon.spy(cloudinaryPlugin, '_getArg');

      return cloudinaryPlugin.replaceTag(request)
        .then(() => {

          should(cloudinaryPlugin._getArg).be.calledWith(request.input.body, 'public_id', true);
          should(cloudinaryPlugin._getArg).be.calledWith(request.input.body, 'tag');
        });
    });

    it('should call the cloudinary replace tag function and the error handler', () => {
      return cloudinaryPlugin.replaceTag(request)
        .then(() => {

          should(cloudinaryMock.v2.uploader.replaceTag).be.calledWith('tag', ['id1', 'id2']);
        });
    });
  });

  describe('#removeTag', () => {
    beforeEach(() => {
      request.init({
        input: {
          body: {
            public_id: ['id1', 'id2'],
            tag: 'tag'
          }
        }
      });
    });

    it('should fetch for several public_ids and a tag', () => {
      sinon.spy(cloudinaryPlugin, '_getArg');

      return cloudinaryPlugin.removeTag(request)
        .then(() => {

          should(cloudinaryPlugin._getArg).be.calledWith(request.input.body, 'public_id', true);
          should(cloudinaryPlugin._getArg).be.calledWith(request.input.body, 'tag');
        });
    });

    it('should call the cloudinary remove tag function and the error handler', () => {
      sinon.spy(cloudinaryPlugin, '_handleError');

      return cloudinaryPlugin.removeTag(request)
        .then(() => {

          should(cloudinaryMock.v2.uploader.removeTag).be.calledWith('tag', ['id1', 'id2']);
          should(cloudinaryPlugin._handleError).be.called();
        });
    });
  });

  describe('#removeAllTags', () => {
    beforeEach(() => {
      request.init({
        input: {
          body: {
            public_id: ['id1', 'id2'],
          }
        }
      });
    });

    it('should fetch for several public_ids', () => {
      sinon.spy(cloudinaryPlugin, '_getArg');

      return cloudinaryPlugin.removeAllTags(request)
        .then(() => {

          should(cloudinaryPlugin._getArg).be.calledWith(request.input.body, 'public_id', true);
        });
    });

    it('should call the cloudinary remove all tags function and the error handler', () => {
      sinon.spy(cloudinaryPlugin, '_handleError');

      return cloudinaryPlugin.removeAllTags(request)
        .then(() => {

          should(cloudinaryMock.v2.uploader.removeAllTags).be.calledWith(['id1', 'id2']);
          should(cloudinaryPlugin._handleError).be.called();
        });
    });
  });
});