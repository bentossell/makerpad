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
  renderProjects('.recent-projects', items)
}