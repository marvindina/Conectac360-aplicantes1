document.addEventListener('DOMContentLoaded', () => {
    
    // --- Configuration ---
    const WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/24169034/ufof8kk/';
    const REDIRECT_URL = 'https://forms.gle/vJ3s9r4mPFnQ4oZE7';

    // --- DOM Elements ---
    const form = document.getElementById('application-form');
    const viewQualified = document.getElementById('view-qualified');
    const viewDisqualified = document.getElementById('view-disqualified');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const btnIcon = document.getElementById('btn-icon');
    const btnSpinner = document.getElementById('btn-spinner');
    
    // --- Set Year ---
    document.getElementById('year').textContent = new Date().getFullYear();

    // --- UTM Parsing ---
    const params = new URLSearchParams(window.location.search);
    const getParam = (key) => params.get(key) || params.get(key.toUpperCase()) || params.get(key.charAt(0).toUpperCase() + key.slice(1)) || '';
    
    document.getElementById('utm_source').value = getParam('utm_source');
    document.getElementById('utm_medium').value = getParam('utm_medium');
    document.getElementById('utm_campaign').value = getParam('utm_campaign') || getParam('utm_campaing'); // Handle common typo
    document.getElementById('utm_term').value = getParam('utm_term');
    document.getElementById('utm_content').value = getParam('utm_content');
    document.getElementById('utm_adset').value = getParam('utm_adset');

    // --- Form Submission ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Gather Data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // 2. Logic Filters
        const education = data.educationProfession;
        const agrees = document.getElementById('agreesToVariable').checked;

        // Disqualification Criteria
        // Removed tech check as the field is no longer present.
        const isDisqualified = (education === 'Secundaria') || (!agrees);
        const status = isDisqualified ? 'DISQUALIFIED' : 'QUALIFIED';

        // 3. Construct Payload (JSON)
        const payload = {
            nombre_completo: data.fullName,
            edad: data.age,
            correo_electronico: data.email,
            numero_whatsapp: `${data.countryCode} ${data.whatsapp}`, // Combined phone
            formacion_academica_profesion: data.educationProfession,
            acepta_esquema_variable: agrees,
            
            status_filtro: status,

            utm: {
                utm_source: data.utm_source,
                utm_medium: data.utm_medium,
                utm_campaign: data.utm_campaign,
                utm_adset: data.utm_adset,
                utm_content: data.utm_content,
                utm_term: data.utm_term
            },

            metadata: {
                user_agent: navigator.userAgent,
                timestamp: new Date().toISOString()
            }
        };

        // 4. Update UI to Loading
        submitBtn.disabled = true;
        btnText.textContent = 'Enviando...';
        btnIcon.classList.add('hidden');
        btnSpinner.classList.remove('hidden');

        // 5. Send to Webhook
        try {
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'text/plain;charset=UTF-8' // Avoid CORS preflight
                }
            });
        } catch (error) {
            console.error('Webhook error:', error);
            // Continue flow even if webhook fails (optional)
        }

        // 6. Artificial Delay for UX (800ms)
        await new Promise(resolve => setTimeout(resolve, 800));

        // 7. Switch Views
        form.style.display = 'none';
        document.getElementById('intro-card').style.display = 'none';

        if (status === 'QUALIFIED') {
            viewQualified.classList.remove('hidden');
            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = REDIRECT_URL;
            }, 2000);
        } else {
            viewDisqualified.classList.remove('hidden');
        }
    });
});