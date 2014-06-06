<?php
namespace samson\cms\web\material;

use \samson\core\SamsonLocale;

/**
 * Form tab consisting of another tabs
 * 
 * @author Egorov Vitaly <egorov@samsonos.com>
 */
class FieldLocalizedTab extends FormTab
{
	/** Meta static variable to disable default form rendering */
	public static $AUTO_RENDER = true;
	
	/** Tab name for showing in header */
	public $name = 'Дополнительные поля';
	
	/** Tab sorting index for header sorting */
	public $index = 2;
	
	/**
	 * Constructor 
	 * @param Form $form Pointer to form
	 */
	public function __construct( Form & $form, FormTab & $parent = null, $locale = null )
	{
		// Call parent constructor
		parent::__construct( $form, $parent );	
		
		// Iterate available locales if fields exists
		if( sizeof($form->fields) && sizeof(SamsonLocale::$locales)) foreach (SamsonLocale::$locales as $locale)
		{
            // Change ru locale to empty locale
            if ($locale == \samson\core\SamsonLocale::RU) {
                $locale = '';
            }

			// Add child tab
			 $this->tabs[] = new FieldTab( $form, $this, $locale );					
		}		
	}	
}