Mute New Tabs
===
Chrome allows websites to make noise with your explicit approval.  Mute New Tabs
is a Chrome extension that fixes this peculiar design mistake.  It uses Chrome's
tab muting API to automatically mute new tabs.  If needed, you can un-mute a
tab by clicking the mute/un-mute icon on the tab itself.

**Note: you must enable "Tab audio muting UI control" in `chrome://flags` to be
able to click the mute/un-mute icon on the tab.**

Besides muting new tabs, the extension also:

1.	Mutes tabs on startup, because Chrome doesn't remember which tabs were
	muted.

2.	Mutes the tab when you navigate to a different origin.

3.	Injects a [content script](https://github.com/ludios/mute-new-tabs/blob/master/unmute_content.js)
	on {youtube, vimeo, soundcloud, twitter}.com
	([and more](https://github.com/ludios/mute-new-tabs/blob/master/manifest.json#L21))
	to unmute the tab when you click on an in-page volume control.  Clicking a
   volume control shows a clear intent to change the volume, so the tab mute
   shouldn't get in the way.

All four features can be toggled in the extension's popup window:

<img src="screenshot.png" alt="Screenshot of menu showing 'Mute new tabs',
'Mute on origin change', 'Mute all tabs on startup', and
'Unmute when clicking a volume control on a page'" width="243" height="189">


## Install from the Chrome Web Store

This extension is **[available in the Chrome Web Store](https://chrome.google.com/webstore/detail/mute-new-tabs/inggmeoccpodpdhmejgmgagmmcdgdkih)**.  **Requires Chrome 55+**.

If the extension works for you, please leave a review in the store.

[How Mute New Tabs uses the permissions it requests](https://github.com/ludios/mute-new-tabs/issues/7#issue-212052383).


## Install from source

Note that if you install an extension from outside the Chrome Web Store, you'll see a
"developer mode extensions" nag popup every time you start Chrome, unless you're
using Chrome on Linux (lucky you!).  On other platforms, if you're crazy enough, you
[might be able to hexedit your Chrome binary](http://stackoverflow.com/questions/23055651/disable-developer-mode-extensions-pop-up)
to get rid of it (I have not tested this).

1.	`git clone https://github.com/ludios/mute-new-tabs`

2.	Open `chrome://flags` in Chrome.

3.	Find **Tab audio muting UI control**, click "Enable", then restart Chrome.
	(Make sure to actually restart it, not just close one window.)

4.	Open `chrome://extensions` in Chrome.

5.	Check "Developer mode" at the top-right.

6.	Click "Load unpacked extension...", then select the cloned `mute-new-tabs` directory.

7.	Check "Allow in incognito" if you also want incognito tabs to be muted by default.


## Thanks

Thanks to [rones](https://openclipart.org/user-detail/rones) for
[the keep-quiet sign](https://openclipart.org/detail/219746/keep-quiet-sign) that I've used for the extension icon.

Thanks to [@matthiasgoergens](https://github.com/matthiasgoergens) for doing the initial setup on the Chrome Web Store and paying the fee.


## The epidemic of autoplaying videos

*	[Autoplay is bad for all users](http://www.punkchip.com/autoplay-is-bad-for-all-users/)

*	[Autoplay is still bad for all users](http://www.punkchip.com/autoplay-is-still-bad-for-all-users/)

*	[Like it or not, autoplay video won](http://digiday.com/publishers/autoplay-video-beat-regular-video-sorry-guys/)

*	[Auto-play is evil](https://askleo.com/auto-play-is-evil/)
