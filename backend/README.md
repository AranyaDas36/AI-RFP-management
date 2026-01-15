# AI-Powered RFP Management System - Backend

A production-quality Node.js backend for managing Request for Proposals (RFPs) with AI-powered structuring, vendor response parsing, and proposal evaluation using Google Gemini.

## Overview

This backend system enables:
- **Natural Language RFP Creation**: Convert free-form procurement descriptions into structured RFPs using AI
- **Automated Email Management**: Send RFPs to vendors via SMTP and receive responses via IMAP
- **AI-Powered Response Parsing**: Extract structured proposal data from vendor email responses
- **Intelligent Evaluation**: Compare and rank vendor proposals with AI-generated scores and recommendations

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **AI Provider**: Google Gemini API
- **Email**: Nodemailer (SMTP) + IMAP (receiving)
- **Environment**: dotenv

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js          # MongoDB connection
│   │   ├── gemini.js      # Google Gemini client
│   │   └── mail.js        # Email configuration
│   ├── models/
│   │   ├── RFP.js         # RFP schema
│   │   ├── Vendor.js      # Vendor schema
│   │   └── Proposal.js    # Proposal schema
│   ├── services/
│   │   ├── aiService.js   # AI operations (structuring, parsing, evaluation)
│   │   └── emailService.js # Email sending/receiving
│   ├── controllers/
│   │   ├── rfpController.js
│   │   ├── vendorController.js
│   │   └── proposalController.js
│   ├── routes/
│   │   ├── rfpRoutes.js
│   │   ├── vendorRoutes.js
│   │   └── proposalRoutes.js
│   ├── utils/
│   │   └── errorHandler.js
│   ├── app.js             # Express app configuration
│   └── server.js           # Server entry point
├── .env.example
├── package.json
└── README.md
```

## Setup Instructions

### 1. Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or connection string)
- Google Gemini API key
- Email account with SMTP/IMAP access

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

**Required Environment Variables:**

- `MONGODB_URI`: MongoDB connection string
- `GEMINI_API_KEY`: Your Google Gemini API key
- `SMTP_*`: SMTP configuration for sending emails
- `IMAP_*`: IMAP configuration for receiving emails

**Gmail Setup Notes:**
- For Gmail, you'll need to generate an "App Password" (not your regular password)
- Enable 2-factor authentication first
- Generate app password: Google Account → Security → App passwords

### 4. Start MongoDB

Ensure MongoDB is running:

```bash
# If installed locally
mongod

# Or use MongoDB Atlas connection string in .env
```

### 5. Run the Server

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or your configured PORT).

## API Documentation

### Health Check

```
GET /health
```

Returns server status.

### RFP Endpoints

#### Create RFP
```
POST /api/rfps
Content-Type: application/json

{
  "prompt": "I need 50 laptops with 16GB RAM, Intel i7 processors, and 512GB SSD. Budget is $50,000. Delivery needed within 2 weeks. Payment terms: Net 30. 2-year warranty required."
}
```

**Response:**
```json
{
  "_id": "...",
  "title": "I need 50 laptops...",
  "rawPrompt": "...",
  "structuredData": {
    "items": [
      {
        "name": "laptops",
        "quantity": 50,
        "specs": "16GB RAM, Intel i7, 512GB SSD"
      }
    ],
    "budget": "$50,000",
    "deliveryTimeline": "2 weeks",
    "paymentTerms": "Net 30",
    "warranty": "2-year warranty"
  },
  "status": "draft",
  "vendorsSentTo": [],
  "createdAt": "...",
  "updatedAt": "..."
}
```

#### Get All RFPs
```
GET /api/rfps
```

#### Get Single RFP
```
GET /api/rfps/:id
```

#### Send RFP to Vendors
```
POST /api/rfps/:id/send
Content-Type: application/json

