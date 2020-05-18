'use strict'

const handler = (interaction) => {
    return new Promise((resolve, reject) => {
        // Check for parameters
        if (!interaction.parameters.hasOwnProperty('symbol')) {
            reject(new Error('missing symbol parameter for action requestDialogflow'))
        }

        // Fetch the price of the cryptocurrency
        let price = ""
        interaction.response = ""

        // Indicate the action has been performed successfully
        resolve()
    })
}

module.exports = handler
