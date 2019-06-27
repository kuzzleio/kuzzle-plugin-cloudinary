class RequestMock {
  constructor() {
    this.context = {};
    this.input = {};
    this.result = {};
    this.response = {};
  }

  init(args) {
    this.context = args.context || {};
    this.input = args.input || {};
    this.result = args.result || {};
    this.response = args.response || {};
  }
}

module.exports = RequestMock;
