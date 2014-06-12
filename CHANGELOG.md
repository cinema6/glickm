# glickm ChangeLog

## beta3 (June 11, 2014)
* *[Beta3.rc1]*
  * Real org is now provided as a property on the user
    * **The Org Service will need to be deployed before this can be
      released**
* *[/Beta3.rc1]*


## beta2 (May 27, 2014)
* *[Beta2.rc1]*
  * [FEATURE]: Glickm will now respond to app events requesting the
    available screen space
  * User.org is now an object rather than a string ID
* *[/Beta2.rc1]*

## beta1 (May 8, 2014)
* *[Beta1.rc3]*
  * [FIX]: Compare old password to new when changing.
  * [FIX]: Clear password fields after submitting change.
  * [FIX]: Update current email on change email form after change.
  * [FIX]: Cannot go back to login when logged in.
  * [FIX]: firefox form input box shadow default styles removed
  * [FIX]: min page height view classes added
* *[/Beta1.rc3]*
* *[Beta1.rc2]*
  * [FIX]: Set focus to logon prompt
* *[/Beta1.rc2]*
* *[Beta1.rc1]*
  * [FEATURE]: page loading screen added
  * [FEATURE]: new preloaders and viewloaders added
  * [FIX]: login box vertically centered
  * [FIX]: c6 logo added to login box
  * [FIX]: updated cache-ctl max timeouts

* *[/Beta1.rc1]*


## alpha1 (May 2, 2014; 4:25PM EST)

* first alpha release of glickm
* putting glickm in its own bucket
* handle no application error, app uri, elite daily hardcode
* fix flashing settings gear
* changed user.username to user.email
* added change email and password page
* [FIX]: Account settings styles updated
* [FIX]: Nav dropdown style bugs fixed
* [FIX]: Password change validators
* [FEATURE]: The experience iframe is now resized to be the height of its contents
* [FEATURE]: The experience iframe now uses the height of the window to
  take up the maximum amount of available space
* [FIX]: Styles for pages, headers and footers, rewritten to work with new iframe height feature.
* [FEATURE]: The experience frame is now resized when its DOM is
  modified, not just on state changes
