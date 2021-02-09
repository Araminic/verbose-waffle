const update = document.querySelector('#update-button')

update.addEventListener('click', _ => {
    fetch('/articles', {
        method: 'put',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: 'Second Title',
            author: 'Second Author'
        })
    })
})