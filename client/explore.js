$().ready(async () => {
  await getCollections()
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
    .get()
    .then(snapshot => {
      if (snapshot.empty) return []
      let data = snapshot.docs.map(doc => doc.data())
      return data
    })
    .catch(error => console.log(error))
  let randomNumber = (Math.floor(Math.random() * items.length))
  items = items.filter(item => item.username)
  items = items.slice(randomNumber, randomNumber + 70)
  console.log(items)
  let pick10 = items.slice(0, 10)

  $('.div-block-932').empty()
  renderUsers('.random-users', items)
  let profileImage = getUserImage(item)
  pick10.forEach(item => {
    $('.div-block-932').append(`
      <a href="/u/${item.username}" class="link-block-74 w-inline-block">
        <img src="${profileImage}" alt=""
          class="directory-user-image">
      </a>
    `)
  })
}