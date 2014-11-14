/**
 * Created by onysko on 05.11.2014.
 */

var searchField = s('input#search');
var searchInitiated = false;
var loader = new Loader(s('#content'));
// Ajax request handle
var searchRequest;
var searchTimeout;

function  AppProductInit(response){
    if (response !== undefined) {
        if (response.table_html !== undefined) {
            s('.products_table').html(response.table_html);
        }

        if (response.pager_html !== undefined) {
            s('.table-pager').html(response.pager_html);
        }
    }
    s('.products-table').fixedHeader();
    AppProductInitTableButtons(s('.products_table'));
    AppProductInitPagerButtons(s('.table-pager'));
}

s('.products_tree').pageInit(function(obj) {
    AppProductInit();
    AppProductInitTree(obj);
    AppProductSearch(s('.products_table'));

});

function AppProductInitTableButtons(table) {
    /*s('.brand_link', table).each(function (link) {
        link.ajaxClick(function (response) {
            AppProductInit(response);
        });
    });*/

    s('.product_delete', table).each(function(link) {
        link.ajaxClick(function (response) {
            loader.hide();
            AppProductInit(response);
        }, function() {
            // Create generic loader
            loader.show('Подождите', true);
            return true;
        });
    });
}

function AppProductInitPagerButtons(pager)
{
    s('a', pager).each(function (link) {
        link.ajaxClick(function (response) {
            loader.hide();
            AppProductInit(response);
        }, function() {
            // Create generic loader
            loader.show('Подождите', true);
            return true;
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
    if (s('#company_id').length) {
        company = s('#company_id').val();
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

function AppProductInitTree(tree)
{
    tree.treeview(
        true,
        function(tree) {
            AppProductInitTree(tree);
        }
    );

    s('.open', tree).each(function(link) {
        link.href = link.a('href') + '/' + s('#company_id').val();
        link.a('href', link.href);
        link.ajaxClick(function(response) {
            s('.icon-structure').html(link.html());
            loader.hide();
            AppProductInit(response);
        }, function() {
            // Create generic loader
            loader.show('Подождите', true);
            return true;
        });
    });

    s('.product_control.material_move', tree).click(function(link) {
        var selectForm = s(".table_form");
        var selectAction = 'product/move/' + link.a('structure');

        selectForm.ajaxForm({
            'url': selectAction,
            'handler': function(respTxt){
                respTxt = JSON.parse(respTxt);
                AppProductInit(respTxt);
            }
        });

        return false;
    });

    s(".product_control.add", tree).tinyboxAjax({
        html:'html',
        renderedHandler: function(response, tb) {
            /** автоматический транслит Урл*/
            s("#Name").keyup(function(obj) {
                s("#Url").val(s("#Name").translit());
            });
            /** транслит по кнопке */
            s("#generateUrl").click(function(obj) {
                if (confirm("Вы точно хотите сгенерировать адрес?")) {
                    s("#Url").val(s("#Name").translit());
                }
            });

            s('.structure_submit_button').click(function(link) {
                var selectForm = s(".form2");
                var selectAction = 'product/structureupdate/' + link.a('structure');
                selectForm.ajaxForm({
                    'url': selectAction,
                    'handler': function(respTxt){
                        respTxt = JSON.parse(respTxt);
                        if (respTxt.tree !== undefined) {
                            s('.products_tree').html(respTxt.tree);
                            AppProductInitTree(s('.products_tree'));
                        }
                        AppProductInit(respTxt);
                        tb.close();
                    }
                });

                return false;
            });

            s(".cancel-button").click(function() {
                tb.close();
            });

        },
        beforeHandler: function() {
            loader.show('Загрузка формы', true);
            return true;
        },
        responseHandler: function() {
            loader.hide();
            return true;
        }
    });
    /**
     * обработчик редактирование новой записи
     */
    s(".product_control.editstr", tree).tinyboxAjax({
        html:'html',
        renderedHandler: function(response, tb) {
            s("#generateUrl").click(function(obj) {
                if (confirm("Вы точно хотите сгенерировать адрес?")) {
                    s("#Url").val(s("#Name").translit());
                }
            });

            s('.structure_submit_button').click(function(link) {
                var selectForm = s(".form2");
                var selectAction = 'product/structureupdate/' + link.a('structure');
                selectForm.ajaxForm({
                    'url': selectAction,
                    'handler': function(respTxt){
                        respTxt = JSON.parse(respTxt);
                        if (respTxt.tree !== undefined) {
                            s('.products_tree').html(respTxt.tree);
                            AppProductInitTree(s('.products_tree'));
                        }
                        AppProductInit(respTxt);
                        tb.close();
                    }
                });

                return false;
            });

            s(".cancel-button").click(function() {
                tb.close();
            });
        },
        beforeHandler: function() {
            loader.show('Загрузка формы', true);
            return true;
        },
        responseHandler: function() {
            loader.hide();
            return true;
        }
    });

    s(".product_control.delete").ajaxClick(function(response) {
        s(".products_tree").html(response.tree);
        s(".products_tree").treeview(
            true,
            function(tree) {
                AppProductInitTree(tree);
            }
        );
        loader.hide();
    }, function() {
        if (confirm("Вы уверены, что хотите безвозвратно удалить структуру?")) {
            loader.show('Удаление структуры', true);
            return true;
        } else {
            return false;
        }
    });
}