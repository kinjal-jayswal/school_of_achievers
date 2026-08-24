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

            // Sargasan (11th-12th Science) has no activity photos of its own — the
            // gallery's "Activities" tab only contains Chiloda primary-age content,
            // which doesn't belong on a Sargasan visitor's page. Remove that tab and
            // its items from the DOM entirely (not just hide them) so they can never
            // resurface via the "All" filter or any other button click.
            const activitiesBtn = document.querySelector('.gallery-filter-btn[data-filter="activities"]');
            if (activitiesBtn) activitiesBtn.remove();
            document.querySelectorAll('.gallery-item[data-category="activities"]').forEach(item => item.remove());
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
        const originalCards = Array.from(trusteesCarousel.querySelectorAll(".trustee-card"));
        const N = originalCards.length;
        const carouselWrapper = trusteesCarousel.closest(".trustees-carousel-wrapper");

        // Determine visible cards per page based on current width
        const getItemsPerPage = () => {
            const width = window.innerWidth;
            if (width >= 992) return 3;
            if (width >= 576) return 2;
            return 1;
        };

        let itemsPerPage = getItemsPerPage();

        // Staggered reveal observer
        const revealAllCards = () => {
            trusteesCarousel.querySelectorAll(".trustee-card").forEach((card) => card.classList.add("revealed"));
        };
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    revealAllCards();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.2 });
        revealObserver.observe(trusteesCarousel);

        // Build clones & track setup
        let prependClones = [];
        let appendClones = [];

        const setupClones = () => {
            trusteesCarousel.querySelectorAll(".trustee-clone").forEach((c) => c.remove());
            prependClones = [];
            appendClones = [];

            itemsPerPage = getItemsPerPage();

            // Prepend clones (last itemsPerPage cards)
            for (let i = N - itemsPerPage; i < N; i++) {
                if (originalCards[i]) {
                    const clone = originalCards[i].cloneNode(true);
                    clone.classList.add("trustee-clone", "revealed");
                    clone.setAttribute("aria-hidden", "true");
                    prependClones.push(clone);
                }
            }

            // Append clones (first itemsPerPage cards)
            for (let i = 0; i < itemsPerPage; i++) {
                if (originalCards[i]) {
                    const clone = originalCards[i].cloneNode(true);
                    clone.classList.add("trustee-clone", "revealed");
                    clone.setAttribute("aria-hidden", "true");
                    appendClones.push(clone);
                }
            }

            prependClones.forEach((clone) => trusteesCarousel.insertBefore(clone, originalCards[0]));
            appendClones.forEach((clone) => trusteesCarousel.appendChild(clone));
        };

        setupClones();

        // Fallback for arriving via a #trustees deep link: the browser animates a native
        // smooth scroll to the section (scroll-behavior: smooth) that finishes well after
        // this script runs, and — at least in Chromium — the IntersectionObserver's very
        // first callback reports "not visible yet" and then never fires again for the rest
        // of that scroll, leaving every original card stuck at opacity 0 forever. Poll on
        // scroll instead so cards get revealed the moment the section is actually in view,
        // however it got there.
        const checkAndRevealIfVisible = () => {
            const rect = trusteesCarousel.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                revealAllCards();
                revealObserver.disconnect();
                window.removeEventListener("scroll", checkAndRevealIfVisible);
                return true;
            }
            return false;
        };
        if (!checkAndRevealIfVisible()) {
            window.addEventListener("scroll", checkAndRevealIfVisible, { passive: true });
        }

        // Setup dots (one dot per original card)
        trusteesDots.innerHTML = "";
        originalCards.forEach((_, index) => {
            const dot = document.createElement("button");
            dot.className = "trustees-dot";
            dot.setAttribute("aria-label", `Go to trustee ${index + 1}`);
            dot.addEventListener("click", () => {
                goToRealIndex(index);
                restartAutoplay();
            });
            trusteesDots.appendChild(dot);
        });
        const dotEls = Array.from(trusteesDots.children);

        // Calculate card step distance (card width + flex gap)
        const getStepWidth = () => {
            const firstCard = trusteesCarousel.querySelector(".trustee-card");
            if (!firstCard) return 0;
            const cardWidth = firstCard.getBoundingClientRect().width;
            const gap = parseFloat(getComputedStyle(trusteesCarousel).gap) || 24;
            return cardWidth + gap;
        };

        // Current position state: domIndex points to element index inside trusteesCarousel
        let currentDomIndex = itemsPerPage;

        const updateTrackPosition = (animate = true) => {
            const stepWidth = getStepWidth();
            if (!animate) trusteesCarousel.style.transition = "none";
            trusteesCarousel.style.transform = `translateX(-${currentDomIndex * stepWidth}px)`;
            if (!animate) {
                void trusteesCarousel.offsetWidth; // force reflow
                trusteesCarousel.style.transition = "";
            }
        };

        const updateDots = () => {
            let realIndex = (currentDomIndex - itemsPerPage) % N;
            if (realIndex < 0) realIndex += N;
            dotEls.forEach((dot, index) => dot.classList.toggle("active", index === realIndex));
        };

        const goToDomIndex = (domIdx, animate = true) => {
            currentDomIndex = domIdx;
            updateTrackPosition(animate);
            updateDots();
        };

        const goToRealIndex = (realIdx) => {
            const targetDomIndex = realIdx + itemsPerPage;
            goToDomIndex(targetDomIndex, true);
        };

        const goToNext = () => {
            goToDomIndex(currentDomIndex + 1, true);
        };

        const goToPrev = () => {
            goToDomIndex(currentDomIndex - 1, true);
        };

        // Smooth infinite loop handling on transitionend
        trusteesCarousel.addEventListener("transitionend", (e) => {
            if (e.target !== trusteesCarousel || e.propertyName !== "transform") return;

            if (currentDomIndex >= N + itemsPerPage) {
                const overshoot = currentDomIndex - (N + itemsPerPage);
                currentDomIndex = itemsPerPage + overshoot;
                updateTrackPosition(false);
            } else if (currentDomIndex < itemsPerPage) {
                const undershoot = itemsPerPage - currentDomIndex;
                currentDomIndex = N + itemsPerPage - undershoot;
                updateTrackPosition(false);
            }
            updateDots();
        });

        trusteesPrev.addEventListener("click", () => {
            goToPrev();
            restartAutoplay();
        });

        trusteesNext.addEventListener("click", () => {
            goToNext();
            restartAutoplay();
        });

        let autoplayTimer;
        const stopAutoplay = () => clearInterval(autoplayTimer);
        const startAutoplay = () => {
            stopAutoplay();
            autoplayTimer = setInterval(goToNext, 6000);
        };
        const restartAutoplay = () => startAutoplay();

        if (carouselWrapper) {
            carouselWrapper.addEventListener("mouseenter", stopAutoplay);
            carouselWrapper.addEventListener("mouseleave", startAutoplay);

            let touchStartX = null;
            carouselWrapper.addEventListener("touchstart", (e) => {
                touchStartX = e.touches[0].clientX;
                stopAutoplay();
            }, { passive: true });

            carouselWrapper.addEventListener("touchend", (e) => {
                if (touchStartX !== null) {
                    const deltaX = e.changedTouches[0].clientX - touchStartX;
                    if (deltaX < -40) {
                        goToNext();
                    } else if (deltaX > 40) {
                        goToPrev();
                    }
                    touchStartX = null;
                }
                startAutoplay();
            }, { passive: true });
        }

        startAutoplay();

        let resizeDebounce;
        window.addEventListener("resize", () => {
            clearTimeout(resizeDebounce);
            resizeDebounce = setTimeout(() => {
                const newItemsPerPage = getItemsPerPage();
                if (newItemsPerPage !== itemsPerPage) {
                    const currentRealIndex = ((currentDomIndex - itemsPerPage) % N + N) % N;
                    setupClones();
                    currentDomIndex = currentRealIndex + itemsPerPage;
                }
                updateTrackPosition(false);
            }, 100);
        });

        // Initial alignment
        requestAnimationFrame(() => {
            updateTrackPosition(false);
            updateDots();
        });
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

                const activitiesBtn = document.querySelector('.gallery-filter-btn[data-filter="activities"]');
                if (activitiesBtn) activitiesBtn.remove();
                document.querySelectorAll('.gallery-item[data-category="activities"]').forEach(item => item.remove());
            }

            welcomePortal.style.display = "none";
            mainPortal.style.display = "block";
            mainPortal.classList.add("fade-in");
            initCounters();

            target.scrollIntoView();
        }
    }

    // Home Events & Achievers Portal Section Handler
    function initHomePortalSection() {
        const grid = document.getElementById("homePortalGrid");
        const tabEventsBtn = document.getElementById("homeTabEvents");
        const tabResultsBtn = document.getElementById("homeTabResults");
        const campusBtns = document.querySelectorAll("[data-home-campus]");
        const viewAllBtn = document.getElementById("homePortalViewAllBtn");

        if (!grid || !tabEventsBtn || !tabResultsBtn) return;

        let activeTab = "events";
        let activeCampus = "all";

        const fallbackEvents = [
            {
                id: "fb-1",
                title: "Annual Sports Championship & Athletic Meet 2026",
                description: "A grand celebration of athleticism, teamwork, and sportsmanship spanning sprint races, table tennis, and yoga.",
                event_date: "2026-02-15",
                photo_url: "/assets/campus/table-tennis.jpg",
                campus: "chiloda",
                category: "sports"
            },
            {
                id: "fb-2",
                title: "Grand Science & Robotics Innovation Expo",
                description: "Working models in AI, renewable energy, chemistry reactions, and robotic automation showcased across both campuses.",
                event_date: "2026-01-28",
                photo_url: "/assets/campus/computer-lab.jpg",
                campus: "sargasan",
                category: "science"
            },
            {
                id: "fb-3",
                title: "Morning Prayer & Yoga Assembly",
                description: "Young students gather on the lawn for morning prayer followed by guided yoga and stretching exercises.",
                event_date: "2026-01-10",
                photo_url: "/assets/campus/yoga-assembly.jpg",
                campus: "chiloda",
                category: "wellness"
            }
        ];

        const fallbackResults = [
            {
                id: "res-1",
                title: "GSEB Class 12 Science Board Topper - 99.94 PR",
                description: "Outstanding performance by Sargasan Science Campus students securing top A1 grades with 99.94 Percentile Rank.",
                result_date: "2026-05-18",
                photo_url: "/assets/campus/sargasan-building-students.jpg",
                campus: "sargasan",
                rank_badge: "🥇 99.94 PR",
                category: "board12"
            },
            {
                id: "res-2",
                title: "GUJCET State Rank Holder - Top 10 Merit List",
                description: "Sensational performance in GUJCET Engineering entrance exam with State Merit Rank 8 and 99.88 Percentile.",
                result_date: "2026-05-25",
                photo_url: "/assets/campus/computer-lab.jpg",
                campus: "sargasan",
                rank_badge: "🏆 State Rank 8",
                category: "gujcet"
            },
            {
                id: "res-3",
                title: "GSEB Class 10 Board Distinction - 98.6%",
                description: "Chiloda Secondary Campus students achieve 100% distinction pass rate with highest individual scores exceeding 98.6%.",
                result_date: "2026-05-10",
                photo_url: "/assets/campus/classroom-teaching.jpg",
                campus: "chiloda",
                rank_badge: "⭐ 98.6% Marks",
                category: "board10"
            }
        ];

        let eventsData = fallbackEvents;
        let resultsData = fallbackResults;

        const parseDate = (dStr) => {
            if (!dStr) return { month: "FEB", day: "15" };
            const d = new Date(dStr);
            return {
                month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
                day: d.getDate()
            };
        };

        const escapeHtml = (str) =>
            String(str || "").replace(/[&<>"']/g, (c) => ({
                "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
            }[c]));

        const renderHomeGrid = () => {
            const rawList = activeTab === "events" ? eventsData : resultsData;
            const list = activeTab === "events"
                ? rawList.filter((item) => item.is_published !== false && Boolean(item.photo_url))
                : rawList;

            const filtered = list.filter((item) => {
                const campus = item.campus || ((item.title + " " + (item.description || "")).toLowerCase().includes("sargasan") ? "sargasan" : "chiloda");
                return activeCampus === "all" || campus === activeCampus;
            }).slice(0, 3);

            if (filtered.length === 0) {
                grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No ${activeTab} available for selected campus.</div>`;
                return;
            }

            grid.innerHTML = filtered.map((item) => {
                const dateInfo = parseDate(item.event_date || item.result_date);
                const campus = item.campus || ((item.title + " " + (item.description || "")).toLowerCase().includes("sargasan") ? "sargasan" : "chiloda");
                const campusLabel = campus === "sargasan" ? "Sargasan Campus" : "Chiloda Campus";
                const badge = activeTab === "results" ? `<div class="portal-rank-badge">${item.rank_badge || "🏆 Achiever"}</div>` : "";
                const linkPage = activeTab === "events" ? "events.html" : "results.html";
                const btnLabel = activeTab === "events" ? "Explore Event" : "View Wall of Fame";

                return `
                    <div class="portal-card">
                        <div class="portal-card-photo">
                            ${item.photo_url
                                ? `<img src="${item.photo_url}" alt="${escapeHtml(item.title)}" loading="lazy">`
                                : `<div class="portal-card-photo-fallback"><i class="fa-solid ${activeTab === 'events' ? 'fa-calendar-days' : 'fa-trophy'}"></i></div>`}
                            <div class="portal-photo-overlay"></div>
                            <div class="portal-date-chip">
                                <span class="month">${dateInfo.month}</span>
                                <span class="day">${dateInfo.day}</span>
                            </div>
                            <div class="portal-campus-chip ${campus}">${campusLabel}</div>
                            ${badge}
                        </div>
                        <div class="portal-card-body">
                            <div class="portal-card-category">
                                <i class="fa-solid ${activeTab === 'events' ? 'fa-sparkles' : 'fa-award'}"></i> ${(item.category || activeTab).toUpperCase()}
                            </div>
                            <h3 class="portal-card-title">${escapeHtml(item.title)}</h3>
                            <p class="portal-card-desc">${escapeHtml(item.description)}</p>
                            <div class="portal-card-footer">
                                <a href="${linkPage}" class="portal-card-btn">
                                    ${btnLabel} <i class="fa-solid fa-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                `;
            }).join("");

            if (viewAllBtn) {
                if (activeTab === "events") {
                    viewAllBtn.href = "events.html";
                    viewAllBtn.innerHTML = `Explore Full Events Portal <i class="fa-solid fa-arrow-right"></i>`;
                } else {
                    viewAllBtn.href = "results.html";
                    viewAllBtn.innerHTML = `Explore Wall of Results <i class="fa-solid fa-arrow-right"></i>`;
                }
            }
        };

        // Tab Listeners
        tabEventsBtn.addEventListener("click", () => {
            tabEventsBtn.classList.add("active");
            tabResultsBtn.classList.remove("active");
            activeTab = "events";
            renderHomeGrid();
        });

        tabResultsBtn.addEventListener("click", () => {
            tabResultsBtn.classList.add("active");
            tabEventsBtn.classList.remove("active");
            activeTab = "results";
            renderHomeGrid();
        });

        // Campus Filter Listeners
        campusBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                campusBtns.forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                activeCampus = btn.getAttribute("data-home-campus");
                renderHomeGrid();
            });
        });

        // Fetch API for live data
        Promise.all([
            fetch("/api/events").then((r) => r.json()).catch(() => []),
            fetch("/api/results").then((r) => r.json()).catch(() => [])
        ]).then(([evs, res]) => {
            if (Array.isArray(evs)) {
                const photoEvents = evs.filter((e) => e.is_published !== false && Boolean(e.photo_url));
                if (photoEvents.length > 0) eventsData = photoEvents;
            }
            if (Array.isArray(res) && res.length > 0) resultsData = res;
            renderHomeGrid();
        });
    }

    initHomePortalSection();
});