{
  "vendorIds": ["vendor_id_1", "vendor_id_2"]
}
```

**Response:**
```json
{
  "rfp": {...},
  "emailResults": [
    {"vendor": "...", "success": true},
    {"vendor": "...", "success": false, "error": "..."}
  ],
  "message": "RFP sent successfully"
}
```

#### Get RFP Proposals
```
GET /api/rfps/:id/proposals
```

#### Evaluate Proposals
```
POST /api/rfps/:id/evaluate
```

**Response:**
```json
{
  "rfp": {...},
  "evaluation": {
    "comparison": [
      {
        "vendor": "vendor@example.com",
        "score": 85,
        "summary": "...",
        "strengths": ["..."],
        "weaknesses": ["..."]
      }
    ],
    "recommendation": {
      "topVendor": "vendor@example.com",
      "reasoning": "..."
    }
  },
  "proposals": [...]
}
```

### Vendor Endpoints

#### Create Vendor
```
POST /api/vendors
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@vendor.com",
  "company": "Vendor Corp",
  "notes": "Preferred vendor for IT equipment"
}
```

#### Get All Vendors
```
GET /api/vendors
```

### Proposal Endpoints

#### Fetch Emails from Inbox
```
POST /api/proposals/fetch-emails
```

This endpoint:
1. Connects to IMAP inbox
2. Fetches unread emails
3. Matches emails to RFPs (by RFP ID in subject/references)
4. Parses vendor responses using AI
5. Creates/updates Proposal records

**Response:**
```json
{
  "message": "Email fetch completed",
  "processed": 3,
  "results": [
    {"from": "...", "subject": "...", "processed": true},
    {"from": "...", "subject": "...", "processed": false, "error": "..."}
  ]
}
```

## AI Prompt Design

### 1. RFP Structuring

**Input**: Natural language procurement description  
**Output**: Structured JSON with items, budget, timeline, payment terms, warranty

The AI extracts structured data from free-form text, handling:
- Multiple items with quantities and specifications
- Budget ranges or exact amounts
- Delivery timelines
- Payment terms
- Warranty requirements

### 2. Vendor Response Parsing

**Input**: Vendor email body (free-form text)  
**Output**: Structured proposal data

The AI extracts:
- Total price (preserving currency symbols)
- Itemized breakdown
- Delivery timeline
- Payment terms
- Warranty information
- Exceptions or special conditions

**Error Handling**: Returns empty structure if parsing fails, allowing manual review.

### 3. Proposal Evaluation

**Input**: RFP requirements + all vendor proposals  
**Output**: Comparison, scores (0-100), and recommendation

The AI evaluates based on:
- Price competitiveness
- Requirement alignment
- Delivery timeline feasibility
- Payment terms acceptability
- Warranty coverage
- Overall professionalism

Scores are saved to Proposal documents for ranking.

## Email Integration

### Sending RFPs

- Uses Nodemailer with SMTP configuration
- Sends HTML and plain text versions
- Includes RFP reference ID in subject and body
- Updates RFP status to "sent"

### Receiving Vendor Replies

- Uses IMAP to poll inbox
- Matches emails to RFPs using:
  - RFP ID in subject line: `[Ref: <rfp_id>]`
  - In-Reply-To headers
  - References array
  - Fallback: Most recent RFP sent to vendor
- Automatically triggers AI parsing
- Creates/updates Proposal records
- Updates RFP status to "responses_received"

## Data Models

### RFP
- `title`: Auto-generated from prompt
- `rawPrompt`: Original natural language input
- `structuredData`: AI-extracted structured data
- `status`: draft | sent | responses_received | evaluated
- `vendorsSentTo`: Array of Vendor references
- Timestamps: `createdAt`, `updatedAt`

### Vendor
- `name`: Vendor contact name
- `email`: Unique email address
- `company`: Company name
- `notes`: Additional notes
- Timestamps: `createdAt`, `updatedAt`

### Proposal
- `rfp`: Reference to RFP
- `vendor`: Reference to Vendor
- `rawEmailBody`: Original email content
- `extractedData`: AI-parsed structured data
- `aiScore`: 0-100 score from evaluation
- `aiSummary`: AI-generated summary
- `receivedAt`: Email receipt timestamp
- Timestamps: `createdAt`, `updatedAt`

## Design Decisions & Assumptions

1. **Single-User System**: No authentication/authorization implemented
2. **Email Matching**: Multiple strategies to match vendor emails to RFPs
3. **AI Error Handling**: Graceful degradation - returns empty structures on parse failures
4. **Status Workflow**: draft → sent → responses_received → evaluated
5. **Proposal Updates**: Re-parses if vendor sends updated proposal
6. **CORS Enabled**: Allows frontend integration from any origin (adjust for production)

## Known Limitations

1. **IMAP Polling**: Email fetching is on-demand via API, not real-time
2. **Email Matching**: May require manual intervention if RFP ID not in email
3. **AI Parsing**: May miss nuanced information in complex vendor responses
4. **No Authentication**: Single-user system, no multi-user support
5. **No Email Templates**: Basic HTML email template, customizable in `emailService.js`
6. **Error Recovery**: Some email processing errors may require manual review

## Error Handling

- Validation errors return 400 with details
- Database errors return 500 with message
- AI service errors are logged and returned to client
- Email errors are captured per-vendor in send results
- IMAP connection errors return 500

## Development

### Running in Development

```bash
npm run dev
```

### Environment Variables

All sensitive configuration is via environment variables. Never commit `.env` file.

## Production Considerations

1. **Security**:
   - Add authentication/authorization
   - Restrict CORS to specific origins
   - Use HTTPS
   - Validate all inputs

2. **Performance**:
   - Add caching for frequently accessed data
   - Implement pagination for list endpoints
   - Queue email processing for large batches

3. **Monitoring**:
   - Add logging (Winston, Pino)
   - Health check endpoints
   - Error tracking (Sentry)

4. **Scalability**:
   - Consider job queue for email processing
   - Database indexing on frequently queried fields
   - Connection pooling

## License

ISC
