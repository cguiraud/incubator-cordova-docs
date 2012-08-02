var SoundBeat = require('cordova/plugin/tizen/SoundBeat');

/* TODO: get resource path from app environment? */
var soundBeat = new SoundBeat(["./sounds/beep.wav"]);

module.exports = {

    alert: function(message, alertCallback, title, buttonName) {
        return this.confirm(message, alertCallback, title, buttonName);
    },

    confirm: function(message, confirmCallback, title, buttonLabels) {
        var index = null,
            overlayElement = null,
            popup = null,
            element = null,
            titleString = null,
            messageString = null,
            buttonString = null,
            buttonsArray = null;

        function initCss() {
            var id = 'tizen-cordova-css';
            if (document.getElementById(id))
                return;

            var rules = {
                '.ui-popupwindow-screen' :  'background: #000000; opacity: 0.4;',
                '.ui-popupwindow' : 'background: #828282; padding: 1px 1px; color: white; width: 80%; margin-left: 10%;',
                '.popup-title' : 'background: #018ccc; padding: 5px 5px;',
                '.popup-title p' : 'padding: 0px; margin: 0px; text-align: center;',
                '.popup-text' : 'background: #2d2d2d; padding: 5px 5px;',
                '.popup-text p' : 'padding: 0px; margin: 0px; text-align: center; vertical-align: middle; line-height:100px;',
                '.popup-button-bg' : 'background: #424242; padding: 5px 5px;',
                '.popup-button-bg ul' : 'list-style-type: none; width: 80%; margin-left: 10%; text-align: center; padding: 0px;',
                '.popup-button-bg li' : 'display: inline;',
                '.popup-button-bg li input' : 'border-radius: 4px 4px 4px 4px; border: 0px; background: #545454; padding: 5px 15px; color: white; min-width: 80px; margin: 0px 5px;'
            };

            var css = document.createElement('style');
            css.type = 'text/css';
            css.id = id;

            var selector = null;
            for (selector in rules) {
                css.appendChild(document.createTextNode(selector + "{ " + rules[selector] + " }"));
            }

            document.getElementsByTagName("head")[0].appendChild(css);
        }

        initCss();

        console.log ("message" , message);
        console.log ("confirmCallback" , confirmCallback);
        console.log ("title" , title);
        console.log ("buttonLabels" , buttonLabels);

        titleString = '<div class="popup-title"><p>' + title + '</p></div>';
        messageString = '<div class="popup-text"><p>' + message + '</p></div>';
        buttonString = '<div class="popup-button-bg"><ul>';

        switch(typeof(buttonLabels))
        {
        case "string":
            buttonsArray = buttonLabels.split(",");

            if (buttonsArray === null) {
                buttonsArray = buttonLabels;
            }

            for (index in buttonsArray) {
                buttonString += '<li><input id="popup-button-' + buttonsArray[index]+
                                '" type="button" value="' + buttonsArray[index] + '" /></li>';
                console.log ("index: ", index,"");
                console.log ("buttonsArray[index]: ", buttonsArray[index]);
                console.log ("buttonString: ", buttonString);
            }
            break;

        case "array":
            if (buttonsArray === null) {
                buttonsArray = buttonLabels;
            }

            for (index in buttonsArray) {
                buttonString += '<li><input id="popup-button-' + buttonsArray[index]+
                                '" type="button" value="' + buttonsArray[index] + '" /></li>';
                console.log ("index: ", index,"");
                console.log ("buttonsArray[index]: ", buttonsArray[index]);
                console.log ("buttonString: ", buttonString);
            }
            break;
        default:
            console.log ("cordova/plugin/tizen/Notification, default, buttonLabels: ", buttonLabels);
            break;
        }

        buttonString += '</ul></div>';

        overlayElement = document.createElement("div");
        overlayElement.className = 'ui-popupwindow-screen';

        overlayElement.style.zIndex = 1001;
        overlayElement.style.width = "100%";
        overlayElement.style.height = "100%";
        overlayElement.style.top = 0;
        overlayElement.style.left = 0;
        overlayElement.style.margin = 0;
        overlayElement.style.padding = 0;
        overlayElement.style.position = "absolute";

        popup = document.createElement("div");
        popup.className = "ui-popupwindow";
        popup.style.position = "fixed";
        popup.style.zIndex = 1002;
        popup.innerHTML = titleString + messageString + buttonString;

        document.body.appendChild(overlayElement);
        document.body.appendChild(popup);

        function createListener(button) {
            return function() {
                document.body.removeChild(overlayElement);
                document.body.removeChild(popup);
                confirmCallback(button.value);
            };
        }

       for (index in buttonsArray) {
           console.log ("index: ", index);

           element = document.getElementById("popup-button-" + buttonsArray[index]);
           element.addEventListener("click", createListener(element), false);
       }
    },

    vibrate: function(milliseconds) {
        console.log ("milliseconds" , milliseconds);

        if (navigator.vibrate) {
            navigator.vibrate(milliseconds);
        }
        else {
            console.log ("cordova/plugin/tizen/Notification, vibrate API does not exists");
        }
    },

    beep: function(count) {
        console.log ("count" , count);
        soundBeat.play(count);
    }
};


