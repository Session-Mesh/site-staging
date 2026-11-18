# site-staging

Previews of the [session-mesh](https://github.com/Session-Mesh/session-mesh) showcase site
(session-mesh.com), one per open pull request that changes `site/`.

The workflow `.github/workflows/site-preview.yml` of session-mesh publishes each preview in
`pr-<number>/`, served at `https://session-mesh.github.io/site-staging/pr-<number>/`, removes it
when the pull request is closed or merged, and removes any preview not republished for 14 days.

Do not edit this repository by hand: its content is written by that workflow. Previews are not
indexed (`robots.txt`, and a `noindex` meta tag in each page).
