# YearBook - Global School Memories Platform

A web application for searching and sharing school yearbooks and class photos from around the world.

## Features

### Core Features
- **Global Search**: Search for yearbooks and class photos by school name, city, or country
- **Advanced Filtering**: Filter by year, grade, and tags
- **User System**: Create accounts to upload and manage your memories
- **Upload & Tag**: Upload photos with detailed information and tags for easy discovery
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Beautiful UI**: Modern design with gammelrosa (vintage rose) and plommerød (plum) color palette

### Recent Additions
- **Report System**: Users can report inappropriate or incorrect posts
- **Admin Panel**: Administrators can review reports and moderate content
- **Mobile Menu**: Hamburger menu for mobile devices
- **Smooth Animations**: Enhanced user experience with smooth transitions
- **Interactive Elements**: Hover effects, loading states, and improved feedback
- **Keyboard Navigation**: Support for keyboard shortcuts and accessibility

## Project Structure

```
YearBook/
├── assets/
│   ├── images/          # Image assets
│   └── videos/          # Video assets (logo, animations)
├── css/
│   ├── style.css        # Main stylesheet
│   ├── auth.css         # Authentication pages styles
│   ├── search.css       # Search page styles
│   ├── upload.css       # Upload page styles
│   ├── view.css         # View memory page styles
│   ├── profile.css      # Profile page styles
│   └── admin.css        # Admin panel styles
├── js/
│   ├── main.js          # Main application logic
│   ├── data.js          # Data storage and retrieval
│   ├── auth.js          # Authentication logic
│   ├── search.js        # Search functionality
│   ├── upload.js        # Upload functionality
│   ├── view.js          # View memory functionality
│   ├── profile.js       # Profile page logic
│   ├── admin.js         # Admin panel logic
│   └── shared.js        # Shared functionality (menu, navigation)
├── pages/
│   ├── login.html       # Login page
│   ├── register.html    # Registration page
│   ├── search.html      # Search page
│   ├── upload.html      # Upload page
│   ├── view.html        # View memory page
│   ├── profile.html     # User profile page
│   └── admin.html       # Admin panel page
└── index.html           # Home page

```

## Getting Started

### Local Development

1. Clone or download this repository
2. Open `index.html` in a web browser
3. No build process required - it's a pure HTML/CSS/JavaScript application

### Using LocalStorage

The application uses browser LocalStorage to store:
- User accounts
- Uploaded memories
- User session data
- Reports and moderation data

**Note**: Data is stored locally in your browser and will be cleared if you clear browser data.

### API Configuration (Optional)

If you need to use external APIs (e.g., OpenRouter), you can configure API keys securely:

1. **Copy the example config file:**
   ```bash
   cp config.js.example config.js
   ```

2. **Add your API key to `config.js`:**
   ```javascript
   const CONFIG = {
       OPENROUTER_API_KEY: 'your-api-key-here'
   };
   ```

3. **Use the API key in your code:**
   ```javascript
   const apiKey = getApiKey('OPENROUTER');
   ```

**⚠️ IMPORTANT:** The `config.js` file is automatically ignored by Git and will NOT be committed. Never commit API keys or sensitive data to the repository!

See [SECURITY.md](SECURITY.md) for detailed security guidelines.

### Admin Access

To access the admin panel:
1. Register a user with email: `admin@yearbook.com`
2. Login with that account
3. The "Admin" link will appear in the navigation menu
4. You can review reports and moderate content

## Usage

### For Users

1. **Register/Login**: Create an account or login to upload memories
2. **Search**: Use the search function to find yearbooks and class photos
3. **Upload**: Share your school memories by uploading photos with details
4. **Tag**: Add tags to help others find your uploads
5. **View**: Click on any search result to view full details

### Search Features

- Search by school name
- Filter by city
- Filter by country
- Filter by year (e.g., 1995)
- Filter by grade/class (e.g., "5th grade", "Class 3B")

## Deployment to GitHub Pages

1. Push this repository to your GitHub account
2. Go to repository Settings → Pages
3. Select the branch you want to deploy (usually `main` or `master`)
4. Select the root folder as the source
5. Your site will be available at `https://[username].github.io/[repository-name]`

## Browser Compatibility

Works on all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## Color Palette

The application uses a gammelrosa (vintage rose) and plommerød (plum) color scheme:
- Primary: #D4A5A5 (Gammelrosa)
- Dark: #8B5F7F (Plommerød)
- Light: #E8C9C9 (Lys gammelrosa)
- Cream: #F5E8E8 (Kremgammelrosa)
- Brown: #7A4F6A (Mørk plommerød)

## Recent Updates

### v2.0 - November 2025
- ✅ Added report system for content moderation
- ✅ Implemented admin panel for reviewing reports
- ✅ Enhanced UI with smooth animations and transitions
- ✅ Added mobile hamburger menu
- ✅ Improved keyboard navigation
- ✅ Changed color palette to gammelrosa and plommerød
- ✅ Added loading states and better user feedback

## Future Enhancements

See [TODO.md](TODO.md) for a comprehensive list of planned improvements including:
- User favorites and bookmarks
- Edit/delete own posts
- Comments and likes
- Advanced search with autocomplete
- Dark mode
- Image optimization
- Multi-language support
- Backend integration

## License

This project is open source and available for personal and educational use.

## Author

Created for sharing school memories globally.

---

**Note**: This is a frontend-only application using LocalStorage. For production use, consider implementing a backend server for data persistence and security.

