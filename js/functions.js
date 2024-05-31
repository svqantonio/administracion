function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getFolderName() {
    var absoluteUrl = window.location.href;
    var url = new URL(absoluteUrl);
    var directoryPath = url.pathname.substring(0, url.pathname.lastIndexOf('/'));
    return directoryPath;
}