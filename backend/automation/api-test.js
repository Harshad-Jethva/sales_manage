const axios = require('axios');

async function test() {
    try {
        const response = await axios.post('http://localhost:5000/generate-pdf', { order_id: 1 });
        console.log('Success:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('Error status:', error.response.status);
            console.log('Error data:', error.response.data);
        } else {
            console.log('Error message:', error.message);
        }
    }
}

test();
