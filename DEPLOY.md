# Deployment Instructions

Your application is fully prepared for live deployment. We have bundled the frontend directly into the server folder to make deployment simple.

## 1. Files to Upload

You only need to upload the **`server`** folder to your live server.

This folder now contains:
1.  The backend API code
2.  The complete frontend build (located in `server/public`)

> **Note:** Do NOT upload the `node_modules` folder. You should install dependencies fresh on the server.

## 2. Server Setup

1.  **Upload**: Upload the `server` folder to your hosting provider.
2.  **Environment Configuration**: 
    -   We have created a file named `.env.production` in the `server` folder with your live database details.
    -   **Rename** this file to just `.env` on your live server.
    -   Verify the contents:
        ```env
        DB_HOST=localhost
        DB_USER=globeksa_admin
        DB_PASS=nA3FlITp1Lpg
        DB_NAME=messbook
        PORT=5000
        ```
3.  **Install Dependencies**: Open a terminal in the uploaded folder and run:
    ```bash
    npm install --production
    ```

## 3. Start the Server

Start the application using:
```bash
npm start
```
Or if using a process manager like PM2:
```bash
pm2 start server.js --name "mess-app"
```

## 4. That's it!

-   Your application will be running at `http://your-domain.com:5000` (or whatever port/domain you use).
-   The root URL `/` will serve the React frontend.
-   All API requests (like login) will work automatically.
