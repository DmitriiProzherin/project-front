let toggle = true;
let races = new Set(['HUMAN', 'DWARF', 'ELF', 'GIANT', 'ORC', 'TROLL', 'HOBBIT']);
let professions = new Set(['WARRIOR', 'ROGUE', 'SORCERER', 'CLERIC', 'PALADIN', 'NAZGUL', 'WARLOCK', 'DRUID']);
let bannedOptions = new Set(['true', 'false']);

function updateContent(row) {
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

function showSelectInACell(cell) {
    let text = cell.textContent;
    cell.textContent = null;

    let select = document.createElement('select');

    if (cell.cellIndex === 3) {
        races.forEach(el => {
            let child = document.createElement('option');
            child.textContent = el;
            if (el === text) child.selected = true;
            select.appendChild(child)
        })
    } else if (cell.cellIndex === 4) {
        professions.forEach(el => {
            let child = document.createElement('option');
            child.textContent = el;
            if (el === text) child.selected = true;
            select.appendChild(child)
        })
    } else if (cell.cellIndex === 7) {
        bannedOptions.forEach(el => {
            let child = document.createElement('option');
            child.textContent = el;
            if (el === text) child.selected = true;
            select.appendChild(child)
        })
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
        updateContent(row)

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

    let amountValue = $('#tableRowsAmountSelector').val()
    let pageValue = $('#currentPage').val()

    getPlayers(pageValue, amountValue)
}

function countPlayers() {
    return $.get("rest/players/count", function (data) {
        return parseInt(data, 10)
    })
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
                    + "<td>" + item.name + "</td>"
                    + "<td>" + item.title + "</td>"
                    + "<td>" + item.race + "</td>"
                    + "<td>" + item.profession + "</td>"
                    + "<td>" + item.level + "</td>"
                    + "<td>" + item.birthday + "</td>"
                    + "<td>" + item.banned + "</td>"
                    + "<td> " +
                    "<button class='edit-button' onclick='editPlayer(this.parentNode.parentNode, this)'><img class='edit-image' src='../img/edit.png' /></button>" +
                    "</td>"
                    + "<td> " +
                    "<button class='delete-button' onclick='deletePlayer(this.parentNode.parentNode)'> <img src='../img/delete.png'  alt='none' /></button>"
                    + "</td>"
                    + "</tr>")
        });
    });
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
        let max = countPlayers()

        if (pageValue <= max) {
            pageValue++;
            element.val(pageValue).text('#' + pageValue)
            getPlayers(pageValue - 1, amountValue)
        }
    })
})