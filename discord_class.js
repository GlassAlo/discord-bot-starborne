class bot {
    constructor(token) {
        this.token = token;
        this.client = new Discord.Client();
        this.client.on('ready', () => {
            console.log('Ready!');
        })
        this.client.login(this.token);
    }
}