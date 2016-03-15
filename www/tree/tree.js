/**
 * Created by onysko on 05.11.2014.
 */

var loader = new Loader(s('#content'));

function  AppProductInit(response){
    if (response !== undefined) {
        if (response.collection_html) s('.table_form').html(response.collection_html);
        if (response.collection_pager) s('.table-pager').html(response.collection_pager);
        SamsonCMS_Input.update(s('body'));
        templateList(s('.table2'), s('.table-pager'), s('.sizeSelect'), function() {

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

    var parent;
    /**
     * обработчик добавления новой записи
     */
    s(".control.add", tree).tinyboxAjax({
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
                    var selectAction = 'cms/product/structureupdate/';
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
            //CMSNavigationFormInit();
        },
        beforeHandler: function(link) {
            parent = link.parent(' sjs-treeview');
            loader.show(s('#loader-text').html(), true);
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
    s(".control.editstr", tree).tinyboxAjax({
        html:'html',
        renderedHandler: function(response, tb) {

            var generateApplicationElement = s("#generate-application"),
                iconPreviewApplicationElement = s(".preview-icon-application"),
                typeStructureElement = s(".type-of-structure"),
                iconApplicationElement = s("#icon-application"),
                allowTypeValues = [0], // That is all allowed values of select structure which can open applicaiton setting
                applicationBlock = s('.application-setting'),
                faClasses = 'icon icon2 fa-2x icon2-';

            // Handle generate application checkbox
            generateApplicationElement.click(function(e) {
                var value = e.DOMElement.checked,
                    blockOutput = s('.block-show-output-application');

                // If true show output block or hide it
                if (value) {
                    blockOutput.css('display', 'block');
                } else {
                    blockOutput.css('display', 'none');
                }
            });

            // Change icon of preview block
            iconApplicationElement.change(function(e) {
                s('span', iconPreviewApplicationElement).a('class', faClasses + e.val());
            });

            // Set event on change type of structure
            typeStructureElement.change(changeFormApplicationByTypeStructure);

            // Exec manually when the first loaded
            changeFormApplicationByTypeStructure();

            /**
             * Show or hide application setting by structure type
             */
            function changeFormApplicationByTypeStructure() {
                var value = typeStructureElement.val();

                // If there is right value than open application setting
                if (allowTypeValues.indexOf(parseInt(value)) !== -1) {
                    applicationBlock.css('display', 'block');
                } else {
                    // Set manually false value of checkboxes
                    generateApplicationElement.DOMElement.checked = false;
                    applicationBlock.css('display', 'none');
                }
            }

            s("#generateUrl").click(function(obj) {
                if (confirm("Вы точно хотите сгенерировать адрес?")) {
                    s("#Url").val(s("#Name").translit());
                }
            });
            s('.structure_submit_button').click(function(link) {
                var selectForm = s(".form2");
                var selectAction = 'cms/product/structureupdate/' + link.a('structure') + '/';
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
        beforeHandler: function(link) {
            parent = link.parent(' sjs-treeview');
            loader.show(s('#loader-text').html(), true);
            return true;
        },
        responseHandler: function() {
            loader.hide();
            return true;
        }
    });

    /**
     * обработка удаления
     */
    s(".control.delete", tree).ajaxClick(function(response) {
        parent.html(response.tree);
        parent.treeview(
            true,
            function(tree) {
                AppProductInitTree(tree);
            }
        );
        loader.hide();
    }, function(link) {
        parent = link.parent('sjs-treeview');
        if (confirm("Are you sure that you want to delete current SSE?")) {
            loader.show('Deleting', true);
            return true;
        } else {
            return false;
        }
    });

    var parentID;
    var childID;
    var parentName;
    var moveFlag = false;

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
                            if (confirm('Are you sure that you want to put selected category in ' + parentName.trim() + '?')) {
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
                    loader.show('Waiting', true);
                    childID = $(this).find('.structure_id').first().text();

                    s.ajax('cms/product/movestructure/' + childID + '/' + parentID + '/', function(response) {
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
            loader.show('Waiting', true);
            return true;
        });
    });

    s('.product_control.material_move', tree).click(function(link) {
        var selectForm = s(".table_form");
        var selectAction = 'cms/product/move/' + link.a('structure') + '/';

        selectForm.ajaxForm({
            'url': selectAction,
            'handler': function(respTxt){
                respTxt = JSON.parse(respTxt);
                AppProductInit(respTxt);
            }
        });

        return false;
    });
}