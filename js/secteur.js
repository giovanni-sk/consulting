// ========================================
// SECTOR DETAILS JAVASCRIPT
// ========================================

document.addEventListener('DOMContentLoaded', function () {
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const sectorId = urlParams.get('id');

    // DOM Elements
    const sectorBadge = document.getElementById('sector-badge');
    const sectorTitle = document.getElementById('sector-title');
    const sectorLead = document.getElementById('sector-lead');
    const sectorContent = document.getElementById('sector-content');

    // Make sure TranslationManager is loaded
    if (typeof TranslationManager !== 'undefined') {
        
        // Function to update the page based on the sector ID and current language
        function renderSectorDetails() {
            if (!sectorId) {
                showError();
                return;
            }

            // Keys to fetch
            const keyBadge = `sectors.items.${sectorId}.badge`;
            const keyTitle = `sectors.items.${sectorId}.title`;
            const keyLead = `sectors.items.${sectorId}.details_lead`;
            const keyContent = `sectors.items.${sectorId}.details_content`;

            const badgeText = TranslationManager.getNestedValue(keyBadge);
            const titleText = TranslationManager.getNestedValue(keyTitle);
            const leadText = TranslationManager.getNestedValue(keyLead);
            const contentHTML = TranslationManager.getNestedValue(keyContent);

            if (titleText) {
                // We found the sector
                sectorBadge.textContent = badgeText || '';
                sectorTitle.textContent = titleText;
                sectorLead.textContent = leadText || '';
                
                // Content is injected as HTML because it contains tags (<p>, <ul>, <h4>)
                if (contentHTML) {
                    sectorContent.innerHTML = contentHTML;
                } else {
                    sectorContent.innerHTML = TranslationManager.currentLang === 'fr' 
                        ? "<p>Le contenu détaillé de ce secteur sera bientôt disponible.</p>"
                        : "<p>The detailed content for this sector will be available soon.</p>";
                }
                
                // Update document title
                document.title = `${titleText} - Melting Consulting`;
            } else {
                showError();
            }
        }

        function showError() {
            sectorTitle.textContent = TranslationManager.currentLang === 'fr' ? "Secteur Introuvable" : "Sector Not Found";
            sectorBadge.style.display = 'none';
            sectorLead.textContent = TranslationManager.currentLang === 'fr' 
                ? "Désolé, les informations demandées ne sont pas disponibles."
                : "Sorry, the requested information is not available.";
            sectorContent.innerHTML = `<div style="text-align: center; padding: 40px;"><a href="index.html#opportunites" class="btn-nav-cta" style="display: inline-block;">${TranslationManager.currentLang === 'fr' ? "Retour aux opportunités" : "Back to opportunities"}</a></div>`;
        }

        // Listen for language changes and re-render
        TranslationManager.onLanguageChange(() => {
            renderSectorDetails();
        });

        // Initial render
        TranslationManager.init();
        // Since init() triggers onLanguageChange which calls renderSectorDetails, we don't need to call it manually.
        // But just in case translation is already loaded synchronously:
        renderSectorDetails();

    } else {
        console.error("TranslationManager not found!");
        sectorTitle.textContent = "Erreur de chargement";
    }

});
