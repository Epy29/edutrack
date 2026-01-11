# EduTrack Setup Guide

This guide describes how to set up the EduTrack project on a new machine.

## Prerequisites

Before you begin, ensure you have the following installed:

1.  **Node.js** (LTS version recommended)
    -   Download from: [nodejs.org](https://nodejs.org/)
    -   Verify installation: `node -v` and `npm -v`

2.  **MySQL Server**
    -   Download from: [dev.mysql.com/downloads/installer/](https://dev.mysql.com/downloads/installer/)
    -   During installation, remember your `root` password.

3.  **Git** (Optional, for cloning)
    -   Download from: [git-scm.com](https://git-scm.com/)

---

## Step 1: Database Setup

The application connects to a MySQL database named `edutracktest`.

### 1. Export Schema (For the existing developer)
Since there are no SQL files in the repository, the **current developer** must export the database structure:
1.  Open your MySQL tool (Workbench, Command Line, etc.).
2.  Export the `edutracktest` database to a file named `database_schema.sql`.
3.  Send this file to your friend.

### 2. Import Schema (For the new user "Friend")
1.  Open MySQL Workbench or Command Line.
2.  Create a new database:
    ```sql
    CREATE DATABASE edutracktest;
    ```
3.  Import the `database_schema.sql` file provided by the developer into `edutracktest`.

### 3. Create Database User
The application uses specific credentials. Run the following SQL commands to create the user and grant permissions:

```sql
CREATE USER 'EduTrack'@'localhost' IDENTIFIED BY 'EduTrack29@';
GRANT ALL PRIVILEGES ON edutracktest.* TO 'EduTrack'@'localhost';
FLUSH PRIVILEGES;
```

> **Note:** If you want to use different credentials, you must update `src/lib/db.js` with your own username and password.

---

## Step 2: Project Setup

1.  **Copy/Clone the Project**
    -   Download the project files to a folder on your computer.

2.  **Navigation**
    -   Open your terminal (Command Prompt, PowerShell, or Terminal).
    -   Navigate to the project folder. For example, if you extracted it to your **Downloads** folder:
        ```bash
        cd Downloads/edutrack
        ```
    -   *Tip: You can often just type `cd ` (with a space) and drag the folder into the terminal window to get the path.*

3.  **Install Dependencies**
    -   Once inside the folder (you should see `package.json` when you list files), run:
        ```bash
        npm install
        ```

3.  **Environment Variables**
    -   Create a file named `.env` in the root directory (copy from `.env.example`).
    -   Open `.env` and add your Gemini API Key:
        ```
        GEMINI_API_KEY=your_actual_api_key_here
        ```
    -   (You can get a key from [Google AI Studio](https://aistudio.google.com/app/apikey))

---

## Step 3: Run the Application

1.  **Start the Development Server**
    ```bash
    npm run dev
    ```

2.  **Open in Browser**
    -   You should see a URL like `http://localhost:5173`. Open it to view the app.

---

## Troubleshooting

-   **Database Connection Error:** Ensure MySQL is running and the `EduTrack` user exists with the correct password.
-   **Missing Dependencies:** Try running `npm install` again.
-   **Port In Use:** If port 5173 is taken, Vite will try the next available port (e.g., 5174). Check the terminal output.

---

## Test Login Credentials

| Role | Username | Password |
| :--- | :--- | :--- |
| Student | `aiman` | `123` |
| Lecturer | `9001` | `123` |
