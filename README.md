# RescueCare – Emergency Incident Reporting System

RescueCare is a web-based emergency incident reporting system designed to help users submit emergency reports and allow hospital staff to review and manage reported incidents through a dashboard.

## Features

- **Emergency Reporting:** Submit reports for road accidents, fire outbreaks, medical emergencies, and other incidents.
- **Hospital Dashboard:** View submitted emergency reports in one place.
- **Report Verification:** Verify reports that have been reviewed.
- **Report Rejection:** Reject reports that are invalid or unsuitable.
- **Report Status Tracking:** Track pending, verified, and rejected reports.
- **Location Support:** Display incident coordinates and provide a Google Maps link when location data is available.
- **Persistent Storage:** Store reports and their statuses in an SQLite database.

## Technologies Used

### Frontend
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React

### Backend
- Node.js
- Express
- TypeScript
- SQLite
- Better SQLite3
- Zod

## Project Structure

```text
RescueCare/
├── rescuecare/     # React frontend
├── server/         # Express backend
└── README.md       # Project documentation
```

## Requirements

Install the following before running the project:

- Node.js and npm
- Git

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/harberbzakariyah/RescueCare.git
cd RescueCare
```


### 2. Start the Backend

Open a terminal and run:

```bash
cd server
npm install
npm run dev
```

The backend should run at:

`http://localhost:4000`

Health check:

`http://localhost:4000/api/health`

### 3. Start the Frontend

Open a second terminal from the project root and run:

```bash
cd rescuecare
npm install
npm run dev
```

Open the frontend URL shown in the terminal. In the current development setup, it is:

`http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check backend status |
| GET | `/api/reports` | Retrieve emergency reports |
| POST | `/api/reports` | Submit an emergency report |
| PATCH | `/api/reports/:id/status` | Update a report's status |

## Report Statuses

- **Pending:** A newly submitted report awaiting review.
- **Verified:** A report marked as verified by hospital staff.
- **Rejected:** A report marked as rejected.

## Database

RescueCare uses SQLite to store emergency reports, including incident type, description, available coordinates, submission time, and status.

The local database is created by the backend when it starts.

## Project Purpose

This project was developed as a final-year academic project to demonstrate a web-based approach to emergency incident reporting and hospital-side report management.

## Future Improvements

- Authentication and role-based access for authorized hospital staff.
- Improved report filtering and search.
- Deployment to a production hosting environment.
- Additional security and validation for real-world use.

## Disclaimer

RescueCare is an academic prototype and is not a replacement for official emergency services or a certified emergency response system.

## Author

**HARBZAK**


