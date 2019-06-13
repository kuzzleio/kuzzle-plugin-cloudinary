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
    //What id should we use when you test
    const config = {
      'cloudinaryCloudName': 'cloudName',
      'cloudinaryApiKey': 'cloud_api_key',
      'cloudinaryApiSecret': 'cloud_api_secret'
    };

    context = new ContextMock();
    request = new RequestMock();


    mockrequire('cloudinary', cloudinaryMock);
    const CloudinaryPlugin = mockrequire.reRequire('../lib/CloudinaryPlugin');
    cloudinaryPlugin = new CloudinaryPlugin();
    cloudinaryPlugin.init(config, context);
  });

  afterEach(() => {
    mockrequire.stopAll();
    delete process.env.NODE_ENV;
  });

  describe('#configuration', () => {
    it('should warn user if no config is given', () => {
      //Should see if this.context.log.error is called 
      cloudinaryPlugin.init({}, context);

      return should(context.log.error).be.called();
    });

    it('should throw internal error in production if no config is given', () => {
      process.env.NODE_ENV = 'production';

      return should.throws(() => { cloudinaryPlugin.init({}, context);});

    });
  });

  describe('#argHelper', () => {
    it('should throw an error if asked arg is not in the request', () => {
      request.init({
        input: {
          args: {}
        }
      });

      return should.throws(() => cloudinaryPlugin._getArg(request, 'anArg'));
    });
  });

  describe('#errorHandlingHelper', () => {
    it('should throw a partial error when one of given public_ids isnt updated', () => {
      return should.throws(() => cloudinaryPlugin._handleError(['one', 'two'], ['two']));
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

    it('should fetch the request for an expression', async () => {
      sinon.spy(cloudinaryPlugin, '_getArg');
      
      await cloudinaryPlugin.search(request);

      return should(cloudinaryPlugin._getArg).be.calledWith(request, 'expression');
    });

    it('should call cloudinary function', async () => {
      await cloudinaryPlugin.search(request);

      return should(cloudinaryMock.v2.search.expression).be.calledWith('mySearch');
    });

    // it('should get the secure url of the search result', async () => {
    //   request.init({
    //     input: {
    //       args: {
    //         expression: 'test'
    //       }
    //     }
    //   });
    //   const res = await cloudinaryPlugin.search(request);
    //   should(res).be.eql(cloudinary_fake_response.resources.map(v => v.secure_url));
    // });

  });

  describe('#upload', () => {
    beforeEach(() => {
      request.init({
        input: {
          args: {
          }
        }
      });
    });

    it('should fetch the request for an image to be uploaded');

    it('should call cloudinary upload function'); 
    /*async () => {
      await cloudinaryPlugin.upload(request);
    });*/
  });

  describe('#rename', () => {
    beforeEach(() => {
      request.init({
        input: {
          args: {
            from_public_id: 'testOld',
            to_public_id: 'testNew'
          }
        }
      });
    });

    it('should fetch the request with two public_ids', async () => {
      sinon.spy(cloudinaryPlugin, '_getArg');

      await cloudinaryPlugin.rename(request);

      should(cloudinaryPlugin._getArg).be.calledWith(request, 'from_public_id');
      return should(cloudinaryPlugin._getArg).be.calledWith(request, 'to_public_id'); 
    });

    it('should rename the file', async () => {
      await cloudinaryPlugin.rename(request);

      return should(cloudinaryMock.v2.uploader.rename).calledWith('testOld', 'testNew');
    });

    it('should throws error when the ressource is not found', () => {
      cloudinaryMock.v2.uploader.rename = sinon.stub().throws({ http_code : 404 });

      return should(cloudinaryPlugin.rename(request)).be.rejectedWith(KuzzleErrors.NotFoundError);
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

    it('should fetch args for a public_id', async () => {
      sinon.spy(cloudinaryPlugin, '_getArg');

      await cloudinaryPlugin.destroy(request);

      should(cloudinaryPlugin._getArg).be.calledWith(request, 'public_id');
    });

    it('should destroy file', async () => {
      await cloudinaryPlugin.destroy(request);

      return should(cloudinaryMock.v2.uploader.destroy).be.calledWith('fileToDelete');
    });

    it('should throw 404 error when ressource is not found', () => {
      cloudinaryMock.v2.uploader.destroy = sinon.stub().returns({result : 'not found'}); 

      return should(cloudinaryPlugin.destroy(request)).be.rejectedWith(KuzzleErrors.NotFoundError);
    });
  });

  describe('#add_tag', () => {
    beforeEach(() => {
      request.init({
        input: {
          args: {
            public_ids: 'ids',
            tag: 'tag'
          }
        }
      });
    });

    it('should fetch for several public_ids and a tag', async () => {
      sinon.spy(cloudinaryPlugin, '_getArg');

      await cloudinaryPlugin.add_tag(request);

      should(cloudinaryPlugin._getArg).be.calledWith(request, 'public_ids');
      return should(cloudinaryPlugin._getArg).be.calledWith(request,'tag');
    });

    it('should call cloudinary add_tag function & error handler', async () => {
      sinon.spy(cloudinaryPlugin, '_handleError');

      await cloudinaryPlugin.add_tag(request);

      should(cloudinaryMock.v2.uploader.add_tag).be.calledWith('tag',['ids']);
      return should(cloudinaryPlugin._handleError).be.called();
    });

  });

  describe('#remove_tag', () => {
    beforeEach(() => {
      request.init({
        input: {
          args: {
            public_ids: 'ids',
            tag: 'tag'
          }
        }
      });
    });

    it('should fetch for several public_ids and a tag', async () => {
      sinon.spy(cloudinaryPlugin, '_getArg');

      await cloudinaryPlugin.remove_tag(request);

      should(cloudinaryPlugin._getArg).be.calledWith(request, 'public_ids');
      return should(cloudinaryPlugin._getArg).be.calledWith(request,'tag');
    });

    it('should call the cloudinary remove tag function and the error handler', async () => {
      sinon.spy(cloudinaryPlugin, '_handleError');

      await cloudinaryPlugin.remove_tag(request);

      should(cloudinaryMock.v2.uploader.remove_tag).be.calledWith('tag', ['ids']);
      return should(cloudinaryPlugin._handleError).be.called();
    });
  });

  describe('#remove_all_tags', () => {
    beforeEach(() => {
      request.init({
        input: {
          args: {
            public_ids: 'ids'
          }
        }
      });
    });

    it('should fetch for several public_ids', async () => {
      sinon.spy(cloudinaryPlugin, '_getArg');

      await cloudinaryPlugin.remove_all_tags(request);

      return should(cloudinaryPlugin._getArg).be.calledWith(request, 'public_ids');
    });

    it('should call the cloudinary remove all tags function and the error handler', async () => {
      sinon.spy(cloudinaryPlugin, '_handleError');

      await cloudinaryPlugin.remove_all_tags(request);

      should(cloudinaryMock.v2.uploader.remove_all_tags).be.calledWith(['ids']);
      return should(cloudinaryPlugin._handleError).be.called();
    });
  });

  describe('#replace_tag', () => {
    beforeEach(() => {
      request.init({
        input: {
          args: {
            public_ids: 'ids',
            tag: 'tag'
          }
        }
      });
    });

    it('should fetch for several public_ids', async () => {
      sinon.spy(cloudinaryPlugin, '_getArg');

      await cloudinaryPlugin.replace_tag(request);

      should(cloudinaryPlugin._getArg).be.calledWith(request, 'public_ids');
      return should(cloudinaryPlugin._getArg).be.calledWith(request, 'tag');
    });

    it('should call the cloudinary replace tag function and the error handler', async () => {
      await cloudinaryPlugin.replace_tag(request);

      return should(cloudinaryMock.v2.uploader.replace_tag).be.calledWith('tag',['ids']);
    });
  });

});