let table

function enableDarkMode() {
    $('body').addClass('dark')
    $('meta[name="theme-color"]').attr('content', '#212121')
}

function disableDarkMode() {
    $('body').removeClass('dark')
    $('meta[name="theme-color"]').attr('content', '#ffffff')
}

function initSidebar() {
    $('#dark-mode-switch').on('change', function () {
        if (this.checked) {
            enableDarkMode()
        } else {
            disableDarkMode()
        }
        Store.set('darkMode', this.checked)
    })

    $('#dark-mode-switch').prop('checked', Store.get('darkMode'))
}

function loadRawData() {
    return $.ajax({
        url: '../raw-data/users',
        type: 'GET',
        dataType: 'json',
        error: function () {
            toastError(i8ln('Error getting data!'), i8ln('Please check your connection.'))
        }
    })
}

function loadUsers() {
    loadRawData().done(function (result) {
        $.each(result, function(idx, value) {
            table.row.add(value)
        })
        table.draw()
        table.columns.adjust()
    }).fail(function () {
        // Wait for next retry.
        setTimeout(loadUsers, 1000)
    })
}

$(function () {
    if (Store.get('darkMode')) {
        enableDarkMode()
    }

    $('.modal').modal()

    if (serverSettings.motd) {
        showMotd(serverSettings.motdTitle, serverSettings.motdText, serverSettings.motdPages, serverSettings.showMotdAlways)
    }

    table = $('#user-table').DataTable({
        responsive: true,
        'columnDefs': [
            {
                'targets': 0,
                responsivePriority: 1,
                'data': null,
                'render': function (data, type, row) {
                    switch (data.auth_type) {
                        case 'discord':
                            return data.username
                        case 'telegram':
                            if (data.username) {
                                return `${data.first_name} (${data.username})`
                            } else {
                                return data.first_name
                            }
                    }
                }
            },
            {
                'targets': 1,
                responsivePriority: 2,
                'data': null,
                'render': function (data, type, row) {
                    if (type == 'display') {
                        return data.auth_type.charAt(0).toUpperCase() + data.auth_type.slice(1);
                    }
                    return data.auth_type
                }
            },
            {
                'targets': 2,
                responsivePriority: 3,
                'data': null,
                'render': function (data, type, row) {
                    return data.id
                }
            },
            {
                'targets': 3,
                responsivePriority: 5,
                'data': null,
                'render': function (data, type, row) {
                    return data.ip ? data.ip : 'Unknown'
                }
            },

            {
                'targets': 4,
                responsivePriority: 4,
                type: 'natural',
                'data': null,
                'render': function (data, type, row) {
                    if (type == 'display') {
                        return data.last_active ? timestampToDateTime(data.last_active) : 'Unknown'
                    }
                    return data.last_active ? data.last_active : 0
                }
            }
        ]
    })

    loadUsers()

    $('.dropdown-trigger').dropdown({
        constrainWidth: false,
        coverTrigger: false
    })
    $('.sidenav').sidenav({
        draggable: false
    })

    initSidebar()
})
