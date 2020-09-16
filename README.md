# Fate Worksheet Template

## About
This is a small Svelte 3 application intended to facilitate creating worksheets for Fate and derived products. 
It has a couple of items hooked up to speed up project creation.


## Using this template
1. As a github template project  you can just click the "Use This Template" button.
2. Run `npx degit jason-c-daniels/fate-worksheet-template your-project-name`
3. Download a zip of the master branch from github.
4. In the project folder run `npm install` to install the dependencies.

## Where to go from here
You'll need to modify `package.json` and `main.js` with the actual name of your application. 
(`main.js` passes it to the App component)  From there remove or edit code to begin 
coding your own application.

## Misc. Notes
MWC doesn't inherit styling/theming from MDC when 
used in your application. It overrides what MDC has by setting custom properties. 
The only way to apply a theme is to change the custom properties.

An example of this exists in `global-properties.css`.

Also, this means that sass is not needed to theme applications made with this 
template.
