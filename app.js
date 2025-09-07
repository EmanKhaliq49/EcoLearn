// EcoLearn AI Frontend JavaScript

// Global variables
let currentUser = null;
let courses = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('EcoLearn AI Frontend initialized');
    initializeApp();
    // Smooth page enter
    requestAnimationFrame(() => document.body.classList.add('page-enter'));
});

// Initialize application
function initializeApp() {
    fetchBackendData();
    registerServiceWorker();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Feature buttons
    document.querySelectorAll('.feature-btn').forEach(button => {
        button.addEventListener('click', function() {
            const featureId = this.id;
            console.log(`Feature clicked: ${featureId}`);
            // Add your feature logic here
        });
    });

    // Share button
    const shareBtn = document.querySelector('.share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            console.log('Share button clicked');
            // Add share functionality here
        });
    }
}

// Fetch data from backend
async function fetchBackendData() {
    try {
        const response = await fetch('https://ecolearn-ai-dgewhwhbcxanepg6.centralindia-01.azurewebsites.net/');
        if (response.ok) {
            const data = await response.json();
            console.log('Backend response:', data);
        } else {
            console.error('Failed to fetch from backend:', response.status);
        }
    } catch (error) {
        console.error('Error fetching from backend:', error);
    }
}

// Register service worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    } else {
        console.log('Service Worker not supported in this browser');
    }
}

// Load courses data
async function loadCourses() {
    try {
        // Try to fetch courses from the API
        const response = await fetch('https://ecolearn-ai-dgewhwhbcxanepg6.centralindia-01.azurewebsites.net/api/courses');
        if (response.ok) {
            const data = await response.json();
            courses = data.courses;
            console.log('Courses loaded from API:', courses);
        } else {
            throw new Error('Failed to fetch courses');
        }
    } catch (error) {
        console.log('Using fallback courses data:', error);
        // Fallback to static data if API is not available
        courses = [
            {
                id: 1,
                title: 'Green Technology',
                description: 'Learn about renewable energy and sustainable technology solutions',
                duration: '8 weeks',
                level: 'Intermediate',
                instructor: 'Dr. Sarah Green'
            },
            {
                id: 2,
                title: 'Environmental Science',
                description: 'Understand climate change and environmental conservation',
                duration: '10 weeks',
                level: 'Beginner',
                instructor: 'Prof. Michael Eco'
            },
            {
                id: 3,
                title: 'Sustainable Living',
                description: 'Adopt eco-friendly practices in your daily life',
                duration: '6 weeks',
                level: 'Beginner',
                instructor: 'Lisa Sustainable'
            }
        ];
    }
    
    console.log('Courses loaded:', courses);
}

// Enroll in a course
function enrollInCourse(courseTitle) {
    if (!currentUser) {
        showNotification('Please log in to enroll in courses', 'warning');
        return;
    }
    
    const course = courses.find(c => c.title === courseTitle);
    if (course) {
        showNotification(`Successfully enrolled in ${courseTitle}!`, 'success');
        // Here you would typically make an API call to the backend
        console.log(`User enrolled in course: ${courseTitle}`);
    }
}

// Start learning function
function startLearning() {
    showNotification('Welcome to EcoLearn AI! Let\'s begin your sustainable learning journey.', 'success');
    
    // Scroll to courses section
    const coursesSection = document.querySelector('#courses');
    if (coursesSection) {
        coursesSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Check backend health
async function checkBackendHealth() {
    try {
        const response = await fetch('https://ecolearn-ai-dgewhwhbcxanepg6.centralindia-01.azurewebsites.net/api/health');
        const data = await response.json();
        
        if (data.status === 'healthy') {
            console.log('Backend is healthy:', data);
            showNotification('Backend connected successfully', 'success');
        }
    } catch (error) {
        console.log('Backend connection failed:', error);
        showNotification('Backend connection failed. Running in offline mode.', 'warning');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
    `;
    
    // Set background color based on type
    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#4CAF50';
            break;
        case 'warning':
            notification.style.backgroundColor = '#FF9800';
            break;
        case 'error':
            notification.style.backgroundColor = '#F44336';
            break;
        default:
            notification.style.backgroundColor = '#2196F3';
    }
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Utility functions
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for global access
window.ecolearnAI = {
    startLearning,
    enrollInCourse,
    showNotification,
    checkBackendHealth
};
