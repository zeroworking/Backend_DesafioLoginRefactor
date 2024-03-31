
        const socket = io();

        socket.on('initialMessages', (messages) => {
            messages.forEach((message) => {
                displayMessage(message);
            });
        });

        socket.on('chatMessage', (message) => {
            displayMessage(message);
        });

        function sendMessage() {
            const user = document.getElementById('user').value;
            const mensaje = document.getElementById('mensaje').value;
            socket.emit('chatMessage', { user, mensaje });
            document.getElementById('mensaje').value = '';
        }

        function displayMessage(message) {
            const messageElement = document.createElement('div');
            messageElement.innerText = `${message.user}: ${message.mensaje}`;
            document.getElementById('messages').appendChild(messageElement);
        }


