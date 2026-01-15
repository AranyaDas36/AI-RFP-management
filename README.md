# AI-Powered RFP Management System

A full-stack web application for managing Request for Proposals (RFPs) with AI-powered structuring, automated email communication, and intelligent proposal evaluation.

## 1. Project Setup

### a. Prerequisites

**Node.js Version:**
- Node.js v16 or higher (v18+ recommended)
- npm v7 or higher

**Database:**
- MongoDB v5.0 or higher
- Running locally or MongoDB Atlas connection string

**API Keys:**
- **Google Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
  - Required for AI-powered RFP structuring, vendor response parsing, and proposal evaluation

**Email Account:**
- Gmail account (or any email with SMTP/IMAP access)
- **Gmail App Password** (16 characters) - Required for email sending/receiving
  - Enable 2-factor authentication first
  - Generate at: Google Account → Security → App passwords

**System Requirements:**
- Operating System: macOS, Linux, or Windows
- Minimum 4GB RAM
- Internet connection for API calls

### b. Install Steps

#### Backend Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Or create .env manually (see configuration section)

# Verify installation
node --version  # Should be v16+
npm --version   # Should be v7+
```

#### Frontend Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_BASE_URL=http://localhost:3000" > .env

# Verify installation
node --version  # Should be v16+
npm --version   # Should be v7+
```

### c. Email Configuration (Sending/Receiving)

#### Step 1: Generate Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not already enabled)
3. Navigate to **App passwords**
4. Select **Mail** as the app
5. Generate a 16-character password (e.g., `abcd efgh ijkl mnop`)
6. **Save this password** - you'll need it for both SMTP and IMAP

#### Step 2: Configure Backend Email Settings

Edit `backend/.env`:

```env
# SMTP Configuration (for sending emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop  # Your 16-char app password
SMTP_FROM=your_email@gmail.com

# IMAP Configuration (for receiving emails)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_TLS=true
IMAP_USER=your_email@gmail.com
IMAP_PASS=abcd efgh ijkl mnop  # Same app password
```

**Important Notes:**
- Use the **same App Password** for both SMTP and IMAP
- Remove spaces from the app password when pasting (or keep them, both work)
- Never use your regular Gmail password
- The email account must have IMAP enabled (enabled by default for Gmail)

#### Step 3: Test Email Configuration

```bash
# Test email sending (via API or frontend)
# Test email receiving (click "Fetch Vendor Replies" in frontend)
```

### d. Running Everything Locally

#### Terminal 1: Start MongoDB

```bash
# If MongoDB is installed locally
mongod

# Or use MongoDB Atlas (no local MongoDB needed)
# Just ensure MONGODB_URI in .env points to Atlas
```

#### Terminal 2: Start Backend Server

```bash
cd backend

# Ensure .env file is configured
# Then start the server
npm run dev
```

**Expected Output:**
```
✅ Gemini client initialized - Model: gemini-3-flash-preview
✅ Gemini AI configured successfully
MongoDB Connected: localhost
✅ Server running on port 3000
Environment: development
```

#### Terminal 3: Start Frontend Server

```bash
cd frontend

# Start development server
npm run dev
```

**Expected Output:**
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

#### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

### e. Seed Data & Initial Scripts

**No seed data required** - the application starts with an empty database.

**Initial Setup Scripts:**

1. **Test Gemini Integration:**
   ```bash
   cd backend
   node src/utils/testGemini.js
   ```

2. **Verify Environment Variables:**
   ```bash
   cd backend
   # Check .env file exists and has all required variables
   cat .env | grep -E "GEMINI_API_KEY|MONGODB_URI|SMTP_|IMAP_"
   ```

**First-Time Setup Checklist:**
- [ ] MongoDB running or Atlas connection configured
- [ ] Backend `.env` file created with all variables
- [ ] Frontend `.env` file created with API URL
- [ ] Gmail App Password generated
- [ ] Gemini API key obtained
- [ ] Backend starts without errors
- [ ] Frontend connects to backend successfully

## 2. Tech Stack

### a. Technology Overview

