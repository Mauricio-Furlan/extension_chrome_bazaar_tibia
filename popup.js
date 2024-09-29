document.getElementById('start').addEventListener('click', function() {
    const vocation = document.getElementById('char').value;
    const world = document.getElementById('world').value;
    const charTracked = document.getElementById('char-tracker').value
    const loadingButton = document.getElementById('update');
    loadingButton.setAttribute('disabled', 'true')
    const currentBtnColor = loadingButton.style.backgroundColor
    loadingButton.style.backgroundColor = 'gray'
    setTimeout(() => {
        loadingButton.removeAttribute('disabled')
        loadingButton.style.backgroundColor = currentBtnColor
    }, 1500)
    chrome.alarms.clearAll(function(wasCleared) {
        if (wasCleared) {
            console.log('Todos os alarmes foram cancelados com sucesso.');
        } else {
            console.log('Falha ao cancelar todos os alarmes.');
        }
    });
    chrome.storage.local.set({ vocation: vocation, world: world, charTracked: charTracked }, function() {
        console.log('Dados armazenados: ', { vocation, world, charTracked });
        const time = 10
        chrome.alarms.create('scrapingAlarm', { periodInMinutes: time });
        console.log(`Alarme configurado para rodar o scraping a cada ${time} minutos.`);
        chrome.runtime.sendMessage({ action: 'running' }, function(response) {
            console.log('Disparando mensagem 1')
        });

    });
  });

  function matchDate(value) {
    const valueDate = new Date(value);
    const today = new Date();
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const valueDateOnly = new Date(valueDate.getFullYear(), valueDate.getMonth(), valueDate.getDate());

    return valueDateOnly.getTime() === todayDateOnly.getTime()
  }

  document.getElementById('update').addEventListener('click', function() {
      chrome.storage.local.get(['scrapedHtml'], function(result) {
          if (result.scrapedHtml) {
            const status = document.getElementById('status')
            status.innerHTML = ''
            const parser = new DOMParser();
            const doc = parser.parseFromString(result.scrapedHtml, 'text/html');
            const resultData = []

            const element = doc.querySelectorAll('.Auction');
            element.forEach(character => {
            const characterNameElement = character.querySelector('.AuctionCharacterName a');
            const characterName = characterNameElement ? characterNameElement.textContent : 'Nome não encontrado';
            
            const timeElement = character.querySelector('.AuctionTimer');
            const timestamp = timeElement.getAttribute('data-timestamp');
            const linkPage = character.querySelector('.AuctionLinks a').getAttribute('href');
            const date = new Date(timestamp * 1000);
            const formattedDate = date.toLocaleString();

            const levelText = character.textContent.match(/Level: (\d+)/);
            const characterLevel = levelText ? levelText[1] : 'Nível não encontrado';
            
            const currentBidElement = character.querySelector('.ShortAuctionDataValue b');
            const currentBid = currentBidElement ? currentBidElement.textContent : 'Oferta não encontrada';
            
            
            resultData.push({name: characterName, level: characterLevel, currentBid: currentBid, timeEnd: formattedDate, linkPage: linkPage})
        });
        if (element) {
              const charTracked = document.getElementById('char-tracker').value;
              const htmlResult = resultData.map(item => {
                  const newElement = document.createElement('div');
                  const setColor = item.name == charTracked ? 'rgb(255, 0, 0)' : '';
                  newElement.innerHTML = `
                    <div style="display: grid; grid-template-columns: auto 1fr; column-gap: 5px; row-gap: 6px; padding: 5px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
                        <div style="font-weight: bold;">Name:</div>
                        <a id="name" target="_blank" href="${item.linkPage}">${item.name}</a>
                        
                        <div style="font-weight: bold;">Level:</div>
                        <div>${item.level}</div>
                        
                        <div style="font-weight: bold;">Current Bid:</div>
                        <div>${item.currentBid}</div>
                        
                        <div style="font-weight: bold;">End Time:</div>
                        <div id="endTime">${item.timeEnd}</div>
                    </div>
                    `;
                const nameElement = newElement.querySelector('#name');
                nameElement.style.color = setColor;
                return newElement
              })
              const listResult = []
              htmlResult.forEach(item => {
                const element = item.querySelector('#name');
                if (element.hasAttribute('style')) {
                    const endTimeValue = item.querySelector('#endTime');
                    console.log('endTimeValue::: 1', matchDate(endTimeValue.textContent));
                    if (matchDate(endTimeValue)) {
                        endTimeValue.style.color = 'rgb(255, 0, 0)'
                    }
                    listResult.unshift(item);
                } else {
                    listResult.push(item)
                }
              })
            //   status.innerText = JSON.stringify(resultData, null, 4);
            listResult.forEach(item => {
                console.log(item)
                status.appendChild(item)
            });
              
          } else {
              console.log('Elemento não encontrado.');
          }
      } else {
          console.log('Nenhum HTML foi coletado.');
      }
  });

});

document.addEventListener('DOMContentLoaded', function() {
    console.log('Popup aberto! Executando código...');
    chrome.storage.local.get(['vocation', 'world', 'charTracked'], function(data) {
        const selectElement = document.getElementById('char');
        selectElement.value = data.vocation;
        const world = document.getElementById('world');
        world.value = data.world;
        const charTracked = document.getElementById('char-tracker')
        charTracked.value = data.charTracked;
        chrome.runtime.sendMessage({ action: 'running' }, function(response) {
            console.log('Disparando mensagem 2')
        });

    })
    const button = document.getElementById('update');
    if (button) {
        button.click()
    }
});
