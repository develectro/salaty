document.addEventListener('DOMContentLoaded', () => {
    const themeSwitch = document.getElementById('checkbox');
    const body = document.body;

    // --- Theme Persistence ---

    // Function to apply the saved theme
    const applySavedTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            body.classList.add('dark-mode');
            themeSwitch.checked = true;
        } else {
            body.classList.remove('dark-mode');
            themeSwitch.checked = false;
        }
    };

    // Function to save the theme preference
    const saveThemePreference = () => {
        if (themeSwitch.checked) {
            localStorage.setItem('theme', 'dark');
            body.classList.add('dark-mode');
        } else {
            localStorage.setItem('theme', 'light');
            body.classList.remove('dark-mode');
        }
    };

    // Event listener for the theme switch
    themeSwitch.addEventListener('change', saveThemePreference);

    applySavedTheme();
});