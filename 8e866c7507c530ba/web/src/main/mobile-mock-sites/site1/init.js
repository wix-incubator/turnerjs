//Stick here stuff you want on load

function init() {
    document.getElementById('button1').addEventListener('click', onButton1Click);
    document.getElementById('button2').addEventListener('click', onButton2Click);
    document.getElementById('button3').addEventListener('click', onButton3Click);
    document.getElementById('button4').addEventListener('click', onButton4Click);
}

function onButton1Click() {
    W.setViewportAttribute('user-scalable', 'yes');
}

function onButton2Click() {
    W.setViewportAttribute('user-scalable', 'no');
}

function onButton3Click() {
    W.setViewportAttribute('user-scalable', 'no');
}

function onButton4Click() {
    alert("button4 clicked");
}