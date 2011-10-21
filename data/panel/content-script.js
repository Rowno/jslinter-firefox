self.on('message', function (scriptUrls) {
    var i = 0,
        length = 0,
        content = '';

    length = scriptUrls.length;
    for (i = 0; i < length; i += 1) {
        content += '<div class="row"><input type="checkbox" value="' + scriptUrls[i] + '" />' + scriptUrls[i] + '</div>';
    }
    
    document.getElementById('scripts').innerHTML = content;
});