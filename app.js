const PMRV_DINAMICAS = {
    '1.1': 'Quanto à dinâmica dos fatos, presume-se que o condutor @@ transitava com seu veículo @@, quando atropelou um pedestre.',
    '1.2': 'Quanto à dinâmica dos fatos, presume-se que o condutor @@ transitava com seu veículo @@, quando atropelou um animal.',
    '2.1': 'Quanto à dinâmica dos fatos, presume-se que os condutores @@ transitavam com seus veículos @@ no mesmo sentido, when ocorreu abalroamento longitudinal.',
    '2.2': 'Quanto à dinâmica dos fatos, presume-se que os condutores @@ transitavam com seus veículos @@ em sentidos opostos, quando ocorreu abalroamento longitudinal.',
    '2.3': 'Quanto à dinâmica dos fatos, presume-se que o condutor @@ transitava com seu veículo @@, quando abalroou transversalmente o veículo @@.',
    '3.1': 'Quanto à dinâmica dos fatos, presume-se que os condutores @@ transitavam com seus veículos @@, quando colidiram frontalmente.',
    '3.2': 'Quanto à dinâmica dos fatos, presume-se que o condutor @@ transitava com seu veículo @@, quando colidiu na traseira do veículo @@.',
    '3.3': 'Quanto à dinâmica dos fatos, presume-se que o condutor @@ transitava com seu veículo @@, quando colidiu com outros veículos, ocasionando engavetamento.',
    '4.1': 'Quanto à dinâmica dos fatos, presume-se que o condutor @@ transitava com seu veículo @@, quando chocou-se contra um poste.',
    '4.6': 'Quanto à dinâmica dos fatos, presume-se que o condutor @@ transitava com seu veículo @@, quando chocou-se contra uma defensa.',
    '4.9': 'Quanto à dinâmica dos fatos, presume-se que o condutor @@ transitava com seu veículo @@, quando chocou-se contra [OBJETO].',
    '5.1': 'Quanto à dinâmica dos fatos, presume-se que o condutor @@ transitava com seu veículo @@, quando perdeu o controle direcional e saiu da pista.',
    '5.3': 'Quanto à dinâmica dos fatos, presume-se que o condutor @@ transitava com seu veículo @@, quando perdeu o controle direcional, saiu da pista e capotou.',
    '5.4': 'Quanto à dinâmica dos fatos, presume-se que o condutor @@ transitava com seu veículo @@, quando perdeu o controle direcional, saiu da pista e tombou.',
    '6.1': 'Quanto à dinâmica dos fatos, presume-se que o condutor @@ transitava com seu veículo @@, quando saiu da pista e chocou-se contra um poste.',
    '6.2': 'Quanto à dinâmica dos fatos, presume-se que o condutor @@ transitava com seu veículo @@, quando saiu da pista e chocou-se contra um muro.',
    '6.3': 'Quanto à dinâmica dos fatos, presume-se que o condutor @@ transitava com seu veículo @@, quando saiu da pista e chocou-se contra uma defensa.',
    '6.4': 'Quanto à dinâmica dos fatos, presume-se que o condutor @@ transitava com seu veículo @@, quando saiu da pista e chocou-se contra [OBJETO].',
    '7.1': 'Quanto à dinâmica dos fatos, presume-se que o condutor @@ transitava com seu veículo @@, registrada como [OUTROS].'
};

let currentStep = 1;
const totalSteps = 5;
let isManuallyEditingReport = false;
let finalReportText = "";

document.addEventListener('DOMContentLoaded', () => {
    pmrv_init();
    registerServiceWorker();
    updateStepper();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
});

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => console.error(err));
    }
}

// --- Validation Logic ---
function validateStep(step) {
    if (step === 1) {
        const sade = document.getElementById('pmrv_sade').value.trim();
        const vtr = document.getElementById('pmrv_vtr').value.trim();
        
        if (!sade) {
            alert("Por favor, preencha o Protocolo SADE.");
            document.getElementById('pmrv_sade').focus();
            return false;
        }
        if (vtr.length < 4) {
            alert("Por favor, preencha a Viatura (4 dígitos).");
            document.getElementById('pmrv_vtr').focus();
            return false;
        }
    }
    if (step === 2) {
        const km = document.getElementById('pmrv_km').value.trim();
        if (!km) {
            alert("Por favor, preencha o KM.");
            document.getElementById('pmrv_km').focus();
            return false;
        }
    }
    return true;
}

