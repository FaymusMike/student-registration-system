// Footer Component

const Footer = (function() {
    function render() {
        const currentYear = new Date().getFullYear();
        
        return `
            <footer class="footer mt-5 py-3 bg-light">
                <div class="container-fluid">
                    <div class="row align-items-center">
                        <div class="col-md-6">
                            <p class="mb-0 text-muted">
                                &copy; ${currentYear} UniPortal. All rights reserved.
                            </p>
                        </div>
                        <div class="col-md-6 text-md-end">
                            <a href="#" class="text-muted me-3" onclick="showPrivacyPolicy()">
                                <i class="fas fa-shield-alt me-1"></i>Privacy Policy
                            </a>
                            <a href="#" class="text-muted me-3" onclick="showTerms()">
                                <i class="fas fa-file-contract me-1"></i>Terms of Use
                            </a>
                            <a href="#" class="text-muted" onclick="showHelp()">
                                <i class="fas fa-question-circle me-1"></i>Help
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }

    function showPrivacyPolicy() {
        Utils.showToast('Privacy policy will be displayed', 'info');
    }

    function showTerms() {
        Utils.showToast('Terms of use will be displayed', 'info');
    }

    function showHelp() {
        Utils.showToast('Help center coming soon', 'info');
    }

    return {
        render,
        showPrivacyPolicy,
        showTerms,
        showHelp
    };
})();