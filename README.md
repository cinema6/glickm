glickm
======
Cinema6 customer portal.

### Running a local test server

If you have installed chef, berkself and vagrant, then you can use them to fire up your own
test server, to have your own local environment with which to test.  If you have not, you
can attmpt to do so by following these [directions](https://docs.google.com/a/cinema6.com/document/d/1WxBCRHIwIczcIWVEqeOgGkBDpKy8VFVkPd6DNMwpi6o "Getting started with Chef").

**IMPORTANT: These have only been validated on Mac's and Linux environments.  Window users, don't bother.**

Steps for bringing up the test server
-------------------------------------

  1. Log on to the vpn.

  2. Update your berkshelf cookbooks.

    ```bash
    $> berks install
    ```

    You should now be able to close down the vpn.

  3. Fire up vagrant.

    ```bash
    $> vagrant up
    ```

    You may also need to separately call provision.

    ```bash
    $> vagrant provision
    ```

    You should now have a test box running on 33.33.33.20 running mongodb and the web services used by glickm and other apps (vote/content/auth).

  4. There is a grunt task to seed the database.

    ```bash
    $> grunt resetdb
    ```

    The resetdb tasks is a multi-task.  You can find the configuration under tasks/options/resetdb.js.

    You should now have a test server with some test data loaded up and ready for use.
