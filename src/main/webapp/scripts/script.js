let toggle = true;
let races =['HUMAN', 'DWARF', 'ELF', 'GIANT', 'ORC', 'TROLL', 'HOBBIT'];
let professions =['WARRIOR', 'ROGUE', 'SORCERER', 'CLERIC', 'PALADIN', 'NAZGUL', 'WARLOCK', 'DRUID'];
let bannedOptions = ['true', 'false'];


function updatePlayer(row) {
    let id = row.cells[0].textContent
    let data = {};

    for (let i = 0; i < row.cells.length; i++) {
        let text = row.cells[i].textContent
        if (i === 1) {
            data['name'] = text;
        } else if (i === 2) {
            data['title'] = text;
        } else if (i === 3) {
            data['race'] = text;
        } else if (i === 4) {
            data['profession'] = text;
        } else if (i === 7) {
            data['banned'] = text;
        }
    }

    $.ajax({
        url: `rest/players/${id}`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        error: function (msg) {
            console.error(`Player ${id} wasn't updated${msg}`);
        }
    })
}

function showInputInACell(cell) {
    let text = cell.textContent;
    cell.textContent = null;

    let form = document.createElement('form');
    let input = document.createElement('input');
    input.type = 'text';
    input.value = text;
    form.appendChild(input);
    cell.appendChild(form);

}

function createSelector(array, defVal){
    let select = document.createElement('select');
    array.forEach(el => {
        let child = document.createElement('option');
        child.textContent = el;
        if (el === defVal) child.selected = true;
        select.appendChild(child)
    })
    return select;
}

function showSelectInACell(cell) {
    let text = cell.textContent;
    cell.textContent = null;
    let select;

    if (cell.cellIndex === 3) {
        select = createSelector(races, text);
    } else if (cell.cellIndex === 4) {
        select = createSelector(professions, text);
    } else if (cell.cellIndex === 7) {
        select = createSelector(bannedOptions, "")
    }

    cell.appendChild(select);
}

function saveInputInACell(cell) {
    let input = cell.querySelector('input').value;
    cell.removeChild(cell.querySelector('form'));
    cell.textContent = input;
}

function saveSelectInACell(cell) {
    let input = cell.querySelector('option:checked').value;
    cell.removeChild(cell.querySelector('select'));
    cell.textContent = input;
}

function editPlayer(row, element) {
    let button = row.cells[row.cells.length - 1].querySelector('button');
    let image = element.querySelector('img');
    let nameCell = row.cells[1]
    let titleCell = row.cells[2]
    let raceCell = row.cells[3]
    let professionCell = row.cells[4]
    let bannedCell = row.cells[7]

    if (toggle) {
        if (button) {
            button.style.display = 'none';
        } else {
            console.error('Button is not found!');
        }
        if (image) {
            image.src = '../img/save.png';
        } else {
            console.error('Image is not found!');
        }
        showInputInACell(nameCell)
        showInputInACell(titleCell)
        showSelectInACell(raceCell)
        showSelectInACell(professionCell)
        showSelectInACell(bannedCell)

        toggle = !toggle;
    } else {
        if (button) {
            button.style.display = 'inline';
        } else {
            console.error('Button is not found!')
        }
        if (image) {
            image.src = '../img/edit.png';
        } else {
            console.error('Image is not found!');
        }
        saveInputInACell(nameCell)
        saveInputInACell(titleCell)
        saveSelectInACell(raceCell)
        saveSelectInACell(professionCell)
        saveSelectInACell(bannedCell)
        updatePlayer(row)

        toggle = !toggle;
    }
}

function deletePlayer(row) {
    let id = row.cells[0].textContent

    $.ajax({
        url: `/rest/players/${id}`,
        type: 'DELETE',
        error: function (error) {
            console.error('Ошибка при выполнении DELETE запроса:', error);
        }
    });

    let amountValue = $('#tableRowsAmountSelector').val();
    let pageValue = $('#currentPage').val();

    getPlayers(pageValue, amountValue);
}

