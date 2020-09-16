<script>
    import GlobalCss from "../GlobalCss";
    /*-- Add support for Web Components to older browsers. --*/
    import "@webcomponents/webcomponentsjs/webcomponents-loader.js";
    import '@material/mwc-top-app-bar-fixed';
    import '@material/mwc-icon-button';
    import '@material/mwc-drawer';
    import '@material/mwc-tab';
    import '@material/mwc-tab-bar';
    import '@material/mwc-icon';
    import '@material/mwc-snackbar';
    import downloadToClient from 'file-saver';
    import Dropzone from "svelte-file-dropzone";
    import Worksheet from "../components/PortraitWorksheet";
    import getNewWorksheet from "../model/worksheet";
    import LocalStorageRepository from '../repository/localStorageRepository'

    export let appSettings = {applicationName: "WARNING: Please pass appSettings from within main.js props."};
    let activeIndex;

    let snackBarElement, tabBarElement;

    function handleTabActivated(e) {
        activeIndex = tabBarElement.activeIndex;
        activeSection = activeIndex === 0 ? "Character Sheet" : "Rules";
    }

    let disabled = "";
    let showLoadPane = false;
    let firstCall = true;
    let saveAlsoDownloads = true;
    let localStorageController = new LocalStorageRepository();
    let url = new URL(window.location);
    let basePath = url.origin + url.pathname;
    let snackBarText = "Replace this with a real message";

    let {worksheet, isValid} = doInitialGameWorksheetLoad();

    let gameWorksheet = isValid ? worksheet : getNewWorksheet();
    if (url.searchParams.has('gameWorksheet')) {
        // now store it before we redirect
        localStorageController.saveGameWorksheet(gameWorksheet);
        window.location.replace(basePath);
    }
    scheduleAutosave();

    function doInitialGameWorksheetLoad() {
        let worksheet;
        let isValid = false;
        try {
            worksheet = (url.searchParams.has('gameWorksheet'))
                    ? JSON.parse(decodeURIComponent(url.searchParams.get("gameWorksheet")))
                    : localStorageController.load();
            isValid = validateGameWorksheet(worksheet);
        } catch {
            isValid = false;
        }
        return {worksheet: worksheet, isValid: isValid};
    }

    function validateGameWorksheet(worksheet) {
        let result = true;
        try {

            /* TODO: There has to be a better way.
                     like maybe a JSON DTD? */

            // for now try accessing things in a way that will throw an exception.
            let _ = "";

        } catch (err) {
            console.log(err);
            setTimeout(() => showSnackBar("Invalid data format encountered. Nothing loaded."), 250);
            result = false;
        } finally {
        }
        return result;
    }

    function handleSaveGameWorksheetClicked() {
        let blob = new Blob([JSON.stringify(gameWorksheet, null, 2)], {type: "text/plain;charset=utf-8"});
        localStorageController.saveGameWorksheet(gameWorksheet);
        showSnackBar("PortraitWorksheet saved to local storage.");
        if (true /*viewOptions.saveAlsoDownloads*/) {
            setTimeout(() => {
                let fileName = `${gameWorksheet.name}.fcgcw`;
                downloadToClient(blob, fileName);
                showSnackBar(`Sending file: ${fileName}. Check your downloads folder.`);
            }, 2000);
        }
    }

    function handleLoadWorksheetClicked() {
        showLoadPane = true;
        disabled = "disabled";
    }

    function handleNewGameWorksheetClicked() {
        gameWorksheet = getNewWorksheet();
        activeIndex = 0;
        showSnackBar("Created new worksheet.");
    }

    function handleFilesSelect(e) {
        let files = e.detail.acceptedFiles;
        const reader = new FileReader();
        reader.onload = function (e) {
            // e.target.result should contain the text
            try {
                let text = e.target.result;
                let worksheet = JSON.parse(text);
                if (validateGameWorksheet(worksheet)) {
                    setTimeout(() => showSnackBar("PortraitWorksheet loaded."), 250);
                    gameWorksheet = worksheet;
                    activeIndex = 0;
                }
            } catch (err) {
                console.log(err);
                setTimeout(() => showSnackBar("Invalid data format encountered. Nothing loaded."), 250);
            } finally {
                hideLoadPane();
            }
        };
        reader.readAsText(files[0]);
    }

    function hideLoadPane() {
        showLoadPane = false;
        disabled = "";
    }

    function handlePrintClicked() {
        setTimeout(() => window.print(), 500);
    }

    function scheduleAutosave() {
        if (!firstCall) {
            return;
        }
        firstCall = false;
        if (typeof (Storage) === "undefined") {
            return;
        } // nothing to schedule since we can't get at local storage.
        setInterval(() => localStorageController.saveGameWorksheet(gameWorksheet), 5 * 1000);
    }

    function showSnackBar(text) {
        snackBarText = text;
        snackBarElement.show();
    }

</script>
<style>
    @import "App.css";
    @import "../components/styles/PortraitPage.css";
</style>

<svelte:head>
    <title>{appSettings.applicationName}</title>

    <!-- Your application must load the Roboto and Material Icons fonts. -->
    <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Material+Icons&display=block" rel="stylesheet">
</svelte:head>

<GlobalCss/>

<main class="noprint">
    <mwc-top-app-bar-fixed>
        <div slot="title"><span>{appSettings.applicationName}</span></div>
        <mwc-tab-bar slot="actionItems" style="display: inline-block" bind:this={tabBarElement}
                     activeIndex={activeIndex} on:MDCTabBar:activated={handleTabActivated}>
            <mwc-tab label="Worksheet"></mwc-tab>
            <mwc-tab label="About"></mwc-tab>
        </mwc-tab-bar>
        <mwc-icon-button icon="note_add" slot="actionItems" on:click={handleNewGameWorksheetClicked}
                         {disabled}></mwc-icon-button>
        {#if showLoadPane}
            <mwc-icon-button icon="cancel" slot="actionItems" on:click={hideLoadPane}></mwc-icon-button>
        {:else}
            <mwc-icon-button icon="folder_open" slot="actionItems"
                             on:click={handleLoadWorksheetClicked}></mwc-icon-button>
        {/if}
        <mwc-icon-button icon="save" slot="actionItems" on:click={handleSaveGameWorksheetClicked}
                         {disabled}></mwc-icon-button>
        <mwc-icon-button icon="print" slot="actionItems" on:click={handlePrintClicked} {disabled}></mwc-icon-button>
        {#if (showLoadPane)}
            <div id="content" class="file-loader" style="height: 100%">
                <Dropzone on:drop={handleFilesSelect}
                          containerStyles="height:92vh;color:#333333; background-color:#EFEFEF;"/>
            </div>
        {:else}
            <div id="content" style="padding:0">
                {#if activeIndex === 0}
                    <Worksheet bind:gameWorksheet={gameWorksheet}/>
                {:else if activeIndex === 1}
                <div class="page">
                    Render "about" here!
                </div>
                {:else}
                    <div class="page">
                        <h3>TBD/Coming Soon</h3>
                    </div>
                {/if}
            </div>
        {/if}
        <mwc-snackbar labelText="{snackBarText}" bind:this={snackBarElement}>
            <mwc-icon-button icon="close" slot="dismiss"></mwc-icon-button>
        </mwc-snackbar>
    </mwc-top-app-bar-fixed>
</main>

<main class="printme">
    <!-- This section is intended for print rendering only. You may suppress the rendering of this entire section
         to HTML if you like, but you'll need to ensure it's been rendered right before the print dialog is invoked.
         (i.e. print() )
     -->
    <Worksheet bind:gameWorksheet={gameWorksheet}/>

</main>
