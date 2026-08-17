# Security

Helper is a static site. It does not create accounts. It does not send screening answers to a server. Answers are stored only in this browser's localStorage. The service worker caches the app shell from this origin. It does not cache form answers.

The page ships a Content-Security-Policy that allows scripts, styles, and workers only from this origin. Official apply links open in a new tab. They are government sites, not this helper.

Report a vulnerability in a private GitHub security advisory on this repo. Do not open a public issue with personal SNAP or energy-help details.

Do not add analytics, trackers, or a backend that stores answers.
