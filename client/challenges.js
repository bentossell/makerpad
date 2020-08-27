var challenge = getElementFromURL()

$().ready(async () => {
  let items = await getTaggedProjects([challenge])
  renderProjects('#tagged-projects', items)
})