**Frontend:**
- **React 18**: Modern React with hooks and functional components
- **Vite 7**: Fast build tool and development server
- **React Router 6**: Client-side routing and navigation
- **Axios 1.7**: HTTP client for API communication
- **Tailwind CSS 3.4**: Utility-first CSS framework for styling

**Backend:**
- **Node.js**: JavaScript runtime (v16+)
- **Express 5.2**: Web framework for REST API
- **Mongoose 9.1**: MongoDB object modeling and ODM

**Database:**
- **MongoDB**: NoSQL document database
- **Mongoose**: Schema modeling and validation

**AI Provider:**
- **Google Gemini API**: AI-powered text generation and analysis
- **@google/genai 1.0**: Official Google Generative AI SDK
- **Model**: `gemini-3-flash-preview` (with fallback to `gemini-2.5-flash`)

**Email Solution:**
- **Nodemailer 6.9**: SMTP email sending
- **IMAP 0.8**: Email receiving via IMAP protocol
- **Mailparser 3.7**: Email parsing and content extraction

**Key Libraries:**
- **dotenv 17.2**: Environment variable management
- **Express**: REST API framework
- **Axios**: HTTP client (frontend)
- **React Router**: Frontend routing
- **Tailwind CSS**: Styling framework

**Development Tools:**
- **ESLint**: Code linting
- **Vite**: Build tool and dev server
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## 3. API Documentation

### a. Main Endpoints

#### Health Check

**GET** `/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

#### RFP Endpoints

##### Create RFP

**POST** `/api/rfps`

**Request Body:**
```json
{
  "prompt": "I need 50 laptops with 16GB RAM, Intel i7 processors, and 512GB SSD. Budget is $50,000. Delivery needed within 2 weeks. Payment terms: Net 30. 2-year warranty required."
}
```

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "I need 50 laptops with 16GB RAM...",
  "rawPrompt": "I need 50 laptops...",
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
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (400):**
```json
{
  "error": "Prompt is required and must be a non-empty string"
}
```

**Error Response (500):**
```json
{
  "error": "Failed to structure RFP: Gemini API error: ..."
}
```

---

##### Get All RFPs

**GET** `/api/rfps`

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Laptop Procurement",
    "status": "draft",
    "structuredData": {...},
    "vendorsSentTo": [],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

##### Get Single RFP

**GET** `/api/rfps/:id`

**URL Parameters:**
- `id` (string, required): RFP MongoDB ObjectId

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Laptop Procurement",
  "rawPrompt": "...",
  "structuredData": {...},
  "status": "sent",
  "vendorsSentTo": [
    {
      "_id": "507f191e810c19729de860ea",
      "name": "John Doe",
      "email": "john@vendor.com"
    }
  ],
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (404):**
```json
{
  "error": "RFP not found"
}
```

---

##### Send RFP to Vendors

**POST** `/api/rfps/:id/send`

**URL Parameters:**
- `id` (string, required): RFP MongoDB ObjectId

**Request Body:**
```json
{
  "vendorIds": [
    "507f191e810c19729de860ea",
    "507f191e810c19729de860eb"
  ]
}
```

**Success Response (200):**
```json
{
  "rfp": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "sent",
    "vendorsSentTo": [...]
  },
  "emailResults": [
    {
      "vendor": "507f191e810c19729de860ea",
      "success": true
    },
    {
      "vendor": "507f191e810c19729de860eb",
      "success": false,
      "error": "SMTP connection failed"
    }
  ],
  "message": "RFP sent successfully"
}
```

**Error Response (400):**
```json
{
  "error": "vendorIds array is required"
}
```

---

##### Get RFP Proposals

**GET** `/api/rfps/:id/proposals`

**URL Parameters:**
- `id` (string, required): RFP MongoDB ObjectId

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "rfp": "507f1f77bcf86cd799439011",
    "vendor": {
      "_id": "507f191e810c19729de860ea",
      "name": "John Doe",
      "email": "john@vendor.com"
    },
    "extractedData": {
      "totalPrice": "$48,500",
      "itemBreakdown": [
        {
          "itemName": "laptops",
          "quantity": 50,
          "unitPrice": 970,
          "totalPrice": 48500,
          "notes": "Includes Windows 11 Pro"
        }
      ],
      "deliveryTimeline": "10 business days",
      "paymentTerms": "Net 30",
      "warranty": "2 years",
      "exceptions": "Prices valid for 30 days"
    },
    "aiScore": 85,
    "aiSummary": "Competitive pricing with good warranty coverage",
    "receivedAt": "2024-01-15T11:00:00.000Z"
  }
]
```

