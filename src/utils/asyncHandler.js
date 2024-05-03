// This function wraps an async request handler with error handling
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    // Wrap the request handler in a Promise to handle async operations
    Promise.resolve(requestHandler(req, res, next))
      .catch((err) => next(err)) // Catch any errors and pass them to the next middleware
  }
}

export { asyncHandler }

// another method
	// const asyncHandler = (fn) => async (req, res, next) => {
	//     try {
	//         await fn(req, res, next)
	//     } catch (error) {
	//         res.status(err.code || 500).json({
	//             success: false,
	//             message: err.message
	//         })
	//     }
	// }