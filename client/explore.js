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
    .where('profile-pic', '>', '')
    .get()
    .then(snapshot => {
      if (snapshot.empty) return []
      let data = snapshot.docs.map(doc => doc.data())
      return data
    })
    .catch(error => console.log(error))
  let randomNumber = (Math.floor(Math.random() * items.length))
  items = items.slice(randomNumber, randomNumber + 70)
  console.log(items)

  items.forEach(item => {
    if (!item.username || !item['profile-pic'] || !item['full-name'] || !item.bio) return
    $('.random-users').append(`
      <a href="/u/${item.username}" class="div-block-167 w-inline-block"><img width="40"
        src="${item['profile-pic']}"
        alt="" class="image-37 tool-img">
      <div class="div-block-168 vertical">
        <div class="div-block-169">
          <h4 class="heading-259 tool-name">${item['full-name']}</h4>
        </div>
        <div class="text-block-438 tool-tagline">${item.bio}</div>
      </div>
    </a>
    `)
  })
}