---

##### Evaluate Proposals

**POST** `/api/rfps/:id/evaluate`

**URL Parameters:**
- `id` (string, required): RFP MongoDB ObjectId

**Success Response (200):**
```json
{
  "rfp": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "evaluated"
  },
  "evaluation": {
    "comparison": [
      {
        "vendor": "john@vendor.com",
        "score": 85,
        "summary": "Strong proposal with competitive pricing",
        "strengths": [
          "Best price",
          "Meets all requirements",
          "Good warranty"
        ],
        "weaknesses": [
          "Slightly longer delivery time"
        ]
      }
    ],
    "recommendation": {
      "topVendor": "john@vendor.com",
      "reasoning": "This vendor offers the best combination of price, quality, and terms."
    }
  },
  "proposals": [...]
}
```

**Error Response (400):**
```json
{
  "error": "No proposals found for this RFP"
}
```

---

#### Vendor Endpoints

##### Create Vendor

**POST** `/api/vendors`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@vendor.com",
  "company": "Tech Solutions Inc.",
  "notes": "Preferred vendor for IT equipment"
}
```

**Success Response (201):**
```json
{
  "_id": "507f191e810c19729de860ea",
  "name": "John Doe",
  "email": "john@vendor.com",
  "company": "Tech Solutions Inc.",
  "notes": "Preferred vendor for IT equipment",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

**Error Response (400):**
```json
{
  "error": "Name and email are required"
}
```

**Error Response (400):**
```json
{
  "error": "Vendor with this email already exists"
}
```

---

##### Get All Vendors

**GET** `/api/vendors`

**Success Response (200):**
```json
[
  {
    "_id": "507f191e810c19729de860ea",
    "name": "John Doe",
    "email": "john@vendor.com",
    "company": "Tech Solutions Inc.",
    "notes": "Preferred vendor for IT equipment"
  }
]
```

---

#### Proposal Endpoints

##### Fetch Vendor Emails

**POST** `/api/proposals/fetch-emails`

**Success Response (200):**
```json
{
  "message": "Email fetch completed",
  "processed": 3,
  "results": [
    {
      "from": "john@vendor.com",
      "subject": "Re: RFP: Laptop Procurement",
      "processed": true
    },
    {
      "from": "jane@vendor.com",
      "subject": "Re: RFP: Laptop Procurement",
      "processed": true
    },
    {
      "from": "bob@vendor.com",
      "subject": "Re: RFP: Laptop Procurement",
      "processed": false,
      "error": "Vendor not found for email: bob@vendor.com"
    }
  ]
}
```

**Error Response (500):**
```json
{
  "error": "IMAP connection failed: ..."
}
```

---

## 4. Decisions & Assumptions

### a. Key Design Decisions

**1. Data Models & Schema Design:**
- **RFP Model**: Separated `rawPrompt` (original input) from `structuredData` (AI-parsed) for auditability and re-processing
- **Proposal Model**: Stores both `rawEmailBody` (original) and `extractedData` (AI-parsed) to allow re-parsing if AI improves
- **Vendor Model**: Simple structure with unique email constraint to prevent duplicates
- **Status Workflow**: Explicit status field (`draft → sent → responses_received → evaluated`) for clear state management

**2. AI Integration Approach:**
- **REST API over SDK**: Initially used `@google/generative-ai` SDK, but switched to REST API (`@google/genai`) for better reliability and control
- **Model Selection**: Primary model `gemini-3-flash-preview` with automatic fallback to `gemini-2.5-flash` for availability
- **JSON Extraction**: Regex-based JSON extraction from AI responses with error handling for malformed outputs
- **Prompt Engineering**: Structured prompts with explicit JSON schema requirements to improve parsing reliability

**3. Email Processing Flow:**
- **On-Demand Fetching**: Email fetching is manual (via API) rather than automatic polling to reduce server load and API costs
- **Multi-Strategy Matching**: Emails matched to RFPs using: RFP ID in subject, In-Reply-To headers, References array, and fallback to most recent RFP
- **Graceful Degradation**: If email matching fails, system logs error but doesn't crash; allows manual intervention

**4. Scoring & Evaluation:**
- **0-100 Score Range**: Standardized scoring system for easy comparison
- **Multi-Criteria Evaluation**: AI evaluates based on price, requirements alignment, delivery, payment terms, warranty, and professionalism
- **Structured Output**: Evaluation returns comparison array with strengths/weaknesses and a clear recommendation

**5. Frontend Architecture:**
- **Component-Based**: Reusable components organized by domain (RFP, Vendor, Proposal, Common)
- **No State Management Library**: Uses React hooks only (no Redux) for simplicity in single-user system
- **API Service Layer**: Centralized API calls in `api/` directory for maintainability
- **Tailwind CSS**: Utility-first styling for rapid development and consistency

**6. Error Handling:**
- **Centralized Error Handler**: Express middleware for consistent error responses
- **AI Error Recovery**: Returns empty structures on parse failures rather than crashing
- **Email Error Isolation**: Email sending errors captured per-vendor, allowing partial success

### b. Assumptions Made

**1. Email Format Assumptions:**
- **Vendor Replies**: Assumed vendors will reply to original email (maintains threading and RFP ID)
- **Email Content**: Assumed vendors include pricing, delivery, and terms in email body (not just attachments)
- **Natural Language**: Assumed vendor emails use natural language that AI can parse (not highly structured formats)
- **Single Reply Per Vendor**: Assumed one proposal per vendor per RFP (latest reply updates existing proposal)

**2. AI Parsing Assumptions:**
- **JSON Output**: Assumed Gemini will return valid JSON (with regex fallback for edge cases)
- **Field Completeness**: Assumed AI may miss some fields, so all fields have default empty values
- **Currency Preservation**: Assumed prices may include currency symbols, so stored as strings
- **Error Tolerance**: Assumed some parsing failures are acceptable (graceful degradation)

**3. System Limitations Assumptions:**
- **Single User**: Designed for single-user workflow (no authentication needed)
- **Manual Email Fetch**: Assumed users will manually trigger email fetching when needed
- **Gmail Primary**: Optimized for Gmail but should work with other IMAP providers
- **English Language**: Assumed all content is in English (AI prompts in English)

**4. Business Logic Assumptions:**
- **RFP Lifecycle**: Assumed linear workflow (draft → send → receive → evaluate)
- **Vendor Selection**: Assumed users select vendors before sending (not bulk sending to all)
- **Proposal Updates**: Assumed vendors may send updated proposals (system updates existing)
- **Evaluation Timing**: Assumed evaluation happens after all proposals received (not real-time)

**5. Technical Assumptions:**
- **MongoDB Availability**: Assumed MongoDB is always accessible (no connection retry logic)
- **API Rate Limits**: Assumed Gemini API has sufficient quota (no rate limiting implemented)
- **Email Volume**: Assumed moderate email volume (not designed for high-throughput)
- **Network Reliability**: Assumed stable network connection for API calls

## 5. AI Tools Usage

### a. AI Tools Used

**Primary Tool:**
- **Cursor AI**: Used extensively for frontend development, component generation, and React code patterns

**Secondary Tools:**
- **ChatGPT/Claude**: Used for backend architecture decisions, API design, and debugging complex issues
- **GitHub Copilot**: Assisted with boilerplate code and common patterns

### b. What They Helped With

**Frontend Development (Cursor AI):**
- **Component Generation**: Generated React components with proper structure, props, and styling
- **State Management**: Helped design React hooks patterns and state organization
- **API Integration**: Generated Axios service layer and API client setup
- **UI/UX Patterns**: Suggested Tailwind CSS patterns and responsive design approaches
- **Routing Setup**: Assisted with React Router configuration and navigation structure
- **Error Handling**: Helped implement user-friendly error states and loading indicators

**Backend Development:**
- **API Design**: Helped structure REST endpoints and request/response formats
- **Database Schema**: Assisted with Mongoose schema design and relationships
- **Error Handling**: Suggested middleware patterns and error response structures
- **Email Integration**: Helped with Nodemailer and IMAP configuration patterns

**AI Integration:**
- **Prompt Engineering**: Refined prompts for Gemini API to improve JSON extraction reliability
- **Error Handling**: Suggested fallback strategies for AI parsing failures
- **Model Selection**: Helped choose appropriate Gemini models for different tasks

**Debugging:**
- **Error Analysis**: Helped diagnose API errors, connection issues, and parsing problems
- **Code Review**: Suggested improvements for code quality and best practices

### c. Notable Prompts/Approaches

**Frontend Component Generation:**
```
"Create a React component for displaying RFP proposals with:
- Card-based layout
- Score visualization
- Vendor information
- AI-parsed data display
- Responsive design with Tailwind CSS"
```

**API Service Layer:**
```
"Create a centralized API service for RFP operations with:
- Axios instance with interceptors
- Error handling
- Type-safe request/response patterns
- Base URL configuration"
```

**AI Prompt Refinement:**
```
"Refine this prompt to ensure Gemini returns valid JSON:
- Explicit JSON schema in prompt
- Examples of expected output
- Error handling instructions
- Field validation requirements"
```

**Email Parsing Strategy:**
```
"Design a robust email-to-RFP matching system that handles:
- Multiple matching strategies
- Fallback mechanisms
- Error logging
- Manual intervention support"
```

### d. Learnings & Changes

**What We Learned:**

1. **AI Code Generation Limitations:**
   - AI tools are excellent for boilerplate and patterns, but require careful review for business logic
   - Generated code often needs refactoring for production quality
   - Component structure suggestions were valuable, but styling needed manual refinement

2. **Prompt Engineering Importance:**
   - Clear, structured prompts to Gemini API significantly improved JSON extraction reliability
   - Including examples in prompts helped AI understand expected output format
   - Error handling in prompts reduced parsing failures

3. **Iterative Development:**
   - Started with SDK approach, learned REST API was more reliable
   - Initial model selection (`gemini-pro`) failed, learned to use newer models (`gemini-3-flash-preview`)
   - Email matching evolved from single strategy to multi-strategy approach

4. **Frontend Architecture:**
   - Cursor AI helped establish clean component structure early
   - Suggested patterns for state management that avoided over-engineering
   - Tailwind CSS integration was smoother with AI assistance

**Changes Made Based on AI Tools:**

1. **Switched from SDK to REST API:**
   - Initial implementation used `@google/generative-ai` SDK
   - Encountered compatibility issues with model versions
   - Switched to `@google/genai` REST API for better reliability

2. **Improved Error Handling:**
   - AI suggestions led to better error messages and user feedback
   - Implemented graceful degradation for AI parsing failures
   - Added comprehensive error logging

3. **Component Refactoring:**
   - Initial AI-generated components were functional but needed optimization
   - Refactored for better performance and maintainability
   - Improved prop types and component composition

4. **API Design Refinement:**
   - Initial endpoint design was basic
   - AI suggestions helped structure better request/response formats
   - Added proper status codes and error responses

5. **Documentation:**
   - AI tools helped generate comprehensive documentation
   - Suggested clear examples and use cases
   - Improved code comments and explanations

**Key Takeaways:**
- AI tools accelerated development significantly, especially for frontend components
- Human review and refinement were essential for production-quality code
- Prompt engineering for both code generation and AI API calls was crucial
- Iterative approach (build, test, refine) worked better than trying to get everything perfect initially
- AI tools are excellent assistants but require human judgment for architecture and business logic decisions
