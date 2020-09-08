var challenge = getElementFromURL()

$().ready(async () => {
  let items = await getTaggedProjects([challenge])
  await getCollections()
  renderProjects('#tagged-projects', items)
})