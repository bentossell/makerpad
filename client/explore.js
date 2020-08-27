var tags = getParamFromURL(tags)

$().ready(async () => {
  let items = await getTaggedProjects([challenge])
  renderProjects('#tagged-projects', items)
})