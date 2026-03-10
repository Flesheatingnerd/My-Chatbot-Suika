document.addEventListener("DOMContentLoaded", () => {
    const chatForm = document.getElementById("chat-form");
    const userInput = document.getElementById("user-input");
    const chatMessages = document.getElementById("chat-messages");

    function addMessage(sender, message) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message");
        messageElement.classList.add(sender === "You" ? "user-message" : "bot-message");
        messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const message = userInput.value;
        if (!message) return;

        addMessage("You", message);
        userInput.value = "";

        // Display a "Thinking..." message
        addMessage("Bot", "...");

        try {
            // Send the user's message to our Vercel function
            const response = await fetch('/api/chat', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: message })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Network response was not ok');
            }

            const data = await response.json();
            const botResponse = data.response;

            // Replace the "..." with the real response
            chatMessages.lastElementChild.innerHTML = `<strong>Bot:</strong> ${botResponse}`;

        } catch (error) {
            console.error('Error:', error);
            // Show a friendly error message to the user
            chatMessages.lastElementChild.innerHTML = `<strong>Bot:</strong> I'm having trouble connecting right now. Please try again in a moment.`;
        }
    });
});