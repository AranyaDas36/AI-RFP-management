# RFP Management System - Frontend

A modern, intuitive React application for managing Request for Proposals (RFPs) with AI-powered structuring, vendor management, and proposal evaluation.

## Overview

This frontend application provides a complete procurement workflow:
- **Create RFPs**: Natural language input converted to structured RFPs using AI
- **Vendor Management**: Add and manage vendor contacts
- **Send RFPs**: Select vendors and send RFPs via email
- **Receive Proposals**: Fetch and parse vendor email responses
- **Evaluate Proposals**: AI-powered comparison and ranking of vendor proposals

## Tech Stack

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Tailwind CSS**: Utility-first CSS framework

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.js          # Axios instance with interceptors
│   │   ├── rfp.api.js         # RFP API calls
│   │   ├── vendor.api.js      # Vendor API calls
│   │   └── proposal.api.js    # Proposal API calls
│   ├── components/
│   │   ├── common/            # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── EmptyState.jsx
│   │   ├── layout/            # Layout components
│   │   │   ├── Navbar.jsx
│   │   │   └── Layout.jsx
│   │   ├── rfp/               # RFP-specific components
│   │   │   ├── RfpPromptInput.jsx
│   │   │   ├── RfpStructuredView.jsx
│   │   │   └── RfpStatusTimeline.jsx
│   │   ├── vendor/            # Vendor components
│   │   │   ├── VendorForm.jsx
│   │   │   └── VendorList.jsx
│   │   └── proposal/           # Proposal components
│   │       ├── ProposalCard.jsx
│   │       ├── ProposalComparisonTable.jsx
│   │       └── ScoreBar.jsx
│   ├── pages/                 # Page components
│   │   ├── Dashboard.jsx      # Main dashboard with RFP list
│   │   ├── CreateRfp.jsx      # Create new RFP page
│   │   ├── RfpDetails.jsx     # RFP detail and management
│   │   ├── Vendors.jsx        # Vendor management
│   │   └── Evaluation.jsx    # Proposal evaluation page
│   ├── utils/                 # Utility functions
│   │   └── formatDate.js
│   ├── App.jsx                # Main app with routing
│   └── main.jsx               # Entry point
├── .env.example               # Environment variables template
└── README.md
```

## Setup Instructions

### 1. Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running (see backend README)

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Environment Configuration

Create a `.env` file in the frontend directory:

```bash
cp .env.example .env
```

Or manually create `.env` with:

```
VITE_API_BASE_URL=http://localhost:3000
```

**Note**: Update `VITE_API_BASE_URL` if your backend runs on a different port or URL.

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port Vite assigns).

### 5. Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## Screens Overview

### Dashboard (`/`)
- Lists all RFPs with status, items count, vendors sent, and budget
- Shows RFP status timeline
- Quick access to create new RFP
- Click any RFP to view details

### Create RFP (`/create-rfp`)
- Chat-like text area for natural language input
- AI processes prompt and structures into formal RFP
- Shows structured preview with items, budget, timeline, payment terms, warranty
- Option to view details or create another

### RFP Details (`/rfp/:id`)
- Full RFP information with structured data
- Status timeline visualization
- Vendor selection with checkboxes (draft status)
- Send RFP to selected vendors
- Fetch vendor email replies
- View received proposals with AI-parsed data
- Navigate to evaluation when proposals are received

### Vendors (`/vendors`)
- Add new vendors (name, email, company, notes)
- List all vendors
- Manage vendor contacts

### Evaluation (`/evaluation/:id`)
- View all proposals for an RFP
- Trigger AI-powered evaluation
- See ranked vendors with scores (0-100)
- View strengths and weaknesses per vendor
- Get AI recommendation with reasoning
- Visual score bars for easy comparison

## API Integration

The frontend communicates with the backend via REST API:

- **Base URL**: Configured via `VITE_API_BASE_URL` (default: `http://localhost:3000`)
- **Error Handling**: Centralized in Axios interceptors
- **API Services**: Organized by domain (rfp, vendor, proposal)

