async function populateCompanies() {
  getUser()
  console.log(window.location.href.substring(window.location.href.lastIndexOf('/')))
  let companies = await db.collection('companies').get().then(snapshot => {
    return snapshot.docs.map(doc => doc.data())
  })

  for (company of companies) {
    $('#companies').append(`
    <a href=https://makerpad.co/company/${company.name} 
      class="m-4 p-6 flex flex-col items-center border border-gray-300 justify-center rounded-lg">
      <img class="w-10 h-10 rounded" src="${company.image}" />
      <p class="mt-2 text-blue-600">${company.name}</p>
    </a>`)
  }
}