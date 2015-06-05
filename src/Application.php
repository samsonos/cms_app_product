<?php
namespace samsoncms\app\product;

use samson\activerecord\dbRelation;
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
class Application extends \samsoncms\app\material\Application
{
    /** @inheritdoc */
    public $name = 'Товары';

    /** @inheritdoc */
    public $description = 'Товары';

    /** @inheritdoc */
    protected $id = 'product';

    /** @inheritdoc */
    public $icon = 'th-list';

    /** @inheritdoc */
    public $collectionClass = '\samsoncms\app\product\Collection';

    /** @var bool Hide app from sidebar menu */
    public $hide = true;

    /** @var int Catalog root structure identifier */
    protected $catalogID = 4;

    /** @var array System structures array */
    protected $systemStructureIDs = array(0);

    /** @inheritdoc */
    public function __handler($navigationId = '0', $search = '', $page = 1)
    {
        $navigationId = $navigationId == '0' ? $this->catalogID : $navigationId;
        // Pass all parameters to parent handler with default values
        parent::__handler($navigationId, $search, $page);
    }

    /** @inheritdoc */
    public function __async_collection($navigationId = '0', $search = '', $page = 1)
    {
        // Save pager size in session
        if (isset($_GET['pagerSize'])) {
            $_SESSION['pagerSize'] = $_GET['pagerSize'];
            // delete get parameter from pager links
            unset($_GET['pagerSize']);
        }
        // Set filtration info
        $navigationId = $navigationId == '0' ? $this->catalogID : $navigationId;
        $search = !empty($search) ? $search : 0;
        $page = isset($page) ? $page : 1;

        // Create pager for material collection
        $pager = new Pager(
            $page,
            isset($_SESSION['pagerSize']) ? $_SESSION['pagerSize'] : $this->pageSize,
            $this->id . '/' . self::VIEW_TABLE_NAME . '/' . $navigationId . '/' . $search
        );

        // Create material collection
        $collection = new $this->collectionClass($this, new dbQuery(), $pager);

        // Add navigation filter
        if (isset($navigationId) && !empty($navigationId)) {
            $collection = $collection->navigation(array($navigationId));
        }

        // Try to find cmsnav
        if (isset($cmsnav) && (is_object($cmsnav) || dbQuery('\samson\cms\Navigation')->id($cmsnav)->first($cmsnav))) {
            if ($cmsnav->id != $this->catalogID) {
                $parent = $cmsnav->parent();
            }
            // Handle successfull found
        } else {
            $cmsnav = dbQuery('\samson\cms\Navigation')->id($this->catalogID)->first();
            $parent = $cmsnav;
        }

        $tree = new \samson\treeview\SamsonTree('tree/tree-template', 0, 'product/addchildren');

        return array_merge(
            array('status' => 1, 'tree' => $tree->htmlTree($parent)),
            $collection
                ->search($search)
                ->fill()
                ->toView(self::VIEW_TABLE_NAME . '_')
        );
    }

    public function __async_move($structureID)
    {
        /** @var \samson\cms\web\navigation\CMSNav $cmsnav */
        $cmsnav = null;

        if (isset($_POST['materialIds']) && !empty($_POST['materialIds']) && dbQuery('\samson\cms\Navigation')->id($structureID)->first($cmsnav)) {
            if (dbQuery('samson\cms\CMSNavMaterial')->cond('MaterialID', $_POST['materialIds'])->cond('StructureID', $this->systemStructureIDs, dbRelation::NOT_EQUAL)->exec($data)) {
                $currentNav = $cmsnav;
                foreach ($data as $strmat) {
                    $strmat->delete();
                }

                foreach ($_POST['materialIds'] as $matID) {
                    $cmsnav = $currentNav;
                    $material = dbQuery('material')->id($matID)->first();
                    $material->category = $cmsnav->Url;
                    $material->save();
                    while (isset($cmsnav)) {
                        $strmat = new \samson\activerecord\structurematerial(false);
                        $strmat->MaterialID = $matID;
                        $strmat->StructureID = $cmsnav->id;
                        $strmat->Active = 1;
                        $strmat->save();
                        if ($cmsnav->id == $this->catalogID) {
                            break;
                        } else {
                            $cmsnav = $cmsnav->parent();
                        }
                    }
                }
            }
        }

        return $this->__async_collection($structureID);
    }