// --- Wizard Navigation ---
function nextStep() {
    if (!validateStep(currentStep)) return;

    if (currentStep === 3 && document.getElementById('pmrv_ocorrencia').value !== 'Sinistro de trânsito com vítima(s)') {
        currentStep = 5;
    } else if (currentStep < totalSteps) {
        currentStep++;
    }
    showStep(currentStep);
    updateStepper();
}

function prevStep() {
    if (currentStep === 5 && document.getElementById('pmrv_ocorrencia').value !== 'Sinistro de trânsito com vítima(s)') {
        currentStep = 3;
    } else if (currentStep > 1) {
        currentStep--;
    }
    showStep(currentStep);
    updateStepper();
}

function showStep(step) {
    document.querySelectorAll('.step-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(`step-${step}`).classList.remove('hidden');
    if (step === 5) {
        isManuallyEditingReport = false;
        pmrv_atualizar();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateStepper() {
    const progress = document.getElementById('stepper-progress');
    const dots = document.querySelectorAll('.step-dot');
    const ehVitima = document.getElementById('pmrv_ocorrencia').value === 'Sinistro de trânsito com vítima(s)';
    
    document.getElementById('dot-vitimas').classList.toggle('hidden', !ehVitima);
    
    const stepsMap = ehVitima ? [1, 2, 3, 4, 5] : [1, 2, 3, 5];
    const activeIndex = stepsMap.indexOf(currentStep);
    const totalActive = stepsMap.length;
    
    progress.style.width = ((activeIndex) / (totalActive - 1)) * 100 + '%';

    dots.forEach(dot => {
        const stepNum = parseInt(dot.getAttribute('data-step'));
        if (stepNum === currentStep) {
            dot.classList.replace('bg-gray-300', 'bg-pmrv');
            dot.classList.replace('bg-green-500', 'bg-pmrv');
        } else if (stepsMap.indexOf(stepNum) < activeIndex && stepsMap.indexOf(stepNum) !== -1) {
            dot.classList.replace('bg-gray-300', 'bg-green-500');
            dot.classList.replace('bg-pmrv', 'bg-green-500');
        } else {
            dot.classList.replace('bg-pmrv', 'bg-gray-300');
            dot.classList.replace('bg-green-500', 'bg-gray-300');
        }
    });
}

// --- Voice Logic ---
function startVoiceCommandStep1() {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Seu navegador não suporta comando de voz.");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    
    const micBtn = document.getElementById('mic-btn-step1');
    
    recognition.onstart = () => micBtn.classList.add('recording-active');
    recognition.onend = () => micBtn.classList.remove('recording-active');
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log("Voz capturada:", transcript);

        // Regex para capturar Protocolo (números após a palavra protocolo)
        const protocoloMatch = transcript.match(/protocolo\s*(\d+)/);
        if (protocoloMatch) {
            document.getElementById('pmrv_sade').value = protocoloMatch[1];
        }

        // Regex para capturar Viatura (números após a palavra viatura)
        const viaturaMatch = transcript.match(/viatura\s*(\d+)/);
        if (viaturaMatch) {
            const vtrInput = document.getElementById('pmrv_vtr');
            vtrInput.value = viaturaMatch[1].substring(0, 4);
            localStorage.setItem('PMRV_VTR', vtrInput.value);
        }

        // Lógica para Conhecimento
        const selectConhc = document.getElementById('pmrv_conhecimento');
        if (transcript.includes('central')) {
            selectConhc.value = 'pela Central';
        } else if (transcript.includes('populares')) {
            selectConhc.value = 'por populares';
        } else if (transcript.includes('guarnição') || transcript.includes('guarnicao') || transcript.includes('deparou')) {
            selectConhc.value = 'pela guarnição';
        }

        pmrv_atualizar();
    };

    recognition.start();
}

function startVoiceCommandStep2() {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Seu navegador não suporta comando de voz.");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    
    const micBtn = document.getElementById('mic-btn-step2');
    
    recognition.onstart = () => micBtn.classList.add('recording-active');
    recognition.onend = () => micBtn.classList.remove('recording-active');
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log("Voz capturada (Passo 2):", transcript);

        // Lógica para Rodovia (Ex: "rodovia 401")
        const rodoviaMatch = transcript.match(/rodovia\s*(\d+)/);
        if (rodoviaMatch) {
            const num = rodoviaMatch[1];
            const rodSelect = document.getElementById('pmrv_rodovia');
            const rodValue = `SC-${num}`;
            
            // Verifica se a opção existe no select
            for (let i = 0; i < rodSelect.options.length; i++) {
                if (rodSelect.options[i].value === rodValue) {
                    rodSelect.selectedIndex = i;
                    pmrv_verificarRodovia();
                    break;
                }
            }
        }

        // Lógica para KM (Ex: "quilômetro 22" ou "km 22")
        const kmMatch = transcript.match(/(?:quilômetro|km)\s*(\d+)/);
        if (kmMatch) {
            let num = kmMatch[1];
            // Se falar apenas 2 dígitos, completa com zeros no formato XX,000
            if (num.length === 2) {
                num = num + "000";
            }
            
            const kmInput = document.getElementById('pmrv_km');
            // Aplica a lógica da máscara (XX,XXX)
            let value = num.substring(0, 5);
            if (value.length > 2) {
                value = value.substring(0, 2) + ',' + value.substring(2);
            }
            kmInput.value = value;
        }

        // Lógica para Sentido da Via
        const sentidoSelect = document.getElementById('pmrv_sentido');
        if (transcript.includes('crescente')) {
            sentidoSelect.value = 'Crescente';
        } else if (transcript.includes('decrescente') || transcript.includes('descrencente')) {
            sentidoSelect.value = 'Decrescente';
        } else if (transcript.includes('bairro')) {
            sentidoSelect.value = 'Centro–Bairro';
        } else if (transcript.includes('centro')) {
            sentidoSelect.value = 'Bairro–Centro';
        } else if (transcript.includes('norte')) {
            sentidoSelect.value = 'Norte–Sul';
        } else if (transcript.includes('sul')) {
            sentidoSelect.value = 'Sul–Norte';
        }
        pmrv_toggleSentidoManual();

        pmrv_atualizar();
    };

    recognition.start();
}

function startVoiceRecognition(targetId) {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Seu navegador não suporta comando de voz.");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    
    const micBtn = document.getElementById('mic-btn');
    
    recognition.onstart = () => micBtn.classList.add('recording-active');
    recognition.onend = () => micBtn.classList.remove('recording-active');
    
    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        const field = document.getElementById(targetId);
        field.value += (field.value ? ' ' : '') + text;
        pmrv_atualizar();
    };

    recognition.start();
}

