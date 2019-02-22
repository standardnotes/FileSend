# FileSend
## By [Standard Notes](https://standardnotes.org)

FileSend allows you to securely share files through [filesend.standardnotes.org](filesend.standardnotes.org).

Files are encrypted client-side using AES-256 encryption (via the audited [Standard File](https://standardfile.org) cryptography specification). In addition, FileSend features auto-deletion of files after first download (maximum 5 days), or after specified duration. In addition, FileSend does not log IP addresses.

## Cryptography

FileSend uses the same [audited cryptography](https://standardnotes.org/help/2/has-standard-notes-completed-a-third-party-security-audit) that Standard Notes uses to encrypt and secure user data. In particular, files are encrypted with AES-256, and authenticated with HMAC256. Encryption makes files undecipherable without the respective encryption key, and authentication ensures that files have not been tampered with or changed after upload.

FileSend will automatically generate an encryption key locally for you upon loading of the web interface. You can use this key, or erase it, and choose a key of your own.

Files are shared with a single "simple" link, which contains the encryption key within the link itself, after the hash character (#). The hash character is special in that text appearing after it is [not sent to the server](https://en.wikipedia.org/wiki/Fragment_identifier), when the URL is entered in a browser.

Files can also be shared via a base link with no encryption key contained. The encryption key would then be shared separately at the user's discretion. For example, a more vigilant user may want to share the base link on one communication channel, and the encryption key via another communication channel.

## Self-hosting

You can self-host FileSend to have your own encrypted file sharing portal. This codebase is a Ruby on Rails application, and can be hosted using traditional deployment instructions for such an application, which we will not cover here. For a comprehensive guide to self-hosting a similar Ruby on Rails application, our Standard Notes syncing server, please see (Self Hosting Standard Notes with EC2 and Nginx)[https://docs.standardnotes.org/self-hosting/self-hosting-with-ec2-and-nginx].

This application makes use of Amazon S3 for file storage.

The following environment variables are required for proper functioning. You may place these variables in a file named `.env`.

```
HOST=
DB_HOST=
DB_PORT=3306
DB_DATABASE=
DB_USERNAME=

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=

S3_BUCKET=
```

## Learn more

FileSend is built upon the foundations of FileSafe, which is a Standard Notes [extension](https://standardnotes.org/extensions) that allows attaching encrypted files to notes and uploading to a user's own cloud provider (Dropbox, Google Drive, WebDAV). FileSend currently only supports uploading to S3, however, uploading to a user's own cloud provider may be an interesting iteration.

You can learn more about Standard Notes at [standardnotes.org](https://standardnotes.org).
