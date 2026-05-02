# AutoCare: Vehicle Service Management Platform 🚗🔧
AutoCare is a comprehensive, full-stack MERN application designed to streamline vehicle service operations. It provides a robust platform for vehicle owners, service centers, and administrators to manage service bookings, track vehicle history, and handle billing with high precision.

![Banner](https://images.unsplash.com/photo-1486006396193-47106888bfb3?auto=format&fit=crop&q=80&w=2000)


## 📂 Assets & Resources

- Project banners and images are stored in the repository or linked from Unsplash/other sources.
- UI/UX design files and additional assets can be found in the `assets/` directory (if available).

## 🎬 Demo & Video Links

- [Demo Video](https://www.youtube.com/watch?v=YOUR_DEMO_VIDEO_LINK)
- [Feature Walkthrough](https://www.youtube.com/watch?v=YOUR_FEATURE_VIDEO_LINK)

## 🌐 Repository Access

This repository is **public** and accessible to everyone. Please ensure you do not commit sensitive information (such as real credentials) to the repository.

---
For any questions or support, please open an issue or contact the maintainer.

-   **Multi-Role Authentication**: Secure login for Admins, Technicians, and Customers.
-   **Service Booking System**: Seamless scheduling for various vehicle maintenance tasks.
-   **Vehicle Profile Management**: Maintain detailed records of vehicles, including service history and specifications.
-   **Strict Invoice Control**: State-driven billing workflow (Pending -> Generated -> Paid) to ensure financial integrity.
-   **Real-time Status Tracking**: Monitor the progress of vehicle services from "Scheduled" to "Completed".
-   **Responsive Dashboard**: Modern, intuitive UI built with React and Tailwind CSS.

## 🛠️ Tech Stack

-   **Frontend**: React.js, Redux Toolkit, React Router, Tailwind CSS, Vite.
-   **Backend**: Node.js, Express.js.
-   **Database**: MongoDB (Mongoose ODM).
-   **Authentication**: JSON Web Tokens (JWT) with HTTP-only cookies.
-   **State Management**: Redux Toolkit for complex UI states.

## 📁 Project Structure

```text
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page views
│   │   ├── store/       # Redux slices and logic
│   │   └── utils/       # Helpers and constants
├── server/              # Express backend
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── controllers/     # Business logic
│   └── utils/           # Middleware and helpers
```

## 🚀 Getting Started

### Prerequisites

-   Node.js (v16+)
-   MongoDB Atlas account or local installation
-   Git

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/AutoCare.git
    cd AutoCare
    ```

2.  **Setup Server**:
    ```bash
    cd server
    npm install
    cp .env.example .env # Update your MongoDB URI and JWT Secret
    npm run dev
    ```

3.  **Setup Client**:
    ```bash
    cd ../client
    npm install
    npm run dev
    ```

## 📝 Documentation

Detailed project reports and guides are included in the root directory:
- [Software Requirements Specification (SRS)](./VEHICLE SERVICE MANAGEMENT PLATFORM.docx)
- [Invoice Logic Guide](./INVOICE_FIX_GUIDE.md)
- [Project Master Data](./PROJECT_MASTER_DATA.md)

## 🤝 Contributing

Contributions are welcome! Please fork the repository and create a pull request for any improvements or bug fixes.

---


