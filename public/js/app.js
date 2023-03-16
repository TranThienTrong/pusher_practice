'use strict';

(function(window, $){


    // Generates an anonymous username for a user
    function getCurrentUsername() {
        const usernamePrefixes = ['kitten', 'chiwawa', 'pangolin', 'hippo', 'cheetah', 'slug'];
        var prefixIndex = Math.ceil(Math.random() * 10)% usernamePrefixes.length;

        return usernamePrefixes[prefixIndex];
    }


    /**
     * Callback function for the `user_message` event
     */
    function handleUserMessageEvent(username, payload) {
        const youOrOther = payload.username === username ? 'left' : 'right';

        //build message
        let messageTemplate = $($('.message_template').clone().html());
        messageTemplate.addClass(youOrOther);
        messageTemplate.find('.text').html(payload.message);
        messageTemplate.find('.who > em').html(payload.username);

        //append to existing messages
        $('.messages').append(messageTemplate);

        return messageTemplate.addClass('appeared');
    }

    /**
     * Sends user is typing message to the server for publishing
     */
    function publishUserTyping(username) {
        return $.post('/userTyping', {username: username}).promise();
    }

    /**
     * Sends user message to server for publishing
     */
    function publishUserMessage(username, message) {
        return $.post('/userMessage', {username: username, message: message}).promise();
    }

    function initApplication() {

        const pusher = new Pusher(PUSHER_KEY, {
            encrypted: true,
            cluster: 'ap1'
        });
        const chatChannelName = 'patecan_chat_room';
        const userIsTypingEvent = 'user_typing';
        const newMessageEvent = 'user_message';
        const currentUsername = getCurrentUsername();
        $('#username').html(currentUsername);

        var channel = pusher.subscribe(chatChannelName);
        var clearInterval = 900; //0.9 seconds
        var clearTimerId;
        channel.bind(userIsTypingEvent, function(data) {
            if(data.username !== currentUsername) {
                $('#user-is-typing').html(data.username + 'is typing...');

                clearTimeout(clearTimerId);
                clearTimerId = setTimeout(function () {
                    $('#user-is-typing').html('');
                }, clearInterval);
            }
        });


        var messageTextField = $('#message-text-field');
        var canPublish = true;
        var throttleTime = 200; //0.2 seconds

        messageTextField.on('keyup', function(event) {
            if(canPublish) {
                publishUserTyping(currentUsername)
                    .catch(console.error);

                canPublish = false;
                setTimeout(function() {
                    canPublish = true;
                }, throttleTime);
            }
        });

        //subscribe to new_message events
        channel.bind(newMessageEvent, handleUserMessageEvent.bind(null, currentUsername));

        const sendButton = $('#send-button');

        sendButton.on('click', function(event) {
            const message = messageTextField.val();

            publishUserMessage(currentUsername, message)
                .then(function() {
                    messageTextField.val('');
                })
                .catch(function() {
                    console.error.apply(console, arguments);
                });
        });
    }

    $(window).on('DOMContentLoaded', initApplication);
})(window, $);
