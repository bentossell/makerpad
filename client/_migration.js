// migrateCompanies()
// migrateTutorials()

async function migrateCompanies() {
  let users = []
  await db.collection('user').get()
    .then(snapshot => {
      return snapshot.forEach(doc => {
        users.push(doc.data())
      })
    })

  for (let user of users) {
    if (user.companies) {
      let memberstackId = await searchMemberstackUserByEmail(user.email)
      if (!memberstackId) continue
      for (let company of user.companies) {
        let companySlug = await getItemSlug(company)
        console.log(companySlug, memberstackId)
        await db.collection('user_company').doc(`${memberstackId}-${companySlug}`).set({
          cmsId: company,
          cmsUser: user._id,
          companyId: companySlug,
          userId: memberstackId,
          followed: true
        })
      }
    }
  }
  // let memberstackId = await searchMemberstackUserByEmail(email)
  // console.log(users.length)
}

async function migrateTutorials() {
  let users = []
  await db.collection('user').get()
    .then(snapshot => {
      return snapshot.forEach(doc => {
        users.push(doc.data())
      })
    })

  for (let user of users) {
    if (user['my-list']) {
      let memberstackId = await searchMemberstackUserByEmail(user.email)
      if (!memberstackId) continue
      for (let company of user['my-list']) {
        let companySlug = await getItemSlug(company)
        console.log(companySlug, memberstackId)
        await db.collection('user_tutorial').doc(`${memberstackId}-${companySlug}`).set({
          cmsId: company,
          cmsUser: user._id,
          tutorialId: companySlug,
          userId: memberstackId,
          // watchLater: false,
          // completed: true
          watchLater: true
        })
      }
    }
  }
  // let memberstackId = await searchMemberstackUserByEmail(email)
  // console.log(users.length)
}

function getItemSlug(_id) {
  return db.collection('WEBFLOW_ITEMS').doc(_id).get()
    .then(doc => doc.data().slug)
    .catch(error => handleError(error))
}

function searchMemberstackUserByEmail(email) {
  return db.collection('memberstack_users')
    .where("email", "==", email)
    .get()
    .then(snapshot => {
      if (snapshot.size == 0) return false
      return snapshot.docs[0].id
    })
}