function createPlayer() {
    let form = document.getElementById('new-player-form');

    let data = {};
    let name = form.querySelector('#name').value;
    let title = form.querySelector('#title').value;
    let race = form.querySelector('#race').value;
    let profession = form.querySelector('#profession').value;
    let level = form.querySelector('#level').value;
    let birthday = new Date(form.querySelector('#birthday').value).getTime();
    let selector = form.querySelector('#banned');
    let banned = selector.options[selector.selectedIndex].textContent;

    data['name'] = name;
    data['title'] = title;
    data['race'] = race;
    data['profession'] = profession;
    data['birthday'] = birthday;
    if (banned !== "") data['banned'] = banned;
    data['level'] = level;

    $.ajax({
        url: '/rest/players',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: [
            function (response) {
                console.info(`Player was created${response}`);

                let amountValue = $('#tableRowsAmountSelector').val();
                let pageValue = $('#currentPage').val();

                getPlayers(pageValue, amountValue);
            }
        ],
        error: function (msg) {
            console.error(`Player wasn't created${msg}`);
        }
    })
}

function countPlayers() {
    let url = 'rest/players/count';
    let count = 0;
    $.ajax({
       url: url,
       type: 'GET',
       async: false,
       success: [
           function (result) {
                count = result;
           }
       ]
    });
    return count;
}

function getPlayers(pageNumber, pageSize) {
    const params = {
        pageNumber: pageNumber,
        pageSize: pageSize
    };
    $("#players-table tbody").empty()
    $.get("/rest/players", params, function (data) {
        $.each(data, function (index, item) {
            $("#players-table tbody")
                .append("<tr>"
                    + `<td>${item.id}</td>`
                    + `<td>${item.name}</td>`
                    + `<td>${item.title}</td>`
                    + `<td>${item.race}</td>`
                    + `<td>${item.profession}</td>`
                    + `<td>${item.level}</td>`
                    + `<td>${item.birthday}</td>`
                    + `<td>${item.banned}</td>`
                    + "<td> " +
                    "<button class='edit-button' onclick='editPlayer(this.parentNode.parentNode, this)'><img class='edit-image' src='../img/edit.png'  alt='whoops'/></button>" +
                    "</td>"
                    + "<td> " +
                    "<button class='delete-button' onclick='deletePlayer(this.parentNode.parentNode)'> <img src='../img/delete.png'  alt='none' /></button>"
                    + "</td>"
                    + "</tr>")
        });
    });
}

function createDropdownsForANewPlayer(){
    let raceSelector = createSelector(races, "");
    let professionSelector = createSelector(professions, "");

    raceSelector.style.width = '100%';
    raceSelector.style.padding = '8px';
    raceSelector.style.boxSizing = 'border-box';

    professionSelector.style.width = '100%';
    professionSelector.style.padding = '8px';
    professionSelector.style.boxSizing = 'border-box';

    raceSelector.id = 'race-selector';
    professionSelector.id = 'profession-selector';

    let raceLabel = document.createElement('label');
    raceLabel.textContent = 'Race:';
    raceLabel.setAttribute('for', raceSelector.id);

    let professionLabel = document.createElement('label');
    professionLabel.textContent = 'Profession:';
    professionLabel.setAttribute('for', professionSelector.id);

    let divRace = document.getElementById('div-for-race');
    divRace.appendChild(raceLabel);
    divRace.appendChild(raceSelector);

    let divProfession = document.getElementById('div-for-profession');
    divProfession.appendChild(professionLabel);
    divProfession.appendChild(professionSelector);
}
$(function () {
    getPlayers(0, 5)

    $('#tableRowsAmountSelector').on('change', function () {
        let selected = $(this).val();
        getPlayers(0, selected)
    });

    $('#prevPage').on('click', function () {
        let element = $('#currentPage')
        let pageValue = element.val()
        let amountValue = $('#tableRowsAmountSelector').val()

        if (pageValue > 1) {
            pageValue--;
            element.val(pageValue).text('#' + pageValue)
            getPlayers(pageValue - 1, amountValue)
        }
    })

    $('#nextPage').on('click', function () {
        let element = $('#currentPage')
        let pageValue = element.val()
        let amountValue = $('#tableRowsAmountSelector').val()
        let players = countPlayers();
        let max = Math.ceil(players / amountValue)
        if (pageValue < max) {
            pageValue++;
            element.val(pageValue).text('#' + pageValue)
            getPlayers(pageValue - 1, amountValue)
        }
    })

    $('#new-player-form').on('click', function () {

    });

    createDropdownsForANewPlayer();
})