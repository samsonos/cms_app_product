<?php
/**
 * Created by PhpStorm.
 * User: onysko
 * Date: 04.06.2015
 * Time: 12:51
 */

namespace samsoncms\app\product\field;


use samsoncms\field\Generic;
use samsonframework\core\RenderInterface;
use samsonframework\orm\QueryInterface;

class CheckBox extends Generic
{
    /** @var string Path to field view file */
    protected $innerView = 'www/collection/field/checkbox';

    /**  Overload parent constructor and pass needed params there */
    public function __construct()
    {
        parent::__construct('checkbox', t('#', true), 0, '', false);
    }

    /**
     * Render collection entity field inner block
     * @param RenderInterface $renderer
     * @param QueryInterface $query
     * @param mixed $object Entity object instance
     * @return string Rendered entity field
     */
    public function render(RenderInterface $renderer, QueryInterface $query, $object)
    {
        // Render input field view
        return $renderer
            ->view($this->innerView)
            ->set($this->css, 'class')
            ->set($object->id, 'chbId')
            ->output();
    }
}