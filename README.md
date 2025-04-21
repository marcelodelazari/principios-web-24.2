# principios-web-24.2

![Social Media Prototype Screenshot](https://i.ibb.co/chfQXsqb/Socialmedia.png)

This repository contains a **social media prototype project** with an integrated real-time chat feature and a friends list in real time powered by sockets (SOCKETS.IO).

It was built using **React** for the frontend and **Node.js** for the backend. **It also features integration with Google, allowing users to create accounts and log in using their Google accounts.**

As a learning project, I plan to make several improvements in the future, including:
* Transitioning towards a **microservices** architecture.
* Implementing improved **unit testing**, specifically using **Jest**.
* Setting up **Continuous Integration/Continuous Deployment (CI/CD)** pipelines.

## Setup

Follow these steps to get the project running locally:

1.  **Backend:**
    * Navigate to the backend directory (assuming `index.js` is the main server file).
    * Install dependencies:
        ```bash
        npm install
        ```
    * Install Nodemon globally (optional, but recommended for automatic server restarts during development):
        ```bash
        npm install -g nodemon
        ```
    * Start the backend server:
        ```bash
        nodemon index.js
        ```

2.  **Frontend:**
    * Navigate to the frontend directory (e.g., `cd client` or `cd frontend` - *adjust the path based on your project structure*).
    * Install dependencies:
        ```bash
        npm install
        ```
    * Start the frontend development server:
        ```bash
        npm start
        ```
