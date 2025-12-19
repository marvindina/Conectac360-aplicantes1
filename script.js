document.addEventListener('DOMContentLoaded', () => {
    
    // --- Configuration ---
    const WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/24169034/ufof8kk/';

    // --- DOM Elements ---
    const form = document.getElementById('application-form');
    const viewThankYou = document.getElementById('view-thank-you');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const btnIcon = document.getElementById('btn-icon');
    const btnSpinner = document.getElementById('btn-spinner');
    
    // --- Set Year ---
    document.getElementById('year').textContent = new Date().getFullYear();

    // --- UTM Parsing ---
    const params = new URLSearchParams(window.location.search);
    const getParam = (key) => params.get(key) || params.get(key.toUpperCase()) || params.get(key.charAt(0).toUpperCase() + key.slice(1)) || '';
    
    const utm_source = getParam('utm_source');
    const utm_medium = getParam('utm_medium');
    const utm_campaign = getParam('utm_campaign') || getParam('utm_campaing');
    const utm_term = getParam('utm_term');
    const utm_content = getParam('utm_content');
    const utm_adset = getParam('utm_adset');

    // Assign to hidden inputs
    document.getElementById('utm_source').value = utm_source;
    document.getElementById('utm_medium').value = utm_medium;
    document.getElementById('utm_campaign').value = utm_campaign;
    document.getElementById('utm_term').value = utm_term;
    document.getElementById('utm_content').value = utm_content;
    document.getElementById('utm_adset').value = utm_adset;

    // --- Form Submission ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Gather Data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // 2. Filter Logic (Internal data only)
        const education = data.educationProfession;
        const agrees = document.getElementById('agreesToVariable').checked;
        const isDisqualified = (education === 'Secundaria') || (!agrees);
        const status = isDisqualified ? 'DISQUALIFIED' : 'QUALIFIED';

        // 3. Construct Flattened Payload (Best for Zapier)
        const payload = {
            // Form Fields
            nombre_completo: data.fullName,
            edad: data.age,
            correo_electronico: data.email,
            codigo_pais: data.countryCode,
            whatsapp_local: data.whatsapp,
            whatsapp_completo: `${data.countryCode}${data.whatsapp}`,
            formacion_academica: data.educationProfession,
            acepta_comisiones: agrees ? 'SÍ' : 'NO',
            
            // Logic status
            status_filtro: status,

            // UTM Parameters (Flattened for easy mapping)
            utm_source: utm_source,
            utm_medium: utm_medium,
            utm_campaign: utm_campaign,
            utm_adset: utm_adset,
            utm_content: utm_content,
            utm_term: utm_term,

            // Technical Metadata
            source_url: window.location.href,
            user_agent: navigator.userAgent,
            timestamp: new Date().toLocaleString('es-MX', { timeZone: 'UTC' })
        };

        // 4. Update UI to Loading
        submitBtn.disabled = true;
        btnText.textContent = 'Enviando...';
        btnIcon.classList.add('hidden');
        btnSpinner.classList.remove('hidden');

        // 5. Send to Webhook (as JSON string)
        try {
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                mode: 'no-cors', // Ensures submission even if CORS is not configured on the hook
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'text/plain;charset=UTF-8'
                }
            });
        } catch (error) {
            console.error('Webhook Error:', error);
        }

        // 6. Visual feedback delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 7. Success View (Always show this as per request)
        form.style.display = 'none';
        document.getElementById('intro-card').style.display = 'none';
        viewThankYou.classList.remove('hidden');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});