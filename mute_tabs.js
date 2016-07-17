// TODO: listen for storage events instead of getting the setting each time?

function orTrue(v) {
	return v === undefined ? true : v;
}

function maybeMuteNewTab(tab) {
	chrome.storage.local.get('muteNewTabs', function(result) {
		const muteNewTabs = orTrue(result.muteNewTabs);
		const tabId = tab.id;
		if(muteNewTabs) {
			console.log("Muting new tab:", tab);
			chrome.tabs.update(tabId, {muted: true});
		} else {
			console.log("Not muting new tab:", tab);
		}
	});
}

function getOrigin(url) {
	return new URL(url).origin;
}

// TODO: remove entries when tabs are closed
const tabIdToUrl = Object.create(null);

function navigationCommitted(details) {
	if(details.frameId !== 0) {
		// Ignore navigations in subframes
		return;
	}
	const tabId = details.tabId;
	const newUrl = details.url;
	chrome.storage.local.get('muteOnOriginChange', function(result) {
		const muteOnOriginChange = orTrue(result.muteOnOriginChange);
		if(muteOnOriginChange) {
			const oldUrl = tabIdToUrl[tabId];
			console.log("Old URL:", oldUrl);
			let needMute = false;
			if(oldUrl === undefined) {
				needMute = true;
			} else {
				needMute = getOrigin(oldUrl) !== getOrigin(newUrl);
			}
			if(needMute) {
				console.log("Muting tab because new origin:", details);
				chrome.tabs.update(tabId, {muted: true});
			} else {
				console.log("Not muting tab because same origin:", details);
			}
		}
		tabIdToUrl[tabId] = newUrl;
	});
}

chrome.webNavigation.onCommitted.addListener(navigationCommitted);
chrome.tabs.onCreated.addListener(maybeMuteNewTab);
