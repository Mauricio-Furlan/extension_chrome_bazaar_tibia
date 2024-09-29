function getVocationAndWorld(callback) {
    chrome.storage.local.get(['vocation', 'world'], function(data) {
        if (data.vocation && data.world) {
            console.log('Vocation:', data.vocation);
            console.log('World:', data.world);
            callback(data.vocation, data.world);
        } else {
            console.log('Nenhum dado encontrado.');
        }
    });
}

function performScraping(vocation, world) {
    console.log('Iniciando Scraping');

    const proxyUrl = 'https://servidor-express-utat.onrender.com/scrapping';
    const params = new URLSearchParams();
    params.append('vocation', vocation);
    params.append('world', world);

    fetch(proxyUrl, {
        method: 'POST',
        body: params
    })
    .then(response => response.text())
    .then(html => {
        chrome.storage.local.set({ scrapedHtml: html }, function() {
            console.log('HTML salvo no armazenamento local.');
        });
    })
    .catch(error => {
        console.error('Erro ao fazer scraping:', error);
    });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'running') {
        getVocationAndWorld(performScraping);
    }
});

getVocationAndWorld(performScraping);

chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === 'scrapingAlarm') {
        getVocationAndWorld(performScraping);
    }
});
