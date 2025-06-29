import fs from 'fs';
import knownServers from './known_servers.json' with {type: 'json'};


const server_url = 'https://gactivityapi.37games.com/serial_exchange/server_lists?game_id=429';
async function fetchServerList() {
    try {
        const response = await fetch(server_url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        return data.data;

    } catch (error) {
        console.error('Error fetching server list:', error);
        return null;
    }
}





const serverList = await fetchServerList();

//new Servers
const newServers = serverList.filter(server => {
    return !knownServers.some(knownServer => knownServer.ID === server.ID);
});


(async () => {


    if (newServers.length > 0) {
        for(const server of newServers) {
                const start = new Date(server.START_TIME+"+08:00"); // china timezone
                const msg = `New server created: ${server.NAME} (ID: ${server.ID}) started at <t:${Math.floor(start.getTime()/1000)}:f>`;
                console.log(msg);


                const discord_webbhook = process.env.DISCORD_WEBHOOK ?? null;
                if (discord_webbhook) {
                    const webhookUrl = new URL(discord_webbhook);
                    const payload = {
                        content: msg
                    };
                    await fetch(webhookUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    })
                }
        }

        fs.writeFileSync('./known_servers.json', JSON.stringify(serverList, null, 2), 'utf-8');
    }
})();
//save to known_servers.json



