// Follow products
var url = window.location.pathname;
const itemSlug = url.substring(url.lastIndexOf('/') + 1);

MemberStack.onReady.then(async function (member) {
  if (member.loggedIn) {
    const metadata = await member.getMetaData();
    metadata.followList = metadata.followList || [];
    const followNum = metadata.followList.length || 0;
    $('.cc-follow-count').text(followNum);

    // show/hide watchlist buttons
    if (metadata.followList.indexOf(itemSlug) === -1) {
      $('.cc-follow-product.cc-checked').hide();
      console.log("not following");
    }
    else {
      console.log("following");
      $('.cc-follow-product.cc-unchecked').hide();
    }


    $('.cc-follow-product.cc-unchecked').click(function () {
      if (metadata.followList.indexOf(itemSlug) === -1) {
        metadata.followList.push(itemSlug);
        const followNum = metadata.followList.length || 0;
        metadata.followItemsNum = followNum;
        member.updateMetaData(metadata);
        $('.cc-follow-count').text(followNum);
        $('.cc-follow-product.cc-checked').show();
        $('.cc-follow-product.cc-unchecked').hide();
      }
    });
  }
});

MemberStack.onReady.then(async function (member) {

  // Checks if member is logged in
  if (member.loggedIn) {

    const metadata = await member.getMetaData();

    // If no metadata.video exists, create it in MemberStack.
    metadata.tools = metadata.tools || [];

    // Defines the webflow video ID to a const of itemID (Pull this from the CMS)
    const itemID = "{{wf {&quot;path&quot;:&quot;text-item-id&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}"

    // If they have the item ID in their profile, hide the form, show the 'completed button'
    if (metadata.tools.includes(itemID)) {
      document.getElementById('add-tool').style.display = 'none';
      document.getElementById('tool-added').style.display = 'block';
    }

    // When the button is clicked, if the itemID doesn't exist on their profile
    // add it, then push the metadata to MemberStack. 
    $('#add-tool').click(function () {

      if (metadata.tools.indexOf(itemID) === -1) {

        metadata.tools.push(itemID);

        member.updateMetaData(metadata);

      }
    });
  }
});