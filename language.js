const translations = {
    en: {
        logo: "Salaty",
        nav_home: "Home",
        nav_timings: "Timings",
        nav_settings: "Settings",
        main_title: "Prayer Timings",
        city_placeholder: "Enter city name...",
        city_loading: "Detecting location...",
        update_location_btn: "Update Location",
        sunrise: "Sunrise",
        sunset: "Sunset",
        midnight: "Midnight",
        last_third: "Last Third of Night",
        hijri_date_title: "Hijri Date",
        gregorian_date_title: "Gregorian Date",
        settings: "Settings",
        language: "Language",
    },
    ar: {
        logo: "صلاتي",
        nav_home: "الرئيسية",
        nav_timings: "المواقيت",
        nav_settings: "إعدادات",
        main_title: "مواقيت الصلاة",
        city_placeholder: "أدخل اسم المدينة...",
        city_loading: "... جاري تحديد الموقع",
        update_location_btn: "تحديث الموقع",
        sunrise: "الشروق",
        sunset: "الغروب",
        midnight: "منتصف الليل",
        last_third: "الثلث الأخير من الليل",
        hijri_date_title: "التاريخ الهجري",
        gregorian_date_title: "التاريخ الميلادي",
        settings: "الإعدادات",
        language: "اللغة",
    }
};

function switchLanguage(lang) {
    // Set document language and direction
    document.documentElement.lang = lang;
    document.body.style.direction = lang === 'ar' ? 'rtl' : 'ltr';

    // Save the selected language to localStorage
    localStorage.setItem('language', lang);

    // Translate all elements with data-key
    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.getAttribute('data-key');
        const timeKeys = {
            'sunrise': 'sunrise',
            'sunset': 'sunset',
            'midnight': 'midnight',
            'last_third': 'lastThirdStart'
        };

        if (translations[lang][key]) {
            if (timeKeys[key] && window.prayerTimes && window.prayerTimes[timeKeys[key]]) {
                element.innerText = `${window.prayerTimes[timeKeys[key]]} : ${translations[lang][key]}`;
            } else {
                element.innerText = translations[lang][key];
            }
        }
    });

    // Translate all placeholders
    document.querySelectorAll('[data-key-placeholder]').forEach(element => {
        const key = element.getAttribute('data-key-placeholder');
        if (translations[lang][key]) {
            element.placeholder = translations[lang][key];
        }
    });

    // Update the toggle button text in the navbar
    const langToggleBtn = document.getElementById('lang-toggle-btn');
    if (langToggleBtn) {
        langToggleBtn.innerText = lang === 'ar' ? 'EN' : 'AR';
    }

    // If the timings overlay is visible, re-populate it with the new language
    const timingsOverlay = document.getElementById('timings-overlay');
    if (timingsOverlay && timingsOverlay.classList.contains('visible')) {
        populateTimingsOverlay();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.getElementById('settings-btn');
    const settingsOverlay = document.getElementById('settings-overlay');
    const closeSettingsBtn = document.getElementById('close-settings');
    const timingsBtn = document.getElementById('timings-btn');
    const timingsOverlay = document.getElementById('timings-overlay');
    const closeTimingsBtn = document.getElementById('close-timings');
    const langToggleBtn = document.getElementById('lang-toggle-btn');
    const mainContent = document.querySelector('.main-content'); // Get main content element

    // Language buttons inside the settings overlay
    const langEnBtn = document.getElementById('lang-en');
    const langArBtn = document.getElementById('lang-ar');

    settingsBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent anchor link default behavior
        settingsOverlay.classList.add('visible');
    });

    const closeSettingsOverlay = () => {
        settingsOverlay.classList.remove('visible');
    };

    closeSettingsBtn.addEventListener('click', closeSettingsOverlay);
    settingsOverlay.addEventListener('click', (e) => {
        if (e.target === settingsOverlay) {
            closeSettingsOverlay();
        }
    });

    langEnBtn.addEventListener('click', () => { switchLanguageWithFade('en'); closeSettingsOverlay(); });
    langArBtn.addEventListener('click', () => { switchLanguageWithFade('ar'); closeSettingsOverlay(); });

    // Event listener for the new navbar language toggle button
    langToggleBtn.addEventListener('click', () => {
        const currentLang = document.documentElement.lang || 'ar';
        const newLang = currentLang === 'ar' ? 'en' : 'ar';
        switchLanguageWithFade(newLang);
    });
    
    // New function to handle language switching with fade effect
    function switchLanguageWithFade(lang) {
        if (!mainContent) return;

        // Fade out
        mainContent.style.opacity = '0';

        // After fade-out, change language and fade in
        setTimeout(() => {
            switchLanguage(lang); // Call the original language switching logic
            mainContent.style.opacity = '1'; // Fade in
        }, 300); // Match this duration with the CSS transition duration
    }

    // Initial language setup (ensure content is visible on load)
    if (mainContent) {
        mainContent.style.opacity = '1';
    }

    // Load saved language or default to 'ar'
    const savedLang = localStorage.getItem('language') || 'ar';
    if (savedLang !== document.documentElement.lang) {
        switchLanguage(savedLang);
    }

    // --- Timings Overlay Logic ---

    function populateTimingsOverlay() {
        const lang = document.documentElement.lang || 'ar';
        const labels = translations[lang];
        const times = window.prayerTimes;

        if (times && Object.keys(times).length > 0) {
            document.getElementById('sunrise-overlay').innerText = `${times.sunrise} : ${labels.sunrise}`;
            document.getElementById('sunset-overlay').innerText = `${times.sunset} : ${labels.sunset}`;
            document.getElementById('midnight-overlay').innerText = `${times.midnight} : ${labels.midnight}`;
            document.getElementById('lastThirdStart-overlay').innerText = `${times.lastThirdStart} : ${labels.last_third}`;
        } else {
            // Fallback if times are not loaded
            document.getElementById('sunrise-overlay').innerText = labels.sunrise;
            document.getElementById('sunset-overlay').innerText = labels.sunset;
            document.getElementById('midnight-overlay').innerText = labels.midnight;
            document.getElementById('lastThirdStart-overlay').innerText = labels.last_third;
        }
    }

    timingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        populateTimingsOverlay();
        timingsOverlay.classList.add('visible');
    });

    const closeTimingsOverlay = () => timingsOverlay.classList.remove('visible');
    closeTimingsBtn.addEventListener('click', closeTimingsOverlay);
    timingsOverlay.addEventListener('click', (e) => {
        if (e.target === timingsOverlay) closeTimingsOverlay();
    });
});