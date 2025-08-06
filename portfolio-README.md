# Portfolio Website

A modern, dark-themed portfolio website with smooth animations and dynamic project loading. Built with vanilla HTML, CSS, and JavaScript for minimal dependencies and fast loading.

## Features

- 🌙 **Dark Theme**: Modern dark design with gradient accents
- ✨ **Smooth Animations**: Fade-in effects, hover animations, and transitions
- 📱 **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- 🔄 **Dynamic Loading**: Projects loaded from JSON file for easy updates
- 📂 **Project Categories**: Separate sections for major and minor projects
- 🔗 **Flexible Links**: Support for GitHub-only, website-only, or both types of links
- ⚡ **Fast Loading**: No framework dependencies, pure vanilla JavaScript

## Getting Started

### Local Development

1. Clone the repository
2. Start a local server:
   ```bash
   python3 -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser

### GitHub Pages Deployment

1. Enable GitHub Pages in repository settings
2. Select "Deploy from a branch" and choose `main` branch
3. Your portfolio will be available at `https://yourusername.github.io/repositoryname`

## Updating Projects

To add or modify projects, simply edit the `projects.json` file. The website will automatically load and display the updated projects.

### Project Structure

```json
{
  "title": "Project Name",
  "description": "Brief description of the project",
  "technologies": ["Tech1", "Tech2", "Tech3"],
  "category": "major", // or "minor"
  "github": "https://github.com/user/repo", // optional
  "website": "https://example.com" // optional
}
```

### Project Categories

- **Major Projects**: Significant projects, frameworks, or tools
- **Minor Projects**: Small utilities, automation scripts, or quick tools

### Link Options

Each project can have:
- Only a GitHub link (`"github"` field, `"website": null`)
- Only a website link (`"website"` field, `"github": null`)
- Both GitHub and website links
- No links (though not recommended)

## Customization

### Personal Information

Edit the following in `index.html`:
- Name and tagline in the header section
- Tech stack badges
- Social links (GitHub, email)
- About section content

### Styling

Modify `styles.css` to customize:
- Color scheme (CSS variables in `:root`)
- Animations and transitions
- Layout and spacing
- Typography

### Behavior

Update `script.js` to modify:
- Animation timings
- Project loading logic
- Navigation behavior
- Additional effects

## File Structure

```
portfolio/
├── index.html          # Main HTML structure
├── styles.css          # Styling and animations
├── script.js           # Dynamic functionality
├── projects.json       # Project data (easily editable)
└── README.md          # This documentation
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript features used
- CSS Grid and Flexbox for layouts
- CSS Custom Properties for theming

## Performance Features

- Minimal dependencies (no frameworks)
- Optimized animations using CSS transforms
- Lazy loading animations with Intersection Observer
- Efficient DOM manipulation
- Compressed assets

## Contributing

Feel free to submit issues or pull requests to improve the portfolio template!