### API Endpoints Used

- `POST /api/rfps` - Create RFP
- `GET /api/rfps` - Get all RFPs
- `GET /api/rfps/:id` - Get single RFP
- `POST /api/rfps/:id/send` - Send RFP to vendors
- `GET /api/rfps/:id/proposals` - Get proposals for RFP
- `POST /api/rfps/:id/evaluate` - Evaluate proposals
- `POST /api/vendors` - Create vendor
- `GET /api/vendors` - Get all vendors
- `POST /api/proposals/fetch-emails` - Fetch vendor emails

## Workflow

### Complete Procurement Flow

1. **Create RFP**
   - Navigate to "Create RFP"
   - Enter natural language description
   - AI structures the RFP automatically
   - Review structured data

2. **Manage Vendors**
   - Go to "Vendors" page
   - Add vendor contacts (name, email, company)

3. **Send RFP**
   - Open RFP details
   - Select vendors using checkboxes
   - Click "Send RFP to Selected Vendors"
   - RFP emails are sent automatically

4. **Receive Proposals**
   - In RFP details, click "Fetch Vendor Replies"
   - System checks IMAP inbox
   - Vendor emails are parsed with AI
   - Proposals appear in the proposals section

5. **Evaluate Proposals**
   - Navigate to "Evaluate Proposals"
   - Click "Evaluate Proposals" button
   - AI compares all proposals
   - View ranked vendors with scores
   - See recommendation and reasoning

## UI/UX Features

- **Minimalist Design**: Clean, professional SaaS look
- **Status Indicators**: Visual timeline for RFP status progression
- **AI Badges**: Clear indicators for AI-parsed content
- **Score Visualization**: Color-coded score bars (green/yellow/red)
- **Responsive Layout**: Works on desktop and tablet
- **Loading States**: Clear feedback during API calls
- **Error Handling**: User-friendly error messages
- **Empty States**: Helpful guidance when no data exists

## Component Architecture

### Common Components
- **Button**: Reusable button with variants (primary, secondary, danger, outline)
- **Card**: Container component with consistent styling
- **Badge**: Status indicators with color variants
- **Loader**: Spinning loader for async operations
- **EmptyState**: Placeholder for empty data states

### Domain Components
- **RFP Components**: Input, structured view, status timeline
- **Vendor Components**: Form, list with selection
- **Proposal Components**: Card view, comparison table, score bars

## State Management

- Uses React hooks (`useState`, `useEffect`) for local state
- No Redux (overkill for single-user app)
- API calls handled via async/await
- Error states managed per component

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Colors**: Primary color scheme defined in `tailwind.config.js`
- **Responsive**: Mobile-first approach with breakpoints
- **Consistent Spacing**: Uses Tailwind's spacing scale

## Known Limitations

1. **No Authentication**: Single-user system, no login
2. **No Real-time Updates**: Manual refresh needed for new data
3. **Email Fetching**: Manual trigger, not automatic polling
4. **Error Recovery**: Some errors may require page refresh
5. **Large Lists**: No pagination for RFPs/vendors (add if needed)

## Development

### Running in Development

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm run preview  # Preview production build
```

### Linting

```bash
npm run lint
```

## Troubleshooting

### Backend Connection Issues

- Verify backend is running on the configured port
- Check `VITE_API_BASE_URL` in `.env`
- Check browser console for CORS errors
- Ensure backend CORS allows frontend origin

### API Errors

- Check network tab in browser dev tools
- Verify backend logs for errors
- Ensure all required environment variables are set in backend

### Styling Issues

- Clear browser cache
- Restart dev server
- Verify Tailwind is properly configured

## Production Considerations

1. **Environment Variables**: Use proper `.env` files for different environments
2. **API URL**: Configure production backend URL
3. **Error Tracking**: Add error tracking service (Sentry, etc.)
4. **Analytics**: Add analytics if needed
5. **Performance**: Optimize bundle size, add code splitting if needed
6. **Security**: Review CORS settings, validate all inputs

## License

ISC
