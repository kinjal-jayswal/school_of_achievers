document.addEventListener("DOMContentLoaded", () => {
    // Dark / Light Theme Toggle
    const THEME_KEY = "ssoa-theme";
    const themeToggles = [
        document.getElementById("themeToggleMain"),
        document.getElementById("themeToggleSplash")
    ].filter(Boolean);

    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        themeToggles.forEach(toggle => { toggle.checked = theme === "dark"; });
    }

    applyTheme(localStorage.getItem(THEME_KEY) || "dark");

    themeToggles.forEach(toggle => {
        toggle.addEventListener("change", () => {
            const newTheme = toggle.checked ? "dark" : "light";
            localStorage.setItem(THEME_KEY, newTheme);
            applyTheme(newTheme);
        });
    });

    // State management
    let selectedBranch = null;

    // Elements
    const welcomePortal = document.getElementById("welcome-portal");
    const mainPortal = document.getElementById("main-portal");
    const chilodaGateway = document.getElementById("gateway-chiloda");
    const sargasanGateway = document.getElementById("gateway-sargasan");
    
    const mainNav = document.getElementById("main-nav");
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileNavDrawer = document.getElementById("mobile-nav-drawer");
    
    const campusHeroChiloda = document.getElementById("campus-hero-chiloda");
    const campusHeroSargasan = document.getElementById("campus-hero-sargasan");
    const campusTitleBadge = document.getElementById("campus-title-badge");

    // Welcome Portal Transition
    function transitionToMainSite(branch) {
        selectedBranch = branch;
        localStorage.setItem("selected_branch", branch);

        const clickedCard = branch === "chiloda" ? chilodaGateway : sargasanGateway;
        const otherCard = branch === "chiloda" ? sargasanGateway : chilodaGateway;

        // Apply zoom transition classes
        clickedCard.classList.add("clicked-zoom");
        otherCard.classList.add("fade-out-shrink");

        // Fade out text & mudra header
        const mudra = document.querySelector(".mudra-container");
        const subtitle = document.querySelector(".gateway-subtitle");
        const title = document.querySelector(".gateway-title");
        const desc = document.querySelector(".gateway-desc-text");
        
        if (mudra) {
            mudra.style.opacity = "0";
            mudra.style.transition = "opacity 0.4s ease, transform 0.4s ease";
            mudra.style.transform = "scale(0.8) translateY(-20px)";
        }
        if (subtitle) {
            subtitle.style.opacity = "0";
            subtitle.style.transition = "opacity 0.4s ease";
        }
        if (title) {
            title.style.opacity = "0";
            title.style.transition = "opacity 0.4s ease";
        }
        if (desc) {
            desc.style.opacity = "0";
            desc.style.transition = "opacity 0.4s ease";
        }

        // Configure landing page based on chosen branch
        if (branch === "chiloda") {
            campusHeroChiloda.style.display = "block";
            campusHeroSargasan.style.display = "none";
            campusTitleBadge.innerHTML = '<span></span> Chiloda Campus (KG - 10th)';
        } else {
            campusHeroChiloda.style.display = "none";
            campusHeroSargasan.style.display = "block";
            campusTitleBadge.innerHTML = '<span></span> Sargasan Campus (11th & 12th Sci.)';
        }

        // Fade out portal completely after zoom finishes
        setTimeout(() => {
            welcomePortal.classList.add("fade-out");
            
            setTimeout(() => {
                welcomePortal.style.display = "none";
                mainPortal.style.display = "block";
                
                // Trigger fade in
                setTimeout(() => {
                    mainPortal.classList.add("fade-in");
                    
                    // Initialize animations
                    initCounters();
                }, 50);
            }, 600);
        }, 800);
    }

    if (chilodaGateway && sargasanGateway) {
        chilodaGateway.addEventListener("click", () => transitionToMainSite("chiloda"));
        sargasanGateway.addEventListener("click", () => transitionToMainSite("sargasan"));
    }

    // Sticky Navbar Scroll logic
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            mainNav.classList.add("scrolled");
        } else {
            mainNav.classList.remove("scrolled");
        }
    });

    // Mobile Navbar Menu Toggle
    if (mobileMenuBtn && mobileNavDrawer) {
        mobileMenuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            mobileNavDrawer.classList.toggle("open");
            const icon = mobileMenuBtn.querySelector("i");
            if (icon) {
                if (mobileNavDrawer.classList.contains("open")) {
                    icon.className = "fa-solid fa-xmark";
                } else {
                    icon.className = "fa-solid fa-bars";
                }
            }
        });

        // Close drawer on link clicks
        const drawerLinks = mobileNavDrawer.querySelectorAll("a");
        drawerLinks.forEach(link => {
            link.addEventListener("click", () => {
                mobileNavDrawer.classList.remove("open");
                const icon = mobileMenuBtn.querySelector("i");
                if (icon) icon.className = "fa-solid fa-bars";
            });
        });

        // Close drawer when clicking outside
        document.addEventListener("click", (e) => {
            if (!mobileNavDrawer.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileNavDrawer.classList.remove("open");
                const icon = mobileMenuBtn.querySelector("i");
                if (icon) icon.className = "fa-solid fa-bars";
            }
        });
    }

    // Stats Counters Animation
    function initCounters() {
        const stats = document.querySelectorAll(".stat-number");
        
        const animateCounter = (counter) => {
            const target = parseInt(counter.getAttribute("data-target"));
            let current = 0;
            const increment = Math.ceil(target / 40); // speed division
            const intervalTime = 30; // ms
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                counter.textContent = current + (counter.getAttribute("data-suffix") || "");
            }, intervalTime);
        };

        // Observer to trigger animation when section is in view
        const observerOptions = {
            threshold: 0.25,
            rootMargin: "0px"
        };

        const statsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counters = entry.target.querySelectorAll(".stat-number");
                    counters.forEach(c => animateCounter(c));
                    observer.unobserve(entry.target); // run once
                }
            });
        }, observerOptions);

        const statsSection = document.querySelector(".stats-grid");
        if (statsSection) {
            statsObserver.observe(statsSection);
        }
    }

    // Trustees Carousel
    const trusteesCarousel = document.getElementById("trusteesCarousel");
    const trusteesPrev = document.getElementById("trusteesPrev");
    const trusteesNext = document.getElementById("trusteesNext");
    const trusteesDots = document.getElementById("trusteesDots");

    if (trusteesCarousel && trusteesPrev && trusteesNext && trusteesDots) {
        const trusteeCards = Array.from(trusteesCarousel.querySelectorAll(".trustee-card"));
        const carouselWrapper = trusteesCarousel.closest(".trustees-carousel-wrapper");

        trusteeCards.forEach((_, index) => {
            const dot = document.createElement("button");
            dot.className = "trustees-dot";
            dot.setAttribute("aria-label", `Go to trustee ${index + 1}`);
            dot.addEventListener("click", () => {
                trusteeCards[index].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
                restartAutoplay();
            });
            trusteesDots.appendChild(dot);
        });
        const dotEls = Array.from(trusteesDots.children);

        const scrollByCard = () => {
            const card = trusteesCarousel.querySelector(".trustee-card");
            const gap = 24; // 1.5rem
            return card ? card.offsetWidth + gap : 300;
        };

        trusteesPrev.addEventListener("click", () => {
            trusteesCarousel.scrollBy({ left: -scrollByCard(), behavior: "smooth" });
            restartAutoplay();
        });
        trusteesNext.addEventListener("click", () => {
            trusteesCarousel.scrollBy({ left: scrollByCard(), behavior: "smooth" });
            restartAutoplay();
        });

        // Auto-advance every 6s, looping back to the start at the end
        const goToNextSlide = () => {
            const maxScroll = trusteesCarousel.scrollWidth - trusteesCarousel.clientWidth - 2;
            if (trusteesCarousel.scrollLeft >= maxScroll) {
                trusteesCarousel.scrollTo({ left: 0, behavior: "smooth" });
            } else {
                trusteesCarousel.scrollBy({ left: scrollByCard(), behavior: "smooth" });
            }
        };

        let autoplayTimer;
        const stopAutoplay = () => clearInterval(autoplayTimer);
        const startAutoplay = () => {
            stopAutoplay();
            autoplayTimer = setInterval(goToNextSlide, 6000);
        };
        const restartAutoplay = () => startAutoplay();

        if (carouselWrapper) {
            carouselWrapper.addEventListener("mouseenter", stopAutoplay);
            carouselWrapper.addEventListener("mouseleave", startAutoplay);
            carouselWrapper.addEventListener("touchstart", stopAutoplay, { passive: true });
        }
        startAutoplay();

        const updateCarouselState = () => {
            const maxScroll = trusteesCarousel.scrollWidth - trusteesCarousel.clientWidth - 2;
            trusteesPrev.disabled = trusteesCarousel.scrollLeft <= 0;
            trusteesNext.disabled = trusteesCarousel.scrollLeft >= maxScroll;

            let closestIndex = 0;
            let closestDistance = Infinity;
            trusteeCards.forEach((card, index) => {
                const distance = Math.abs(card.offsetLeft - trusteesCarousel.scrollLeft);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = index;
                }
            });
            dotEls.forEach((dot, index) => dot.classList.toggle("active", index === closestIndex));
        };

        let scrollDebounce;
        trusteesCarousel.addEventListener("scroll", () => {
            clearTimeout(scrollDebounce);
            scrollDebounce = setTimeout(updateCarouselState, 100);
        });
        window.addEventListener("resize", updateCarouselState);
        updateCarouselState();
    }

    // Gallery Filter Logic
    const filterButtons = document.querySelectorAll(".gallery-filter-btn");
    const galleryItems = document.querySelectorAll(".gallery-item");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            // Toggle active classes on buttons
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const filterValue = button.getAttribute("data-filter");

            galleryItems.forEach(item => {
                const categories = item.getAttribute("data-category").split(" ");
                if (filterValue === "all" || categories.includes(filterValue)) {
                    item.style.display = "block";
                    // Animation trigger
                    setTimeout(() => {
                        item.style.opacity = "1";
                        item.style.transform = "scale(1)";
                    }, 50);
                } else {
                    item.style.opacity = "0";
                    item.style.transform = "scale(0.95)";
                    setTimeout(() => {
                        item.style.display = "none";
                    }, 350);
                }
            });
        });
    });

    // Contact/Admissions Form Interactive Submission
    const contactForm = document.getElementById("admissions-form");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            // Simple visual response
            const submitBtn = contactForm.querySelector("button[type='submit']");
            const originalText = submitBtn.textContent;
            submitBtn.textContent = "Submitting Enquire...";
            submitBtn.disabled = true;

            setTimeout(() => {
                // Success feedback pop
                alert("Thank you for your interest! Our Admissions Office will contact you shortly.");
                contactForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1200);
        });
    }

    // Check if there is already a selection (for easy reload testing/back button)
    const savedBranch = localStorage.getItem("selected_branch");
    if (savedBranch && welcomePortal && mainPortal) {
        // Uncomment below to bypass welcome screen on reload
        // transitionToMainSite(savedBranch);
    }

    // Deep-link support: arriving with a hash inside the main site (e.g. index.html#trustees
    // from another page's nav) should skip the welcome portal and jump straight to that section.
    if (location.hash && welcomePortal && mainPortal) {
        const target = document.querySelector(location.hash);
        if (target && mainPortal.contains(target)) {
            const branch = savedBranch || "chiloda";
            selectedBranch = branch;

            if (branch === "chiloda") {
                campusHeroChiloda.style.display = "block";
                campusHeroSargasan.style.display = "none";
                campusTitleBadge.innerHTML = '<span></span> Chiloda Campus (KG - 10th)';
            } else {
                campusHeroChiloda.style.display = "none";
                campusHeroSargasan.style.display = "block";
                campusTitleBadge.innerHTML = '<span></span> Sargasan Campus (11th & 12th Sci.)';
            }

            welcomePortal.style.display = "none";
            mainPortal.style.display = "block";
            mainPortal.classList.add("fade-in");
            initCounters();

            target.scrollIntoView();
        }
    }
});
