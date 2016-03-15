<?php
/**
 * Created by PhpStorm.
 * User: onysko
 * Date: 04.06.2015
 * Time: 10:42
 */

namespace samsoncms\app\product;


use samsoncms\app\material\field\Navigation;
use samsoncms\app\product\field\CheckBox;
use samsoncms\field\Generic;
use samsoncms\field\Control;

class Collection extends \samsoncms\app\material\Collection
{
    /** {@inheritdoc} */
    public function __construct($renderer, $query = null, $pager = null)
    {
        // Call parents
        parent::__construct($renderer, $query, $pager);

        // Fill default column fields for collection
        $this->fields = array(
            new CheckBox('MaterialID', '#', 0, 'id', false),
            new Generic('Name', t('Наименование', true), 0),
            new Generic('Url', t('Идентификатор', true), 0),
            new Generic('Published', t('Показывать', true), 11, 'publish'),
            new Control(),
        );
    }
}
