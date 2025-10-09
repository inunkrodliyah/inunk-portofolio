// Smooth scroll navigasi
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute("href")).scrollIntoView({
            behavior: "smooth"
        });
        
        // Tutup menu setelah klik pada tampilan mobile
        const navLinks = document.querySelector('.nav-links');
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
        }
    });
});

// Fungsionalitas Hamburger Menu
const toggleMenu = (toggleId, navId) => {
    const toggle = document.getElementById(toggleId);
    const nav = document.querySelector('.nav-links');

    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            // Toggle kelas 'active' pada .nav-links
            nav.classList.toggle('active');
        });
    }
};

// Panggil fungsi untuk index.html dan about.html
toggleMenu('mobile-menu', '.nav-links'); // Untuk index.html
toggleMenu('mobile-menu-about', '.nav-links'); // Untuk about.html