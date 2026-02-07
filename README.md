# School Management System - Frontend

This directory contains the frontend for the School Management System, built with Next.js and Tailwind CSS. It provides a modern, responsive, and user-friendly interface for all school-related operations.

## Features

- **Role-Based Dashboards**: Customized views for Admins, Teachers, and Students.
- **Dynamic Routing**: User-friendly URLs for different sections.
- **Component-Based Architecture**: Reusable UI components for a consistent look and feel.
- **State Management**: Using React Context for managing application state.
- **API Integration**: Seamless communication with the backend API.
- **Authentication**: Secure login and user session management.

## Technologies Used

- **Next.js**: React framework for server-side rendering and static site generation.
- **React**: JavaScript library for building user interfaces.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **axios**: Promise-based HTTP client for making API requests.
- **lucide-react**: Library of beautiful and consistent icons.
- **js-cookie**: For handling cookies in the browser.

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm

### Installation & Setup

1.  **Clone the repository** (if not already done).

2.  **Navigate to the frontend directory:**
    ```bash
    cd SchoolManagementSystem/Frontend
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Configure environment variables:**
    Create a `.env.local` file in the `Frontend` directory. This file is used to configure the application, especially the backend API URL.
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:5000
    ```
    This ensures that the frontend knows where to send its API requests.

### Available Scripts

- **To run the development server:**
  ```bash
  npm run dev
  ```
  The application will be available at `http://localhost:3000`.

- **To create a production-ready build:**
  ```bash
  npm run build
  ```
  This will create an optimized build of the application in the `.next` folder.

- **To start the application in production mode (after building):**
  ```bash
  npm start
  ```

## Folder Structure

- **/app**: Contains the main application routes, following the Next.js App Router structure.
- **/components**: Reusable React components used throughout the application.
- **/context**: React Context providers for global state management (e.g., User, Theme).
- **/lib**: Utility functions, API client configuration (`api.js`), and authentication logic.
- **/public**: Static assets like images and fonts.

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests to improve the application.

## License

This project is licensed under the MIT License.