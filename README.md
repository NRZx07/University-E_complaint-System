# University E-Complaint System

A modern, professional university complaint management system built with React, Vite, and Tailwind CSS.

## Features

- 🎨 Premium SaaS-style UI with blue-purple gradient theme
- 🔐 Role-based authentication (Student, Faculty, Admin)
- 📱 Fully responsive design (desktop & mobile)
- 📊 Analytics dashboard with Chart.js
- 🎯 Real-time complaint tracking
- 👤 Profile management with slide-in sidebar
- ⚡ Fast development with Vite
- 🎨 Tailwind CSS for styling

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Context API
- **Charts**: Chart.js with react-chartjs-2

## Project Structure

```
university-complaint-system/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── FacultyDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── Profile.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── README.md
│
└── backend/
    ├── src/
    │   ├── config/
    │   ├── models/
    │   ├── routes/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── app.js
    │   └── server.js
    ├── package.json
    └── .env
```

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Steps

1. **Extract the ZIP file**

   ```bash
   unzip university-complaint-system.zip
   cd university-complaint-system
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## User Roles & Features

### Student Dashboard

- Submit new complaints
- View complaint history
- Track complaint status
- Anonymous complaint option
- Profile management

### Faculty Dashboard

- View assigned complaints
- Update complaint status
- Add resolution notes
- Track resolution metrics

### Admin Dashboard

- View all complaints
- Analytics & charts
- Assign complaints to faculty
- Monitor system-wide metrics
- User management

## Key Pages

1. **Landing Page** (`/`)
   - Hero section with gradient background
   - Statistics cards
   - Features showcase
   - Call-to-action buttons

2. **Authentication** (`/login`, `/register`)
   - Login with role selection
   - Registration with role-specific fields
   - Form validation

3. **Dashboards**
   - Student: `/student/dashboard`
   - Faculty: `/faculty/dashboard`
   - Admin: `/admin/dashboard`

4. **Profile** (`/profile`)
   - View/edit personal information
   - Settings management
   - Notification preferences

## Design System

### Color Palette

- Primary Blue: `#0ea5e9` to `#0c4a6e`
- Purple Accent: `#a855f7` to `#581c87`
- Success Green: `#10b981`
- Warning Yellow: `#f59e0b`
- Error Red: `#ef4444`

### Components

- Modern cards with shadows
- Gradient buttons
- Smooth transitions
- Responsive navigation
- Slide-in profile sidebar

## Mock Data

The application uses mock data for demonstration:

- Pre-populated complaints
- Sample user profiles
- Dummy analytics data
- Chart.js visualizations

## Authentication Flow

This is a **frontend-only** implementation with simulated authentication:

- User data stored in localStorage
- Role-based route protection
- Context API for state management

**Note**: In production, integrate with a real backend API for authentication.

## Customization

### Changing Colors

Edit `tailwind.config.js` to customize the color scheme:

```javascript
theme: {
  extend: {
    colors: {
      primary: { /* your colors */ },
      purple: { /* your colors */ }
    }
  }
}
```

### Adding New Features

1. Create component in `src/components/`
2. Add route in `src/App.jsx`
3. Update navigation in `src/components/Navbar.jsx`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- ⚡ Fast page loads with Vite
- 📦 Code splitting with React Router
- 🎨 Optimized CSS with Tailwind
- 🚀 Production build optimization

## Troubleshooting

### Port already in use

```bash
npm run dev -- --port 3000
```

### Build errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### Styling not working

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## Future Enhancements

- [ ] Backend API integration
- [ ] Real-time notifications (WebSocket)
- [ ] File upload for attachments
- [ ] Advanced filtering & search
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Dark mode

## License

MIT License - Feel free to use this project for learning or commercial purposes.

## Support

For issues or questions:

- Check the documentation
- Review the code comments
- Open an issue on GitHub

## Credits

Built with ❤️ using React, Vite, and Tailwind CSS

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-09
