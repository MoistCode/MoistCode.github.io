// Constants
const BLACKLIST = "blacklist";
const WHITELIST = "whitelist";
const HOME = "home";

// URLs
const whitelistRawDataUrl =
  "https://raw.githubusercontent.com/caffeine-overload/bandinchina/master/public/assets/lists/whitelist.md";
const blacklistRawDataUrl =
  "https://raw.githubusercontent.com/caffeine-overload/bandinchina/master/public/assets/lists/blacklist.md";
const readmeURL = "./README.md";

// Regular expression used to find out where to start rendering content and where to end
const tableRegex = /<!-- RENDER START -->([\S\s]*?)<!-- RENDER END -->/;

// Uses the production URL to set the "is production" flag
const isProd =
  window.location.href.indexOf(
    "https://caffeine-overload.github.io/bandinchina"
  ) > -1;
const validHashes = [BLACKLIST, WHITELIST];

// Hash is used so sharing links using "/bandinchina#blacklist" will render the blacklist
const urlHash = window.location.hash.slice(1); // Removes the hash

let stateManagement = $("#current-page")[0];
let initialRender = true;

// Changes the state if the hash matches
if (validHashes.indexOf(urlHash) > -1) {
  stateManagement.innerText = urlHash;
}

// Obtains all of the "go-to" links
const listOfLinks = $('[data-link-type="go-to"]');

// Attaches an event listener to all of the "go-to" links
listOfLinks.each(function() {
  const link = $(this);
  const linkHash = link[0].hash;

  // Prevents re-rendering of the same "home" content
  link.click(async () => {
    // Async function is required here to wait for the markdown to render before setting the hash
    if (stateManagement.innerText !== HOME) {
      await $.get(readmeURL, renderMarkdown({ newState: HOME }));
    }

    location.href = linkHash;
  });
});

// Renders the content based on the state; mainly for sharing link wanting to render specific content
switch (stateManagement.innerText) {
  case BLACKLIST:
    // Obtains the blacklist document in the public assets and renders it on initial render
    $.get(blacklistRawDataUrl, renderMarkdown({ newState: BLACKLIST }));
    break;
  case WHITELIST:
    // Obtains the whitelist document in the public assets and renders it on initial render
    $.get(whitelistRawDataUrl, renderMarkdown({ newState: WHITELIST }));
    break;
  default:
    // Obtains the README file and renders it
    $.get(readmeURL, renderMarkdown());
    break;
}

// Obtains the whitelist document in the public assets and renders it
$("#whitelist-nav").click(e => {
  $.get(whitelistRawDataUrl, renderMarkdown({ newState: WHITELIST }));
  return false;
});

// Obtains the blacklist document in the public assets and renders it
$("#blacklist-nav").click(e => {
  $.get(blacklistRawDataUrl, renderMarkdown({ newState: BLACKLIST }));
  return false;
});

// A button that redirects to the home page
// This was refactored into a button to work in a dev environment while still maintaining the
// 	slug "/bandinchina" as the homepage
$("#home-nav").click(e => {
  location.href = `${location.origin}${location.pathname}`;
  return false;
});

function renderMarkdown(params = {}) {
  const { newState = HOME, newHash = "" } = params;

  return function(file) {
    stateManagement.innerText = newState;

    // filter the markdown table using a Regular Expression
    // this is meant to allow certain content to show up in the repo but not in the site
    // by setting the flags <!-- RENDER START --> and <!-- RENDER END -->
    const match = file.match(tableRegex);
    const tableMD =
      match.length > 1 ? match[1] : "Table wasn't loaded properly 😬";

    // render the markdown into HTML
    const render = new showdown.Converter({ tables: true }).makeHtml(tableMD);

    // replace the main content with the rendered .md
    $("#content").html(render);
    $("#content table").addClass("table table-hover");

    if (initialRender) {
      initialRender = false;
    }

    if (newState !== HOME) {
      location.href = `#${newState}`;
    }
  };
}
