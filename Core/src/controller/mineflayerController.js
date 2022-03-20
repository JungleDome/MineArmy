let events = [
    {
        name: 'bot.create',
        fnHandler: () => {

        }
    }, {
        name: 'test',
        fnHandler: () => {
            console.log('test event')
        }
    }
]


module.exports = {
    events: this.events
}