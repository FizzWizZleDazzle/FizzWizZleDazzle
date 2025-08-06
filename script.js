// Digital Weaver Portfolio - Advanced Interactive Experience
class DigitalWeaverPortfolio {
    constructor() {
        this.projects = [];
        this.currentSection = 'about'; // Changed default to about
        this.canvas = null;
        this.ctx = null;
        this.threads = [];
        this.mouse = { x: 0, y: 0 };
        this.isLoading = true;
        this.performanceMode = this.detectPerformanceMode();
        this.aboutTextVisible = true;
        this.init();
    }

    async init() {
        this.showLoading();
        await this.loadProjects();
        this.setupCanvas();
        this.setupNavigation();
        this.setupModal();
        this.setupScrollAnimations();
        this.setupAvatarClick();
        this.renderProjects();
        this.hideLoading();
        this.startAnimationLoop();
    }

    detectPerformanceMode() {
        // Check system specs and return performance mode
        const memory = navigator.deviceMemory || 4; // GB
        const cores = navigator.hardwareConcurrency || 4;
        const connection = navigator.connection?.effectiveType || '4g';
        
        // Check for low-end devices
        const isLowEnd = memory < 4 || cores < 4 || connection === 'slow-2g' || connection === '2g';
        const isMedium = memory < 8 || cores < 8 || connection === '3g';
        
        if (isLowEnd) {
            console.log('Performance mode: LOW - Reducing animations');
            return 'low';
        } else if (isMedium) {
            console.log('Performance mode: MEDIUM - Moderate animations');
            return 'medium';
        } else {
            console.log('Performance mode: HIGH - Full animations');
            return 'high';
        }
    }

    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.remove('hidden');
        }
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            setTimeout(() => {
                loading.classList.add('hidden');
                this.isLoading = false;
            }, 800); // Reduced from 2000ms to 800ms
        }
    }

    async loadProjects() {
        try {
            const response = await fetch('projects.json');
            this.projects = await response.json();
        } catch (error) {
            console.error('Error loading projects:', error);
            this.projects = [];
        }
    }

    setupCanvas() {
        this.canvas = document.getElementById('loomCanvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        this.initializeThreads();
        
        // Hide interaction hint after first interaction
        let hasInteracted = false;
        const hint = document.querySelector('.interaction-hint');
        
        window.addEventListener('resize', () => this.resizeCanvas());
        this.canvas.addEventListener('mousemove', (e) => {
            this.updateMouse(e);
            if (!hasInteracted && hint) {
                hint.style.opacity = '0';
                setTimeout(() => hint.remove(), 500);
                hasInteracted = true;
            }
        });
        
        // Touch support for mobile
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            if (touch) {
                const rect = this.canvas.getBoundingClientRect();
                this.mouse.x = touch.clientX - rect.left;
                this.mouse.y = touch.clientY - rect.top;
                if (!hasInteracted && hint) {
                    hint.style.opacity = '0';
                    setTimeout(() => hint.remove(), 500);
                    hasInteracted = true;
                }
            }
        });
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    initializeThreads() {
        this.threads = [];
        let threadCount;
        
        // Adjust thread count based on performance mode
        switch (this.performanceMode) {
            case 'low':
                threadCount = 30;
                break;
            case 'medium':
                threadCount = 60;
                break;
            case 'high':
            default:
                threadCount = 100;
                break;
        }
        
        for (let i = 0; i < threadCount; i++) {
            this.threads.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                targetX: Math.random() * this.canvas.width,
                targetY: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                opacity: Math.random() * 0.6 + 0.3,
                hue: Math.random() * 60 + 180, // Blue to cyan range
                connections: [],
                size: Math.random() * 2 + 1
            });
        }
    }

    updateMouse(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
    }

    animateThreads() {
        if (!this.ctx || this.isLoading) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update thread positions
        this.threads.forEach(thread => {
            // Mouse repulsion instead of attraction
            const dx = this.mouse.x - thread.x;
            const dy = this.mouse.y - thread.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 200) { // Repulsion radius
                const force = (200 - distance) / 200;
                // Repel away from mouse (negative direction)
                thread.vx -= (dx / distance) * force * 0.02;
                thread.vy -= (dy / distance) * force * 0.02;
                
                // Make threads glow brighter when near mouse
                thread.opacity = Math.min(1, thread.opacity + force * 0.3);
            } else {
                // Fade back to normal opacity
                thread.opacity *= 0.99;
                thread.opacity = Math.max(0.3, thread.opacity);
            }
            
            // Update position with performance-aware movement
            const moveSpeed = this.performanceMode === 'low' ? 0.3 : 0.5;
            thread.x += thread.vx * moveSpeed;
            thread.y += thread.vy * moveSpeed;
            
            // Drift towards target more slowly
            const driftSpeed = this.performanceMode === 'low' ? 0.0003 : 0.0005;
            thread.vx += (thread.targetX - thread.x) * driftSpeed;
            thread.vy += (thread.targetY - thread.y) * driftSpeed;
            
            // Apply friction
            const friction = this.performanceMode === 'low' ? 0.92 : 0.95;
            thread.vx *= friction;
            thread.vy *= friction;
            
            // Boundary wrapping
            if (thread.x < 0) thread.x = this.canvas.width;
            if (thread.x > this.canvas.width) thread.x = 0;
            if (thread.y < 0) thread.y = this.canvas.height;
            if (thread.y > this.canvas.height) thread.y = 0;
            
            // Update target less frequently
            const targetUpdateRate = this.performanceMode === 'low' ? 0.0005 : 0.001;
            if (Math.random() < targetUpdateRate) {
                thread.targetX = Math.random() * this.canvas.width;
                thread.targetY = Math.random() * this.canvas.height;
            }
        });
        
        // Draw connections with enhanced visibility near mouse
        this.threads.forEach((thread, i) => {
            this.threads.slice(i + 1).forEach(otherThread => {
                const dx = thread.x - otherThread.x;
                const dy = thread.y - otherThread.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) { // Increased connection distance
                    const opacity = (1 - distance / 120) * Math.min(thread.opacity, otherThread.opacity);
                    
                    // Enhanced visibility near mouse
                    const mouseDistance = Math.min(
                        Math.sqrt((this.mouse.x - thread.x) ** 2 + (this.mouse.y - thread.y) ** 2),
                        Math.sqrt((this.mouse.x - otherThread.x) ** 2 + (this.mouse.y - otherThread.y) ** 2)
                    );
                    const mouseEffect = mouseDistance < 150 ? 1.5 : 1;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(thread.x, thread.y);
                    this.ctx.lineTo(otherThread.x, otherThread.y);
                    this.ctx.strokeStyle = `hsla(${thread.hue}, 70%, 60%, ${opacity * mouseEffect})`;
                    this.ctx.lineWidth = mouseEffect > 1 ? 2 : 1;
                    this.ctx.stroke();
                }
            });
        });
        
        // Draw threads with variable sizes
        this.threads.forEach(thread => {
            this.ctx.beginPath();
            this.ctx.arc(thread.x, thread.y, thread.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${thread.hue}, 70%, 60%, ${thread.opacity})`;
            this.ctx.fill();
            
            // Enhanced glow effect near mouse
            const mouseDistance = Math.sqrt((this.mouse.x - thread.x) ** 2 + (this.mouse.y - thread.y) ** 2);
            if (mouseDistance < 150) {
                const glowIntensity = (150 - mouseDistance) / 150;
                this.ctx.beginPath();
                this.ctx.arc(thread.x, thread.y, thread.size * 3, 0, Math.PI * 2);
                this.ctx.fillStyle = `hsla(${thread.hue}, 70%, 60%, ${thread.opacity * 0.2 * glowIntensity})`;
                this.ctx.fill();
            }
        });
    }

    startAnimationLoop() {
        let lastTime = 0;
        let targetFPS;
        
        // Adjust FPS based on performance mode
        switch (this.performanceMode) {
            case 'low':
                targetFPS = 15;
                break;
            case 'medium':
                targetFPS = 24;
                break;
            case 'high':
            default:
                targetFPS = 30;
                break;
        }
        
        const frameTime = 1000 / targetFPS;
        
        const animate = (currentTime) => {
            if (currentTime - lastTime >= frameTime) {
                this.animateThreads();
                lastTime = currentTime;
            }
            requestAnimationFrame(animate);
        };
        animate(0);
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const sections = document.querySelectorAll('.projects-section, .about-section');

        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = btn.dataset.section;
                
                // Update active button
                navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Show/hide sections with animation
                sections.forEach(section => {
                    if (section.id === targetSection) {
                        section.classList.remove('hidden');
                        section.style.animation = 'fadeInUp 0.6s ease-out forwards';
                        this.currentSection = targetSection;
                        
                        // Re-render projects if switching to project section
                        if (targetSection === 'major' || targetSection === 'minor') {
                            setTimeout(() => this.renderProjects(), 100);
                        }
                    } else {
                        section.classList.add('hidden');
                    }
                });
            });
        });
    }

    setupModal() {
        this.modal = document.getElementById('projectModal');
        this.modalBody = document.getElementById('modalBody');
        this.modalClose = document.getElementById('modalClose');
        
        if (this.modalClose) {
            this.modalClose.addEventListener('click', () => this.closeModal());
        }
        
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    openModal(project) {
        if (!this.modal || !this.modalBody) return;
        
        this.modalBody.innerHTML = `
            <div class="modal-project">
                <div class="modal-header">
                    <h2 class="modal-title">${project.title}</h2>
                    <div class="modal-category ${project.category}"></div>
                </div>
                <p class="modal-description">${project.description}</p>
                <div class="modal-tech">
                    ${project.technologies.map(tech => 
                        `<span class="tech-tag" data-tech="${tech.toLowerCase()}">${tech}</span>`
                    ).join('')}
                </div>
                <div class="modal-links">
                    ${project.github ? `
                        <a href="${project.github}" target="_blank" class="project-link">
                            <i class="fab fa-github"></i>
                            <span>View Code</span>
                        </a>
                    ` : ''}
                    ${project.website ? `
                        <a href="${project.website}" target="_blank" class="project-link">
                            <i class="fas fa-external-link-alt"></i>
                            <span>Live Demo</span>
                        </a>
                    ` : ''}
                </div>
            </div>
        `;
        
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        if (this.modal) {
            this.modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    setupAvatarClick() {
        const weaverAvatar = document.getElementById('weaverAvatar');
        const aboutText = document.getElementById('aboutText');
        
        if (weaverAvatar && aboutText) {
            weaverAvatar.addEventListener('click', () => {
                if (this.aboutTextVisible) {
                    // Slide out
                    aboutText.classList.add('slide-out');
                    setTimeout(() => {
                        aboutText.style.visibility = 'hidden';
                        aboutText.classList.remove('slide-out');
                        aboutText.classList.add('slide-in');
                        this.aboutTextVisible = false;
                    }, 500);
                } else {
                    // Slide in
                    aboutText.style.visibility = 'visible';
                    aboutText.classList.remove('slide-in');
                    setTimeout(() => {
                        this.aboutTextVisible = true;
                    }, 50);
                }
            });
        }
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, observerOptions);
        
        // Observe all scroll-reveal elements
        document.querySelectorAll('.scroll-reveal').forEach(el => {
            observer.observe(el);
        });
        
        // Add scroll reveal classes to sections
        document.querySelectorAll('.projects-section, .about-section').forEach(section => {
            section.classList.add('scroll-reveal');
        });
    }

    renderProjects() {
        const majorGrid = document.getElementById('major-projects');
        const minorGrid = document.getElementById('minor-projects');
        
        if (!majorGrid || !minorGrid) return;
        
        // Clear existing projects
        majorGrid.innerHTML = '';
        minorGrid.innerHTML = '';

        // Filter and render projects
        const majorProjects = this.projects.filter(p => p.category === 'major');
        const minorProjects = this.projects.filter(p => p.category === 'minor');

        this.renderProjectMasonry(majorProjects, majorGrid);
        this.renderProjectMasonry(minorProjects, minorGrid);
        
        // Setup scroll animations for new cards
        this.setupProjectCardAnimations();
    }

    renderProjectMasonry(projects, container) {
        projects.forEach((project, index) => {
            const projectCard = this.createProjectCard(project);
            projectCard.classList.add('scroll-reveal', `delay-${Math.min(index, 4)}`);
            container.appendChild(projectCard);
        });
    }

    createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.setAttribute('data-category', project.category);
        
        // Add click handler for modal
        card.addEventListener('click', () => this.openModal(project));
        
        // Category indicator
        const categoryIndicator = document.createElement('div');
        categoryIndicator.className = `project-category ${project.category}`;
        
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
            techTag.setAttribute('data-tech', tech.toLowerCase());
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
        
        card.appendChild(categoryIndicator);
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
        
        // Prevent modal from opening when clicking links
        link.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        const icon = document.createElement('i');
        icon.className = iconClass;
        
        const linkText = document.createElement('span');
        linkText.textContent = text;
        
        link.appendChild(icon);
        link.appendChild(linkText);
        
        return link;
    }

    setupProjectCardAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, observerOptions);

        // Observe all project cards
        document.querySelectorAll('.project-card:not(.revealed)').forEach(card => {
            observer.observe(card);
        });
    }
}

// Initialize the Digital Weaver Portfolio
document.addEventListener('DOMContentLoaded', () => {
    new DigitalWeaverPortfolio();
});