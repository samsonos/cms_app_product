<?php
namespace samson\cms\web\product;

use samson\activerecord\dbRelation;
use samson\activerecord\dbConditionArgument;
use samson\activerecord\dbConditionGroup;
use samson\cms\cmsmaterial;
use samson\cms\CMSNav;
use samson\activerecord\dbQuery;
use samson\pager\Pager;
use samson\cms\CMSNavMaterial;

/**
 * SamsonCMS generic material application.
 *
 * This application covers all actions that can be done
 * with materials and related entities in SamsonCMS.
 *
 * @package samson\cms\web\material
 */
class ProductApplication extends \samson\cms\App
{
	/** Application name */
	public $app_name = 'Товары';
	
	/** Identifier */
	protected $id = 'product';
	
	/** Table rows count */
	protected $table_rows = 15;
		
	/** Controllers */
	
	/** Generic controller */
	public function __handler($cmsnav = null, $company = 0, $search = 'no-search', $page = null)
	{
        $catalog = dbQuery('\samson\cms\web\navigation\CMSNav')->Url('katalog')->first();
        // Generate localized title
        $title = t($this->app_name, true);

        // Set view scope
        $this->view('index');

		// Try to find cmsnav
		if (isset($cmsnav) && dbQuery('\samson\cms\Navigation')->id($cmsnav)->first($cmsnav)) {
            // Add structure title
            $title = t($cmsnav->Name, true).' - '.$title;

            // Pass Navigation to view
            $this->cmsnav($cmsnav);
        }

        //trace($cmsnav);
		
		// Old-fashioned direct search input form POST if not passed
        $search = !isset($search) ? (isset($_POST['search']) ? $_POST['search'] : '') : $search;

        if (!isset($cmsnav)) {
            m()->all_materials(true);
        }
		// Set view data
		$this
            ->title($title)
            ->company_id(0)
            ->cmsnav_id(4)
            ->tree(\samson\cms\web\navigation\CMSNav::fullTree($catalog))
			->set($this->__async_table($cmsnav, $company, $search, $page))
		;
	}

	
	/**
	 * Render materials table and pager
	 * @param string $cmsnav 	Parent CMSNav identifier
	 * @param string $search	Keywords to filter table
	 * @param string $page		Current table page	 
	 * @return array Collection of rendered table and pager data
	 */
	function __async_table($cmsnav = null, $company = null, $search = null, $page = null)
	{
		// Try to find cmsnav
        if (isset($cmsnav) && (is_object($cmsnav) || dbQuery('\samson\cms\web\navigation\CMSNav')->id($cmsnav)->first($cmsnav))) {
            // Handle successfull found
        } else {
            $cmsnav = dbQuery('\samson\cms\web\navigation\CMSNav')->Url('katalog')->first();
        }
		
		// Generate materials table		
		$table = new Table($cmsnav, $company, $search, $page);

        // Add aditional material fields
        $ocg = new dbConditionGroup('OR');
        foreach ( cms()->material_fields as $f) {
            // Create special condition for additional fields
            $cg = new dbConditionGroup('AND');
            $cg->arguments[] = new dbConditionArgument('_mf.FieldID', $f->FieldID);

            if (isset($search) && $search != 'no-search') {
                $cg->arguments[] = new dbConditionArgument('_mf.Value', '%'.$search.'%', dbRelation::LIKE );
            }

            $ocg->arguments[] = $cg;
        }

        //m()->company_id($company);
        // Add condition group
        $table->search_fields[] = $ocg;

        $table_html = $table->render();

        $pager_html = $table->pager->toHTML();

		// Render table and pager
		return array('status' => 1, 'table_html' => $table_html, 'pager_html' => $pager_html);
	}

	/**
	 * Publish/Unpublish material
	 * @param mixed $_cmsmat Pointer to material object or material identifier 
	 * @return array Operation result data
	 */
	function __async_publish( $_cmsmat )
	{
		// Get material safely 
		if( cmsquery()->id($_cmsmat)->first( $cmsmat ) )
		{
			// Toggle material published status
			$cmsmat->Published = $cmsmat->Published ? 0 : 1;
			
			// Save changes to DB
			$cmsmat->save();
			
			// Действие не выполнено
			return array( 'status' => TRUE );
		}		
		// Return error array
		else return array( 'status' => FALSE, 'message' => 'Material "'.$_cmsmat.'" not found');		
	}
	
	/**
	 * Delete material
	 * @param mixed $_cmsmat Pointer to material object or material identifier
	 * @return array Operation result data
	 */
	function __async_remove( $_cmsmat )
	{
		// Get material safely 
		if( cmsquery()->id($_cmsmat)->first( $cmsmat ) )
		{				
			// Mark material as deleted
			$cmsmat->Active = 0;
			
			// Save changes to DB
			$cmsmat->save();	
			
			// Действие не выполнено
			return array( 'status' => TRUE );
		}		
		// Return error array
		else return array( 'status' => FALSE, 'message' => 'Material "'.$_cmsmat.'" not found');
	}

	
	/** Output for main page */
	public function main()
	{			
		// Получим все материалы
		if( dbQuery('samson\cms\cmsmaterial')->join('user')->Active(1)->Draft(0)->order_by('Created','DESC')->limit(5)->exec($db_materials) )
		{
			// Render material rows
			$rows_html = '';
			foreach ( $db_materials as $db_material ) $rows_html .= $this->view('main/row')
			->material($db_material)
			->user($db_material->onetoone['_user'])			
			->output();		

			for ($i = sizeof($db_materials); $i < 5; $i++) 
			{
				$rows_html .= $this->view('main/row')->output();	
			}
			
			// Render main template
			return $this->rows( $rows_html )->output('main/index');
		}		
	}
}