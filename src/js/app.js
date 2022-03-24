import * as flsFunctions from "./modules/functions.js";

flsFunctions.isWebp();

const DAILYURL = `https://www.cbr-xml-daily.ru/daily_json.js`;
let dynamic,
    sign;

function getFetchUrl(url, render) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            render(data)
        })
        .catch(console.error);
}

async function getItems(item) {
    let response = await fetch(DAILYURL);
    let data = await response.json();
    let prevDate = data.PreviousURL;
    let map = [];
    map.push(`http:${prevDate}`)
    for (let i = 1; i < 10; i++) {
        response = await fetch(prevDate);
        data = await response.json();
        prevDate = data.PreviousURL;
        map.push(`http:${prevDate}`);
    }
    getMapDate(map, item)
}

function renderTable(valute) {
    const list = document.createElement('ul');
    list.className = 'list';
    const itemHead = document.createElement('li');
    itemHead.className = 'list-item';
    itemHead.innerHTML = `
        <div class="valute">Валюта</div>
        <div class="value">Курс</div>
        <div class="percent">Изменение</div>`
    app.insertAdjacentElement('afterbegin', list);
    list.append(itemHead);
    let valutes = valute.Valute;
    for (const key in valutes) {
        let valute = valutes[key]
        const {
            CharCode,
            Name,
            Previous,
            Value,
            ID
        } = valute;

        if (Value > Previous) {
            dynamic = `down`;
            sign = `&#9660;`
        } else if (Value < Previous) {
            dynamic = `up`;
            sign = `&#9650;`
        } else {
            dynamic = ``;
            sign = ``;
        }
        const item = document.createElement('li');
        item.className = 'list-item';
        item.id = ID;
        let percent = ((Previous / Value - 1) * 100).toFixed(2);
        item.innerHTML = `
        <div class="valute">${CharCode}</div>
        <div class="value">${Value}<span class="sign"></span></div>
        <div class="percent">${percent}% <span class="sign ${dynamic}">${sign}</span></div>
        <span class="tooltiptext">${Name}</span>
    `;
        getItems(item)
        list.append(item);
        getTooltipCoursor(item)

    }
}

function getMapDate(map, list) {
    map.reverse().forEach(item => {
        fetch(item)
            .then(response => response.json())
            .then(valute => {
                let date = valute.Date.slice(0, 10).split('-').reverse().join('.');
                let valutes = valute.Valute;
                for (const key in valutes) {
                    let valute = valutes[key];
                    const {
                        CharCode,
                        Name,
                        Previous,
                        Value,
                        ID
                    } = valute;
                    if (list.id == ID) {
                        if (Value > Previous) {
                            dynamic = `down`;
                            sign = `&#9660;`
                        } else if (Value < Previous) {
                            dynamic = `up`;
                            sign = `&#9650;`
                        } else {
                            dynamic = ``;
                            sign = ``;
                        }
                        const item = document.createElement('li');
                        item.className = 'list-item list-item__select hidden';
                        item.dataset.id = ID;
                        let percent = ((Previous / Value - 1) * 100).toFixed(2);
                        item.innerHTML = `
                    <div class="valute">${CharCode} <span class="prev-date"></span></div>
                    <div class="value">${Value}<span class="sign"></span></div>
                    <div class="percent">${percent}% <span class="sign ${dynamic}">${sign}</span></div>
                    <span class="tooltiptext">${Name}</span>
                    `;
                        list.insertAdjacentElement('afterend', item);
                        getTooltipCoursor(item);

                    }

                }
            })
    })
}

function getTooltipCoursor(item) {
    item.addEventListener('mousemove', (e) => {
        let tooltips = document.querySelectorAll('.tooltiptext');
        let x = (e.pageX) + 'px',
            y = (e.pageY + 30) + 'px';
        for (var i = 0; i < tooltips.length; i++) {
            tooltips[i].style.top = y;
            tooltips[i].style.left = x;
        }
    });
}

document.addEventListener('click', (e) => {
    let target = e.target;
    let listItem = document.querySelectorAll('.list-item__select');
    listItem.forEach(item => {
        if (target.parentElement.id == item.dataset.id) {
            item.classList.toggle('hidden');
            target.parentElement.classList.toggle('active');
        }
    })
})

getFetchUrl(DAILYURL, renderTable)