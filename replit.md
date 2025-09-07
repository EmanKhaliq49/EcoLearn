# EcoLearn AI

## Overview

EcoLearn AI is a Progressive Web Application (PWA) focused on environmental education and sustainability. The platform provides interactive learning tools including an AI chatbot for environmental Q&A, carbon footprint calculator, recycling guidance through image recognition, environmental quizzes, and social sharing capabilities for environmental impact achievements.

The application is designed as a client-side web application that communicates with a remote backend API hosted on Azure. It emphasizes user engagement through gamification, multilingual support, and mobile-first responsive design.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Technology Stack**: Vanilla JavaScript, HTML5, CSS3 with modern features
- **Design Pattern**: Single Page Application (SPA) with multiple HTML pages for different features
- **UI Framework**: Custom CSS with CSS Grid, Flexbox, and CSS animations
- **PWA Implementation**: Service Worker for offline caching, Web App Manifest for installability
- **State Management**: Browser localStorage for persisting user data and achievements

### Module Structure
- **Home Page** (`index.html`): Main landing page with feature navigation
- **Carbon Calculator** (`carbon.html`): Interactive carbon footprint calculation tool
- **AI Chatbot** (`chat.html`): Conversational interface with multilingual support
- **Quiz System** (`quiz.html`): Gamified environmental knowledge testing
- **Recycling Guide** (`recycle.html`): Image-based plastic recycling identification
- **Social Sharing** (`share.html`): Achievement and impact sharing interface

### Client-Side Features
- **Offline Support**: Service Worker caches static assets for offline functionality
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Local Data Persistence**: User progress and achievements stored locally
- **Real-time Interactions**: Dynamic UI updates and animations

### Backend Integration
- **API Communication**: RESTful API calls to Azure-hosted backend
- **Base URL**: `https://ecolearn-ai-dgewhwhbcxanepg6.centralindia-01.azurewebsites.net`
- **Error Handling**: Graceful degradation when backend is unavailable
- **CORS Support**: Cross-origin requests configured for web deployment

## External Dependencies

### Backend Services
- **Main API Server**: Azure Web Apps hosting the EcoLearn AI backend
- **AI Services**: Backend integrates with AI/ML services for chatbot responses and image recognition
- **Quiz Engine**: Server-side quiz generation and scoring system

### Frontend Libraries
- **Chart.js**: Data visualization for carbon footprint results and progress tracking
- **Font Awesome**: Icon library for UI elements
- **Google Fonts**: Typography (Poppins, Roboto font families)

### Browser APIs
- **Service Worker API**: For PWA functionality and offline caching
- **localStorage**: Client-side data persistence
- **Fetch API**: HTTP requests to backend services
- **File API**: Image upload and processing for recycling feature
- **Web Speech API**: Voice input capabilities for chatbot (planned)

### Development Tools
- **Python HTTP Server**: Local development server with CORS support
- **Manifest.json**: PWA configuration for app installation
- **CSS Custom Properties**: Modern styling approach for theming