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
    s.trace('here');
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

    s('ul', obj).addClass('tree-root');

    AppProductInitTree(obj);

    AppProductSearch(s('.products_table'));

});

function AppProductPreInit(response) {
    response = JSON.parse(response);
    AppProductInit(response);
}

function AppProductInitPublishButton(obj) {
    if (confirm(obj.a('title'))) {
        s.ajax(s('a.publish_href', obj.parent()).a('href'), AppProductPreInit);
    }
}

function AppProductInitTableButtons(table) {
    s('input#published', table).click(AppProductInitPublishButton, true, true);

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

                    // Show loader with i18n text and black bg
                    loader.show(s('.loader-text').val(), true);

                    // Perform async request to server for rendering table
                    s.ajax(s('input#search').a('controller') + cmsnav + '/' + keywords + '/' + page, function(response) {

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

    var parentID;
    var childID;
    var parentName;
    var moveFlag = false;

    if (!tree.hasClass('sjs-treeview')) {
        tree = s('.sjs-treeview', tree);
    }

    $(tree.DOMElement).not('.tree-root').find('.collapsed').each(function() {
        $(this).draggable({
            revert : true,
            start : function() {
                moveFlag = false;
                s('.current-tree').removeClass('current-tree');
                $(this).parent().addClass('current-tree');
                $(".sjs-treeview:not(.current-tree, .tree-root)").droppable({
                    drop : function(event, ui) {
                        if (!$(this).hasClass('current-tree')) {
                            parentName = $(this).parent().find('a').first().text();
                            if (confirm('Вы уверены, что хотите переместить выбранную структуру в категорию ' + parentName.trim() + '?')) {
                                $(this).find('.last').removeClass('last').addClass('notlast');
                                $(this).append(ui.draggable);
                                ui.draggable.removeClass('notlast').addClass('last');
                                parentID = $(this).parent().find('.structure_id').first().text();
                                moveFlag = true;
                            }
                        }
                    },
                    activate : function() {
                        //s.trace(12345);
                        //$('.drag_here').show();
                    },
                    deactivate : function() {
                        //s.trace(123456);
                        //$('.drag_here').hide();
                    }
                });
            },
            stop : function() {
                if (moveFlag) {
                    loader.show('Перемещаю структуру', true);
                    childID = $(this).find('.structure_id').first().text();

                    s.ajax('product/movestructure/' + childID + '/' + parentID, function(response) {
                        loader.hide();
                    });
                }
            }
        });
    });

    s('.open', tree).each(function(link) {
        link.a('href', link.href);
        link.ajaxClick(function(response) {
            s('.icon-structure').html(link.html());
            s('.open').removeClass('current');
            link.addClass('current');
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

    var parent;

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
                            parent.html(respTxt.tree);
                            AppProductInitTree(parent);
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
        beforeHandler: function(link) {
            parent = link.parent(' sjs-treeview');
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
                            parent.html(respTxt.tree);
                            AppProductInitTree(parent);
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
        beforeHandler: function(link) {
            parent = link.parent(' sjs-treeview');
            loader.show('Загрузка формы', true);
            return true;
        },
        responseHandler: function() {
            loader.hide();
            return true;
        }
    });

    s(".product_control.delete").ajaxClick(function(response) {
        parent.html(response.tree);
        parent.treeview(
            true,
            function(tree) {
                AppProductInitTree(tree);
            }
        );
        loader.hide();
    }, function(link) {
        parent = link.parent(' sjs-treeview');
        if (confirm("Вы уверены, что хотите безвозвратно удалить структуру?")) {
            loader.show('Удаление структуры', true);
            return true;
        } else {
            return false;
        }
    });
}