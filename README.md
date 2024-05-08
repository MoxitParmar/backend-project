## VideoVerse

VideoVerse is a complete backend web application similar to YouTube, built with the MERN stack. It offers many of the same features as YouTube. the backend for this project is completed and Now gearing up to dive into frontend development for this project. Stay tuned for more updates! 💻

this project is inspired by [chai-backend series](https://youtube.com/playlist?list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&feature=shared) 

---
## functionality of the VideoVerse backend
### Authentication

- **Login:** Secure authentication with JWT tokens system allowing users to log in to their accounts.
- **Signup:** Registration process create access and refresh tokens for new users.
- **Logout:** Log out functionality for user sessions with termination of tokens.

### Channel

The Channel section provides users with a personalized space for managing their content and interactions:

-  **Videos:** Contains the user's uploaded videos, with sort operations.
-  **Tweets:** Access to tweets posted by the user, with editing, deleting, and updating capabilities.
-  **Playlists:** Management of created playlists, including creation, editing, updating, and deletion.
-  **Subscribers:** Overview of the user's subscriber base.
-  **Liked Video List of user:** View liked videos with infinite scroll pagination.

### Video

Comprehensive features for managing and viewing video content:

- **Video Feed:** Infinite scroll pagination-enabled feed for browsing videos.
- **Sorting:** Sorting options based on latest and oldest uploads.
- **Publishing:** Ability to publish new videos.
- **Management:** Options to remove, update, and modify video publish status.
- **Playlist Integration:** Adding videos to playlists.
- **Playlist Video View:** View all videos within a playlist with filtering options and infinite scroll pagination.
- **Comments:** View and interact with comments, with infinite scroll pagination.
- **History View:** View video watch history of user with infinite scroll pagination.

### Tweets

Social media-style functionalities for posting and interacting with tweets:

- **Posting:** Users can post tweets.
- **Interaction:** Users can performe operations Like, edit, delete on tweets.

### Subscriptions

Effortless management of channel subscriptions:

- **Subscribe/Unsubscribe:** Option to subscribe and unsubscribe from channels.
- **Subscription List:** Access to a list of subscribed channels for easy management.

### Dashboard

- Insightful overview of channel statistics and video management tools.
---
## Backend Tech Stack

- Node.js
- Express.js
- Mongoose
- Multer
- JSON Web Token (JWT)
- dotenv
- CORS
- Cookie-parser
- bcrypt
- Cloudinary
---
## Getting Started


Follow these steps to set up the project on your local machine:

1. Clone the repository:
    ```
    https://github.com/MoxitParmar/VideoVerse
    ```
    
2. Set up the backend:
    - Navigate to the backend folder: `cd backend`.
    - Install dependencies: `npm install`
    - Set up environment variables: Create a `.env` file based on .env.sample file.
    - Start the backend server: `npm run dev`

3. Access the application:
    - Open your postman and give requests at : `http://localhost:8000/api/v1`
---
