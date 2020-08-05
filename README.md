# makerpad

### Updating environment variables
```
firebase functions:config:set webflow.key="REPLACE_WITH_YOUR_KEY"
firebase functions:config:set webflow.site_id="REPLACE_WITH_YOUR_SITE_ID"
```

### Links to CDN

#### Base code (Main Page)
```html
<!-- Sentry for error logging -->
<script src='https://js.sentry-cdn.com/dd1a9266f9ab4089af3422b735840179.min.js' crossorigin="anonymous"></script>
<!-- Firebase setup code -->
<script src="https://www.gstatic.com/firebasejs/7.16.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/7.16.0/firebase-analytics.js"></script>
<script src="https://www.gstatic.com/firebasejs/7.16.0/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/7.16.0/firebase-firestore.js"></script>
<script src="https://www.gstatic.com/firebasejs/7.16.0/firebase-storage.js"></script>
<script src="https://cdn.jsdelivr.net/gh/bentossell/makerpad@1.0/client/firebase.js"></script>
<script src="https://cdn.jsdelivr.net/gh/bentossell/makerpad@1.0/client/user.js"></script>
```

### Individual pages

#### Tutorials
```html
<!-- Firebase tutorial code -->
<script src="https://cdn.jsdelivr.net/gh/bentossell/makerpad@1.0/client/tutorials.js"></script>
```

#### Companies
```html
<!-- Firebase company code -->
<script src="https://cdn.jsdelivr.net/gh/bentossell/makerpad@1.0/client/companies.js"></script>
```

#### Projects
```html
<!-- Firebase project code -->
<script src="https://cdn.jsdelivr.net/gh/bentossell/makerpad@1.0/client/projects.js"></script>
```

## DOM Elements being targeted

### Users
- **#username**
- **.user-image**

### Projects
- **#wf-form-Submit-Project**

### Companies
- **#followed-companies**
