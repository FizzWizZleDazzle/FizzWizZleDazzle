// Portfolio JavaScript - Dynamic Project Loading
class Portfolio {
    constructor() {
        this.projects = [];
        this.currentSection = 'major';
        this.init();
    }

    async init() {
        await this.loadProjects();
        this.setupNavigation();
        this.renderProjects();
        this.setupAnimations();
    }

    async loadProjects() {
        try {
            const response = await fetch('projects.json');
            this.projects = await response.json();
        } catch (error) {
            console.error('Error loading projects:', error);
            // Fallback to empty array if file doesn't exist
            this.projects = [];
        }
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const sections = document.querySelectorAll('.projects-section, .about-section');

        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetSection = btn.dataset.section;
                
                // Update active button
                navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Show/hide sections
                sections.forEach(section => {
                    if (section.id === targetSection) {
                        section.classList.remove('hidden');
                        this.currentSection = targetSection;
                        
                        // Re-render projects if switching to project section
                        if (targetSection === 'major' || targetSection === 'minor') {
                            this.renderProjects();
                        }
                    } else {
                        section.classList.add('hidden');
                    }
                });
            });
        });
    }

    renderProjects() {
        const majorGrid = document.getElementById('major-projects');
        const minorGrid = document.getElementById('minor-projects');
        
        // Clear existing projects
        majorGrid.innerHTML = '';
        minorGrid.innerHTML = '';

        // Filter and render projects
        const majorProjects = this.projects.filter(p => p.category === 'major');
        const minorProjects = this.projects.filter(p => p.category === 'minor');

        this.renderProjectGrid(majorProjects, majorGrid);
        this.renderProjectGrid(minorProjects, minorGrid);
    }

    renderProjectGrid(projects, container) {
        projects.forEach((project, index) => {
            const projectCard = this.createProjectCard(project);
            projectCard.style.animationDelay = `${index * 0.1}s`;
            container.appendChild(projectCard);
        });
    }

    createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'project-card';
        
        const title = document.createElement('h3');
        title.className = 'project-title';
        title.textContent = project.title;
        
        const description = document.createElement('p');
        description.className = 'project-description';
        description.textContent = project.description;
        
        const techContainer = document.createElement('div');
        techContainer.className = 'project-tech';
        
        project.technologies.forEach(tech => {
            const techTag = document.createElement('span');
            techTag.className = 'tech-tag';
            techTag.textContent = tech;
            techContainer.appendChild(techTag);
        });
        
        const linksContainer = document.createElement('div');
        linksContainer.className = 'project-links';
        
        if (project.github) {
            const githubLink = this.createProjectLink(project.github, 'fab fa-github', 'GitHub');
            linksContainer.appendChild(githubLink);
        }
        
        if (project.website) {
            const websiteLink = this.createProjectLink(project.website, 'fas fa-external-link-alt', 'Live Site');
            linksContainer.appendChild(websiteLink);
        }
        
        card.appendChild(title);
        card.appendChild(description);
        card.appendChild(techContainer);
        card.appendChild(linksContainer);
        
        return card;
    }

    createProjectLink(url, iconClass, text) {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.className = 'project-link';
        
        const icon = document.createElement('i');
        icon.className = iconClass;
        
        const linkText = document.createElement('span');
        linkText.textContent = text;
        
        link.appendChild(icon);
        link.appendChild(linkText);
        
        return link;
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                }
            });
        }, observerOptions);

        // Observe all project cards
        document.querySelectorAll('.project-card').forEach(card => {
            observer.observe(card);
        });

        // Add hover effects to tech badges
        document.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('tech-badge')) {
                this.animateTechBadge(e.target);
            }
        });
    }

    animateTechBadge(badge) {
        badge.style.transform = 'translateY(-2px) scale(1.05)';
        badge.style.transition = 'all 0.3s ease';
        
        badge.addEventListener('mouseleave', () => {
            badge.style.transform = 'translateY(0) scale(1)';
        }, { once: true });
    }
}

// Utility functions for smooth scrolling and effects
function addParallaxEffect() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.header');
        const speed = scrolled * 0.5;
        
        if (parallax) {
            parallax.style.transform = `translateY(${speed}px)`;
        }
    });
}

function addTypewriterEffect(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function typeWriter() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
        }
    }
    
    typeWriter();
}

// Initialize portfolio when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Portfolio();
    
    // Add some extra visual effects
    addParallaxEffect();
    
    // Animate typing effect for tagline (optional)
    const tagline = document.querySelector('.tagline');
    if (tagline) {
        const originalText = tagline.textContent;
        setTimeout(() => {
            addTypewriterEffect(tagline, originalText, 50);
        }, 1500);
    }
});

// Add smooth scroll behavior for better UX
document.documentElement.style.scrollBehavior = 'smooth';