class apiResponce {
  constructor(statuscode, data, message = "success", success) {
    super();
    this.statuscode = statuscode;
    this.data = data;
    this.message = message;
    this.success = statuscode < 400;
  }
}

export { apiResponce };
