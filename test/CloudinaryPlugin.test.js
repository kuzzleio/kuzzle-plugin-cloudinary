const sinon = require('sinon'),
  RequestMock = require('./mocks/request.mock'),
  ContextMock = require('./mocks/context.mock'),
  CloudinaryMock = require('./mocks/cloudinary.mock'),
  should = require('should'),
  KuzzleErrors = require('kuzzle-common-objects').errors,
  mockrequire = require('mock-require'),
  openApiSpecification = require('./openApiSpec.json');

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
    
    it('should return an array if asked', () => {
      request.init({
        input: {
          args: {
            anArg: 'notArray'
          }
        }
      });

      const res = cloudinaryPlugin._getArg(request.input.args, 'anArg', true);
      should(res).be.eql(['notArray']);
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
          body: {
            expression: 'cat AND resource-type:image',
            max_results: 20,
            with_field: [
              'tags'
            ],
            sort_by: [
              [
                'public_id',
                'asc'
              ]
            ]
          }
        }
      });
    });

    it('should fetch the request only with next_cursor', () => {
      request.input.body.next_cursor = 'longcursor1234567890';

      return cloudinaryPlugin.search(request)
        .then(() => {

          should(cloudinaryMock.v2.search.next_cursor).be.calledWith('longcursor1234567890');
        });
    });

    it('should ignore expression when expression and next_cursor are set', () => {
      request.input.body.next_cursor = 'longcursor1234567890';

      return cloudinaryPlugin.search(request)
        .then(() => {

          should(cloudinaryMock.v2.search.expression).not.be.called();
          should(cloudinaryMock.v2.search.next_cursor).be.calledWith('longcursor1234567890');
        });
    });

    it('handle search request body', () => {
      cloudinaryMock.v2.search.next_cursor.reset();

      return cloudinaryPlugin.search(request)
        .then(() => {

          should(cloudinaryMock.v2.search.expression).be.calledWith('cat AND resource-type:image');
          should(cloudinaryMock.v2.search.expression().max_results).be.calledWith(20);
          should(cloudinaryMock.v2.search.expression().max_results().sort_by).be.calledWith('public_id', 'asc');
          should(cloudinaryMock.v2.search.expression().max_results().sort_by().with_field).be.calledWith('tags');
          should(cloudinaryMock.v2.search.next_cursor).not.be.called();
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
          args: {
            public_id: 'testOld',
            new_public_id: 'testNew'
          }
        }
      });
    });

    it('should fetch the request with two public_ids', () => {
      sinon.spy(cloudinaryPlugin, '_getArg');

      return cloudinaryPlugin.rename(request)
        .then(() => {

          should(cloudinaryPlugin._getArg).be.calledWith(request.input.args, 'public_id');
          should(cloudinaryPlugin._getArg).be.calledWith(request.input.args, 'new_public_id');
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
          args: {
            public_id: 'fileToDelete'
          }
        }
      });
    });

    it('should fetch args for a public_id', () => {
      sinon.spy(cloudinaryPlugin, '_getArg');

      return cloudinaryPlugin.destroy(request)
        .then(() => {

          should(cloudinaryPlugin._getArg).be.calledWith(request.input.args, 'public_id');
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
          args: {
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

          should(cloudinaryPlugin._getArg).be.calledWith(request.input.args, 'public_id', true);
          should(cloudinaryPlugin._getArg).be.calledWith(request.input.args, 'tag');
        });
    });

    it('should call cloudinary addTag function & error handler', () => {
      sinon.spy(cloudinaryPlugin, '_handleError');

      return cloudinaryPlugin.addTag(request)
        .then(() => {

          should(cloudinaryMock.v2.uploader.add_tag).be.calledWith('tag', ['id1', 'id2']);
          should(cloudinaryPlugin._handleError).be.called();
        });
    });
  });

  describe('#replaceTag', () => {
    beforeEach(() => {
      request.init({
        input: {
          args: {
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

          should(cloudinaryPlugin._getArg).be.calledWith(request.input.args, 'public_id', true);
          should(cloudinaryPlugin._getArg).be.calledWith(request.input.args, 'tag');
        });
    });

    it('should call the cloudinary replace tag function and the error handler', () => {
      return cloudinaryPlugin.replaceTag(request)
        .then(() => {

          should(cloudinaryMock.v2.uploader.replace_tag).be.calledWith('tag', ['id1', 'id2']);
        });
    });
  });

  describe('#removeTag', () => {
    beforeEach(() => {
      request.init({
        input: {
          args: {
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

          should(cloudinaryPlugin._getArg).be.calledWith(request.input.args, 'public_id', true);
          should(cloudinaryPlugin._getArg).be.calledWith(request.input.args, 'tag');
        });
    });

    it('should call the cloudinary remove tag function and the error handler', () => {
      sinon.spy(cloudinaryPlugin, '_handleError');

      return cloudinaryPlugin.removeTag(request)
        .then(() => {

          should(cloudinaryMock.v2.uploader.remove_tag).be.calledWith('tag', ['id1', 'id2']);
          should(cloudinaryPlugin._handleError).be.called();
        });
    });
  });

  describe('#removeAllTags', () => {
    beforeEach(() => {
      request.init({
        input: {
          args: {
            public_id: ['id1', 'id2'],
          }
        }
      });
    });

    it('should fetch for several public_ids', () => {
      sinon.spy(cloudinaryPlugin, '_getArg');

      return cloudinaryPlugin.removeAllTags(request)
        .then(() => {

          should(cloudinaryPlugin._getArg).be.calledWith(request.input.args, 'public_id', true);
        });
    });

    it('should call the cloudinary remove all tags function and the error handler', () => {
      sinon.spy(cloudinaryPlugin, '_handleError');

      return cloudinaryPlugin.removeAllTags(request)
        .then(() => {

          should(cloudinaryMock.v2.uploader.remove_all_tags).be.calledWith(['id1', 'id2']);
          should(cloudinaryPlugin._handleError).be.called();
        });
    });
  });

  describe('#openApiSpecification', () => {
    it('should return open api object', () => {
      request.init({
        response: { 
          raw: false, 
          headers: {
            'Content-Type': null
          }
        }
      });

      return cloudinaryPlugin.getSpecification(request)
        .then((response) => {

          should(response).be.eql(JSON.stringify(openApiSpecification, null, 2));
        });
    });
  });
});