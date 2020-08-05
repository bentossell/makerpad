let company = getCompanyFromUrl()

function getCompanyFromUrl() {
  var url = window.location.pathname
  return url.substring(url.lastIndexOf('/') + 1)
}

function followCompany(companyId) {
  updateCompany(companyId, {
    followed: true
  })
}

function unfollowCompany(companyId) {
  updateCompany(companyId, {
    followed: false
  })
}

async function updateCompany(id, object) {
  await USERS.doc(currentUser.id).collection('companies').doc(id).set(object, { merge: true })
    .then(() => console.log('user/companies updated'))
    .catch(error => handleError(error))

  await USER_COMPANY.doc(`${currentUser.id}-${id}`).set(object, { merge: true })
    .then(() => console.log('user_company updated'))
    .catch(error => handleError(error))

  object[`users.${currentUser.id}`] = object
  await COMPANY.doc(id).update(object)
    .then(() => console.log('company updated'))
    .catch(error => handleError(error))
}

$('.cc-follow-product.cc-checked').click(() => {
  unfollowCompany(company)
  $('.cc-follow-product.cc-checked').hide()
  $('.cc-follow-product.cc-unchecked').show()
})

$('.cc-follow-product.cc-unchecked').click(() => {
  followCompany(company)
  $('.cc-follow-product.cc-checked').show()
  $('.cc-follow-product.cc-unchecked').hide()
})
// $('.cc-follow-count').text(followNum);

async function populateCompanies() {
  getUser()
  console.log(window.location.href.substring(window.location.href.lastIndexOf('/')))
  let companies = await db.collection('companies').get().then(snapshot => {
    return snapshot.docs.map(doc => doc.data())
  })

  for (company of companies) {
    $('#followed-companies').append(`
    <a href=https://makerpad.co/company/${company.name} 
      class="m-4 p-6 flex flex-col items-center border border-gray-300 justify-center rounded-lg">
      <img class="w-10 h-10 rounded" src="${company.image}" />
      <p class="mt-2 text-blue-600">${company.name}</p>
    </a>`)
  }
}