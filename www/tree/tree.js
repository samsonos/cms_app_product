/**
 * Created by onysko on 05.11.2014.
 */

var searchField = s('input#search');
var searchInitiated = false;

// Ajax request handle
var searchRequest;
var searchTimeout;

function  AppProductInit(response){
    if (response !== undefined) {
        s('.products_table').html(response.table_html);
        s('.table-pager').html(response.pager_html);
    }
    AppProductInitTableButtons(s('.products_table'));
    AppProductInitPagerButtons(s('.table-pager'));
}

s('.products_tree').pageInit(function(obj) {
    AppProductInit();
    AppProductSearch(s('.products_table'));

    obj.treeview();
    s('.collapsable', obj).each(function(el) {
        el.addClass('collapsed');
    });
    s('.open', obj).ajaxClick(function(response) {
        AppProductInit(response);
    });
});

function AppProductInitTableButtons(table) {
    s('.brand_link', table).each(function (link) {
        link.ajaxClick(function (response) {
            AppProductInit(response);
        });
    });
}

function AppProductInitPagerButtons(pager)
{
    s('a', pager).each(function (link) {
        link.ajaxClick(function (response) {
            AppProductInit(response);
        });
    });
}

/**
 * Asynchronous material search
 * @param search Search query
 */
function AppProductSearch(table) {
    // Safely get object
    search = searchField;

    var cmsnav = 0;
    var company = 0;
    if (s('#cmsnav_id').length) {
        cmsnav = s('#cmsnav_id').val();
    }
    var page = 1;



    // Key up handler
    search.keyup(function(obj, p, e) {
        // If we have not send any search request and this is not Enter character
        if (searchRequest == undefined && e.which != 13) {
            // Reset timeout on key press
            if (searchTimeout != undefined) clearTimeout(searchTimeout);

            // Set delayed function
            searchTimeout = window.setTimeout(function() {
                // Get search input
                var keywords = obj.val();

                if (keywords.length < 2) keywords = '';

                // Disable input
                search.DOMElement.enabled = false;

                // Avoid multiple search requests
                if (!searchInitiated) {
                    // Set flag
                    searchInitiated = true;

                    // Create generic loader
                    var loader = new Loader(table);

                    // Show loader with i18n text and black bg
                    loader.show(s('.loader-text').val(), true);

                    // Perform async request to server for rendering table
                    s.ajax(s('input#search').a('controller') + cmsnav + '/' + company + '/' + keywords + '/' + page, function(response) {

                        response = JSON.parse(response);
                        //s('.products_tree').html(response.table_html);
                        AppProductInit(response);

                        loader.hide();

                        // Release flag
                        searchInitiated = false;
                    });
                }

            }, 1000);
        }
    });
}
