# HAILIT BACKEND 

This is a Node.js application built with the Express framework. The application uses Supabase and the `pg` library for database interactions and runs on port 4000.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js**: You should have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
- **npm**: Node.js package manager (`npm`) is installed with Node.js. Alternatively, you can use `yarn` as a package manager.
- **Supabase Account**: You need a Supabase account for your database. You can sign up at [supabase.com](https://supabase.com/).
- **PostgreSQL**: You need a PostgreSQL database. Supabase provides this by default.

## Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/your-repo-name.git
    cd your-repo-name
    ```

2. **Install the dependencies:**

    ```bash
    npm install
    ```

3. **Create a `.env` file** in the root directory of your project and add the following environment variables:

    ```bash
    SUPABASE_URL=your-supabase-url
    SUPABASE_KEY=your-supabase-key
    DATABASE_URL=your-database-url
    DB_HOST= your-supabase-host-url
    DB_PORT=your_database_port
    DB_NAME=your-database-name
    DB_USER=your-supabase-user
    DB_PASSWORD=supabase_password
    PORT=4000
    
    ```

    Replace `your-supabase-url`, `your-supabase-key`, `your-database-url` and others with your actual Supabase and PostgreSQL credentials.

## Database Configuration

The application uses the `pg` library to interact with your PostgreSQL database. The database configuration is stored in the `.env` file. Make sure your Supabase credentials and PostgreSQL database URL are correctly set in the `.env` file.

## Running the Application
```
npm start 

```  

By default, the application will run on http://localhost:4000.

## Development
For development purposes, you can use nodemon to automatically restart the server whenever you make changes:

```
npm install -g nodemon
nodemon
```

## Contributing
If you'd like to contribute to this project, please fork the repository and use a feature branch. Pull requests are warmly welcome.


