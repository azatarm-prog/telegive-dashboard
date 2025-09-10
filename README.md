# Telegive Dashboard

A modern React-based dashboard for managing Telegram giveaways with real-time updates, comprehensive participant management, and intuitive user interface.

## 🚀 Features

- **Giveaway Management**: Create, configure, and manage Telegram giveaways
- **Real-time Updates**: Live participant tracking and status updates
- **Participant Management**: Comprehensive participant lists with verification status
- **Media Support**: Upload images and videos for engaging giveaways
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Authentication**: Secure bot token-based authentication
- **History Tracking**: Complete giveaway history with detailed analytics
- **Performance Optimized**: Fast loading and smooth user experience

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **State Management**: Redux Toolkit
- **Routing**: React Router v7
- **UI Components**: Radix UI, shadcn/ui
- **Forms**: React Hook Form with Zod validation
- **Testing**: Jest, React Testing Library, Playwright
- **Build Tool**: Vite
- **Package Manager**: pnpm

## 📋 Prerequisites

- Node.js 18 or higher
- pnpm (recommended) or npm/yarn
- A Telegram bot token from [@BotFather](https://t.me/BotFather)

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/telegive-dashboard.git
cd telegive-dashboard
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
VITE_API_BASE_URL=https://api.telegive.com
VITE_TELEGIVE_AUTH_URL=https://api.telegive.com/auth
# ... other variables
```

### 4. Start the development server

```bash
pnpm run dev
```

The application will be available at `http://localhost:5173`

## 🧪 Testing

### Unit Tests

```bash
# Run all unit tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:coverage
```

### End-to-End Tests

```bash
# Install Playwright browsers (first time only)
pnpm exec playwright install

# Run E2E tests
pnpm run test:e2e

# Run E2E tests with UI
pnpm run test:e2e:ui
```

### Performance Tests

```bash
pnpm run test:performance
```

### Run All Tests

```bash
pnpm run test:all
```

## 🏗️ Building for Production

```bash
# Build the application
pnpm run build

# Preview the production build
pnpm run preview
```

## 🐳 Docker Deployment

### Using Docker

```bash
# Build and run with Docker
./deploy.sh docker
```

### Using Docker Compose

```bash
# Deploy with Docker Compose
./deploy.sh compose
```

### Manual Docker Commands

```bash
# Build the image
docker build -t telegive-dashboard .

# Run the container
docker run -d -p 3000:3000 --name telegive-dashboard telegive-dashboard
```

## ☁️ Cloud Deployment

### Railway

1. Connect your GitHub repository to Railway
2. Set the required environment variables
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform that supports Node.js applications:

- Vercel
- Netlify
- Heroku
- AWS
- Google Cloud Platform
- Azure

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Base URL for the Telegive API | - |
| `VITE_TELEGIVE_AUTH_URL` | Authentication endpoint | - |
| `VITE_TELEGIVE_GIVEAWAY_URL` | Giveaway management endpoint | - |
| `VITE_TELEGIVE_PARTICIPANT_URL` | Participant management endpoint | - |
| `VITE_TELEGIVE_MEDIA_URL` | Media upload endpoint | - |
| `VITE_MAX_FILE_SIZE` | Maximum file upload size in bytes | 52428800 |
| `VITE_ENABLE_REAL_TIME_UPDATES` | Enable WebSocket updates | true |
| `VITE_ITEMS_PER_PAGE` | Items per page in lists | 20 |

### Feature Flags

- `VITE_ENABLE_ANALYTICS`: Enable analytics tracking
- `VITE_ENABLE_DEBUG_MODE`: Enable debug mode
- `VITE_ENABLE_REAL_TIME_UPDATES`: Enable real-time updates

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── common/         # Common components
│   ├── giveaway/       # Giveaway-related components
│   ├── media/          # Media handling components
│   └── participants/   # Participant management components
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API services
├── store/              # Redux store and slices
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx             # Main application component
```

## 🔒 Security

- Bot token-based authentication
- Input validation with Zod schemas
- XSS protection
- CSRF protection
- Rate limiting (in production with nginx)
- Security headers

## 🚀 Performance

- Code splitting with React.lazy
- Image optimization
- Bundle size optimization
- Caching strategies
- Performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Ensure all tests pass before submitting PR
- Update documentation as needed

## 📝 API Integration

The dashboard integrates with the Telegive API for:

- User authentication
- Giveaway management
- Participant tracking
- Media uploads
- Real-time updates via WebSocket

## 🐛 Troubleshooting

### Common Issues

1. **Build fails**: Ensure all dependencies are installed and Node.js version is 18+
2. **Tests fail**: Check that all environment variables are set correctly
3. **Authentication issues**: Verify bot token format and API endpoints
4. **Performance issues**: Check network connectivity and API response times

### Getting Help

- Check the [Issues](https://github.com/yourusername/telegive-dashboard/issues) page
- Create a new issue with detailed information
- Contact support at support@telegive.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - UI primitives
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [Vite](https://vitejs.dev/) - Build tool

## 📊 Status

![CI/CD](https://github.com/yourusername/telegive-dashboard/workflows/CI/CD%20Pipeline/badge.svg)
![Tests](https://github.com/yourusername/telegive-dashboard/workflows/Tests/badge.svg)
![Security](https://github.com/yourusername/telegive-dashboard/workflows/Security%20Scan/badge.svg)

---

Made with ❤️ by the Telegive Team

