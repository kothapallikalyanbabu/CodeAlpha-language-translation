const sourceLang = document.getElementById('source-lang');
const targetLang = document.getElementById('target-lang');
const sourceText = document.getElementById('source-text');
const targetText = document.getElementById('target-text');
const swapBtn = document.getElementById('swap-btn');
const translateBtn = document.getElementById('translate-btn');
const copySourceBtn = document.getElementById('copy-source');
const copyTargetBtn = document.getElementById('copy-target');
const speakSourceBtn = document.getElementById('speak-source');
const speakTargetBtn = document.getElementById('speak-target');

// Swap languages
swapBtn.addEventListener('click', () => {
    // Swap select values
    let tempLang = sourceLang.value;
    sourceLang.value = targetLang.value;
    targetLang.value = tempLang;

    // Swap text content
    let tempText = sourceText.value;
    sourceText.value = targetText.value;
    targetText.value = tempText;
});

// Copy functionality
const copyText = (element) => {
    if(!element.value) return;
    navigator.clipboard.writeText(element.value);
    
    // Simple visual feedback for copying
    const originalIcon = element.id === 'source-text' ? 
        copySourceBtn.innerHTML : copyTargetBtn.innerHTML;
        
    const btn = element.id === 'source-text' ? copySourceBtn : copyTargetBtn;
    btn.innerHTML = '<i class="fa-solid fa-check"></i>';
    
    setTimeout(() => {
        btn.innerHTML = originalIcon;
    }, 2000);
};

copySourceBtn.addEventListener('click', () => copyText(sourceText));
copyTargetBtn.addEventListener('click', () => copyText(targetText));

// Text-to-speech functionality
const speakText = (text, lang) => {
    if(!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);
};

speakSourceBtn.addEventListener('click', () => speakText(sourceText.value, sourceLang.value));
speakTargetBtn.addEventListener('click', () => speakText(targetText.value, targetLang.value));

// Translate function
const translate = async () => {
    let text = sourceText.value.trim();
    if(!text) {
        targetText.value = '';
        return;
    }

    let translateFrom = sourceLang.value;
    let translateTo = targetLang.value;

    // Show loading state
    targetText.setAttribute('placeholder', 'Translating...');
    targetText.value = '';
    targetText.classList.add('loading');
    translateBtn.innerText = 'Translating...';
    translateBtn.disabled = true;

    // Extract language code (e.g., 'en', 'te')
    let fromCode = translateFrom.split('-')[0];
    let toCode = translateTo.split('-')[0];
    
    // Using Google Translate free API for better accuracy (especially for regional languages)
    let apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromCode}&tl=${toCode}&dt=t&q=${encodeURIComponent(text)}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data && data[0] && data[0][0] && data[0][0][0]) {
            let translatedText = '';
            // Concatenate all parts of the translated sentences
            for (let i = 0; i < data[0].length; i++) {
                if (data[0][i][0]) translatedText += data[0][i][0];
            }
            targetText.value = translatedText;
        } else {
            targetText.value = 'Could not translate. Please try again.';
        }
    } catch (error) {
        targetText.value = 'Error in translation. Please try again later.';
        console.error('Translation error:', error);
    } finally {
        targetText.classList.remove('loading');
        targetText.setAttribute('placeholder', 'Translation will appear here...');
        translateBtn.innerText = 'Translate';
        translateBtn.disabled = false;
    }
};

translateBtn.addEventListener('click', translate);

// Allow translation with Ctrl + Enter
sourceText.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        translate();
    }
});