// --- Core Logic ---
function pmrv_init() {
    const vtr = localStorage.getItem('PMRV_VTR');
    if (vtr) document.getElementById('pmrv_vtr').value = vtr;
    pmrv_verificarRodovia();
    pmrv_verificarVitimas();
    pmrv_toggleSentidoManual();
    pmrv_mudarSubtipo();
}

function pmrv_validarKM(input) {
    // Remove tudo que não for dígito
    let value = input.value.replace(/\D/g, '');
    
    // Limita a 5 dígitos
    value = value.substring(0, 5);
    
    // Aplica a vírgula após os dois primeiros dígitos (se houver mais de 2)
    if (value.length > 2) {
        value = value.substring(0, 2) + ',' + value.substring(2);
    }
    
    input.value = value;
    pmrv_atualizar();
}

function pmrv_validarVtr(input) {
    input.value = input.value.replace(/\D/g, '').substring(0, 4);
    localStorage.setItem('PMRV_VTR', input.value);
    pmrv_atualizar();
}

function pmrv_verificarVitimas() {
    updateStepper();
    pmrv_atualizar();
}

function pmrv_verificarRodovia() {
    const rod = document.getElementById('pmrv_rodovia').value;
    const cidade = document.getElementById('pmrv_cidade');
    const sel407 = document.getElementById('pmrv_cidade_407');
    const sel281 = document.getElementById('pmrv_cidade_281');
    const floripaRodovias = ['SC-400','SC-401','SC-402','SC-403','SC-404','SC-405','SC-406'];
    
    sel407.classList.add('hidden');
    sel281.classList.add('hidden');
    cidade.classList.remove('bg-gray-50');

    if (floripaRodovias.includes(rod)) {
        cidade.value = 'Florianópolis/SC';
        cidade.readOnly = true;
        cidade.classList.add('bg-gray-50', 'text-gray-500');
    } else if (rod === 'SC-407') {
        sel407.classList.remove('hidden');
        cidade.value = sel407.value;
        cidade.readOnly = true;
        cidade.classList.add('bg-gray-50', 'text-gray-500');
    } else if (rod === 'SC-281') {
        sel281.classList.remove('hidden');
        cidade.value = sel281.value;
        cidade.readOnly = true;
        cidade.classList.add('bg-gray-50', 'text-gray-500');
    } else {
        cidade.readOnly = false;
        cidade.classList.remove('text-gray-500');
        if (['Florianópolis/SC', 'Biguaçu/SC', 'São José/SC'].includes(cidade.value)) cidade.value = '';
    }
    pmrv_atualizar();
}

