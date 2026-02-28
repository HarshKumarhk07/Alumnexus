const http = require('http');

http.get('http://localhost:5001/api/events', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            json.data.forEach(e => {
                console.log(`- ${e.title}: Type=${e.meetingType}, Link=${e.meetingLink}`);
            });
        } catch (e) {
            console.log(data);
        }
    });
}).on('error', (err) => {
    console.error(err);
});
