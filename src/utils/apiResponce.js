// Define a class called apiResponce
class apiResponce {
  // Constructor function that takes in statuscode, data, and an optional message parameter
  constructor(statuscode, data, message = "success") {
    // Set the statuscode property of the instance to the provided statuscode
    this.statuscode = statuscode;
    // Set the data property of the instance to the provided data
    this.data = data;
    // Set the message property of the instance to the provided message, or "success" if no message is provided
    this.message = message;
    // Set the success property of the instance to true if the statuscode is less than 400, otherwise set it to false
    this.success = statuscode < 400;
  }
}

// Export the apiResponce class as a named export
export { apiResponce };
