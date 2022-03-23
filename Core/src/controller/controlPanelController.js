let history = []

let events = [
    {
        name: 'cp.test',
        fnHandler: (message) => {
            //Save history
            console.log(message)
        }
    },
    {
        name: 'cp.message',
        fnHandler: (message) => {
            //Save history
            history.push(message)
        }
    },
    {
        name: 'cp.messageHistory',
        fnHandler: (index, direction) => {
            if (index <= -1)
                return 
            // try {
            //     if (direction == 1) //get next
            //         if (history.length > index)
            //     else //get previous
                    
            // }
        }
    },
]


module.exports = {
    events: events
}