function pmrv_selecionarCidade407() {
    document.getElementById('pmrv_cidade').value = document.getElementById('pmrv_cidade_407').value;
    pmrv_atualizar();
}

function pmrv_selecionarCidade281() {
    document.getElementById('pmrv_cidade').value = document.getElementById('pmrv_cidade_281').value;
    pmrv_atualizar();
}

function pmrv_toggleSentidoManual() {
    const manual = document.getElementById('pmrv_sentido').value === 'MANUAL';
    document.getElementById('pmrv_sentido_manual').classList.toggle('hidden', !manual);
    pmrv_atualizar();
}

function pmrv_mudarSubtipo() {
    const cod = document.getElementById('pmrv_subtipo').value;
    const objeto = document.getElementById('pmrv_nome_objeto').value || '[OBJETO]';
    const outros = document.getElementById('pmrv_descricao_outros').value || '[OUTROS]';
    document.getElementById('pmrv_box_objeto').classList.toggle('hidden', !['4.9', '6.4'].includes(cod));
    document.getElementById('pmrv_box_outros').classList.toggle('hidden', cod !== '7.1');
    let texto = PMRV_DINAMICAS[cod] || '';
    if (['4.9', '6.4'].includes(cod)) texto = texto.replace('[OBJETO]', objeto);
    if (cod === '7.1') texto = texto.replace('[OUTROS]', outros);
    document.getElementById('pmrv_dinamica_texto').value = texto;
    pmrv_atualizar();
}

