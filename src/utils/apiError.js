// Define a class called apiError that extends the built-in Error class
class apiError extends Error {
  // Constructor function that takes in several parameters
  constructor(
    status, // HTTP status code
    message = "something went wrong", // Error message (default: "something went wrong")
    errors = [], // Array of error objects (default: empty array)
    stack = "" // Stack trace (default: empty string)
  ) {
    super(); // Call the constructor of the parent class (Error)

    // Set properties of the apiError instance
    this.status = status; // HTTP status code
    this.message = message; // Error message
    this.data = null; // Additional data (initially set to null)
    this.success = false; // Success flag (initially set to false)
    this.errors = errors; // Array of error objects

    // If a stack trace is provided, set it as the stack property of the instance
    // Otherwise, capture the stack trace using Error.captureStackTrace()
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Export the apiError class as a named export
export { apiError };