    public function __async_structuredelete($structureID)
    {
        /** @var \samson\cms\Navigation $cmsnav */
        $cmsnav = null;
        if (dbQuery('\samson\cms\Navigation')->id($structureID)->first($cmsnav)) {
            foreach ($cmsnav->materials() as $material) {
                $material->Active = 0;
                $material->save();
            }

            $parent = $cmsnav->parent();

            $cmsnav->Active = 0;
            $cmsnav->save();
        }

        $tree = new \samson\treeview\SamsonTree('tree/tree-template', 0, 'product/addchildren');


        return array('status' => 1, 'tree' => $tree->htmlTree($parent));
    }

    public function __async_structureupdate($structureID = null)
    {
        /** @var \samson\cms\web\navigation\CMSNav $data */
        $data = null;

        $strIds = dbQuery('structure_relation')->cond('child_id', $structureID)->fields('parent_id');
        if (dbQuery('\samson\cms\web\navigation\CMSNav')->StructureID($structureID)->first($data)) {
            // Update structure data
            $data->update();

            $cmsnav = $data;

            foreach ($data->materials() as $material) {
                $data = $cmsnav;
                foreach (dbQuery('structurematerial')->cond('MaterialID', $material->id)->cond('StructureID', $strIds)->exec() as $relation) {
                    $relation->delete();
                }
                while ($data) {
                    $strMat = new \samson\activerecord\structurematerial(false);
                    $strMat->Active = 1;
                    $strMat->StructureID = $data->id;
                    $strMat->MaterialID = $material->id;
                    $strMat->save();

                    if ($data->id == $this->catalogID) {
                        break;
                    } else {
                        $data = $data->parent();
                    }
                }
            }
        } else {
            // Create new structure
            $nav = new \samson\cms\web\navigation\CMSNav(false);
            $nav->fillFields();
        }

        if (isset($structureID)) {
            $parent_id = $structureID;
        } else {
            $parent_id = $_POST['ParentID'];
        }

        return $this->__async_collection($parent_id);
    }

    public function __async_movestructure($childID, $parentID)
    {
        $child = dbQuery('\samson\cms\Navigation')->id($childID)->first();
        $child->ParentID = $parentID;
        $child->save();
        $strIds = array();
        $cmsnav = $child->parent();
        while ($cmsnav) {
            $strIds[] = $cmsnav->id;
            if ($cmsnav->id == $this->catalogID) {
                break;
            }
            $cmsnav = $cmsnav->parent();
        }

        if (dbQuery('structure_relation')->cond('child_id', $childID)->exec($strRelations)) {
            foreach ($strRelations as $strRelation) {
                $strRelation->delete();
            }
        }

        // Create new relation with new parent
        $strRelation = new \samson\activerecord\structure_relation(false);
        $strRelation->child_id = $childID;
        $strRelation->parent_id = $parentID;
        $strRelation->save();


        // Create array of structure ids which we need to use to create structurematerial relations
        $relIds = array($parentID);
        // Get relations of new parent
        $stRel = dbQuery('structure_relation')->child_id($parentID)->exec();
        while ($stRel) {
            // Save ids for loop query
            $ids = array();
            // Break flag
            $break = false;
            foreach ($stRel as $strR) {
                // Save current relation id
                $ids[] = $strR->id;

                // Save parent
                $relIds[] = $strR->parent_id;
                if ($strR->parent_id == $this->catalogID) {
                    $break = true;
                    break;
                }
            }
            if ($break) {
                break;
            } else {
                // Get next relations
                $stRel = dbQuery('structure_relation')->child_id($relIds)->exec();
            }
        }

        // Get materials of current category
        if (\samson\cms\CMS::getMaterialsByStructures($childID, $materials)) {
            // Create new structurematerial relations
            foreach ($materials as $material) {
                // Delete old structurematerial relations
                foreach (dbQuery('structurematerial')->cond('MaterialID', $material->id)->cond('StructureID', $strIds)->exec() as $relation) {
                    $relation->delete();
                }

                // Create new relations
                foreach ($relIds as $relId) {
                    $strMat = new \samson\activerecord\structurematerial(false);
                    $strMat->Active = 1;
                    $strMat->StructureID = $relId;
                    $strMat->MaterialID = $material->id;
                    $strMat->save();
                }
            }
        }

        return array('status' => 1);
    }

    public function __async_addchildren($structure_id)
    {
        if (dbQuery('\samson\cms\Navigation')->StructureID($structure_id)->first($db_structure)) {
            $tree = new \samson\treeview\SamsonTree('tree/tree-template', 0, 'product/addchildren');
            return array('status' => 1, 'tree' => $tree->htmlTree($db_structure));
        }

        return array('status' => 0);
    }

    public function main()
    {

    }
}