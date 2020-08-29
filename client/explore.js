$().ready(async () => {
  await getRecentProjects()
  await getRandomUsers()
})

async function getRecentProjects() {
  let items = await PROJECTS
    .orderBy("created_at", "desc")
    .limit(50)
    .get()
    .then(snapshot => {
      if (snapshot.empty) return []
      let data = snapshot.docs.map(doc => doc.data())
      return data
    })
    .catch(error => console.log(error))
  console.log(items)
  renderProjects('.recent-projects', items)
}

async function getRandomUsers() {
  let items = await USERS
    .where('profile-pic', '>', '')
    .get()
    .then(snapshot => {
      if (snapshot.empty) return []
      let data = snapshot.docs.map(doc => doc.data())
      return data
    })
    .catch(error => console.log(error))
  let randomNumber = (Math.floor(Math.random() * items.length))
  items = items.slice(randomNumber, randomNumber + 50)
  console.log(items)

  items.forEach(item => {
    if (!item.username || !item['profile-pic'] || !item['full-name']) return
    $('.random-users').append(`
      <a href="/u/${item.username}">
        <img src=${item['profile-pic']} />
        <span>${item['full-name']}</span>
      </a>
    `)
  })
}