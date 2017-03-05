"use strict";

function orTrue(v) {
	return typeof v === "boolean" ? v : true;
}

function assert(condition, message) {
	if(!condition) {
		throw message || "Assertion failed";
	}
}

const settings = {
	muteNewTabs:           true,
	muteOnOriginChange:    true,
	muteAllTabsOnStartup:  true,
	unmuteOnVolumeControl: true
}

// Populate settings as soon as possible
chrome.storage.local.get(['muteNewTabs', 'muteOnOriginChange', 'muteAllTabsOnStartup', 'unmuteOnVolumeControl'], function(result) {
	settings.muteNewTabs           = orTrue(result.muteNewTabs);
	settings.muteOnOriginChange    = orTrue(result.muteOnOriginChange);
	settings.muteAllTabsOnStartup  = orTrue(result.muteAllTabsOnStartup);
	settings.unmuteOnVolumeControl = orTrue(result.unmuteOnVolumeControl);

	if(settings.muteAllTabsOnStartup) {
		muteAllTabs();
	}
});

function keyChanged(key, newValue) {
	assert(typeof key === "string");
	if(settings.hasOwnProperty(key)) {
		settings[key] = orTrue(newValue);
	}
}

function storageChanged(changes, namespace) {
	for(const key in changes) {
		const storageChange = changes[key];
		console.log(
			"Storage key", key, "in namespace", namespace, "changed.",
			"Old value was", storageChange.oldValue, "; new value is", storageChange.newValue
		);
		keyChanged(key, storageChange.newValue);
	}
}

function muteTab(tabId) {
	assert(Number.isInteger(tabId));
	chrome.tabs.update(tabId, {muted: true});
}

function unmuteTab(tabId) {
	assert(Number.isInteger(tabId));
	chrome.tabs.update(tabId, {muted: false});
}

function muteAllTabs() {
	chrome.tabs.query({}, function(tabs) {
		for(const tab of tabs) {
			muteTab(tab.id);
		}
	});
}

function maybeMuteNewTab(tab) {
	const tabId = tab.id;
	if(settings.muteNewTabs) {
		console.log("Muting new tab:", tab);
		muteTab(tabId);
	} else {
		console.log("Not muting new tab:", tab);
	}
}

function getOrigin(url) {
	return new URL(url).origin;
}

// TODO: remove entries when tabs are closed
const tabIdToUrl = Object.create(null);

function navigationCommitted(details) {
	if(details.frameId !== 0) {
		// Ignore navigation in subframes
		return;
	}
	const tabId = details.tabId;
	assert(Number.isInteger(tabId));
	const newUrl = details.url;
	if(settings.muteOnOriginChange) {
		const oldUrl = tabIdToUrl[tabId];
		console.log("Old URL:", oldUrl);
		const needMute =
			oldUrl !== undefined &&
			getOrigin(oldUrl) !== getOrigin(newUrl);
		if(needMute) {
			console.log("Muting tab because new origin:", details);
			muteTab(tabId);
		} else {
			console.log("Not muting tab because same origin:", details);
		}
	}
	tabIdToUrl[tabId] = newUrl;
}

function messageFromContentScript(request, sender, sendResponse) {
	console.log("Message from content script: sender=", sender, "request=", request);
	if(request !== "unmute") {
		return;
	}
	if(!settings.unmuteOnVolumeControl) {
		return;
	}
	const tabId = sender.tab.id;
	assert(Number.isInteger(tabId));
	unmuteTab(tabId);
}

// New tabs
chrome.tabs.onCreated.addListener(maybeMuteNewTab);

// Navigation events in a tab
chrome.webNavigation.onCommitted.addListener(navigationCommitted);

// Messages from content scripts telling us to unmute
chrome.runtime.onMessage.addListener(messageFromContentScript);

// Storage events that notify us of settings changes
chrome.storage.onChanged.addListener(storageChanged);
