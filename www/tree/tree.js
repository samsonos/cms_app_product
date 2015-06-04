/**
 * Created by onysko on 05.11.2014.
 */

var loader = new Loader(s('#content'));

function  AppProductInit(response){
    if (response !== undefined) {
        if (response.collection_html) s('.products_table').html(response.collection_html);
        if (response.collection_pager) s('.table-pager').html(response.collection_pager);

        templateList(s('.table2'), s('.table-pager'), function() {
            SamsonCMS_Input.update(s('body'));
        });
    }
}

s('.products_tree').pageInit(function(obj) {
    AppProductInit();

    s('ul', obj).addClass('tree-root');

    AppProductInitTree(obj);
});

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
        s.trace('fdssdf');
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