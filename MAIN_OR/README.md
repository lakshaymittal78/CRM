# Mini CRM Web Application

A comprehensive Customer Relationship Management (CRM) system built with Next.js, featuring AI-powered audience segmentation, campaign management, and automated messaging delivery.

## Features

### 🎯 Core Functionality
- **Customer Management**: Complete CRUD operations for customer data
- **AI-Powered Segmentation**: Natural language rule parsing for audience targeting
- **Campaign Management**: Create, send, and track marketing campaigns
- **Delivery Logging**: Comprehensive tracking of message delivery attempts
- **Dummy Vendor API**: Simulated third-party messaging service integration

### 🛠 Technical Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, RESTful APIs
- **UI Components**: shadcn/ui, Radix UI primitives
- **AI Integration**: Groq API for natural language processing
- **Database**: MongoDB (configurable)
- **Authentication**: NextAuth.js with Google OAuth
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB database (optional - uses in-memory storage by default)
- Google OAuth credentials (for authentication)
- Groq API key (for AI features)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd mini-crm-web-app
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   \`\`\`env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3000

   # Database
   MONGODB_URI=mongodb://localhost:27017/mini-crm

   # Authentication
   NEXTAUTH_SECRET=your-nextauth-secret-key
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # AI Integration
   GROQ_API_KEY=your-groq-api-key
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**
   - Push your code to GitHub
   - Import the project in Vercel dashboard
   - Vercel will auto-detect Next.js configuration

2. **Configure Environment Variables**
   In your Vercel project settings, add:
   - `NEXT_PUBLIC_API_URL`: Your production domain
   - `MONGODB_URI`: Production MongoDB connection string
   - `NEXTAUTH_SECRET`: Secure random string
   - `NEXTAUTH_URL`: Your production domain
   - `GOOGLE_CLIENT_ID`: Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
   - `GROQ_API_KEY`: Groq API key for AI features

3. **Deploy**
   \`\`\`bash
   vercel --prod
   \`\`\`

### Manual Deployment

1. **Build the application**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Start the production server**
   \`\`\`bash
   npm start
   \`\`\`

## API Documentation

### Customer Management
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create new customer
- `GET /api/customers/[id]` - Get customer by ID
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

### Audience Segmentation
- `GET /api/segments` - List all segments
- `POST /api/segments` - Create new segment with AI parsing
- `GET /api/segments/[id]` - Get segment by ID
- `PUT /api/segments/[id]` - Update segment
- `DELETE /api/segments/[id]` - Delete segment

### Campaign Management
- `GET /api/campaigns` - List all campaigns
- `POST /api/campaigns` - Create new campaign
- `POST /api/campaigns/[id]/send` - Send campaign to target segment
- `GET /api/campaigns/logs` - Get delivery logs

### Vendor API (Dummy)
- `POST /api/vendor/send-message` - Send single message
- `POST /api/vendor/batch-send` - Send batch messages
- `GET /api/vendor/send-message` - Health check

## Project Structure

\`\`\`
mini-crm-web-app/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── customers/            # Customer management APIs
│   │   ├── segments/             # Segment management APIs
│   │   ├── campaigns/            # Campaign management APIs
│   │   └── vendor/               # Dummy vendor API
│   ├── dashboard/                # Dashboard pages
│   ├── login/                    # Authentication pages
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── dashboard/                # Dashboard-specific components
│   └── ui/                       # Reusable UI components
├── hooks/                        # Custom React hooks
├── lib/                          # Utility libraries
│   ├── api.ts                    # API client
│   ├── types.ts                  # TypeScript types
│   └── vendor-api.ts             # Vendor API client
└── scripts/                      # Database scripts
\`\`\`

## Features Overview

### Customer Management
- Add, edit, and delete customer records
- Search and filter customers
- Track customer spending and purchase history
- Real-time data validation and error handling

### AI-Powered Segmentation
- Natural language rule input (e.g., "customers who spent > ₹10,000")
- AI parsing converts rules to executable logic
- Preview segment size before creation
- Flexible rule combinations

### Campaign Management
- Create targeted campaigns for specific segments
- Real-time campaign delivery tracking
- Success/failure rate monitoring
- Comprehensive delivery logs

### Dummy Vendor API
- Simulates real messaging service integration
- Realistic success/failure rates (90% success)
- Rate limiting and authentication
- Batch processing capabilities
- Various error scenarios for testing

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

### Database Setup
The application uses in-memory storage by default for demo purposes. To use MongoDB:

1. Set up MongoDB instance
2. Update `MONGODB_URI` in environment variables
3. Replace in-memory arrays with MongoDB operations in API routes

### Adding New Features
1. Create API routes in `app/api/`
2. Add corresponding React hooks in `hooks/`
3. Create UI components in `components/`
4. Update TypeScript types in `lib/types.ts`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the API documentation above
- Review the project structure and examples

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.
