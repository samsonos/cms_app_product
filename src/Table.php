<?php
namespace samson\cms\web\product;

use samson\activerecord\Argument;
use samson\activerecord\Condition;
use samson\activerecord\dbRelation;
use samson\activerecord\dbConditionGroup;
use samson\activerecord\dbConditionArgument;
use samson\cms\Navigation;
use samson\pager\pager;
use samson\activerecord\dbMySQLConnector;

/**
 * Class for dislaying and interactiong with SamsonCMS materials table
 * @author Egorov Vitaly <egorov@samsonos.com>
 */
class Table extends \samson\cms\web\material\Table
{
    /** Table rows count */
    const ROWS_COUNT = 15;

    /** Parent materials CMSNav */
    protected $nav;

    /** Current search keywords */
    protected $search;

    /** Array of drafts for current materials */
    protected $drafts = array();

    /** Array of drafts with out materials */
    protected $single_drafts = array();

    protected $companies = array();

    protected $categories = array();

    /** Search material fields */
    public $search_fields = array( 'Name', 'Url'  );

    /** Default table template file */
    public $table_tmpl = 'table/index';

    /** Default table row template */
    public $row_tmpl = 'table/row/index';

    /** Default table notfound row template */
    public $notfound_tmpl = 'table/row/notfound';

    /** Default table empty row template */
    public $empty_tmpl = 'table/row/empty';

    public $companyID = 0;

    /**
     * Constructor
     * @param Navigation $nav 		Parent CMSNav to filter materials
     * @param string $search	Keywords to search in materials
     * @param string $page		Current table page number
     */
    public function __construct( Navigation & $nav = null, $companyID = 0, $search = null, $page = null )
    {
        $this->companyID = $companyID;

        // Call parent constructor
        parent::__construct($nav, $search, $page);
    }

    public function beforeHandler() {
        parent::beforeHandler();

        $this->query->join('productcompany');
    }

    public function queryHandler()
    {
        if ($this->companyID != 0) {
            $this->query->cond('company_id', $this->companyID);
        } else {
            $this->query->cond('company_id', 0, dbRelation::NOT_EQUAL);
        }

        dbQuery('samson\cms\CMSNavMaterial')
            ->cond('StructureID', $this->nav->id)
            ->cond('Active', 1)->fields('MaterialID', $ids);

        if (sizeof($ids)) {
            $this->query->id($ids);
        } else {
            $this->query->id(0);
        }
    }

    public function setPagerPrefix()
    {
        // Generate pager url prefix
        return 'product/table/'.(isset($this->nav) ? $this->nav->id : '0').'/'.(isset($this->companyID) ? $this->companyID : '0').'/'.(isset($this->search{0}) ? $this->search : 'no-search').'/';
    }

    /** @see \samson\cms\table\Table::row() */
    public function row( & $db_material, Pager & $pager = null)
    {
        // Set table row view context
        m()->view($this->row_tmpl);

        // If there is cmsnav for material pass them
        if( isset( $db_material->onetomany['_structure'] )) {
            foreach ($db_material->onetomany['_structure'] as $nav) {
                if ($nav->Url == $db_material->category) {
                    m()->cmsnav($nav);
                    break;
                }
            }
        }

        // If there is a draft for this material, pass draft to view
        if( isset( $drafts[ $db_material->id ] )) m()->draft( $this->drafts[ $db_material->id ] );

        // Render row template
        return m()
            ->cmsmaterial( $db_material )
            ->company(isset($db_material->onetoone['_productcompany']) ? $db_material->onetoone['_productcompany'] : '')
            ->user( isset($db_material->onetoone['_user']) ? $db_material->onetoone['_user'] : '' )
            ->pager( $this->pager )
            ->nav_id( isset($this->nav) ? $this->nav->id : '0' )
            ->search(urlencode($this->search))
            ->output();
    }
}