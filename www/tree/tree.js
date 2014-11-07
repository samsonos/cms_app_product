/**
 * Created by onysko on 05.11.2014.
 */


s('.products_tree').pageInit(function(obj) {
    obj.treeview();
    s('.collapsable', obj).each(function(el) {
        el.addClass('collapsed');
    });
});
