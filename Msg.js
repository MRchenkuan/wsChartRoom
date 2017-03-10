
function Msg() {
    this.text = arguments[0];
    this.author = null;
    this.color = arguments[-1];
    this.time =Date.now();
}

module.exports = Msg;