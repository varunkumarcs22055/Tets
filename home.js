// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    // Animate hamburger to X
    menuToggle.classList.toggle('active');
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Particle Background
function createParticles() {
    const particles = document.getElementById('particles');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = Math.random() * 100 + 'vh';
        particle.style.transform = `scale(${Math.random()})`;
        particle.style.opacity = Math.random();
        particle.style.animation = `float ${5 + Math.random() * 10}s linear infinite`;
        particles.appendChild(particle);
    }
}

// Intersection Observer for animations
const observerOptions = {
    root: null,
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

document.querySelectorAll('.service-box').forEach(box => {
    observer.observe(box);
});

// Dynamic navbar background
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.9)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.8)';
    }
});

// Initialize particles on load
window.addEventListener('load', createParticles);

// Form validation
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Add your form validation and submission logic here
        alert('Form submitted successfully!');
    });
}

// Newsletter subscription
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;
        // Add your newsletter subscription logic here
        alert(`Thank you for subscribing with: ${email}`);
    });
}

// Service box hover effect
document.querySelectorAll('.service-box').forEach(box => {
    box.addEventListener('mouseenter', (e) => {
        const tryNow = e.currentTarget.querySelector('.try-now');
        tryNow.style.transform = 'translateX(10px)';
    });

    box.addEventListener('mouseleave', (e) => {
        const tryNow = e.currentTarget.querySelector('.try-now');
        tryNow.style.transform = 'translateX(0)';
    });
});

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const heroContent = document.querySelector('.hero-content');
    const heroImage = document.querySelector('.hero-image');
    const scrolled = window.pageYOffset;

    if (heroContent && heroImage) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroImage.style.transform = `translateY(${scrolled * 0.2}px)`;
    }
});