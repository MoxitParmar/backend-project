class apiError extends Error {
  constructor(
    status,
    message = "something went wrong",
    errors = [],
    stack = ""
  ) {
    super();
    this.status = status;
    this.message = message;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { apiError };
