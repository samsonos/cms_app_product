# SamsonCMS product catalog management module

[![Latest Stable Version](https://poser.pugx.org/samsonos/cms_app_product/v/stable.svg)](https://packagist.org/packages/samsonos/cms_app_product)
[![Build Status](https://scrutinizer-ci.com/g/samsonos/cms_app_product/badges/build.png?b=master)](https://scrutinizer-ci.com/g/samsonos/cms_app_product/build-status/master)
[![Code Coverage](https://scrutinizer-ci.com/g/samsonos/cms_app_product/badges/coverage.png?b=master)](https://scrutinizer-ci.com/g/samsonos/cms_app_product/?branch=master)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/samsonos/cms_app_product/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/samsonos/cms_app_product/?branch=master) 
[![Total Downloads](https://poser.pugx.org/samsonos/cms_app_product/downloads.svg)](https://packagist.org/packages/samsonos/cms_app_product)
[![Stories in Ready](https://badge.waffle.io/samsonos/cms_app_product.png?label=ready&title=Ready)](https://waffle.io/samsonos/cms_app_product)

This module is pretty and simple [SamsonCMS](https://github.com/samsoncms/cms) application for catalog management of e-commerce web-sites.

Product module accommodates two basic SamsonCMS applications - [material](https://github.com/samsoncms/material) and [structure](https://github.com/samsonos/cms_app_navigation).

Using UI-function CMS administrator can modify catalog structure, move products from one category to another, make CRUD actions for categories and sub-categories.

Feel free to extend this application for your custom applications.

##Configuration  

This is done using [SamsonPHP configuration system](https://github.com/samsonphp/config)

All available configuration fields are:
```php
class ProductConfig extends \samson\core\Config 
{
    /** @var int Identifier of catalog root structure */
    public $catalogID = __MY_CATALOG_ID;

    /** @var array Collection of system structures identifiers. This categories will be ignored in all application actions */
    public $systemStructureIDs = array(__SYSTEM_STRUCTURE_ID_1, __SYSTEM_STRUCTURE_ID_2, __SYSTEM_STRUCTURE_ID_3);

    /** @var bool Flag of application visibility. Use it as true if you extend current module by custon application */
    public $hide = false;
}
```

### Catalog structure example
Take a look on the example of [SamsonCMS](https://github.com/samsoncms/cms) e-commerce web-site structure.
* ```__CATALOG_ROOT_STRUCTURE```
    * ```__CATALOG_CATEGORY```
        * ```__CATALOG_SUB_CATEGORY```
            * ```__CATALOG_SUB_SUB_CATEGORY```
            * ```__CATALOG_SUB_SUB_CATEGORY```
        * ```__CATALOG_CATEGORY```
            * ```__CATALOG_SUB_SUB_CATEGORY```
            * ```__CATALOG_SUB_SUB_CATEGORY```
    * ```__CATALOG_CATEGORY```
        * ```__CATALOG_SUB_CATEGORY```
            * ```__CATALOG_SUB_SUB_CATEGORY```
            * ```__CATALOG_SUB_SUB_CATEGORY```
        * ```__CATALOG_SUB_CATEGORY```
            * ```__CATALOG_SUB_SUB_CATEGORY```
            * ```__CATALOG_SUB_SUB_CATEGORY```

In this example you must set ```$catalogID``` in configuration equal to ```__CATALOG_CATEGORY``` identifier.

