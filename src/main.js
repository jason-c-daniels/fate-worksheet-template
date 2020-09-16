import App from './App';

const app = new App({
    target: document.body,
    props: {
        /* passing global application settings as a single object makes them easier to share among components
        if you're not using a store */
        appSettings: {applicationName: "Fate Core - Game Creation PortraitWorksheet"}
    }
});

export default app;