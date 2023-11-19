const express = require('express');
const app = express();
const port = 3000;
require('dotenv').config();

// Dynamic import for 'node-fetch'
let fetch;
import('node-fetch').then(({ default: importedFetch }) => {
    fetch = importedFetch;
}).catch(err => console.error('Failed to load node-fetch:', err));

async function fetchEvents(queryParams) {
    if (!fetch) {
        throw new Error('Fetch is not initialized');
    }

    const query = new URLSearchParams(queryParams).toString();
    const hostname = process.env.HOSTNAME; // Using environment variable for hostname
    const response = await fetch(
        `https://${hostname}/api/v0/events?${query}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.AUTHORIZATION_TOKEN}` // Using environment variable for token
            }
        }
    );

    const jsonResponse = await response.json();
    return jsonResponse.result;
}

app.get('/fetch-events', async (req, res) => {
    try {
        const data = await fetchEvents(req.query);
        let totalAmountRewards = [];

        if (data && Array.isArray(data)) {
            data.forEach(item => {
                if (item.event && item.event.inputs) {
                    item.event.inputs.forEach(input => {
                        if (input.name === 'totalAmount') {
                            totalAmountRewards.push(`Total Amount Reward for user: ${input.value}`);
                        }
                    });
                }
            });

            if (totalAmountRewards.length > 0) {
                res.send(totalAmountRewards.join('\n') + '\n');
            } else {
                res.status(404).send('Total amount rewards not found\n');
            }
        } else {
            res.status(404).send('No events found\n');
        }
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).send('Error fetching events\n');
    }
});

// Starting the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
