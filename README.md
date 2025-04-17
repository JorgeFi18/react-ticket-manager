# Ticket Manager

A modern web application for managing event tickets, built with React, TypeScript, and Vite. This application allows event organizers to create events, manage tickets, and validate attendees on-site with QR code scanning.

## Features

- **Event Management**: Create and manage events with details like name, date, location, and maximum capacity
- **Ticket Creation**: Generate tickets for attendees with essential information
- **Mobile Responsive**: Optimized interface that works well on both desktop and mobile devices
- **QR Code Validation**: Scan QR codes to validate tickets at event entry points
- **User Authentication**: Secure admin area with protected routes 
- **Public Ticket View**: Shareable ticket links for attendees

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **UI Framework**: Material UI v7
- **Routing**: React Router v7
- **Database**: Supabase (PostgreSQL)
- **QR Code**: QR code generation and scanning
- **Build Tool**: Vite
- **Deployment**: Web-based application, easily deployable to various hosting platforms

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- pnpm (recommended) or npm

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/JorgeFi18/ticket-manager.git
   cd ticket-manager
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Create a .env file in the root directory with your Supabase credentials
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_KEY=your_supabase_anon_key
   ```

4. Start the development server
   ```bash
   pnpm dev
   ```

## Usage

- **/login**: Admin authentication
- **/admin**: Dashboard for managing events
- **/admin/events/:eventId**: View and manage tickets for a specific event
- **/admin/validate/:eventId**: Validate tickets using QR code scanner
- **/ticket/:ticketId**: Public view for attendee tickets with QR code

## License

[MIT](LICENSE)
