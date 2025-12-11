document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const recordButton = document.getElementById('record-button');
    const chatMessages = document.getElementById('chat-messages');

    // --- Speech Recognition (Voice to Text) ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'ru-RU';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        let isRecording = false;

        recordButton.addEventListener('click', () => {
            if (isRecording) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });

        recognition.addEventListener('start', () => {
            isRecording = true;
            recordButton.textContent = '🛑'; // Stop symbol
            recordButton.classList.add('recording');
        });

        recognition.addEventListener('end', () => {
            isRecording = false;
            recordButton.textContent = '🎤'; // Microphone symbol
            recordButton.classList.remove('recording');
        });

        recognition.addEventListener('result', (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            // Automatically send the message after transcription
            sendMessage();
        });

        recognition.addEventListener('error', (event) => {
            console.error('Speech recognition error:', event.error);
            addMessageToChat(`Ошибка распознавания: ${event.error}`, 'ai');
        });

    } else {
        console.log('Speech Recognition не поддерживается в этом браузере.');
        recordButton.style.display = 'none'; // Hide button if not supported
    }

    // --- Event Listeners ---
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // --- Main Send Function ---
    async function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;

        addMessageToChat(message, 'user');
        userInput.value = ''; // Clear input
const response = await fetch('/api/yandex', {

        try {
            // FIX: The backend expects 'message', not 'prompt'
            const response = await fetch('/api/yandex', {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
               body: JSON.stringify({ prompt: message }),


            });

            if (!response.ok) {
                 // The backend sends plain text on error, not JSON
                const errorText = await response.text();
                throw new Error(errorText || 'Ошибка при запросе к AI');
            }

            const data = await response.json();
            // FIX: The backend sends 'reply', not 'response'
            const aiMessage = data.reply;
            addMessageToChat(aiMessage, 'ai');
            speak(aiMessage); // Speak the AI's response

        } catch (error) {
            console.error('Ошибка:', error);
            addMessageToChat(`Ошибка: ${error.message}`, 'ai');
        }
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
    }

    // --- UI and Speech Synthesis ---
    function addMessageToChat(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);
    }

    function speak(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ru-RU';
            speechSynthesis.speak(utterance);
        } else {
            console.log('Speech Synthesis не поддерживается в этом браузере.');
        }
    }
});
