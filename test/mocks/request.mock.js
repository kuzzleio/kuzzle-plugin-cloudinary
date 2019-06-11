class RequestMock {
  constructor() {
    // Object.entries(args).forEach(([key, value]) => {
    //   this[key] = value;
    // });

    this.context = {};
    this.input = {};
    this.result = {};
  }

  init(args) {
    this.context = args.context || {};
    this.input = args.input || {};
    this.result = args.result || {};
  }
}

module.exports = RequestMock;