function pmrv_gerarTexto(negrito = false) {
    const b = negrito ? '*' : '';
    const sade = document.getElementById('pmrv_sade').value || '---';
    const vtr = document.getElementById('pmrv_vtr').value || '---';
    const cidade = document.getElementById('pmrv_cidade').value || '---';
    const rodovia = document.getElementById('pmrv_rodovia').value || '---';
    const km = document.getElementById('pmrv_km').value || '---';
    const conhc = document.getElementById('pmrv_conhecimento').value;
    const ocorr = document.getElementById('pmrv_ocorrencia').value;
    const dinamica = document.getElementById('pmrv_dinamica_texto').value;
    const sentido = document.getElementById('pmrv_sentido').value === 'MANUAL' ? document.getElementById('pmrv_sentido_manual').value : document.getElementById('pmrv_sentido').value;
    
    const sel = document.getElementById('pmrv_subtipo');
    let tipoLabel = sel.options[sel.selectedIndex].text.split(' ').slice(1).join(' ');
    if (sel.value === '7.1') tipoLabel = document.getElementById('pmrv_descricao_outros').value || 'Outros';

    let infoV = '';
    if (ocorr === 'Sinistro de trânsito com vítima(s)') {
        const l = parseInt(document.getElementById('pmrv_qtd_leve').value) || 0;
        const g = parseInt(document.getElementById('pmrv_qtd_grave').value) || 0;
        const gs = parseInt(document.getElementById('pmrv_qtd_gravissima').value) || 0;
        
        const partes = [];
        if (l > 0) partes.push(`${String(l).padStart(2,'0')} leve(s)`);
        if (g > 0) partes.push(`${String(g).padStart(2,'0')} grave(s)`);
        if (gs > 0) partes.push(`${String(gs).padStart(2,'0')} gravíssima(s)`);
        
        if (partes.length > 0) {
            infoV = `\n${b}Vítimas:${b} ${partes.join(', ')}`;
        } else {
            infoV = `\n${b}Vítimas:${b} Sem registro de quantidades`;
        }
    }

    const hora = document.getElementById('pmrv_hora_manual').checked ? (document.getElementById('pmrv_input_hora').value || '---') : new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return `${b}COMANDO DE POLÍCIA MILITAR RODOVIÁRIA${b}\n` +
           `${b}1º BPMRv / 1ª CIA / Posto 19${b}\n` +
           `${b}Protocolo SADE:${b} ${sade}\n` +
           `${b}Data:${b} ${new Date().toLocaleDateString('pt-BR')}\n` +
           `${b}Hora:${b} ${hora}\n` +
           `${b}Rodovia:${b} ${rodovia} / ${b}KM:${b} ${km}\n` +
           `${b}Cidade:${b} ${cidade}\n` +
           `${b}Tipo de ocorrência:${b} ${ocorr}\n` +
           `${b}Tipo de sinistro:${b} ${tipoLabel}${infoV}\n\n` +
           `A guarnição foi acionada ${conhc} para atendimento de sinistro na rodovia ${rodovia}, km ${km}, sentido ${sentido || '---'}, sendo empenhada a Viatura PM-${vtr}.\n` +
           `${dinamica}\n\n` +
           `Foram adotadas as providências administrativas cabíveis.`;
}

function pmrv_atualizar() {
    if (!isManuallyEditingReport) {
        finalReportText = pmrv_gerarTexto(true); // Always generate with bold asterisks
        const elEdit = document.getElementById('pmrv_relatorio_edit');
        if (elEdit) elEdit.value = finalReportText;
    }
}

function pmrv_syncManualEdit(textarea) {
    isManuallyEditingReport = true;
    finalReportText = textarea.value;
}

function pmrv_enviarWhatsApp() {
    // Pega exatamente o que está na caixa de edição (Relatório Completo)
    const textToSend = document.getElementById('pmrv_relatorio_edit').value || finalReportText;
    window.open('https://wa.me/?text=' + encodeURIComponent(textToSend), '_blank');
}

function pmrv_copiarPMSC() {
    // Pega exatamente o que está na caixa de edição (Relatório Completo)
    const textWithBold = document.getElementById('pmrv_relatorio_edit').value || finalReportText;
    
    // REMOVE ABSOLUTAMENTE TODOS OS ASTERISCOS (*) PARA O PMSC MOBILE
    const cleanText = textWithBold.replace(/\*/g, '');
    
    navigator.clipboard.writeText(cleanText).then(() => {
        alert("RELATÓRIO COMPLETO COPIADO!\n\nO texto foi limpo (sem asteriscos) e está pronto para colar no PMSC Mobile.");
    }).catch(err => {
        console.error('Erro ao copiar: ', err);
        alert("Erro ao copiar. Por favor, selecione o texto e copie manualmente.");
    });
}

function pmrv_limpar() {
    if (confirm('Deseja iniciar uma nova ocorrência? Todos os dados serão perdidos.')) {
        location.reload();
    }
}

function updateOnlineStatus() {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) indicator.classList.toggle('hidden', navigator.onLine);
}
