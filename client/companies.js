const COMPANY = db.collection('company')
const USER_COMPANY = db.collection('user_company')

let company = getCompanyFromUrl()

function getCompanyFromUrl() {
  var url = window.location.pathname
  return url.substring(url.lastIndexOf('/') + 1)
}

function followCompany(companyId, reverse) {
  updateCompany(companyId, {
    userId: currentUser.id,
    companyId,
    followed: reverse ? false : true
  })
}

async function updateCompany(id, object) {
  await USER_COMPANY.doc(`${currentUser.id}-${id}`).set(object, { merge: true })
    .then(() => console.log(object))
    .catch(error => handleError(error))

  await USERS.doc(currentUser.id).collection('company').doc(id).set(object, { merge: true })
    .then(() => console.log(object))
    .catch(error => handleError(error))


  // object[`users.${currentUser.id}`] = object
  // await COMPANY.doc(id).update(object)
  //   .then(() => console.log('company updated'))
  //   .catch(error => handleError(error))
}

// follow
$('.cc-follow-product.cc-unchecked').click(() => {
  followCompany(company)
  $('.cc-follow-product.cc-checked').show()
  $('.cc-follow-product.cc-unchecked').hide()
})

// unfollow
$('.cc-follow-product.cc-checked').click(() => {
  followCompany(company, true)
  $('.cc-follow-product.cc-checked').hide()
  $('.cc-follow-product.cc-unchecked').show()
})

// $('.cc-follow-count').text(followNum);

async function populateCompanies() {
  getUser()
  console.log(window.location.href.substring(window.location.href.lastIndexOf('/')))
  let companies = await COMPANY.get().then(snapshot => {
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